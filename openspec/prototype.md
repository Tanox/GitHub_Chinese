# 原型设计（索引）

> 版本：**v1.9.48** ｜ 版本权威源：`src/version.js`
>
> 本文件为索引。原型设计说明的**唯一权威正文位于 [docs/prototype.md](../docs/prototype.md)**，
> 可交互高保真原型位于 [prototype/prototypes/](../prototype/prototypes/)：[高保真原型](prototype/prototypes/index.html)。

## 原型要点速览

### 产品定位

| 项 | 说明 |
|----|------|
| 名称 | GitHub 页面字符串采集工具（词典采集工作台） |
| 形态 | Next.js 应用（`src/app/`）+ 可交互高保真原型 `prototype/prototypes/index.html` |
| 目标 | 从 GitHub 原生界面抓取 UI 词条，沉淀中文本地化词典 |

### 关键流程（三步闭环）

| 步骤 | 名称 | 实现落点 |
|------|------|----------|
| 1 | 植入探针 | `ScriptInjector`（PROBE_SCRIPT，TreeWalker 提取文本）/ 批量抓取 `extract-page-text.js` |
| 2 | 归集词条 | `DataCenter`（文本粘贴 / 批量 URL）→ `POST /api/collect`、`POST /api/batch-collect` |
| 3 | 解析入库 | `collector-core` + `collect-dict.cjs` → `docs/untranslated-terms.txt`、`docs/collect-history.json` |

### 关键 UI 规格（原型）

| 元素 | 规格 |
|------|------|
| 采集流程步骤条 | 三步水平步骤条（数字徽标 + 连接线） |
| 探针脚本卡 | 深色代码块展示 TreeWalker 脚本，配「复制」按钮 |
| 数据中心卡 | 文本粘贴 / 批量 URL 标签切换；智能清洗 / 导出 JSON / 开始分析 按钮 |
| 清洗结果预览表 | 序号 / 采集词条 / 状态（待翻译·已翻译）三列 |
| 引擎实时处理中心 | 进度条 + SSE 终端日志 + 自动备份提示 + Processing 状态指示 |

### 接口契约

- `POST /api/collect` `{ data: string }` → SSE（`text/event-stream`）
- `POST /api/batch-collect` `{ urls: string[] }` → SSE（`urls` 上限 50）
- 事件：`{ type:'log'|'error'|'progress'|'done', message?, data?, code? }`

---

## 权威正文

| 章节 | 位置 |
|------|------|
| 产品定位与整体架构 | [docs/prototype.md §1–§2](../docs/prototype.md) |
| 采集三步闭环 | [docs/prototype.md §3](../docs/prototype.md) |
| API 契约与限流 | [docs/prototype.md §4](../docs/prototype.md) |
| 数据中心与预览 | [docs/prototype.md §5](../docs/prototype.md) |
| 引擎实时处理中心 | [docs/prototype.md §6](../docs/prototype.md) |
| 原型↔实现映射 | [docs/prototype.md §7](../docs/prototype.md) |
| 关键数据结构 | [docs/prototype.md §8](../docs/prototype.md) |
| 错误处理 | [docs/prototype.md §9](../docs/prototype.md) |
