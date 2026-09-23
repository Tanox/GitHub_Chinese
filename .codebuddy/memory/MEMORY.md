# MEMORY.md

## 项目事实（稳定，截至 v1.9.33 / 2026-09-23，经实地核查刷新）

- **GitHub_Chinese（e:/Github/GitHub_Chinese）是「双链路」项目**，两条链路相互独立、仅共享词典数据：
  1. **用户脚本引擎（核心交付物）**：原生 ESM JS，`build.cjs` 从入口 `src/main.js` 递归解析依赖图
     → 拓扑排序 → 剥离 import/export → 拼接为单文件 IIFE，产物 `build/GitHub_i18n.user.js`（约 193 KB）。
     `build/` 未被 .gitignore 忽略，必须纳入版本控制。当前纳入模块 ~92，孤立 0，循环引用 0。
  2. **词典采集工作台**：Next.js 16（App Router，`src/` 模式），路由 `/`、`/overview`、`/design`；
     API `src/app/api/collect/route.ts`、`batch-collect/route.ts`；`src/proxy.ts`（Next 16 约定的 proxy）；
     `src/lib/collector-core.js` + `dictionary-processor.js`（spawn `collect-dict.cjs`，与用户脚本共享词典）。
- **版本单一来源 = `src/version.js` 的 `VERSION`**（当前 1.9.33）。全局展示位须同步：
  `package.json` version、`README.md` 徽章、`CHANGELOG.md` 小节、被改文件头注释。
- **npm 脚本语义**：`build`=用户脚本构建；`build:web`=`next build`；`dev`=Next 工作台；
  `dev:prototype`=`server.js`（原型热更新）；`validate`=`node scripts/validate-bundle.cjs`；
  `test:unit`=`node --test`（Node 内置 runner，零新增依赖）；`test`=lint→build→test:unit→validate。
- **测试**：v1.9.30 移除未启用的 Jest，改用 Node 内置 `node --test`。`tests/` 共 3 文件 / 8 用例
  （collect-codes 2、collect-dict 3、smoke 3）。**无 API 路由/SSE/错误码集成测试**。
- **质量现状**（v1.9.33 核查）：`npm run lint` 0 error/0 warning；`tsc --noEmit` 通过（strict:true）；
  **全部代码文件 ≤200 行**（0 超出，但 configUI.js 191 / virtualDom/manager.js 190 / useCollector.ts 189 /
  performanceMonitor.js 186 贴线，需防回潮）。
- **依赖**：`puppeteer-core@^25.11.0` **已安装**；`browser-resolver.js` 解析系统 Chrome/Edge
  （支持 `PUPPETEER_EXECUTABLE_PATH`），运行期 `createRequire`/变量说明符动态加载；`next.config.mjs` **不**声明
  `serverExternalPackages`（该包为 ESM，显式外部化会触发 Turbopack 告警）。`dependencies` 含 express/ws/next/react。
- **锁文件**：仅 `package-lock.json`（v1.9.29 已删除 `bun.lock`，**无双锁漂移**）。
- **文档权威性**：`docs/` 是唯一权威正文；`openspec/*.md` 仅是指向 `docs/` 的简短索引。
  新增/修改规范文档只改 `docs/`，`openspec/` 只维护索引与 config.yaml。
- **已知真实短板（待办，见 docs/IMPROVEMENT-TASKS.md）**：
  1. **SSRF（高危）**：`batch-collect` 对用户 URL 仅 `Array.isArray` 校验，`collector-core.js:107`
     `page.goto(url)` 无协议/主机/私网白名单 → 内网探测风险。
  2. **proxy 缺 CSP**：`src/proxy.ts` 仅 3 个安全头（nosniff/frame-deny/referrer/x-dns），无 Content-Security-Policy。
  3. **缺 OG/Twitter 元信息**：`src/app/layout.tsx` 仅 title/description。
  4. **PROGRESS.md 文档漂移**：P1-4（双锁）仍标 OPEN，但 bun.lock 已删、CHANGELOG 1.9.29 已记录修复；第 19 行仍写"双锁并存"。
- **已健康项**（勿重复处理）：req.json 容错已落地（v1.9.25）、构建可复现（无 Date/random 嵌入）、无 >200 行文件、双锁已消除。

## 编码约定（本项目）
- 单代码文件 ≤ 200 行，超长须按职责拆分（文档 .md 不适用，须保持完整）。
- 每次修改至少 bump patch 版本；仅同步被改动文件的头注释版本号，禁止全仓库批量刷写。
- 主要容器与交互控件须带语义化 kebab-case `id`。
- `eslint.config.js` 规则拆分到 `eslint/rules/{core,bestPractices,quality}.js`。

## 工具链陷阱（Windows / PowerShell）
- PowerShell 不支持 `dir /a`、`tail`、`>/dev/null`；`Get-Content` 读 UTF-8 中文会乱码——判断文件内容一律用读取文件工具。
- `node -e "..."` 中的 `$`、`[`、引号易被 PowerShell 吞掉；复杂脚本写成临时 `.mjs`/`.cjs` 文件执行后删除。
- 统计/校验类任务用 `node` 脚本跑（递归 walk + 行数统计），比 PowerShell 管道可靠。
- `npm test` 之类长任务直接跑，输出用 `Select-String` 过滤，避免依赖 `tail`。
- 搜代码用 `search_content` 的 `ignore_globs`（勿用 `!{negated}` glob，会静默 0 匹配）。
- 会话间隙项目常被外部高频自行 bump 版本，**任何写文档动作前务必先读 `src/version.js` + `git log` 确认真实 HEAD 版本**，勿按旧记忆盲写。

## 仓库与提交
- 远程：`https://github.com/Tanox/GitHub_i18n.git`（分支 `main`）。产品名 "GitHub Chinese 简体中文"，但仓库旧名 `GitHub_i18n` 仍用于 URL/raw 路径（@updateURL 依赖），命名一致性待澄清（见 IMPROVEMENT-TASKS T9）。
- Husky + lint-staged 已启用；`lint-staged` v15 不支持顶层 `ignore` 键。
- `build/GitHub_i18n.user.js` 随仓库提交（README 一键安装与 `@updateURL` 指向它）。
