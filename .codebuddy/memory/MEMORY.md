# 长期记忆（GitHub_Chinese）

> **本文件定位**：项目级**耐久事实源**。每日日志（`.codebuddy/memory/YYYY-MM-DD.md`）是原始时序档案，内含大量易失效数据（版本号、用例数、文件数、lint/TS error 数），仅作回溯，不视为当前事实。凡需引用当前状态，以本文件 + 代码实查为准。

---

## 1. 项目布局约定（高可信 · 当前有效）

- 部署的 Next.js 工作台（`src/app`）采用**顶部导航 + 内容的上下布局**：全局 `TopNav` 顶栏 + 各页面 `Shell` 内的 `topbar` 页头 + 内容 + 页脚。**不要**恢复左侧 `Rail` 侧栏（2026-10-01 改造，`Rail.tsx`/`MobileNav.tsx` 已删除，`TopNav.tsx` 已落地）。
- 导航数据源**唯一来源**：`src/components/navItems.ts` 的 `NAV_ITEMS`（6 项：`console`/`overview`/`coverage`/`design`/`dictionary`/`dict-manage`，类型 `NavSection`）。
- 6 个页面路由：`/`、`/overview`、`/coverage`、`/design`、`/dictionary`、`/dictionary/manage`（与 `NAV_ITEMS` 对齐）。
- 原型位于 `prototype/prototypes/index.html`（经 `npm run dev:prototype` 预览），为上下单页展示，定位「设计走查」，与 Next 应用是两套独立产物。

## 2. 常见脚本（高可信）

- 运行：`npm run dev`（Next）、`npm run dev:prototype`（原型预览服务器 `server.js`）。
- 质量：`npm run format` / `typecheck` / `lint` / `build`（`build` = `next build` + `node build.cjs`）。
- 测试：`npm test`（lint → lint:length → build → test:unit → validate）；`npm run test:unit` = `node --test`（**无需 Jest**）。
- 部署：GitHub Pages（`deploy-pages`），产物为 Next 应用而非原型。

## 3. 版本权威源（高可信 · 强约束）

- 权威版本**单一来源**：`src/userscript/version.js` 的 `VERSION`。`package.json` 的 `version` 须与其**一致**（2026-10-01 核查：二者均为 **1.13.12**）。
- 旧 `src/version.js` 已于 v1.13.6 删除，勿再引用。
- 每次修改（含纯文档）按规则 bump 最小版本（patch）；**仅更新被改文件的头注释版本**，禁止全仓库批量刷写。

## 4. 受保护 / 已处置文件（高可信 · 当前有效）

- `metadata.json`：仍存在（228 B）。历史上（2026-09-25）曾标记为 Google AI Studio 自动生成、须保留；2026-10-01 评估为可能冗余但仍保留。删除前须先确认，勿擅自移除。
- `GEMINI.md`：**已于 2026-10-01 删除**（当日经用户确认的低风险清理项）。勿再引用其存在或将其列为受保护文件。

## 5. 编码规范要点（高可信）

- 函数 ≤ **100** 行、单文件 ≤ **200** 行（仅**代码文件**；**文档不拆分**，文档须保持完整连贯）。源文件 >200 行按职责拆分为更小模块。
- 命名：目录 / CSS 类 kebab-case；文件 camelCase；类 / 组件 PascalCase；常量 UPPER_SNAKE_CASE；语义化 id kebab-case。
- 关键逻辑中文注释；禁止 `any` / `var`；用 `===`。
- 测试框架：Node 内置 `node --test`（非 Jest）。

## 6. 已知预存问题（中可信 · 待修，与布局改造无关）

- `src/app/api/batch-collect/route.ts:44` cookies 类型缺失。
- `src/components/dictionary/Manager/MergePatchPanel.tsx:89` key/value 未定义。
- `tests/batch-collector.test.mjs` 中 `_` 未使用。
- 当前 `npm run lint` = **2 error**（上述预存）；`tsc --noEmit` = **4 个 TS 错误**（构建未通过）。属已知，非本次引入。

## 7. 关键决策时间线 / 可信度（主题归类）

| 日期 | 决策 | 可信度 | 说明 |
|------|------|--------|------|
| v1.13.6 | 版本源迁至 `src/userscript/version.js` | 高 | 旧 `src/version.js` 删除 |
| 2026-09-30 | 建立 `docs/code-review/` 审查体系（STANDARDS/PROCESS/CHECKLIST/SETUP_GUIDE） | 高 | 审查模块独立于主文档 |
| 2026-09-30 | 统一编码阈值：函数 ≤100 / 文件 ≤200（仅代码） | 高 | 见 `coding-style.md` §5.6/§5.8 |
| 2026-10-01 | 导航由 Rail 侧栏改为 TopNav 顶栏 | 高 | 代码已落地（TopNav.tsx 存在、Rail.tsx 删除） |
| 2026-10-01 | 文档/记忆整理：去 Jest→node --test、统一 6 页与 TopNav、阈值对齐、版本对齐 1.13.12 | 高 | 见 `CHANGELOG` [1.13.12] |

## 8. 易失效数据警示（低可信 · 须实查）

- **量化指标**（测试用例数、文件数、行数、lint/TS error 数）随重构快速失效。文档一律以 `docs/project.md` §量化指标（实算快照）或 `/overview` 实时统计为准，**禁止凭记忆手填**。
- **版本号**在会话间隙常被外部（用户/并行 agent）bump。写文档前务必实查 `src/userscript/version.js` 与 `git log`，勿按旧会话记忆盲写。
- 每日日志中的具体版本号 / 指标为当时快照，可能已过时，引用前需二次核实。
