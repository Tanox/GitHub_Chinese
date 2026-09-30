/**
 * 采集核心事件流测试
 * @file tests/collector-core.test.mjs
 * @version 1.13.4
 * @date 2026-09-30
 * @description 覆盖入口错误码分支（空列表 / 全非法 URL）；这些分支在启动浏览器前返回，无需浏览器依赖。
 *   另覆盖浏览器池获取失败原因 → 错误码/消息的纯函数映射（LAUNCH_FAILED 不得混入 MISSING_DEPENDENCY）。
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { collectFromUrls, resolveBrowserAcquireError } from '../src/lib/collector-core.js';
import { CollectErrorCode } from '../src/lib/collect-codes.js';

/**
 * 收集事件流（用例只覆盖会提前 return 的分支）
 * @param {unknown} input - 传入 collectFromUrls 的参数
 * @returns {Promise<Array<Record<string, unknown>>>} 事件列表
 */
async function drain(input) {
  const events = [];
  for await (const event of collectFromUrls(input)) {
    events.push(event);
  }
  return events;
}

test('collectFromUrls 空列表返回 INPUT_INVALID', async () => {
  const events = await drain([]);
  assert.equal(events.length, 1);
  assert.equal(events[0].code, CollectErrorCode.INPUT_INVALID);
});

test('collectFromUrls 全非法 URL 逐个透传 INVALID_URL 且不启动浏览器', async () => {
  const events = await drain(['file:///etc/passwd', 'http://169.254.169.254/latest/meta-data/']);
  assert.equal(events.length, 2);
  assert.ok(events.every((event) => event.code === CollectErrorCode.INVALID_URL));
});

test('resolveBrowserAcquireError：缺 puppeteer-core 映射 MISSING_DEPENDENCY（1001）', () => {
  const result = resolveBrowserAcquireError('MISSING_DEPENDENCY');
  assert.equal(result.code, CollectErrorCode.MISSING_DEPENDENCY);
  assert.match(result.message, /puppeteer-core/);
});

test('resolveBrowserAcquireError：缺浏览器可执行文件仍属依赖缺失（1001），消息区分', () => {
  const result = resolveBrowserAcquireError('MISSING_BROWSER');
  assert.equal(result.code, CollectErrorCode.MISSING_DEPENDENCY);
  assert.match(result.message, /Chrome \/ Edge/);
});

test('resolveBrowserAcquireError：依赖齐全但启动失败映射 BROWSER_LAUNCH_FAILED（2003，核心回归）', () => {
  // 修复前三种失败原因统一给 1001，导致前端无法区分「装依赖」与「修环境」
  const result = resolveBrowserAcquireError('LAUNCH_FAILED');
  assert.equal(result.code, CollectErrorCode.BROWSER_LAUNCH_FAILED);
  assert.notEqual(result.code, CollectErrorCode.MISSING_DEPENDENCY);
  assert.notEqual(result.code, CollectErrorCode.SUBPROCESS_FAILED);
  assert.match(result.message, /浏览器启动失败/);
});

test('resolveBrowserAcquireError：未知/空原因兜底为启动失败（2003）', () => {
  assert.equal(resolveBrowserAcquireError(null).code, CollectErrorCode.BROWSER_LAUNCH_FAILED);
  assert.equal(resolveBrowserAcquireError(undefined).code, CollectErrorCode.BROWSER_LAUNCH_FAILED);
  assert.equal(
    resolveBrowserAcquireError('UNEXPECTED').code,
    CollectErrorCode.BROWSER_LAUNCH_FAILED,
  );
});
