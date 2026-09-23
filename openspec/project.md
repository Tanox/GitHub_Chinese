# 项目规范（索引）

> 版本：**v1.9.41** ｜ 版本权威源：`src/version.js`
>
> 本文件为索引。项目规范文档的**唯一权威正文位于 [`docs/`](../docs/)**，
> 此处不再重复维护正文，以避免同一内容出现两份副本而长期脱节。

## 项目概述

GitHub Chinese 简体中文是一个浏览器用户脚本项目，为 GitHub 网站提供中文本地化翻译支持，
并附带基于 Next.js 16 的词典采集工作台。当前版本 **1.9.41**，许可证 GPL-2.0。

完整概述、目录结构、核心模块说明与项目信息请见 **[docs/project.md](../docs/project.md)**。

---

## 规范文档索引

| 文档 | 权威正文 | 说明 |
|------|---------|------|
| 开发进度 | [docs/PROGRESS.md](../docs/PROGRESS.md) | 进度报告、遗留任务清单与后续计划 |
| 项目规范 | [docs/project.md](../docs/project.md) | 项目概述、目录结构、核心模块 |
| 架构设计 | [docs/architecture.md](../docs/architecture.md) | 系统架构、技术选型、采集工作台架构 |
| 开发指南 | [docs/development.md](../docs/development.md) | 分支策略、提交规范、发布流程、测试要求 |
| 代码风格 | [docs/coding-style.md](../docs/coding-style.md) | 命名规范、代码格式、注释要求 |
| 原型设计 | [docs/prototype.md](../docs/prototype.md) | 原型设计、交互规格与数据结构 |
| 设计系统 | [prototype/](../prototype/) | 可交互高保真原型入口 |

---

## 关键约定（摘要）

- **版本管理**：单一版本源为 `src/version.js` 的 `VERSION`；任意修改至少升 patch；
  仅同步**实际改动文件**的头注释版本号，禁止全仓库批量刷写
- **提交规范**：Conventional Commits，`<type>(<scope>): <description>`
- **质量门禁**：`npm run lint` 零 error、`tsc --noEmit` 通过、`npm run validate` 通过
- **文件行数**：单个源代码文件 ≤ 200 行，超出须按职责拆分（文档不适用）
- **语义化 id**：主要容器与交互控件须带语义化 `id`
- **构建产物**：`build/GitHub_i18n.user.js` 需纳入版本控制（README 一键安装依赖它）

完整条款以 `docs/` 下的权威正文为准。

