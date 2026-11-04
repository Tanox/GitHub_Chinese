/**
 * 集成测试：真实启动 Next 服务，对 API 路由与页面做真实 HTTP 断言
 * @file tests/integration/api.integration.mjs
 * @version 1.13.21
 * @description 覆盖后端集成层与页面可访问性：
 *   - 启动 `next start`（需先 `next build`）暴露真实 /api/* 路由；
 *   - 对 /api/dictionary/suggest、/api/collect、/api/batch-collect 做真实请求断言；
 *   - 对全部 5 个真实路由的 HTML 运行 axe，避免动态页 a11y 检查被跳过。
 *   鉴权为默认开放模式（未配置 COLLECT_API_TOKEN），无需密钥即可运行。
 *   运行：npm run test:integration（CI 在 integration 作业中执行）。
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { collectBlockingViolations } from '../helpers/axe-html.mjs';

const PORT = process.env.INTEGRATION_PORT || '3123';
const BASE = `http://127.0.0.1:${PORT}`;
const ROOT = path.join(import.meta.dirname, '..', '..');
const NEXT_BIN = path.join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next');
/** 采集历史重定向到被 .gitignore 忽略的临时文件，避免测试污染仓库 */
const HISTORY_FILE = path.join(ROOT, '.tmp-integration-history.json');

/** 与 src/app/sitemap.ts 保持一致的真实路由 */
const PAGES = ['/', '/overview', '/coverage', '/dictionary', '/dictionary/manage'];

let server;
let serverFailure = '';

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (serverFailure) throw new Error(`Next 服务启动失败：${serverFailure}`);
    try {
      const r = await fetch(url);
      if (r.status < 500) return; // 服务已就绪（2xx/4xx 均可，说明路由已挂载）
    } catch {
      // 连接被拒，继续等待
    }
    await sleep(300);
  }
  throw new Error(`Next 服务在 ${timeoutMs}ms 内未就绪：${serverFailure || '端口无响应'}`);
}

before(async () => {
  if (!fs.existsSync(NEXT_BIN)) {
    throw new Error(`未找到 Next CLI：${NEXT_BIN}，请先执行 npm install`);
  }
  // 直接以 Node 执行本地 next bin，避免 Windows 下 spawn('npx') 的 ENOENT
  server = spawn(process.execPath, [NEXT_BIN, 'start', '-p', PORT], {
    cwd: ROOT,
    stdio: ['ignore', 'inherit', 'pipe'],
    env: { ...process.env, PORT, COLLECT_HISTORY_FILE: HISTORY_FILE },
  });
  server.on('error', (err) => {
    serverFailure = `spawn 失败：${err.message}`;
  });
  server.on('exit', (code, signal) => {
    serverFailure = `进程提前退出（code=${code}, signal=${signal}）`;
  });
  server.stderr.on('data', (chunk) => {
    serverFailure += chunk.toString().slice(-500);
    process.stderr.write(chunk);
  });
  await waitForServer(`${BASE}/api/dictionary/suggest?term=test`);
});

after(() => {
  if (server) {
    server.kill('SIGTERM');
    server = null;
  }
  if (fs.existsSync(HISTORY_FILE)) {
    fs.unlinkSync(HISTORY_FILE);
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
    body: JSON.stringify({ urls: ['https://github.com/Tanox/GitHub_Chinese'] }),
  });
  assert.equal(r.status, 200);
  const ct = r.headers.get('content-type') || '';
  assert.ok(ct.includes('text/event-stream'), `期望 SSE，实际 ${ct}`);
  const reader = r.body.getReader();
  const { value } = await reader.read();
  assert.ok(value && value.length > 0, 'SSE 首帧不应为空');
  await reader.cancel();
});

for (const page of PAGES) {
  test(`a11y: ${page} 页面无 serious / critical 违规`, async () => {
    const r = await fetch(`${BASE}${page}`);
    assert.equal(r.status, 200, `页面 ${page} 返回 ${r.status}`);
    const violations = await collectBlockingViolations(await r.text());
    assert.equal(
      violations.length,
      0,
      `页面 ${page} 存在阻断级违规：${JSON.stringify(violations, null, 2)}`,
    );
  });
}
