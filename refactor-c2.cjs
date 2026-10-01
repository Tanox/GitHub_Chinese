/**
 * 临时：修正 file+dir→index.js 的两处 bug + 修 @/version 别名
 * 1) 被迁文件内自身子目录引用 ./X/ -> ./ （全文件匹配，含多行 import）
 * 2) 外部引用 ./X.js -> ./X/index.js （允许中间路径段，如 ../core/errorHandler.js）
 * 3) @/version -> @/userscript/version（v1.13.6 迁移后 src/version.js 已迁走）
 */
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();

const PAIRS = [
  ['src/userscript/config', 'config'],
  ['src/userscript/main', 'main'],
  ['src/userscript/updateNotification', 'updateNotification'],
  ['src/userscript/versionChecker', 'versionChecker'],
  ['src/userscript/ui/configUI', 'configUI'],
  ['src/userscript/core/errorHandler', 'errorHandler'],
  ['src/userscript/core/virtualDom', 'virtualDom'],
  ['src/userscript/translation-core/selectorUtils', 'selectorUtils'],
  ['src/utils/tools', 'tools'],
];

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', 'build', 'dist', '.git'].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (/\.(js|cjs|mjs)$/.test(e.name)) acc.push(full);
  }
  return acc;
}
const GLOB = [
  ...walk(path.join(ROOT, 'src/userscript'), []),
  ...walk(path.join(ROOT, 'src/utils'), []),
  ...walk(path.join(ROOT, 'src/lib'), []),
  ...walk(path.join(ROOT, 'tests'), []),
  ...walk(path.join(ROOT, 'scripts'), []),
];
GLOB.push(path.join(ROOT, 'build.cjs'));

// 1) 自转换：被迁文件内 ./X/ 或 ../X/ -> ./（X 是其自身目录名）
for (const [dir, name] of PAIRS) {
  const idx = path.join(ROOT, dir, 'index.js');
  if (!fs.existsSync(idx)) continue;
  let c = fs.readFileSync(idx, 'utf-8');
  const re = new RegExp("(['\"])((?:\\.\\.?\\/)+)" + name + "\\/", 'g');
  c = c.replace(re, (_m, q) => q + './');
  fs.writeFileSync(idx, c, 'utf-8');
  console.log('selffix:', dir);
}

// 2) 外部引用 ./X.js -> ./X/index.js（允许中间路径段）
for (const [, name] of PAIRS) {
  const re = new RegExp("(['\"])((?:\\.\\.?\\/)[^'\\\"]*?)" + name + "\\.js(['\"])", 'g');
  for (const f of GLOB) {
    let c = fs.readFileSync(f, 'utf-8');
    if (!re.test(c)) continue;
    re.lastIndex = 0;
    c = c.replace(re, (_m, q1, pre, q3) => q1 + pre + name + '/index.js' + q3);
    fs.writeFileSync(f, c, 'utf-8');
    console.log('rewrote:', path.relative(ROOT, f), '(' + name + ')');
  }
}

// 3) @/version -> @/userscript/version
for (const f of ['src/lib/project-metrics.ts', 'src/components/Rail.tsx']) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  let c = fs.readFileSync(p, 'utf-8');
  if (!c.includes('@/version')) continue;
  c = c.split('@/version').join('@/userscript/version');
  fs.writeFileSync(p, c, 'utf-8');
  console.log('fix @/version:', f);
}
console.log('done');
