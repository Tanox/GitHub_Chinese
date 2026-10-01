/**
 * 临时迁移脚本：把用户脚本引擎整体迁入 src/userscript/
 * 仅机械移动 + 重写指向共享根模块(utils/dictionaries)的相对引用 + 外部引用。
 * 跑完即删。
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const MOVES = [
  ['src/core', 'src/userscript/core'],
  ['src/page-monitor', 'src/userscript/page-monitor'],
  ['src/translation-core', 'src/userscript/translation-core'],
  ['src/ui', 'src/userscript/ui'],
  ['src/versionChecker', 'src/userscript/versionChecker'],
  ['src/updateNotification', 'src/userscript/updateNotification'],
  ['src/config', 'src/userscript/config'],
  ['src/main', 'src/userscript/main'],
  ['src/versionChecker.js', 'src/userscript/versionChecker.js'],
  ['src/updateNotification.js', 'src/userscript/updateNotification.js'],
  ['src/config.js', 'src/userscript/config.js'],
  ['src/main.js', 'src/userscript/main.js'],
  ['src/version.js', 'src/userscript/version.js'],
  ['src/versionUtils.js', 'src/userscript/versionUtils.js'],
  ['src/version.d.ts', 'src/userscript/version.d.ts'],
];

function move(from, to) {
  const fromP = path.join(ROOT, from);
  const toP = path.join(ROOT, to);
  if (!fs.existsSync(fromP)) {
    console.log('SKIP (missing):', from);
    return;
  }
  fs.mkdirSync(path.dirname(toP), { recursive: true });
  fs.renameSync(fromP, toP);
  console.log('moved', from, '->', to);
}

function bumpSpec(fullMatch) {
  const m = fullMatch.match(/^(from\s*|\brequire\(\s*)(['"])((\.\.?\/)*)([^'"]+)\2(\s*\)?)$/);
  if (!m) return fullMatch;
  const pre = m[1];
  const q = m[2];
  const dots = m[3];
  const rest = m[4];
  const post = m[5];
  if (!/^(utils|dictionaries)(\/|$)/.test(rest)) return fullMatch;
  const d = (dots.match(/\.\.\//g) || []).length;
  const newDots = '../'.repeat(d + 1);
  return `${pre}${q}${newDots}${rest}${q}${post}`;
}

function transformMoved(content) {
  // 指向共享根模块 utils/dictionaries 的相对引用加一级 ../
  content = content.replace(
    /(from\s*['"][^'"]+['"]|require\(\s*['"][^'"]+['"]\s*\))/g,
    bumpSpec,
  );
  // @file 注释路径同步
  content = content.replace(
    /@file\s+src\/(core|page-monitor|translation-core|ui|versionChecker|updateNotification|config|main|version|versionUtils)(?=[/.])/g,
    '@file src/userscript/$1',
  );
  return content;
}

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
}

// 1) 移动
for (const [from, to] of MOVES) move(from, to);

// 2) 重写迁入文件内部引用
const movedFiles = [];
walk(path.join(ROOT, 'src/userscript'), movedFiles);
let rewritten = 0;
for (const f of movedFiles) {
  const ext = path.extname(f);
  if (!['.js', '.ts', '.tsx', '.d.ts', '.mjs', '.cjs'].includes(ext)) continue;
  const original = fs.readFileSync(f, 'utf-8');
  const next = transformMoved(original);
  if (next !== original) {
    fs.writeFileSync(f, next, 'utf-8');
    rewritten++;
  }
}
console.log(`rewrote ${rewritten} moved file(s) for shared-root imports/@file`);

// 3) 重写 tests 外部引用
const testPattern = /\.\.\/src\/(core|page-monitor|translation-core|ui|versionChecker|updateNotification|config|main|version|versionUtils)(?=[/.])/g;
function rewriteFile(rel, fn) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return;
  const original = fs.readFileSync(p, 'utf-8');
  const next = fn(original);
  if (next !== original) fs.writeFileSync(p, next, 'utf-8');
  console.log('updated', rel);
}
for (const f of fs.readdirSync(path.join(ROOT, 'tests'))) {
  rewriteFile(path.join('tests', f), (c) => c.replace(testPattern, '../src/userscript/$1'));
}
rewriteFile('tests/smoke.test.cjs', (c) =>
  c
    .replace("path.join(ROOT, 'src', 'version.js')", "path.join(ROOT, 'src', 'userscript', 'version.js')")
    .replace("'无法从 src/version.js 读取版本号'", "'无法从 src/userscript/version.js 读取版本号'"),
);

// 4) 重写 build.cjs
rewriteFile('build.cjs', (c) =>
  c
    .replace("path.join(SRC_DIR, 'main.js')", "path.join(SRC_DIR, 'userscript', 'main.js')")
    .replace("path.join(SRC_DIR, 'version.js')", "path.join(SRC_DIR, 'userscript', 'version.js')")
    .replace(/读取 src\/version\.js/g, '读取 src/userscript/version.js'),
);

// 5) 注释同步（非代码引用，保持文档准确）
rewriteFile('src/lib/project-metrics.ts', (c) =>
  c.replace('单一版本源 src/version.js', '单一版本源 src/userscript/version.js'),
);
rewriteFile('src/app/overview/page.tsx', (c) =>
  c.replace('单一版本源 src/version.js', '单一版本源 src/userscript/version.js'),
);
rewriteFile('next.config.mjs', (c) =>
  c.replace('src/main.js 等 .js', 'src/userscript/main.js 等 .js'),
);

// 6) 删除空死目录 src/server/
const serverDir = path.join(ROOT, 'src', 'server');
if (fs.existsSync(serverDir)) {
  fs.rmSync(serverDir, { recursive: true, force: true });
  console.log('removed empty dead dir src/server');
}

console.log('MIGRATION DONE');
