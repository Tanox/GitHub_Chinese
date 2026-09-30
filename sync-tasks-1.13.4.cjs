// path v1.13.4 - 任务清单收口至 docs/tasks.md（单文件原子改写）
const fs = require('fs');
const path = require('path');
const root = 'e:/Github/GitHub_Chinese';

function read(p) { return fs.readFileSync(path.join(root, p), 'utf8'); }
function write(p, c) { fs.writeFileSync(path.join(root, p), c); }

// 1) 新建 docs/tasks.md（唯一任务来源）
const tasksMd = [
  '# 项目任务清单（Task Registry）',
  '',
  '> 版本：**v1.13.4** ｜ 更新日期：2026-09-30 ｜ 单一来源：`docs/tasks.md`',
  '>',
  '> 本文档是 GitHub Chinese 项目**所有任务的唯一权威来源**。',
  '> 其余文档（如 `docs/PROGRESS.md`）仅引用本清单，不再维护任务条目。',
  '> 任务验收要点与发版记录见 `CHANGELOG.md` 对应版本小节。',
  '',
  '---',
  '',
  '## 1. 进行中 / 待办（Open）',
  '',
  '优先级 P0/P1/P2/P3；工作量标签：S（<0.5d）/ M（0.5–2d）/ L（>2d）。',
  '',
  '### P2（度量 / 管理增强）',
  '',
  '- [ ] **T18** 采集源扩展 `L`',
  '  - 验收：支持登录态 cookie 注入抓取私有页、HAR/会话导入，覆盖更多 UI 区域',
  '',
  '- [ ] **T19** 审阅状态机 · 工作台 UI 接入 `M`',
  '  - 状态：数据层已就绪，待工作台 UI 接入',
  '  - 验收：词条级审阅工作流在采集工作台可见可用',
  '',
  '- [ ] **T20** 合并入库 · 工作台 UI 接入 `M`',
  '  - 状态：数据层已就绪，待工作台 UI 接入',
  '  - 验收：一键合并入库操作在工作台提供 UI',
  '',
  '- [ ] **T23** 历史对比 · 工作台 UI 接入 `M`',
  '  - 状态：数据层已就绪，待工作台 UI 接入',
  '  - 验收：采集轮次历史对比视图在工作台提供',
  '',
  '- [ ] **T24** 导入导出增强 · 工作台 UI 接入 `M`',
  '  - 状态：数据层已就绪，待工作台 UI 接入',
  '  - 验收：词典导入 / 导出增强在工作台可用',
  '',
  '- [ ] **T25** 搜索与批量操作 · 工作台 UI 接入 `M`',
  '  - 状态：数据层已就绪，待工作台 UI 接入',
  '  - 验收：词条搜索与批量操作在工作台可用',
  '',
  '> T21（翻译建议 + 词典助手页）已于 v1.12.6 交付；T22（覆盖率看板）已于 v1.11.16 交付，二者不在待办列。',
  '',
  '---',
  '',
  '## 2. 已交付（Delivered，供追溯）',
  '',
  '完整验收要点见 `CHANGELOG.md` 对应版本小节。此处仅列里程碑索引。',
  '',
  '| 任务 | 能力 | 交付版本 |',
  '|------|------|---------|',
  '| T1–T11 | 安全加固 / CSP / a11y / 命名澄清 / 文档整理等（详见 CHANGELOG v1.9.33–v1.9.42） | v1.9.x |',
  '| T12–T17 | 采集成功率 / 覆盖率（提取精准 · SPA 适配 · 单页鲁棒 · 并发限流 · 匹配增强 · 覆盖率度量） | v1.10.0 等 |',
  '| T21 | 翻译建议 + 词典助手页（localStorage 持久化） | v1.12.6 |',
  '| T22 | 覆盖率看板 UI | v1.11.16 |',
  '| T26 | page.evaluate 序列化回归修复 | v1.10.2 |',
  '| T27–T36 | 采集重构 / 解耦 / URL 上限 / SSRF 重定向 / 鉴权限流 / SSE 复用 / 前端重构 / 词条事件解耦等 | 见 CHANGELOG |',
  '',
  '> 说明：T19 / T20 / T23 / T24 / T25 的数据层已随对应版本落地，其工作台 UI 接入仍列于 §1 待办。',
  ''
].join('\r\n');
write('docs/tasks.md', tasksMd);
console.log('written docs/tasks.md');

// 2) PROGRESS.md：§5 改为指针 + §9 自引用 + 版本行 1.13.3 -> 1.13.4
let prog = read('docs/PROGRESS.md');
prog = prog.replace(
  /## 5\. 活动任务[\s\S]*?(?=\n## 6\. 命令速查)/,
  '## 5. 活动任务\n\n> 活动任务已统一收口至 [docs/tasks.md](./tasks.md)，本文档不再维护任务条目。\n> 任务验收要点与发版记录见 CHANGELOG.md 对应版本小节。'
);
prog = prog.replace(
  '> **活动任务以本文档 §5 为唯一清单（含 P1–P3 优先级与 S/M/L 工作量标签、验收要点）；',
  '> **活动任务以 [docs/tasks.md](./tasks.md) 为唯一清单（含 P1–P3 优先级与 S/M/L 工作量标签、验收要点）；'
);
prog = prog.split('v1.13.3').join('v1.13.4');
write('docs/PROGRESS.md', prog);
console.log('updated docs/PROGRESS.md');

// 3) project.md：任务来源引用 + 版本行
let proj = read('docs/project.md');
proj = proj.replace(
  '### 活动任务（以 PROGRESS §5 为唯一清单）',
  '### 活动任务（以 docs/tasks.md 为唯一清单）'
);
proj = proj.split('v1.13.3').join('v1.13.4');
write('docs/project.md', proj);
console.log('updated docs/project.md');

// 4) CHANGELOG [1.13.4] 追加 Docs 小节（在 ## [1.13.3] 之前插入）
let ch = read('CHANGELOG.md');
const docsBlock = [
  '',
  '### Docs（任务清单收口至 docs/tasks.md）',
  '- 新增 `docs/tasks.md` 作为项目**任务唯一来源**，迁移 `docs/PROGRESS.md` §5 活动任务与各文档任务引用；`PROGRESS.md` §5 改为指向 tasks.md 的指针，`docs/project.md` 任务来源引用同步更新。',
  '- 此后所有任务记录以 `docs/tasks.md` 为单一权威，其余文档仅引用、不再维护任务条目。'
].join('\n');
ch = ch.replace(/\n## \[1\.13\.3\]/, docsBlock + '\n\n## [1.13.3]');
write('CHANGELOG.md', ch);
console.log('updated CHANGELOG.md');

// 5) 修复上一轮遗留的 1.13.3 -> 1.13.4 版本头漂移（排除 CHANGELOG 的历史 [1.13.3] 标题）
const bumpFiles = [
  'docs/README.md',
  'docs/architecture.md',
  'docs/coding-style.md',
  'docs/development.md',
  'docs/prototype.md',
  'docs/code-review/STANDARDS.md',
  'docs/code-review/PROCESS.md',
  'docs/code-review/SETUP_GUIDE.md',
  'CONTRIBUTING.md',
  'README.md'
];
for (const f of bumpFiles) {
  const fp = path.join(root, f);
  if (!fs.existsSync(fp)) { console.log('skip (missing) ' + f); continue; }
  let c = read(f);
  if (c.includes('v1.13.3')) {
    c = c.split('v1.13.3').join('v1.13.4');
    write(f, c);
    console.log('bumped ' + f);
  }
}
console.log('done');
