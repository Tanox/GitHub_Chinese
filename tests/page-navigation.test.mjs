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
  applyCookies,
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

test('applyCookies 注入与目标主机匹配的 cookie，跳过不匹配的', async () => {
  const recorded = [];
  const page = { setCookie: async (c) => recorded.push(c) };
  await applyCookies(
    page,
    [
      { name: 'sess', value: 'abc', domain: '.github.com' },
      { name: 'evil', value: 'x', domain: '.evil.com' },
      { name: 'noDomain', value: 'y' },
    ],
    'https://github.com/foo/bar',
  );
  assert.equal(recorded.length, 2, '应注入 2 条（匹配 + 无 domain）');
  assert.ok(recorded.some((c) => c.name === 'sess' && c.domain === 'github.com'), '前导点应被规范化');
  assert.ok(recorded.some((c) => c.name === 'noDomain' && c.url === 'https://github.com/foo/bar'));
  assert.ok(!recorded.some((c) => c.name === 'evil'), '不匹配主机的 cookie 应被跳过');
});

test('applyCookies 空列表 / 缺 setCookie 时安静返回', async () => {
  let called = false;
  const page = { setCookie: async () => { called = true; } };
  await applyCookies(page, [], 'https://github.com');
  await applyCookies({ noop: true }, [{ name: 'a', value: 'b' }], 'https://github.com');
  assert.equal(called, false, '空列表不应调用 setCookie');
});
