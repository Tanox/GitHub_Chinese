/**
 * 构建系统 - 模块代码转换与作用域冲突检测
 * @file scripts/build/transform.cjs
 * @version 1.13.15
 * @author Sut
 * @description 将 ESM 模块转换为单作用域 IIFE 代码，并检测跨模块顶层标识符冲突
 */

const babel = require('@babel/core');

/**
 * 转换模块代码：移除 import/export 语句，保留主体声明
 * @param {string} content - 源码内容
 * @param {string} filePath - 文件路径
 * @returns {string} 转换后的代码
 */
function transformModule(content, filePath) {
  let ast;
  try {
    ast = babel.parseSync(content, { sourceType: 'module', filename: filePath });
  } catch (error) {
    throw new Error(`代码解析失败 [${filePath}]: ${error.message}`);
  }

  const edits = [];
  ast.program.body.forEach((node) => {
    if (node.type === 'ImportDeclaration') {
      edits.push({ start: node.start, end: node.end, text: '' });
    } else if (node.type === 'ExportNamedDeclaration') {
      if (node.declaration) {
        edits.push({ start: node.start, end: node.declaration.start, text: '' });
      } else {
        edits.push({ start: node.start, end: node.end, text: '' });
      }
    } else if (node.type === 'ExportDefaultDeclaration') {
      if (
        node.declaration.type === 'FunctionDeclaration' ||
        node.declaration.type === 'ClassDeclaration'
      ) {
        edits.push({ start: node.start, end: node.declaration.start, text: '' });
      } else {
        edits.push({ start: node.start, end: node.end, text: '' });
      }
    } else if (node.type === 'ExportAllDeclaration') {
      edits.push({ start: node.start, end: node.end, text: '' });
    }
  });

  edits.sort((a, b) => b.start - a.start);
  let result = content;
  edits.forEach((e) => {
    result = result.slice(0, e.start) + e.text + result.slice(e.end);
  });

  return result.trim();
}

/**
 * 提取模块顶层声明标识符
 * @param {string} content - 源码内容
 * @param {string} filePath - 文件路径
 * @returns {string[]} 顶层声明的变量/函数/类名列表
 */
function extractTopLevelDeclarations(content, filePath) {
  const ast = babel.parseSync(content, { sourceType: 'module', filename: filePath });
  const names = [];

  function addDecl(decl) {
    if (decl.id && decl.id.name) names.push(decl.id.name);
  }

  ast.program.body.forEach((node) => {
    if (node.type === 'VariableDeclaration') {
      node.declarations.forEach((d) => {
        if (d.id && d.id.name) names.push(d.id.name);
      });
    } else if (
      node.type === 'FunctionDeclaration' ||
      node.type === 'ClassDeclaration'
    ) {
      addDecl(node);
    } else if (node.type === 'ExportNamedDeclaration' && node.declaration) {
      const d = node.declaration;
      if (d.declarations) {
        d.declarations.forEach((dec) => {
          if (dec.id && dec.id.name) names.push(dec.id.name);
        });
      } else {
        addDecl(d);
      }
    }
  });

  return names;
}

/**
 * 检测跨模块顶层标识符冲突
 * @param {Array<{path: string, content: string}>} modules - 模块列表
 * @throws {Error} 存在命名冲突时抛出异常
 */
function detectConflicts(modules) {
  const registry = new Map();
  const conflicts = [];

  for (const mod of modules) {
    const decls = extractTopLevelDeclarations(mod.content, mod.path);
    for (const name of decls) {
      if (registry.has(name)) {
        conflicts.push(`标识符 "${name}" 在 [${registry.get(name)}] 与 [${mod.path}] 重复定义`);
      } else {
        registry.set(name, mod.path);
      }
    }
  }

  if (conflicts.length > 0) {
    throw new Error(`跨模块顶层标识符冲突:\n  - ${conflicts.join('\n  - ')}`);
  }
}

module.exports = {
  transformModule,
  extractTopLevelDeclarations,
  detectConflicts,
};
