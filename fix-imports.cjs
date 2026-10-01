/**
 * 修正：对迁入 src/userscript/ 的文件，把指向共享根模块(utils/dictionaries)的
 * 相对引用深度 +1（因文件整体下移一层）。幂等。
 */
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
}

function bump(content) {
  return content.replace(
    /(from\s*['"]|require\(\s*['"])(\.\.?\/)*([^'"]+)(['"]\s*\)?)/g,
    (m, pre, dots, rest, post) => {
      if (!/^(utils|dictionaries)(\/|$)/.test(rest)) return m;
      const d = (dots || '').split('../').length - 1;
      return pre + '../'.repeat(d + 1) + rest + post;
    },
  );
}

const files = [];
walk(path.join(ROOT, 'src/userscript'), files);
let n = 0;
for (const f of files) {
  if (!['.js', '.ts', '.tsx', '.d.ts', '.mjs', '.cjs'].includes(path.extname(f))) continue;
  const original = fs.readFileSync(f, 'utf-8');
  const next = bump(original);
  if (next !== original) {
    fs.writeFileSync(f, next, 'utf-8');
    n++;
  }
}
console.log(`bumped shared-root imports in ${n} file(s)`);
