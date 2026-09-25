/**
 * 采集历史记录
 * @file scripts/collect-history.cjs
 * @version 1.11.14
 * @description 将每次词典采集的统计追加到 `docs/collect-history.json`，供工作台展示采集趋势
 *   （T23 扩展：新增 `appendRound` 写入词条级 diff + snapshot，支持轮次对比与回滚）
 */
const fs = require('fs');
const path = require('path');
const { buildRoundRecord } = require('../history-diff.cjs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const HISTORY_FILE = path.join(PROJECT_ROOT, 'docs', 'collect-history.json');
/** 最多保留的历史条数 */
const MAX_ENTRIES = 30;

/**
 * 读取采集历史（旧 → 新）
 * @returns {Array<{time: string, total: number, added: number, removed: number}>} 历史记录
 */
function readHistory(filePath) {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath || HISTORY_FILE, 'utf-8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * 追加一条采集记录（仅保留最近 MAX_ENTRIES 条）
 * @param {{total: number, added: number, removed: number}} entry - 本次采集统计
 * @returns {string} 写入的文件路径
 */
function appendHistory(entry, filePath) {
  const history = readHistory(filePath);
  history.push({ time: new Date().toISOString(), ...entry });
  fs.writeFileSync(
    filePath || HISTORY_FILE,
    `${JSON.stringify(history.slice(-MAX_ENTRIES), null, 2)}\n`,
    'utf-8',
  );
  return filePath || HISTORY_FILE;
}

/**
 * 追加一条词条级轮次记录（含 diff，默认含 snapshot 以支持回滚）
 * @param {Object<string,string>} dictionary 本轮词典
 * @param {Object<string,string>} [prevDictionary] 上一轮词典
 * @param {{includeSnapshot?:boolean}} [opts]
 * @returns {string} 写入的文件路径
 */
function appendRound(dictionary, prevDictionary, opts = {}, filePath) {
  const history = readHistory(filePath);
  history.push(
    buildRoundRecord(dictionary, prevDictionary, { includeSnapshot: opts.includeSnapshot }),
  );
  fs.writeFileSync(
    filePath || HISTORY_FILE,
    `${JSON.stringify(history.slice(-MAX_ENTRIES), null, 2)}\n`,
    'utf-8',
  );
  return filePath || HISTORY_FILE;
}

module.exports = { readHistory, appendHistory, appendRound, HISTORY_FILE };
