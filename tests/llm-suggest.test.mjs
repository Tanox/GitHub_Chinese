/**
 * LLM 翻译建议降级单测
 * @file tests/llm-suggest.test.mjs
 * @version 1.12.13
 * @description 无密钥直返、超时/网络错误/非 2xx 均降级 null、成功时透传去空白译文。
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { llmSuggest } from '../src/lib/llm-suggest.js';

/** 安装 fetch mock，返回调用记录 */
function mockFetch(impl) {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return impl(url, init);
  };
  return {
    calls,
    restore() {
      globalThis.fetch = original;
    },
  };
}

test('无密钥时直接返回 null 且不发请求', async () => {
  const mock = mockFetch(async () => new Response('{}'));
  try {
    const result = await llmSuggest('Settings', { apiKey: '' });
    assert.equal(result, null);
    assert.equal(mock.calls.length, 0);
  } finally {
    mock.restore();
  }
});

test('成功响应返回去空白后的译文', async () => {
  const mock = mockFetch(
    async () =>
      new Response(JSON.stringify({ choices: [{ message: { content: '  设置页面  ' } }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
  );
  try {
    const result = await llmSuggest('Settings page', { apiKey: 'k' });
    assert.equal(result, '设置页面');
    assert.equal(mock.calls[0].init.headers.Authorization, 'Bearer k');
  } finally {
    mock.restore();
  }
});

test('非 2xx 响应降级 null', async () => {
  const mock = mockFetch(async () => new Response('rate limited', { status: 429 }));
  try {
    assert.equal(await llmSuggest('Settings', { apiKey: 'k' }), null);
  } finally {
    mock.restore();
  }
});

test('响应结构缺 message.content 时降级 null', async () => {
  const mock = mockFetch(async () => new Response(JSON.stringify({ choices: [] })));
  try {
    assert.equal(await llmSuggest('Settings', { apiKey: 'k' }), null);
  } finally {
    mock.restore();
  }
});

test('网络错误降级 null', async () => {
  const mock = mockFetch(async () => {
    throw new Error('ECONNRESET');
  });
  try {
    assert.equal(await llmSuggest('Settings', { apiKey: 'k' }), null);
  } finally {
    mock.restore();
  }
});

test('挂起端点在超时后降级 null 而不是永久等待（回归）', async () => {
  // 模拟真实 fetch：监听 signal，abort（超时）时以 AbortError reject
  const mock = mockFetch((_url, init) => {
    return new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => {
        const error = new Error('The operation was aborted due to timeout');
        error.name = 'TimeoutError';
        reject(error);
      });
    });
  });
  const started = Date.now();
  try {
    const result = await llmSuggest('Settings', { apiKey: 'k', timeoutMs: 30 });
    assert.equal(result, null);
    assert.ok(Date.now() - started < 1000, '应在超时附近返回，而非等待默认 10s');
  } finally {
    mock.restore();
  }
});
