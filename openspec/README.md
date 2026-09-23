# OpenSpec 规范索引

> 版本：**v1.9.42** ｜ 版本权威源：`src/version.js`

本目录是 OpenSpec 的入口与配置目录，**仅保留规范索引与配置**。

项目规范文档的**唯一权威正文位于 [`docs/`](../docs/)**：`docs/` 下维护完整内容，
本目录下的同名 `.md` 均为简短索引，指向对应权威正文，避免同一内容维护两份而长期脱节。

## 规范索引

### 项目核心文档

| 文档 | 权威正文 | 本目录索引 |
|------|---------|-----------|
| 开发进度 | [docs/PROGRESS.md](../docs/PROGRESS.md) | `PROGRESS.md`（仅正文一处，无需索引） |
| 项目规范 | [docs/project.md](../docs/project.md) | [project.md](./project.md) |
| 架构文档 | [docs/architecture.md](../docs/architecture.md) | [architecture.md](./architecture.md) |
| 开发指南 | [docs/development.md](../docs/development.md) | [development.md](./development.md) |
| 代码风格 | [docs/coding-style.md](../docs/coding-style.md) | [coding-style.md](./coding-style.md) |
| 原型设计 | [docs/prototype.md](../docs/prototype.md) | [prototype.md](./prototype.md) |
| OpenSpec 配置 | — | [config.yaml](./config.yaml) |

### 原型与设计系统

设计系统与高保真原型由 [`prototype/`](../prototype/) 统一维护，它是设计与开发的唯一信息源：

| 模块 | 路径 | 说明 |
|------|------|------|
| 设计系统规范 | [prototype/design-system/](../prototype/design-system/) | 色彩、字体、间距、图标、动效 |
| 组件库规范 | [prototype/components/](../prototype/components/) | 基础组件、复合组件、业务组件 |
| 交互标准 | [prototype/interaction/](../prototype/interaction/) | 交互模式、反馈、错误处理、空状态 |
| 高保真原型 | [prototype/prototypes/](../prototype/prototypes/) | 桌面端 UI、移动端 UI |

打开 [prototype/index.html](../prototype/index.html) 浏览完整的原型与设计系统。

## 关键约定（摘要）

- 版本单一来源：`src/version.js` 的 `VERSION`
- 提交规范：Conventional Commits
- 质量门禁：`npm run lint`（0 error）→ `npm run build` → `npm run validate`
- 单代码文件 ≤ 200 行；主要容器与交互控件须带语义化 `id`

## 历史说明

- 旧 `docs/prototype/prototype.html` 已被 `prototype/` 替代并移除
- 所有新增的设计 / 交互规范请直接在 `prototype/` 下维护
- v1.9.24 起，`openspec/*.md` 由「与 `docs/` 完全重复的正文」改为「指向 `docs/` 的索引」
