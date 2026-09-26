# 文档索引

> 版本：**v1.12.1** ｜ 版本权威源：`src/version.js`

面向开发者与贡献者的文档入口。设计规范与高保真原型由 `prototype/` 目录统一维护。

> 说明：原 `openspec/` 目录（指向本目录的规范索引与 OpenSpec 配置）已于 v1.12.1 合并入本索引并移除；
> `docs/` 现为本项目规范文档的**唯一权威正文**，不再维护第二份索引或副本。

## 目录导航

| 文档 | 路径 | 说明 |
|------|------|------|
| 开发进度 | [PROGRESS.md](./PROGRESS.md) | 进度报告与后续计划 |
| 项目结构与规范 | [project.md](./project.md) | 项目概述、目录结构、核心模块说明 |
| 架构设计 | [architecture.md](./architecture.md) | 系统架构、技术选型、采集工作台架构 |
| 代码风格 | [coding-style.md](./coding-style.md) | 命名约定、注释规范、最佳实践 |
| 开发流程 | [development.md](./development.md) | 分支策略、提交规范、发布流程 |
| 配置 | [config.yaml](./config.yaml) | 规范文档配置（OpenSpec 上下文） |
| 原型与设计规范 | [prototype.md](./prototype.md) | 原型设计理念与组件规范 |

## 文档速览

### 架构要点

项目由两条相互独立、仅共享词典数据的链路组成：

| 链路 | 交付物 | 构建方式 |
|------|--------|---------|
| A. 用户脚本引擎 | `build/GitHub_zh-cn.user.js` 单文件用户脚本 | `build.cjs` 从 `src/main.js` 递归解析依赖图并拼接为 IIFE |
| B. 词典采集工作台 | Next.js 16 应用（`src/app`） | `next build`（`npm run build:web`） |

- 用户脚本调用链：`src/main.js → main/lifecycle.js → versionChecker / translation-core / page-monitor / ui/configUI.js`
- 采集工作台调用链：`src/app/page.tsx → useCollector.ts → POST /api/collect | /api/batch-collect → collector-logic → puppeteer-core / spawn(collect-dict.cjs) → SSE 实时回传`

### 开发要点

- **分支策略**：`main` 稳定发布；`feature/*` 新功能；`fix/*` 缺陷修复
- **提交规范**：Conventional Commits `<type>(<scope>): <description>`
- **质量门禁**：`npm run lint`（0 error）→ `npm run build` → `npm run validate`
- **发布流程**：更新 `src/version.js` 单一版本源 → 同步 `package.json` / `CHANGELOG.md` / `docs/` / `prototype/` 版本展示位 → `npm test` → 重建 `build/GitHub_zh-cn.user.js` → 打 Tag 推送

### 代码风格要点

- 命名：目录 / CSS 类 kebab-case；文件 camelCase；类 / 组件 PascalCase；常量 UPPER_SNAKE_CASE；语义化 id kebab-case
- 格式化：2 空格缩进、单引号、必须分号、多行尾随逗号、行宽 100、LF、`jsx` 单引号（Prettier）
- 质量：函数 ≤ 50 行、单文件 ≤ 200 行（文档除外）、关键逻辑中文注释、禁止 `any` / `var`、`===`

### 原型设计要点

- 产品定位：GitHub 页面字符串采集工具（词典采集工作台），Next.js 应用 + 可交互高保真原型
- 三步闭环：① 植入探针（TreeWalker 提取）→ ② 归集词条（DataCenter → `POST /api/collect` / `batch-collect`）→ ③ 解析入库（collector-core + `collect-dict.cjs` → `untranslated-terms.txt` / `collect-history.json`）
- API 契约：`POST /api/collect {data:string}`、`POST /api/batch-collect {urls:string[]}`（上限 50）→ SSE `{type:'log'|'error'|'progress'|'done'}`

## 高保真原型

- 高保真原型：[../prototype/prototypes/index.html](../prototype/prototypes/index.html)

## 备注

`docs/` 目录保留架构与流程类 Markdown 文档，高保真原型统一在 `prototype/` 中维护，避免重复。
