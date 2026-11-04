/**
 * a11y 断言辅助：在 jsdom 中对 HTML 运行 axe-core
 * @file tests/helpers/axe-html.mjs
 * @version 1.13.21
 * @description 单元测试（静态预渲染产物）与集成测试（真实服务响应）共用
 */
import { JSDOM } from 'jsdom';
import axeCore from 'axe-core';

/** 视为阻断级的问题影响等级 */
const BLOCKING_IMPACTS = new Set(['serious', 'critical']);

/**
 * 对给定 HTML 运行 axe，返回阻断级违规
 * @param {string} html - 页面 HTML 字符串
 * @returns {Promise<Array<{id: string, impact: string, help: string}>>} 违规列表
 */
export async function collectBlockingViolations(html) {
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true });
  dom.window.eval(axeCore.source);
  const results = await dom.window.axe.run(dom.window.document);
  // axe 返回 jsdom realm 的数组，须转回本 realm，否则断言会因原型不同失败
  return Array.from(results.violations)
    .filter((violation) => BLOCKING_IMPACTS.has(violation.impact))
    .map((violation) => ({ id: violation.id, impact: violation.impact, help: violation.help }));
}
