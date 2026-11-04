# GitHub Chinese 简体中文

让 GitHub 以中文的节奏呼吸。这是一套为 GitHub Chinese 简体中文插件量身定制的设计系统。它承袭 GitHub 的深色美学、精确排版与克制交互，同时以中文衬线字体、语义色彩与细腻动效，塑造属于插件自身的独立识别。

[![GitHub license](https://img.shields.io/github/license/Tanox/GitHub_Chinese?color=blue)](LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/Tanox/GitHub_Chinese?display_name=tag&color=green)](https://github.com/Tanox/GitHub_Chinese/releases)

> 当前版本：**v1.13.24**（版本单一来源：`src/userscript/version.js`）

## 命名与兼容性说明

- **产品名**：GitHub Chinese 简体中文（文档与界面统一使用此名）。
- **仓库名**：仓库已更名为 `github.com/Tanox/GitHub_Chinese`；全局变量仍保留 `window.GitHub_i18n` 以兼容历史安装。
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

点击 [一键安装](https://github.com/Tanox/GitHub_Chinese/raw/refs/heads/main/build/GitHub_zh-cn.user.js)，然后在 Tampermonkey 中点击「安装」。

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
采集清洗由 `scripts/collect-dict.cjs` 完成，与用户脚本共享同一份词典数据。

> 批量 URL 采集依赖可选依赖 `puppeteer-core` 与系统已安装的 Chrome / Edge 浏览器。未满足条件时该功能会返回明确提示，其余功能不受影响。

> **独立采集服务（W5 解耦）**：生产环境（EdgeOne / Vercel 等 serverless）无法运行无头浏览器，采集实际不可用。可将采集引擎抽离为自托管 Node 服务（`npm run collect-service`，监听 `COLLECT_SERVICE_PORT`，默认 8787），由 `src/lib/collect-service-client.js` 在配置 `COLLECT_SERVICE_URL` 时把采集请求代理到该服务并透传 SSE；未配置时退回本地采集逻辑，行为不变。
>
> **令牌鉴权（公网部署必配）**：采集服务默认无鉴权，仅适用于本机 / 内网。公网部署时须在**两端配置同一个密钥**——自托管服务侧设置 `COLLECT_SERVICE_TOKEN`（服务将对 `/api/*` 强制校验 `Authorization: Bearer <token>`，恒定时间比对，`/health` 探活始终放行）；Next 应用侧设置同名变量（客户端据此携带令牌）。只配一边会导致 401 或鉴权形同虚设。
>
> **API 限流与 IP 头信任**：采集 / 词典接口默认按客户端 IP 限流（60s 30 次，`COLLECT_RATE_LIMIT` / `COLLECT_RATE_WINDOW_MS` 可调）。由于 `cf-connecting-ip`、`x-real-ip`、`x-forwarded-for` 在直达链路上可被客户端任意伪造，限流默认**不读取任何代理头**（匿名请求共享一桶，确保无法靠轮换头值绕过）。部署在 Cloudflare / EdgeOne / Nginx 等可信边缘之后时，须显式设置 `COLLECT_TRUSTED_IP_HEADER` 为边缘保证覆写的那个头（如 `cf-connecting-ip`），才会按真实客户端 IP 分桶。

## 高保真原型

> **分工说明**：`prototype/` 是**轻量高保真预览**（评审 / 演示用途），仅前端静态资源，**不接入真实采集后端、不含数据持久化**；`src/app`（Next.js 采集工作台）才是正式的采集 / 审阅 / 词典沉淀运行环境，二者功能不重叠、数据各自独立。改造以 Next 工作台为准。

> **原型（v1.13.24）**：原型为一组轻量高保真静态预览（评审 / 演示用途），与应用代码（`src/` / `server/` / `scripts/`）完全分离，直接用浏览器打开即可预览，无需服务器或构建。`server/` 目录仅保留独立采集服务 `collect-service`。

本项目维护一套高保真原型，呈现插件在真实使用场景中的样貌，方便评审与迭代：

| 模块 | 路径 | 说明 |
|------|------|------|
| 高保真原型 | [prototype/prototype.html](prototype/prototype.html) | 采集流程 / 探针脚本 / 数据中心 / 清洗预览 / 实时处理中心 |
| 组件库规范 | [prototype/wireframes.html](prototype/wireframes.html) | 基础 / 复合 / 业务组件与设计令牌、使用规则 |
| 应用预览 | [prototype/app.html](prototype/app.html) | 采集工具应用级页面走查 |

**快速入口**：直接用浏览器打开 [prototype/prototype.html](prototype/prototype.html)（静态资源，无需服务器或构建）。

## 项目结构

```
src/
├── app/                     # 词典采集工作台（Next.js 16 App Router）
│   ├── api/                 # collect / batch-collect / dictionary/suggest 流式接口
│   ├── overview|coverage|dictionary/   # 指标 / 覆盖率看板 / 词典助手 + 词库管理台
│   └── styles/              # 工作台样式（17 个模块化 CSS，由 Next 构建打包）
├── components/              # 工作台组件（服务端外壳 + 'use client' 客户端岛）
├── hooks/                   # 工作台状态 Hook（useCollector 等）
├── lib/                     # 工作台服务端逻辑（采集核心 / api-guard / SSE / 指标）
├── dictionaries/            # 翻译词典（common[+common/ 分片] / codespaces / explore）
├── types/                   # 类型声明（puppeteer-core.d.ts 等）
├── userscript/              # 用户脚本引擎
│   ├── main/                # 入口（index.js）与生命周期编排（lifecycle.js）
│   ├── core/                # 基础设施（LRU 缓存 / 错误处理 / Trie / 虚拟 DOM）
│   ├── translation-core/    # 翻译核心（词典管理 / 元素翻译 / 部分匹配 / 性能监控）
│   ├── page-monitor/        # 页面监控（DOM / 路径监听）
│   ├── ui/                  # 配置面板（configUI/）与样式分片
│   ├── config/              # 全局配置与配置分片
│   ├── versionChecker/ + updateNotification/  # 版本检查与更新通知
│   └── version.js           # 版本信息（单一版本源）
├── utils/                   # 双端共用工具（string/、tools/ 分片）
└── proxy.ts                 # 安全响应头（Next 16 取代 middleware）
prototype/                   # 设计系统与高保真原型（单文件自包含 HTML，与应用代码分离）
scripts/                     # 构建依赖图、行数门禁、版本一致性、词典采集工具链
scripts/build/               # 用户脚本构建器（入口 src/userscript/main/index.js）
server/collect-service/      # 独立采集服务（自托管 Node 服务）
build/                       # 用户脚本构建产物（纳入版本控制）
tests/                       # 单测（node --test）、integration/、helpers/
docs/                        # 项目规范文档（唯一权威正文，入口 docs/README.md）
```

## 参与开发

```bash
git clone https://github.com/Tanox/GitHub_Chinese.git
cd GitHub_Chinese
npm install
npm test        # lint → 长度门禁 → 构建 → 单测（含产物冒烟）
```

### 开发命令

| 命令 | 说明 |
|------|------|
| `npm run build` / `build:web` | 构建 Next.js 采集工作台 |
| `npm run build:userscript` | 构建用户脚本 → `build/GitHub_zh-cn.user.js`（须纳入版本控制） |
| `npm run dev` | 启动 Next.js 采集工作台 |
| `npm run lint` / `lint:fix` | 代码检查 / 自动修复 |
| `npm run format` / `format:check` | 代码格式化 / 格式校验 |
| `npm test` | 完整流水线：lint → 长度门禁 → 工作台构建 → 单测（含产物冒烟） |
| `npm run dict:collect -- <文件>` | 采集文本文件中的待翻译词条 |

### 文档

| 文档 | 说明 |
|------|------|
| [docs/README.md](docs/README.md) | 文档索引、单一权威来源（SSOT）与术语表 |
| [docs/project.md](docs/project.md) | 项目概述、目录结构与量化指标 |
| [docs/architecture.md](docs/architecture.md) | 系统架构与技术选型 |
| [docs/development.md](docs/development.md) | 分支 / 提交 / 审查 / 测试 / 发布规范 |
| [docs/coding-style.md](docs/coding-style.md) | 编码风格与命名规范 |
| [docs/code-review/](docs/code-review/) | 代码审查标准、清单、流程与配置 |
| [docs/tasks.md](docs/tasks.md) | 活动任务唯一清单 |
| [CHANGELOG.md](CHANGELOG.md) | 版本变更记录 |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 贡献指南 |

## 许可证

GNU General Public License v2.0
