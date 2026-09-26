# GitHub Chinese 简体中文插件架构文档

> 版本：**v1.12.1** ｜ 版本权威源：`src/version.js`

## 1. 系统整体架构概述

### 1.1 项目简介
GitHub Chinese 简体中文插件是一个浏览器用户脚本，旨在为 GitHub 提供全面的中文本地化支持。该项目采用模块化设计，使用现代 JavaScript 技术栈，提供高性能、可扩展的 GitHub 界面翻译功能。

项目由两条**相互独立、仅共享词典数据**的链路组成：

| 链路 | 交付物 | 构建方式 |
|------|--------|---------|
| A. 用户脚本引擎 | `build/GitHub_zh-cn.user.js` 单文件用户脚本 | `build.cjs` 从 `src/main.js` 递归解析依赖图并拼接 |
| B. 词典采集工作台 | Next.js 16 应用（`src/app`） | `next build`（`npm run build:web`） |

### 1.2 架构特点
- **模块化设计**：将功能分解为独立模块，便于维护和扩展
- **事件驱动**：采用观察者模式实现模块间通信
- **高性能优化**：使用 Trie 树、LRU 缓存、虚拟 DOM 等技术提升性能
- **智能预检查**：无匹配翻译时不修改 DOM，减少不必要操作
- **构建即校验**：依赖图自动推导 + 跨模块重名冲突检测 + 孤立模块报告
- **质量保障**：ESLint / Prettier / TypeScript 类型检查 / 产物静态校验

### 1.3 用户脚本引擎架构图
```
┌─────────────────────────────────────────────────────────────┐
│                        用户脚本主入口 (main.js)              │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
┌────────▼────────┐ ┌────────▼────────┐ ┌────────▼────────┐
│   翻译核心模块    │ │   页面监控模块  │ │   配置界面     │
│ (translationCore) │ │  (pageMonitor)  │ │  (configUI)    │
└────────┬───────────┘ └────────┬───────────┘ └──────────────────┘
         │                     │
         │                     │
┌────────▼───────────┐ ┌───▼───────────┐
│   翻译词典模块      │ │   页面监控子模块│
│   (dictionaries)   │ │  (page-monitor/*)│
└─────────────────────┘ └─────────────────┘
         │
         │
┌────────▼───────────┐
│   核心工具模块      │
│   (core/*, utils/*)│
└─────────────────────┘
```

---

## 2. 核心模块说明

### 2.1 翻译核心模块 (translationCore)

#### 2.1.1 模块职责
- 协调翻译过程的核心控制模块，负责整合各子模块的初始化、翻译执行和性能监控。
- 核心特性：预检查翻译匹配，无匹配时不修改 DOM。

#### 2.1.2 子模块组成
- **dictionaryManager.js**：管理翻译词典的加载、查询和更新
- **elementSelector.js**：选择需要翻译的 DOM 元素
- **elementTranslator.js**：执行元素翻译的核心实现
  - 预检查翻译匹配优化
  - 无匹配时返回 false，不修改 DOM
- **partialTranslator.js**：使用 Trie 树进行部分匹配翻译
  - 查询上下文（`dictionary` / `dictionaryTrie` / `regexCache`）由 `dictionaryManager` 在调用时注入，
    本模块**不反向依赖** `dictionaryManager`，以避免循环引用
- **batchProcessor.js / cacheController.js / lifecycle.js**：分批执行、缓存治理与卸载清理
- **pageModeDetector.js**：检测当前页面的模式
- **performanceMonitor.js**：监控翻译性能数据
- **index.js**：翻译核心主入口

#### 2.1.3 核心功能
```javascript
// 主要接口：
- init()              // 初始化翻译核心
- translate()         // 执行翻译
- processElementsInBatches() // 批量处理元素
- translateCriticalElementsOnly() // 仅翻译关键元素
- cleanCache()       // 清理缓存
- clearCache()       // 清除所有缓存
- getPerformanceStats() // 获取性能统计数据
- exportPerformanceData() // 导出性能数据
```

### 2.2 页面监控模块 (page-monitor)

#### 2.2.1 模块职责
- 监控页面变化，包括 URL 路径变化和 DOM 变化，触发翻译更新。

#### 2.2.2 子模块组成
- **domObserver.js**：观察 DOM 变化并触发翻译
- **pathListener.js**：监听 URL 路径变化
- **translationTrigger.js**：管理翻译触发和节流
- **pageAnalyzer.js**：分析页面类型和关键区域
- **cacheManager.js**：管理页面监控中的缓存
- **index.js**：页面监控主入口

#### 2.2.3 核心功能
```javascript
// 主要接口：
- init()              // 初始化页面监控
- stop()              // 停止监控
- translateWithThrottle() // 带节流的翻译触发
- restart()           // 重启监控
```

### 2.3 翻译词典模块 (dictionaries)

#### 2.3.1 模块职责
- 提供翻译词典的组织、管理和合并。

#### 2.3.2 词典组成
- **index.js**：词典合并主模块
- **common.js**：通用翻译词典
- **codespaces.js**：GitHub Codespaces 相关词典
- **explore.js**：GitHub Explore 页面词典

#### 2.3.3 核心功能
```javascript
// 主要接口：
- 加载和合并词典
- 提供翻译词条查询
```

### 2.4 UI 模块 (ui)

#### 2.4.1 模块职责
- 提供配置界面和用户交互功能

#### 2.4.2 组件组成
- **configUI.js**：配置界面主模块
  - 浮动设置按钮 (右下角固定)
  - 配置面板 (响应式设计)
  - 性能监控面板
  - 关于信息面板

#### 2.4.3 配置面板功能
```
┌─────────────────────────────────────────────────────────────┐
│  🔧 基本设置   ⚡ 性能设置   🔄 更新设置   📊 性能监控   ℹ️ 关于  │
└─────────────────────────────────────────────────────────────┘
```

### 2.5 核心工具模块 (core)

#### 2.5.1 模块职责
- 提供核心工具类和优化功能

#### 2.5.2 组件组成
- **cacheManager.js**：LRU 缓存管理器
- **errorHandler.js**：统一错误处理
- **trie.js**：Trie 树数据结构
- **virtualDom.js**：虚拟 DOM 优化

### 2.6 主入口 (main.js)

#### 2.6.1 模块职责
- 整合所有模块，初始化脚本，处理资源清理。

#### 2.6.2 核心功能
```javascript
// 主要接口：
- init()              // 初始化脚本
- startScript()       // 启动脚本
- cleanup()           // 资源清理
```

### 2.7 生命周期编排 (main/lifecycle.js)

`src/main.js` 仅作为薄入口，实际编排收敛在 `lifecycleManager`：

- `init()`：版本检查 → 翻译核心初始化 → 首次翻译 → 页面监控 → 配置界面初始化
- `startScript()`：根据 `document.readyState` 决定立即初始化或等待 `DOMContentLoaded`
- `cleanup()`：停止页面监控、清理翻译缓存、销毁配置界面、移除事件监听

同时 `main.js` 暴露 `window.GitHub_i18n = { translationCore, configUI }`，供错误处理器的词典恢复与脚本菜单命令使用。

### 2.8 配置界面启动链 (ui/configUI)

```
lifecycleManager.init()
  └─ configUI.init()
      ├─ mergeUserConfig()                     ← 合并 localStorage 中的用户配置
      ├─ configBootstrap.registerMenuCommands() ← 注册「打开配置面板 / 立即翻译页面」
      └─ configBootstrap.createFloatingButton() ← 页面右下角浮动入口按钮
```

---

## 3. 数据流和交互流程

### 3.1 初始化流程
```
1. 脚本加载
   ↓
2. DOMContentLoaded 事件触发
   ↓
3. main.js 初始化
   ├─ 检查版本更新
   ├─ 初始化翻译核心 (translationCore.init())
   │  ├─ 初始化词典管理器
   │  ├─ 设置页面卸载处理器
   │  ├─ 启动缓存清理定时器
   │  └─ 预热缓存
   ├─ 执行页面翻译 (translationCore.translate())
   ├─ 初始化页面监控 (pageMonitor.init())
   │  ├─ 初始化路径监听器
   │  ├─ 初始化 DOM 观察器
   │  └─ 启动缓存清理定时器
   └─ 初始化配置界面 (configUI.init())
      ├─ 合并用户配置
      ├─ 注册菜单命令
      └─ 创建浮动按钮
   ↓
4. 脚本运行中
```

### 3.2 翻译流程
```
1. 翻译触发 (页面加载/DOM变化/URL变化)
   ↓
2. translationCore.translate()
   ├─ 检测页面模式 (pageModeDetector)
   ├─ 获取需要翻译的元素
   │  └─ elementSelector.getElementsToTranslate()
   ├─ 批量处理元素
   │  └─ processElementsInBatches()
   │     ├─ 虚拟 DOM 优化
   │     └─ 逐元素翻译
   │        └─ elementTranslator.translateElement()
   │           ├─ 预检查翻译匹配 ⭐
   │           ├─ 无匹配? 直接返回 false, 不修改 DOM ⭐
   │           ├─ 有匹配? 继续翻译
   │           ├─ 词典查询
   │           ├─ 缓存查找
   │           └─ DOM 更新
   └─ 记录性能数据
   ↓
3. 翻译完成
```

### 3.3 页面监控流程
```
1. 页面监控初始化
   ├─ pathListener 监听 URL 变化
   └─ domObserver 监听 DOM 变化
   ↓
2. 变化检测到变化
   ↓
3. translationTrigger.translateWithThrottle()
   └─ 节流控制
   └─ 触发翻译
```

### 3.4 模块间交互
```
main.js
├── translationCore
│   ├── dictionaryManager
│   ├── elementSelector
│   ├── elementTranslator (⭐ 预检查优化)
│   ├── pageModeDetector
│   └── performanceMonitor
├── pageMonitor
│   ├── pathListener
│   ├── domObserver
│   ├── translationTrigger
│   ├── pageAnalyzer
│   └── cacheManager
├── configUI (ui/)
└── dictionaries
└── core (cache, trie, virtualDom, etc)
```

---

## 4. 技术选型说明

### 4.1 核心技术栈

#### 4.1.1 JavaScript (ES6+)
- **理由**：
  - 浏览器原生支持，无需额外编译
  - 现代语法特性提高开发效率
  - 广泛的生态系统支持

#### 4.1.2 ES Modules
- **理由**：
  - 原生模块化支持
  - 提高代码可维护性
  - 更好的代码组织方式

### 4.2 开发工具

#### 4.2.1 Jest
- **用途**：单元测试框架
- **理由**：
  - 简单易用的 API
  - 内置 Mock 支持
  - 完善的测试报告
  - 支持 JSDOM 环境
  - 与 Babel 集成

#### 4.2.2 ESLint
- **用途**：代码规范检查
- **理由**：
  - 自定义规则配置
  - 自动修复功能
  - 插件生态丰富
  - 与 Prettier 集成

#### 4.2.3 Prettier
- **用途**：代码格式化
- **理由**：
  - 自动化格式化
  - 配置简单
  - 与编辑器集成
  - 统一代码风格

### 4.3 性能优化技术

#### 4.3.1 Trie 树
- **用途**：高效的字符串匹配
- **应用**：partialTranslator.js 中用于部分匹配翻译

#### 4.3.2 LRU 缓存策略
- **用途**：减少重复翻译计算
- **应用**：core/cacheManager.js 中缓存翻译结果

#### 4.3.3 虚拟 DOM 优化
- **用途**：减少真实 DOM 操作
- **应用**：core/virtualDom.js 中优化元素处理

#### 4.3.4 智能节流机制
- **用途**：避免过度翻译
- **应用**：page-monitor/translationTrigger.js 中控制翻译触发频率

#### 4.3.5 批量处理
- **用途**：优化大数据量场景
- **应用**：processElementsInBatches() 中实现

#### 4.3.6 预检查翻译匹配 ⭐
- **用途**：避免对无匹配内容进行不必要的 DOM 操作
- **应用**：elementTranslator.translateElement() 中实现
- **工作原理**：
  - 遍历子节点时，先查询词典匹配
  - 记录是否存在可翻译内容
  - 如无匹配，直接返回 false，不修改 DOM

---

## 5. 目录结构

```
GitHub_Chinese/
├── src/                              # 源码根目录
│   ├── main.js                       # 用户脚本唯一入口
│   ├── main/lifecycle.js             # 生命周期编排
│   ├── core/                         # cacheManager / errorHandler(+/*) / trie / virtualDom(+/*) / virtualNode
│   ├── translation-core/             # 翻译核心引擎
│   │   ├── dictionaryManager.js      # 词典加载、哈希索引、Trie 与缓存查询
│   │   ├── elementTranslator.js      # 单元素翻译
│   │   ├── elementTranslator/        # stats / critical
│   │   ├── partialTranslator.js      # Trie 部分匹配
│   │   ├── selectorUtils/            # patterns / matchers
│   │   ├── batchProcessor.js         # 分批执行
│   │   ├── cacheController.js        # 缓存治理
│   │   ├── translator.js             # 翻译编排
│   │   ├── lifecycle.js              # 卸载处理与缓存清理定时器
│   │   └── index.js                  # translationCore 对象
│   ├── page-monitor/                 # domObserver(+/*) / pageAnalyzer / pathListener / translationTrigger
│   ├── dictionaries/                 # codespaces / explore / common(nav,repo,pr,issue,misc)
│   ├── ui/                           # configUI(+store,renderer,bootstrap) / components / styles
│   ├── utils/                        # functionUtils / stringUtils(+string/) / domUtils / urlUtils / securityUtils / tools
│   ├── config.js + config/           # 全局配置与配置分片
│   ├── version.js                    # 单一版本源
│   ├── versionUtils.js / versionChecker/ / updateNotification/
│   ├── app/                          # Next.js App Router：page / overview / design + api/*
│   ├── components/                   # Shell / Rail / MobileNav（服务端）、navItems（导航源）、CollectorConsole（客户端岛）、叶组件
│   ├── hooks/useCollector.ts         # 采集状态管理
│   ├── lib/                          # collector-core.js / dictionary-processor.js / collector-logic.ts / project-metrics.ts
│   ├── types/                        # puppeteer-core.d.ts 等最小类型声明
│   └── proxy.ts                      # 安全响应头（Next 16 起取代 middleware）
├── public/                           # 静态资源（css 模块化 / js 向导）
├── prototype/                        # 设计系统与高保真原型
├── scripts/build/                    # moduleGraph.cjs / transform.cjs
├── scripts/validate-bundle.cjs       # 构建产物校验
├── docs/                             # 正式规范文档（权威正文）
├── build/GitHub_zh-cn.user.js         # 用户脚本构建产物（纳入版本控制）
├── build.cjs                         # 用户脚本构建入口
├── collect-dict.cjs                  # 词典采集工具
├── server.js                         # 原型热更新预览服务器
├── next.config.mjs / tailwind.config.ts / postcss.config.mjs
├── eslint.config.js / tsconfig.json
└── package.json / CHANGELOG.md / README.md
```

---

## 6. 开发规范

### 6.1 编码规范
- 使用 ES6+ 语法
- 函数级注释说明功能、参数和返回值
- 遵循 ESLint 规则
- Prettier 代码格式化

### 6.2 测试规范
- 单元测试覆盖核心功能
- 测试文件与源码文件对应
- 使用 Jest 测试框架

### 6.3 Git 提交规范
- 提交前自动运行 lint 和测试
- 使用语义化版本管理

---

## 7. 采集工作台架构（Next.js）

采集工作台是与用户脚本解耦的独立 Next.js 16 应用，复用同一份词典数据。

```
浏览器（src/app/page.tsx 服务端页面 + CollectorConsole 客户端岛）
  └─ useCollector（src/hooks/useCollector.ts）
      ├─ POST /api/collect        → processRawData(data)
      └─ POST /api/batch-collect  → collectFromUrls(urls)
            └─ src/lib/collector-logic.ts（类型门面）
                └─ src/lib/collector-core.js（抓取与编排，链路唯一实现）
                    ├─ puppeteer-core（可选依赖）+ 系统浏览器抓取页面文本
                    └─ src/lib/dictionary-processor.js
                          └─ spawn(collect-dict.cjs) ← 与用户脚本共享同一份词典
                                └─ SSE(text/event-stream) 实时回传日志 / 进度 / 完成
```

页面结构（服务端渲染外壳 + 最小客户端岛）：

| 路由 | 类型 | 说明 |
|------|------|------|
| `/` | 静态 | 采集控制台；仅 `CollectorConsole` 及其叶组件为客户端组件 |
| `/overview` | 静态 | 项目概览；由 `src/lib/project-metrics.ts` 在模块加载时一次性统计磁盘指标 |
| `/design` | 静态 | 设计系统；展示 `public/css/base.css` 的令牌与核心组件样式 |

响应式导航（无额外客户端 JS）：

```
> 1024px : Shell → Rail（左侧栏，含品牌 / 导航 / 引擎状态）
≤ 1024px : Shell → MobileNav（顶栏下方横向标签条，rail 隐藏）
导航数据  : navItems.ts 单一来源，Rail 与 MobileNav 共同消费
```

`Shell` / `Rail` / `MobileNav` 均为**服务端组件**——移动端导航由 CSS 媒体查询切换可见性，
不引入汉堡菜单状态机，因此窄屏不增加客户端包体积。

要点：

- 两条 API 路由均声明 `runtime = 'nodejs'`（需要 `child_process` 与文件系统）
- 采集原始文本写入系统临时目录（`os.tmpdir()`），不污染仓库工作区
- `puppeteer-core` 为**可选运行时依赖**（配合系统已安装的 Chrome / Edge）：由 `browser-resolver.js` 以
  动态 `import()`（`turbopackIgnore`）在运行期解析；不声明 `serverExternalPackages`（该包为 ESM，显式外部化会触发
  Turbopack 告警）；未安装依赖或未找到可用浏览器时批量采集返回明确错误提示，而非崩溃
- `src/proxy.ts` 为所有响应附加 `X-Content-Type-Options`、`X-Frame-Options` 等基础安全头
- **采集错误码约定（P2-7）**：`src/lib/collect-codes.js` 定义服务端与前端共用的 `CollectErrorCode`
  （纯数据模块，不含 `fs`/`child_process`，可安全被客户端导入）；服务端 `error` 事件均携带 `code`，
  前端 `useCollector` 与终端日志据此渲染 `E<code>` 徽标，便于按类型分流处理
- `server.js`（原型热更新预览）复用 `collector-core.js` + `dictionary-processor.js`，仅保留 SSE 适配层

架构边界：Next 仅处理 `app` / `components` / `lib` / `hooks` / `types` / `proxy.ts`；
用户脚本核心 `.js` 由 `build.cjs` 独立构建，二者互不打包
（`build.cjs` 依 `NEXT_ONLY_SEGMENTS` 跳过 `app`/`components`/`lib`/`hooks`/`server` 目录）。

---

## 8. 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.9.28 | 2026-09-23 | 修复配置面板性能监控按钮为死按钮（P2-4）；新增采集错误码约定（P2-7）：`collect-codes.js` 共用 `CollectErrorCode`、服务端错误事件带 `code`、前端渲染错误码徽标；空输入/空 URL 直接返回 `INPUT_INVALID` |
| 1.9.27 | 2026-09-22 | 修复窄屏（≤1024px）隐藏侧栏导致三页无法互跳：新增服务端组件 `MobileNav`（CSS 媒体查询切换，不增加客户端包）与共享导航源 `navItems.ts`；≤640px 顶栏转纵向、内容区收窄内边距 |
| 1.9.26 | 2026-09-22 | 修复工作台外壳布局与词条状态徽标样式；新增「项目概览」「设计系统」页与服务端指标；`middleware`→`proxy` 迁移；采集服务端逻辑去重为 `collector-core` + `dictionary-processor`；移除未引用的 i18n 框架；部分匹配改为上下文注入以消除循环引用；开启 TS 严格模式 |
| 1.9.25 | 2026-09-22 | 修复词典清洗子进程输入路径不匹配；采集接口非法 JSON 返回 400 |
| 1.9.24 | 2026-09-19 | 修复构建脚本模块清单脱节、`configUI` 未导出、部分匹配空转、版本号不一致等阻塞缺陷；新增产物校验脚本与进度文档 |
| 1.9.23 | 2026-09-19 | 采集演示页升级为 Next.js 16（App Router），新增 Tailwind / ESLint / Husky 配置 |
| 1.9.22 | 2026-09-18 | 重构词典采集向导样式，统一品牌绿主题 |
| 1.9.21 | 2026-07-18 | 项目更名为 GitHub Chinese 简体中文 |
| 1.9.20 | 2026-06-10 | 完善项目规范文档，统一版本号，修正 CI/CD 配置 |
| 1.9.19 | 2026-06-08 | ⭐ 优化翻译逻辑：无匹配时不修改 DOM |
