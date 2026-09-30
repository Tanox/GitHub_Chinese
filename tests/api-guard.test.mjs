/**
 * API 门禁单测（可选 Bearer 令牌 + 每 IP 限流）
 * @file tests/api-guard.test.mjs
 * @version 1.12.10
 * @description 覆盖 checkApiAccess：默认开放、令牌 401/通过、同 IP 429、跨 IP 桶隔离。
 *   门禁在模块加载期读取环境变量，故每个场景用查询串缓存失效加载独立实例。
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const GUARD_URL = new URL('../src/lib/api-guard.ts', import.meta.url).href;
const GUARD_KEYS = ['COLLECT_API_TOKEN', 'COLLECT_RATE_LIMIT', 'COLLECT_RATE_WINDOW_MS'];

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

/** 构造最小请求（门禁仅读 headers） */
function makeReq({ token, ip } = {}) {
  const headers = {};
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
  const { checkApiAccess } = await loadGuard({ COLLECT_RATE_LIMIT: 2 });
  const req = () => makeReq({ ip: '10.0.0.3' });
  assert.equal(checkApiAccess(req()), null);
  assert.equal(checkApiAccess(req()), null);
  const blocked = checkApiAccess(req());
  assert.ok(blocked, '第 3 次应被限流');
  assert.equal(blocked.status, 429);
  assert.ok(Number(blocked.headers.get('Retry-After')) > 0, '应带正整数 Retry-After');
});

test('限流桶按 IP 隔离：A 被限流不影响 B', async () => {
  const { checkApiAccess } = await loadGuard({ COLLECT_RATE_LIMIT: 1 });
  assert.equal(checkApiAccess(makeReq({ ip: '10.0.0.4' })), null);
  assert.equal(checkApiAccess(makeReq({ ip: '10.0.0.4' })).status, 429);
  assert.equal(checkApiAccess(makeReq({ ip: '10.0.0.5' })), null);
});
