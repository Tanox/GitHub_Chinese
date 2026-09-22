# 项目规范

> 版本：**v1.9.24** ｜ 版本权威源：`src/version.js`

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
| 采集内核 | puppeteer（可选依赖，Headless 抓取） |
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
│   ├── app/                          # Next.js App Router（采集工作台）
│   │   ├── page.tsx                  # 采集控制台（服务端外壳 + 客户端岛）
│   │   ├── overview/page.tsx         # 项目概览（服务端实时指标）
│   │   ├── design/page.tsx           # 设计系统（令牌与组件展示）
│   │   ├── api/collect/route.ts      # 文本粘贴采集
│   │   └── api/batch-collect/route.ts# 批量 URL 采集
│   ├── components/                   # Shell / Rail（服务端）+ CollectorConsole（客户端岛）
│   ├── hooks/useCollector.ts         # 采集状态 Hook
│   ├── lib/                          # collector-core.js / dictionary-processor.js / project-metrics.ts
│   ├── types/puppeteer.d.ts          # 可选依赖类型声明
│   └── proxy.ts                      # 安全响应头（Next 16 起取代 middleware）
├── public/                           # Next 静态资源（css / js）
│   ├── css/                          # 采集工作台样式（模块化，单文件 ≤200 行）
│   └── js/                           # 采集向导脚本（wizard/*）
├── prototype/                        # 设计系统与高保真原型
│   ├── design-system/                # 色彩 / 字体 / 间距 / 图标 / 动效
│   ├── components/                   # 基础 / 复合 / 业务组件
│   ├── interaction/                  # 交互模式 / 反馈 / 空状态
│   └── prototypes/                   # 桌面端 / 移动端
├── scripts/
│   ├── build/moduleGraph.cjs         # 模块依赖图（拓扑排序 / 孤立检测）
│   ├── build/transform.cjs           # ESM → 单作用域拼接
│   └── validate-bundle.cjs           # 构建产物校验
├── docs/                             # 正式规范文档（权威正文）
├── openspec/                         # OpenSpec 规范索引与配置
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

- `src/app/page.tsx`：服务端页面外壳；交互收敛在 `src/components/CollectorConsole.tsx` 客户端岛
- `src/app/overview/page.tsx` / `src/app/design/page.tsx`：项目概览与设计系统（均为静态预渲染）
- `src/components/Shell.tsx` / `Rail.tsx`：服务端外壳与侧栏导航
- `src/hooks/useCollector.ts`：采集状态与 SSE 事件流解析
- `src/lib/collector-core.js`：Headless 抓取与采集编排（链路唯一实现）
- `src/lib/dictionary-processor.js`：调用 `collect-dict.cjs` 的子进程桥接
- `src/lib/project-metrics.ts`：服务端磁盘指标统计（供项目概览页）
- `src/app/api/*/route.ts`：`text/event-stream` 流式接口
- `src/proxy.ts`：附加基础安全响应头（Next 16 起取代 `middleware`）

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
npm run build          # 构建用户脚本 → build/GitHub_i18n.user.js
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
4. 重建并提交 `build/GitHub_i18n.user.js`
5. 创建 Git Tag（`git tag v1.9.24`）并推送，CI 自动产出 Release 资产

---

## 项目信息

| 属性 | 值 |
|------|------|
| **项目名称** | GitHub Chinese 简体中文 |
| **仓库** | https://github.com/Tanox/GitHub_i18n |
| **当前版本** | 1.9.24 |
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
| [PROGRESS.md](./PROGRESS.md) | 开发进度、遗留任务与后续计划 |
