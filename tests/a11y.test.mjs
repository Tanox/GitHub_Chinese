/**
 * 可访问性（a11y）自动化检查：静态预渲染产物
 * @file tests/a11y.test.mjs
 * @version 1.13.21
 * @description 用 axe-core + jsdom 对 `next build` 生成的静态 HTML 做走查，
 *   仅将 serious / critical 级违规视为失败。动态渲染页面由集成测试对真实服务检查。
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { collectBlockingViolations } from './helpers/axe-html.mjs';

const APP_DIR = path.join(import.meta.dirname, '..', '.next', 'server', 'app');

/** 实际产出的静态页面（Next 动态页不生成 .html，交由集成测试覆盖） */
const STATIC_HTML = fs.existsSync(APP_DIR)
  ? fs.readdirSync(APP_DIR).filter((file) => file.endsWith('.html') && !file.startsWith('_'))
  : [];

if (STATIC_HTML.length === 0) {
  test('a11y: 静态预渲染页面', (t) => {
    t.skip('未找到 next 构建产物，请先执行 npm run build:web');
  });
}

for (const file of STATIC_HTML) {
  test(`a11y: ${file} 无 serious / critical 违规`, async () => {
    const html = fs.readFileSync(path.join(APP_DIR, file), 'utf-8');
    const violations = await collectBlockingViolations(html);
    assert.equal(violations.length, 0, `存在阻断级违规：${JSON.stringify(violations, null, 2)}`);
  });
}
