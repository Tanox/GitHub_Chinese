# MEMORY.md

## 项目事实（稳定，截至 v1.9.26 / 2026-09-22）

- **GitHub_Chinese（e:/Github/GitHub_Chinese）是「双链路」项目**，两条链路相互独立、仅共享词典数据：
  1. **用户脚本引擎（核心交付物）**：原生 ESM JS，`build.cjs` 从入口 `src/main.js` 递归解析依赖图
     → 拓扑排序 → 剥离 import/export → 拼接为单文件 IIFE，产物 `build/GitHub_i18n.user.js`
     （约 194 KB，92 个模块）。`build/` 未被 .gitignore 忽略（README「一键安装」指向它），**必须纳入版本控制**。
  2. **词典采集工作台**：Next.js 16（App Router，`src/` 模式），根级 `next.config.mjs`。
     页面：`/`（采集控制台）、`/overview`（项目概览）、`/design`（设计系统），均为静态预渲染；
     结构为**服务端外壳（`components/Shell.tsx` + `Rail.tsx`）+ 最小客户端岛（`components/CollectorConsole.tsx`）**，
     不要再把整页写成 `'use client'`。
- **不存在 `web/` 目录**（v1.9.23 起由 `public/` 取代：`public/css/` 11 个模块 + `public/js/wizard/`）。
  旧文档/注释中的 `web/css/*`、`web/js/*` 均为过期路径。
- **版本单一来源 = `src/version.js` 的 `VERSION`**（当前 1.9.26）。工作台页面通过 `@/version` +
  `src/version.d.ts` 读取，不再硬编码。
- **构建脚本已自动化**：`scripts/build/moduleGraph.cjs`（依赖图 + 循环检测，`NEXT_ONLY_SEGMENTS` 跳过
  `app/components/lib/hooks/server`）、`scripts/build/transform.cjs`（ESM→单作用域 + 跨模块顶层重名冲突检测）、
  `scripts/validate-bundle.cjs`（产物存在性/体积/语法/未定义引用）。**不要再手工维护模块清单**。
- **npm 脚本语义（关键，勿混用）**：`build` = 用户脚本构建（CI 依赖它产出 artifact）；
  `build:web` = `next build`；`dev` = Next 工作台；`dev:prototype` = `server.js`（原型热更新预览）；
  `validate` = `node scripts/validate-bundle.cjs`；`test` = lint → build → validate。
- **采集服务端逻辑已去重（v1.9.26）**：唯一实现在 `src/lib/collector-core.js`（抓取与编排）+
  `src/lib/dictionary-processor.js`（spawn `collect-dict.cjs` 的子进程桥接）；
  `src/lib/collector-logic.ts` 仅为类型门面；Next Route 与 `server.js` 共用，只各自保留 SSE 适配层。
  旧的 `src/server/collector.js` 已删除，**不要重新引入第二份实现**。
- **可选依赖 `puppeteer` 未安装**（package.json 声明 ^25.11.0，node_modules 只有 `puppeteer-core`）：
  已列入 `next.config.mjs` 的 `serverExternalPackages`，并以 `createRequire` + 变量说明符做运行时解析，
  未安装时返回明确提示。`npm run build:web` 仍会输出 **1 条**无法解析该可选依赖的 Turbopack 告警（属 P0-2）。
- 质量现状：`npm run lint` 0 error/0 warning；`tsc --noEmit -p tsconfig.json` 通过且
  **`strict: true`**；**全部代码文件 ≤ 200 行**；构建期**循环引用 0 处、孤立模块 0 处**；
  `src/` 114 个文件 / 8752 行；`node build.cjs` 连续两次产物 md5 一致（可复现）。
- **Next 16 约定**：安全响应头文件是 `src/proxy.ts`（具名导出 `proxy`），`middleware` 约定已弃用；
  `next.config.mjs` **不支持 `eslint` 键**（写了会告警），用 CLI 的 `npm run lint`。
- **文档权威性**：`docs/` 是唯一权威正文，进度看 `docs/PROGRESS.md`；`openspec/*.md` 仅是指向 `docs/` 的索引。
- `jest.config.js` / `jest.setup.js` 存在但**未启用**（jest/jest-environment-jsdom/babel-jest 未安装，
  无测试用例）；`npm test` 不跑单测。
- **`src/i18n/*` 已于 v1.9.26 整体移除（P1-2 决策 B）**：9 个文件 / 641 行，精确检索确认零外部引用。
  移除理由：① 产品单语言，其自身 UI 固定中文，无语言切换需求；② `translations.js` 的 `github.*` 键
  与词典职责重叠（双翻译源易分叉）；③ `loader.js` 支持远程拉取翻译 JSON，与「本地优先 · 离线可用」相悖。
  **不要再新建同类的「工具自身 UI 国际化」抽象**；内容保留在 git 历史中可恢复。
- 仓库同时存在 `package-lock.json` 与 `bun.lock`（双锁漂移风险，P1-4）。
- 词典：`src/dictionaries/**` 共 12 个模块 / 459 个词条；`collect-dict.cjs` 递归扫描加载词典，
  结果写入 `docs/untranslated-terms.txt`。
- 原型资产：`prototype/` 共 16 个 HTML + 10 个 CSS。

## 仓库与提交
- 远程：`https://github.com/Tanox/GitHub_Chinese.git`（分支 `main`）。
  文档/package.json/用户脚本头中的旧名 `Tanox/GitHub_i18n` 两条 raw 路径实测均 200 且内容一致，
  自动更新不受影响；改名需谨慎（`@updateURL` 依赖 raw 路径）。
- **提交钩子是真的**：`.husky/pre-commit` → `lint-staged`（eslint --fix + prettier --write）。
  ⚠️ lint-staged v15 **不支持顶层 `ignore` 键**，写了会导致 pre-commit 直接失败、提交中断；
  排除目录请用 `.prettierignore` 或 eslint `ignores`。
- **仓库可能出现会话外自动提交**：工作途中 `git log` 可能多出提交（已实测发生）。
  收尾前务必先 `git status` + `git log` 核对真实 HEAD，不要假设工作区仍是你上次留下的样子。
- **构建产物须可复现**：`build.cjs` 先 `\r\n`→`\n` 再折叠空行（顺序颠倒会因 Windows CRLF 残留空行，
  导致每次构建都产生 diff）。验证方式：连续 `node build.cjs` 两次比对 md5。
- `build/GitHub_i18n.user.js` 随仓库提交（README 一键安装与 `@updateURL` 都指向它）。

## 编码约定（本项目）
- 单代码文件 ≤ 200 行，超长须按职责拆分（文档 .md 不适用，须保持完整）。
- 每次修改至少 bump patch 版本；**仅同步被改动文件的头注释版本号**，禁止全仓库批量刷写。
  版本展示位只同步：`src/version.js`、`package.json`、`README.md` 徽章、`CHANGELOG.md`，
  以及**本次实际编辑过**的文档版本行（未编辑的文档不动，避免无意义 diff）。
- 主要容器与交互控件须带语义化 kebab-case `id`。
- `eslint.config.js` 规则已拆分到 `eslint/rules/{core,bestPractices,quality}.js`，新增规则改对应文件。
- 工作台 TS：禁止 `any`（用 `unknown` + 收窄）；外部可选依赖写最小 `declare module`（见 `src/types/puppeteer.d.ts`）。

## 工具链陷阱（Windows / PowerShell）
- PowerShell 不支持 `dir /a`、`tail`、`>/dev/null`、`2>$null`；`Get-Content` 读 UTF-8 中文会乱码——
  判断文件内容一律用读取文件工具，不信终端回显；输出过滤用 `Select-String`。
- `node -e "..."` 中的 `$`、`[`、引号易被 PowerShell 吞掉；复杂脚本写成临时 `.mjs`/`.cjs` 文件执行后删除。
- 统计/校验类任务用 `node` 脚本跑（递归 walk + 行数统计），比 PowerShell 管道可靠。
- **`npm run format:check` 的 CRLF 误报（重要，别踩）**：本机 `core.autocrlf=true`，git 索引里
  **全部为 LF**，但检出后的工作区副本是 CRLF；`.prettierrc` 要求 `endOfLine: lf`，于是
  `format:check` 会对约 70 个**未改动**文件报错。这是本地视图差异，**不是仓库缺陷**——
  **不要为此执行 `npm run format`**（会把行尾就地改成 LF，产生全仓假 diff）。只需确认自己新建的文件通过检查即可。
