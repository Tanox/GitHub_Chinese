# MEMORY.md

## 项目事实（稳定，截至 v1.11.1 / 2026-09-25，经实地核查刷新）

- **GitHub_Chinese（e:/Github/GitHub_Chinese）是「双链路」项目**，两条链路相互独立、仅共享词典数据：
  1. **用户脚本引擎（核心交付物）**：原生 ESM JS，`build.cjs` 从入口 `src/main.js` 递归解析依赖图
     → 拓扑排序 → 剥离 import/export → 拼接为单文件 IIFE，产物 `build/GitHub_zh-cn.user.js`（约 194 KB，v1.9.43 由 `GitHub_i18n.user.js` 更名）。
     `build/` 未被 .gitignore 忽略，必须纳入版本控制。当前纳入模块 ~92，孤立 0，循环引用 0。
  2. **词典采集工作台**：Next.js 16（App Router，`src/` 模式），路由 `/`、`/overview`、`/design`；
     API `src/app/api/collect/route.ts`、`batch-collect/route.ts`；`src/proxy.ts`（Next 16 约定的 proxy）；
     `src/lib/collector-core.js` + `dictionary-processor.js` + `page-navigation.js`（导航/重试/滚动辅助，与用户脚本共享词典）；
     `collector-core.js` 仅保留采集编排；`batch-collector.js`（分批并发抓取，单浏览器内 ≤3 并发页）、`browser-semaphore.js`（全局 ≤2 并发无头浏览器信号量）、`page-navigation.js` 可单测、无浏览器依赖。
- **采集核心模块（v1.10.1 重构，Next.js 审查修复）**：`collector-core.js` 抽出 `batch-collector.js` 与 `browser-semaphore.js`；`dictionary-processor.js` 自 v1.9.47 起每请求用随机临时文件（`createRawTermsPath`）并 finally 清理——**临时文件竞态已修复**；SSRF 静态校验在 `collectFromUrls` 入口（`guardUrl`）。**T26 回归（v1.10.2 修复）**：`extractPageText` 原引用模块级 `resolveScopeRoot`/`isContentNoise`，经 `page.evaluate` 序列化丢失闭包导致整批提取 0 文本，已将全部辅助内联进函数使其自包含。
- **版本单一来源 = `src/version.js` 的 `VERSION`**（当前 1.11.15）。全局展示位须同步：
  `package.json` version、`README.md` 徽章、`CHANGELOG.md` 小节、被改文件头注释。
- **npm 脚本语义**：`build`=`next build && node build.cjs`（先产 Next.js 构建产物 `.next` 供 EdgeOne/OpenNext 部署打包，再构建用户脚本）；`build:userscript`=`node build.cjs`（用户脚本独立构建入口）；`build:web`=`next build`；`dev`=Next 工作台；
  `dev:prototype`=`server.js`（原型热更新）；`validate`=`node scripts/validate-bundle.cjs`；
  `test:unit`=`node --test`（Node 内置 runner，零新增依赖）；`test`=lint→build→test:unit→validate。
- **测试**：Node 内置 `node --test`（v1.9.30 起替代未启用的 Jest）。`tests/` 非 a11y **59 用例** + a11y **3 用例**（本会话新增 coverage/io-dictionary/review-store/merge-into-dictionary/term-operations/history-diff/collect-dict 数据层单测，覆盖 T17/T19/T20/T23/T24/T25/T36）。
  a11y 用 `axe-core` + `jsdom`（devDeps）检查 `next build` 的静态 HTML（仅 serious/critical 阻断；无产物则 skip；
  **axe 返回 jsdom realm 数组，须 `Array.from` 后再断言**）。
  **未直接测 route.ts**：其 `@/` 别名在纯 Node 下不可解析，故把可测逻辑抽为纯函数（如 `request-body.js`）。
- **质量现状**（v1.9.40 核查）：`npm run lint` 0/0；`npm run lint:length`（T6 门禁，>200 行即失败，
  **已覆盖根脚本** `collect-dict.cjs`/`build.cjs`/`server.js`，当前最大 `src/ui/configUI.js` 191）；
  `tsc --noEmit` 通过（strict:true）；`src/` 121 文件 / 9421 行（v1.9.48 实测）。
- **npm 脚本**：`test` = lint → **lint:length** → build → test:unit → validate；
  CI `security` 作业跑 `npm audit --audit-level=high`（T7，高危阻塞、低危放行；本地实测 0 漏洞）。
- **依赖**：`puppeteer-core@^25.11.0` **已安装**；`browser-resolver.js` 解析系统 Chrome/Edge
  （支持 `PUPPETEER_EXECUTABLE_PATH`），运行期 `createRequire`/变量说明符动态加载；`next.config.mjs` **不**声明
  `serverExternalPackages`（该包为 ESM，显式外部化会触发 Turbopack 告警）。`dependencies` 含 express/ws/next/react。
- **Node 版本**：dev 工具链**要求 Node >=22.22.2**。`devDependency` 的 `jsdom@30` / `undici@8` 均要求 Node 22+（`util.markAsUncloneable` 为 Node 22 才加入的 API）；CI（`ci-cd.yml`）`setup-node` 已升到 `node-version: '22'`，`package.json` `engines.node` 同步为 `>=22.22.2`。**本地若用 Node 20 跑 `node --test` 会因 `jsdom` 导入即崩溃**（`tests/a11y.test.mjs` 第 12 行 `import { JSDOM } from 'jsdom'`）。
- **锁文件**：仅 `package-lock.json`（v1.9.29 已删除 `bun.lock`，**无双锁漂移**）。
- **文档权威性**：`docs/` 是唯一权威正文；`openspec/*.md` 仅是指向 `docs/` 的简短索引。
  新增/修改规范文档只改 `docs/`，`openspec/` 只维护索引与 config.yaml。
- **任务清单单一来源 = `docs/TASKS.md`**（v1.9.34 起）：由 `docs/PROGRESS.md` 遗留任务与 `docs/IMPROVEMENT-TASKS.md` 合并而来；第 1 节为活动任务（当前为空），第 2 节「历史归档（已完成）」以**紧凑编号索引**列出 T1–T11 与 P0-1–P2-7（详细改动见 `CHANGELOG.md`）；`PROGRESS.md` 第 5 节仅指向该文件。`docs/code-review/*`（STANDARDS/PROCESS/CHECKLIST/SETUP_GUIDE）是审查流程标准套件、非任务追踪，独立保留不合并。
- **安全 / 文档加固（v1.9.35–36 已完成，勿重复）**：① SSRF → `src/lib/url-guard.js` 纯函数 +
  `CollectErrorCode.INVALID_URL`（采集前逐项校验；不做 DNS 解析，已知不防 DNS rebinding）；
  ② CSP → `src/proxy.ts` 基于 nonce（script-src nonce + strict-dynamic；**CSP 须同时写请求头**，Next 据此给自身脚本注入 nonce）；
  ③ OG/Twitter → `src/app/layout.tsx` 的 metadataBase / openGraph / twitter；④ PROGRESS 文档漂移已清理。
- **任务状态（v1.10.2）**：`docs/TASKS.md` 活动任务 T1–T11 + P0-1–P2-7 已归档；采集 P1 首批 **T12–T15 已实现（v1.10.0/1.10.1）**并标记完成；**T26 序列化回归已于 v1.10.2 修复**；待办 **T16/T18/T19–T25（匹配增强/采集源扩展/词典管理闭环）+ T27–T29（T27 URL 上限不一致；T28 lint 警告；T29 useCollector 触线重构）**，每条附验收要点，按 P1–P3 / S/M/L 推进；
  第 2 节为紧凑编号索引，详细改动见 `CHANGELOG.md`。新增事项从 `T12` 起按 `Txx` 追加到 §1。采集趋势数据在 `docs/collect-history.json`（由 `collect-dict.cjs` / `dict-report.cjs` 写入）。
- **已健康项**（勿重复处理）：req.json 容错已落地（v1.9.25）、构建可复现（无 Date/random 嵌入）、无 >200 行文件、双锁已消除。
- **采集工具审查整改**：nextjs-code-review 技能审查定位 C1–C3/W1–W6/S1–S6。已修：**v1.11.3**：W1/T27（统一 `MAX_COLLECT_URLS=20`）、C1（客户端断连释放浏览器/信号量/子进程）、W2（SSE 心跳）、W3/W6（子进程 120s 超时）。**v1.11.4**：C2（SSRF 重定向绕过——`gotoWithFallback` 请求拦截二次 `guardUrl` 校验）、S2（抽 `src/lib/sse-stream.ts` `createSseResponse` 复用两路由）。**v1.11.5**：C3（采集端点鉴权+限流——`src/lib/api-guard.ts` `checkApiAccess`，可选 `COLLECT_API_TOKEN` Bearer + 每 IP 固定窗口限流 429+Retry-After）、T33（`browser-semaphore.js` 经核查 `no-promise-executor-return` 已合规，标记关闭）。**v1.11.6**：T29/T34（`useCollector.ts` 按职责拆分为 `collector-types.ts`/`collector-constants.ts`/`collector-sse.ts`，主文件仅保留编排并 re-export 类型契约不变，移除 `CollectErrorCode` 死导入，`npm run lint:length` 全 <200 行）。**v1.11.7**：S1/T35（`useCollector.ts` 删除 `TERM_LINE_RE` 反解；后端 `dictionary-processor.js` stdout 解析 `N. "term"` 改发结构化 `term` 事件 `{type:'term',data:{text}}`；`collector-types.ts`/`collector-logic.ts`/`dictionary-processor.js` 的 `CollectEvent`/`StreamEvent` 均增 `'term'`；`collector-constants.ts` 移除 `TERM_LINE_RE`；另修复 C2(v1.11.4) 遗留回归——`batch-collector.test.mjs` 假浏览器缺 `setRequestInterception/on/off`，补齐后单测 27/27 通过；用户脚本产物 `build/GitHub_zh-cn.user.js` 随版本 bump 已 `node build.cjs` 重建）。**v1.11.8**：T16（匹配策略增强——`collect-dict.cjs` 新增 `stripTemplateTokens`，`findUntranslated` 增「去占位符词典索引」，`%s`/`%1$s`/`%(name)s`/`{0}`/`{{var}}`/`:name` 已翻译串可命中非模板词典，降低「已翻译却判待翻译」误报；复数/词级模糊匹配留后续）。**v1.11.9**：T17（覆盖率度量数据层——新增 `coverage.cjs` 的 `computeCoverage`，复用 `findUntranslated` 计算命中率、按页面/路由分类 `byPage`、Top-N 低覆盖 `lowCoveragePages`(升序)+`topUnmatched`(频率降序)，自动排除纯数字/纯标点/过短噪声以免污染分母；未命中词条按小写归一聚合；增补 `tests/coverage.test.cjs` 5 用例；工作台可视化看板留后续 UI 任务）。**v1.11.10**：T24（导入/导出增强——新增 `io-dictionary.cjs`：与现有扁平词典 `Object<string,string>`（含 `待翻译: ` 占位）对齐的 CSV/JSON 双向（`dictionaryToCsv`/`csvToDictionary` RFC4180 转义+表头跳过+`dedupe` 重复键策略+缺列抛错、`dictionaryToJson`/`jsonToDictionary` 对象/键值字符串校验）、`normalizeDictionary`（trim/丢空键/去重）；增补 `tests/io-dictionary.test.cjs` 10 用例）。**v1.11.11**：T19（词条级审阅工作流数据层——新增 `review-store.cjs` 不可变状态机 `STATUS`/`createReviewEntry`/`applyStatus`(history 追溯)/`mergeReviewUpdates`/`summarize`/`serialize`/`deserialize`(JSON 持久化+跳过非法)，增补 `tests/review-store.test.cjs` 7 用例；localStorage 与 UI 留前端）。**v1.11.12**：T20（一键合并入库数据层——`merge-into-dictionary.cjs` 衔接 review-store：`selectMergedEntries`(仅 translated、译文取 note、无译文生成 `待翻译: 词条`、IGNORED/NEEDS_REVIEW/PENDING 不入库)/`buildDictionaryPatch`(added/updated 分离、值同跳过)/`applyPatch`(不可变)/`renderDiffPreview`(PR 式 +/- 文本)；增补 `tests/merge-into-dictionary.test.cjs` 4 用例；前端复制/下载/写文件留接入）。**v1.11.13**：T25（搜索与批量操作数据层——`term-operations.cjs` `searchDictionary`(term/translation 命中、大小写可选、空返回全部)/`filterUntranslated`(`待翻译: ` 占位)/`batchApplyStatus`(复用 review-store 批量标记、不可变)；批量导出复用 T24 io-dictionary；增补 `tests/term-operations.test.cjs` 4 用例；UI 搜索框/勾选/导出按钮留前端）。**v1.11.14**：T23（历史轮次对比数据层——`history-diff.cjs` `diffDictionaries`(新增/删除/变更词条级 diff)/`buildRoundRecord`(含 diff + 默认 snapshot)/`restoreFromRecord`(从快照回滚)/`compareRounds`(对比历史任意两轮)；扩展 `scripts/collect-history.cjs` 新增 `appendRound` 写词条级轮次记录；增补 `tests/history-diff.test.cjs` 4 用例；采集流程接入 collect-dict.cjs + 工作台对比/回滚 UI 留后续（受 W5 影响））。**v1.11.15**：T36（采集工具重构（参考原型 docs/prototype.md §3.3）——抽出 analyzeTexts(findUntranslated+computeCoverage) 接覆盖率日志；dict-report 的 generateReport 改用 appendRound 写词条级 diff 历史（含快照，闭环 T23 接入）并输出覆盖率；collect-history 的 readHistory/appendRound 支持 filePath 注入；为压 200 行上限抽出 merge-dictionaries.cjs（collect-dict 改 require 并 re-export）；新增 tests/collect-dict.test.cjs 3 用例；保留 stdout N. "term" 契约兼容 dictionary-processor，不动 puppeteer/Next.js（受 W5））。**审查报告剩余仅 W5**：serverless（EdgeOne/Vercel）无 Chrome，生产采集实际不可用，需改自托管 Node 服务或任务队列（架构决策）。

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

## 受保护文件（勿清理 / 勿删除）
- 根目录 **`GEMINI.md`** 与 **`metadata.json`** 是 **Google AI Studio 必需文件**。即便它们与项目构建/交付物无直接代码引用，也**绝对不能清理或删除**——即使在「减少根目录文件 / 去除冗余」类任务中也须保留。
  - `GEMINI.md`：Gemini 自定义指令（"对话 Suggestions 保持中文"）。
  - `metadata.json`：含 `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`，AI Studio 项目元数据。
  - 备注：本会话（2026-09-25）曾误删二者，已 `git checkout HEAD --` 恢复；此后须显式跳过这两个路径。

## 原型结构（v1.9.46 起）
- 高保真原型现为**单一文件** `prototype/prototypes/index.html`（桌面版「GitHub 页面字符串采集工具」采集工作台，2026-09-25 由 `desktop.html` 重命名而来，并删除 `mobile.html`）。`server.js` 的 `/prototype` 默认页指向它。样式复用 `prototype/assets/prototype.css`。
