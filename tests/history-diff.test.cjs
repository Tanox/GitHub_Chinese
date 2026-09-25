/**
 * 历史轮次 diff 测试
 * @file tests/history-diff.test.cjs
 * @version 1.11.14
 * @description 校验 history-diff.cjs 的词条级 diff、轮次记录、回滚与对比
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  diffDictionaries,
  buildRoundRecord,
  restoreFromRecord,
  compareRounds,
} = require('../history-diff.cjs');

const PREV = { Sign: '登录', Issue: '议题', Delete: '删除' };
const CURR = { Sign: '登录', Issue: '工单', Star: '星标' };

test('diffDictionaries 新增/删除/变更/无变化', () => {
  const d = diffDictionaries(PREV, CURR);
  assert.deepEqual(d.added, [{ term: 'Star', translation: '星标' }]);
  assert.deepEqual(d.removed, [{ term: 'Delete', translation: '删除' }]);
  assert.deepEqual(d.changed, [{ term: 'Issue', prev: '议题', curr: '工单' }]);
  assert.deepEqual(diffDictionaries(PREV, PREV).changed, []);
});

test('buildRoundRecord 计数与默认含 snapshot', () => {
  const rec = buildRoundRecord(CURR, PREV);
  assert.equal(rec.total, 3);
  assert.equal(rec.added, 1);
  assert.equal(rec.removed, 1);
  assert.equal(rec.changed, 1);
  assert.ok(rec.snapshot);
  assert.equal(rec.snapshot.Issue, '工单');
  // 可关闭 snapshot
  const noSnap = buildRoundRecord(CURR, PREV, { includeSnapshot: false });
  assert.equal(noSnap.snapshot, undefined);
  // 自定义 time
  const t = buildRoundRecord(CURR, PREV, { time: '2026-09-25T00:00:00Z' });
  assert.equal(t.time, '2026-09-25T00:00:00Z');
});

test('restoreFromRecord 从 snapshot 回滚，无快照抛错', () => {
  const rec = buildRoundRecord(CURR, PREV);
  assert.deepEqual(restoreFromRecord(rec), CURR);
  assert.throws(() => restoreFromRecord({ time: 'x' }), /no snapshot/);
});

test('compareRounds 对比历史两轮，索引越界抛错', () => {
  const h = [buildRoundRecord(PREV, {}), buildRoundRecord(CURR, PREV)];
  const d = compareRounds(h, 0, 1);
  assert.equal(d.added.length, 1);
  assert.equal(d.removed.length, 1);
  assert.equal(d.changed.length, 1);
  assert.throws(() => compareRounds(h, 0, 5), /invalid round index/);
  // 无 snapshot 退化空 diff
  assert.deepEqual(compareRounds([{ time: 'a' }, { time: 'b' }], 0, 1), {
    added: [],
    removed: [],
    changed: [],
  });
});
