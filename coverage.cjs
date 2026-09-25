/**
 * 覆盖率度量（T17 核心计算）
 * @file coverage.cjs
 * @version 1.11.9
 * @description 基于 collect-dict.cjs 的 findUntranslated 计算 UI 串翻译覆盖率：
 *   命中词典比例、按页面/路由分类统计、Top-N 低覆盖定位。工作台可视化展示留后续任务。
 */
const { findUntranslated, normalizeText } = require('./collect-dict.cjs');

/**
 * 判定某文本是否为「可翻译候选」（与 collect-dict.cjs findUntranslated 的过滤条件一致）：
 * 排除过短/过长、纯数字、纯标点、不含字母或中文的噪声，避免污染覆盖率分母。
 * @param {string} text
 * @returns {boolean}
 */
function isTranslatableCandidate(text) {
  const norm = normalizeText(text);
  if (norm.length < 2 || norm.length > 300) return false;
  if (/^\d+$/.test(norm)) return false;
  if (/^[\s\p{P}]+$/u.test(norm)) return false;
  if (/^[^a-zA-Z\u4e00-\u9fa5]+$/.test(norm)) return false;
  return true;
}

/**
 * 计算一组 UI 串相对词典的翻译覆盖率。
 * @param {Array<string | {text:string, page?:string}>} entries - UI 串（字符串或带页面标签的对象）
 * @param {Object<string,string>} dictionary - 词条→译文词典
 * @param {{topN?:number}} [options] - topN：Top-N 低覆盖/未命中条数（默认 10）
 * @returns {{total:number, covered:number, uncovered:number, rate:number,
 *   byPage:Object<string,{total:number,covered:number,rate:number,unmatched:string[]}>,
 *   lowCoveragePages:Array<{page:string,total:number,covered:number,rate:number}>,
 *   topUnmatched:Array<{term:string,count:number}>}}
 */
function computeCoverage(entries, dictionary, options = {}) {
  const topN = Number.isInteger(options.topN) && options.topN > 0 ? options.topN : 10;
  const byPage = new Map();
  const unmatchedFreq = new Map();
  let total = 0;
  let covered = 0;

  for (const entry of entries) {
    const text = typeof entry === 'string' ? entry : entry && entry.text;
    if (typeof text !== 'string' || !isTranslatableCandidate(text)) continue;
    const page = typeof entry === 'string' ? '(default)' : entry.page || '(default)';
    const { untranslated, translated } = findUntranslated([text], dictionary);
    const isCovered = translated.size > 0 && untranslated.length === 0;
    if (!byPage.has(page)) byPage.set(page, { total: 0, covered: 0, unmatched: [] });
    const stat = byPage.get(page);
    stat.total += 1;
    total += 1;
    if (isCovered) {
      stat.covered += 1;
      covered += 1;
    } else {
      // 未命中词条按小写归一聚合（与 findUntranslated 匹配用 key 一致，'Help'/'help' 视作同一条）
      const term = normalizeText(text).toLowerCase();
      stat.unmatched.push(term);
      unmatchedFreq.set(term, (unmatchedFreq.get(term) || 0) + 1);
    }
  }

  const rate = total > 0 ? covered / total : 0;
  const byPageOut = {};
  const lowCoveragePages = [];
  for (const [page, stat] of byPage) {
    const pageRate = stat.total > 0 ? stat.covered / stat.total : 0;
    byPageOut[page] = {
      total: stat.total,
      covered: stat.covered,
      rate: pageRate,
      unmatched: stat.unmatched,
    };
    lowCoveragePages.push({ page, total: stat.total, covered: stat.covered, rate: pageRate });
  }
  // 低覆盖页面升序（同率时按候选多者优先，便于定位大面缺口）
  lowCoveragePages.sort((a, b) => a.rate - b.rate || b.total - a.total);

  const topUnmatched = [...unmatchedFreq.entries()]
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
    .slice(0, topN);

  return { total, covered, uncovered: total - covered, rate, byPage: byPageOut, lowCoveragePages, topUnmatched };
}

module.exports = { computeCoverage, isTranslatableCandidate };
