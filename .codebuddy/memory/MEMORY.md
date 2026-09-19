# MEMORY.md

## 项目事实（稳定，截至 v1.9.24 / 2026-09-19）

- **GitHub_Chinese（e:/Github/GitHub_Chinese）是「双链路」项目**，两条链路相互独立、仅共享词典数据：
  1. **用户脚本引擎（核心交付物）**：原生 ESM JS，`build.cjs` 从入口 `src/main.js` 递归解析依赖图
     → 拓扑排序 → 剥离 import/export → 拼接为单文件 IIFE，产物 `build/GitHub_i18n.user.js`
     （约 199 KB）。`build/` 未被 .gitignore 忽略（README「一键安装」链接指向它），**必须纳入版本控制**。
  2. **词典采集工作台**：Next.js 16（App Router，`src/` 模式），`src/app` + `src/components` +
     `src/lib` + `src/hooks` + `src/types` + `src/middleware.ts`，根级 `next.config.mjs`。
- **不存在 `web/` 目录**（v1.9.23 起由 `public/` 取代：`public/css/` 10 个模块 + `public/js/wizard/`）。
  旧文档/注释中的 `web/css/*`、`web/js/*` 均为过期路径。
- **版本单一来源 = `src/version.js` 的 `VERSION`**（当前 1.9.24）。工作台页面
  `src/app/page.tsx` 通过 `@/version` + `src/version.d.ts` 读取，不再硬编码。
- **构建脚本已自动化**：`scripts/build/moduleGraph.cjs`（依赖图 + 循环检测）、
  `scripts/build/transform.cjs`（ESM→单作用域 + 跨模块顶层重名冲突检测，冲突则构建失败）、
  `scripts/validate-bundle.cjs`（产物存在性/体积/语法/未定义引用扫描）。
  **不要再手工维护模块清单**——那正是 v1.9.24 修复的阻塞缺陷根因。
- **npm 脚本语义（关键，勿混用）**：`build` = 用户脚本构建（CI 依赖它产出 artifact）；
  `build:web` = `next build`；`dev` = Next 工作台；`dev:prototype` = `server.js`（原型热更新预览）；
  `validate` = `node scripts/validate-bundle.cjs`；`test` = lint → build → validate。
- 质量现状：`npm run lint` 0 error/0 warning；`tsc --noEmit -p tsconfig.json` 通过；
  **全部代码文件 ≤ 200 行**（v1.9.24 拆分了 6 处超长文件）。
- **文档权威性**：`docs/` 是唯一权威正文；`openspec/*.md` 自 v1.9.24 起仅是指向 `docs/` 的简短索引
  （此前为 100% 重复副本，长期脱节）。新增/修改规范文档只改 `docs/`，`openspec/` 只维护索引与 config.yaml。
- `jest.config.js` / `jest.setup.js` 存在但**未启用**（jest/jest-environment-jsdom/babel-jest 未安装，
  无测试用例）；`npm test` 不跑单测。
- `src/i18n/*`（9 个模块，含 manager/loader/lookup/storage/observers/formatters/constants）已实现但
  **无调用方**，构建时被报告为孤立模块、不参与打包；去留待决策。
- `puppeteer`（^25.11.0）在 package.json 声明但**未安装**（node_modules 只有 `puppeteer-core`）；
  批量 URL 采集已降级为返回明确错误提示。仓库同时存在 `package-lock.json` 与 `bun.lock`（双锁漂移风险）。
- 词典：`src/dictionaries/**` 共 12 个模块 / 459 个词条；`collect-dict.cjs` 递归扫描加载词典，
  结果写入 `docs/untranslated-terms.txt`。
- 采集服务端逻辑有两份实现：`src/lib/collector-logic.ts`（Next Route 使用，现行）与
  `src/server/collector.js`（Express，`server.js` 使用），待合并去重。
- `tsconfig.json` 为 `strict: false`（与「避免 any」约定不一致，待开启）。

## 仓库与提交
- 远程：`https://github.com/Tanox/GitHub_Chinese.git`（分支 `main`）。
  文档/package.json/用户脚本头中的旧名 `Tanox/GitHub_i18n` 两条 raw 路径实测均 200 且内容一致，
  自动更新不受影响；改名需谨慎（`@updateURL` 依赖 raw 路径）。
- **提交钩子是真的**：`.husky/pre-commit` → `lint-staged`（eslint --fix + prettier --write）。
  ⚠️ lint-staged v15 **不支持顶层 `ignore` 键**，写了会导致 pre-commit 直接失败、提交中断；
  排除目录请用 `.prettierignore` 或 eslint `ignores`。
- **构建产物须可复现**：`build.cjs` 先 `\r\n`→`\n` 再折叠空行（顺序颠倒会因 Windows CRLF 残留空行，
  导致每次构建都产生 diff）。发版后应 `node build.cjs` 再确认 `git status` 干净。
- `build/GitHub_i18n.user.js` 随仓库提交（README 一键安装与 `@updateURL` 都指向它）。

## 编码约定（本项目）
- 单代码文件 ≤ 200 行，超长须按职责拆分（文档 .md 不适用，须保持完整）。
- 每次修改至少 bump patch 版本；**仅同步被改动文件的头注释版本号**，禁止全仓库批量刷写。
- 主要容器与交互控件须带语义化 kebab-case `id`。
- `eslint.config.js` 规则已拆分到 `eslint/rules/{core,bestPractices,quality}.js`，新增规则改对应文件。

## 工具链陷阱（Windows / PowerShell）
- PowerShell 不支持 `dir /a`、`tail`、`>/dev/null`；`Get-Content` 读 UTF-8 中文会乱码——判断文件内容一律用
  读取文件工具，不信终端回显。
- `node -e "..."` 中的 `$`、`[`、引号易被 PowerShell 吞掉；复杂脚本写成临时 `.mjs`/`.cjs` 文件执行后删除。
- 统计/校验类任务用 `node` 脚本跑（递归 walk + 行数统计），比 PowerShell 管道可靠。
- `npm test` 之类长任务直接跑，输出用 `Select-String` 过滤，避免依赖 `tail`。
