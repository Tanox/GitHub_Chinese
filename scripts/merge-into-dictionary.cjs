/**
 * 一键合并入库（T20 数据层）
 * @file merge-into-dictionary.cjs
 * @version 1.11.12
 * @description 基于 review-store.cjs 的审阅结果，筛选「已翻译」词条生成词典 stub / diff 预览：
 *   约定审阅「已翻译」时译文存于 entry.note（审阅 UI 将译文输入写入备注），无译文则生成 `待翻译: 词条` 占位；
 *   IGNORED / NEEDS_REVIEW / PENDING 不入库。持久化应用由前端接线。
 */
'use strict';

const { STATUS } = require('./review-store.cjs');

const PLACEHOLDER_PREFIX = '待翻译: ';

/**
 * 筛选可入库词条（status=translated），返回 {term, translation, hadTranslation}
 * @param {Object<string,object>} reviewMap
 * @returns {Array<{term:string, translation:string, hadTranslation:boolean}>}
 */
function selectMergedEntries(reviewMap) {
  const out = [];
  for (const e of Object.values(reviewMap || {})) {
    if (e.status !== STATUS.TRANSLATED) continue; // 仅「已翻译」入库
    const note = typeof e.note === 'string' ? e.note.trim() : '';
    out.push({
      term: e.term,
      translation: note ? note : PLACEHOLDER_PREFIX + e.term,
      hadTranslation: note.length > 0,
    });
  }
  return out;
}

/**
 * 构建词典 diff 补丁（added / updated 分离，值相同跳过）
 * @param {Object<string,object>} reviewMap
 * @param {Object<string,string>} dictionary
 * @returns {{added:Object<string,string>, updated:Object<string,string>}}
 */
function buildDictionaryPatch(reviewMap, dictionary) {
  const patch = { added: {}, updated: {} };
  for (const { term, translation } of selectMergedEntries(reviewMap)) {
    if (Object.prototype.hasOwnProperty.call(dictionary, term)) {
      if (dictionary[term] !== translation) patch.updated[term] = translation;
      // 值相同 → 无变化，跳过
    } else {
      patch.added[term] = translation;
    }
  }
  return patch;
}

/**
 * 应用补丁到词典（不可变，返回新对象）
 * @param {Object<string,string>} dictionary
 * @param {{added?:Object, updated?:Object}} patch
 * @returns {Object<string,string>}
 */
function applyPatch(dictionary, patch) {
  const next = { ...(dictionary || {}) };
  for (const [k, v] of Object.entries(patch.added || {})) next[k] = v;
  for (const [k, v] of Object.entries(patch.updated || {})) next[k] = v;
  return next;
}

/**
 * 渲染 PR 式 diff 预览文本（供复制/下载）
 * @param {{added?:Object, updated?:Object}} patch
 * @returns {string}
 */
function renderDiffPreview(patch) {
  const lines = [];
  for (const [k, v] of Object.entries(patch.added || {})) lines.push(`+ "${k}": "${v}"`);
  for (const [k, v] of Object.entries(patch.updated || {})) lines.push(`~ "${k}": "${v}"`);
  return lines.length ? lines.join('\n') : '(无变更)';
}

module.exports = { selectMergedEntries, buildDictionaryPatch, applyPatch, renderDiffPreview, PLACEHOLDER_PREFIX };
