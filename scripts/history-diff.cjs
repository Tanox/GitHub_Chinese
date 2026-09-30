/**
 * 历史轮次词条级 diff / 对比 / 回滚（T23 数据层）
 * @file history-diff.cjs
 * @version 1.11.14
 * @description 将 `collect-history.json` 扩展为词条级 diff：`diffDictionaries` 计算两轮词典的
 *   新增/删除/变更；`buildRoundRecord` 生成含 diff（默认含 snapshot 以支持回滚）的轮次记录；
 *   `restoreFromRecord` 从快照回滚；`compareRounds` 对比历史中任意两轮。采集流程接入留后端（W5 架构决策）。
 */
'use strict';

/**
 * 词条级 diff 两轮词典
 * @param {Object<string,string>} [prev]
 * @param {Object<string,string>} [curr]
 * @returns {{added:Array<{term:string,translation:string}>,
 *            removed:Array<{term:string,translation:string}>,
 *            changed:Array<{term:string,prev:string,curr:string}>}}
 */
function diffDictionaries(prev, curr) {
  const p = prev || {};
  const c = curr || {};
  const added = [];
  const removed = [];
  const changed = [];
  const keys = new Set([...Object.keys(p), ...Object.keys(c)]);
  for (const term of keys) {
    const inP = term in p;
    const inC = term in c;
    if (inP && inC) {
      if (p[term] !== c[term]) changed.push({ term, prev: p[term], curr: c[term] });
    } else if (inC) {
      added.push({ term, translation: c[term] });
    } else {
      removed.push({ term, translation: p[term] });
    }
  }
  return { added, removed, changed };
}

/**
 * 生成轮次记录（含词条级 diff；默认含完整 snapshot 以支持回滚）
 * @param {Object<string,string>} dictionary 本轮词典
 * @param {Object<string,string>} [prevDictionary] 上一轮词典
 * @param {{time?:string, includeSnapshot?:boolean}} [opts]
 * @returns {object}
 */
function buildRoundRecord(dictionary, prevDictionary, opts = {}) {
  const diff = diffDictionaries(prevDictionary, dictionary);
  const record = {
    time: opts.time || new Date().toISOString(),
    total: Object.keys(dictionary || {}).length,
    added: diff.added.length,
    removed: diff.removed.length,
    changed: diff.changed.length,
    diff,
  };
  if (opts.includeSnapshot !== false) record.snapshot = { ...(dictionary || {}) };
  return record;
}

/**
 * 从含 snapshot 的轮次记录回滚词典
 * @param {object} record
 * @returns {Object<string,string>}
 */
function restoreFromRecord(record) {
  if (!record || !record.snapshot) throw new Error('record has no snapshot for rollback');
  return { ...record.snapshot };
}

/**
 * 对比历史中两轮（优先用各自 snapshot；否则退化空 diff）
 * @param {Array<object>} history
 * @param {number} fromIdx
 * @param {number} toIdx
 * @returns {ReturnType<typeof diffDictionaries>}
 */
function compareRounds(history, fromIdx, toIdx) {
  const h = history || [];
  const a = h[fromIdx];
  const b = h[toIdx];
  if (!a || !b) throw new Error('invalid round index');
  if (a.snapshot && b.snapshot) return diffDictionaries(a.snapshot, b.snapshot);
  return { added: [], removed: [], changed: [] };
}

module.exports = { diffDictionaries, buildRoundRecord, restoreFromRecord, compareRounds };
