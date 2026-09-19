# 项目开发进度报告

> 版本：**v1.9.24** ｜ 更新日期：2026-09-19 ｜ 版本权威源：`src/version.js`
>
> 本文档记录 GitHub Chinese 简体中文项目的开发进度、已交付能力、遗留任务与后续计划。
> 每次发版后需同步更新「本次迭代」与「遗留任务」两节。

---

## 1. 项目概览

| 项目 | 说明 |
|------|------|
| 项目定位 | GitHub 界面中文本地化（浏览器用户脚本）+ 词典采集工作台（Next.js） |
| 运行形态 | 单文件用户脚本 `build/GitHub_i18n.user.js`（Tampermonkey / Greasemonkey） |
| 当前版本 | v1.9.24 |
| 许可证 | GPL-2.0 |
| 仓库 | https://github.com/Tanox/GitHub_i18n |
| 包管理器 | npm（注意：仓库同时存在 `bun.lock`，存在双锁文件漂移风险） |

### 1.1 当前量化指标

| 指标 | 数值 | 采集方式 |
|------|------|---------|
| `src/` 源码文件数 | 116 | 递归统计 `.js/.cjs/.mjs/.ts/.tsx/.css` |
| `src/` 源码总行数 | 9058 | 同上 |
| 用户脚本纳入模块数 | 92 | `node build.cjs` 输出 |
| 用户脚本产物大小 | 198.88 KB | `build/GitHub_i18n.user.js`（字节数） |
| 翻译词典词条数 | 459 | `node collect-dict.cjs` 输出 |
| 词典模块数 | 12 | `src/dictionaries/**/*.js` |
| 原型资源数 | 16 个 HTML + 10 个 CSS | `prototype/` |
| 代码检查 | 0 error / 0 warning | `npm run lint` |
| 类型检查 | 通过 | `tsc --noEmit -p tsconfig.json` |
| 产物校验 | 通过 | `npm run validate` |
| 超长代码文件（>200 行） | 0 | 递归扫描全部代码文件 |

> 上述数字为数据型指标，发版时应重新执行对应命令实算，禁止手改。

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

- `core/`：`cacheManager`（LRU）、`errorHandler`（+`constants`/`recovery`）、`trie`（Trie 树）、`virtualDom`（+`manager`/`constants`）、`virtualNode`
- `translation-core/`：`dictionaryManager`、`pageModeDetector`、`elementSelector`（+`selectorUtils`）、`elementTranslator`（+`stats`/`critical`）、`partialTranslator`、`performanceMonitor`、`batchProcessor`、`cacheController`、`lifecycle`、`translator`
- `page-monitor/`：`domObserver`（+`utils`/`config`/`setup`/`trigger`/`elementChecker`/`mutationAnalyzer`/`constants`）、`pageAnalyzer`、`pathListener`、`translationTrigger`、`cacheManager`
- `dictionaries/`：`codespaces`、`explore`、`common`（`nav`/`repo`/`pr`/`issue`/`misc`）
- `ui/`：`configUI`（`store`/`renderer`/`bootstrap`）、`components/performanceMonitor`、`styles/configUI`（`base`/`buttons`/`components`）
- `utils/`：`functionUtils`、`stringUtils`（`json`/`regex`/`object`/`security`）、`domUtils`、`urlUtils`、`securityUtils`、`tools`
- 顶层：`config`（+`config/`）、`version`、`versionUtils`、`updateNotification`

### 2.2 链路 B：词典采集工作台（Next.js 16）

| 组成 | 路径 |
|------|------|
| App Router | `src/app/`（`layout.tsx`、`page.tsx`、`globals.css`） |
| API 路由 | `src/app/api/collect/route.ts`、`src/app/api/batch-collect/route.ts` |
| 客户端组件 | `src/components/`（`Dashboard`、`DataCenter`、`PreviewTable`、`ScriptInjector`） |
| 服务端逻辑 | `src/lib/collector-logic.ts` |
| 状态 Hook | `src/hooks/useCollector.ts` |
| Edge 中间件 | `src/middleware.ts`（安全响应头） |
| 类型声明 | `src/types/puppeteer.d.ts` |
| 样式 | `public/css/`（10 个自包含模块）+ `src/app/globals.css`（Tailwind 入口） |

> 两链路互不污染：用户脚本核心 `.js` 由 `build.cjs` 处理，Next 仅处理 `app`/`components`/`lib`/`hooks`。
> 工作台通过 `child_process` 调用 `collect-dict.cjs`，与用户脚本共享同一份词典数据。

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
- [x] 批量 URL 采集（Headless 抓取）
- [x] 词条预览表 + 实时处理中心（进度条 / 终端日志）
- [x] 智能清洗（调用服务端清洗）、导出 JSON
- [x] 词条状态区分（待翻译 / 已翻译）

### 3.3 工程化

- [x] 构建脚本自动解析依赖图（不再维护手工文件清单）
- [x] 打包前跨模块顶层重名冲突检测（构建即失败并列出冲突）
- [x] 孤立模块报告（提示未被入口引用、不参与打包的文件）
- [x] 产物校验 `scripts/validate-bundle.cjs`：存在性 + 体积 + 语法 + 未定义引用扫描
- [x] ESLint（Flat Config，整合 `eslint-config-next`）+ Prettier + Husky + lint-staged
- [x] CI/CD（`.github/workflows/ci-cd.yml`）：lint → build → validate → artifact → release
- [x] GitHub Pages 静态部署工作流（`static.yml`）
- [x] 语义化 `id` 覆盖主要容器与交互控件
- [x] 全部代码文件符合「单文件 ≤ 200 行」约定（0 处超出）

---

## 4. 本次迭代（v1.9.23 → v1.9.24）

### 4.1 阻塞级缺陷修复

| 编号 | 问题 | 影响 | 处置 |
|------|------|------|------|
| B1 | `build.cjs` 手工模块清单严重脱节：缺失 `main/lifecycle.js`、`i18n/*`、`core/errorHandler/*`、`core/virtualDom/*`、`page-monitor/domObserver/*`、`translation-core/*` 等 40+ 模块 | 构建产物存在大量未定义引用，**用户脚本运行即报错** | 改为从入口递归解析依赖图并拓扑排序；新增重名冲突与孤立模块检测 |
| B2 | 跨模块顶层重名：`translateCriticalElementsOnly`（`elementTranslator/critical.js` 与 `translator.js`）、`PARSE_INT_RADIX`（`versionUtils.js` 与 `versionChecker.js`） | 单作用域拼接时后者覆盖前者，行为不确定 | `critical.js` 重命名为 `translateCriticalElements`；清理 `versionUtils.js` 未使用的导出常量 |
| B3 | `ui/configUI.js` 仅导出 `ConfigUI` 类，未导出 `configUI` 实例；且类缺少 `init()` | `lifecycle.js` 中 `configUI.init()` 永不执行，**浮动按钮与菜单命令从未生效** | 新增 `configUI` 单例与 `init()`，抽离 `configUI/bootstrap.js` 承载按钮与菜单 |
| B4 | `npm run build` 被改写为 `next build` | CI 的 `build → validate → artifact` 链路必然失败 | `build` 恢复为用户脚本构建，新增 `build:web`；`validate` 指向真实校验脚本 |
| B5 | `partialTranslator` 依赖 `dictionaryManager.dictionaryTrie` / `regexCache`，二者从未创建 | 「启用部分匹配」开关为**空转** | 在 `dictionaryManager.init()` 构建 Trie 树与正则缓存，并接入查询回退链路 |
| B6 | `collect-dict.cjs` 引用已不存在的词典文件（`pull_requests.js`/`issues.js`/`settings.js`/`repository.js`） | 词典加载近乎为空，采集结果假阴性 | 改为递归扫描 `src/dictionaries/**/*.js`，词条数由残缺提升至完整 **459** 条 |
| B7 | 版本号三处不一致：`package.json` 1.9.23 / `src/version.js` 1.9.22 / `src/app/page.tsx` 硬编码 1.9.22 | 版本展示与更新检查判断错乱 | 统一为 **1.9.24**；工作台改为从 `src/version.js` 读取（新增 `src/version.d.ts` 类型声明） |

### 4.2 质量与规范改进

- `src/lib/collector-logic.ts`：移除 `eval('require(...)')` hack 与死代码，改用 `spawn` 直接引用；采集临时文件由仓库根改到系统临时目录；消除 `any` 类型。
- `src/hooks/useCollector.ts`：消除 `any` 捕获、重复正则匹配；新增非 2xx 响应与事件流解析失败的显式错误提示。
- `src/components/DataCenter.tsx`：补齐此前无 `onClick` 的「智能清洗」「导出 JSON」按钮；导出改为真实 JSON 文件下载。
- `src/components/ScriptInjector.tsx`：补齐复制反馈（`已复制`）与失败降级，清理定时器。
- `src/app/page.tsx`：移除 `href="#"` 死链（改为 `aria-disabled` 的规划中占位），补齐语义化 `id`。
- `src/utils/securityUtils.js`：用 `TextEncoder`/`TextDecoder` 替换已废弃的 `escape`/`unescape`，保持存储格式向后兼容。
- `eslint.config.js`：CommonJS 规则块由仅 `build.cjs` 扩展到全部 `**/*.cjs`；忽略项补 `.next`/`prototype`/`public`。
- `server.js`：静态目录由不存在的 `web/` 修正为 `public/`；移除未使用导入。
- `public/` 下 16 个源码文件的头注释路径由 `web/...` 修正为 `public/...`，并同步版本号。
- 新增 `scripts/build/moduleGraph.cjs`、`scripts/build/transform.cjs`、`scripts/validate-bundle.cjs`。
- 按「单代码文件 ≤ 200 行」约定拆分 6 处超长文件（拆分后外部导出契约不变，构建与词典词条数经比对无差异）：
  - `eslint.config.js`（304 行）→ 规则拆分到 `eslint/rules/{core,bestPractices,quality}.js`
  - `src/i18n/manager.js`（308 行）→ 拆出 `constants` / `storage` / `observers` / `formatters` / `lookup` / `loader`
  - `src/core/virtualDom/manager.js`（237 行）→ 拆出 `cleanup` / `nodes` / `lifecycle`
  - `src/dictionaries/common/misc.js`（228 行）→ 拆为 `miscOrganization` / `miscMarketing` / `miscActions`
  - `src/translation-core/selectorUtils/patterns.js`（221 行）→ 拆出 `skipTags` / `skipIdsEntity` / `skipIdsTechnical`
  - `prototype/assets/prototype.css`（1165 行）→ 拆为 9 个模块 + `@import` 聚合入口（HTML 引用方式不变）
- 构建产物体积改为按字节统计（原按字符统计，中文内容会低估约 9%）。

### 4.3 文档完善

- 新增 `docs/PROGRESS.md`（本文档）。
- 修正 `docs/config.yaml` 中 `specDirectories` 指向不存在的 `../spec` 的问题。
- README、架构文档、开发指南、项目规范同步至 v1.9.24 的实际结构。

---

## 5. 遗留任务清单

### P0 — 阻塞发布

| 编号 | 任务 | 现状 | 验收标准 |
|------|------|------|---------|
| P0-1 | 提交 `build/GitHub_i18n.user.js` 产物 | 产物已重建，但工作区尚未提交；README「一键安装」链接指向 `main/build/...` | `git ls-files build/` 能列出产物，且 raw 链接可下载 |
| P0-2 | 安装 `puppeteer` 依赖或改为 `puppeteer-core` + 外部浏览器 | `package.json` 已声明 `puppeteer@^25.11.0`，但 `node_modules` 中缺失 | 批量 URL 采集可实际抓取页面；当前已降级为返回明确提示 |

### P1 — 重要质量项

| 编号 | 任务 | 现状 | 验收标准 |
|------|------|------|---------|
| ~~P1-1~~ | ~~拆分超过 200 行的代码文件~~ | **已完成**（v1.9.24）：6 处超长文件全部拆分，当前 0 个代码文件超过 200 行 | — |
| P1-2 | 决策 `i18n` 框架去留 | `src/i18n/*` 已实现但无任何调用方，不参与打包（构建时报告为 9 个孤立模块） | 要么接入 UI 文案，要么移除，消除孤立模块报告 |
| P1-3 | 清理或启用 Jest 测试体系 | `jest.config.js` / `jest.setup.js` 存在，但 `jest`、`jest-environment-jsdom`、`babel-jest` 均未安装，且无任何测试用例；`npm test` 实际不跑单测 | 安装依赖并补充核心模块用例，或将配置移除并在文档中说明 |
| P1-4 | 消除双锁文件漂移 | `package-lock.json` 与 `bun.lock` 并存，`puppeteer` 缺失即为漂移实证 | 保留单一锁文件并重新安装校验 |
| P1-5 | 消除采集服务端逻辑重复 | `src/server/collector.js`（Express）与 `src/lib/collector-logic.ts`（Next Route）为同一功能的两份实现 | 抽取共享实现或明确废弃其一 |

### P2 — 体验与规范

| 编号 | 任务 | 现状 |
|------|------|------|
| P2-1 | 开启 TypeScript 严格模式 | `tsconfig.json` 为 `strict: false`，与「避免 `any`」约定不一致 |
| P2-2 | 补齐采集工作台次级页面 | 侧栏「项目概览」「设计系统」为规划中占位（`aria-disabled`），暂无路由 |
| P2-3 | 词典采集支持增量与去重统计 | 当前每次采集覆盖 `docs/untranslated-terms.txt`，无历史对比 |
| P2-4 | 性能监控面板数据导出 | `performanceMonitor` 提供 `exportPerformanceData()`，配置面板尚未接入导出按钮 |
| P2-5 | 补充 E2E / 冒烟测试 | 当前仅有构建产物静态校验，缺少运行时加载验证 |

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
5. `docs/` 下结构调整文档（`project.md`／`architecture.md`／`development.md`／`coding-style.md`／`prototype.md`／`PROGRESS.md`）
6. `openspec/` 下规范索引与 `config.yaml` 的「当前版本」
7. `prototype/` 中原型展示的版本号
8. 本次**实际改动**文件的头注释版本号（未改动文件保持不变，禁止全仓库批量刷写）

---

## 8. 变更记录

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.9.24 | 2026-09-19 | 修复构建脚本模块清单脱节、`configUI` 未导出、部分匹配空转、版本号不一致等 7 项阻塞缺陷；对齐 CI 脚本；补齐采集工作台交互；拆分 6 处超长文件；新增产物校验脚本与本文档 |
| 1.9.23 | 2026-09-19 | 采集演示页升级为 Next.js 16（App Router）；新增 Tailwind/PostCSS/ESLint/Husky 配置 |
| 1.9.22 | 2026-09-18 | 重构词典采集向导样式，统一品牌绿主题，去除无效 Tailwind 依赖 |
| 1.9.21 | 2026-07-18 | 项目更名为 GitHub Chinese 简体中文 |
| 1.9.20 | 2026-06-10 | 工具模块拆分（functionUtils/stringUtils/domUtils/urlUtils/securityUtils 等） |
