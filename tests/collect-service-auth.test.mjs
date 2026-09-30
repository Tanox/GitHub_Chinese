/**
 * 独立采集服务令牌校验单测
 * @file tests/collect-service-auth.test.mjs
 * @version 1.13.0
 * @description 覆盖 extractBearer / isTokenValid / createTokenAuth：
 *   未配置不启用、缺头与错令牌 401、正确令牌放行、长度不一致不抛错、WWW-Authenticate 质询头。
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTokenAuth,
  extractBearer,
  isTokenValid,
} from '../server/collect-service/auth.js';

/** 构造最小 Express 风格 req/res/next 探针 */
function makeMwsEnv(authHeader) {
  const req = { headers: authHeader === undefined ? {} : { authorization: authHeader } };
  const result = { statusCode: null, body: null, challenge: null, nextCalled: false };
  const res = {
    status(code) {
      result.statusCode = code;
      return this;
    },
    set(name, value) {
      if (name === 'WWW-Authenticate') result.challenge = value;
      return this;
    },
    json(payload) {
      result.body = payload;
    },
  };
  const next = () => {
    result.nextCalled = true;
  };
  return { req, res, next, result };
}

test('extractBearer：合法/非法头', () => {
  assert.equal(extractBearer('Bearer abc123'), 'abc123');
  assert.equal(extractBearer('bearer abc123'), null); // 方案名大小写敏感
  assert.equal(extractBearer('Token abc'), null);
  assert.equal(extractBearer('Bearer'), null);
  assert.equal(extractBearer(undefined), null);
  assert.equal(extractBearer(42), null);
});

test('isTokenValid：恒定时间比对的语义正确', () => {
  assert.equal(isTokenValid('secret', 'secret'), true);
  assert.equal(isTokenValid('wrong', 'secret'), false);
  assert.equal(isTokenValid('', 'secret'), false);
  assert.equal(isTokenValid('secret', ''), false);
  assert.equal(isTokenValid(undefined, 'secret'), false);
  assert.equal(isTokenValid(null, 'secret'), false);
  // 长度不同不得抛 timingSafeEqual 错误
  assert.equal(isTokenValid('a', 'abc'), false);
});

test('未配置令牌时 createTokenAuth 返回 null（默认开放）', () => {
  assert.equal(createTokenAuth(undefined), null);
  assert.equal(createTokenAuth(''), null);
});

test('配置后缺少 Authorization 头返回 401 且不调用 next', () => {
  const mw = createTokenAuth('secret');
  const { req, res, next, result } = makeMwsEnv(undefined);
  mw(req, res, next);
  assert.equal(result.statusCode, 401);
  assert.equal(result.nextCalled, false);
  assert.equal(result.challenge, 'Bearer');
  assert.match(result.body.error, /未授权/);
});

test('错误令牌 401', () => {
  const mw = createTokenAuth('secret');
  const { req, res, next, result } = makeMwsEnv('Bearer wrong-token');
  mw(req, res, next);
  assert.equal(result.statusCode, 401);
  assert.equal(result.nextCalled, false);
});

test('格式错误的 Authorization 头 401（只验前缀不等于完成鉴权）', () => {
  const mw = createTokenAuth('secret');
  const { req, res, next, result } = makeMwsEnv('secret'); // 无 Bearer 前缀
  mw(req, res, next);
  assert.equal(result.statusCode, 401);
});

test('正确令牌放行（调用 next，不写响应）', () => {
  const mw = createTokenAuth('secret');
  const { req, res, next, result } = makeMwsEnv('Bearer secret');
  mw(req, res, next);
  assert.equal(result.nextCalled, true);
  assert.equal(result.statusCode, null);
  assert.equal(result.body, null);
});
