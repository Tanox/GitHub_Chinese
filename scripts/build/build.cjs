/**
 * 构建系统 - 用户脚本打包主流程
 * @file scripts/build/build.cjs
 * @version 1.13.15
 * @author Sut
 * @description 编排依赖解析、冲突检测、代码转换，生成可分发的用户脚本产物
 */

const fs = require('fs');
const path = require('path');
const { buildModuleGraph } = require('./moduleGraph.cjs');
const { transformModule, detectConflicts } = require('./transform.cjs');

const ROOT = path.join(__dirname, '..', '..');
const OUTPUT_DIR = path.join(ROOT, 'build');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'GitHub_zh-cn.user.js');

/** 构建入口文件（包含主脚本入口与开发工具加载入口） */
const ENTRY_POINTS = [
  'src/userscript/main/index.js',
  'src/utils/tools/index.js',
];

/**
 * 读取并获取当前统一版本号
 * @returns {string} 版本号字符串
 */
function getVersion() {
  const versionFile = path.join(ROOT, 'src', 'userscript', 'version.js');
  const content = fs.readFileSync(versionFile, 'utf-8');
  const matched = content.match(/VERSION\s*=\s*'([^']+)'/);
  return matched ? matched[1] : '1.13.15';
}

/**
 * 生成 UserScript 头部元数据
 * @param {string} version - 版本号
 * @returns {string} UserScript 元数据头
 */
function generateHeader(version) {
  return `// ==UserScript==
// @name         GitHub Chinese 简体中文
// @namespace    https://github.com/Tanox/GitHub_i18n
// @version      ${version}
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
}

/**
 * 执行完整的构建流程
 */
function build() {
  const version = getVersion();
  console.log(`[构建开始] 目标版本: ${version}`);

  const sortedFiles = buildModuleGraph(ENTRY_POINTS);
  console.log(`[依赖解析] 成功解析 ${sortedFiles.length} 个模块`);

  const modules = sortedFiles.map((file) => ({
    path: file,
    content: fs.readFileSync(path.join(ROOT, file), 'utf-8'),
  }));

  detectConflicts(modules);
  console.log('[冲突检测] 顶层标识符无重名冲突');

  const transformedPieces = modules.map((mod) =>
    transformModule(mod.content, mod.path)
  ).filter(Boolean);

  let bundle = generateHeader(version);
  bundle += transformedPieces.join('\n\n');
  bundle += '\n})();\n';

  // 统一换行符并折叠连续空行
  bundle = bundle.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, bundle, 'utf-8');
  const sizeKb = (Buffer.byteLength(bundle, 'utf-8') / 1024).toFixed(2);
  console.log(`[构建完成] 产物: ${OUTPUT_PATH} (${sizeKb} KB)`);
}

if (require.main === module) {
  build();
}

module.exports = { build };
