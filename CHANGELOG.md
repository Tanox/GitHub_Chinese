# Changelog

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
