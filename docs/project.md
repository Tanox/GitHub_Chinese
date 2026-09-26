# 项目规范

> 版本：**v1.12.1** ｜ 版本权威源：`src/version.js`

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
│   ├── app/                          # Next.js App Router（采集工作台，四页）
│   │   ├── page.tsx                  # 采集控制台（服务端外壳 + 客户端岛）
│   │   ├── overview/page.tsx         # 项目概览（服务端实时指标）
│   │   ├── coverage/page.tsx          # 覆盖率 / 缺口看板（T22）
│   │   ├── design/page.tsx           # 设计系统（令牌与组件展示）
│   │   ├── api/collect/route.ts      # 文本粘贴采集
│   │   ├── api/batch-collect/route.ts# 批量 URL 采集
│   │   ├── layout.tsx / globals.css  # 外壳布局与 Tailwind 入口
│   │   └── robots.ts / sitemap.ts    # SEO
│   ├── components/                   # Shell / Rail / MobileNav（服务端）+ navItems（导航源）+ CollectorConsole（客户端岛）+ Dashboard / DataCenter / PreviewTable / ScriptInjector（叶组件）
│   ├── hooks/                        # useCollector.ts（状态 Hook）+ collector-types / constants / sse.ts（拆分模块）
│   ├── lib/                          # 采集内核：collector-core / dictionary-processor / extract-page-text / page-navigation / collector-logic / request-body / url-guard（SSRF）/ browser-resolver / browser-semaphore / collect-codes / coverage-report / sse-stream / api-guard（鉴权限流）/ batch-collector / project-metrics
│   ├── types/puppeteer-core.d.ts     # 可选依赖类型声明
│   └── proxy.ts                      # 安全响应头 + nonce CSP（Next 16 起取代 middleware）
├── public/                           # Next 静态样式资源（css）
│   └── css/                          # 采集工作台样式（模块化，单文件 ≤200 行）
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
├── collect-dict.cjs                  # 词典采集工具
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
- `src/components/Shell.tsx` / `Rail.tsx` / `MobileNav.tsx`：服务端外壳、侧栏与移动端导航；`navItems.ts` 为导航唯一数据源
- `src/components/CollectorConsole.tsx` 叶组件：`ScriptInjector`（探针复制）、`DataCenter`（文本/批量归集 + JSON 导出）、`PreviewTable`（词条预览）、`Dashboard`（实时进度/终端/备份）
- `src/hooks/useCollector.ts`：采集状态与 SSE 事件流解析；`collector-types.ts` / `collector-constants.ts` / `collector-sse.ts` 按职责拆分
- `src/lib/collector-core.js`：Headless 抓取与采集编排（链路唯一实现）
- `src/lib/dictionary-processor.js`：调用 `collect-dict.cjs` 的子进程桥接（`term` 结构化事件下发，解除前后端输出耦合）
- `src/lib/extract-page-text.js`：浏览器端自包含文本提取（作用域根 + 噪声过滤），可经 `page.evaluate` 注入
- `src/lib/page-navigation.js`：导航超时降级、hydration 等待、滚动懒加载、指数退避重试
- `src/lib/collector-logic.ts` / `request-body.js` / `collect-codes.js`：类型门面、请求体校验、错误码契约
- `src/lib/url-guard.js`（SSRF）、`browser-resolver.js` / `browser-semaphore.js`（浏览器解析与并发限流）、`sse-stream.ts`（SSE 工厂）、`api-guard.ts`（鉴权 + 限流）、`coverage-report.ts`（覆盖率统计）、`project-metrics.ts`（磁盘指标）、`batch-collector.js`
- 根级采集工具脚本：`collect-dict.cjs`（清洗子进程）、`review-store.cjs`（审阅状态机，T19）、`merge-into-dictionary.cjs`（合并入库，T20）、`history-diff.cjs`（轮次对比/回滚，T23）、`io-dictionary.cjs`（导入导出，T24）、`term-operations.cjs`（搜索批量，T25）、`coverage.cjs`（覆盖率度量，T17）、`merge-dictionaries.cjs`；`scripts/`：`dict-report.cjs`、`collect-history.cjs`
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
- **单一版本源**：`src/version.js` 的 `VERSION`
- **升级规则**：任意修改至少升 patch；新功能升 minor；破坏性变更升 major
- **仅更新被改动文件的头注释版本号**，禁止全仓库批量刷写

### 代码质量

- ESLint：`npm run lint`（当前 0 error / 0 warning）
- Prettier：`npm run format`
- TypeScript：`tsc --noEmit`（当前通过）
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

1. 更新 `src/version.js` 中的 `VERSION`
2. 同步 `package.json`、`CHANGELOG.md` 与文档中的版本展示位
3. 运行 `npm test` 验证
4. 重建并提交 `build/GitHub_zh-cn.user.js`
5. 创建 Git Tag（`git tag v1.9.24`）并推送，CI 自动产出 Release 资产

---

## 开发现状

> 版本权威源 `src/version.js`；完整进度、迭代记录与变更历史见 [PROGRESS.md](./PROGRESS.md) 与 [CHANGELOG.md](../CHANGELOG.md)。

### 当前版本与双链路

- 当前版本 **v1.12.0**（2026-09-26）。
- 双链路：① 用户脚本引擎（核心交付物 `build/GitHub_zh-cn.user.js`，Tampermonkey / Greasemonkey）；② 词典采集工作台（Next.js 16 App Router，四页 `/`、`/overview`、`/coverage`、`/design`）。两链路仅共享词典数据。

### 量化指标（发版时由脚本实算，禁止手填；数值取自 PROGRESS §1.1 v1.12.0）

| 指标 | 数值（v1.12.0） |
|------|------|
| `src/` 源码文件数 | 122 |
| `src/` 源码总行数 | 9612 |
| 用户脚本纳入模块数 | 92（孤立 0、循环引用 0） |
| 用户脚本产物大小 | 198,838 字节（194.18 KB） |
| 翻译词典词条数 | 459（12 个词典模块） |
| 工作台页面路由 | 4（`/`、`/overview`、`/coverage`、`/design`） |
| 代码检查 / 类型检查 | 0 error / 0 warning；`strict: true` 通过 |
| 单元测试 | 20 用例通过（含 a11y 3） |
| 超长代码文件（>200 行） | 0 |

### 已完成能力

- **用户脚本引擎**：静态/动态翻译、Trie 部分匹配、LRU 缓存/虚拟 DOM/批处理、配置面板 + 性能监控、浮动入口 + 菜单命令、自动更新、输入净化。
- **采集工作台**：探针一键复制、文本粘贴/批量 URL 采集（Headless）、词条预览表、实时处理中心（进度/终端日志）、智能清洗/导出 JSON、四页互通与响应式导航、项目概览（实时指标）、设计系统、**覆盖率/缺口看板（/coverage，T22）**。
- **工程化**：依赖图构建 + 循环/孤立检测、产物校验、ESLint（Flat）/Prettier/Husky/lint-staged、CI/CD（lint→build→validate→artifact→release）、GitHub Pages 部署、TS 严格模式、`middleware`→`proxy` 迁移、语义化 `id`、单文件 ≤200 行、Node 内置 test runner（20 用例）、a11y 自动化检查。

### 活动任务（以 PROGRESS §5 为唯一清单）

- **T18** 采集源扩展（L）：登录态 cookie / HAR 导入，覆盖更多私有 UI 区域。
- **T21** 翻译建议（L）：LLM/翻译记忆建议译文，失败降级（无 key 跳过）。

### 迭代里程碑（节选，详见 CHANGELOG）

- **v1.9.26** 工作台外壳修复 + 概览/设计页 + `proxy` 迁移 + 采集逻辑去重 + TS 严格模式。
- **v1.9.35–1.9.42** SSRF（T1）/ CSP（T2）/ a11y（T8）/ 依赖审计（T7）/ 行数门禁（T6）等安全加固与质量门禁。
- **v1.10.0** 采集成功率 P1（T12–T14：提取精准化 / SPA 适配 / 单页鲁棒性）。
- **v1.11.1–1.11.16** 采集安全（C1–C3/W1–W6/S1–S2/T27–T34）+ 词典管理数据层（T17 度量、T19 审阅、T20 合并、T23 历史、T24 导入导出、T25 搜索批量）+ 覆盖率看板（T22）。
- **v1.12.0** 文档收口（合并 `docs/TASKS.md` 入 `docs/PROGRESS.md` §5，删除 TASKS.md）。

---

## 项目信息

| 属性 | 值 |
|------|------|
| **项目名称** | GitHub Chinese 简体中文 |
| **仓库** | https://github.com/Tanox/GitHub_i18n |
| **当前版本** | 1.12.0 |
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
| [PROGRESS.md](./PROGRESS.md) | 开发进度报告与后续计划 |
