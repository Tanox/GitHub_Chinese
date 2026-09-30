/**
 * 待入库本地数据收窄单测
 * @file tests/pending.test.mjs
 * @version 1.12.13
 * @description 回归：localStorage 脏数据（损坏 JSON、非数组、字段类型错误）不得让词典助手渲染崩溃。
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { isPendingItem, parsePending } from '../src/components/dictionary/pending.ts';

test('null/空字符串安全降级为空列表', () => {
  assert.deepEqual(parsePending(null), []);
  assert.deepEqual(parsePending(''), []);
});

test('损坏的 JSON 降级为空列表而非抛错', () => {
  assert.deepEqual(parsePending('{not-json'), []);
});

test('非数组 JSON（字符串/数字/对象）降级为空列表', () => {
  assert.deepEqual(parsePending('"hello"'), []);
  assert.deepEqual(parsePending('42'), []);
  assert.deepEqual(parsePending('{"a":1}'), []);
});

test('合法数组保留，非法元素被过滤', () => {
  const valid = { key: 'Settings', value: '设置', source: 'memory-exact' };
  const raw = JSON.stringify([
    valid,
    { key: 'Issues' }, // 缺 value/source
    { key: 1, value: 'x', source: 'llm' }, // key 非字符串
    'bare-string',
    null,
  ]);
  assert.deepEqual(parsePending(raw), [valid]);
});

test('空数组合法', () => {
  assert.deepEqual(parsePending('[]'), []);
});

test('isPendingItem 类型守卫', () => {
  assert.equal(isPendingItem({ key: 'a', value: 'b', source: 'c' }), true);
  assert.equal(isPendingItem({ key: 'a', value: 'b', source: 1 }), false);
  assert.equal(isPendingItem(null), false);
  assert.equal(isPendingItem('x'), false);
});
