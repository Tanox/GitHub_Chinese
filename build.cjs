/**
 * GitHub Chinese 简体中文构建脚本
 * @file build.cjs
 * @version 1.9.43
 * @date 2026-09-19
 * @author Sut
 * @description 从入口自动解析模块依赖并拼接为单文件用户脚本（依赖 scripts/build/ 下的图谱与转换模块）
 */

const fs = require('fs');
const path = require('path');

const { buildModuleOrder, listAllSources } = require('./scripts/build/moduleGraph.cjs');
const { assembleBundle, findConflicts, readModules } = require('./scripts/build/transform.cjs');

const PROJECT_ROOT = path.resolve(__dirname);
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const BUILD_DIR = path.join(PROJECT_ROOT, 'build');
const OUTPUT_FILE = path.join(BUILD_DIR, 'GitHub_zh-cn.user.js');
const ENTRY_FILE = path.join(SRC_DIR, 'main.js');

/** 未被入口引用、但需继续随用户脚本发布的模块 */
const EXTRA_ENTRIES = [path.join(SRC_DIR, 'utils', 'tools.js')];

const USER_SCRIPT_HEADER = `// ==UserScript==
// @name         GitHub Chinese 简体中文
// @namespace    https://github.com/Tanox/GitHub_i18n
// @version      {VERSION}
// @description  GitHub页面自动翻译为中文
// @author       Sut
// @match        https://github.com/*
// @match        https://docs.github.com/*
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @connect      raw.githubusercontent.com
// @connect      github.com
// @run-at       document-idle
// @noframes
// @updateURL    https://raw.githubusercontent.com/Tanox/GitHub_i18n/main/build/GitHub_zh-cn.user.js
// @downloadURL  https://raw.githubusercontent.com/Tanox/GitHub_i18n/main/build/GitHub_zh-cn.user.js
// @license      GPL-2.0
// @homepage     https://github.com/Tanox/GitHub_i18n
// ==/UserScript==

(function() {
'use strict';
`;

const USER_SCRIPT_FOOTER = `})();
`;

/**
 * 读取 src/version.js 中的版本号（项目单一版本源）
 * @returns {string} 版本号
 */
function readCurrentVersion() {
  const content = fs.readFileSync(path.join(SRC_DIR, 'version.js'), 'utf-8');
  const match = content.match(/export\s+const\s+VERSION\s*=\s*['"]([^'"]+)['"]/);
  return match ? match[1] : '0.0.0';
}

/**
 * 清理并重建构建目录
 * force: true 用于容忍「检查时存在、删除时已被移除」的竞态（如外部进程/文件系统延迟）
 */
function prepareBuildDir() {
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
  fs.mkdirSync(BUILD_DIR, { recursive: true });
}

/**
 * 收集模块并执行打包前校验
 * @returns {{files: string[], orphans: string[], cycles: string[][]}} 打包文件与诊断信息
 */
function resolveModules() {
  const order = [];
  const seen = new Set();
  const cycles = [];

  for (const entry of [ENTRY_FILE, ...EXTRA_ENTRIES]) {
    if (!fs.existsSync(entry)) {
      continue;
    }
    const graph = buildModuleOrder(entry, SRC_DIR);
    cycles.push(...graph.cycles);
    for (const file of graph.order) {
      if (!seen.has(file)) {
        seen.add(file);
        order.push(file);
      }
    }
  }

  const orphans = listAllSources(SRC_DIR, SRC_DIR).filter((file) => !seen.has(file));
  const modules = readModules(order);
  const conflicts = findConflicts(modules);
  if (conflicts.length > 0) {
    const detail = conflicts
      .map(
        ({ name, files }) =>
          `  - ${name}: ${files.map((f) => path.relative(PROJECT_ROOT, f)).join(', ')}`,
      )
      .join('\n');
    throw new Error(`检测到跨模块顶层重名声明，无法安全拼接：\n${detail}`);
  }

  return { files: order, orphans, cycles };
}

/**
 * 执行构建并写入用户脚本产物
 * @param {string} version - 版本号
 * @param {string[]} files - 模块文件列表（依赖在前）
 */
function writeUserScript(version, files) {
  const mergedCode = assembleBundle(readModules(files));
  const content =
    USER_SCRIPT_HEADER.replace('{VERSION}', version) + mergedCode + USER_SCRIPT_FOOTER;

  // 统一为 LF：源码在 Windows 上为 CRLF，产物需与仓库换行约定一致
  const normalized = content
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n');

  fs.writeFileSync(OUTPUT_FILE, normalized, 'utf-8');
}

/**
 * 构建入口
 * @returns {boolean} 构建是否成功
 */
function build() {
  console.log('\n========================================');
  console.log('  GitHub Chinese 简体中文构建');
  console.log('========================================\n');

  prepareBuildDir();
  console.log('✓ 清理完成');

  const version = readCurrentVersion();
  console.log(`📌 当前版本: ${version}`);

  const { files, orphans, cycles } = resolveModules();
  console.log(`🔗 入口模块: ${path.relative(PROJECT_ROOT, ENTRY_FILE)}`);
  console.log(`📦 已纳入模块: ${files.length} 个`);

  if (orphans.length > 0) {
    console.log(`⚠️  未被入口引用（不打包）: ${orphans.length} 个`);
    orphans.forEach((file) => console.log(`    · ${path.relative(PROJECT_ROOT, file)}`));
  }
  if (cycles.length > 0) {
    console.log(`⚠️  检测到循环引用: ${cycles.length} 处`);
    cycles.forEach((chain) =>
      console.log(`    · ${chain.map((f) => path.basename(f)).join(' → ')}`),
    );
  }

  console.log('🔨 开始构建...');
  writeUserScript(version, files);

  const fileSize = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2);

  console.log('\n========================================');
  console.log('  🎉 构建完成!');
  console.log(`  📦 构建产物: ${OUTPUT_FILE}`);
  console.log(`  📊 文件大小: ${fileSize} KB`);
  console.log('========================================\n');

  return true;
}

if (require.main === module) {
  try {
    build();
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
  }
}

module.exports = { build, readCurrentVersion };
