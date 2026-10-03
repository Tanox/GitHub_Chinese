/**
 * 构建系统 - 模块依赖图解析与拓扑排序
 * @file scripts/build/moduleGraph.cjs
 * @version 1.13.15
 * @author Sut
 * @description 从入口递归解析 ESM 模块依赖，执行拓扑排序并检测循环依赖
 */

const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

/** Next.js 独占目录，构建用户脚本时跳过 */
const NEXT_ONLY = new Set(['app', 'components', 'lib', 'hooks', 'server']);

/**
 * 解析模块导入路径
 * @param {string} fromFile - 当前文件路径
 * @param {string} specifier - 导入说明符
 * @returns {string|null} 解析后的相对路径
 */
function resolveModule(fromFile, specifier) {
  if (!specifier.startsWith('.')) return null;
  const dir = path.dirname(fromFile);
  const target = path.resolve(dir, specifier);
  const candidates = [
    target,
    target + '.js',
    target + '.cjs',
    path.join(target, 'index.js'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) {
      return path.relative(process.cwd(), c).replace(/\\/g, '/');
    }
  }
  return null;
}

/**
 * 获取模块的依赖列表
 * @param {string} filePath - 文件路径
 * @returns {string[]} 依赖路径列表
 */
function getModuleDependencies(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let ast;
  try {
    ast = babel.parseSync(content, { sourceType: 'module', filename: filePath });
  } catch (error) {
    throw new Error(`模块解析失败 [${filePath}]: ${error.message}`);
  }
  const deps = [];
  babel.traverse(ast, {
    ImportDeclaration(p) {
      const src = p.node.source.value;
      const res = resolveModule(filePath, src);
      if (res) deps.push(res);
    },
    ExportNamedDeclaration(p) {
      if (p.node.source) {
        const src = p.node.source.value;
        const res = resolveModule(filePath, src);
        if (res) deps.push(res);
      }
    },
    ExportAllDeclaration(p) {
      if (p.node.source) {
        const src = p.node.source.value;
        const res = resolveModule(filePath, src);
        if (res) deps.push(res);
      }
    },
  });
  return deps.filter((d) => {
    const parts = d.split('/');
    return !(parts[0] === 'src' && NEXT_ONLY.has(parts[1]));
  });
}

/**
 * 构建模块依赖图并返回拓扑排序结果
 * @param {string[]} entryPoints - 入口文件列表
 * @returns {string[]} 拓扑排序后的模块路径列表
 */
function buildModuleGraph(entryPoints) {
  const visited = new Set();
  const graph = new Map();

  function crawl(mod) {
    if (visited.has(mod)) return;
    visited.add(mod);
    const deps = getModuleDependencies(mod);
    graph.set(mod, deps);
    deps.forEach(crawl);
  }

  entryPoints.forEach(crawl);

  const sorted = [];
  const tempMark = new Set();
  const permMark = new Set();

  function visit(node) {
    if (permMark.has(node)) return;
    if (tempMark.has(node)) {
      console.warn(`[构建警告] 检测到循环依赖: ${node}`);
      return;
    }
    tempMark.add(node);
    const deps = graph.get(node) || [];
    deps.forEach(visit);
    tempMark.delete(node);
    permMark.add(node);
    sorted.push(node);
  }

  for (const node of visited) {
    visit(node);
  }

  return sorted;
}

module.exports = {
  resolveModule,
  getModuleDependencies,
  buildModuleGraph,
};
