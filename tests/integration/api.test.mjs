/**
 * 集成测试：真实启动 Next 服务，对 API 路由做真实 HTTP 断言
 * @file tests/integration/api.test.mjs
 * @description 覆盖「所有功能模块正常运行」中的后端集成层：
 *   - 启动 `next start`（需先 `next build`）暴露真实 /api/* 路由；
 *   - 对 /api/dictionary/suggest、/api/collect、/api/batch-collect 做真实请求断言。
 *   鉴权为默认开放模式（未配置 COLLECT_API_TOKEN），无需密钥即可运行。
 *   运行：npm run test:integration（CI 在 integration 作业中执行）。
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = process.env.PORT || '3123';
const BASE = `http://127.0.0.1:${PORT}`;

let server;

async function waitForServer(url, timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(url);
      if (r.status < 500) return; // 服务已就绪（2xx/4xx 均可，说明路由已挂载）
    } catch {
      // 连接被拒，继续等待
    }
    await sleep(500);
  }
  throw new Error('Next 服务在限定时间内未就绪');
}

before(async () => {
  server = spawn('npx', ['next', 'start', '-p', PORT], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: { ...process.env, PORT },
  });
  await waitForServer(`${BASE}/api/dictionary/suggest?term=test`);
});

after(() => {
  if (server) {
    server.kill('SIGTERM');
    server = null;
  }
});

test('GET /api/dictionary/suggest 返回合法 JSON', async () => {
  const r = await fetch(`${BASE}/api/dictionary/suggest?term=Pull%20requests`);
  assert.equal(r.status, 200);
  const ct = r.headers.get('content-type') || '';
  assert.ok(ct.includes('application/json'), `期望 JSON，实际 ${ct}`);
  const body = await r.json();
  assert.equal(body.term, 'Pull requests');
  assert.equal(typeof body.llmEnabled, 'boolean');
});

test('POST /api/collect 拒绝空数据（400）', async () => {
  const r = await fetch(`${BASE}/api/collect`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ data: '' }),
  });
  assert.equal(r.status, 400);
});

test('POST /api/collect 对合法文本返回 SSE 流', async () => {
  const r = await fetch(`${BASE}/api/collect`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ data: 'Sign in' }),
  });
  assert.equal(r.status, 200);
  const ct = r.headers.get('content-type') || '';
  assert.ok(ct.includes('text/event-stream'), `期望 SSE，实际 ${ct}`);
  const reader = r.body.getReader();
  const { value } = await reader.read();
  assert.ok(value && value.length > 0, 'SSE 首帧不应为空');
  await reader.cancel();
});

test('POST /api/batch-collect 拒绝非法请求体（400）', async () => {
  const r = await fetch(`${BASE}/api/batch-collect`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(r.status, 400);
});

test('POST /api/batch-collect 对合法 URL 返回 SSE 流（无浏览器则报错事件，但仍 200）', async () => {
  const r = await fetch(`${BASE}/api/batch-collect`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ urls: ['https://github.com/Tanox/GitHub_i18n'] }),
  });
  assert.equal(r.status, 200);
  const ct = r.headers.get('content-type') || '';
  assert.ok(ct.includes('text/event-stream'), `期望 SSE，实际 ${ct}`);
  const reader = r.body.getReader();
  const { value } = await reader.read();
  assert.ok(value && value.length > 0, 'SSE 首帧不应为空');
  await reader.cancel();
});
