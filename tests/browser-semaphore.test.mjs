/**
 * 全局浏览器并发信号量测试
 * @file tests/browser-semaphore.test.mjs
 * @version 1.13.34
 * @description 覆盖 `browser-semaphore.js` 的槽位上限与排队交接语义（纯函数，无浏览器依赖）
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { acquireBrowserSlot, releaseBrowserSlot } from '../src/lib/browser-semaphore.js';

test('并发浏览器槽位上限为 2，超出排队，释放后交接', async () => {
  const a = acquireBrowserSlot();
  const b = acquireBrowserSlot();
  const c = acquireBrowserSlot(); // 超过上限，应进入等待
  await a;
  await b;

  let resolved = false;
  c.then(() => {
    resolved = true;
  });
  await Promise.resolve(); // 冲刷微任务，确认尚未就绪
  assert.equal(resolved, false, '第三槽位在释放前不应就绪');

  releaseBrowserSlot(); // 交接给等待者
  await c;
  assert.equal(resolved, true);

  // 清理：归还剩余两个活动槽位
  releaseBrowserSlot();
  releaseBrowserSlot();
});

test('等待中的槽位在 AbortSignal 取消后从队列移除', async () => {
  const a = acquireBrowserSlot();
  const b = acquireBrowserSlot();
  await a;
  await b;

  const controller = new AbortController();
  const cancelled = acquireBrowserSlot(controller.signal);
  let rejected = false;
  cancelled.catch(() => {
    rejected = true;
  });
  controller.abort();
  await assert.rejects(cancelled, /取消/);
  assert.equal(rejected, true);

  // 被取消的等待者不应再接收槽位：新等待者应先拿到
  const next = acquireBrowserSlot();
  let nextReady = false;
  next.then(() => {
    nextReady = true;
  });
  releaseBrowserSlot();
  await next;
  assert.equal(nextReady, true);

  releaseBrowserSlot();
  releaseBrowserSlot();
});

test('已取消的 signal 不占用槽位', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(acquireBrowserSlot(controller.signal), /取消/);
});

test('无等待者时释放递减计数，后续可再次获取', async () => {
  const a = acquireBrowserSlot();
  await a;
  releaseBrowserSlot();

  // 释放后计数归零，可再获取
  const d = acquireBrowserSlot();
  await d;
  releaseBrowserSlot();
});
