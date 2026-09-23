# 代码风格规范（索引）

> 版本：**v1.9.42** ｜ 版本权威源：`src/version.js`
>
> 本文件为索引。代码风格规范的**唯一权威正文位于 [docs/coding-style.md](../docs/coding-style.md)**，
> 此处不再重复维护正文，以避免同一内容出现两份副本而长期脱节。

## 风格要点速览

### 命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 目录 / CSS 类 | kebab-case | `page-monitor/`、`.rail-link` |
| 文件（模块） | camelCase | `dictionaryManager.js` |
| 类 / React 组件 | PascalCase | `ConfigUI`、`DataCenter` |
| 变量 / 函数 | camelCase，动词开头 | `getTranslatedText()` |
| 常量 | UPPER_SNAKE_CASE | `MAX_KEY_LENGTH_FOR_CASE_VARIANTS` |
| 语义化 id | kebab-case | `data-center-run-btn` |

### 格式化（Prettier，与 `.prettierrc` 一致）

2 空格缩进、单引号、必须分号、多行尾随逗号、行宽 100、LF 换行、JSX 单引号。

### 质量约定

- 函数不超过 50 行为宜；单文件不超过 200 行，超出按职责拆分（文档不适用）
- 关键逻辑添加中文注释；文件头注释标注 `@file` 与实际路径一致的 `@version`
- 禁止 `any`（TypeScript）、禁止 `var`、强制 `===`
- 为主要容器与交互控件添加语义化 `id`

---

## 权威正文

| 章节 | 位置 |
|------|------|
| 文件和目录命名规范 | [docs/coding-style.md §1](../docs/coding-style.md) |
| 变量和函数命名规范 | [docs/coding-style.md §2](../docs/coding-style.md) |
| 代码风格 | [docs/coding-style.md §3](../docs/coding-style.md) |
| 注释规范 | [docs/coding-style.md §4](../docs/coding-style.md) |
| 最佳实践（含行数拆分 / 语义化 id / TypeScript 约定） | [docs/coding-style.md §5](../docs/coding-style.md) |
