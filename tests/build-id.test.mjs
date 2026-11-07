/**
 * 页脚版本与 build 编号规范测试
 * @file tests/build-id.test.mjs
 * @version 1.13.28
 * @description 覆盖 docs/coding-style.md §15：build 编号为 yymmddhhmm（10 位），
 *   应用与静态原型页脚均展示「V<版本>· build <编号>」。
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createBuildId, BUILD_ID_ENV_KEY } from '../src/lib/build-id.js';
import { VERSION } from '../src/userscript/version.js';

const BUILD_ID_RE = /^\d{10}$/;

test('createBuildId 生成 yymmddhhmm 10 位编号', () => {
  const id = createBuildId(new Date(2026, 10, 5, 12, 59));
  assert.equal(id, '2611051259');
  assert.match(id, BUILD_ID_RE);
});

test('createBuildId 月/日/时/分补零且年份取两位', () => {
  assert.equal(createBuildId(new Date(2026, 0, 2, 3, 4)), '2601020304');
  assert.equal(createBuildId(new Date(2031, 11, 31, 23, 59)), '3112312359');
});

test('构建注入环境变量名与 Next 配置一致', () => {
  assert.equal(BUILD_ID_ENV_KEY, 'NEXT_PUBLIC_BUILD_ID');
  const config = fs.readFileSync('next.config.mjs', 'utf8');
  assert.match(config, /createBuildId/);
  assert.doesNotMatch(config, /date\.getFullYear\(\),/);
});

test('应用页脚按 V<版本>· build <编号> 展示且带语义化 id', () => {
  const shell = fs.readFileSync('src/components/Shell.tsx', 'utf8');
  assert.match(shell, /id='site-footer'/);
  assert.match(shell, /id='site-footer-meta'/);
  assert.match(shell, /id='site-footer-version'/);
  assert.match(shell, /id='site-footer-build'/);
  assert.match(shell, /V\{VERSION\}·/);
  assert.match(shell, /createBuildId\(\)/);
});

test('三个静态原型页脚同步展示版本与 10 位 build 编号', () => {
  for (const [file, prefix] of [
    ['prototype/prototype.html', 'proto'],
    ['prototype/app.html', 'app'],
    ['prototype/wireframes.html', 'wf'],
  ]) {
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, new RegExp(`id="${prefix}-footer-version"`), `${file} 缺版本 id`);
    assert.match(html, new RegExp(`id="${prefix}-footer-build"`), `${file} 缺 build id`);
    assert.match(html, new RegExp(`V${VERSION.replaceAll('.', '\\.')}·`), `${file} 版本号未同步`);
    assert.match(html, /getFullYear\(\) % 100/, `${file} 未用两位年份`);
    assert.doesNotMatch(html, /更新日期：/, `${file} 仍展示更新日期`);
  }
});

test('规范文档明确 10 位格式与展示样式', () => {
  const doc = fs.readFileSync('docs/coding-style.md', 'utf8');
  assert.match(doc, /yymmddhhmm/);
  assert.match(doc, /V<语义版本>· build <10 位编号>/);
  assert.match(doc, /V1\.2\.3· build 2611051259/);
});
