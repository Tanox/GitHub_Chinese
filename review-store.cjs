/**
 * 词条级审阅工作流（T19 数据层）
 * @file review-store.cjs
 * @version 1.11.11
 * @description 审阅状态机（不可变记录 + history 历史追溯），供工作台标记「已翻译/忽略/需复核」：
 *   持久化媒介（localStorage 或 JSON 文件）由前端接线，本模块仅提供纯逻辑与 serialize/deserialize。
 */
'use strict';

const STATUS = {
  PENDING: 'pending', // 待处理（默认）
  TRANSLATED: 'translated', // 已翻译
  IGNORED: 'ignored', // 忽略
  NEEDS_REVIEW: 'needs_review', // 需复核
};
const STATUS_VALUES = Object.freeze(Object.values(STATUS));

function isValidStatus(s) {
  return STATUS_VALUES.includes(s);
}

function asString(v) {
  return typeof v === 'string' ? v : '';
}

/**
 * 创建审阅条目（不可变记录，内嵌 history）
 * @param {string} term
 * @param {{status?:string, note?:string, source?:string, translator?:string, createdAt?:number, timestamp?:number}} [opts]
 * @returns {object}
 */
function createReviewEntry(term, opts = {}) {
  if (typeof term !== 'string' || term.trim() === '') {
    throw new Error('审阅词条 term 不能为空');
  }
  const status = opts.status || STATUS.PENDING;
  if (!isValidStatus(status)) throw new Error('非法审阅状态: ' + status);
  const now = typeof opts.timestamp === 'number' ? opts.timestamp : Date.now();
  const note = asString(opts.note);
  return {
    term,
    status,
    note,
    source: asString(opts.source),
    translator: asString(opts.translator),
    createdAt: typeof opts.createdAt === 'number' ? opts.createdAt : now,
    updatedAt: now,
    history: [{ at: now, status, note, event: 'create' }],
  };
}

/**
 * 状态迁移：返回新条目（不可变），追加 history
 * @param {object} entry
 * @param {string} status
 * @param {{note?:string, timestamp?:number}} [opts]
 * @returns {object}
 */
function applyStatus(entry, status, opts = {}) {
  if (!entry || typeof entry !== 'object') throw new Error('entry 必须是审阅条目');
  if (!isValidStatus(status)) throw new Error('非法审阅状态: ' + status);
  const now = typeof opts.timestamp === 'number' ? opts.timestamp : Date.now();
  const note = asString(opts.note);
  const history = Array.isArray(entry.history) ? entry.history.slice() : [];
  history.push({ at: now, status, note, event: 'transition' });
  return { ...entry, status, note: note || entry.note, updatedAt: now, history };
}

/**
 * 批量合并审阅更新，返回新 map（不可变）
 * @param {Object<string,object>} reviewMap
 * @param {Array<{term:string, status:string, note?:string, source?:string}>} updates
 * @returns {Object<string,object>}
 */
function mergeReviewUpdates(reviewMap, updates) {
  const map = { ...(reviewMap || {}) };
  for (const u of updates || []) {
    if (!u || typeof u.term !== 'string' || u.term.trim() === '') continue;
    const existing = map[u.term];
    const next = existing
      ? applyStatus(existing, u.status, { note: u.note })
      : createReviewEntry(u.term, { status: u.status, note: u.note, source: u.source });
    if (u.source && !next.source) next.source = u.source;
    map[u.term] = next;
  }
  return map;
}

/**
 * 统计各状态数量
 * @param {Object<string,object>} reviewMap
 * @returns {{pending:number, translated:number, ignored:number, needs_review:number, total:number}}
 */
function summarize(reviewMap) {
  const counts = { pending: 0, translated: 0, ignored: 0, needs_review: 0, total: 0 };
  for (const e of Object.values(reviewMap || {})) {
    if (counts[e.status] !== undefined) counts[e.status] += 1;
    counts.total += 1;
  }
  return counts;
}

/** 序列化为 JSON 字符串（便于文件/存储持久化） */
function serialize(reviewMap) {
  return JSON.stringify(reviewMap || {}, null, 2);
}

/**
 * 反序列化并校验（非法条目跳过并计数）
 * @param {string} str
 * @returns {{reviewMap:Object<string,object>, stats:{skipped:number}}}
 */
function deserialize(str) {
  const obj = JSON.parse(str);
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error('审阅数据必须是对象');
  }
  const out = {};
  let skipped = 0;
  for (const [term, e] of Object.entries(obj)) {
    if (!e || typeof e.term !== 'string' || !isValidStatus(e.status)) {
      skipped += 1;
      continue;
    }
    out[term] = e;
  }
  return { reviewMap: out, stats: { skipped } };
}

module.exports = {
  STATUS,
  STATUS_VALUES,
  isValidStatus,
  createReviewEntry,
  applyStatus,
  mergeReviewUpdates,
  summarize,
  serialize,
  deserialize,
};
