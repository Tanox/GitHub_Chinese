# 长期记忆（GitHub_Chinese）

> **本文件定位**：项目级**耐久事实源**。每日日志（`.codebuddy/memory/YYYY-MM-DD.md`）是原始时序档案，内含大量易失效数据（版本号、用例数、文件数、lint/TS error 数），仅作回溯，不视为当前事实。凡需引用当前状态，以本文件 + 代码实查为准。

---

## 1. 项目布局约定（高可信 · 当前有效）

- 部署的 Next.js 工作台（`src/app`）采用**顶部导航 + 内容的上下布局**：全局 `TopNav` 顶栏 + 各页面 `Shell` 内的 `topbar` 页头 + 内容 + 页脚。**不要**恢复左侧 `Rail` 侧栏（2026-10-01 改造，`Rail.tsx`/`MobileNav.tsx` 已删除，`TopNav.tsx` 已落地）。
- 导航数据源**唯一来源**：`src/components/navItems.ts` 的 `NAV_ITEMS`（6 项：`console`/`overview`/`coverage`/`design`/`dictionary`/`dict-manage`，类型 `NavSection`）。
- 6 个页面路由：`/`、`/overview`、`/coverage`、`/design`、`/dictionary`、`/dictionary/manage`（与 `NAV_ITEMS` 对齐）。
- 原型位于 `prototype/` 目录，为**单个自包含 HTML 文件**（CSS 全部内联、含内联 `<script>` 交互，**无外部依赖 / 无服务器**），直接用浏览器打开即可预览，与应用代码（`src/` / `server/` / `scripts/`）完全分离。包含：`prototype/prototype.html`（高保真可交互原型：动效 + 真实数据 KPI + 标签切换 + 模拟 SSE 流式日志）与 `prototype/wireframes.html`（组件库规范：基础 / 复合 / 业务组件 + 使用规则）。无 `prototype/assets/`、`prototype/server.js`。`server/` 目录仅含 `collect-service/`。

## 2. 常见脚本（高可信）

- 运行：`npm run dev`（Next）。原型为单文件 HTML（`prototype/prototype.html` / `prototype/wireframes.html`），直接用浏览器打开，无预览命令。
- 质量：`npm run format` / `typecheck` / `lint` / `build`（`build` = `next build` + `node build.cjs`）。
- 测试：`npm test`（lint → lint:length → build → test:unit → validate）；`npm run test:unit` = `node --test`（**无需 Jest**）。
- 部署：GitHub Pages（`deploy-pages`），产物为 Next 应用而非原型。

## 3. 版本权威源（高可信 · 强约束）

- 权威版本**单一来源**：`src/userscript/version.js` 的 `VERSION`。`package.json` 的 `version` 须与其**一致**（2026-10-04 核查：二者均为 **1.13.18**，T39 页脚日期单一来源化并入该版本；版本常被外部 bump，引用前以 `src/userscript/version.js` 实查为准）。
- 旧 `src/version.js` 已于 v1.13.6 删除，勿再引用。
- 每次修改（含纯文档）按规则 bump 最小版本（patch）；**仅更新被改文件的头注释版本**，禁止全仓库批量刷写。

## 4. 受保护 / 已处置文件（高可信 · 当前有效）

- `metadata.json`：**2026-10-02 实查已不存在**（仓库根无此文件）。曾记为 Google AI Studio 自动生成须保留，该记忆已失效，勿再引用其存在。
- `GEMINI.md`：**已于 2026-10-01 删除**（当日经用户确认的低风险清理项）。勿再引用其存在或将其列为受保护文件。

## 5. 编码规范要点（高可信）

- 函数 ≤ **100** 行、单文件 ≤ **200** 行（仅**代码文件**；**文档不拆分**，文档须保持完整连贯）。源文件 >200 行按职责拆分为更小模块。
- 命名：目录 / CSS 类 kebab-case；文件 camelCase；类 / 组件 PascalCase；常量 UPPER_SNAKE_CASE；语义化 id kebab-case。
- 关键逻辑中文注释；禁止 `any` / `var`；用 `===`。
- 测试框架：Node 内置 `node --test`（非 Jest）。
- 应用页脚须展示版本号（取自 `src/userscript/version.js` 的 `VERSION`）与更新日期：见 `docs/coding-style.md` §5.12。
- 任务记录**单一来源**：`docs/tasks.md` 为所有任务（活动 / 优先级 / 验收要点）的唯一清单；其他文档（如 `docs/project.md`「活动任务」小节）仅引用、不维护任务条目。2026-10-03 收口，无独立冗余任务文档（历史 `TASKS.md` / `PROGRESS.md` / `IMPROVEMENT-TASKS.md` 已合并删除；`code-review/*` 为审查治理体系，保留）。

## 6. 已知预存问题（已清零，v1.13.13）

- 历史预存项（`route.ts` cookies 类型 / `MergePatchPanel` key-value / `tests` `_` 未使用）经实查均已不存在：2026-10-01 实跑 `tsc --noEmit` = **0 错误**、`npm run lint` = **0 error**（仅 `eslint/rules/core.js:43` 一处 `no-magic-numbers` warning，非门禁）。
- 记忆中"4 个 TS 错误 / 2 error"为过时记录，已被本次实查推翻，勿再引用。

## 7. 关键决策时间线 / 可信度（主题归类）

| 日期 | 决策 | 可信度 | 说明 |
|------|------|--------|------|
| v1.13.6 | 版本源迁至 `src/userscript/version.js` | 高 | 旧 `src/version.js` 删除 |
| 2026-09-30 | 建立 `docs/code-review/` 审查体系（STANDARDS/PROCESS/CHECKLIST/SETUP_GUIDE） | 高 | 审查模块独立于主文档 |
| 2026-09-30 | 统一编码阈值：函数 ≤100 / 文件 ≤200（仅代码） | 高 | 见 `coding-style.md` §5.6/§5.8 |
| 2026-10-01 | 导航由 Rail 侧栏改为 TopNav 顶栏 | 高 | 代码已落地（TopNav.tsx 存在、Rail.tsx 删除） |
| 2026-10-01 | 文档/记忆整理：去 Jest→node --test、统一 6 页与 TopNav、阈值对齐、版本对齐 1.13.12 | 高 | 见 `CHANGELOG` [1.13.12] |

| 2026-10-01 | 清理 tests 两处预存 lint 错误 + 全部文档头版本对齐 1.13.13 | 高 | 见 `CHANGELOG` [1.13.13] |

| 2026-10-02 | 原型系统去耦：预览服务器由 `server/prototype.js` 迁至 `prototype/server.js`，移除 `collector-core` 引用与采集 API；`server/` 仅留 `collect-service` | 高 | 见 `CHANGELOG` [1.13.14] |

| 2026-10-03 | 原型单文件化：10 个 CSS 内联进 index.html，删除 `prototype/assets/` 与 `prototype/server.js`，移除 `npm run dev:prototype`；原型成单文件 HTML，与应用代码彻底分离 | 高 | 见 `CHANGELOG` [1.13.17] |

| 2026-10-04 | 任务进度复核 + T39 页脚更新时间单一来源化（`version.js` 新增 `BUILD_DATE`，`Shell.tsx` 改用，消除硬编码漂移）；W5 仍阻塞；版本被外部 bump 至 1.13.18 | 高 | 见 `CHANGELOG` [1.13.18]、`docs/tasks.md` |

## 8. 易失效数据警示（低可信 · 须实查）

- **量化指标**（测试用例数、文件数、行数、lint/TS error 数）随重构快速失效。文档一律以 `docs/project.md` §量化指标（实算快照）或 `/overview` 实时统计为准，**禁止凭记忆手填**。
- **版本号**在会话间隙常被外部（用户/并行 agent）bump。写文档前务必实查 `src/userscript/version.js` 与 `git log`，勿按旧会话记忆盲写。
- 每日日志中的具体版本号 / 指标为当时快照，可能已过时，引用前需二次核实。
