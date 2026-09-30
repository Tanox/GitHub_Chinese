/**
 * 部分匹配翻译单测
 * @file tests/partial-translator.test.mjs
 * @description 覆盖 Trie 长词优先替换、开关、空 store、短文本与待翻译占位跳过
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { partialTranslator } from '../src/translation-core/partialTranslator.js';
import { Trie } from '../src/core/trie.js';

function buildStore(dict) {
  const trie = new Trie();
  Object.keys(dict).forEach((k) => trie.insert(k, dict[k]));
  return { dictionary: dict, dictionaryTrie: trie, regexCache: new Map() };
}

test('长词优先替换句子内的词汇', () => {
  const store = buildStore({ 'Sign in': '登录', 'Pull request': '拉取请求' });
  const result = partialTranslator.performPartialTranslation('Please Sign in now', true, store);
  assert.equal(result, 'Please 登录 now');
});

test('未启用部分匹配返回 null', () => {
  const store = buildStore({ 'Sign in': '登录' });
  assert.equal(partialTranslator.performPartialTranslation('Sign in', false, store), null);
});

test('store 为空返回 null', () => {
  assert.equal(partialTranslator.performPartialTranslation('abc', true, null), null);
});

test('文本过短（<5）返回 null', () => {
  const store = buildStore({ Go: '前往' });
  assert.equal(partialTranslator.performPartialTranslation('Go', true, store), null);
});

test('待翻译占位词条不参与替换', () => {
  const store = buildStore({ Foo: '待翻译: Foo' });
  assert.equal(partialTranslator.performPartialTranslation('Foo bar', true, store), null);
});
