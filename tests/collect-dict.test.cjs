/**
 * 词典采集纯函数测试
 * @file tests/collect-dict.test.cjs
 * @version 1.11.8
 * @description 校验 findUntranslated 的命中判定、大小写处理、过滤规则与模板占位符归一（T16）
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { findUntranslated, stripTemplateTokens } = require('../collect-dict.cjs');

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

test('findUntranslated 模板占位符归一：非模板词典命中含占位符候选（T16）', () => {
  const dictionary = { 'Delete': '删除' };
  const { untranslated, translated } = findUntranslated(['Delete %s?'], dictionary);
  assert.ok(translated.has('Delete %s'), '含占位符候选应判为已翻译');
  assert.deepEqual(untranslated, []);
});

test('findUntranslated mustache/命名占位符串可命中非模板词典（T16）', () => {
  const dictionary = { 'show items': '显示条目', 'hello': '你好' };
  const { translated } = findUntranslated(['Show {{count}} items', 'hello :name'], dictionary);
  assert.ok(translated.has('Show {{count}} items'));
  assert.ok(translated.has('hello :name'));
});

test('stripTemplateTokens 去除 printf/mustache/命名占位符（T16）', () => {
  assert.equal(stripTemplateTokens('Delete %s').trim(), 'Delete');
  assert.equal(stripTemplateTokens('{{count}} comments').trim(), 'comments');
  assert.equal(stripTemplateTokens('Copy %1$s to %2$s').trim(), 'Copy to');
  assert.equal(stripTemplateTokens('hello :name').trim(), 'hello');
});

test('findUntranslated 去占位符匹配不得误伤无关串（T16 回归）', () => {
  const dictionary = { 'Delete': '删除' };
  const { untranslated } = findUntranslated(['Delete something else'], dictionary);
  assert.deepEqual(untranslated, ['Delete something else']);
});
