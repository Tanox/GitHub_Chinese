/**
 * API 门禁单测（可选 Bearer 令牌 + 每 IP 限流）
 * @file tests/api-guard.test.mjs
 * @version 1.13.3
 * @date 2026-09-30
 * @description 覆盖 checkApiAccess：默认开放、令牌 401/通过、同 IP 429、跨 IP 桶隔离；
 *   以及限流 IP 头伪造防护——未显式配置 COLLECT_TRUSTED_IP_HEADER 时，
 *   轮换 cf-connecting-ip/x-real-ip/x-forwarded-for 不得获得新限流桶。
 *   门禁在模块加载期读取环境变量，故每个场景用查询串缓存失效加载独立实例。
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const GUARD_URL = new URL('../src/lib/api-guard.ts', import.meta.url).href;
const GUARD_KEYS = [
  'COLLECT_API_TOKEN',
  'COLLECT_RATE_LIMIT',
  'COLLECT_RATE_WINDOW_MS',
  'COLLECT_TRUSTED_IP_HEADER',
];

/** 按指定环境变量加载一份全新的 api-guard 模块实例，测完还原环境变量 */
async function loadGuard(env = {}) {
  const saved = {};
  for (const key of GUARD_KEYS) {
    saved[key] = process.env[key];
    if (env[key] === undefined) delete process.env[key];
    else process.env[key] = String(env[key]);
  }
  try {
    return await import(`${GUARD_URL}?t=${Date.now()}-${Math.random()}`);
  } finally {
    for (const key of GUARD_KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  }
}

/** 构造最小请求（门禁仅读 headers）；ip 写入 x-forwarded-for，extraHeaders 模拟伪造头 */
function makeReq({ token, ip, extraHeaders } = {}) {
  const headers = { ...extraHeaders };
  if (token) headers.authorization = `Bearer ${token}`;
  if (ip) headers['x-forwarded-for'] = ip;
  return new Request('http://localhost/api/dictionary/suggest?term=Settings', { headers });
}

test('未配置令牌时默认放行（向后兼容）', async () => {
  const { checkApiAccess } = await loadGuard();
  assert.equal(checkApiAccess(makeReq({ ip: '10.0.0.1' })), null);
});

test('配置令牌后缺少 Authorization 返回 401', async () => {
  const { checkApiAccess } = await loadGuard({ COLLECT_API_TOKEN: 'secret' });
  const res = checkApiAccess(makeReq({ ip: '10.0.0.1' }));
  assert.ok(res, '应返回拒绝响应');
  assert.equal(res.status, 401);
  const body = await res.json();
  assert.match(body.error, /未授权/);
});

test('错误令牌 401，正确令牌放行', async () => {
  const { checkApiAccess } = await loadGuard({ COLLECT_API_TOKEN: 'secret' });
  assert.equal(checkApiAccess(makeReq({ token: 'wrong', ip: '10.0.0.2' })).status, 401);
  assert.equal(checkApiAccess(makeReq({ token: 'secret', ip: '10.0.0.2' })), null);
});

test('同 IP 超出限流窗口返回 429 且带 Retry-After', async () => {
  // 显式信任 XFF 后，测试中的 IP 才参与分桶
  const { checkApiAccess } = await loadGuard({
    COLLECT_RATE_LIMIT: 2,
    COLLECT_TRUSTED_IP_HEADER: 'x-forwarded-for',
  });
  const req = () => makeReq({ ip: '10.0.0.3' });
  assert.equal(checkApiAccess(req()), null);
  assert.equal(checkApiAccess(req()), null);
  const blocked = checkApiAccess(req());
  assert.ok(blocked, '第 3 次应被限流');
  assert.equal(blocked.status, 429);
  assert.ok(Number(blocked.headers.get('Retry-After')) > 0, '应带正整数 Retry-After');
});

test('限流桶按 IP 隔离：A 被限流不影响 B', async () => {
  const { checkApiAccess } = await loadGuard({
    COLLECT_RATE_LIMIT: 1,
    COLLECT_TRUSTED_IP_HEADER: 'x-forwarded-for',
  });
  assert.equal(checkApiAccess(makeReq({ ip: '10.0.0.4' })), null);
  assert.equal(checkApiAccess(makeReq({ ip: '10.0.0.4' })).status, 429);
  assert.equal(checkApiAccess(makeReq({ ip: '10.0.0.5' })), null);
});

test('默认不信任任何 IP 头：轮换伪造头无法获得新限流桶（核心回归）', async () => {
  // 修复前 clientIp 无条件读取三类头，攻击者每次换值即绕过限流
  const { checkApiAccess } = await loadGuard({ COLLECT_RATE_LIMIT: 2 });
  const forged = [
    { 'cf-connecting-ip': '203.0.113.1' },
    { 'cf-connecting-ip': '203.0.113.2' },
    { 'x-real-ip': '198.51.100.7' },
    { 'x-forwarded-for': '192.0.2.99, 10.0.0.1' },
    { 'x-forwarded-for': '192.0.2.100, 10.0.0.1' },
  ];
  // 前两次无论带什么头都消耗同一个 unknown 桶
  assert.equal(checkApiAccess(makeReq({ extraHeaders: forged[0] })), null);
  assert.equal(checkApiAccess(makeReq({ extraHeaders: forged[1] })), null);
  for (let i = 2; i < forged.length; i++) {
    const blocked = checkApiAccess(makeReq({ extraHeaders: forged[i] }));
    assert.equal(blocked?.status, 429, `第 ${i + 1} 个伪造头仍应命中共享桶被限流`);
  }
});

test('信任 cf-connecting-ip 时按其分桶且忽略 XFF', async () => {
  const { checkApiAccess } = await loadGuard({
    COLLECT_RATE_LIMIT: 1,
    COLLECT_TRUSTED_IP_HEADER: 'cf-connecting-ip',
  });
  const cf = (v) => makeReq({ ip: '10.0.0.9', extraHeaders: { 'cf-connecting-ip': v } });
  assert.equal(checkApiAccess(cf('203.0.113.1')), null);
  assert.equal(checkApiAccess(cf('203.0.113.1')).status, 429);
  // 换 cf 值得到新桶；XFF 不参与
  assert.equal(checkApiAccess(cf('203.0.113.2')), null);
});

test('信任 x-real-ip 时按其分桶', async () => {
  const { checkApiAccess } = await loadGuard({
    COLLECT_RATE_LIMIT: 1,
    COLLECT_TRUSTED_IP_HEADER: 'x-real-ip',
  });
  const real = (v) => makeReq({ extraHeaders: { 'x-real-ip': v } });
  assert.equal(checkApiAccess(real('198.51.100.1')), null);
  assert.equal(checkApiAccess(real('198.51.100.1')).status, 429);
  assert.equal(checkApiAccess(real('198.51.100.2')), null);
});

test('受信头缺失时归入 unknown 共享桶', async () => {
  const { checkApiAccess } = await loadGuard({
    COLLECT_RATE_LIMIT: 1,
    COLLECT_TRUSTED_IP_HEADER: 'cf-connecting-ip',
  });
  // 两个不带任何 IP 头的请求共享 unknown 桶，第二次被限流
  assert.equal(checkApiAccess(makeReq()), null);
  assert.equal(checkApiAccess(makeReq()).status, 429);
});

test('受信头配置大小写不敏感（运维可能写成 CF-Connecting-IP）', async () => {
  const { checkApiAccess } = await loadGuard({
    COLLECT_RATE_LIMIT: 1,
    COLLECT_TRUSTED_IP_HEADER: 'CF-Connecting-IP',
  });
  const req = makeReq({ extraHeaders: { 'cf-connecting-ip': '203.0.113.5' } });
  assert.equal(checkApiAccess(req), null);
  assert.equal(
    checkApiAccess(makeReq({ extraHeaders: { 'cf-connecting-ip': '203.0.113.5' } })).status,
    429,
  );
});
