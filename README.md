# GitHub Chinese 简体中文

让 GitHub 以中文的节奏呼吸。这是一套为 GitHub Chinese 简体中文插件量身定制的设计系统。它承袭 GitHub 的深色美学、精确排版与克制交互，同时以中文衬线字体、语义色彩与细腻动效，塑造属于插件自身的独立识别。

[![GitHub license](https://img.shields.io/github/license/Tanox/GitHub_i18n?color=blue)](LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/Tanox/GitHub_i18n?display_name=tag&color=green)](https://github.com/Tanox/GitHub_i18n/releases)

> 当前版本：**v1.11.9**（版本单一来源：`src/version.js`）

## 命名与兼容性说明

- **产品名**：GitHub Chinese 简体中文（文档与界面统一使用此名）。
- **仓库名（历史保留）**：仓库地址仍为 `github.com/Tanox/GitHub_i18n`，全局变量仍为 `window.GitHub_i18n`。
- **用户脚本文件名**：`GitHub_zh-cn.user.js`（自 v1.9.43 起由旧名 `GitHub_i18n.user.js` 更名，更贴合「简体中文」语义）。
  注意：更名会使旧安装（指向旧 `@updateURL` 的 `GitHub_i18n.user.js`）无法自动更新，需用户重新一键安装新脚本。

## 功能介绍

- **即时翻译**：本地词典，无需联网，瞬间生效
- **覆盖全面**：仓库、Issues、PR、设置、通知、Codespaces、Explore、Wiki、Actions、Projects 等页面
- **部分匹配**：基于 Trie 树的句子内词汇替换，可开关
- **不破坏布局**：只翻译文字内容，保持页面原有样式
- **实时更新**：支持动态加载内容翻译，自动检测页面变化
- **性能优化**：智能缓存、虚拟 DOM 优化、批量处理，不会拖慢页面速度
- **配置面板**：内置配置界面，可调整翻译行为
- **性能监控**：实时查看翻译统计数据
- **自动升级**：Tampermonkey 自动检测新版本

## 安装说明

### 1. 安装浏览器扩展

- Chrome / Edge: 安装 [Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- Firefox: 安装 [Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/)
- Safari: 安装 [Tampermonkey](https://apps.apple.com/app/tampermonkey/id1482490089)

### 2. 安装脚本

点击 [一键安装](https://github.com/Tanox/GitHub_i18n/raw/refs/heads/main/build/GitHub_zh-cn.user.js)，然后在 Tampermonkey 中点击「安装」。

> 安装链接指向仓库内的构建产物，因此 `build/GitHub_zh-cn.user.js` **必须纳入版本控制**。

### 3. 开始使用

刷新 GitHub 页面，界面就会变成中文。页面右下角的绿色浮动按钮可打开配置面板；
也可通过 Tampermonkey 菜单使用「打开配置面板」「立即翻译页面」。

## 词典采集工作台

项目附带一个基于 Next.js 16 的本地采集工作台，用于从 GitHub 原生界面抓取 UI 词条并沉淀中文本地化词典。

```bash
npm install
npm run dev     # 打开 http://localhost:3000
```

工作台能力：探针脚本一键复制 → 文本粘贴 / 批量 URL 采集 → SSE 实时日志与进度 → 词条预览 → 导出 JSON。
采集清洗由 `collect-dict.cjs` 完成，与用户脚本共享同一份词典数据。

> 批量 URL 采集依赖可选依赖 `puppeteer-core` 与系统已安装的 Chrome / Edge 浏览器。未满足条件时该功能会返回明确提示，其余功能不受影响。

## 高保真原型

本项目维护一套高保真原型，呈现插件在真实使用场景中的样貌，方便评审与迭代：

| 模块 | 路径 | 说明 |
|------|------|------|
| 高保真原型 | [prototype/prototypes/index.html](prototype/prototypes/index.html) | 采集流程 / 探针脚本 / 数据中心 / 清洗预览 / 实时处理中心 |

**快速入口**：执行 `npm run dev:prototype` 启动带热更新的本地预览，默认打开高保真原型；
或直接用浏览器打开 [prototype/prototypes/index.html](prototype/prototypes/index.html)。

## 项目结构

```
src/
├── core/                    # 基础设施（LRU 缓存 / 错误处理 / Trie / 虚拟 DOM）
├── dictionaries/            # 翻译词典（common/codespaces/explore）
├── page-monitor/            # 页面监控（DOM 监听、路径监听、翻译触发）
├── translation-core/        # 翻译核心（词典管理、元素翻译、部分匹配、性能监控）
├── ui/                      # UI 组件（配置面板、浮动入口、性能监控）
├── utils/                   # 工具函数
├── app/                     # Next.js 采集工作台（App Router）
│   └── api/                 # collect / batch-collect 流式接口
├── components/              # 工作台组件（服务端外壳 + 客户端岛）
├── hooks/                   # 工作台状态 Hook
├── lib/                     # 工作台服务端逻辑（采集核心 / 指标统计）
├── types/                   # 类型声明
├── config.js + config/      # 全局配置与配置分片
├── main.js                  # 用户脚本入口
├── main/                    # 生命周期编排
├── proxy.ts                 # 安全响应头（Next 16 取代 middleware）
├── version.js               # 版本信息（单一版本源）
├── versionUtils.js          # 版本工具函数
├── versionChecker/          # 版本更新检查
└── updateNotification/      # 更新通知 UI
public/                      # 工作台静态资源（css / js，模块化拆分）
prototype/                   # 设计系统与高保真原型
scripts/                     # 构建依赖图、转换与产物校验
build/                       # 用户脚本构建产物（纳入版本控制）
docs/                        # 项目规范文档（唯一权威正文）
openspec/                    # OpenSpec 规范索引与配置
```

## 参与开发

```bash
git clone https://github.com/Tanox/GitHub_i18n.git
cd GitHub_i18n
npm install
npm test        # lint → build → validate
```

### 开发命令

| 命令 | 说明 |
|------|------|
| `npm run build` | 构建用户脚本 → `build/GitHub_zh-cn.user.js` |
| `npm run validate` | 校验构建产物（存在性 / 体积 / 语法 / 未定义引用） |
| `npm run dev` | 启动 Next.js 采集工作台 |
| `npm run dev:prototype` | 启动 `prototype/` 热更新预览 |
| `npm run build:web` | 构建 Next.js 采集工作台 |
| `npm run lint` / `lint:fix` | 代码检查 / 自动修复 |
| `npm run format` / `format:check` | 代码格式化 / 格式校验 |
| `npm test` | 完整流水线：lint → build → validate |
| `npm run dict:collect -- <文件>` | 采集文本文件中的待翻译词条 |

### 文档

| 文档 | 说明 |
|------|------|
| [docs/PROGRESS.md](docs/PROGRESS.md) | 开发进度报告与后续计划 |
| [docs/project.md](docs/project.md) | 项目概述、目录结构与核心模块 |
| [docs/architecture.md](docs/architecture.md) | 系统架构与技术选型 |
| [docs/development.md](docs/development.md) | 开发流程与发布规范 |
| [docs/coding-style.md](docs/coding-style.md) | 代码风格规范 |
| [CHANGELOG.md](CHANGELOG.md) | 版本变更记录 |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 贡献指南 |

## 许可证

GNU General Public License v2.0
