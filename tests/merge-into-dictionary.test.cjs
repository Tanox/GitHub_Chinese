/**
 * 一键合并入库测试
 * @file tests/merge-into-dictionary.test.cjs
 * @version 1.11.12
 * @description 校验 merge-into-dictionary.cjs 的审阅筛选、diff 补丁、不可变应用与 PR 式预览
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { STATUS, createReviewEntry, applyStatus } = require('../review-store.cjs');
const {
  selectMergedEntries,
  buildDictionaryPatch,
  applyPatch,
  renderDiffPreview,
  PLACEHOLDER_PREFIX,
} = require('../merge-into-dictionary.cjs');

test('selectMergedEntries 仅收录 translated，无译文生成占位', () => {
  const map = {
    a: createReviewEntry('a', { status: STATUS.TRANSLATED, note: '登录' }),
    b: createReviewEntry('b', { status: STATUS.TRANSLATED }), // 无译文 → 占位
    c: createReviewEntry('c', { status: STATUS.IGNORED }),
    d: createReviewEntry('d', { status: STATUS.NEEDS_REVIEW }),
    e: createReviewEntry('e'), // pending
  };
  const list = selectMergedEntries(map);
  assert.equal(list.length, 2);
  const a = list.find((x) => x.term === 'a');
  const b = list.find((x) => x.term === 'b');
  assert.equal(a.translation, '登录');
  assert.equal(a.hadTranslation, true);
  assert.equal(b.translation, PLACEHOLDER_PREFIX + 'b');
  assert.equal(b.hadTranslation, false);
});

test('buildDictionaryPatch 区分新增/更新/无变化', () => {
  const map = {
    new1: createReviewEntry('new1', { status: STATUS.TRANSLATED, note: '新词' }),
    upd1: createReviewEntry('upd1', { status: STATUS.TRANSLATED, note: '改后' }),
    same1: createReviewEntry('same1', { status: STATUS.TRANSLATED, note: '不变' }),
  };
  const dict = { upd1: '改前', same1: '不变' };
  const patch = buildDictionaryPatch(map, dict);
  assert.deepEqual(patch.added, { new1: '新词' });
  assert.deepEqual(patch.updated, { upd1: '改后' });
  assert.equal(patch.added.same1, undefined); // 值相同跳过
});

test('applyPatch 不可变合并', () => {
  const dict = { x: 'X' };
  const patch = { added: { a: 'A' }, updated: { x: 'x2' } };
  const next = applyPatch(dict, patch);
  assert.deepEqual(next, { x: 'x2', a: 'A' });
  assert.deepEqual(dict, { x: 'X' }); // 原词典不变
});

test('renderDiffPreview PR 式文本', () => {
  const patch = { added: { a: 'A' }, updated: { b: 'B' } };
  const text = renderDiffPreview(patch);
  assert.ok(text.includes('+ "a": "A"'));
  assert.ok(text.includes('~ "b": "B"'));
  assert.equal(renderDiffPreview({ added: {}, updated: {} }), '(无变更)');
});
