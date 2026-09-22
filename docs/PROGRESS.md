# 项目开发进度报告

> 版本：**v1.9.26** ｜ 更新日期：2026-09-22 ｜ 版本权威源：`src/version.js`
>
> 本文档记录 GitHub Chinese 简体中文项目的开发进度、已交付能力、遗留任务与后续计划。
> 每次发版后需同步更新「本次迭代」与「遗留任务」两节。

---

## 1. 项目概览

| 项目 | 说明 |
|------|------|
| 项目定位 | GitHub 界面中文本地化（浏览器用户脚本）+ 词典采集工作台（Next.js 16） |
| 运行形态 | 单文件用户脚本 `build/GitHub_i18n.user.js`（Tampermonkey / Greasemonkey） |
| 当前版本 | v1.9.26 |
| 许可证 | GPL-2.0 |
| 仓库 | https://github.com/Tanox/GitHub_i18n |
| 包管理器 | npm（注意：仓库同时存在 `bun.lock`，存在双锁文件漂移风险） |

### 1.1 当前量化指标

| 指标 | 数值 | 采集方式 |
|------|------|---------|
| `src/` 源码文件数 | 123 | 递归统计 `.js/.cjs/.mjs/.ts/.tsx/.css` |
| `src/` 源码总行数 | 9393 | 同上 |
| 用户脚本纳入模块数 | 92 | `node build.cjs` 输出 |
| 用户脚本孤立模块数 | 9（全部为 `src/i18n/*`） | 同上 |
| 构建期循环引用 | 0 | 同上 |
| 用户脚本产物大小 | 198,352 字节（193.70 KB） | `build/GitHub_i18n.user.js` |
| 翻译词典词条数 | 459 | `node collect-dict.cjs` 输出 |
| 词典模块数 | 12 | `src/dictionaries/**/*.js` |
| 原型资源数 | 16 个 HTML + 10 个 CSS | `prototype/` |
| 工作台页面路由 | 3（`/`、`/overview`、`/design`） | `next build` 路由表 |
| 代码检查 | 0 error / 0 warning | `npm run lint` |
| 类型检查 | 通过（`strict: true`） | `tsc --noEmit -p tsconfig.json` |
| 产物校验 | 通过 | `npm run validate` |
| 超长代码文件（>200 行） | 0 | 递归扫描全部代码文件 |
| Next 构建告警 | 1（可选依赖 `puppeteer` 未安装） | `npm run build:web` |

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
| 服务端外壳 | `src/components/Shell.tsx`、`src/components/Rail.tsx`（侧栏导航，`next/link` 预取） |
| 客户端岛 | `src/components/CollectorConsole.tsx`；叶组件 `DataCenter` / `PreviewTable` / `Dashboard` / `ScriptInjector` |
| 服务端逻辑 | `src/lib/collector-core.js`、`src/lib/dictionary-processor.js`、`src/lib/project-metrics.ts` |
| 类型门面 | `src/lib/collector-logic.ts`（为 Route Handler 提供 `CollectEvent` 类型） |
| 状态 Hook | `src/hooks/useCollector.ts` |
| Proxy（原 middleware） | `src/proxy.ts`（安全响应头，Next 16 约定） |
| 类型声明 | `src/types/puppeteer.d.ts`、`src/version.d.ts` |
| 样式 | `public/css/`（11 个自包含模块）+ `src/app/globals.css`（Tailwind 入口） |

```
浏览器（服务端页面 Shell + 客户端岛 CollectorConsole）
  └─ useCollector
      ├─ POST /api/collect        → processRawData(data)
      └─ POST /api/batch-collect  → collectFromUrls(urls)
            └─ src/lib/collector-core.js
                ├─ puppeteer（可选依赖）抓取页面文本
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
- [x] GitHub Pages 静态部署工作流（`static.yml`）
- [x] TypeScript 严格模式（`strict: true`，零错误）
- [x] Next 16 约定对齐：`middleware` → `proxy`、移除失效 `eslint` 配置键
- [x] 语义化 `id` 覆盖主要容器与交互控件
- [x] 全部代码文件符合「单文件 ≤ 200 行」约定（0 处超出）

---

## 4. 本次迭代（v1.9.25 → v1.9.26）

### 4.1 缺陷修复

| 编号 | 问题 | 影响 | 处置 |
|------|------|------|------|
| C1 | 工作台外壳外层容器误用 `.workspace`（`flex-direction: column`） | 侧栏与主区**上下堆叠**，侧栏导航布局完全错位 | 新增 `.app-shell` 横向外壳，`Shell.tsx` 改用它 |
| C2 | `.badge` / `.badge.untranslated` / `.badge.translated` **从未定义样式** | 词条状态一直以裸英文文本展示 | 在 `terms.css` 补齐样式，并把文案本地化为「待翻译 / 已翻译」 |
| C3 | 构建期循环引用 `dictionaryManager → partialTranslator → dictionaryManager` | 拼接顺序依赖启发式，构建输出持续告警 | `partialTranslator` 改为接收调用方注入的查询上下文 |
| C4 | `next.config.mjs` 保留 Next 16 已不支持的 `eslint` 键 | 每次构建输出 2 条无效配置告警 | 移除该键；`typescript.ignoreBuildErrors` 保留 |
| C5 | `src/middleware.ts` 使用 Next 16 已弃用的 `middleware` 约定 | 构建输出迁移提示 | 迁移为 `src/proxy.ts`（具名导出 `proxy`），路由表显示 `ƒ Proxy` |
| C6 | 原型服务器把采集临时文件写入仓库根目录 | 污染工作区，与 Next 侧行为不一致 | 统一走 `dictionary-processor.js` 的系统临时目录 |
| C7 | `src/lib/collector-core.js` 达 206 行 | 违反「单代码文件 ≤ 200 行」约定 | 拆出 `dictionary-processor.js`（子进程桥接） |

### 4.2 架构与性能改进

- **客户端边界收敛**：`src/app/page.tsx` 原为整页 `'use client'`，现改为服务端页面 + `CollectorConsole` 客户端岛；
  侧栏、顶栏、步骤条等静态结构不再进入客户端包。
- **导航真实化**：侧栏三个入口由 `aria-disabled` 占位改为 `next/link` 真实路由（`prefetch` + `aria-current`）。
- **新增页面**：`/overview`（服务端读取磁盘指标）、`/design`（设计令牌与组件展示），均静态预渲染。
- **采集逻辑去重（P1-5）**：删除 `src/server/collector.js`，Next 路由与原型服务器共用
  `collector-core.js`（抓取编排）+ `dictionary-processor.js`（子进程桥接）；SSE 适配各自保留。
- **可选依赖处理**：`puppeteer` 改为运行时解析（`createRequire` + 变量说明符），并加入
  `serverExternalPackages`；未安装时返回明确提示而非崩溃。
- **类型安全**：`tsconfig.json` 开启 `strict: true`，零错误（与「避免 any」约定对齐）。

### 4.3 文档完善

- 重写 `docs/PROGRESS.md`：指标实算、任务状态、架构图与变更记录同步至 v1.9.26。
- `docs/architecture.md` 同步工作台架构与目录结构。
- `CHANGELOG.md` 新增 1.9.26 小节。
- 版本同步范围：`src/version.js`、`package.json`、`README.md` 徽章、`CHANGELOG.md`、
  以及**本次实际改动文件**的头注释版本号。

---

## 5. 遗留任务清单

### P0 — 阻塞发布

| 编号 | 任务 | 现状 | 验收标准 |
|------|------|------|---------|
| ~~P0-1~~ | ~~提交 `build/GitHub_i18n.user.js` 产物~~ | **已完成**（v1.9.24）：`git ls-files build/` 已能列出产物 | — |
| P0-2 | 安装 `puppeteer` 依赖，或改为 `puppeteer-core` + 外部浏览器 | `package.json` 声明 `puppeteer@^25.11.0`，`node_modules` 中缺失。已改为运行时解析并加入 `serverExternalPackages`，未安装时返回明确提示；`npm run build:web` 仍输出 1 条无法解析该可选依赖的告警 | 批量 URL 采集可实际抓取页面，且构建无告警 |

### P1 — 重要质量项

| 编号 | 任务 | 现状 | 验收标准 |
|------|------|------|---------|
| ~~P1-1~~ | ~~拆分超过 200 行的代码文件~~ | **已完成**（v1.9.24 / v1.9.26）：当前 0 个代码文件超过 200 行 | — |
| P1-2 | 决策 `i18n` 框架去留 | `src/i18n/*`（9 个模块）已实现但无任何调用方，不参与打包，构建时报告为 9 个孤立模块。**待用户决策**：A 接入配置面板文案；B 移除（推荐，产品本身即中文工具） | 构建孤立模块报告为 0 |
| P1-3 | 清理或启用 Jest 测试体系 | `jest.config.js` / `jest.setup.js` 存在，但 `jest`、`jest-environment-jsdom`、`babel-jest` 均未安装，且无任何测试用例；`npm test` 实际不跑单测 | 安装依赖并补充核心模块用例，或移除配置并在文档中说明 |
| P1-4 | 消除双锁文件漂移 | `package-lock.json` 与 `bun.lock` 并存，`puppeteer` 缺失即为漂移实证 | 保留单一锁文件并重新安装校验 |
| ~~P1-5~~ | ~~消除采集服务端逻辑重复~~ | **已完成**（v1.9.26）：`src/server/collector.js` 已删除，统一为 `collector-core.js` + `dictionary-processor.js` | — |

### P2 — 体验与规范

| 编号 | 任务 | 现状 |
|------|------|------|
| ~~P2-1~~ | ~~开启 TypeScript 严格模式~~ | **已完成**（v1.9.26）：`strict: true`，零类型错误 |
| ~~P2-2~~ | ~~补齐采集工作台次级页面~~ | **已完成**（v1.9.26）：新增 `/overview` 与 `/design` |
| P2-3 | 词典采集支持增量与去重统计 | 当前每次采集覆盖 `docs/untranslated-terms.txt`，无历史对比 |
| P2-4 | 性能监控面板数据导出 | `performanceMonitor` 提供 `exportPerformanceData()`，配置面板尚未接入导出按钮 |
| P2-5 | 补充 E2E / 冒烟测试 | 当前仅有构建产物静态校验，缺少运行时加载验证 |
| P2-6 | 工作台移动端导航缺失 | `@media (max-width: 1024px)` 直接 `display: none` 隐藏侧栏，窄屏下三个页面无法互相跳转 |
| P2-7 | 采集流程缺少错误码约定 | SSE 事件仅有 `type`，失败原因以文本形式返回，前端难以按类型分流处理 |

---

## 6. 命令速查

| 命令 | 用途 |
|------|------|
| `npm run build` | 构建用户脚本 → `build/GitHub_i18n.user.js` |
| `npm run validate` | 校验产物（存在性 / 体积 / 语法 / 未定义引用） |
| `npm run dev` | 启动 Next.js 采集工作台（默认 3000 端口） |
| `npm run dev:prototype` | 启动 `prototype/` 热更新预览（Express + WebSocket） |
| `npm run build:web` | 构建 Next.js 工作台 |
| `npm run lint` / `lint:fix` | ESLint 检查 / 自动修复 |
| `npm run format` / `format:check` | Prettier 格式化 / 格式校验 |
| `npm run test` | 完整流水线：lint → build → validate |
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
| 1.9.26 | 2026-09-22 | 工作台外壳布局与状态徽标修复；新增「项目概览」「设计系统」页；`middleware`→`proxy` 迁移；采集服务端逻辑去重（P1-5）；开启 TS 严格模式（P2-1）；消除构建期循环引用；拆分超长文件 |
| 1.9.25 | 2026-09-22 | 修复词典清洗子进程输入路径不匹配导致清洗步骤失败；`req.json()` 异常改返回 400 |
| 1.9.24 | 2026-09-19 | 修复构建脚本模块清单脱节等 7 项阻塞缺陷；对齐 CI 脚本；补齐采集工作台交互；拆分 6 处超长文件；新增产物校验脚本与本文档 |
| 1.9.23 | 2026-09-19 | 采集演示页升级为 Next.js 16（App Router）；新增 Tailwind/PostCSS/ESLint/Husky 配置 |
| 1.9.22 | 2026-09-18 | 重构词典采集向导样式，统一品牌绿主题，去除无效 Tailwind 依赖 |
| 1.9.21 | 2026-07-18 | 项目更名为 GitHub Chinese 简体中文 |
| 1.9.20 | 2026-06-10 | 工具模块拆分（functionUtils/stringUtils/domUtils/urlUtils/securityUtils 等） |
