/**
 * 1) 对迁入 src/userscript/ 的文件，把指向共享根模块(utils/dictionaries)的相对引用
 *    重置为正确深度：ups = (文件目录相对 userscript 的段数) + 1。幂等、正确。
 * 2) 解析校验 src/ 下所有相对 import/require 是否能在磁盘解析，报告缺失。
 */
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const USERSCRIPT = path.join(ROOT, 'src', 'userscript');

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
}

const EXT = ['.js', '.ts', '.tsx', '.d.ts', '.mjs', '.cjs'];

// ---- 1) 修正共享根引用 ----
function fixSpec(relDir, spec) {
  let s = spec;
  // 去掉所有前导 ./
  while (s.startsWith('./')) s = s.slice(2);
  // 去掉前导 ../
  while (s.startsWith('../')) s = s.slice(3);
  if (!/^(utils|dictionaries)(\/|$)/.test(s)) return null; // 非共享根，不处理
  const segs = relDir === '' ? 0 : relDir.split(path.sep).length;
  const ups = segs + 1;
  return '../'.repeat(ups) + s;
}

function fixFile(file) {
  const relDir = path.relative(USERSCRIPT, path.dirname(file));
  const original = fs.readFileSync(file, 'utf-8');
  let next = original;
  next = next.replace(
    /(from\s*['"]|require\(\s*['"])(\.\.?\/)+([^'"]+)(['"]\s*\)?)/g,
    (m, pre, _dots, rest, post) => {
      const fixed = fixSpec(relDir, rest);
      if (fixed === null) return m;
      return pre + fixed + post;
    },
  );
  if (next !== original) {
    fs.writeFileSync(file, next, 'utf-8');
    return true;
  }
  return false;
}

const moved = [];
walk(USERSCRIPT, moved);
let fixedCount = 0;
for (const f of moved) {
  if (!EXT.includes(path.extname(f))) continue;
  if (fixFile(f)) fixedCount++;
}
console.log(`reset shared-root imports in ${fixedCount} file(s)`);

// ---- 2) 解析校验 src 下所有相对引用 ----
function resolveSpec(baseDir, spec) {
  if (!spec.startsWith('.')) return null; // 非相对，跳过
  const candidates = [spec];
  for (const e of ['', '.js', '.ts', '.tsx', '.mjs', '.cjs', '/index.js', '/index.ts', '/index.mjs']) {
    candidates.push(spec + e);
  }
  for (const c of candidates) {
    const abs = path.resolve(baseDir, c);
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return abs;
  }
  return null;
}

const allFiles = [];
walk(path.join(ROOT, 'src'), allFiles);
let missing = 0;
for (const f of allFiles) {
  if (!EXT.includes(path.extname(f))) continue;
  const content = fs.readFileSync(f, 'utf-8');
  const baseDir = path.dirname(f);
  const re = /(from\s*['"]|require\(\s*['"])(\.\.?\/[^'"]+)(['"]\s*\)?)/g;
  let m;
  while ((m = re.exec(content))) {
    const full = m[2];
    const abs = resolveSpec(baseDir, full);
    if (abs === null) {
      missing++;
      console.log(`MISSING: ${path.relative(ROOT, f)}  ->  ${full}`);
    }
  }
}
console.log(missing === 0 ? 'ALL RELATIVE IMPORTS RESOLVE OK' : `TOTAL MISSING: ${missing}`);
