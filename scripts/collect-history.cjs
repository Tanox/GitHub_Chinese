/**
 * 采集历史记录
 * @file scripts/collect-history.cjs
 * @version 1.13.34
 * @description 将每次词典采集的统计追加到 `data/collect-history.json`，供工作台展示采集趋势
 *   （T23 扩展：新增 `appendRound` 写入词条级 diff + snapshot，支持轮次对比与回滚）
 */
const fs = require('fs');
const path = require('path');
const { buildRoundRecord } = require('./history-diff.cjs');

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
  } catch (error) {
    // 损坏文件不能静默当空历史并覆盖：先保留 .bak 供人工恢复
    try {
      const target = filePath || HISTORY_FILE;
      if (fs.existsSync(target)) fs.copyFileSync(target, `${target}.corrupt.bak`);
      console.error(`[collect-history] 历史文件解析失败，已保留备份: ${target}.corrupt.bak`, error);
    } catch (backupError) {
      console.warn('[collect-history] 损坏文件备份失败:', backupError.message);
    }
    return [];
  }
}

/**
 * 原子写入：先写同目录临时文件再 rename，避免进程被杀时留下半截 JSON
 * @param {string} filePath - 目标路径
 * @param {Array} history - 完整历史数组
 */
function writeHistoryAtomically(filePath, history) {
  const target = filePath || HISTORY_FILE;
  const temp = `${target}.tmp-${process.pid}`;
  fs.writeFileSync(temp, `${JSON.stringify(history.slice(-MAX_ENTRIES), null, 2)}\n`, 'utf-8');
  fs.renameSync(temp, target);
}

/**
 * 追加一条采集记录（仅保留最近 MAX_ENTRIES 条）
 * @param {{total: number, added: number, removed: number}} entry - 本次采集统计
 * @returns {string} 写入的文件路径
 */
function appendHistory(entry, filePath) {
  const history = readHistory(filePath);
  history.push({ time: new Date().toISOString(), ...entry });
  writeHistoryAtomically(filePath, history);
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
  writeHistoryAtomically(filePath, history);
  return filePath || HISTORY_FILE;
}

module.exports = { readHistory, appendHistory, appendRound, HISTORY_FILE };
