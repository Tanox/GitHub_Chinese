/**
 * URL 安全校验（SSRF 防护）
 * @file src/lib/url-guard.js
 * @version 1.13.1
 * @description 纯函数：校验批量采集的目标 URL——仅允许 http(s) 协议，拒绝本机 / 内网 / 链路本地 /
 *   云元数据地址，避免服务端出网抓取被用于内网探测。不含任何 Node 运行时依赖，客户端亦可安全导入。
 *
 *   已支持十进制 / 十六进制 / 八进制及省略写法（如 2852039166、0xA9FEA9FE、017700000001、127.1）
 *   的 IPv4 字面量归一化，防止非常规形式绕过私网正则实施 SSRF；IPv6 仍由既有正则覆盖。
 *   已知限制：不做 DNS 解析，无法防御「域名解析到内网 IP」的 DNS rebinding（需在网关或隔离网络层加固）。
 */

/** 允许的协议白名单 */
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/** 明确禁止的主机名（均为小写） */
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  'metadata',
  'metadata.google.internal',
]);

/**
 * 私网 / 保留 IPv4 网段：
 * 10/8、127/8、0/8、169.254/16（链路本地 / 云元数据）、172.16/12、192.168/16、100.64/10
 */
const PRIVATE_IPV4_PATTERN =
  /^(?:10\.|127\.|0\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.|100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.)/;

/** 私网 / 回环 IPv6：::1、fc00::/7（ULA）、fe80::/10（链路本地） */
const PRIVATE_IPV6_PATTERN = /^(?:::1$|f[cd]|fe[89ab])/;

/** IPv4 inet_aton 合成/拆包的位宽与掩码（normalizeIpLiteral 专用） */
const OCTET_SHIFT = 8; // 一个八位组的位宽
const SHIFT_2_OCTETS = 16; // 两个八位组的位宽
const SHIFT_3_OCTETS = 24; // 三个八位组的位宽
const OCTET_MASK = 0xff; // 单八位组掩码（十进制 255）
const TWO_OCTET_MASK = 0xffff; // 低 16 位掩码
const THREE_OCTET_MASK = 0xffffff; // 低 24 位掩码
const IPV4_MAX = 0xffffffff; // 32 位无符号整数上限

/**
 * 将非常规 IPv4 字面量归一化为标准点分十进制；非 IP 字面量（域名为 null）
 * 解决 SSRF 绕过：`http://2852039166/`（169.254.169.254）、`http://0xA9FEA9FE/`、
 * `http://017700000001/`（127.0.0.1）、`http://127.1/` 等非常规形式此前不被私网正则匹配而放行。
 * 仅处理 IPv4 字面量；域名与 IPv6 返回 null（IPv6 交由既有正则）。
 * @param {string} hostname - 已小写化、可能带方括号的主机名
 * @returns {string|null} 归一化后的点分十进制，或 null（非 IP 字面量）
 */
function normalizeIpLiteral(hostname) {
  const host = hostname.replace(/^\[|\]$/g, '');
  if (host === '' || host.includes(':')) return null; // IPv6 或空，交还原流程

  // 逐段解析：支持 0x 十六进制、0 前缀八进制、纯十进制；含字母或符号则视为域名
  const segs = host.split('.');
  const parsed = [];
  for (const seg of segs) {
    if (seg === '') return null;
    let num;
    if (/^0x[0-9a-f]+$/i.test(seg)) num = parseInt(seg, 16);
    else if (/^0[0-7]+$/.test(seg)) num = parseInt(seg, 8);
    else if (/^\d+$/.test(seg)) num = parseInt(seg, 10);
    else return null;
    if (Number.isNaN(num)) return null;
    parsed.push(num);
  }

  // 1–4 段按 inet_aton 语义合成 32 位地址；段数过多或数值溢出则非合法 IP 字面量
  const n = parsed.length;
  if (n > 4) return null;
  let value = 0;
  /* eslint-disable no-bitwise -- IPv4 地址按 inet_aton 语义打包/拆包必须用位运算，非布尔逻辑误用 */
  if (n === 1) {
    value = parsed[0];
  } else if (n === 2) {
    value = (parsed[0] << SHIFT_3_OCTETS) | (parsed[1] & THREE_OCTET_MASK);
  } else if (n === 3) {
    value =
      (parsed[0] << SHIFT_3_OCTETS) |
      ((parsed[1] & OCTET_MASK) << SHIFT_2_OCTETS) |
      (parsed[2] & TWO_OCTET_MASK);
  } else {
    value =
      (parsed[0] << SHIFT_3_OCTETS) |
      ((parsed[1] & OCTET_MASK) << SHIFT_2_OCTETS) |
      ((parsed[2] & OCTET_MASK) << OCTET_SHIFT) |
      (parsed[3] & OCTET_MASK);
  }
  if (!Number.isFinite(value) || value < 0 || value > IPV4_MAX) return null;

  // >>> 0 先把可能为负的 int32 归一为无符号 32 位整数，再按八位组拆回点分十进制
  const u = value >>> 0;
  const normalized = [
    (u >>> SHIFT_3_OCTETS) & OCTET_MASK,
    (u >>> SHIFT_2_OCTETS) & OCTET_MASK,
    (u >>> OCTET_SHIFT) & OCTET_MASK,
    u & OCTET_MASK,
  ].join('.');
  /* eslint-enable no-bitwise */
  return normalized;
}

/**
 * 判断主机名是否指向本机 / 内网 / 保留地址
 * @param {string} hostname - 已小写化的主机名（IPv6 可能带方括号）
 * @returns {boolean} 命中返回 true
 */
function isPrivateHost(hostname) {
  const host = hostname.replace(/^\[|\]$/g, '');
  if (BLOCKED_HOSTNAMES.has(host) || host.endsWith('.localhost')) {
    return true;
  }
  return PRIVATE_IPV4_PATTERN.test(host) || PRIVATE_IPV6_PATTERN.test(host);
}

/**
 * 校验单个 URL 是否可安全抓取
 * @param {unknown} input - 待校验的 URL
 * @returns {{ok: true, url: string} | {ok: false, reason: string}} 校验结果
 */
export function guardUrl(input) {
  if (typeof input !== 'string' || input.trim() === '') {
    return { ok: false, reason: 'URL 必须是非空字符串' };
  }

  let parsed;
  try {
    parsed = new URL(input.trim());
  } catch {
    return { ok: false, reason: 'URL 格式非法' };
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return { ok: false, reason: `不允许的协议 ${parsed.protocol}` };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname === '') {
    return { ok: false, reason: 'URL 缺少主机名' };
  }
  // H1 修复：先把十进制 / 十六进制 / 八进制 / 省略写法的 IP 字面量归一化为标准点分十进制，
  // 再做私网判定，防止非常规形式绕过私网正则实施 SSRF
  const hostToCheck = normalizeIpLiteral(hostname) ?? hostname;
  if (isPrivateHost(hostToCheck)) {
    return { ok: false, reason: '禁止访问本机 / 内网 / 保留地址' };
  }

  return { ok: true, url: parsed.toString() };
}
