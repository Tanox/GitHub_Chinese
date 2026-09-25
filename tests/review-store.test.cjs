/**
 * 词条级审阅工作流测试
 * @file tests/review-store.test.cjs
 * @version 1.11.11
 * @description 校验 review-store.cjs 的状态机、不可变迁移、批量合并、统计与序列化往返
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  STATUS,
  isValidStatus,
  createReviewEntry,
  applyStatus,
  mergeReviewUpdates,
  summarize,
  serialize,
  deserialize,
} = require('../review-store.cjs');

test('createReviewEntry 默认 pending 且 history 含 create', () => {
  const e = createReviewEntry('Sign in', { source: 'nav' });
  assert.equal(e.status, STATUS.PENDING);
  assert.equal(e.source, 'nav');
  assert.equal(e.history.length, 1);
  assert.equal(e.history[0].event, 'create');
});

test('createReviewEntry 拒绝空 term 与非法状态', () => {
  assert.throws(() => createReviewEntry(''), /term 不能为空/);
  assert.throws(() => createReviewEntry('X', { status: 'bogus' }), /非法审阅状态/);
  assert.equal(isValidStatus('translated'), true);
  assert.equal(isValidStatus('nope'), false);
});

test('applyStatus 迁移状态且不修改原条目（不可变）', () => {
  const e0 = createReviewEntry('Sign in', { timestamp: 100 });
  const e1 = applyStatus(e0, STATUS.TRANSLATED, { note: '已确认', timestamp: 200 });
  assert.equal(e1.status, STATUS.TRANSLATED);
  assert.equal(e1.note, '已确认');
  assert.equal(e1.history.length, 2);
  assert.equal(e1.history[1].event, 'transition');
  // 原条目不变
  assert.equal(e0.status, STATUS.PENDING);
  assert.equal(e0.history.length, 1);
});

test('mergeReviewUpdates 新增+更新且不可变', () => {
  const map0 = { 'A': createReviewEntry('A', { status: STATUS.IGNORED, timestamp: 1 }) };
  const map1 = mergeReviewUpdates(map0, [
    { term: 'A', status: STATUS.TRANSLATED }, // 更新既有
    { term: 'B', status: STATUS.NEEDS_REVIEW, source: 'repo' }, // 新增
  ]);
  assert.equal(map1.A.status, STATUS.TRANSLATED);
  assert.equal(map1.B.status, STATUS.NEEDS_REVIEW);
  assert.equal(map1.B.source, 'repo');
  // 原 map 不变
  assert.equal(map0.A.status, STATUS.IGNORED);
  assert.equal(map0.B, undefined);
});

test('summarize 统计各状态', () => {
  const map = {
    a: createReviewEntry('a', { status: STATUS.TRANSLATED }),
    b: createReviewEntry('b', { status: STATUS.IGNORED }),
    c: createReviewEntry('c', { status: STATUS.NEEDS_REVIEW }),
    d: createReviewEntry('d'),
  };
  const s = summarize(map);
  assert.deepEqual(s, { pending: 1, translated: 1, ignored: 1, needs_review: 1, total: 4 });
});

test('serialize/deserialize 往返且跳过非法条目', () => {
  const map = {
    a: createReviewEntry('a', { status: STATUS.TRANSLATED, timestamp: 5 }),
    b: createReviewEntry('b', { status: STATUS.IGNORED, timestamp: 6 }),
  };
  const json = serialize(map);
  const { reviewMap, stats } = deserialize(json);
  assert.equal(reviewMap.a.status, STATUS.TRANSLATED);
  assert.equal(reviewMap.b.status, STATUS.IGNORED);
  assert.equal(stats.skipped, 0);
  // 含非法条目时跳过并计数
  const dirty = json.replace('"status": "translated"', '"status": "weird"');
  const r2 = deserialize(dirty);
  assert.equal(r2.stats.skipped, 1);
  assert.equal(r2.reviewMap.a, undefined);
  assert.equal(r2.reviewMap.b.status, STATUS.IGNORED);
  // 非对象抛错
  assert.throws(() => deserialize('[1,2]'), /必须是对象/);
});
