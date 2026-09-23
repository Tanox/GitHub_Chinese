/**
 * 词典采集纯函数测试
 * @file tests/collect-dict.test.cjs
 * @version 1.9.30
 * @description 校验 findUntranslated 的命中判定、大小写处理与过滤规则
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { findUntranslated } = require('../collect-dict.cjs');

test('findUntranslated 命中原样词条，未命中归入待翻译', () => {
  const dictionary = { 'Sign in': '登录' };
  const { untranslated, translated } = findUntranslated(['Sign in', 'New issue'], dictionary);
  assert.ok(translated.has('Sign in'));
  assert.deepEqual(untranslated, ['New issue']);
});

test('findUntranslated 支持大写键被小写输入命中（大小写不敏感）', () => {
  const dictionary = { 'PULL REQUESTS': '拉取请求' };
  const { translated } = findUntranslated(['pull requests'], dictionary);
  assert.ok(translated.has('pull requests'));
});

test('findUntranslated 过滤纯数字 / 纯标点 / 过短词条', () => {
  const { untranslated } = findUntranslated(['123', '!!!', 'a', 'Valid term'], {});
  assert.deepEqual(untranslated, ['Valid term']);
});
