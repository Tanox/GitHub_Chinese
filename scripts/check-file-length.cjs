/**
 * 代码文件行数门禁
 * @file scripts/check-file-length.cjs
 * @version 1.9.38
 * @description 扫描代码文件（src / scripts / tests），任何文件超过 200 行即失败；
 *   同时输出最大行数 TOP 5，便于随发版刷新「防回潮」基线。
 */
const fs = require('fs');
const path = require('path');

/** 单文件行数上限（项目硬约定） */
const MAX_LINES = 200;
/** 报告的最大文件数量 */
const TOP_COUNT = 5;
/** 扫描根目录 */
const ROOTS = ['src', 'scripts', 'tests'];
/** 计入行数的代码扩展名 */
const EXTENSIONS = new Set(['.js', '.cjs', '.mjs', '.ts', '.tsx']);
/** 跳过的目录 */
const IGNORED_DIRS = new Set(['node_modules', '.next', 'build', 'dist', 'coverage']);

/**
 * 递归收集代码文件及其行数
 * @param {string} dir - 目录路径
 * @param {Array<{file: string, lines: number}>} [acc] - 累积结果
 * @returns {Array<{file: string, lines: number}>} 结果列表
 */
function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, acc);
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      const content = fs.readFileSync(full, 'utf-8');
      acc.push({ file: full.split(path.sep).join('/'), lines: content.split('\n').length - 1 });
    }
  }
  return acc;
}

const all = ROOTS.filter((root) => fs.existsSync(root)).flatMap((root) => walk(root));
all.sort((a, b) => b.lines - a.lines);

console.log(`[行数门禁] 扫描 ${all.length} 个代码文件，上限 ${MAX_LINES} 行`);
for (const item of all.slice(0, TOP_COUNT)) {
  console.log(`  ${String(item.lines).padStart(4)} 行  ${item.file}`);
}

const violations = all.filter((item) => item.lines > MAX_LINES);
if (violations.length > 0) {
  console.error(`\n❌ 以下 ${violations.length} 个文件超过 ${MAX_LINES} 行，请按职责拆分：`);
  for (const violation of violations) {
    console.error(`  ${violation.lines} 行  ${violation.file}`);
  }
  process.exit(1);
}

console.log(`✅ 全部代码文件 ≤ ${MAX_LINES} 行`);
