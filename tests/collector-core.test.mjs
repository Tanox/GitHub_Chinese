/**
 * 采集核心事件流测试
 * @file tests/collector-core.test.mjs
 * @version 1.9.37
 * @description 覆盖入口错误码分支（空列表 / 全非法 URL）；这些分支在启动浏览器前返回，无需浏览器依赖
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { collectFromUrls } from '../src/lib/collector-core.js';
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
