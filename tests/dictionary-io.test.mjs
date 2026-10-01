import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  toEntries,
  filterEntries,
  sortEntries,
  mergeDictionaries,
  parseImportedDictionary,
} from '../src/lib/dictionary-io.js';

test('toEntries 保持键顺序', () => {
  assert.deepEqual(toEntries({ a: '1', b: '2' }), [
    { key: 'a', value: '1' },
    { key: 'b', value: '2' },
  ]);
});

test('filterEntries 大小写不敏感匹配键或值', () => {
  const entries = toEntries({ Settings: '设置', Branch: '分支' });
  assert.equal(filterEntries(entries, 'set').length, 1);
  assert.equal(filterEntries(entries, '分支').length, 1);
  assert.equal(filterEntries(entries, '').length, 2);
});

test('sortEntries 按键与方向', () => {
  const entries = toEntries({ b: '2', a: '1' });
  assert.deepEqual(
    sortEntries(entries, 'key', 'asc').map((e) => e.key),
    ['a', 'b'],
  );
  assert.deepEqual(
    sortEntries(entries, 'key', 'desc').map((e) => e.key),
    ['b', 'a'],
  );
});

test('mergeDictionaries 后者覆盖前者', () => {
  assert.deepEqual(mergeDictionaries({ a: '1' }, { a: 'x', c: '3' }), {
    a: 'x',
    c: '3',
  });
});

test('parseImportedDictionary 扁平对象', () => {
  const r = parseImportedDictionary('{"Settings":"设置"}');
  assert.equal(r.ok, true);
  assert.equal(r.count, 1);
  assert.equal(r.data.Settings, '设置');
});

test('parseImportedDictionary 条目数组', () => {
  const r = parseImportedDictionary('[{"key":"A","value":"甲"},{"key":"B","value":"乙"}]');
  assert.equal(r.ok, true);
  assert.equal(r.count, 2);
});

test('parseImportedDictionary 空与非法', () => {
  assert.equal(parseImportedDictionary('').ok, false);
  assert.equal(parseImportedDictionary('not json').ok, false);
  assert.equal(parseImportedDictionary('[1,2,3]').ok, false);
});
