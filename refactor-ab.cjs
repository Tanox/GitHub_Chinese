/**
 * 临时：低风险结构清理
 * A) UI 性能面板 performanceMonitor.js -> perfPanel.js（与 translation-core/performanceMonitor.js 重名消歧）
 * B) 采集历史数据文件 docs/collect-history.json -> data/collect-history.json
 */
const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();

function mv(a, b) {
  if (!fs.existsSync(a)) return;
  fs.mkdirSync(path.dirname(b), { recursive: true });
  fs.renameSync(a, b);
  console.log('mv', a, '->', b);
}
function rep(file, from, to) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) return;
  let c = fs.readFileSync(p, 'utf-8');
  if (!c.includes(from)) return;
  c = c.split(from).join(to);
  fs.writeFileSync(p, c, 'utf-8');
  console.log('rep', file);
}

// A
mv('src/userscript/ui/components/performanceMonitor.js', 'src/userscript/ui/components/perfPanel.js');
rep('src/userscript/ui/configUI.js', './components/performanceMonitor.js', './components/perfPanel.js');
rep('src/userscript/ui/configUI/renderer.js', '../components/performanceMonitor.js', '../components/perfPanel.js');

// B
mv('docs/collect-history.json', 'data/collect-history.json');
for (const f of ['scripts/collect-history.cjs', 'src/lib/project-metrics.ts', 'docs/prototype.md', 'docs/project.md', 'docs/README.md']) {
  rep(f, 'docs/collect-history.json', 'data/collect-history.json');
}
console.log('done');
