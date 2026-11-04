/**
 * 用户脚本模块语法转换
 * @file scripts/build/transform.cjs
 * @version 1.9.24
 * @author Sut
 * @description 将 ESM 模块改写为同作用域顺序拼接所需的代码，并做重名冲突检测
 */

const fs = require('fs');
const { collectTopLevelNames } = require('./moduleGraph.cjs');

/**
 * 判断一行是否结束了 import / export 语句块
 * @param {string} line - 源码行
 * @returns {boolean} 是否为语句块结尾
 */
function endsStatement(line) {
  return /['"][^'"]+['"]\s*;?\s*$/.test(line) || /;\s*$/.test(line);
}

/**
 * 剥离单个模块的 import / export 语法，使其可与其他模块共享同一作用域
 * @param {string} content - 模块源码
 * @returns {string} 改写后的源码
 */
function stripModuleSyntax(content) {
  const output = [];
  let inImport = false;
  let inExportBlock = false;

  for (const rawLine of content.split('\n')) {
    if (inImport) {
      inImport = !endsStatement(rawLine);
      continue;
    }

    if (inExportBlock) {
      if (/^\s*\}\s*;?\s*$/.test(rawLine)) {
        inExportBlock = false;
      }
      continue;
    }

    if (/^\s*import\b/.test(rawLine)) {
      inImport = !endsStatement(rawLine);
      continue;
    }

    if (/^\s*export\s*\{/.test(rawLine)) {
      inExportBlock = !/^\s*export\s*\{[^}]*\}\s*;?\s*$/.test(rawLine);
      continue;
    }

    output.push(
      rawLine
        .replace(/^(\s*)export\s+default\s+([A-Za-z_$][\w$]*)\s*;?\s*$/, '$1$2;')
        .replace(/^(\s*)export\s+default\s+/, '$1')
        .replace(/^(\s*)export\s+/, '$1'),
    );
  }

  return output.join('\n');
}

/**
 * 检测各模块顶层声明的重名冲突
 * @param {Array<{file: string, content: string}>} modules - 模块列表
 * @returns {Array<{name: string, files: string[]}>} 冲突清单
 */
function findConflicts(modules) {
  const owners = new Map();

  for (const { file, content } of modules) {
    for (const name of collectTopLevelNames(content)) {
      if (!owners.has(name)) {
        owners.set(name, []);
      }
      owners.get(name).push(file);
    }
  }

  return [...owners.entries()]
    .filter(([, files]) => files.length > 1)
    .map(([name, files]) => ({ name, files }));
}

/**
 * 按拓扑序拼接全部模块
 * @param {Array<{file: string, content: string}>} modules - 模块列表（依赖在前）
 * @returns {string} 拼接后的源码
 */
function assembleBundle(modules) {
  return modules
    .map(({ content }) => stripModuleSyntax(content).trim())
    .filter(Boolean)
    .join('\n\n');
}

/**
 * 读取模块源码列表
 * @param {string[]} files - 模块文件绝对路径（依赖在前）
 * @returns {Array<{file: string, content: string}>} 模块内容列表
 */
function readModules(files) {
  return files.map((file) => ({ file, content: fs.readFileSync(file, 'utf-8') }));
}

module.exports = { stripModuleSyntax, findConflicts, assembleBundle, readModules };
