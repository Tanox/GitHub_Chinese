# 架构文档（索引）

> 版本：**v1.9.24** ｜ 版本权威源：`src/version.js`
>
> 本文件为索引。架构文档的**唯一权威正文位于 [docs/architecture.md](../docs/architecture.md)**，
> 此处不再重复维护正文，以避免同一内容出现两份副本而长期脱节。

## 架构要点速览

项目由两条相互独立、仅共享词典数据的链路组成：

| 链路 | 交付物 | 构建方式 |
|------|--------|---------|
| A. 用户脚本引擎 | `build/GitHub_i18n.user.js` 单文件用户脚本 | `build.cjs` 从 `src/main.js` 递归解析依赖图并拼接为 IIFE |
| B. 词典采集工作台 | Next.js 16 应用（`src/app`） | `next build`（`npm run build:web`） |

用户脚本调用链：

```
src/main.js → main/lifecycle.js
  ├─ versionChecker/       版本检查与更新通知
  ├─ translation-core/     翻译核心（词典 / 选择器 / 翻译器 / 部分匹配 / 缓存）
  ├─ page-monitor/         DOM 与路由监听
  └─ ui/configUI.js        配置面板 + 浮动入口按钮
```

采集工作台调用链：

```
src/app/page.tsx → src/hooks/useCollector.ts
  ├─ POST /api/collect        → lib/collector-logic.ts → spawn(collect-dict.cjs)
  └─ POST /api/batch-collect  → lib/collector-logic.ts → puppeteer 抓取 → spawn(collect-dict.cjs)
        └─ SSE(text/event-stream) 实时回传日志 / 进度 / 完成
```

技术选型、数据流、性能优化与采集工作台架构的完整说明见权威正文。

---

## 权威正文

| 章节 | 位置 |
|------|------|
| 系统整体架构概述 | [docs/architecture.md §1](../docs/architecture.md) |
| 核心模块说明 | [docs/architecture.md §2](../docs/architecture.md) |
| 数据流和交互流程 | [docs/architecture.md §3](../docs/architecture.md) |
| 技术选型说明 | [docs/architecture.md §4](../docs/architecture.md) |
| 目录结构 | [docs/architecture.md §5](../docs/architecture.md) |
| 采集工作台架构 | [docs/architecture.md §7](../docs/architecture.md) |
| 版本历史 | [docs/architecture.md §8](../docs/architecture.md) |
