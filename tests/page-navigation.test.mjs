/**
 * 页面导航辅助测试
 * @file tests/page-navigation.test.mjs
 * @version 1.10.0
 * @description 覆盖纯函数分支（退避延迟 / 可重试判定），无需浏览器依赖
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeBackoffDelay,
  isRetryable,
  RetryableError,
} from '../src/lib/page-navigation.js';

test('computeBackoffDelay 指数递增 1s/2s/4s', () => {
  assert.equal(computeBackoffDelay(1), 1_000);
  assert.equal(computeBackoffDelay(2), 2_000);
  assert.equal(computeBackoffDelay(3), 4_000);
});

test('isRetryable 识别超时与网络错误', () => {
  assert.ok(isRetryable(Object.assign(new Error('Navigation timeout'), { name: 'TimeoutError' })));
  assert.ok(isRetryable(new Error('net::ERR_CONNECTION_RESET')));
  assert.ok(isRetryable(new Error('HTTP 429 Too Many Requests')));
  assert.ok(isRetryable(new Error('502 Bad Gateway')));
});

test('isRetryable 拒绝不可重试错误', () => {
  assert.equal(isRetryable(new Error('some logic error')), false);
  assert.equal(isRetryable(new TypeError('not a navigaton issue')), false);
});

test('RetryableError 携带状态码且被判定为可重试', () => {
  const error = new RetryableError('rate-limited', 429);
  assert.equal(error.status, 429);
  assert.ok(isRetryable(error));
});
