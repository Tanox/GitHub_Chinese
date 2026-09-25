/**
 * 搜索与批量操作（T25 数据层）
 * @file term-operations.cjs
 * @version 1.11.13
 * @description 工作台词条搜索/筛选与批量标记：searchDictionary 关键词命中 term/translation，
 *   filterUntranslated 筛出 `待翻译: ` 占位条目，batchApplyStatus 复用 review-store 批量标记状态；
 *   批量导出由 io-dictionary（T24）提供。UI（搜索框/勾选/导出按钮）留前端接入。
 */
'use strict';

const { mergeReviewUpdates } = require('./review-store.cjs');

const UNTRANSLATED_PREFIX = '待翻译: ';

/**
 * 关键词搜索词典（term 或 translation 包含匹配）
 * @param {Object<string,string>} dictionary
 * @param {string} query
 * @param {{caseSensitive?:boolean}} [opts]
 * @returns {Array<{term:string, translation:string}>}
 */
function searchDictionary(dictionary, query, opts = {}) {
  const q = typeof query === 'string' ? query : '';
  if (q.trim() === '') {
    return Object.entries(dictionary || {}).map(([term, translation]) => ({ term, translation }));
  }
  const match = (s) => (opts.caseSensitive ? s.includes(q) : s.toLowerCase().includes(q.toLowerCase()));
  const out = [];
  for (const [term, translation] of Object.entries(dictionary || {})) {
    if (match(term) || match(translation)) out.push({ term, translation });
  }
  return out;
}

/**
 * 筛选出待翻译占位条目（translation 以 `待翻译: ` 开头）
 * @param {Object<string,string>} dictionary
 * @returns {Array<{term:string, translation:string, pending:string}>}
 */
function filterUntranslated(dictionary) {
  const out = [];
  for (const [term, translation] of Object.entries(dictionary || {})) {
    if (typeof translation === 'string' && translation.startsWith(UNTRANSLATED_PREFIX)) {
      out.push({ term, translation, pending: translation.slice(UNTRANSLATED_PREFIX.length) });
    }
  }
  return out;
}

/**
 * 批量标记审阅状态（不可变，复用 review-store.mergeReviewUpdates）
 * @param {Object<string,object>} reviewMap
 * @param {Array<string>} terms
 * @param {string} status
 * @param {{note?:string, source?:string}} [opts]
 * @returns {Object<string,object>}
 */
function batchApplyStatus(reviewMap, terms, status, opts = {}) {
  if (!Array.isArray(terms) || terms.length === 0) return { ...(reviewMap || {}) };
  const updates = terms.map((term) => ({ term, status, note: opts.note, source: opts.source }));
  return mergeReviewUpdates(reviewMap, updates);
}

module.exports = { searchDictionary, filterUntranslated, batchApplyStatus, UNTRANSLATED_PREFIX };
