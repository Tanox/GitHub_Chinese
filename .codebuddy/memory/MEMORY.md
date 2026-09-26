# MEMORY.md

## 项目事实（GitHub_Chinese，截至 2026-09-26，v1.11.16）
- **双链路项目**：①用户脚本引擎（核心交付）——`build.cjs` 从 `src/main.js` 递归依赖图→拓扑→剥离 import/export→单文件 IIFE，产物 `build/GitHub_zh-cn.user.js`（~194KB，~92 模块）。`build/` 须纳入版本控制。②词典采集工作台——Next.js 16 App Router（`src/` 模式），路由 `/`、`/overview`、`/design`；API `src/app/api/collect`、`batch-collect`；`src/lib/{collector-core,dictionary-processor,page-navigation}.js` + `batch-collector.js` + `browser-semaphore.js`。两链路仅共享词典数据。
- **版本单一来源 = `src/version.js` 的 `VERSION`**（当前 **1.11.16**，工作树未提交；HEAD 1.11.14）。全局展示位同步：`package.json`/README 徽章/CHANGELOG 小节/被改文件头注释。**每次改动 bump 最小版本（项目惯例按任务逐 patch 递增，如 T16→1.11.8…T36→1.11.15）；仅更新被改文件头注释，禁止全仓库批量刷写。**
- **npm 脚本**：`build`=`next build && node build.cjs`；`build:userscript`=`node build.cjs`；`dev`=Next 工作台；`dev:prototype`=`server.js`；`validate`=`node scripts/validate-bundle.cjs`；`test:unit`=`node --test`；`test`=lint→**lint:length**(>200 行失败)→build→test:unit→validate。
- **测试** = Node 内置 `node --test`（v1.9.30 起）。`tests/` 共 **62 用例**（59 非 a11y + 3 a11y；a11y 用 axe-core+jsdom 仅 serious/critical 阻断，无 `.next` 则 skip）。数据层单测覆盖 T17/T19/T20/T23/T24/T25/T36。route.ts 因 `@/` 别名不直测，逻辑抽纯函数。
- **Node >=22.22.2**（jsdom@30/undici@8 依赖 Node 22+；本地 Node 20 跑 a11y 会崩）。依赖 `puppeteer-core@^25.11.0`（已装，browser-resolver 解析系统 Chrome/Edge，支持 PUPPETEER_EXECUTABLE_PATH）。
- **任务清单单一来源 = `docs/TASKS.md`**（§1 活动任务 / §2 归档索引；详细改动见 CHANGELOG.md）。文档权威在 `docs/`，`openspec/` 仅索引。
- **安全加固（已完成勿重复）**：SSRF `src/lib/url-guard.js`；CSP `src/proxy.ts` nonce（须写请求头）；OG/Twitter `layout.tsx`。

## 任务状态（v1.11.15）
- **已完成（数据层/闭环）**：T12–T17（采集精准/动态/重试/限流/匹配增强/覆盖率度量）、T19（审阅状态机）、T20（合并入库）、T22（覆盖率看板 UI，v1.11.16）、T23（历史对比）、T24（导入导出）、T25（搜索批量）、T26（page.evaluate 序列化回归，v1.10.2）、T27–T36（URL 上限/SSRF重定向/鉴权限流/SSE复用/前端重构/词条事件解耦/T33/T34/T35/采集重构）。
- **开放任务**：T18 采集源扩展(cookie/HAR, L)；T21 翻译建议(LLM, L)；以及 T19/T20/T23/T24/T25 已落地数据层的工作台 UI 接入 + localStorage 持久化。
- **W5 架构阻塞**：serverless(EdgeOne/Vercel) 无 Chrome，生产采集实际不可用，需自托管 Node 服务或任务队列（决策待定）。其余审查项 C1–C3/W1–W6/S1–S6 均已修。

## 关键工程经验
- **page.evaluate 序列化陷阱（T26）**：传入 `page.evaluate` 的函数仅序列化自身源码，模块级辅助/常量不注入浏览器上下文 → 运行时 ReferenceError。`extractPageText` 须自包含（辅助内联）；回归测试用 `vm.runInContext` 隔离模拟。
- **会话间隙版本漂移**：任何写文档/改版本动作前先读 `src/version.js` + `git log` 实查 HEAD，勿按旧记忆盲写（本项目高频自行 bump）。

## 编码约定
- 源码单文件 ≤200 行须按职责拆分（文档 .md 不拆）；每次修改 bump 最小版本且仅改被改文件头注释；主要容器/交互控件加语义化 kebab-case `id`。

## 受保护 / 勿删
- 根 `GEMINI.md`、`metadata.json`（Google AI Studio 必需）；`build/GitHub_zh-cn.user.js`（@updateURL 依赖，随仓库提交）。

## 工具链陷阱（Windows/PowerShell）
- `Get-Content` 读 UTF-8 中文乱码 → 用读取文件工具；`node -e "..."` 的 `$`/`[`/引号被吞 → 写临时 `.mjs` 执行；搜代码用 `search_content` 的 `ignore_globs`（勿用 `!{negated}`）；长任务 `node --test` 直跑、输出 `Select-String` 过滤。
