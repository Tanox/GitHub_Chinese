# 文档索引

> 版本：**v1.9.24** ｜ 版本权威源：`src/version.js`

面向开发者与贡献者的文档入口。设计规范与高保真原型由 `prototype/` 目录统一维护。

## 目录导航

| 文档 | 路径 | 说明 |
|------|------|------|
| 开发进度 | [PROGRESS.md](./PROGRESS.md) | 进度报告、遗留任务清单与后续计划 |
| 项目结构与规范 | [project.md](./project.md) | 项目概述、目录结构、核心模块说明 |
| 架构设计 | [architecture.md](./architecture.md) | 系统架构、技术选型、采集工作台架构 |
| 代码风格 | [coding-style.md](./coding-style.md) | 命名约定、注释规范、最佳实践 |
| 开发流程 | [development.md](./development.md) | 分支策略、提交规范、发布流程 |
| 配置 | [config.yaml](./config.yaml) | OpenSpec 配置与上下文 |
| 原型与设计规范 | [prototype.md](./prototype.md) | 原型设计理念与组件规范 |

## 文档权威性说明

`docs/` 目录是项目规范文档的**唯一权威正文**；`openspec/` 目录仅保留规范索引与
OpenSpec 配置，索引指向本文档目录，避免同一内容维护两份而产生长期脱节。

## 设计系统与高保真原型

- 设计系统规范：[../prototype/design-system/](../prototype/design-system/)
- 组件库：[../prototype/components/](../prototype/components/)
- 交互标准：[../prototype/interaction/](../prototype/interaction/)
- 高保真原型：[../prototype/prototypes/](../prototype/prototypes/)
- 统一入口：[../prototype/index.html](../prototype/index.html)

## 备注

`docs/` 目录保留架构与流程类 Markdown 文档，视觉与组件规范统一在 `prototype/` 中维护，避免重复。
