# 项目规范

> 版本：**v1.13.13** ｜ 版本权威源：`src/userscript/version.js`

## 项目概述

GitHub Chinese 简体中文是一个浏览器用户脚本项目，为 GitHub 网站提供中文本地化翻译支持；同时附带一个基于 Next.js 的词典采集工作台，用于持续沉淀翻译词条。

### 核心功能

- **静态文本翻译**：将 GitHub 界面的英文文本翻译为中文
- **动态内容监控**：监听 DOM 变化，自动翻译新增内容
- **多模式支持**：支持 Issue、PR、Code、Explore、Codespaces 等页面的智能翻译
- **性能优化**：Trie 树部分匹配、LRU 缓存、虚拟 DOM、批量处理
- **词典采集工作台**：从 GitHub 页面抓取 UI 词条，清洗后沉淀为本地词典
- **配置与更新**：内置配置面板、性能监控面板与自动更新检查

### 技术栈

| 层次 | 技术 |
|------|------|
| 用户脚本 | JavaScript (ES6+)、ES Modules、Tampermonkey / Greasemonkey API |
| 采集工作台 | Next.js 16（App Router）、React 19、TypeScript、Tailwind CSS |
| 采集内核 | puppeteer-core（可选依赖）+ 系统 Chrome / Edge（Headless 抓取） |
| 构建 | 自研 ESM 依赖图拼接（`build.cjs`）+ Next 构建 |
| 质量 | ESLint（Flat Config）、Prettier、Husky + lint-staged |

---

## 目录结构

```
GitHub_Chinese/
├── src/                              # 源码根目录（用户脚本 + 采集工作台）
│   ├── main.js                       # 用户脚本唯一入口
│   ├── main/                         # 生命周期编排
│   ├── core/                         # 基础设施（缓存 / 错误 / Trie / 虚拟 DOM）
│   ├── translation-core/             # 翻译核心引擎
│   ├── page-monitor/                 # DOM 与路由监听
│   ├── dictionaries/                 # 翻译词典
│   │   └── common/                   # 通用词典（nav / repo / pr / issue / misc）
│   ├── ui/                           # 配置界面与样式
│   ├── utils/                        # 通用工具函数
│   ├── config.js                     # 全局配置
│   ├── config/                       # 配置分片（performance / selectors / elements）
│   ├── version.js                    # 版本信息（单一版本源）
│   ├── versionUtils.js               # 版本比较与提取
│   ├── versionChecker/               # 远程版本抓取
│   ├── updateNotification/           # 更新通知 UI
│   ├── app/                          # Next.js App Router（采集工作台，六页：console / overview / coverage / design / dictionary / dict-manage）
│   │   ├── page.tsx                  # 采集控制台（服务端外壳 + 客户端岛）
│   │   ├── overview/page.tsx         # 项目概览（服务端实时指标）
│   │   ├── coverage/page.tsx          # 覆盖率 / 缺口看板（T22）
│   │   ├── design/page.tsx           # 设计系统（令牌与组件展示）
│   │   ├── api/collect/route.ts      # 文本粘贴采集
│   │   ├── api/batch-collect/route.ts# 批量 URL 采集
│   │   ├── layout.tsx / globals.css  # 外壳布局与 Tailwind 入口
│   │   └── robots.ts / sitemap.ts    # SEO
│   ├── components/                   # Shell / TopNav（服务端）+ navItems（导航源）+ CollectorConsole（客户端岛）+ Dashboard / DataCenter / PreviewTable / ScriptInjector（叶组件）
│   ├── hooks/                        # useCollector.ts（状态 Hook）+ collector-types / constants / sse.ts（拆分模块）
│   ├── lib/                          # 采集内核：collector-core / dictionary-processor / extract-page-text / page-navigation / collector-logic / request-body / url-guard（SSRF）/ browser-resolver / browser-semaphore / collect-codes / coverage-report / sse-stream / api-guard（鉴权限流）/ batch-collector / project-metrics
│   ├── types/puppeteer-core.d.ts     # 可选依赖类型声明
│   └── proxy.ts                      # 安全响应头 + nonce CSP（Next 16 起取代 middleware）
├── prototype/                        # 高保真原型
│   ├── assets/                       # 原型样式（CSS）
│   └── prototypes/                   # index.html（唯一原型入口）
├── scripts/
│   ├── build/moduleGraph.cjs         # 模块依赖图（拓扑排序 / 孤立检测）
│   ├── build/transform.cjs           # ESM → 单作用域拼接
│   └── validate-bundle.cjs           # 构建产物校验
├── docs/                             # 正式规范文档（权威正文）
├── build/                            # 用户脚本构建产物（需纳入版本控制）
├── build.cjs                         # 用户脚本构建入口
├── scripts/collect-dict.cjs            # 词典采集工具（已随 v1.12.8 迁入 scripts/）
├── server.js                         # 原型热更新预览服务器
├── next.config.mjs                   # Next 配置（根级，与 src 解耦）
├── tailwind.config.ts / postcss.config.mjs
├── eslint.config.js                  # ESLint Flat Config
├── tsconfig.json                     # TypeScript 配置
├── package.json                      # NPM 包配置
└── CHANGELOG.md
```

---

## 核心模块说明

### 1. translation-core（翻译核心）

执行实际翻译工作的核心引擎。

- `dictionaryManager.js`：词典加载、哈希索引、Trie 树与缓存查询
- `elementSelector.js` / `selectorUtils`：筛选需要翻译的元素
- `elementTranslator.js`（+ `elementTranslator/stats.js`、`critical.js`）：单元素翻译与关键区域兜底翻译
- `partialTranslator.js`：基于 Trie 树的部分匹配翻译
- `translator.js` / `batchProcessor.js`：翻译编排与分批执行
- `pageModeDetector.js`：识别当前页面模式（Code / Issue / PR / Explore 等）
- `performanceMonitor.js` / `cacheController.js`：性能统计与缓存治理
- `lifecycle.js`：翻译核心的初始化与资源清理

### 2. page-monitor（页面监控）

负责监听 GitHub 页面变化，检测新内容并触发翻译。

- `domObserver.js`（+ `domObserver/*`）：MutationObserver 监听与突变权重分析
- `pathListener.js`：监听路由变化，检测 SPA 页面切换
- `pageAnalyzer.js`：分析页面类型，确定翻译策略
- `translationTrigger.js`：节流触发翻译

### 3. core（基础设施）

- `cacheManager.js`：LRU 缓存，减少重复翻译
- `trie.js`：Trie 树结构，加速部分匹配查询
- `errorHandler.js`（+ `errorHandler/constants.js`、`recovery.js`）：分级错误处理与恢复
- `virtualDom.js`（+ `virtualDom/manager.js`、`constants.js`）、`virtualNode.js`：减少真实 DOM 操作

### 4. ui（用户界面）

- `configUI.js`：配置面板主类与全局单例
- `configUI/store.js`：用户配置持久化（`localStorage` + 轻量混淆）
- `configUI/renderer.js`：面板 DOM 渲染
- `configUI/bootstrap.js`：浮动入口按钮与用户脚本菜单命令
- `components/performanceMonitor.js`：性能监控面板
- `styles/configUI/*`：面板样式（base / buttons / components）

### 5. 采集工作台（Next.js）

- `src/app/page.tsx`：采集控制台服务端外壳；交互收敛在 `src/components/CollectorConsole.tsx` 客户端岛
- `src/app/overview/page.tsx` / `src/app/coverage/page.tsx` / `src/app/design/page.tsx`：项目概览、覆盖率/缺口看板（T22）、设计系统（均为静态预渲染，`coverage` 为 `force-dynamic` 服务端实时统计）
- `src/components/Shell.tsx` / `TopNav.tsx`：服务端外壳与顶部导航；`navItems.ts` 为导航唯一数据源
- `src/components/CollectorConsole.tsx` 叶组件：`ScriptInjector`（探针复制）、`DataCenter`（文本/批量归集 + JSON 导出）、`PreviewTable`（词条预览）、`Dashboard`（实时进度/终端/备份）
- `src/hooks/useCollector.ts`：采集状态与 SSE 事件流解析；`collector-types.ts` / `collector-constants.ts` / `collector-sse.ts` 按职责拆分
- `src/lib/collector-core.js`：Headless 抓取与采集编排（链路唯一实现）
- `src/lib/dictionary-processor.js`：调用 `scripts/collect-dict.cjs` 的子进程桥接（`term` 结构化事件下发，解除前后端输出耦合）
- `src/lib/extract-page-text.js`：浏览器端自包含文本提取（作用域根 + 噪声过滤），可经 `page.evaluate` 注入
- `src/lib/page-navigation.js`：导航超时降级、hydration 等待、滚动懒加载、指数退避重试
- `src/lib/collector-logic.ts` / `request-body.js` / `collect-codes.js`：类型门面、请求体校验、错误码契约
- `src/lib/url-guard.js`（SSRF）、`browser-resolver.js` / `browser-semaphore.js`（浏览器解析与并发限流）、`sse-stream.ts`（SSE 工厂）、`api-guard.ts`（鉴权 + 限流）、`coverage-report.ts`（覆盖率统计）、`project-metrics.ts`（磁盘指标）、`batch-collector.js`
- 根级采集工具脚本：`scripts/collect-dict.cjs`（清洗子进程）、`review-store.cjs`（审阅状态机，T19）、`merge-into-dictionary.cjs`（合并入库，T20）、`history-diff.cjs`（轮次对比/回滚，T23）、`io-dictionary.cjs`（导入导出，T24）、`term-operations.cjs`（搜索批量，T25）、`coverage.cjs`（覆盖率度量，T17）、`merge-dictionaries.cjs`；`scripts/`：`dict-report.cjs`、`collect-history.cjs`
- `src/app/api/*/route.ts`：`text/event-stream` 流式接口（`createSseResponse` 统一心跳/取消）
- `src/proxy.ts`：附加 nonce CSP 与安全响应头（Next 16 起取代 `middleware`）

---

## 开发规范

### 分支策略

- `main`：稳定发布分支
- `feature/*`：新功能开发
- `fix/*`：缺陷修复

### 提交规范

遵循 Conventional Commits：

```
<type>(<scope>): <description>

feat(translationCore): 添加部分匹配翻译功能
fix(pageMonitor): 修复 DOM 变化监听问题
docs: 更新项目文档
```

### 版本号管理

- **格式**：SemVer（主版本.次版本.修订号）
- **单一版本源**：`src/userscript/version.js` 的 `VERSION`
- **升级规则**：任意修改至少升 patch；新功能升 minor；破坏性变更升 major
- **仅更新被改动文件的头注释版本号**，禁止全仓库批量刷写

### 代码质量

- ESLint：`npm run lint`（当前 2 error / 0 warning，已知预存问题，详见量化指标）
- Prettier：`npm run format`
- TypeScript：`tsc --noEmit`（当前未通过，4 个 TS 错误，详见量化指标）
- 单代码文件不超过 200 行，超出须按职责拆分
- 主要容器与交互控件需带语义化 `id`

---

## 构建与发布

### 命令

```bash
npm run build          # 构建用户脚本 → build/GitHub_zh-cn.user.js
npm run validate       # 校验构建产物
npm run dev            # 启动 Next 采集工作台
npm run dev:prototype  # 启动 prototype 热更新预览
npm run build:web      # 构建 Next 工作台
npm run lint           # 代码检查
npm test               # lint → build → validate
```

### 发布流程

1. 更新 `src/userscript/version.js` 中的 `VERSION`
2. 同步 `package.json`、`CHANGELOG.md` 与文档中的版本展示位
3. 运行 `npm test` 验证
4. 重建并提交 `build/GitHub_zh-cn.user.js`
5. 创建 Git Tag（`git tag v1.9.24`）并推送，CI 自动产出 Release 资产

---

## 开发现状

> 版本权威源 `src/userscript/version.js`；迭代记录见本文档「迭代记录」节，变更历史见 [CHANGELOG.md](../CHANGELOG.md)（唯一归处），活动任务见 [tasks.md](./tasks.md)（唯一清单）。

### 当前版本与双链路

- 当前版本 **v1.13.12**（2026-10-01）。
- 双链路：① 用户脚本引擎（核心交付物 `build/GitHub_zh-cn.user.js`，Tampermonkey / Greasemonkey）；② 词典采集工作台（Next.js 16 App Router，六页 `/`、`/overview`、`/coverage`、`/design`、`/dictionary`、`/dict-manage`）。两链路仅共享词典数据。

### 量化指标

量化指标随发版由对应命令实算，**禁止手填**（v1.13.12 发版实算快照，发版时重新实算）：

| 指标 | 数值 | 采集方式 |
|------|------|---------|
| `src/` 源码文件数 | 157 | 递归统计 `.js/.cjs/.mjs/.ts/.tsx/.css` |
| `src/` 源码总行数 | 12695 | 同上 |
| 用户脚本纳入模块数 | 92 | `node build.cjs` 输出 |
| 用户脚本孤立模块数 | 1（`src/utils/logger.js`） | 同上 |
| 构建期循环引用 | 0 | 同上 |
| 用户脚本产物大小 | 194.86 KB（build.cjs 输出） | `build/GitHub_zh-cn.user.js` |
| 翻译词典词条数 | 459 | `mergeAllDictionaries()` 合并计数 |
| 词典模块数 | 12 | `src/dictionaries/**/*.js` |
| 原型资源数 | 1 个 HTML + 10 个 CSS | `prototype/` |
| 工作台页面路由 | 6（console·overview·coverage·design·dictionary·dict-manage） | `src/components/navItems.ts` |
| 代码检查 | 2 error / 0 warning | `npm run lint` |
| 类型检查 | 未通过（`next build` 报 4 个 TS 错误，strict 模式启用） | `npm run build:web` |
| 产物校验 | 通过（build.cjs 生成成功，vm 编译校验通过） | `npm run build:userscript` |
| 单元测试 | 170 用例（161 通过 / 5 集成测试因 Next 服务未就绪失败 / 4 跳过） | `node --test` |
| 超长代码文件（>200 行） | 0 | 递归扫描全部代码文件 |
| Next 构建告警 | 构建失败（类型检查未通过，阻断 `next build`） | `npm run build:web` |

> 工作台「项目概览」页（`/overview`）已把多数指标改为服务端实时统计，不再依赖本文档的手工数字。

> ⚠️ 「类型检查」与「Next 构建告警」当前为**未通过 / 构建失败**，系 `src/app/api/batch-collect/route.ts` 与 `src/components/dictionary/MergePatchPanel.tsx` 的 4 个 TypeScript 错误所致（`next build` 类型检查阶段即报错）。此为**已知预存问题**，非本次文档变更引入，修复另行跟进。

### 已完成能力

- **用户脚本引擎**：静态/动态翻译、Trie 部分匹配、LRU 缓存/虚拟 DOM/批处理、配置面板 + 性能监控、浮动入口 + 菜单命令、自动更新、输入净化。
- **采集工作台**：探针一键复制、文本粘贴/批量 URL 采集（Headless）、词条预览表、实时处理中心（进度/终端日志）、智能清洗/导出 JSON、六页互通与响应式顶部导航、项目概览（实时指标）、设计系统、**覆盖率/缺口看板（/coverage，T22）**。
- **工程化**：依赖图构建 + 循环/孤立检测、产物校验、ESLint（Flat）/Prettier/Husky/lint-staged、CI/CD（lint→build→validate→artifact→release）、GitHub Pages 部署、TS 严格模式、`middleware`→`proxy` 迁移、语义化 `id`、单文件 ≤200 行、Node 内置 test runner（170 用例）、a11y 自动化检查。

### 活动任务（以 docs/tasks.md 为唯一清单）

- **T18** 采集源扩展（L）：登录态 cookie / HAR 导入，覆盖更多私有 UI 区域。
- **T21** 翻译建议（L）：LLM/翻译记忆建议译文，失败降级（无 key 跳过）。

### 迭代里程碑（节选，详见 CHANGELOG）

- **v1.9.26** 工作台外壳修复 + 概览/设计页 + `proxy` 迁移 + 采集逻辑去重 + TS 严格模式。
- **v1.9.35–1.9.42** SSRF（T1）/ CSP（T2）/ a11y（T8）/ 依赖审计（T7）/ 行数门禁（T6）等安全加固与质量门禁。
- **v1.10.0** 采集成功率 P1（T12–T14：提取精准化 / SPA 适配 / 单页鲁棒性）。
- **v1.11.1–1.11.16** 采集安全（C1–C3/W1–W6/S1–S2/T27–T34）+ 词典管理数据层（T17 度量、T19 审阅、T20 合并、T23 历史、T24 导入导出、T25 搜索批量）+ 覆盖率看板（T22）。
- **v1.12.0** 文档收口（合并 `docs/TASKS.md` 入 `docs/PROGRESS.md` §5，删除 TASKS.md）。

---

## 迭代记录

> 以下为按版本的内部迭代记录（缺陷修复 / 架构改进 / 文档完善），对应变更的细化与验收以 [CHANGELOG.md](../CHANGELOG.md) 为准。原 `docs/PROGRESS.md` 的 §4 已并入本节。

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

- **客户端边界收敛**：`src/app/page.tsx` 原为整页 `'use client'`，现改为服务端页面 + `CollectorConsole` 客户端岛；侧栏、顶栏、步骤条等静态结构不再进入客户端包。
- **导航真实化**：侧栏三个入口由 `aria-disabled` 占位改为 `next/link` 真实路由（`prefetch` + `aria-current`）。
- **新增页面**：`/overview`（服务端读取磁盘指标）、`/design`（设计令牌与组件展示），均静态预渲染。
- **采集逻辑去重（P1-5）**：删除 `src/server/collector.js`，Next 路由与原型服务器共用 `collector-core.js`（抓取编排）+ `dictionary-processor.js`（子进程桥接）；SSE 适配各自保留。
- **可选依赖处理**：`puppeteer` 改为运行时解析（`createRequire` + 变量说明符），并加入 `serverExternalPackages`；未安装时返回明确提示而非崩溃。
- **类型安全**：`tsconfig.json` 开启 `strict: true`，零错误（与「避免 any」约定对齐）。
- **移除未引用的 i18n 框架（P1-2，决策 B）**：删除 `src/i18n.js` + `src/i18n/`（9 个文件 / 641 行），移除依据：1. 精确检索（import 说明符）确认**零外部引用**，构建时持续报告 9 个孤立模块；2. 产品为单语言（中文）工具，其自身 UI 固定中文，无语言切换需求；3. `translations.js` 的 `github.*` 键与词典职责重叠，双翻译源易产生分叉（词典 459 条 vs 硬编码 8 条）；4. `loader.js` 提供远程拉取翻译 JSON 的能力，与「本地优先 · 离线可用」定位相悖。内容仍完整保留在 git 历史中，如需恢复可整体还原。

### 4.3 v1.9.26 · 文档完善

- 重写 `docs/PROGRESS.md`：指标实算、任务状态、架构图与变更记录同步至 v1.9.26。
- `docs/architecture.md` 同步工作台架构与目录结构。
- `CHANGELOG.md` 新增 1.9.26 小节。
- 版本同步范围：`src/userscript/version.js`、`package.json`、`README.md` 徽章、`CHANGELOG.md`、以及**本次实际改动文件**的头注释版本号。

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
| 1.9.34 | 新增 `docs/TASKS.md` 作为**唯一任务清单**，合并 PROGRESS 遗留任务与改进建议文档；PROGRESS §5 改为指向 TASKS 的指针 |
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

### 4.9 v1.11.16 · 覆盖率看板（T22）

- 新增 `/coverage` 路由与服务端取数模块 `src/lib/coverage-report.ts`：实时扫描磁盘词典，计算整体翻译覆盖率、按文件（common/codespaces/explore）细分进度条、Top-N 采集缺口（读 `docs/untranslated-terms.txt`）、跨模块同键多值冲突与近似键聚类；服务端渲染（`force-dynamic`），不依赖浏览器，规避 W5 架构约束。
- 复用 `Shell` 外壳与 `progress`/`showcase` 设计令牌，新增 `public/css/coverage.css`；`navItems.ts` 导航新增「覆盖率」项。
- 版本同步至 1.11.16：`src/userscript/version.js`、`package.json`、`README.md`、`CHANGELOG.md` 与本次改动文件头注释。

---

## 4.10 v1.12.1 · 文档收口与 UI 对齐原型

- **Docs（合并 OpenSpec 索引入 docs）**：`openspec/` 规范索引与配置并入 `docs/README.md`（唯一文档入口），删除 `openspec/`，消除第二份文档副本与维护脱节；修正活跃交叉引用（`docs/project.md`、`docs/architecture.md`、根 `README.md`、`docs/development.md`、`docs/coding-style.md` 移除 `openspec/`、`config.yaml` 等引用）。
- **Refactor（应用 UI 对齐原型 / 首页重构）**：`CollectorConsole` 以原型四区块（h2+meta）包裹各模块；`DataCenter` 补原型描述；`Shell` 新增页脚（原型 `proto-footer`）；`grid-2` 列宽对齐原型 `1fr 1fr`；新增 `.section`/`.footer` 样式。

## 4.11 v1.12.2 · 采集页整页复刻原型

- 采集工具首页（`/`）脱离标准 `Shell`，改用原型外壳：`proto-topbar`（品牌「GitHub 中文 · 采集工具」+ 设置齿轮）、hero（eyebrow / 标题 / 导语）、页脚「高保真原型 · 仅供设计走查」；隐藏深侧栏，导航经页脚链接与移动端导航保留。
- 新增 `public/css/prototype.css`：在 `.proto-page` 作用域内对齐原型 `ct-*` 组件值（步骤徽标绿底 26px、卡片内边距 16px / 标题 16px·600、栅格 16px、tab 下划线式、输入框 / 代码块 / 词条表 / 进度卡 / 终端尺寸与圆角对齐）；覆盖仅作用于采集页，不影响 `/overview` `/coverage` `/design`。

## 4.12 v1.12.3 · 采集页恢复标准应用框架

- 撤销「整页复刻原型」模式：采集页 `page.tsx` 改回标准 `Shell`（侧栏 + 真实顶栏 + 真实页脚），恢复应用身份并保留全部交互功能（探针复制 / 文本·批量 URL 采集 / 实时日志 / JSON 导出）。
- `Shell` 移除 `prototype`/`brand` 模式分支，新增 `contentClass` 仅用于采集页承接 `prototype.css` 的组件级视觉对齐（`.proto-page` 作用域），不影响其余三页。
- `prototype.css` 删除失效的 proto 顶栏 / 齿轮样式，保留 hero 与 `.proto-page` 组件覆盖；hero eyebrow 由「PROTOTYPE · COLLECTOR」改「采集工具 · COLLECTOR」。

## 4.13 v1.12.4 · 清理冗余依赖与重复代码（+ 产物重建）

- 移除未使用的 devDependencies：`serve`、`@babel/preset-env`（含传递依赖共 147 个包）；`dev:prototype` 实际由 `server.js`（express）驱动，无 babel 配置引用 preset-env。
- 去重：`DictionaryProcessor.mergeDictionaries()` 改为复用 `dictionaries/index.js` 的 `mergeAllDictionaries()`，删除重复遍历逻辑。
- **分析发现并修复产物脱节**：`build/GitHub_zh-cn.user.js` 自 v1.11.16 起从未重建，UserScript `@version` 与内联 `version.js` 仍停留 1.11.16，导致 `tests/smoke.test.cjs`「产物含当前版本号」断言失败；本次已 `node build.cjs` 重建，产物现含 `@version 1.12.4`、纳入 92 模块、193.98 KB，全量单测 62 用例（61 通过 / 1 跳过 / 0 失败）。

---

## 4.14 v1.12.6 · T21 翻译建议 + 词典助手页

- **Feat（T21 翻译建议）**：新增翻译建议引擎 `src/lib/translation-suggest.js`（纯函数、无网络）——基于现有词典（翻译记忆）给出建议译文，覆盖精确命中 / 大小写命中 / 多词组合，并跳过「待翻译」占位；新增可选 LLM 增强 `src/lib/llm-suggest.js`（配置 `GHZH_LLM_KEY` 时调用 OpenAI 兼容接口，无密钥或失败均降级跳过）。
- **Feat（词典助手页 + 持久化）**：新增 `GET /api/dictionary/suggest` 接口与「词典助手」页（`/dictionary`，`DictionaryHelper` 客户端岛），支持输入词条获取建议、采纳后存 `localStorage` 待入库并导出 JSON；导航新增「词典助手」项；新页面纳入 a11y 走查。
- 单元测试 `tests/translation-suggest.test.mjs` 覆盖引擎（10 用例）；全量单测 73 用例（72 通过 / 1 跳过 / 0 失败）。

## 版本与文档同步清单

发版时必须逐项核对，避免长期脱节：

1. `src/userscript/version.js` 的 `VERSION`（**单一版本源**）
2. `package.json` 的 `version`
3. `CHANGELOG.md` 新增对应版本小节
4. `README.md` 中的版本相关描述与结构说明
5. **本次实际编辑**的文档版本行（`docs/*.md`，含本文档）；未编辑的文档不批量刷写版本行，避免无意义 diff
6. `docs/` 下结构调整文档（`project.md`／`architecture.md`／`development.md`／`coding-style.md`／`prototype.md`）
7. 本次**实际改动**文件的头注释版本号（未改动文件保持不变）
8. 发版后重新执行 `node build.cjs` 并确认 `git status` 干净（产物须可复现）

## 路线图（Roadmap）

> 当前采集链路（v1.12.6）已具备「粘贴/批量 URL → Headless 抓取 → 词典匹配 → 报告/趋势」主干能力，其中 **T12 提取精准化、T13 SPA/动态适配、T14 单页鲁棒性、T15 并发限流已落地**（详见本文「迭代记录」）；**T26（`extractPageText` 经 `page.evaluate` 序列化丢失辅助、整批提取 0 文本回归）已在 v1.10.2 修复**；**覆盖率度量（T17）+ 覆盖率/缺口看板（T22）已交付**；T19–T25 数据层（审阅/合并/历史/导入导出/搜索批量）已就绪，T21 的 UI 接入与 localStorage 持久化已由 v1.12.6「词典助手」页交付；剩 T19–T25 其余工作台 UI 接入，以及 T18 采集源扩展。
>
> **活动任务以 [docs/tasks.md](./tasks.md) 为唯一清单（含 P1–P3 优先级与 S/M/L 工作量标签、验收要点）；变更记录以 [CHANGELOG.md](../CHANGELOG.md) 为唯一归处。**

### 9.1 采集成功率与覆盖率提升（T12–T18）
围绕「提取更准、适配更稳、度量更清」三条主线：提取精准化（限定 UI 容器）、SPA 动态内容适配、单页错误隔离与退避重试、并发限流、匹配策略增强、覆盖率度量、采集源扩展。

### 9.2 采集后词典管理增强（T19–T25）
围绕「审阅 → 入库 → 度量 → 回溯」闭环：词条级审阅、一键合并入库、翻译建议、覆盖率/缺口看板、历史轮次对比、导入导出增强、搜索与批量操作。

---

## 项目信息

| 属性 | 值 |
|------|------|
| **项目名称** | GitHub Chinese 简体中文 |
| **仓库** | https://github.com/Tanox/GitHub_i18n |
| **当前版本** | 1.13.12 |
| **核心语言** | JavaScript (ES6+) / TypeScript |
| **目标平台** | 浏览器用户脚本 + Next.js 采集工作台 |
| **默认署名** | Sut |
| **许可证** | GPL-2.0 |

---

## 规范文档索引

| 文档 | 说明 |
|------|------|
| [architecture.md](./architecture.md) | 系统架构设计、模块关系、技术选型 |
| [development.md](./development.md) | 开发流程、分支策略、发布规范 |
| [coding-style.md](./coding-style.md) | 命名规范、代码格式、注释要求 |
| [prototype.md](./prototype.md) | 原型设计、交互规格与数据结构 |
| [tasks.md](./tasks.md) | 活动任务唯一清单（含优先级与验收要点） |
