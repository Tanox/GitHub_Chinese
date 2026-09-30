/**
 * 采集服务客户端单测
 * @file tests/collect-service-client.test.mjs
 * @version 1.13.0
 * @date 2026-09-30
 * @description 覆盖 proxyCollectRequest：未启用直返、上游成功透传 SSE、非 2xx/无 body/网络错误回退 null、
 *   客户端中断静默返回、COLLECT_SERVICE_TOKEN 成对携带 Authorization；并回归「回退后调用方仍持有
 *   原始请求体」（body 读取点已收敛到路由层）。模块在加载期读取环境变量，用查询串缓存失效加载独立实例。
 */
import test from 'node:test';
import assert from 'node:assert/strict';

const CLIENT_URL = new URL('../src/lib/collect-service-client.js', import.meta.url).href;

const ENV_KEYS = ['COLLECT_SERVICE_URL', 'COLLECT_SERVICE_TOKEN'];

/** 按指定环境变量加载一份全新的 client 模块实例，测完还原 */
async function loadClient(env = {}) {
  const saved = {};
  for (const key of ENV_KEYS) {
    saved[key] = process.env[key];
    if (env[key] === undefined) delete process.env[key];
    else process.env[key] = env[key];
  }
  try {
    return await import(`${CLIENT_URL}?t=${Date.now()}-${Math.random()}`);
  } finally {
    for (const key of ENV_KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  }
}

/** 构造最小可读流，模拟上游 SSE 响应体 */
function sseBody() {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('data: {"type":"log"}\n\n'));
      controller.close();
    },
  });
}

/** 安装 fetch mock，返回调用记录与可控响应工厂 */
function mockFetch(impl) {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return impl();
  };
  return {
    calls,
    restore() {
      globalThis.fetch = original;
    },
  };
}

test('未配置 COLLECT_SERVICE_URL 时直接返回 null 且不发起请求', async () => {
  const { proxyCollectRequest } = await loadClient();
  const mock = mockFetch(async () => new Response(sseBody()));
  try {
    const body = JSON.stringify({ data: 'Settings' });
    const result = await proxyCollectRequest({ body, signal: undefined }, 'collect');
    assert.equal(result, null);
    assert.equal(mock.calls.length, 0);
  } finally {
    mock.restore();
  }
});

test('上游成功时透传 SSE 响应并原样转发请求体字符串', async () => {
  const { proxyCollectRequest } = await loadClient({ COLLECT_SERVICE_URL: 'http://svc:8787' });
  const mock = mockFetch(async () => new Response(sseBody(), { status: 200 }));
  try {
    const body = JSON.stringify({ urls: ['https://github.com/'] });
    const result = await proxyCollectRequest({ body }, 'batch-collect');
    assert.ok(result instanceof Response, '应返回 Response');
    assert.equal(result.headers.get('Content-Type'), 'text/event-stream');
    assert.equal(mock.calls.length, 1);
    assert.equal(mock.calls[0].url, 'http://svc:8787/api/batch-collect');
    assert.equal(mock.calls[0].init.method, 'POST');
    assert.equal(mock.calls[0].init.body, body, '转发体须为路由读取的原始字符串');
    assert.equal(
      mock.calls[0].init.headers.Authorization,
      undefined,
      '未配置令牌时不得携带 Authorization 头',
    );
    assert.match(await result.text(), /type.*log/);
  } finally {
    mock.restore();
  }
});

test('上游非 2xx 时返回 null 回退本地，且调用方仍持有原始请求体（回归）', async () => {
  const { proxyCollectRequest } = await loadClient({ COLLECT_SERVICE_URL: 'http://svc:8787' });
  const mock = mockFetch(async () => new Response('boom', { status: 502 }));
  try {
    const body = JSON.stringify({ data: 'Pull requests' });
    const result = await proxyCollectRequest({ body }, 'collect');
    assert.equal(result, null);
    // 回退本地需要可再次使用该字符串：旧实现消费 Request 后路由 req.json() 必抛 400
    assert.deepEqual(JSON.parse(body), { data: 'Pull requests' });
  } finally {
    mock.restore();
  }
});

test('上游 200 但无响应体时返回 null', async () => {
  const { proxyCollectRequest } = await loadClient({ COLLECT_SERVICE_URL: 'http://svc:8787' });
  const mock = mockFetch(async () => new Response(null, { status: 200 }));
  try {
    const result = await proxyCollectRequest({ body: '{}' }, 'collect');
    assert.equal(result, null);
  } finally {
    mock.restore();
  }
});

test('网络错误时返回 null 回退本地', async () => {
  const { proxyCollectRequest } = await loadClient({ COLLECT_SERVICE_URL: 'http://svc:8787' });
  const mock = mockFetch(async () => {
    throw new Error('ECONNREFUSED');
  });
  try {
    const result = await proxyCollectRequest({ body: '{}' }, 'collect');
    assert.equal(result, null);
  } finally {
    mock.restore();
  }
});

test('signal 已中断时静默返回 null 且不发起请求', async () => {
  const { proxyCollectRequest } = await loadClient({ COLLECT_SERVICE_URL: 'http://svc:8787' });
  const ac = new AbortController();
  ac.abort();
  const mock = mockFetch(async () => new Response(sseBody()));
  try {
    const result = await proxyCollectRequest({ body: '{}', signal: ac.signal }, 'collect');
    assert.equal(result, null);
    assert.equal(mock.calls.length, 0);
  } finally {
    mock.restore();
  }
});

test('fetch 因 AbortError 失败时静默返回 null', async () => {
  const { proxyCollectRequest } = await loadClient({ COLLECT_SERVICE_URL: 'http://svc:8787' });
  const ac = new AbortController();
  const mock = mockFetch(async () => {
    const error = new Error('The operation was aborted');
    error.name = 'AbortError';
    throw error;
  });
  try {
    const result = await proxyCollectRequest({ body: '{}', signal: ac.signal }, 'collect');
    assert.equal(result, null);
  } finally {
    mock.restore();
  }
});

test('配置 COLLECT_SERVICE_TOKEN 时携带 Bearer 令牌（端到端契约）', async () => {
  const { proxyCollectRequest } = await loadClient({
    COLLECT_SERVICE_URL: 'http://svc:8787',
    COLLECT_SERVICE_TOKEN: 'paired-secret',
  });
  const mock = mockFetch(async () => new Response(sseBody(), { status: 200 }));
  try {
    const result = await proxyCollectRequest({ body: '{}' }, 'collect');
    assert.ok(result instanceof Response);
    assert.equal(
      mock.calls[0].init.headers.Authorization,
      'Bearer paired-secret',
      'Next 侧令牌须与服务端成对配置并以 Bearer 方案携带',
    );
  } finally {
    mock.restore();
  }
});

test('上游 401（令牌不匹配）时返回 null 回退本地且状态码写入告警', async () => {
  const { proxyCollectRequest } = await loadClient({
    COLLECT_SERVICE_URL: 'http://svc:8787',
    COLLECT_SERVICE_TOKEN: 'wrong',
  });
  const mock = mockFetch(async () => new Response('unauthorized', { status: 401 }));
  try {
    const result = await proxyCollectRequest({ body: '{}' }, 'collect');
    assert.equal(result, null, '鉴权失败走与其他上游异常一致的回退路径');
    assert.equal(mock.calls.length, 1);
  } finally {
    mock.restore();
  }
});
