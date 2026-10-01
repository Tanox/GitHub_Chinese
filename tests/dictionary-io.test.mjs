import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  toEntries,
  filterEntries,
  sortEntries,
  mergeDictionaries,
  parseImportedDictionary,
  buildDictionaryPatch,
  applyPatch,
  renderDiffPreview,
  diffDictionaries,
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

test('buildDictionaryPatch 分离新增与更新，跳过同值', () => {
  const patch = buildDictionaryPatch({ a: '1', b: '2' }, { a: '1', b: 'x', c: '3' });
  assert.deepEqual(patch.added, { c: '3' });
  assert.deepEqual(patch.updated, { b: 'x' });
  assert.ok(!('a' in patch.added) && !('a' in patch.updated));
});

test('applyPatch 不可变应用补丁', () => {
  const base = { a: '1' };
  const next = applyPatch(base, { added: { c: '3' }, updated: { a: '9' } });
  assert.deepEqual(next, { a: '9', c: '3' });
  assert.deepEqual(base, { a: '1' });
});

test('renderDiffPreview PR 式文本，无变更返回占位', () => {
  assert.equal(
    renderDiffPreview({ added: { c: '3' }, updated: { a: '9' } }),
    '+ "c": "3"\n~ "a": "9"',
  );
  assert.equal(renderDiffPreview({ added: {}, updated: {} }), '(无变更)');
});

test('diffDictionaries 计算新增/删除/变更', () => {
  const d = diffDictionaries({ a: '1', b: '2', x: '9' }, { a: '1', b: 'y', c: '3' });
  assert.deepEqual(d.added, [{ term: 'c', translation: '3' }]);
  assert.deepEqual(d.removed, [{ term: 'x', translation: '9' }]);
  assert.deepEqual(d.changed, [{ term: 'b', prev: '2', curr: 'y' }]);
});
