# Changelog

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
