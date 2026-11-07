# 长期记忆（GitHub_Chinese）

> **本文件定位**：项目级**耐久事实源**。每日日志（`.codebuddy/memory/YYYY-MM-DD.md`）是原始时序档案，内含大量易失效数据（版本号、用例数、文件数、lint/TS error 数），仅作回溯，不视为当前事实。凡需引用当前状态，以本文件 + 代码实查为准。

---

## 1. 项目布局约定（高可信 · 当前有效）

- 部署的 Next.js 工作台（`src/app`）采用**顶部导航 + 内容的上下布局**：全局 `TopNav` 顶栏 + 各页面 `Shell` 内的 `topbar` 页头 + 内容 + 页脚。**不要**恢复左侧 `Rail` 侧栏（2026-10-01 改造，`Rail.tsx`/`MobileNav.tsx` 已删除，`TopNav.tsx` 已落地）。
- 导航数据源**唯一来源**：`src/components/navItems.ts` 的 `NAV_ITEMS`（**5 项**：`console`/`overview`/`coverage`/`dictionary`/`dict-manage`，类型 `NavSection`）。
- **5 个**页面路由：`/`、`/overview`、`/coverage`、`/dictionary`、`/dictionary/manage`（与 `NAV_ITEMS` 对齐）；**不存在 `/design` 路由**，设计系统展示由原型承载。
- 原型位于 `prototype/` 目录：**三个自包含 HTML 文件** `prototype.html`（高保真采集流程）、`app.html`（工作台其余模块）、`wireframes.html`（组件库规范），CSS 与交互脚本内联，另有 `prototype/assets/prototype.css` 作为聚合样式快照（历史产物，页面本身不引用外部 CSS）。直接用浏览器打开即可预览，与应用代码（`src/` / `server/` / `scripts/`）完全分离；无 `prototype/server.js`，`server/` 目录仅含 `collect-service/`。

## 2. 常见脚本（高可信）

- 运行：`npm run dev`（Next）。原型为三个自包含 HTML（`prototype/prototype.html` / `prototype/app.html` / `prototype/wireframes.html`），直接用浏览器打开，无预览命令。
- 质量：`npm run format` / `typecheck` / `lint` / `build`（`build` = `next build`）；用户脚本产物另由 `npm run build:userscript` 生成。
- 测试：`npm test`（lint → lint:length → build → test:unit）；`npm run test:unit` = `node --test`（**无需 Jest**）；产物校验 `npm run validate`。
- IDE 内执行 `npm test` / `npm run build` 需设置 `$env:CODEBUDDY_SAFE_DELETE_ENABLED='0'` 规避 safe-delete shim 超时；本机可用 `node node_modules/typescript/bin/tsc` 与 `node node_modules/eslint/bin/eslint.js` 直跑门禁。
- 部署：GitHub Pages（`deploy-pages`），产物为 Next 应用而非原型。

## 3. 版本权威源（高可信 · 强约束）

- 权威版本**单一来源**：`src/userscript/version.js` 的 `VERSION`。`package.json` / `package-lock.json` 的 `version` 须与其**一致**（版本常被外部 bump，引用前以 `src/userscript/version.js` 实查为准；**`package-lock.json` 必须入库**，CI 使用 `npm ci`）。
- `src/userscript/version.js` 的 `BUILD_DATE` 仅用于用户脚本元数据；应用页脚不再展示日期，改为展示构建编号（见 §5）。
- 旧 `src/version.js` 已于 v1.13.6 删除，勿再引用。
- 每次修改（含纯文档）按规则 bump 最小版本（patch）；**仅更新被改文件的头注释版本**，禁止全仓库批量刷写。

## 4. 受保护 / 已处置文件（高可信 · 当前有效）

- `metadata.json`：**2026-10-02 实查已不存在**（仓库根无此文件）。曾记为 Google AI Studio 自动生成须保留，该记忆已失效，勿再引用其存在。
- `GEMINI.md`：**已于 2026-10-01 删除**（当日经用户确认的低风险清理项）。勿再引用其存在或将其列为受保护文件。

## 5. 编码规范要点（高可信）

- 单文件 ≤ **200** 行（仅**代码文件**；**文档不拆分**，文档须保持完整连贯）。源文件 >200 行按职责拆分为更小模块；函数有效行 / 参数 / 圈复杂度阈值以 `eslint/rules/*.js` 与 `docs/coding-style.md` §13 实况为准（非历史记忆中的 100 行）。
- 命名：目录 / CSS 类 kebab-case；文件 camelCase；类 / 组件 PascalCase；常量 UPPER_SNAKE_CASE；语义化 id kebab-case。
- 关键逻辑中文注释；禁止 `any` / `var`；用 `===`。
- 测试框架：Node 内置 `node --test`（非 Jest）。
- 应用页脚须展示 `V<版本>· build <10 位编号>`（如 `V1.13.29· build 2611071030`）：版本号取自 `src/userscript/version.js` 的 `VERSION`，build 编号 `yymmddhhmm`（10 位，取代旧 12 位 `yyyymmddhhmm`）由 `src/lib/build-id.js` 的 `createBuildId()` 生成、`next.config.mjs` 注入 `NEXT_PUBLIC_BUILD_ID`；**不再展示更新日期**。权威正文见 `docs/coding-style.md` §15（非 §5.12）。
- 页脚语义化 id：`site-footer` / `site-footer-meta` / `site-footer-version` / `site-footer-build`；原型对应 `proto-footer` / `app-footer` / `wf-footer` 及 `*-footer-version` / `*-footer-build`。
- 任务记录**单一来源**：`docs/tasks.md` 为所有任务（活动 / 优先级 / 验收要点）的唯一清单；其他文档（如 `docs/project.md`「活动任务」小节）仅引用、不维护任务条目。2026-10-03 收口，无独立冗余任务文档（历史 `TASKS.md` / `PROGRESS.md` / `IMPROVEMENT-TASKS.md` 已合并删除；`code-review/*` 为审查治理体系，保留）。

## 6. 已知预存问题（已清零，v1.13.13）

- 历史预存项（`route.ts` cookies 类型 / `MergePatchPanel` key-value / `tests` `_` 未使用）经实查均已不存在：2026-10-01 实跑 `tsc --noEmit` = **0 错误**、`npm run lint` = **0 error**（仅 `eslint/rules/core.js:43` 一处 `no-magic-numbers` warning，非门禁）。
- 记忆中"4 个 TS 错误 / 2 error"为过时记录，已被本次实查推翻，勿再引用。

## 7. 关键决策时间线 / 可信度（主题归类）

| 日期 | 决策 | 可信度 | 说明 |
|------|------|--------|------|
| v1.13.6 | 版本源迁至 `src/userscript/version.js` | 高 | 旧 `src/version.js` 删除 |
| 2026-09-30 | 建立 `docs/code-review/` 审查体系（STANDARDS/PROCESS/CHECKLIST/SETUP_GUIDE） | 高 | 审查模块独立于主文档 |
| 2026-09-30 | 统一编码阈值：文件 ≤200（仅代码）；函数行数 / 参数 / 复杂度以 ESLint 配置为准 | 高 | 见 `coding-style.md` §13（旧 §5.6/§5.8 编号已失效） |
| 2026-10-01 | 导航由 Rail 侧栏改为 TopNav 顶栏 | 高 | 代码已落地（TopNav.tsx 存在、Rail.tsx 删除） |
| 2026-10-01 | 文档/记忆整理：去 Jest→node --test、统一 6 页与 TopNav、阈值对齐、版本对齐 1.13.12 | 高 | 见 `CHANGELOG` [1.13.12] |

| 2026-10-01 | 清理 tests 两处预存 lint 错误 + 全部文档头版本对齐 1.13.13 | 高 | 见 `CHANGELOG` [1.13.13] |

| 2026-10-02 | 原型系统去耦：预览服务器由 `server/prototype.js` 迁至 `prototype/server.js`，移除 `collector-core` 引用与采集 API；`server/` 仅留 `collect-service` | 高 | 见 `CHANGELOG` [1.13.14] |

| 2026-10-03 | 原型单文件化：10 个 CSS 内联进 index.html，删除 `prototype/assets/` 与 `prototype/server.js`，移除 `npm run dev:prototype`；原型成单文件 HTML，与应用代码彻底分离 | 高 | 见 `CHANGELOG` [1.13.17] |

| 2026-10-04 | 任务进度复核 + T39 页脚更新时间单一来源化（`version.js` 新增 `BUILD_DATE`，`Shell.tsx` 改用，消除硬编码漂移）；W5 仍阻塞；版本被外部 bump 至 1.13.18 | 高 | 见 `CHANGELOG` [1.13.18]、`docs/tasks.md` |
| 2026-11-05 | W5 决议采纳自托管服务路径，交付 `docs/collect-service.md`；`docs/tasks.md` 收敛为纯未完成清单 | 高 | 见 `CHANGELOG` [1.13.26] |
| 2026-11-06 | 页脚规范更新：build 编号改 10 位 `yymmddhhmm`、展示 `V<版本>· build <编号>`，新增 `src/lib/build-id.js`；原型页脚同步；修复 SSRF / Cookie 域名 / 子进程 / SSE 等一批缺陷，版本升 1.13.28 | 高 | 见 `CHANGELOG` [1.13.28]、`docs/coding-style.md` §15 |

## 8. 易失效数据警示（低可信 · 须实查）

- **量化指标**（测试用例数、文件数、行数、lint/TS error 数）随重构快速失效。文档一律以 `docs/project.md` §量化指标（实算快照）或 `/overview` 实时统计为准，**禁止凭记忆手填**。
- **版本号**在会话间隙常被外部（用户/并行 agent）bump。写文档前务必实查 `src/userscript/version.js` 与 `git log`，勿按旧会话记忆盲写。
- 每日日志中的具体版本号 / 指标为当时快照，可能已过时，引用前需二次核实。
