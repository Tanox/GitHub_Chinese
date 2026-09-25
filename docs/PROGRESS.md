# 项目开发进度报告

> 版本：**v1.11.5** ｜ 更新日期：2026-09-25 ｜ 版本权威源：`src/version.js`
>
> 本文档记录 GitHub Chinese 简体中文项目的开发进度、已交付能力、任务索引与后续计划。
> 每次发版后需同步更新「迭代记录」（§4）与「变更记录」（§8），并按 §7 核对版本与文档同步。

---

## 1. 项目概览

| 项目 | 说明 |
|------|------|
| 项目定位 | GitHub 界面中文本地化（浏览器用户脚本）+ 词典采集工作台（Next.js 16） |
| 运行形态 | 单文件用户脚本 `build/GitHub_zh-cn.user.js`（Tampermonkey / Greasemonkey） |
| 当前版本 | v1.11.5 |
| 许可证 | GPL-2.0 |
| 仓库 | https://github.com/Tanox/GitHub_i18n |
| 包管理器 | npm（单一锁文件 `package-lock.json`；`bun.lock` 已于 v1.9.29 删除并加入 `.gitignore`） |

### 1.1 当前量化指标

| 指标 | 数值 | 采集方式 |
|------|------|---------|
| `src/` 源码文件数 | 122 | 递归统计 `.js/.cjs/.mjs/.ts/.tsx/.css` |
| `src/` 源码总行数 | 9612 | 同上 |
| 用户脚本纳入模块数 | 92 | `node build.cjs` 输出 |
| 用户脚本孤立模块数 | 0 | 同上 |
| 构建期循环引用 | 0 | 同上 |
| 用户脚本产物大小 | 198,838 字节（194.18 KB） | `build/GitHub_zh-cn.user.js` |
| 翻译词典词条数 | 459 | `node collect-dict.cjs` 输出 |
| 词典模块数 | 12 | `src/dictionaries/**/*.js` |
| 原型资源数 | 16 个 HTML + 10 个 CSS | `prototype/` |
| 工作台页面路由 | 3（`/`、`/overview`、`/design`） | `next build` 路由表 |
| 代码检查 | 0 error / 0 warning | `npm run lint` |
| 类型检查 | 通过（`strict: true`） | `tsc --noEmit -p tsconfig.json` |
| 产物校验 | 通过 | `npm run validate` |
| 单元测试 | 20 用例通过（含 a11y 3） | `npm run test:unit` |
| 超长代码文件（>200 行） | 0 | 递归扫描全部代码文件 |
| Next 构建告警 | 0 | `npm run build:web` |

> 上述数字为数据型指标，发版时应重新执行对应命令实算，禁止手改。
> 工作台「项目概览」页（`/overview`）已把其中多数指标改为服务端实时统计，不再依赖本文档的手工数字。

---

## 2. 技术架构现状

项目当前由**两条相互独立、仅共享词典数据**的构建链路组成。

### 2.1 链路 A：用户脚本引擎（核心交付物）

```
src/main.js                        ← 唯一入口
  └─ main/lifecycle.js             ← 生命周期编排（初始化 / 清理 / 启动）
      ├─ versionChecker/           ← 版本检查（fetcher + updateNotification）
      ├─ translation-core/         ← 翻译核心引擎
      ├─ page-monitor/             ← DOM 与路由监听
      └─ ui/configUI.js            ← 配置面板（含浮动入口按钮）
```

构建方式：`build.cjs` 从入口递归解析 ESM 依赖 → 拓扑排序 → 剥离 import/export → 拼接为单文件 IIFE。

支持模块：

- `core/`：`cacheManager`（LRU）、`errorHandler`（+`constants`/`recovery`）、`trie`（Trie 树）、`virtualDom`（+`manager`/`cleanup`/`nodes`/`lifecycle`/`constants`）、`virtualNode`
- `translation-core/`：`dictionaryManager`、`pageModeDetector`、`elementSelector`（+`selectorUtils`）、`elementTranslator`（+`stats`/`critical`）、`partialTranslator`、`performanceMonitor`、`batchProcessor`、`cacheController`、`lifecycle`、`translator`
- `page-monitor/`：`domObserver`（+`utils`/`config`/`setup`/`trigger`/`elementChecker`/`mutationAnalyzer`/`constants`）、`pageAnalyzer`、`pathListener`、`translationTrigger`、`cacheManager`
- `dictionaries/`：`codespaces`、`explore`、`common`（`nav`/`repo`/`pr`/`issue`/`misc*`）
- `ui/`：`configUI`（`store`/`renderer`/`bootstrap`）、`components/performanceMonitor`、`styles/configUI`（`base`/`buttons`/`components`）
- `utils/`：`functionUtils`、`stringUtils`（`json`/`regex`/`object`/`security`）、`domUtils`、`urlUtils`、`securityUtils`、`tools`
- 顶层：`config`（+`config/`）、`version`、`versionUtils`、`updateNotification`

依赖方向约定：`partialTranslator` **不反向依赖** `dictionaryManager`，查询上下文由调用方注入
（v1.9.26 借此消除构建期循环引用）。

### 2.2 链路 B：词典采集工作台（Next.js 16）

| 组成 | 路径 |
|------|------|
| App Router 页面 | `src/app/page.tsx`（采集控制台）、`src/app/overview/page.tsx`、`src/app/design/page.tsx` |
| API 路由 | `src/app/api/collect/route.ts`、`src/app/api/batch-collect/route.ts` |
| 服务端外壳 | `src/components/Shell.tsx`、`Rail.tsx`（侧栏）、`MobileNav.tsx`（≤1024px 横向导航条） |
| 导航数据源 | `src/components/navItems.ts`（侧栏与移动端共用，避免两处各写一份） |
| 客户端岛 | `src/components/CollectorConsole.tsx`；叶组件 `DataCenter` / `PreviewTable` / `Dashboard` / `ScriptInjector` |
| 服务端逻辑 | `src/lib/collector-core.js`、`src/lib/dictionary-processor.js`、`src/lib/extract-page-text.js`（浏览器端文本提取，v1.9.47 抽出）、`src/lib/project-metrics.ts` |
| 类型门面 | `src/lib/collector-logic.ts`（为 Route Handler 提供 `CollectEvent` 类型） |
| 状态 Hook | `src/hooks/useCollector.ts` |
| Proxy（原 middleware） | `src/proxy.ts`（安全响应头，Next 16 约定） |
| 类型声明 | `src/types/puppeteer-core.d.ts`、`src/version.d.ts` |
| 样式 | `public/css/`（11 个自包含模块）+ `src/app/globals.css`（Tailwind 入口） |

```
浏览器（服务端页面 Shell + 客户端岛 CollectorConsole）
  └─ useCollector
      ├─ POST /api/collect        → processRawData(data)
      └─ POST /api/batch-collect  → collectFromUrls(urls)
            └─ src/lib/collector-core.js
                ├─ puppeteer-core（可选依赖）+ 系统浏览器抓取页面文本
                └─ src/lib/dictionary-processor.js
                      └─ spawn(collect-dict.cjs) ← 与用户脚本共享同一份词典
                            └─ SSE(text/event-stream) 实时回传日志 / 进度 / 完成
```

> `server.js`（原型热更新预览服务器）复用同一套 `collector-core.js` + `dictionary-processor.js`，
> 仅保留 SSE 适配层；v1.9.26 前的 Express 重复实现已删除。

---

## 3. 已完成能力

### 3.1 用户脚本引擎

- [x] 静态文本翻译 + 动态内容监听（MutationObserver）
- [x] 路由变化监听，SPA 切换后自动重译
- [x] Trie 树部分匹配翻译（可配置开关，默认开启）
- [x] LRU 翻译缓存 + 虚拟 DOM 优化 + 批量处理
- [x] 无匹配时不改动 DOM 的预检查优化
- [x] 分层错误处理与降级（错误阈值触发紧急策略）
- [x] 配置面板：基本设置 / 更新设置 / 性能设置 / 性能监控
- [x] 浮动入口按钮 + 用户脚本菜单命令（打开配置面板 / 立即翻译页面）
- [x] 用户配置持久化（`localStorage` + 轻量混淆）
- [x] 自动更新检查与更新通知
- [x] 输入净化（`dictionaryManager.sanitizeText` 去除标签、事件处理器、危险协议）

### 3.2 词典采集工作台

- [x] 探针脚本一键复制（带复制反馈）
- [x] 文本粘贴采集 → SSE 实时流式日志
- [x] 批量 URL 采集（Headless 抓取，未装依赖时明确降级提示）
- [x] 词条预览表 + 实时处理中心（进度条 / 终端日志）
- [x] 智能清洗（调用服务端清洗）、导出 JSON
- [x] 词条状态区分（待翻译 / 已翻译，样式与文案齐备）
- [x] 侧栏导航三页互通：采集控制台 / 项目概览 / 设计系统
- [x] 响应式导航：≤1024px 自动切换为横向导航条，窄屏下三页仍可互通
- [x] 项目概览页：服务端实时统计版本、词条数、源码规模、产物大小
- [x] 设计系统页：颜色/尺寸令牌与核心组件样式展示

### 3.3 工程化

- [x] 构建脚本自动解析依赖图（不再维护手工文件清单）
- [x] 打包前跨模块顶层重名冲突检测（构建即失败并列出冲突）
- [x] 孤立模块报告（提示未被入口引用、不参与打包的文件）
- [x] 循环引用检测（v1.9.26 起为 0 处）
- [x] 产物校验 `scripts/validate-bundle.cjs`：存在性 + 体积 + 语法 + 未定义引用扫描
- [x] ESLint（Flat Config，规则拆分到 `eslint/rules/`）+ Prettier + Husky + lint-staged
- [x] CI/CD（`.github/workflows/ci-cd.yml`）：lint → build → validate → artifact → release
- [x] GitHub Pages 部署（合并至 `ci-cd.yml` 的 `deploy-pages` job，取代独立的 `static.yml`，消除重复工作流；`push` 到 `main` 即部署整个仓库到 Pages）
- [x] TypeScript 严格模式（`strict: true`，零错误）
- [x] Next 16 约定对齐：`middleware` → `proxy`、移除失效 `eslint` 配置键
- [x] 语义化 `id` 覆盖主要容器与交互控件
- [x] 全部代码文件符合「单文件 ≤ 200 行」约定（0 处超出）
- [x] 单元测试：Node 内置 test runner（`node --test`），共 20 用例（错误码契约 / 词典采集纯函数 / 产物冒烟 / a11y 3），详见 §1.1
- [x] 用户脚本产物冒烟：存在性 / 体积 / UserScript 元数据 / 版本号 / `vm` 语法合法性（P2-5）

---

## 4. 迭代记录

### 4.1 v1.9.26 · 缺陷修复

| 编号 | 问题 | 影响 | 处置 |
|------|------|------|------|
| C1 | 工作台外壳外层容器误用 `.workspace`（`flex-direction: column`） | 侧栏与主区**上下堆叠**，侧栏导航布局完全错位 | 新增 `.app-shell` 横向外壳，`Shell.tsx` 改用它 |
| C2 | `.badge` / `.badge.untranslated` / `.badge.translated` **从未定义样式** | 词条状态一直以裸英文文本展示 | 在 `terms.css` 补齐样式，并把文案本地化为「待翻译 / 已翻译」 |
| C3 | 构建期循环引用 `dictionaryManager → partialTranslator → dictionaryManager` | 拼接顺序依赖启发式，构建输出持续告警 | `partialTranslator` 改为接收调用方注入的查询上下文 |
| C4 | `next.config.mjs` 保留 Next 16 已不支持的 `eslint` 键 | 每次构建输出 2 条无效配置告警 | 移除该键；`typescript.ignoreBuildErrors` 保留 |
| C5 | `src/middleware.ts` 使用 Next 16 已弃用的 `middleware` 约定 | 构建输出迁移提示 | 迁移为 `src/proxy.ts`（具名导出 `proxy`），路由表显示 `ƒ Proxy` |
| C6 | 原型服务器把采集临时文件写入仓库根目录 | 污染工作区，与 Next 侧行为不一致 | 统一走 `dictionary-processor.js` 的系统临时目录 |
| C7 | `src/lib/collector-core.js` 达 206 行 | 违反「单代码文件 ≤ 200 行」约定 | 拆出 `dictionary-processor.js`（子进程桥接） |

### 4.2 v1.9.26 · 架构与性能改进

- **客户端边界收敛**：`src/app/page.tsx` 原为整页 `'use client'`，现改为服务端页面 + `CollectorConsole` 客户端岛；
  侧栏、顶栏、步骤条等静态结构不再进入客户端包。
- **导航真实化**：侧栏三个入口由 `aria-disabled` 占位改为 `next/link` 真实路由（`prefetch` + `aria-current`）。
- **新增页面**：`/overview`（服务端读取磁盘指标）、`/design`（设计令牌与组件展示），均静态预渲染。
- **采集逻辑去重（P1-5）**：删除 `src/server/collector.js`，Next 路由与原型服务器共用
  `collector-core.js`（抓取编排）+ `dictionary-processor.js`（子进程桥接）；SSE 适配各自保留。
- **可选依赖处理**：`puppeteer` 改为运行时解析（`createRequire` + 变量说明符），并加入
  `serverExternalPackages`；未安装时返回明确提示而非崩溃。
- **类型安全**：`tsconfig.json` 开启 `strict: true`，零错误（与「避免 any」约定对齐）。
- **移除未引用的 i18n 框架（P1-2，决策 B）**：删除 `src/i18n.js` + `src/i18n/`（9 个文件 / 641 行），
  移除依据：
  1. 精确检索（import 说明符）确认**零外部引用**，构建时持续报告 9 个孤立模块；
  2. 产品为单语言（中文）工具，其自身 UI 固定中文，无语言切换需求；
  3. `translations.js` 的 `github.*` 键与词典职责重叠，双翻译源易产生分叉（词典 459 条 vs 硬编码 8 条）；
  4. `loader.js` 提供远程拉取翻译 JSON 的能力，与「本地优先 · 离线可用」定位相悖。
  内容仍完整保留在 git 历史中，如需恢复可整体还原。

### 4.3 v1.9.26 · 文档完善

- 重写 `docs/PROGRESS.md`：指标实算、任务状态、架构图与变更记录同步至 v1.9.26。
- `docs/architecture.md` 同步工作台架构与目录结构。
- `CHANGELOG.md` 新增 1.9.26 小节。
- 版本同步范围：`src/version.js`、`package.json`、`README.md` 徽章、`CHANGELOG.md`、
  以及**本次实际改动文件**的头注释版本号。

### 4.4 v1.9.27 · 移动端可用性

| 编号 | 问题 | 影响 | 处置 |
|------|------|------|------|
| D1 | `@media (max-width: 1024px)` 直接 `display: none` 隐藏侧栏 | 窄屏下**三个页面无法互相跳转**（新增概览/设计页后影响放大） | 新增 `MobileNav.tsx` 横向导航条替代侧栏；导航定义抽为 `navItems.ts` 单一来源 |
| D2 | ≤640px 顶栏固定 `height: 5rem` 且横向排列 | 标题与状态徽标在窄屏被挤压、内容区内边距过大 | 顶栏改为纵向堆叠（`height: auto`），内容区内边距收到 `1rem` |

### 4.5 v1.9.28 · 体验修复与契约完善

| 编号 | 问题 | 影响 | 处置 |
|------|------|------|------|
| E1 | 配置面板「性能监控」区的 `刷新`/`导出` 按钮仅创建 DOM，从未绑定 `click` 事件 | 两个按钮完全是死的，用户点击无反应（P2-4） | `performanceMonitor.js` 内绑定 `updatePerformanceStats` / `exportPerformanceStats`；导出无数据时按钮短暂显示「暂无数据」 |
| E2 | 采集错误仅以文本消息返回，前端难以按类型分流处理（P2-7） | 所有失败在 UI 里都是无差别红字，无法区分依赖缺失 / 抓取失败 / 子进程失败 | 新增 `collect-codes.js`（纯数据、客户端可安全导入）定义 `CollectErrorCode`；服务端 `error` 事件填充 `code`，`Dashboard` 渲染 `E<code>` 徽标 |
| E3 | 空文本 / 空 URL 会进入子进程并以晦涩方式失败 | 错误提示不可读 | `processRawData` / `collectFromUrls` 入口直接返回 `INPUT_INVALID` |

### 4.6 v1.9.33–1.9.42 · 任务清单与安全加固

| 版本 | 变更 |
|------|------|
| 1.9.33 | 新增 `docs/IMPROVEMENT-TASKS.md` 改进建议任务文档（代码审查 + 实地核查） |
| 1.9.34 | 新增 `docs/TASKS.md` 作为**唯一任务清单**，合并 PROGRESS 遗留任务与改进建议文档；本文档 §5 改为指向 TASKS 的指针 |
| 1.9.35 | **T1 SSRF 加固**：新增 `src/lib/url-guard.js` 纯函数（协议白名单 + 私网 / 回环 / 链路本地 / 云元数据拦截）与 `CollectErrorCode.INVALID_URL`，`collector-core.js` 抓取前逐项校验；**T3** 清理文档漂移（双锁陈述、版本行、变更记录） |
| 1.9.36 | **T2 CSP**：`src/proxy.ts` 注入基于 nonce 的 Content-Security-Policy；**T4** OG/Twitter 元信息：`src/app/layout.tsx` 补全 `metadataBase` / `openGraph` / `twitter` |
| 1.9.37 | **T5 API 集成测试**：新增 `src/lib/request-body.js` 纯函数及 `tests/request-body.test.mjs`、`tests/collector-core.test.mjs`；SSRF 校验前移至浏览器启动前（全部非法则不启动浏览器） |
| 1.9.38 | **T6 行数门禁**：新增 `scripts/check-file-length.cjs`（>200 行即失败）并纳入 `npm test` 与 CI；**T7 依赖审计**：CI 改为 `npm audit --audit-level=high`（高危阻塞、低危放行） |
| 1.9.39 | **T9 命名澄清**：README 新增「命名与兼容性说明」，说明旧名 `GitHub_i18n` 因 `@updateURL` 依赖刻意保留（该保留策略已于 v1.9.43 被脚本更名推翻，新文件名为 `GitHub_zh-cn.user.js`） |
| 1.9.40 | **T8 a11y**：axe-core + jsdom 检查三页静态产物（serious / critical 阻断）+ 语义修复；**T10 采集趋势**：`scripts/collect-history.cjs` 记录统计、`/overview` 展示趋势；拆分 `collect-dict.cjs`（211 行）至 `scripts/dict-report.cjs`；行数门禁扩展至根脚本 |
| 1.9.41 | **文档整理**：清理 `docs/TASKS.md`（第 1 节空节合并、第 2 节归档改紧凑索引表）；同步 `docs/` 与 `openspec/` 全部文档版本行至 v1.9.41；PROGRESS 指标实算刷新（产物字节 / 用例数） |
| 1.9.42 | **T11 CI 门禁补齐**：CI `lint` 作业新增类型检查（`typecheck`）、`build` 作业新增单元测试（`test:unit`，20 用例） |

### 4.7 v1.9.43–1.9.47 · 文档刷新与采集流程改进

| 版本 | 变更 |
|------|------|
| 1.9.43 | 文档指标刷新（`src/` 行数 9230 → 9342、产物 198,899 → 198,838 字节）；同步版本展示位至 v1.9.43 |
| 1.9.44 | 原型简化：仅保留高保真原型并改名为 `index.html`；版本同步 |
| 1.9.45 | 高保真原型重定向为「GitHub 页面字符串采集工具」 |
| 1.9.46 | 原型单一化（删除 `mobile.html`，`desktop.html` → `index.html`）；用户脚本文件名 `GitHub_i18n.user.js` → `GitHub_zh-cn.user.js` |
| 1.9.47 | 采集流程改进：提取去噪（跳过 `script`/`style`/隐藏元素）、匹配归一化（`normalizeText`）、修复并发竞态（独立临时文件）、区分告警/错误、`request-body` 增加 `MAX_URLS=50`、`@babel/core` 移入 `dependencies` |

### 4.8 v1.10.0 · 采集成功率/覆盖率（P1 首批：T12–T14）

| 编号 | 能力 | 处置 |
|------|------|------|
| T12 | 提取精准化：作用域从整页 `body` 收窄为 GitHub SPA 根（`#react-app` / `.application-main` 回退 `body`），跳过 `markdown-body`/`highlight`/`blob-code`/`CodeMirror`/评论等「内容型容器」，进一步降噪、提升信噪比 | `src/lib/extract-page-text.js` 新增 `resolveScopeRoot()` 与内容噪声判定 |
| T13 | SPA/动态内容适配：导航优先 `networkidle2`，超时降级为 `domcontentloaded` + 固定等待；等待 hydration（`#react-app`）后再提取；滚动触发懒加载（`autoScroll`） | 抽离 `src/lib/page-navigation.js`（gotoWithFallback / waitForHydration / autoScroll） |
| T14 | 单次采集鲁棒性：逐 URL 错误隔离（单页失败不中断整批、记日志续跑）；导航超时/反爬(429)/网络错误指数退避重试（最多 3 次） | `page-navigation.js` 的 `navigateWithRetry`（RetryableError + computeBackoffDelay） |

> 抽出 `src/lib/page-navigation.js`（Node 侧、无浏览器依赖、可单测）承载全部导航交互辅助，采集核心 `collector-core.js` 仅保留编排；新增 `tests/page-navigation.test.mjs`（4 用例）覆盖退避与可重试判定。

---

## 5. 任务清单

> 任务追踪已合并至 **[docs/TASKS.md](./TASKS.md)**（活动任务 + 已完成归档），本文档不再重复维护任务表；任务状态以 TASKS.md 为准。

---

## 6. 命令速查

| 命令 | 用途 |
|------|------|
| `npm run build` | 构建用户脚本 → `build/GitHub_zh-cn.user.js` |
| `npm run validate` | 校验产物（存在性 / 体积 / 语法 / 未定义引用） |
| `npm run dev` | 启动 Next.js 采集工作台（默认 3000 端口） |
| `npm run dev:prototype` | 启动 `prototype/` 热更新预览（Express + WebSocket） |
| `npm run build:web` | 构建 Next.js 工作台 |
| `npm run lint` / `lint:fix` | ESLint 检查 / 自动修复 |
| `npm run lint:length` | 代码文件行数门禁（任一 >200 行即失败） |
| `npm run typecheck` | TypeScript 类型检查（`tsc --noEmit`，strict） |
| `npm run format` / `format:check` | Prettier 格式化 / 格式校验 |
| `npm run test:unit` | 运行单元测试（Node 内置 test runner，零依赖） |
| `npm run test` | 完整流水线：lint → build → test:unit → validate |
| `npm run dict:collect -- <文件>` | 采集指定文本文件中的待翻译词条 |
| `npm run clean` | 清理 `build`/`dist`/`coverage`/`.next` |

---

## 7. 版本与文档同步清单

发版时必须逐项核对，避免长期脱节：

1. `src/version.js` 的 `VERSION`（**单一版本源**）
2. `package.json` 的 `version`
3. `CHANGELOG.md` 新增对应版本小节
4. `README.md` 中的版本相关描述与结构说明
5. **本次实际编辑**的文档版本行（`docs/*.md`，含本文档）；未编辑的文档不批量刷写版本行，避免无意义 diff
6. `docs/` 下结构调整文档（`project.md`／`architecture.md`／`development.md`／`coding-style.md`／`prototype.md`）
7. 本次**实际改动**文件的头注释版本号（未改动文件保持不变）
8. 发版后重新执行 `node build.cjs` 并确认 `git status` 干净（产物须可复现）

---

## 8. 变更记录

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.10.2 | 2026-09-25 | 修复 T26 回归：`extractPageText` 经 `page.evaluate` 序列化丢失模块闭包（内联 SKIP_TAGS/resolveScopeRoot/isContentNoise 使其自包含），恢复 v1.10.0 批量采集整批提取 0 文本；新增 `tests/extract-page-text.test.mjs`（jsdom + vm 隔离序列化回归用例）；另补 `browser-semaphore.js`/`batch-collector.js` 单测（共 4 例） |
| 1.10.0 | 2026-09-25 | 采集成功率 P1 首批（T12–T14）：提取精准化（限定 SPA 容器 + 内容噪声降噪）、SPA/动态适配（hydration 等待 + 滚动懒加载 + 超时降级）、单页鲁棒性（逐 URL 错误隔离 + 指数退避重试）；抽离 `src/lib/page-navigation.js` 并新增 4 例单测 |
| 1.9.47 | 2026-09-25 | 采集流程改进：提取去噪、匹配归一化、修复并发竞态、区分告警/错误、`MAX_URLS=50`、`@babel/core` 移入 `dependencies` |
| 1.9.46 | 2026-09-25 | 原型单一化（删除 `mobile.html`，`desktop.html` → `index.html`）；用户脚本文件名 `GitHub_i18n.user.js` → `GitHub_zh-cn.user.js` |
| 1.9.45 | 2026-09-25 | 高保真原型重定向为「GitHub 页面字符串采集工具」 |
| 1.9.44 | 2026-09-25 | 原型简化：仅保留高保真原型并改名 `index.html`；版本同步 |
| 1.9.43 | 2026-09-24 | 文档指标刷新（`src/` 行数 9230 → 9342、产物 198,899 → 198,838 字节）；同步版本展示位 |
| 1.9.42 | 2026-09-23 | CI 门禁补齐（T11）：`lint` 作业新增类型检查、`build` 作业新增单元测试；新增 `npm run typecheck` 脚本 |
| 1.9.41 | 2026-09-23 | 文档整理：清理 `docs/TASKS.md`（归档表格化）、同步 `docs/` 与 `openspec/` 版本行、刷新 PROGRESS 指标 |
| 1.9.40 | 2026-09-23 | 新增 a11y 自动化检查（T8，axe-core + jsdom）与采集趋势可视化（T10，`collect-history.json` + `/overview`）；拆分 `collect-dict.cjs`，门禁覆盖根脚本 |
| 1.9.39 | 2026-09-23 | 文档：README 新增「命名与兼容性说明」（T9），澄清产品名与仓库旧名 `GitHub_i18n` 的保留原因（该保留策略已于 v1.9.43 被脚本更名推翻） |
| 1.9.38 | 2026-09-23 | 新增代码文件行数门禁（T6，`lint:length` + CI）与高优先级依赖审计（T7，`npm audit --audit-level=high`） |
| 1.9.37 | 2026-09-23 | 新增 API 路由集成测试（T5）：`request-body.js` 纯函数 + `request-body`/`collector-core` 用例；SSRF 校验前移至浏览器启动前 |
| 1.9.36 | 2026-09-23 | 新增基于 nonce 的 CSP（T2，`src/proxy.ts`）与 OG / Twitter 元信息（T4，`src/app/layout.tsx`） |
| 1.9.35 | 2026-09-23 | 新增 SSRF 防护（T1）：`src/lib/url-guard.js` 纯函数 + `CollectErrorCode.INVALID_URL`，采集前逐项校验目标 URL；清理文档漂移（T3） |
| 1.9.34 | 2026-09-23 | 新增 `docs/TASKS.md` 作为唯一任务清单，合并 PROGRESS 遗留任务与 `IMPROVEMENT-TASKS.md`（文档） |
| 1.9.33 | 2026-09-23 | 新增 `docs/IMPROVEMENT-TASKS.md` 改进建议任务文档（v1.9.34 已合并入 `TASKS.md`） |
| 1.9.32 | 2026-09-23 | 修复 P0-2：批量采集改用 `puppeteer-core` + 系统 Chrome / Edge（`browser-resolver.js` 解析可执行路径，支持 `PUPPETEER_EXECUTABLE_PATH`），`next build` 告警降为 0 |
| 1.9.31 | 2026-09-23 | 新增用户脚本产物冒烟测试（P2-5）：`tests/smoke.test.cjs` 校验产物存在性 / 体积 / UserScript 元数据 / 版本号 / `vm` 语法合法性 |
| 1.9.30 | 2026-09-23 | 清理未启用的 Jest 配置并改用 Node 内置 test runner（P1-3）；新增 `tests/` 用例覆盖错误码契约与采集纯函数；`npm test` 串联 `test:unit` |
| 1.9.29 | 2026-09-23 | 消除双锁文件漂移（P1-4）：删除 `bun.lock`，保留 npm 单一锁（`package-lock.json`）；词典采集支持增量与去重统计（P2-3）：`collect-dict.cjs` 的 `generateReport` 对比历史 `docs/untranslated-terms.txt`，输出新增 / 移除 / 净增统计 |
| 1.9.28 | 2026-09-23 | 修复配置面板性能监控按钮为死按钮（P2-4）；新增采集错误码约定（P2-7）：`collect-codes.js` 共用 `CollectErrorCode`、服务端错误事件带 `code`、前端渲染错误码徽标；空输入/空 URL 返回 `INPUT_INVALID` |
| 1.9.27 | 2026-09-22 | 修复窄屏下三页无法互跳：新增移动端导航（`MobileNav` + 共享 `navItems`）；≤640px 顶栏与内容区响应式调整 |
| 1.9.26 | 2026-09-22 | 工作台外壳布局与状态徽标修复；新增「项目概览」「设计系统」页；`middleware`→`proxy` 迁移；采集服务端逻辑去重（P1-5）；移除未引用的 i18n 框架（P1-2）；开启 TS 严格模式（P2-1）；消除构建期循环引用；拆分超长文件 |
| 1.9.25 | 2026-09-22 | 修复词典清洗子进程输入路径不匹配导致清洗步骤失败；`req.json()` 异常改返回 400 |
| 1.9.24 | 2026-09-19 | 修复构建脚本模块清单脱节等 7 项阻塞缺陷；对齐 CI 脚本；补齐采集工作台交互；拆分 6 处超长文件；新增产物校验脚本与本文档 |
| 1.9.23 | 2026-09-19 | 采集演示页升级为 Next.js 16（App Router）；新增 Tailwind/PostCSS/ESLint/Husky 配置 |
| 1.9.22 | 2026-09-18 | 重构词典采集向导样式，统一品牌绿主题，去除无效 Tailwind 依赖 |
| 1.9.21 | 2026-07-18 | 项目更名为 GitHub Chinese 简体中文 |
| 1.9.20 | 2026-06-10 | 工具模块拆分（functionUtils/stringUtils/domUtils/urlUtils/securityUtils 等） |

---

## 9. 规划中（Roadmap）：采集成功率/覆盖率与词典管理增强

> 当前采集链路（v1.10.2）已具备「粘贴/批量 URL → Headless 抓取 → 词典匹配 → 报告/趋势」主干能力，
> 其中 **T12 提取精准化、T13 SPA/动态适配、T14 单页鲁棒性、T15 并发限流已落地**（详见 §4.8）；
> **T26（`extractPageText` 经 `page.evaluate` 序列化丢失辅助、整批提取 0 文本回归）已在 v1.10.2 修复**；仍缺少覆盖率度量、无采集后词条级管理。
>
> **规划以任务清单 [docs/TASKS.md](./TASKS.md) T12–T25 为唯一活动清单（含 P1–P3 优先级与 S/M/L 工作量标签、验收要点）；
> 变更记录以 [CHANGELOG.md](./CHANGELOG.md) §1.9.48 为唯一归处。本文档仅作规划指针，不再复述任务逐条内容，避免多文档重复。**

### 9.1 采集成功率与覆盖率提升（T12–T18）
围绕「提取更准、适配更稳、度量更清」三条主线：提取精准化（限定 UI 容器）、SPA 动态内容适配、单页错误隔离与退避重试、并发限流、匹配策略增强、覆盖率度量、采集源扩展。

### 9.2 采集后词典管理增强（T19–T25）
围绕「审阅 → 入库 → 度量 → 回溯」闭环：词条级审阅、一键合并入库、翻译建议、覆盖率/缺口看板、历史轮次对比、导入导出增强、搜索与批量操作。
