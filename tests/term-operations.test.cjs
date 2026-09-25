/**
 * 搜索与批量操作测试
 * @file tests/term-operations.test.cjs
 * @version 1.11.13
 * @description 校验 term-operations.cjs 的搜索命中、待翻译筛选与批量标记
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { STATUS, createReviewEntry } = require('../review-store.cjs');
const {
  searchDictionary,
  filterUntranslated,
  batchApplyStatus,
  UNTRANSLATED_PREFIX,
} = require('../term-operations.cjs');

const DICT = {
  Sign: '登录',
  'New issue': '新建议题',
  '待翻译: Dashboard': '待翻译: Dashboard',
  '待翻译: Repository': '待翻译: Repository',
};

test('searchDictionary 关键词命中 term 或 translation', () => {
  const hitTerm = searchDictionary(DICT, 'issue');
  assert.deepEqual(hitTerm, [{ term: 'New issue', translation: '新建议题' }]);
  const hitTrans = searchDictionary(DICT, '登录');
  assert.deepEqual(hitTrans, [{ term: 'Sign', translation: '登录' }]);
});

test('searchDictionary 大小写不敏感，空查询返回全部', () => {
  assert.equal(searchDictionary(DICT, 'SIGN').length, 1);
  assert.equal(searchDictionary(DICT, ' ').length, Object.keys(DICT).length);
  assert.equal(searchDictionary(DICT, 'SIGN', { caseSensitive: true }).length, 0);
});

test('filterUntranslated 仅筛出待翻译占位', () => {
  const list = filterUntranslated(DICT);
  assert.equal(list.length, 2);
  assert.deepEqual(list.map((x) => x.pending).sort(), ['Dashboard', 'Repository']);
  assert.ok(list.every((x) => x.translation.startsWith(UNTRANSLATED_PREFIX)));
});

test('batchApplyStatus 批量标记且原 map 不变', () => {
  const map0 = { a: createReviewEntry('a'), b: createReviewEntry('b') };
  const map1 = batchApplyStatus(map0, ['a', 'b'], STATUS.IGNORED, { source: 'bulk' });
  assert.equal(map1.a.status, STATUS.IGNORED);
  assert.equal(map1.b.status, STATUS.IGNORED);
  assert.equal(map1.a.source, 'bulk');
  // 原 map 不变
  assert.equal(map0.a.status, STATUS.PENDING);
  // 空列表直接返回副本
  const map2 = batchApplyStatus(map0, [], STATUS.TRANSLATED);
  assert.notStrictEqual(map2, map0);
});
