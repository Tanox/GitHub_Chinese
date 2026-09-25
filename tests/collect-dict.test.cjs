/**
 * 采集工具集成测试（参考原型重构）
 * @file tests/collect-dict.test.cjs
 * @version 1.11.15
 * @description 校验 collect-dict.cjs 的 analyzeTexts（findUntranslated + 覆盖率）与
 *   dict-report.cjs 的 generateReport（写报告 + 词条级采集历史），路径注入避免污染仓库。
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const fs = require('fs');

const { analyzeTexts, generateReport } = require('../collect-dict.cjs');

const DICT = { Sign: '登录', Issue: '议题', 'New issue': '新建议题' };

test('analyzeTexts 计算未翻译与覆盖率', () => {
  const r = analyzeTexts(['Sign', 'Issue', 'Unknown term'], DICT);
  assert.equal(r.translated.size, 2);
  assert.deepEqual(r.untranslated, ['Unknown term']);
  assert.equal(r.coverage.total, 3);
  assert.equal(r.coverage.covered, 2);
  assert.ok(Math.abs(r.coverage.rate - 2 / 3) < 1e-9);
});

test('analyzeTexts 过滤噪声不污染覆盖率分母', () => {
  const r = analyzeTexts(['123', '!!!', 'Sign'], DICT);
  // 纯数字/纯标点被 findUntranslated 跳过：候选仅 Sign
  assert.equal(r.coverage.total, 1);
  assert.equal(r.coverage.covered, 1);
  assert.deepEqual(r.untranslated, []);
});

test('generateReport 写报告 + 词条级历史（注入路径，可轮次对比）', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gh-i18n-ct-'));
  const reportFile = path.join(tmp, 'untranslated-terms.txt');
  const historyFile = path.join(tmp, 'collect-history.json');

  const dict1 = { Sign: '登录', Dashboard: '仪表盘' };
  const r1 = analyzeTexts(['Sign', 'Dashboard', 'Unknown'], dict1);
  const stats1 = generateReport(r1.untranslated, {
    dictionary: dict1,
    coverage: r1.coverage,
    reportFile,
    historyFile,
  });
  assert.equal(stats1.total, 1); // 仅 Unknown 待翻译
  assert.ok(fs.existsSync(reportFile));

  const hist1 = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
  assert.equal(hist1.length, 1);
  assert.equal(hist1[0].diff.added.length, 2); // 首轮 prev={} → 全量新增
  assert.ok(hist1[0].snapshot && hist1[0].snapshot.Sign === '登录');

  // 第二轮：新增 Profile，验证基于上一轮快照的 diff
  const dict2 = { Sign: '登录', Dashboard: '仪表盘', Profile: '个人资料' };
  const r2 = analyzeTexts(['Sign', 'Dashboard', 'Profile', 'Unknown'], dict2);
  generateReport(r2.untranslated, {
    dictionary: dict2,
    coverage: r2.coverage,
    reportFile,
    historyFile,
  });

  const hist2 = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
  assert.equal(hist2.length, 2);
  assert.equal(hist2[1].diff.added.length, 1);
  assert.equal(hist2[1].diff.added[0].term, 'Profile');
  assert.equal(hist2[1].diff.removed.length, 0);
});
