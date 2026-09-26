# Changelog

## [1.12.1] - 2026-09-26

### Docs（合并 OpenSpec 索引入 docs）
- 合并 `openspec/` 规范索引与配置入 `docs/`：原 `openspec/*.md` 的导航索引与速览摘要并入 `docs/README.md`（成为唯一文档入口），删除 `openspec/` 目录，消除第二份文档副本与维护脱节。
- 修正活跃交叉引用：`docs/project.md`、`docs/architecture.md`、根 `README.md` 目录树移除 `openspec/`；`docs/development.md` 版本同步清单移除 `openspec/config.yaml`、相关文档链接改指 `./project.md`；`docs/coding-style.md` 相关文档链接改指 `./project.md`；`docs/README.md` 权威性说明改为「docs 为唯一权威正文」。
- 版本同步：`src/version.js`、`package.json`、`README.md`、`docs/{README,project,architecture,development,coding-style}.md` 头部版本统一升级至 v1.12.1（patch，docs 收口）。

### Refactor（应用 UI 对齐原型，首页重构）
- `CollectorConsole` 以原型四区块（h2+meta）包裹各模块；`DataCenter` 补原型描述「两种采集入口，智能清洗后一键导出 JSON。」；`Shell` 新增页脚（原型 `proto-footer`）；`grid-2` 列宽对齐原型 `1fr 1fr`；新增 `.section`/`.footer` 样式。被改文件头注释同步 1.12.1。

## [1.12.0] - 2026-09-26

### Docs（任务清单单一文档收口）
- **合并 `docs/TASKS.md` 入 `docs/PROGRESS.md` §5**：
  - PROGRESS §5 从"指针行"升级为活动任务清单，合入 TASKS.md 剩余两条未完成项（T18 采集源扩展、T21 翻译建议），已完成任务的验收要点保留在本文件各版本小节。
  - PROGRESS §9 Roadmap 改写为指向本文档 §5（不再引用 TASKS.md 路径）。
  - PROGRESS §4.9 版本同步清单移除 `docs/TASKS.md`（该文件删除）。
  - 删除 `docs/TASKS.md` 文件；全局搜索确认 CHANGELOG.md 与 PROGRESS.md §4/§8 中仅保留历史版本事实陈述（"v1.9.34 新增 TASKS.md"、"v1.9.41 清理 TASKS.md"等），无可断链的活跃交叉引用。
- **版本同步**：`src/version.js`、`package.json`、`README.md`、`docs/PROGRESS.md` 头部版本号统一升级至 v1.12.0（MINOR，docs 类型）。
- **同步 `docs/prototype.md` 至 v1.12.0**：版本横幅 1.9.48 → 1.12.0；导航由三页扩为四页（新增 `/coverage` 覆盖率看板，T22）；`原型 ↔ 实现映射` 表补覆盖率看板行。
- **同步 `docs/project.md` 至 v1.12.0（写满开发现状）**：版本横幅与项目信息 1.9.43 → 1.12.0；目录结构补 `/coverage` 并展开 `src/lib`/`components`/`hooks` 真实模块；§5 采集工作台补全 SSRF/CSP/限流/覆盖率等模块与根级数据层脚本；新增「开发现状」专节（双链路、量化指标、已完成能力、活动任务 T18/T21、迭代里程碑）。

## [1.11.16] - 2026-09-26

### Feat（覆盖率 / 缺口看板，T22）
- **T22 覆盖率/缺口看板**：新增 `src/app/coverage` 页面 + 服务端取数模块 `src/lib/coverage-report.ts`（实时扫描磁盘词典，无需浏览器，规避 W5 架构约束）：
  - 整体词典覆盖率（已翻译占比）、按词典文件（common/codespaces/explore）细分覆盖率进度条；
  - Top-N 采集缺口（读取 `docs/untranslated-terms.txt` 最近一次采集未翻译词条）；
  - 重复/冲突检测：跨模块同键多值冲突、一致重复键计数，以及近似键（大小写/空白/标点差异）聚类。
  - 复用工作台 `Shell` 外壳与 `progress`/`showcase` 设计令牌，新增 `public/css/coverage.css`；导航新增「覆盖率」项（`src/components/navItems.ts`）。

## [1.11.15] - 2026-09-25

### Feat（采集工具重构，参考原型 §3.3，打通 T17/T23 数据层）
- **T36 采集工具重构**：`collect-dict.cjs` 抽出 `analyzeTexts`（`findUntranslated` + `computeCoverage`，运行时 require 避免与 `coverage.cjs` 循环依赖），`main` 变薄并 log 覆盖率；`scripts/dict-report.cjs` 的 `generateReport` 改用 `appendRound` 写**词条级 diff 历史**（含快照以支持 T23 回滚/轮次对比，闭环 T23 数据层接入），并输出覆盖率段落；`scripts/collect-history.cjs` 的 `readHistory`/`appendRound` 支持可选 `filePath` 注入以便单测。
- 保留 stdout `N. "term"` 输出契约（`src/lib/dictionary-processor.js` 解析兼容），不动 puppeteer/Next.js 抓取栈（受 W5 架构约束）。
- 为压到 200 行上限并提升可测试性，将 `mergeDictionaries`/`listDictionaryFiles` 抽出为独立 `merge-dictionaries.cjs`，`collect-dict.cjs` 改 require 并 re-export（同时移除 `path`/`@babel/core` 顶层依赖）。
- 增补 `tests/collect-dict.test.cjs`（3 用例）覆盖 `analyzeTexts`（覆盖率/噪声过滤）与 `generateReport` 写报告＋轮次 diff 历史（路径注入）。

## [1.11.14] - 2026-09-25

### Feat（历史明细与轮次对比，T23 数据层）
- **T23 历史轮次对比**：新增 `history-diff.cjs`：
  - `diffDictionaries` 计算两轮词典的词条级 diff（新增/删除/变更）、`buildRoundRecord` 生成含 diff（默认含完整 snapshot 以支持回滚）的轮次记录、`restoreFromRecord` 从快照回滚、`compareRounds` 对比历史中任意两轮。
  - 扩展 `scripts/collect-history.cjs` 新增 `appendRound`，写入词条级轮次记录（默认含快照）。
  - 增补 `tests/history-diff.test.cjs`（4 用例）覆盖 diff、轮次记录、回滚与对比。
  - 采集流程接入（`collect-dict.cjs` 调用 `appendRound`）与工作台 UI 对比/回滚面板留后续（受 W5 架构决策影响）。

## [1.11.13] - 2026-09-25

### Feat（搜索与批量操作，T25 数据层）
- **T25 搜索与批量操作**：新增 `term-operations.cjs`：
  - `searchDictionary` 关键词命中 `term`/`translation`（大小写可选，空查询返回全部）、`filterUntranslated` 筛出 `待翻译: ` 占位条目、`batchApplyStatus` 复用 `review-store.mergeReviewUpdates` 批量标记且不可变。
  - 批量导出复用 T24 的 `io-dictionary`。
  - 增补 `tests/term-operations.test.cjs`（4 用例）覆盖搜索命中、大小写、待翻译筛选与批量标记。
  - UI 搜索框/勾选/导出按钮留前端接入。

## [1.11.12] - 2026-09-25

### Feat（一键合并入库，T20 数据层）
- **T20 一键合并入库**：新增 `merge-into-dictionary.cjs` 衔接 `review-store.cjs` 的审阅结果：
  - `selectMergedEntries` 仅收录 `translated` 词条；译文约定取自 `entry.note`（审阅 UI 写入备注），无译文生成 `待翻译: 词条` 占位；`IGNORED`/`NEEDS_REVIEW`/`PENDING` 不入库。
  - `buildDictionaryPatch` 分离 `added`/`updated`（值相同跳过）、`applyPatch` 不可变合并、`renderDiffPreview` 输出 PR 式 `+`/`~` 文本供复制/下载。
  - 增补 `tests/merge-into-dictionary.test.cjs`（4 用例）覆盖筛选/占位、新增更新跳过、不可变应用与预览。
  - 前端复制/下载与写入词典文件留接入。

## [1.11.11] - 2026-09-25

### Feat（词条级审阅工作流，T19 数据层）
- **T19 词条级审阅工作流**：新增 `review-store.cjs` 不可变状态机，供工作台标记「已翻译/忽略/需复核」：
  - `STATUS`（pending/translated/ignored/needs_review）、`createReviewEntry`（默认 pending，内嵌 `history` 含 create 事件）、`applyStatus`（状态迁移、追加 history、不可变）、`mergeReviewUpdates`（批量合并、不可变）、`summarize`（各状态计数）。
  - `serialize`/`deserialize` 支持 JSON 文件持久化；反序列化跳过非法条目并计数，非对象抛错。
  - 增补 `tests/review-store.test.cjs`（7 用例）覆盖默认状态、非法拒绝、不可变迁移、批量合并、统计与序列化往返。
  - 持久化媒介（localStorage）与工作流 UI 留前端接入。

## [1.11.10] - 2026-09-25

### Feat（导入/导出增强，T24）
- **T24 导入/导出增强**：新增 `io-dictionary.cjs`，与现有扁平词典结构 `Object<string,string>`（含 `待翻译: ` 占位条目）对齐：
  - CSV 双向：`dictionaryToCsv` / `csvToDictionary`，RFC4180 引号/逗号/换行转义、支持 BOM、默认跳过表头、`dedupe`（`error`/`last`/`first`）重复键策略、缺列抛错。
  - JSON 双向：`dictionaryToJson` / `jsonToDictionary`，校验为对象且键/值均为字符串。
  - `normalizeDictionary`：trim 键/值、丢弃空键、重复键按策略合并，返回去重统计。
  - 增补 `tests/io-dictionary.test.cjs`（10 用例）覆盖转义往返、表头/无表头、去重策略、缺列与非对象/非字符串校验、归一。

## [1.11.9] - 2026-09-25

### Feat（覆盖率度量，T17 数据层）
- **T17 覆盖率度量与报告**：新增 `coverage.cjs`（`computeCoverage` + `isTranslatableCandidate`），复用 `collect-dict.cjs` 的 `findUntranslated` 计算 UI 串翻译覆盖率：
  - `rate` = 命中词典候选数 / 可翻译候选总数；自动排除纯数字、纯标点、过短（<2）、不含字母/中文的噪声，避免污染分母。
  - 按页面/路由分类（`byPage`：每页 `total/covered/rate/unmatched`）；`lowCoveragePages` 按覆盖率升序排列便于定位大面缺口；`topUnmatched` 按未命中频率降序输出 Top-N（默认 10）。
  - 同步复用 T16「去占位符索引」，含 `%s`/`{{var}}` 等的已翻译串仍计入命中。
  - 增补 `tests/coverage.test.cjs`（5 用例）覆盖命中、页面分类、Top-N、占位符复用与空输入。工作台可视化看板（覆盖率/缺口面板渲染）留作后续独立 UI 任务。

## [1.11.8] - 2026-09-25

### Refactor（采集匹配增强，T16）
- **T16 匹配策略增强（占位符归一）**：`collect-dict.cjs` 新增 `stripTemplateTokens`，在 `findUntranslated` 中构建「去占位符词典索引」——含 `printf`（`%s`/`%1$s`/`%%`）、Python 命名（`%(name)s`）、编号（`{0}`）、mustache（`{{var}}`）、Ruby 命名（`:name`）等占位符的**已翻译**候选串，可与**非模板**词典词条匹配，降低「已翻译却因含占位符被判待翻译」的误报。新增 `stripTemplateTokens` 直接单测与命中/回归用例（含「不误伤无关串」）。
- 验收边界：仅做占位符归一，**未**引入词级/子串模糊匹配与复数（singular/plural 词形）归一，避免引入新的误匹配；二者留作后续独立任务（如确需可另开任务跟踪）。

## [1.11.7] - 2026-09-25

### Refactor（S1：消除前后端输出格式耦合）
- **S1 / T35** 前端 `useCollector.ts` 原用 `TERM_LINE_RE` 正则反向解析 `dict-report.cjs` 的 `N. "term"` stdout，两端强耦合。改为后端 `dictionary-processor.js` 在解析子进程输出时直接识别词条行并下发结构化 `term` 事件 `{ type: 'term', data: { text } }`；前端 `applyEvent` 直接消费 `term` 事件填充词条面板，**不再依赖任何输出文本格式**。
- 类型同步：`collector-types.ts` 的 `StreamEvent`、服务端 `collector-logic.ts` 的 `CollectEventType`、`dictionary-processor.js` 的 `CollectEvent` 均新增 `'term'` 类型。`collector-constants.ts` 移除已无用的 `TERM_LINE_RE`。
- 词条行仍作为 `log` 事件保留在日志流中，原有 UI 展示不受影响。

## [1.11.6] - 2026-09-25

### Refactor（采集前端重构，行为不变）
- **T29 / T34** `useCollector.ts` 触及 200 行上限，按职责拆分为 `collector-types.ts`（共享类型）、`collector-constants.ts`（`IDLE_PROGRESS` / `TERM_LINE_RE` / `PERCENT_MAX`）、`collector-sse.ts`（纯函数 `readSseStream`，无 React 依赖、可单测）。主文件仅保留编排逻辑，并通过 `export type` 重新导出原有类型，**组件导入契约不变**。
- 顺手移除 `useCollector.ts` 中未使用的 `CollectErrorCode` 死导入（消除潜在 lint 警告）。

## [1.11.5] - 2026-09-25

### Fixed（采集工具安全加固）
- **C3 采集端点鉴权与限流**：新增 `src/lib/api-guard.ts` 的 `checkApiAccess`，为 `/api/collect` 与 `/api/batch-collect` 提供统一门禁——可选 `COLLECT_API_TOKEN` Bearer 令牌（仅配置后启用，默认开放、向后兼容、无需前端改动）+ 每 IP 固定窗口限流（默认 60s 内 30 次，超限返回 `429` + `Retry-After`）。令牌比对用 `crypto.timingSafeEqual` 恒定时间比较，避免可枚举。
- **T33** 核查 `browser-semaphore.js`：`acquireBrowserSlot` 的 Promise executor 为块级体、未返回 `waiters.push(...)` 结果，`no-promise-executor-return` 已合规，`npm run lint` 0 warning，标记关闭。

## [1.11.4] - 2026-09-25

### Fixed（采集工具安全与去重）
- **C2 阻断重定向 SSRF**：`page-navigation.gotoWithFallback` 启用请求拦截，对所有导航/文档类请求（含 HTTP 重定向目标）二次 `guardUrl` 校验，命中内网/链路本地/云元数据等非公网地址即 `req.abort()`，防止 `url-guard` 仅校验初始 URL 被 302 跳板绕过
- **S2 抽离公共 SSE 工厂**：新增 `src/lib/sse-stream.ts` 的 `createSseResponse`，将「客户端断连取消 + 15s 心跳 + 错误兜底 + 收尾关闭」样板收敛为单一实现，`/api/collect` 与 `/api/batch-collect` 两路由复用，消除重复与漂移风险

## [1.11.3] - 2026-09-25

### Fixed（采集工具健壮性与资源泄漏）
- **C1 客户端断连资源泄漏**：`collect`/`batch-collect` 路由现监听 `req.signal`，客户端断开即取消采集、关闭无头浏览器并释放 `browser-semaphore` 信号量槽；`dictionary-processor` 监听取消信号并 `SIGKILL` 终止清洗子进程
- **W1/T27 统一 URL 上限**：抽离单一 `MAX_COLLECT_URLS = 20` 常量（`request-body.js`），`collector-core.js` 执行期与 `request-body.js` 校验共用同一上限，消除「21–50 个 URL 校验通过却被运行期拒绝」的不一致
- **W2 SSE 心跳保活**：两路由每 15s 发送 `: ping` 注释帧，避免长任务（单页最长 30s 导航）经 EdgeOne/Vercel 代理被缓冲或超时断开
- **W3/W6 子进程超时保护**：`runDictionaryProcessor` 增加 120s 硬超时，挂起时终止子进程并下发错误事件，前端不再永久等待

## [1.11.2] - 2026-09-25

### Chore（清理：移除混入应用的旧采集向导）
- 删除 `public/js/collector-guide.js` 与 `public/js/wizard/`（constants/processor/renderer/store/stream/utils 共 7 文件）：旧版独立采集向导，功能已被 `src/app` + `src/lib` + `collect-dict.cjs` 取代，当前 Next.js 控制台未加载，属 `public/` 中废弃代码
- `docs/project.md` 目录树移除 `public/js` 行，将 `public/` 注释改为「Next 静态样式资源（css）」
- `tailwind.config.ts` 注释去掉对已删 `collector-guide` 的引用，改为「避免重置 public/css 自包含组件样式」
- 核查确认原型 `prototype/` 独立无混入；`public/css/*` 为应用自有设计系统（被 `layout.tsx` 实际使用），非原型泄漏

---

## [1.11.1] - 2026-09-25

### Fixed（EdgeOne 部署构建）
- 修复 EdgeOne Pages / OpenNext 部署失败：`npm run build` 原仅执行 `node build.cjs`（用户脚本构建），未生成 `.next` 目录，导致 OpenNext 插件报 `ENOENT: .next/required-server-files.json`
- `build` 脚本改为 `next build && node build.cjs`，确保部署时产出 Next.js 构建产物；新增 `build:userscript` 保留用户脚本独立构建入口
- 纠正工作树版本误降级（1.10.2 → 1.11.1，与 origin/main v1.11.0 对齐并 bump）

---

## [1.10.2] - 2026-09-25

### Fixed（T26 序列化回归）
- 修复 `extractPageText` 经 `page.evaluate` 序列化丢失模块闭包导致 v1.10.0 批量采集整批提取 0 文本的回归：将 `SKIP_TAGS` / `resolveScopeRoot` / `isContentNoise` 全部内联进 `extractPageText`，使其成为自包含纯函数
- 新增 `tests/extract-page-text.test.mjs`（jsdom 构造 DOM + `vm` 隔离上下文模拟 `page.evaluate` 序列化，断言实际提取到文本且跳过 script / 内容噪声 / 隐藏元素）
- 另补 `src/lib/browser-semaphore.js` / `src/lib/batch-collector.js` 单元测试（共 4 例）覆盖槽位上限交接与批量聚合/单页失败隔离

## [1.10.1] - 2026-09-25

### Docs
- 项目审查与任务文档更新：标记 **T15 采集并发上限与限流** 为完成（随 v1.10.0 由 `browser-semaphore.js` + `batch-collector.js` 落地，此前未入变更记录）
- 新增审查发现任务：**T26**（P1 回归缺陷）`extractPageText` 经 `page.evaluate` 序列化后丢失模块内 `SKIP_TAGS`/`resolveScopeRoot`/`isContentNoise`，导致 v1.10.0 批量采集整批提取 0 文本；**T27** 统一 URL 上限（`request-body.js` 校验 50 与 `collector-core.js` 执行 20 不一致）；**T28** 清理 `browser-semaphore.js` 的 `no-promise-executor-return` lint 警告；**T29** 重构 `useCollector.ts`（恰为 200 行触线边界）
- 同步版本展示位至 v1.10.1：`src/version.js`、`package.json`、`README.md`、`docs/PROGRESS.md`、`docs/TASKS.md`

---

## [1.10.0] - 2026-09-25

### Added（采集成功率 P1 首批：T12–T14）
- **T12 提取精准化**：`src/lib/extract-page-text.js` 作用域从整页 `body` 收窄为 GitHub SPA 根（`#react-app` / `.application-main` 回退 `body`），并跳过 `markdown-body`/`highlight`/`blob-code`/`CodeMirror`/评论等「内容型容器」降噪
- **T13 SPA/动态适配**：抽离 `src/lib/page-navigation.js`，导航优先 `networkidle2`、超时降级 `domcontentloaded` + 固定等待；等待 hydration（`#react-app`）后再提取；`autoScroll` 滚动触发懒加载
- **T14 单页鲁棒性**：`navigateWithRetry` 实现逐 URL 错误隔离（单页失败不中断整批、记日志续跑）+ 导航超时/反爬(429)/网络错误指数退避重试（最多 3 次，1s→2s→4s）
- 新增 `tests/page-navigation.test.mjs`（4 用例）覆盖退避延迟与可重试判定；采集核心 `collector-core.js` 仅保留编排，门禁 0 超限、lint 0 warning

## [1.9.49] - 2026-09-25

### Docs
- 文档单一来源收口：确立 `CHANGELOG.md` 为变更唯一归处，`docs/TASKS.md` 与 `docs/PROGRESS.md` §9 不再复述同一变更
- `docs/TASKS.md` 的 T12–T25 每条补「验收要点」（设计契约），使待完成功能在任务清单内完整可落地
- `docs/PROGRESS.md` §9 由逐条罗列改为规划指针（主题叙述 + 指向 TASKS/CHANGELOG），消除多文档重复
- 同步版本展示位至 v1.9.49：`src/version.js`、`package.json`、`docs/PROGRESS.md`、`docs/TASKS.md`

---

## [1.9.48] - 2026-09-25

### Docs
- 刷新 `docs/PROGRESS.md` §1.1 指标为实算值：`src/` 源码 120→121 文件 / 9342→9421 行、原型资产 16→1 HTML + 10 CSS；补 §4.7（v1.9.43–1.9.47 迭代摘要）、§8 变更记录、§9 Roadmap
- 新增规划：采集成功率/覆盖率提升（提取精准化、SPA 动态适配、错误隔离与退避、并发限流、匹配策略增强、覆盖率度量、采集源扩展）与采集后词典管理增强（词条级审阅、一键合并入库、翻译建议、缺口看板、历史明细、导入导出、搜索批量）
- 将上述规划拆为任务清单 `docs/TASKS.md` T12–T25（P1–P3，含 S/M/L 工作量标签与验收要点）
- 确立文档单一来源约定：变更以本文件为唯一归处，`docs/TASKS.md` 仅承载任务清单、`docs/PROGRESS.md` §9 仅作规划指针，避免同一变更在多文档重复出现
- 同步版本展示位至 v1.9.48：`src/version.js`、`package.json`、`README.md`、`docs/PROGRESS.md`、`docs/TASKS.md`

---

## [1.9.47] - 2026-09-25

### Changed
- 采集 GitHub 字符串工具流程改进：
  - 文本提取去噪（`extractPageText`）：跳过 `script`/`style`/`noscript`/`template`/`svg`/`code`/`pre`/表单控件与隐藏元素（`aria-hidden`/`hidden`/`display:none`/`visibility:hidden`），避免 JS/CSS 代码与用户正文污染候选词条
  - 匹配归一化：新增 `normalizeText`（解码 HTML 实体、压缩空白、去除首尾标点）并在大小写不敏感精确匹配之外增加归一化词典索引，降低「仅差标点 / 纯大小写」误判为待翻译
  - 修复并发竞态：每次采集使用独立随机临时文件（`createRawTermsPath`）替换全局共享的 `RAW_TERMS_FILE`，并用 `finally` 及时清理
  - 区分告警与错误：`dictionary-processor.js` 不再把子进程全部 stderr 标为 `SUBPROCESS_FAILED`，仅 `[WARN]` 前缀视为警告；子进程非零退出且无错误输出时补明确错误事件
  - `request-body.js` 增加 `MAX_URLS`（50）上限，防止海量 URL 造成服务端 DoS
  - `@babel/core` 由 `devDependencies` 移入 `dependencies`，避免生产仅装 dependencies 时采集子进程失败

---

## [1.9.46] - 2026-09-25

### Docs
- 仅保留桌面版高保真原型：删除 `prototype/prototypes/mobile.html`，将 `prototype/prototypes/desktop.html` 重命名为 `prototype/prototypes/index.html` 作为唯一原型入口
- 同步 `server.js` 预览默认页指向 `prototypes/index.html`；更新侧边导航移除移动端入口
- 更新引用原型页面的文档与版本展示位至 v1.9.46：`README.md`、`docs/README.md`、`docs/prototype.md`、`docs/project.md`、`openspec/README.md`、`openspec/prototype.md`、`server.js`
- 移除高保真原型左侧导航侧边栏：删除 `index.html` 的 `<aside class="proto-nav">`，清理 `prototype.base.css` / `prototype.responsive.css` 中 `.proto-nav*` 样式并将 `.proto-shell` 改为单列布局
- 高保真原型页面内容水平居中：`.proto-main` 增加 `margin: 0 auto`（配合 `max-width: 1200px` 在单列网格中居中）

---

## [1.9.45] - 2026-09-25

### Docs
- 高保真原型重定向为「GitHub 页面字符串采集工具」：重写 `prototype/prototypes/desktop.html` 与 `mobile.html`，呈现采集流程（植入探针 → 归集词条 → 解析入库）、探针脚本一键复制、数据中心（文本粘贴 / 批量 URL）、清洗结果预览表与引擎实时处理中心（进度 + SSE 终端日志）
- 更新 `README.md` 高保真原型表说明，由「仓库浏览 / 配置面板」改为采集工具相关描述
- 同步版本展示位至 v1.9.45：`src/version.js`、`package.json`、`README.md`、`docs/prototype.md`、`openspec/prototype.md`

---

## [1.9.44] - 2026-09-25

### Docs
- 简化项目原型：移除设计系统/组件库/交互标准文档站点与 landing 页（`prototype/index.html`、`prototype/design-system/`、`prototype/components/`、`prototype/interaction/`），仅保留高保真原型 HTML 文件（`prototype/prototypes/desktop.html`、`prototype/prototypes/mobile.html`）及其样式（`prototype/assets/`）
- 同步 `server.js` 预览默认页由已删除的 `index.html` 改为 `prototypes/desktop.html`；高保真原型侧边导航精简为仅桌面端/移动端切换
- 更新引用原型页面的文档：`README.md`、`docs/README.md`、`docs/prototype.md`、`docs/project.md`、`openspec/README.md`、`openspec/prototype.md`
- 同步版本展示位至 v1.9.44：`src/version.js`、`package.json`、`README.md`、`docs/prototype.md`、`openspec/prototype.md`、`server.js`

---

## [1.9.43] - 2026-09-24

### Docs
- 刷新 `docs/PROGRESS.md` §1.1 数据型指标为实算值：`src/` 源码总行数 9230 → 9342、用户脚本产物大小 198,899 → 198,838 字节（194.24 → 194.18 KB）；其余指标（文件数 120 / 纳入模块 92 / 词典 459 条 / 原型 16 HTML + 10 CSS / 测试 20 用例）经实算核对一致
- 同步版本展示位至 v1.9.43：`src/version.js`、`package.json`、`README.md`、`docs/PROGRESS.md`、`docs/TASKS.md`

### Changed
- 用户脚本文件名由 `GitHub_i18n.user.js` 更名为 `GitHub_zh-cn.user.js`（更贴合「简体中文」语义）；同步 `build.cjs` 产物名与 `@updateURL`/`@downloadURL`、`ci-cd.yml` 产物名、源码更新检查 URL（`src/config.js`、`src/versionChecker/fetcher.js`）、`src/lib/project-metrics.ts`、`src/app/overview/page.tsx` 及测试/校验脚本；重新生成 `build/GitHub_zh-cn.user.js` 并移除旧产物。注意：更名会使旧安装（指向旧 `@updateURL`）无法自动更新，需重新一键安装新脚本
- 补同步文档版本横幅至 v1.9.43：`docs/project.md`、`docs/development.md`、`docs/architecture.md`（`v1.9.43` 发布提交的版本同步遗漏了这几处）

---

## [1.9.42] - 2026-09-23

### Added
- `package.json` 新增 `typecheck` 脚本（`tsc --noEmit -p tsconfig.json`）

### Changed
- CI 质量门禁补齐（T11）：`lint` 作业新增**类型检查**，`build` 作业新增**单元测试**（`npm run test:unit`，20 用例）

### Fixed
- CI 节点版本升至 Node 22（`actions/setup-node` `node-version: '22'`）：`devDependency` 的 `jsdom@30` / `undici@8` 要求 Node ≥ 22.19，`tests/a11y.test.mjs` 在 Node 20 下因 `undici` 的 `markAsUncloneable` 缺失而导入即崩溃；同步 `package.json` `engines.node` 至 `>=22.22.2`

### Docs
- 清理 `docs/TASKS.md`：删除已完成任务的归档表格，改为紧凑编号索引（T1–T11、P0-1–P2-7），第 2 节由「已完成」更名为「历史归档（已完成）」
- 同步文档版本行至 v1.9.42：`docs/`（README / project / architecture / development / coding-style / prototype / PROGRESS / README 索引）与 `openspec/`（README / project / architecture / development / coding-style / prototype / config.yaml）
- 消除重复工作流：删除独立的 `.github/workflows/static.yml`，将其 GitHub Pages 部署逻辑合并至 `ci-cd.yml` 的 `deploy-pages` job（`push` 到 `main` 即部署整个仓库到 Pages）；同步 `docs/PROGRESS.md` §3.3 相关描述
- 再次精简 `docs/TASKS.md`：删除「历史归档（已完成）」一节（T1–T11、P0-1–P2-7 索引），仅保留活动任务清单（当前为空）与推进说明；已完成的任务统一以 `CHANGELOG.md` 为准

---

## [1.9.41] - 2026-09-23

### Docs
- 清理 `docs/TASKS.md`：第 1 节四个空优先级小节合并为单条说明；第 2 节已完成任务改为紧凑索引表（T1–T10、P0-1–P2-7），详细改动交由 `CHANGELOG.md` 承载
- 同步文档版本行至 v1.9.41：`docs/`（README / project / architecture / development / coding-style / prototype / PROGRESS）与 `openspec/`（README / project / architecture / development / coding-style / prototype / config.yaml）

---

## [1.9.40] - 2026-09-23

### Added
- 新增可访问性自动化检查（T8）：`tests/a11y.test.mjs` 用 axe-core + jsdom 检查 `index` / `overview` / `design` 三页静态产物，仅将 serious / critical 违规视为失败（无产物时自动跳过）
- 新增采集趋势可视化（T10）：`scripts/collect-history.cjs` 将每次采集统计写入 `docs/collect-history.json`，`/overview` 展示最近 8 次「采集趋势」

### Changed
- 拆分 `collect-dict.cjs`（211 行）：报告生成 / 增量对比逻辑移至 `scripts/dict-report.cjs`，主文件回归编排职责并满足「单文件 ≤200 行」
- `scripts/check-file-length.cjs` 门禁扩展到仓库根脚本（`collect-dict.cjs` / `build.cjs` / `server.js`）

### Fixed
- a11y 修复：`DataCenter` 输入框补关联 `<label>` 与 tab 的 `aria-controls`；`Dashboard` 进度条改 `role="progressbar"`、日志容器由 `<pre>` 改语义化 `role="log"`；`Shell` 的 toast 容器加 `role="status"`；装饰元素补 `aria-hidden`；`PreviewTable` 补 `<caption>`

---

## [1.9.39] - 2026-09-23

### Docs
- README 新增「命名与兼容性说明」（T9）：明确产品名为「GitHub Chinese 简体中文」，并说明仓库旧名 `GitHub_i18n` / 脚本名 `GitHub_i18n.user.js` 因 `@updateURL` 与一键安装链接依赖而刻意保留，消除命名歧义

---

## [1.9.38] - 2026-09-23

### Added
- 新增代码文件行数门禁 `scripts/check-file-length.cjs`（T6）：扫描 `src` / `scripts` / `tests`，任一代码文件 >200 行即失败，并输出最大行数 TOP 5
- `package.json` 新增 `lint:length` 脚本并纳入 `npm test`（`lint → lint:length → build → test:unit → validate`）；CI lint 作业新增该检查

### Changed
- CI 安全审计由 `npm audit --audit-level=moderate || true` 改为 `npm audit --audit-level=high`（T7）：高危依赖会阻塞构建，低危不再视为失败

---

## [1.9.37] - 2026-09-23

### Added
- 新增 `src/lib/request-body.js`（T5）：请求体归一化纯函数 `extractUrls`，`batch-collect` 路由据此对缺失 / 无效 `urls` 返回 400
- 新增集成测试：`tests/request-body.test.mjs`（3 用例）与 `tests/collector-core.test.mjs`（2 用例），覆盖空输入 `INPUT_INVALID`、非法 URL `INVALID_URL`（不启动浏览器）

### Changed
- `src/lib/collector-core.js` 将 SSRF 校验前移至浏览器启动之前：全部 URL 非法时不再启动浏览器，非法项逐个经 SSE 透传 `INVALID_URL`

---

## [1.9.36] - 2026-09-23

### Added
- 新增基于 nonce 的 Content-Security-Policy（T2）：`src/proxy.ts` 注入 CSP（`default-src 'self'`、`script-src 'self' 'nonce-…' 'strict-dynamic'`、`style-src 'self' 'unsafe-inline'`、`img-src 'self' data: blob:`、`object-src 'none'`、`base-uri 'self'`、`form-action 'self'`、`frame-ancestors 'none'`、`upgrade-insecure-requests`）
- 补充 Open Graph / Twitter 元信息（T4）：`src/app/layout.tsx` 增加 `metadataBase`、`openGraph`、`twitter` 配置

---

## [1.9.35] - 2026-09-23

### Added
- 新增 `src/lib/url-guard.js`（T1）：SSRF 防护纯函数，仅放行 `http(s)`，拦截 `localhost` / 私网 / 回环 / 链路本地 / 云元数据地址（`10/8`、`172.16/12`、`192.168/16`、`127/8`、`169.254/16`、`100.64/10`、`::1`、`fc00::/7`、`fe80::/10`）
- 新增错误码 `CollectErrorCode.INVALID_URL`（3002）：批量采集对非法目标跳过并经 SSE 透传该错误码

### Changed
- `src/lib/collector-core.js` 在 `page.goto` 前逐个校验目标 URL，非法项不再进入浏览器抓取

### Docs
- 清理 `docs/PROGRESS.md` 文档漂移（T3）：修正「双锁并存」错误陈述，补全版本行与变更记录

---

## [1.9.34] - 2026-09-23

### Docs
- 新增 `docs/TASKS.md`：项目**唯一任务清单**，合并 `docs/PROGRESS.md` 遗留任务与 `docs/IMPROVEMENT-TASKS.md`；已完成任务归档至第 2 节，活动任务为 T1–T10
- `docs/PROGRESS.md` 第 5 节由任务表改为指向 `docs/TASKS.md` 的指针；删除 `docs/IMPROVEMENT-TASKS.md`（内容已合并）

## [1.9.33] - 2026-09-23

### Docs
- 新增 `docs/IMPROVEMENT-TASKS.md`：完善改进建议任务文档（代码审查 + 实地核查，覆盖 SSRF 加固、CSP、文档漂移清理、OG 元信息、API 路由测试、超长文件门禁、依赖审计等 P0–P3 任务）——该文档于 v1.9.34 合并入 `docs/TASKS.md`

## [1.9.32] - 2026-09-23

### Fixed
- 修复 P0-2：批量 URL 采集此前因 `puppeteer` 未安装而不可用；现改用已安装的 `puppeteer-core` 配合系统 Chrome / Edge

### Changed
- `package.json` 依赖由 `puppeteer` 改为 `puppeteer-core`；移除 `next.config.mjs` 的 `serverExternalPackages` 声明（该包为 ESM，显式外部化会触发告警），改由 `browser-resolver.js` 动态 `import()` + `turbopackIgnore` 运行期解析，`next build` 告警由 1 条降为 0

### Added
- 新增 `src/lib/browser-resolver.js`：解析 `puppeteer-core` 与浏览器可执行路径（优先 `PUPPETEER_EXECUTABLE_PATH`，其次各平台常见安装路径）
- 新增 `src/types/puppeteer-core.d.ts`（替代原 `puppeteer.d.ts`，补充 `executablePath` 声明）

---

## [1.9.31] - 2026-09-23

### Changed
- 调整 `npm test` 顺序为 `lint → build → test:unit → validate`，确保冒烟测试针对最新构建产物

### Added
- 新增用户脚本产物冒烟测试 `tests/smoke.test.cjs`（P2-5）：校验产物存在性与体积、UserScript 元数据与当前版本号、`vm` 语法合法性

---

## [1.9.30] - 2026-09-23

### Changed
- 清理未启用的 Jest 配置（删除 `jest.config.js` / `jest.setup.js`），改用 Node 内置 test runner（P1-3）

### Added
- 新增 `tests/` 单元测试：`collect-codes.test.mjs`（错误码契约）、`collect-dict.test.cjs`（采集纯函数）
- `package.json` 新增 `test:unit` 脚本；`npm test` 流水线串联单测（lint → test:unit → build → validate）

---

## [1.9.29] - 2026-09-23

### Changed
- 消除双锁文件漂移（P1-4）：删除 `bun.lock`，保留 npm 单一锁（`package-lock.json`）；`.gitignore` 追加 `bun.lock` 防止再生

### Added
- 词典采集支持增量与去重统计（P2-3）：`collect-dict.cjs` 的 `generateReport` 对比历史 `docs/untranslated-terms.txt`，输出新增 / 移除 / 净增统计并展示新增词条样例，经 SSE 透传至采集工作台「处理中心」

---

## [1.9.28] - 2026-09-23

### Fixed
- 修复配置面板「性能监控」区两个按钮均为死按钮：`刷新性能数据` 与 `导出性能数据` 此前仅创建 DOM、`addEventListener` 从未绑定（P2-4）

### Added
- 新增采集流程错误码约定（P2-7）：`src/lib/collect-codes.js` 定义服务端与前端共用的 `CollectErrorCode`
  （`MISSING_DEPENDENCY` / `FETCH_FAILED` / `SUBPROCESS_FAILED` / `INPUT_INVALID` / `UNKNOWN`）。
  该模块**不含任何服务端运行时依赖**，可被客户端组件安全导入而不带入 `fs`/`child_process`
- 新增输入校验：空文本粘贴、空 URL 列表直接返回 `INPUT_INVALID` 错误，不再进入无意义的子进程

### Changed
- `src/lib/collector-core.js` 与 `dictionary-processor.js` 的 `error` 事件填充 `code`；
  `useCollector.ts` 的 `LogEntry` 新增 `code` 字段；`Dashboard.tsx` 错误行渲染 `E<code>` 徽标

---

## [1.9.27] - 2026-09-22

### Fixed
- 修复窄屏（≤1024px）下侧栏被 `display: none` 隐藏后，采集控制台 / 项目概览 / 设计系统三个页面**无法互相跳转**的问题

### Added
- 新增 `src/components/MobileNav.tsx`：窄屏横向导航条，替代侧栏承担页面跳转
- 新增 `src/components/navItems.ts`：侧栏与移动端导航共用的唯一导航数据源，避免两处各写一份而漂移

### Changed
- `src/components/Rail.tsx` 与 `Shell.tsx` 改为消费共享导航定义；`Shell.tsx` 在顶栏下方渲染移动端导航
- `public/css/layout.css` 新增 `.mobile-nav` 响应式样式；≤640px 时顶栏改为纵向堆叠、内容区收窄内边距

---

## [1.9.26] - 2026-09-22

### Added
- 工作台新增「项目概览」页（`/overview`）：服务端在模块加载时一次性统计版本、词典词条、源码规模、产物大小与原型页面数，不再手工维护数字
- 工作台新增「设计系统」页（`/design`）：展示 `public/css/base.css` 的颜色/尺寸令牌与按钮、徽标、步骤条、词条表等组件样式
- 新增 `src/components/Rail.tsx` 与 `src/components/Shell.tsx`：服务端组件承载侧栏与外壳，导航改用 `next/link` 预取，移除 `aria-disabled` 占位
- 新增 `src/components/CollectorConsole.tsx`：采集交互收敛为最小客户端岛
- 新增 `src/lib/collector-core.js` 与 `src/lib/dictionary-processor.js`：采集流水线的唯一实现，Next 路由与原型服务器共用
- 新增 `src/lib/project-metrics.ts`：服务端静态指标采集
- 新增 `public/css/showcase.css`：概览/设计页专用样式模块

### Fixed
- 修复工作台外壳布局错误：外层容器误用 `.workspace`（`flex-direction: column`）导致侧栏与主区上下堆叠，新增 `.app-shell` 横向外壳
- 修复词条状态徽标无样式：`.badge` / `.badge.untranslated` / `.badge.translated` 此前从未定义，状态一直以裸文本展示；同时本地化为「待翻译 / 已翻译」
- 修复构建期循环引用 `dictionaryManager → partialTranslator → dictionaryManager`：改为由调用方注入查询上下文，构建输出恢复无循环告警
- 修复 `next.config.mjs` 失效键：移除 Next 16 已不支持的 `eslint` 配置项
- 修复 `src/middleware.ts` 使用已弃用约定：迁移为 `src/proxy.ts`（具名导出 `proxy`）
- 修复原型服务器把采集临时文件写入仓库根目录的问题（统一改用系统临时目录）
- 修复 `src/lib/collector-core.js` 超出「单文件 ≤ 200 行」约定（206 行）的问题

### Changed
- `src/app/page.tsx` 由整页客户端组件改为服务端页面 + 客户端岛，静态外壳不再进入客户端包
- 开启 TypeScript 严格模式（`tsconfig.json` 的 `strict: true`），零类型错误
- 删除 `src/server/collector.js`（Express 侧重复实现），关闭 P1-5
- 采集子进程路径与输出流解析逻辑收敛到 `dictionary-processor.js`
- `npm run build:web` 构建告警由 4 条降至 1 条，仅剩未安装可选依赖 `puppeteer`（见 P0-2）

### Removed
- 移除未被任何模块引用的 `i18n` 框架（`src/i18n.js` + `src/i18n/` 共 9 个文件、641 行），关闭 P1-2。
  移除依据：① 精确检索确认零外部引用；② 产品为单语言（中文）工具，其自身 UI 无需语言切换；
  ③ `translations.js` 中的 `github.*` 键与词典职责重叠，双翻译源易产生分叉；
  ④ `loader.js` 的远程加载能力与「离线可用」定位相悖。内容仍保留在 git 历史中可随时恢复。
  移除后构建输出不再报告孤立模块（`src/` 由 123 文件 / 9393 行降至 114 文件 / 8752 行）

### Known Issues
- `puppeteer` 仍未安装（P0-2），批量 URL 采集降级为明确错误提示；`next build` 会输出一条无法解析该可选依赖的告警

---

## [1.9.25] - 2026-09-22

### Fixed
- 修复词典清洗子进程输入路径不匹配：`collector-logic.ts` 仅传 `basename` 给 `collect-dict.cjs`，而临时文件写在 `os.tmpdir()`，子进程按 `process.cwd()` 相对路径读取报「文件不存在」导致清洗步骤失败；改为传递完整路径 `RAW_TERMS_FILE`
- 修复 `/api/collect` 与 `/api/batch-collect` 未捕获 `req.json()` 异常，非法 JSON 直接 500，改为返回 400

## [1.9.24] - 2026-09-19

### Fixed
- 修复构建脚本模块清单脱节：`build.cjs` 缺失 `main/lifecycle.js`、`core/errorHandler/*`、`core/virtualDom/*`、`page-monitor/domObserver/*`、`translation-core/*` 等 40+ 模块，导致产物存在大量未定义引用、脚本运行即报错
- 修复跨模块顶层重名：`translateCriticalElementsOnly`（`elementTranslator/critical.js` 与 `translator.js`）重命名为 `translateCriticalElements`；清理 `versionUtils.js` 中未使用的导出常量
- 修复 `configUI` 未导出实例且缺少 `init()` 的问题（浮动入口按钮与脚本菜单命令此前从未生效）
- 修复「启用部分匹配」开关空转：`dictionaryManager` 现构建 Trie 树与正则缓存，并接入查询回退链路
- 修复 `collect-dict.cjs` 引用已不存在的词典文件导致词典加载近乎为空的问题，改为递归扫描 `src/dictionaries/**/*.js`（词条数由残缺恢复为完整 459 条）
- 修复版本号不一致：`package.json` 1.9.23 / `src/version.js` 1.9.22 / 工作台硬编码 1.9.22，统一为 1.9.24
- 修复 `npm run build` 被 `next build` 覆盖导致 CI 的 build → validate → artifact 链路必然失败的问题
- 修复 `server.js` 静态目录指向不存在的 `web/`（改为 `public/`）
- 修复 `DataCenter` 中「智能清洗」「导出 JSON」按钮无点击处理、`ScriptInjector` 缺少复制反馈
- 修复 `src/app/page.tsx` 侧栏 `href="#"` 死链
- 用 `TextEncoder`/`TextDecoder` 替换已废弃的 `escape`/`unescape`（保持存储格式向后兼容）

### Added
- 新增 `scripts/build/moduleGraph.cjs`：从入口递归解析 ESM 依赖并拓扑排序，含循环引用检测
- 新增 `scripts/build/transform.cjs`：ESM → 单作用域拼接，含跨模块顶层重名冲突检测
- 新增 `scripts/validate-bundle.cjs`：产物校验（存在性 / 体积 / 语法 / 未定义引用扫描）
- 新增 `src/ui/configUI/bootstrap.js`：浮动入口按钮与用户脚本菜单命令
- 新增 `docs/PROGRESS.md`：开发进度报告与遗留任务清单
- 新增 `src/types/puppeteer.d.ts`：可选依赖的最小类型声明
- 新增 `npm run build:web` 与 `npm run dev:prototype` 脚本

### Changed
- 按「单代码文件 ≤ 200 行」约定拆分 6 处超长文件（导出契约不变）：
  `eslint.config.js` → `eslint/rules/{core,bestPractices,quality}.js`；
  `src/i18n/manager.js` → `constants`/`storage`/`observers`/`formatters`/`lookup`/`loader`；
  `src/core/virtualDom/manager.js` → `cleanup`/`nodes`/`lifecycle`；
  `src/dictionaries/common/misc.js` → `miscOrganization`/`miscMarketing`/`miscActions`；
  `src/translation-core/selectorUtils/patterns.js` → `skipTags`/`skipIdsEntity`/`skipIdsTechnical`；
  `prototype/assets/prototype.css` → 9 个模块 + `@import` 聚合入口
- 修正 `misc.js` 中英文混排的译文（"数百万开发者 and 业务" → "数百万开发者与业务"）
- 构建产物体积改为按字节统计（原按字符统计会低估约 9%）
- `npm run build` 恢复为用户脚本构建；`validate` 指向真实校验脚本
- `partialTranslator` 的部分匹配默认开启（对齐原型设计）
- `eslint.config.js` 的 CommonJS 规则块扩展至全部 `**/*.cjs`，忽略项补 `.next`/`prototype`/`public`
- `src/lib/collector-logic.ts` 移除 `eval('require(...)')` 与死代码，改用 `spawn`，采集临时文件改写入系统临时目录
- `src/hooks/useCollector.ts` 消除 `any`，新增非 2xx 响应与事件流解析失败的显式错误提示
- `public/` 下 16 个源码文件的头注释路径由 `web/...` 修正为 `public/...`
- 文档同步：`README.md`、`docs/*`、`openspec/*`（改为指向 `docs/` 的索引）、`docs/config.yaml` 修正 `../spec` 无效路径
- 质量门禁现状：`npm run lint` 0 error / 0 warning，`tsc --noEmit` 通过，`npm run validate` 通过

### Known Issues
- `puppeteer` 已在 `package.json` 声明但未安装，批量 URL 采集暂不可用（未安装时返回明确提示）
- `jest.config.js` / `jest.setup.js` 为未启用状态（`jest` 未安装且无测试用例）
- `src/i18n/*`（9 个模块）已实现但无调用方，暂不参与打包，去留待决策（`docs/PROGRESS.md` P1-2）

---

## [1.9.23] - 2026-09-19

### Added
- 升级采集演示页为 Next.js（App Router, `src/` 模式）：`src/app`、`src/components`、`src/lib`、`src/hooks`、`src/config`
- 新增 `next.config.mjs`（根级，与源码解耦）
- 新增 `src/middleware.ts`（Edge 中间件，附加基础安全响应头）
- 新增 Tailwind CSS + PostCSS 根级配置（`tailwind.config.ts`、`postcss.config.mjs`），`preflight:false` 保留自包含组件样式
- 整合 ESLint（`eslint-config-next` + FlatCompat），与现有用户脚本规则并存
- 新增 Husky（`prepare` 脚本 + `.husky/pre-commit` 触发 lint-staged）

### Changed
- `layout.tsx` 引入 `src/app/globals.css`（Tailwind 入口），保留 `public/css` 组件样式
- 用户脚本核心（`src/core`、`src/translation-core` 等）保留独立构建，不纳入 Next 处理

---

## [1.9.22] - 2026-09-18

### Changed
- 重构 web/collector-guide.html 词典采集向导：移除无效的 Tailwind 依赖，改用自包含 CSS（离线可用）
- 统一品牌绿主题（GitHub 绿 #2ea44f），对齐中文插件视觉，去除 SaaS 蓝与彩虹渐变
- 同步更新向导 JS 注入的样式类（renderer/utils/stream）

---

## [1.9.20] - 2026-06-10

### Added
- 新增模块化工具函数：functionUtils、stringUtils、domUtils、urlUtils、securityUtils
- 新增 virtualNode.js 模块，拆分虚拟DOM节点逻辑
- 新增 versionUtils.js 模块，抽出版本比较和提取功能
- 新增 updateNotification.js 模块，独立更新通知UI

### Fixed
- 修复 utils.js 中 obfuscateData 函数缩进问题
- 修复 i18n.js 中 formatRelativeTime 时间计算逻辑
- 修复 configUI.js 中静态方法调用错误
- 修复 domUtils.js 语法错误（大括号不匹配）

### Changed
- 更新版本号至 1.9.20
- 重构 utils.js，从单一文件拆分为多个专用模块
- 重构 virtualDom.js，拆分为 VirtualNode 和 VirtualDomManager 两个模块
- 重构 versionChecker.js，拆分为版本工具、通知UI和主逻辑
- 优化构建脚本，纳入新拆分的模块文件
- 代码格式化，统一代码风格

---

## [1.9.21] - 2026-07-18

### Changed
- 更新项目名称为 GitHub Chinese 简体中文
- 更新 package.json 项目名称为 github-chinese
- 更新用户脚本名称为 GitHub Chinese 简体中文
- 更新所有文档和原型中的项目名称引用

---

## [1.9.19] - 2026-06-08

### Changed
- 优化翻译逻辑：在没有匹配的翻译时完全不处理 DOM 元素，避免不必要的操作
- 更新版本号至 1.9.19
- 提升翻译性能，减少对无匹配内容的处理开销

---

## [1.9.18] - 2026-06-07

### Added
- 添加 GitHub 首页和个人资料页面的新翻译词条
- 完善 openspec 项目规范文档

### Fixed
- 修复 core/errorHandler.js 的模块导入路径问题
- 优化 package.json 的 lint 脚本配置

### Changed
- 更新版本号至 1.9.18
- 精简翻译词典，删除冗余和无效词条
- 优化 README.md，面向普通用户简化描述
- 更新文档结构，更加用户友好

---

## [1.9.17] - 2026-06-07

### Added
- 更新翻译词库，添加 GitHub 首页和个人资料页面翻译
- 同步 openspec 规范文档

### Changed
- 更新版本号至 1.9.17
- 格式化所有代码文件
- 构建优化后的用户脚本

---

## [1.9.16] - 2026-06-06

### Added
- 添加 Tampermonkey 菜单命令支持（打开配置、立即翻译页面）
- 添加性能监控面板，实时显示翻译性能

### Fixed
- 修复脚本在 Chrome 油猴插件中不生效的问题
- 修复字典文件加载顺序问题
- 修复测试文件导入路径问题

### Changed
- 更新项目名称为 GitHub Chinese 简体中文
- 更新版本号至 1.9.16
- 统一使用 Date.now() 进行计时
- 优化浮动按钮创建逻辑和样式
- 删除冗余的 utils/ 和 dist/ 目录
- 更新构建脚本，移除 dist 目录相关代码

---

## [1.9.5] - 2026-05-01

### Added
- 添加 Trie 树和 LRU 缓存管理模块
- 添加 i18n 自动化工具界面

### Fixed
- 修复构建脚本对 ES6 模块导出语句的处理
- 移除构建文件中的 source map 注释

### Changed
- 更新版本号至 1.9.5
- 简化构建脚本并更新文件版本号
- 删除过时文档文件
- 更新 README 中的用户脚本安装链接

---

## [1.9.4] - 2026-05-01

### Changed
- 更新版本号至 1.9.4
- 精简 README.md 文档内容

---

## [1.9.3] - 2026-05-01

### Changed
- 删除 openspec/docs 冗余文档
- 简化项目文档结构

---

## [1.9.2] - 2026-05-01

### Changed
- 添加 LRU 缓存模块和 Trie 树功能

---

## [1.9.1] - 2026-05-01

### Fixed
- 修复 Trie 树 findAllMatches 方法参数问题
- 修复 i18n.js 模块导出问题

### Changed
- 统一所有文件版本号为 1.9.1
- 移除 UMD 模块导出，仅保留 ES6 模块导出
- 更新项目规范文档

---

## [1.9.0] - 2026-01-09

### Changed
- 重构项目文档结构并更新配置
- 更新版本至 1.9.0 并重构文档结构
- 优化构建脚本，实现版本历史的自动保留
- 清理 openspec/docs 下的冗余备份文件夹
- 修复代码规范问题，统一项目版本号管理

---

## [1.8.182] - 2026-01-09

### Changed
- 同步版本号
- 优化构建脚本
- 更新翻译词典文件的版本号和日期

---

## [1.8.181] - 2026-01-08

### Changed
- 清理冗余代码
- 修复代码规范问题
- 统一项目版本号管理

---

## [1.8.88] - 2025-11-10

### Changed
- 修复代码规范问题
- 统一项目版本号管理
- 优化 .gitignore 配置

---

## [1.8.87] - 2025-11-10

### Improved
- 增强页面监控性能
- 优化翻译缓存机制

### Fixed
- 修复已知兼容性问题

---

## [1.8.86] - 2025-11-10

### Added
- 添加新页面模式支持

### Changed
- 更新翻译词典
- 改进错误处理机制

---

## [1.8.85] - 2025-11-10

### Improved
- 优化 DOM 操作性能
- 添加更详细的错误日志
- 更新构建脚本功能

---

## [1.8.84] - 2025-11-10

### Added
- 支持更多 GitHub 页面

### Improved
- 优化翻译效率

### Fixed
- 修复界面布局问题

---

## [1.8.172] - 2024-06-18

### Added
- 新增 GitHub Codespaces 界面翻译支持
- 添加 GitHub Copilot 完整界面翻译
- 支持 GitHub Explore 页面翻译
- 新增完整的贡献指南文档

### Improved
- 实现多级缓存机制，显著提升翻译性能
- 优化了 DOM 监听策略，减少页面卡顿
- 更新了安装指南和用户操作指南

### Fixed
- 修复了在 Edge 和 Safari 浏览器中的特定兼容性问题

---

## [1.8.172] - 2024-06-02

### Fixed
- 修复了在 GitHub Actions 页面上的翻译错误问题
- 解决了与某些浏览器扩展的冲突问题

### Improved
- 优化了内存管理，减少了长时间运行时的内存泄漏
- 更新了 API 文档，添加了更详细的使用示例

### Security
- 增强了 XSS 防护措施

---

## [1.0.0] - 2023-05-15

### Added
- 发布核心翻译功能，支持 GitHub 主要页面的中文翻译
- 实现翻译词典管理系统
- 添加页面监控和自动翻译功能
- 支持自定义翻译和白名单配置
- 实现版本检查和更新提醒
- 提供完整的用户文档和使用指南

### Improved
- 优化了翻译性能，减少了页面加载延迟
