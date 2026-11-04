/**
 * 用户脚本模块依赖图
 * @file scripts/build/moduleGraph.cjs
 * @version 1.9.24
 * @author Sut
 * @description 从入口递归解析相对 import，产出拓扑序模块列表，替代易与源码脱节的手工文件清单
 */

const fs = require('fs');
const path = require('path');

/** 仅属于 Next.js 采集工作台 / Node 服务端的目录，不参与用户脚本打包 */
const NEXT_ONLY_SEGMENTS = ['app', 'components', 'lib', 'hooks', 'server'];

/**
 * 判断文件是否应排除（Next.js 工作台或非 .js 源码）
 * @param {string} absPath - 文件绝对路径
 * @param {string} srcDir - src 目录绝对路径
 * @returns {boolean} 是否排除
 */
function isExcluded(absPath, srcDir) {
  if (!absPath.endsWith('.js')) {
    return true;
  }
  const rel = path.relative(srcDir, absPath).split(path.sep);
  return rel.length > 1 && NEXT_ONLY_SEGMENTS.includes(rel[0]);
}

/** 模块语句起始行：import / export {..} / export * */
const MODULE_STATEMENT_RE = /^\s*(?:import|export\s*(?:\{|\*))/;

/**
 * 判断模块语句是否已结束
 * @param {string} statement - 已累积的语句文本
 * @returns {boolean} 是否结束
 */
function isStatementComplete(statement) {
  return /;\s*$/.test(statement) || /['"][^'"]+['"]\s*;?\s*$/.test(statement);
}

/**
 * 读取文件的模块依赖说明符（支持多行 import/export、副作用 import 与再导出）
 * @param {string} filePath - 文件绝对路径
 * @returns {string[]} 依赖说明符列表
 */
function readImportSpecs(filePath) {
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  const specs = [];

  for (let i = 0; i < lines.length; i++) {
    if (!MODULE_STATEMENT_RE.test(lines[i])) {
      continue;
    }

    let statement = lines[i];
    let end = i;
    while (!isStatementComplete(statement) && end + 1 < lines.length) {
      end++;
      statement += ` ${lines[end].trim()}`;
    }
    i = end;

    const match =
      statement.match(/from\s*['"]([^'"]+)['"]/) || statement.match(/import\s*['"]([^'"]+)['"]/);
    if (match) {
      specs.push(match[1]);
    }
  }

  return specs;
}

/**
 * 将相对导入说明符解析为磁盘文件
 * @param {string} fromFile - 发起导入的文件绝对路径
 * @param {string} spec - 导入说明符
 * @returns {string|null} 解析到的文件绝对路径，非相对导入返回 null
 */
function resolveSpec(fromFile, spec) {
  if (!spec.startsWith('.')) {
    return null;
  }

  const base = path.resolve(path.dirname(fromFile), spec);
  const candidates = [base, `${base}.js`, path.join(base, 'index.js')];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null;
}

/**
 * 构建模块依赖图拓扑序（依赖先于使用者，循环引用仅保留首次进入顺序）
 * @param {string} entryFile - 入口文件绝对路径
 * @param {string} srcDir - src 目录绝对路径
 * @returns {{order: string[], cycles: string[][]}} 拓扑序与检测到的循环链
 */
function buildModuleOrder(entryFile, srcDir) {
  const order = [];
  const visited = new Set();
  const cycles = [];

  function visit(file, stack) {
    if (visited.has(file)) {
      return;
    }
    if (stack.includes(file)) {
      cycles.push([...stack.slice(stack.indexOf(file)), file]);
      return;
    }

    stack.push(file);
    for (const spec of readImportSpecs(file)) {
      const dep = resolveSpec(file, spec);
      if (dep && !isExcluded(dep, srcDir)) {
        visit(dep, stack);
      }
    }
    stack.pop();

    visited.add(file);
    order.push(file);
  }

  visit(entryFile, []);
  return { order, cycles };
}

/**
 * 递归收集 src 下全部可打包源码，用于识别未被入口引用的孤立模块
 * @param {string} dir - 起始目录绝对路径
 * @param {string} srcDir - src 目录绝对路径
 * @param {string[]} [acc] - 累积结果
 * @param {boolean} [isRoot] - 是否为 src 根层
 * @returns {string[]} 全部源码文件绝对路径
 */
function listAllSources(dir, srcDir, acc = [], isRoot = true) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (isRoot && NEXT_ONLY_SEGMENTS.includes(entry.name)) {
        continue;
      }
      listAllSources(full, srcDir, acc, false);
    } else if (!isExcluded(full, srcDir)) {
      acc.push(full);
    }
  }
  return acc;
}

/**
 * 收集文件的顶层声明名，用于打包前的重名冲突检测
 * @param {string} content - 文件内容
 * @returns {string[]} 顶层声明的标识符
 */
function collectTopLevelNames(content) {
  const declRe = /^(?:export\s+)?(?:async\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/;
  const names = [];

  for (const line of content.split('\n')) {
    if (!line || /^\s/.test(line)) {
      continue;
    }
    const match = line.match(declRe);
    if (match) {
      names.push(match[1]);
    }
  }

  return names;
}

module.exports = {
  NEXT_ONLY_SEGMENTS,
  isExcluded,
  readImportSpecs,
  resolveSpec,
  buildModuleOrder,
  listAllSources,
  collectTopLevelNames,
};
