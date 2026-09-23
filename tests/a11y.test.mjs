/**
 * 可访问性（a11y）自动化检查
 * @file tests/a11y.test.mjs
 * @version 1.9.40
 * @description 用 axe-core + jsdom 对 `next build` 的静态预渲染页面做走查，
 *   仅将 serious / critical 级违规视为失败；若未发现构建产物则跳过（CI 中先跑 build:web 即生效）。
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';
import axeCore from 'axe-core';

const APP_DIR = path.join(import.meta.dirname, '..', '.next', 'server', 'app');

/** 关键页面（与 sitemap 一致） */
const PAGES = ['index', 'overview', 'design'];

/** 视为阻断级的问题影响等级 */
const BLOCKING_IMPACTS = new Set(['serious', 'critical']);

/**
 * 对给定 HTML 运行 axe，返回阻断级违规
 * @param {string} html - 页面 HTML 字符串
 * @returns {Promise<Array<{id: string, impact: string, help: string}>>} 违规列表
 */
async function collectBlockingViolations(html) {
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true });
  dom.window.eval(axeCore.source);
  const results = await dom.window.axe.run(dom.window.document);
  // 注意：axe 返回的是 jsdom realm 的数组，须用 Array.from 转回本 realm，否则断言会因原型不同而失败
  return Array.from(results.violations)
    .filter((violation) => BLOCKING_IMPACTS.has(violation.impact))
    .map((violation) => ({ id: violation.id, impact: violation.impact, help: violation.help }));
}

for (const page of PAGES) {
  test(`a11y: ${page} 页面无 serious / critical 违规`, async (t) => {
    const file = path.join(APP_DIR, `${page}.html`);
    if (!fs.existsSync(file)) {
      t.skip('未找到 next 构建产物，请先执行 npm run build:web');
      return;
    }

    const violations = await collectBlockingViolations(fs.readFileSync(file, 'utf-8'));
    assert.equal(violations.length, 0, `存在阻断级违规：${JSON.stringify(violations, null, 2)}`);
  });
}
