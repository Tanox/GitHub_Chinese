/**
 * URL 安全校验（SSRF 防护）
 * @file src/lib/url-guard.js
 * @version 1.9.35
 * @description 纯函数：校验批量采集的目标 URL——仅允许 http(s) 协议，拒绝本机 / 内网 / 链路本地 /
 *   云元数据地址，避免服务端出网抓取被用于内网探测。不含任何 Node 运行时依赖，客户端亦可安全导入。
 *
 *   已知限制：不做 DNS 解析，因此无法防御「域名解析到内网 IP」的 DNS rebinding，
 *   也不归一化十六进制 / 十进制等非常规 IP 字面量（如需可在网关层补充）。
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
  if (isPrivateHost(hostname)) {
    return { ok: false, reason: '禁止访问本机 / 内网 / 保留地址' };
  }

  return { ok: true, url: parsed.toString() };
}
