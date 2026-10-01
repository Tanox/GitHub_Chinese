/**
 * 临时：把 9 处「同名文件+目录」收敛为 X/index.js
 * - X.js 移入 X/ 作为 index.js
 * - X/index.js 内对自身子目录 `./X/...` 的引用去掉 X/ 段（变为 ./...）
 * - 其余文件中 `./X.js` 引用改写为 `./X/index.js`（显式扩展名，构建/Node ESM 均可解析）
 */
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();

const MODULE_RE = /^\s*(?:import|export\s*(?:\{|\*))/;

// [X.js 相对路径, X 目录名]
const PAIRS = [
  ['src/userscript/config.js', 'config'],
  ['src/userscript/main.js', 'main'],
  ['src/userscript/updateNotification.js', 'updateNotification'],
  ['src/userscript/versionChecker.js', 'versionChecker'],
  ['src/userscript/ui/configUI.js', 'configUI'],
  ['src/userscript/core/errorHandler.js', 'errorHandler'],
  ['src/userscript/core/virtualDom.js', 'virtualDom'],
  ['src/userscript/translation-core/selectorUtils.js', 'selectorUtils'],
  ['src/utils/tools.js', 'tools'],
];

// 收集需要全局改写引用的文件
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
  ...walk(path.join(ROOT, 'tests'), []),
  ...walk(path.join(ROOT, 'scripts'), []),
];
GLOB.push(path.join(ROOT, 'build.cjs'));

// 父文件内对自身子目录 X/ 的引用 -> 去 X/ 段
function selfTransform(content, name) {
  return content
    .split('\n')
    .map((line) => {
      if (!MODULE_RE.test(line)) return line;
      return line.replace(/(['"])([^'"]*?)name\/(.*?)\1/g, (_m, q, _pre, rest) => q + './' + rest + q);
    })
    .join('\n');
}

for (const [jsRel, name] of PAIRS) {
  const jsPath = path.join(ROOT, jsRel);
  if (!fs.existsSync(jsPath)) {
    console.log('skip (已迁移):', jsRel);
    continue;
  }
  let content = fs.readFileSync(jsPath, 'utf-8');
  content = selfTransform(content, name);
  const dir = path.dirname(jsPath);
  const idxPath = path.join(dir, name, 'index.js');
  fs.mkdirSync(path.dirname(idxPath), { recursive: true });
  fs.writeFileSync(idxPath, content, 'utf-8');
  fs.unlinkSync(jsPath);
  console.log('moved:', jsRel, '->', path.relative(ROOT, idxPath));
}

// 全局改写外部引用 ./X.js -> ./X/index.js
for (const [, name] of PAIRS) {
  const re = new RegExp("(['\"])((?:\\.\\.?\\/)+)" + name + "\\.js(['\"])", 'g');
  for (const f of GLOB) {
    const c0 = fs.readFileSync(f, 'utf-8');
    if (!re.test(c0)) continue;
    re.lastIndex = 0;
    const c1 = c0.replace(re, (_m, q1, dots, q3) => q1 + dots + name + '/index.js' + q3);
    fs.writeFileSync(f, c1, 'utf-8');
    console.log('rewrote:', path.relative(ROOT, f), '(' + name + ')');
  }
}
console.log('done');
