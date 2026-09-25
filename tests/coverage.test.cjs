/**
 * 覆盖率度量测试
 * @file tests/coverage.test.cjs
 * @version 1.11.9
 * @description 校验 computeCoverage 的覆盖率、按页面分类、Top-N 低覆盖定位与噪声过滤
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { computeCoverage, isTranslatableCandidate } = require('../coverage.cjs');

test('isTranslatableCandidate 过滤噪声（与 findUntranslated 一致）', () => {
  assert.equal(isTranslatableCandidate('a'), false); // 过短
  assert.equal(isTranslatableCandidate('123'), false); // 纯数字
  assert.equal(isTranslatableCandidate('!!!'), false); // 纯标点
  assert.equal(isTranslatableCandidate('Sign in'), true);
  assert.equal(isTranslatableCandidate('新建 issue'), true);
});

test('computeCoverage 基本覆盖率与命中', () => {
  const dict = { 'Sign in': '登录', 'New issue': '新建 issue' };
  const entries = ['Sign in', 'New issue', 'Unknown term', '123'];
  const r = computeCoverage(entries, dict);
  assert.equal(r.total, 3); // '123' 被排除，不污染分母
  assert.equal(r.covered, 2);
  assert.equal(r.uncovered, 1);
  assert.ok(Math.abs(r.rate - 2 / 3) < 1e-9);
});

test('computeCoverage 按页面分类与 Top-N 低覆盖定位', () => {
  const dict = { login: '登录', issue: '议题' };
  const entries = [
    { text: 'login', page: 'nav' },
    { text: 'issue', page: 'nav' },
    { text: 'Help', page: 'repo' },
    { text: 'Help', page: 'repo' },
    { text: 'Settings', page: 'repo' },
  ];
  const r = computeCoverage(entries, dict, { topN: 5 });
  assert.equal(r.byPage.nav.total, 2);
  assert.equal(r.byPage.nav.covered, 2);
  assert.equal(r.byPage.repo.total, 3);
  assert.equal(r.byPage.repo.covered, 0);
  // 低覆盖页面升序：repo(0) 在 nav(1) 前
  assert.equal(r.lowCoveragePages[0].page, 'repo');
  assert.equal(r.lowCoveragePages[0].rate, 0);
  assert.equal(r.lowCoveragePages[1].page, 'nav');
  assert.equal(r.lowCoveragePages[1].rate, 1);
  // Top-N 未命中：'help' 出现 2 次 > 'settings' 1 次
  assert.equal(r.topUnmatched[0].term, 'help');
  assert.equal(r.topUnmatched[0].count, 2);
  assert.equal(r.topUnmatched[1].term, 'settings');
});

test('computeCoverage 占位符串按去占位符索引命中（T16 复用）', () => {
  const dict = { Delete: '删除' };
  const r = computeCoverage(['Delete %s?'], dict);
  assert.equal(r.covered, 1); // 含 %s 的已翻译串计入命中
  assert.equal(r.total, 1);
});

test('computeCoverage 空输入安全返回', () => {
  const r = computeCoverage([], {});
  assert.equal(r.total, 0);
  assert.equal(r.covered, 0);
  assert.equal(r.rate, 0);
  assert.deepEqual(r.byPage, {});
  assert.deepEqual(r.lowCoveragePages, []);
  assert.deepEqual(r.topUnmatched, []);
});
