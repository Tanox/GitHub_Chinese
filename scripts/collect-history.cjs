/**
 * 采集历史记录
 * @file scripts/collect-history.cjs
 * @version 1.9.40
 * @description 将每次词典采集的统计追加到 `docs/collect-history.json`，供工作台展示采集趋势
 */
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const HISTORY_FILE = path.join(PROJECT_ROOT, 'docs', 'collect-history.json');
/** 最多保留的历史条数 */
const MAX_ENTRIES = 30;

/**
 * 读取采集历史（旧 → 新）
 * @returns {Array<{time: string, total: number, added: number, removed: number}>} 历史记录
 */
function readHistory() {
  try {
    const parsed = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
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
function appendHistory(entry) {
  const history = readHistory();
  history.push({ time: new Date().toISOString(), ...entry });
  fs.writeFileSync(
    HISTORY_FILE,
    `${JSON.stringify(history.slice(-MAX_ENTRIES), null, 2)}\n`,
    'utf-8',
  );
  return HISTORY_FILE;
}

module.exports = { readHistory, appendHistory, HISTORY_FILE };
