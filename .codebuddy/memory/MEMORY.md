# MEMORY.md

## 项目事实（GitHub_Chinese，截至 2026-09-30，v1.12.9）
- **双链路项目**：①用户脚本引擎（核心交付）——`build.cjs` 从 `src/main.js` 递归依赖图→拓扑→剥离 import/export→单文件 IIFE，产物 `build/GitHub_zh-cn.user.js`（~194KB，~92 模块）。`build/` 须纳入版本控制。②词典采集工作台——Next.js 16 App Router（`src/` 模式），路由 `/`、`/overview`、`/design`；API `src/app/api/collect`、`batch-collect`；`src/lib/{collector-core,dictionary-processor,page-navigation}.js` + `batch-collector.js` + `browser-semaphore.js`。两链路仅共享词典数据。
- **版本单一来源 = `src/version.js` 的 `VERSION`**（当前 **1.12.9**，HEAD 以 `git log` 实查）。全局展示位同步：`package.json`/README 徽章/CHANGELOG 小节/被改文件头注释。**每次改动 bump 最小版本（项目惯例按任务逐 patch 递增，如 T16→1.11.8…T36→1.11.15）；仅更新被改文件头注释，禁止全仓库批量刷写。**
- **npm 脚本**：`build`=`next build && node build.cjs`；`build:userscript`=`node build.cjs`；`dev`=Next 工作台；`dev:prototype`=`server.js`；`validate`=`node scripts/validate-bundle.cjs`；`test:unit`=`node --test`；`test`=lint→**lint:length**(>200 行失败)→build→test:unit→validate。
- **测试** = Node 内置 `node --test`（v1.9.30 起）。`tests/` 共 **62 用例**（59 非 a11y + 3 a11y；a11y 用 axe-core+jsdom 仅 serious/critical 阻断，无 `.next` 则 skip）。数据层单测覆盖 T17/T19/T20/T23/T24/T25/T36。route.ts 因 `@/` 别名不直测，逻辑抽纯函数。
- **Node >=22.22.2**（jsdom@30/undici@8 依赖 Node 22+；本地 Node 20 跑 a11y 会崩）。依赖 `puppeteer-core@^25.11.0`（已装，browser-resolver 解析系统 Chrome/Edge，支持 PUPPETEER_EXECUTABLE_PATH）。
- **任务清单单一来源 = `docs/PROGRESS.md` §5**（活动任务清单；详尽验收要点见 CHANGELOG.md 对应版本小节）。原 `docs/TASKS.md` 已于 v1.12.0 合并入 §5 并删除；`openspec/` 已于 v1.12.1 合并入 `docs/README.md` 并删除，`docs/` 为唯一权威正文。PROGRESS §8「变更记录」已于 v1.12.5 移除，变更历史统一收口至 `CHANGELOG.md`（其 §9 已声明 CHANGELOG 为唯一归处），避免同一变更在两处文档重复。
- **安全加固（已完成勿重复）**：SSRF `src/lib/url-guard.js`；CSP `src/proxy.ts` nonce（须写请求头）；OG/Twitter `layout.tsx`。

## 任务状态（v1.12.9）
- **已完成（数据层/闭环）**：T12–T17（采集精准/动态/重试/限流/匹配增强/覆盖率度量）、T19（审阅状态机）、T20（合并入库）、T22（覆盖率看板 UI，v1.11.16）、T23（历史对比）、T24（导入导出）、T25（搜索批量）、T26（page.evaluate 序列化回归，v1.10.2）、T27–T36（URL 上限/SSRF重定向/鉴权限流/SSE复用/前端重构/词条事件解耦/T33/T34/T35/采集重构）。
- **开放任务**：T18 采集源扩展(cookie/HAR, L)；T21 翻译建议(LLM, L)；以及 T19/T20/T23/T24/T25 已落地数据层的工作台 UI 接入 + localStorage 持久化。
- **W5 架构阻塞**：serverless(EdgeOne/Vercel) 无 Chrome，生产采集实际不可用，需自托管 Node 服务或任务队列（决策待定）。其余审查项 C1–C3/W1–W6/S1–S6 均已修。

## 关键工程经验
- **page.evaluate 序列化陷阱（T26）**：传入 `page.evaluate` 的函数仅序列化自身源码，模块级辅助/常量不注入浏览器上下文 → 运行时 ReferenceError。`extractPageText` 须自包含（辅助内联）；回归测试用 `vm.runInContext` 隔离模拟。
- **会话间隙版本漂移**：任何写文档/改版本动作前先读 `src/version.js` + `git log` 实查 HEAD，勿按旧记忆盲写（本项目高频自行 bump）。
- **并行编辑冲突**：用户可能在我发版编辑的同时自行 bump 版本并重写文档，导致 `replace_in_file` 因 old_str 已不匹配而整体失败；动手前先 `git status` / 重读目标文件确认无未保存的并行改动，失败后立即重读真实状态再修，勿假设旧快照。
- **自动化提交会扫入运行产物**：本项目存在并行/自动化流程会在我未提交的工作树改动后自动 `git add -A` 并提交（含版本 bump）并推送 origin/main；`git add -A` 会把未跟踪的运行产物（Playwright CLI 快照 `.playwright-cli/` / `*.yml` / 截图 `*.png` / `*.log` / 采集报告 `docs/untranslated-terms.txt`）一并纳入提交。每次清理/发版后务必 `git status` 复核，对运行产物先写入 `.gitignore` 再操作，避免脏文件进库（v1.12.4 曾误纳入 8 个产物，已补 `.gitignore` 并提交 `9c1b648` 清理）。

## 编码约定
- 源码单文件 ≤200 行须按职责拆分（文档 .md 不拆）；每次修改 bump 最小版本且仅改被改文件头注释；主要容器/交互控件加语义化 kebab-case `id`。

## 受保护 / 勿删
- 根 `GEMINI.md`、`metadata.json`（Google AI Studio 必需）；`build/GitHub_zh-cn.user.js`（@updateURL 依赖，随仓库提交）。

## 工具链陷阱（Windows/PowerShell）
- `Get-Content` 读 UTF-8 中文乱码 → 用读取文件工具；`node -e "..."` 的 `$`/`[`/引号被吞 → 写临时 `.mjs` 执行；搜代码用 `search_content` 的 `ignore_globs`（勿用 `!{negated}`）；长任务 `node --test` 直跑、输出 `Select-String` 过滤；批量改写仓库文档用 node 脚本时：① 文档为 CRLF，正则须用 `\r?\n` 且 `[^\r\n]*` 而非 `[^\n]*`；② 含中文顿号 `、`(U+3001) 的字面量在脚本里易失配（曾因目录树行带反引号、且码位核对偏差导致多次 replace 失败），优先用 `replace_in_file` 工具或先 `codePointAt` 确认码位；③ 同一文件多次编辑用单个脚本原子完成，避免多工具并行竞态（本项目高频被用户并行编辑）。

## 结构改进（2026-09-30 已完成，v1.12.9）
- **A 脚本归位**：根目录 8 个游离 `.cjs`（coverage/history-diff/io-dictionary/merge-dictionaries/merge-into-dictionary/review-store/term-operations/collect-dict）迁入 `scripts/`；`package.json` 的 `dict:collect`/`lint`/`format` 路径、`src/lib/dictionary-processor.js`、`scripts/collect-history.cjs`、7 个测试 require 全部同步；根目录仅保留 `build.cjs`（用户脚本构建）与 `server.js`（prototype 预览）。
- **B 同名消歧**：`src/utils/tools/dictionaryProcessor.js`（词典统计）重命名为 `dictionaryStats.js`、类名 `DictionaryStats`，消除与 `src/lib/dictionary-processor.js`（采集清洗桥接）歧义。
- **D 统一日志**：新增 `src/utils/logger.js` 门面（统一前缀 + 级别过滤，Node 侧 `GITHUB_ZH_LOG` 调级）；供服务端/新代码（采集服务、客户端）使用；引擎调试日志仍由 `CONFIG.debugMode` 守卫，未做大面积 console 替换（避免破坏脚本 stdout 契约与高 churn）。
- **E prototype 分工**：README 明确 `prototype/` = 轻量高保真预览（不接真实后端/无持久化），`src/app` Next 工作台 = 正式采集/审阅/词典沉淀环境，二者不重叠（用户选择不删文件）。
- **G 引擎单测**：新增 5 个测试文件（Trie / LRU 缓存 / 部分匹配 / 词典管理 / 错误处理）共 **22 用例全过**；过程中发现并修复 `dictionaryManager.getTranslatedText` 未命中返回 `undefined`（应 `null`）的真实 bug——`=== null` 误判导致误缓存 undefined 及 `sanitizeText(undefined)` 崩溃，改为 `== null` 判断 + 返回 `null`。
- **H W5 采集解耦**：新增 `server/collect-service/index.js`（可自托管 Node 服务，复用 `src/lib/collector-core`，HTTP+SSE 暴露 `/api/collect`/`/api/batch-collect`/`/health`）+ `src/lib/collect-service-client.js`（配置 `COLLECT_SERVICE_URL` 时代理 SSE，否则返回 null 走本地兜底）；采集路由 `collect`/`batch-collect` 已接入；新增 `npm run collect-service`。解决 serverless 无浏览器导致生产采集不可用。
- **I 版本收口**：核查 `src/version.js` 为唯一版本源，`versionChecker/fetcher.js` 仅做远程比对、无重复版本逻辑，无需改代码。
- **C @babel/core**：因生产采集子进程（`collect-dict.cjs`→`merge-dictionaries.cjs`）运行时依赖，仍保留于 `dependencies`；H 服务化后其归属由服务依赖接管（待办）。
- **F public/css→Next import**：**已完成**——14 个样式经 `git mv` 等价迁移（文件工具实现，因 execute_command 审批通道不可用）至 `src/app/styles/`，`layout.tsx` 改为 `import` 引入（保持原级联顺序），删除空 `public/css/`；`globals.css`/`design/page.tsx` 注释与文案同步；版本 bump 至 v1.12.9。CSS 不在 `lint:length` 扩展名范围内（仅 js/cjs/mjs/ts/tsx），`layout.css` 212 行不受限。
- 当前版本：**v1.12.9**（2026-09-30）。
