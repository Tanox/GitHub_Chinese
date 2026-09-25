/**
 * 词典采集报告
 * @file scripts/dict-report.cjs
 * @version 1.11.15
 * @description 生成待翻译报告（含历史增量对比），并把本次统计写入采集历史
 */
const fs = require('fs');
const path = require('path');
const { appendRound, readHistory } = require('./collect-history.cjs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const REPORT_PATH = path.join(PROJECT_ROOT, 'docs', 'untranslated-terms.txt');

/**
 * 计算与历史报告的增量对比
 * @param {Set<string>} oldSet - 上一轮待翻译词条集合
 * @param {Set<string>} newSet - 本轮待翻译词条集合
 * @returns {{added: string[], removed: string[], net: number}} 增量结果
 */
function computeDelta(oldSet, newSet) {
  const added = [...newSet].filter((t) => !oldSet.has(t));
  const removed = [...oldSet].filter((t) => !newSet.has(t));
  return { added, removed, net: newSet.size - oldSet.size };
}

/**
 * 读取上一次的待翻译报告（不存在时返回空集合）
 * @returns {Set<string>} 历史词条集合
 */
function readPreviousSet() {
  if (!fs.existsSync(REPORT_PATH)) {
    return new Set();
  }
  return new Set(
    fs
      .readFileSync(REPORT_PATH, 'utf-8')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
  );
}

/**
 * 生成待翻译报告（含与历史报告的增量对比），并写入词条级采集历史
 * @param {string[]} untranslated - 待翻译词条列表
 * @param {{dictionary?:Object<string,string>, coverage?:object, reportFile?:string, historyFile?:string}} [opts]
 *   - dictionary：合并后的完整词典（用于写词条级历史快照，支持 T23 轮次对比/回滚）
 *   - coverage：`analyzeTexts` 计算的覆盖率（T17 数据层消费者，可选输出）
 *   - reportFile / historyFile：可选路径注入（默认 docs/ 下固定文件），便于单测隔离
 * @returns {{total:number, added:number, removed:number, coverage?:object}} 本次采集统计
 */
function generateReport(untranslated, opts = {}) {
  const dictionary = opts.dictionary || {};
  const coverage = opts.coverage;
  const reportFile = opts.reportFile || REPORT_PATH;
  const historyFile = opts.historyFile;

  const unique = [...new Set(untranslated)].sort();
  const oldSet = readPreviousSet();
  const newSet = new Set(unique);
  const { added, removed, net } = computeDelta(oldSet, newSet);

  console.log('\n========================================');
  console.log('  GitHub 中文翻译 - 词典采集报告');
  console.log('========================================\n');
  console.log(`📊 发现 ${unique.length} 个待翻译词条\n`);

  if (unique.length > 0) {
    console.log(
      `待翻译词条列表（前 50）：\n${unique
        .slice(0, 50)
        .map((t, i) => `${i + 1}. "${t}"`)
        .join('\n')}`,
    );
    if (unique.length > 50) console.log(`... 还有 ${unique.length - 50} 个词条\n`);
    console.log('💡 将上述词条按 \'"词条": "待翻译: 词条"\' 形式加入词典文件即可生效\n');
  }

  console.log('📈 增量统计（对比历史 docs/untranslated-terms.txt）：');
  console.log(
    `   新增 ${added.length} / 移除 ${removed.length} / 净增 ${net >= 0 ? '+' : ''}${net}（历史 ${oldSet.size} → 当前 ${newSet.size}）`,
  );
  if (added.length > 0) {
    console.log(
      `   新增词条：${added
        .slice(0, 10)
        .map((t) => `"${t}"`)
        .join('、')}${added.length > 10 ? ' …' : ''}`,
    );
  }

  fs.writeFileSync(reportFile, unique.map((text) => `"${text}"`).join('\n'), 'utf-8');
  console.log(`✅ 报告已保存到: ${reportFile}\n`);

  // 覆盖率（T17 数据层消费者）
  if (coverage) {
    console.log('🎯 翻译覆盖率（T17 数据层）：');
    console.log(
      `   候选 ${coverage.total} / 覆盖 ${coverage.covered} / 覆盖率为 ${(coverage.rate * 100).toFixed(1)}%`,
    );
    if (coverage.topUnmatched.length) {
      console.log(
        `   Top 未命中：${coverage.topUnmatched
          .slice(0, 5)
          .map((u) => `"${u.term}"(${u.count})`)
          .join('、')}`,
      );
    }
  }

  // 词条级采集历史（T23 数据层消费者：采集流程接入，含快照以支持回滚）
  const history = readHistory(historyFile);
  const prevDictionary = history.length ? history[history.length - 1].snapshot || {} : {};
  const written = appendRound(dictionary, prevDictionary, { includeSnapshot: true }, historyFile);
  console.log(`🗂️  词条级采集历史已更新: ${written}\n`);

  const stats = { total: newSet.size, added: added.length, removed: removed.length };
  return { ...stats, coverage };
}

module.exports = { computeDelta, readPreviousSet, generateReport, REPORT_PATH };
