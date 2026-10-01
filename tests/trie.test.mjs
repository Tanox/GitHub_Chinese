/**
 * Trie 树单测
 * @file tests/trie.test.mjs
 * @description 覆盖插入、匹配、minKeyLength 约束与清空（翻译核心部分匹配的数据结构基石）
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { Trie } from '../src/userscript/core/trie.js';

test('insert 与 getSize：空串被忽略', () => {
  const trie = new Trie();
  assert.equal(trie.getSize(), 0);
  trie.insert('hello', '你好');
  assert.equal(trie.getSize(), 1);
  trie.insert('', '空');
  assert.equal(trie.getSize(), 1);
});

test('findAllMatches 返回文本中全部命中键', () => {
  const trie = new Trie();
  trie.insert('Sign in', '登录');
  trie.insert('Pull request', '拉取请求');
  const matches = trie.findAllMatches('Please Sign in now');
  assert.ok(matches.some((m) => m.key === 'Sign in'), '应命中 Sign in');
});

test('findAllMatches 受 minKeyLength 约束', () => {
  const trie = new Trie();
  trie.insert('Go', '前往');
  assert.ok(trie.findAllMatches('Go to', 0).some((m) => m.key === 'Go'));
  assert.equal(trie.findAllMatches('Go to', 3).length, 0, 'minKeyLength=3 应排除 Go');
});

test('findAllMatches 空文本返回空数组', () => {
  const trie = new Trie();
  trie.insert('x', 'X');
  assert.deepEqual(trie.findAllMatches(''), []);
});

test('clear 重置规模与匹配', () => {
  const trie = new Trie();
  trie.insert('a', 'A');
  trie.clear();
  assert.equal(trie.getSize(), 0);
  assert.equal(trie.findAllMatches('a').length, 0);
});
