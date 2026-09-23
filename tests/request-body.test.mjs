/**
 * 采集请求体归一化测试
 * @file tests/request-body.test.mjs
 * @version 1.9.37
 * @description 覆盖请求体缺失 / 空数组 / 混杂非字符串项等分支（route 据此返回 400）
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { extractUrls } from '../src/lib/request-body.js';

test('extractUrls 拒绝缺失或非数组的 urls', () => {
  for (const body of [{}, { urls: 'not-array' }, { urls: [] }, null, undefined]) {
    const result = extractUrls(body);
    assert.equal(result.ok, false, `${JSON.stringify(body)} 应被拒绝`);
  }
});

test('extractUrls 过滤非字符串与空字符串项，全无效时报错', () => {
  assert.equal(extractUrls({ urls: [123, null, '   '] }).ok, false);
});

test('extractUrls 保留合法 URL 字符串', () => {
  const result = extractUrls({ urls: ['https://github.com/explore', 'http://example.com'] });
  assert.equal(result.ok, true);
  assert.deepEqual(result.urls, ['https://github.com/explore', 'http://example.com']);
});
