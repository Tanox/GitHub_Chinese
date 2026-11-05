# 已交付任务归档（Task Archive）

> 版本：**v1.13.26** ｜ 更新日期：2026-11-05
> 本文件归档 `docs/tasks.md` 中**已交付**的任务，便于追溯。
> 活跃任务清单见 [`docs/tasks.md`](./tasks.md)（唯一权威来源）。

---

## 1. 里程碑索引（按交付版本）

| 任务 | 能力 | 交付版本 |
|------|------|---------|
| T1–T11 | 安全加固 / CSP / a11y / 命名澄清 / 文档整理等 | v1.9.x（详见 CHANGELOG v1.9.33–v1.9.42） |
| T12–T17 | 采集成功率 / 覆盖率度量（提取精准 · SPA 适配 · 单页鲁棒 · 并发限流 · 匹配增强 · 覆盖率度量） | v1.10.0 等 |
| T26 | `page.evaluate` 序列化回归修复 | v1.10.2 |
| T22 | 覆盖率看板 UI | v1.11.16 |
| T21 | 翻译建议 + 词典助手页（localStorage 持久化） | v1.12.6 |
| T19 / T20 / T23 / T24 / T25 | 词库管理台（搜索 / 批量 / 审阅 / 导入导出 / 合并入库 / 历史对比） | v1.13.9 |
| T18 | 采集源扩展（登录态 cookie 注入 / HAR 会话导入 / UI 区域覆盖） | v1.13.10 |
| T27–T36 | 采集重构 / 解耦 / URL 上限 / SSRF 重定向 / 鉴权限流 / SSE 复用 / 前端重构 / 词条事件解耦等 | 见 CHANGELOG |
| T37 | 文档与记忆整理（术语 / 版本 / 布局统一、code-review 治理、MEMORY 耐久化） | v1.13.12 |
| T38 | 清理预存 ESLint 错误（`tests/batch-collector.test.mjs` 两处 `_` 未使用） | v1.13.13 |
| T39 | 应用页脚更新时间单一来源化（`BUILD_DATE`） | v1.13.18 |
| 未编号 | 文档治理：建立 SSOT 体系、重写 `coding-style`/`development`/`README`、修正失真路径与术语、修复 CI/钩子缺口 | v1.13.24 |
| W5 | 采集工作台 serverless / 无浏览器架构——决议采纳「自托管服务」路径，交付权威文档 `docs/collect-service.md` | v1.13.26 |

---

## 2. 重点验收要点（留痕）

- **T39（v1.13.18）**：`src/userscript/version.js` 新增 `BUILD_DATE` 单一来源（与 `VERSION` 同步），`src/components/Shell.tsx` 页脚「更新时间」改用 `BUILD_DATE`，消除此前硬编码 `2026-10-03` 的漂移（版本号早已取自 `VERSION`，符合 `docs/coding-style.md` §5.12）。
- **T18（v1.13.10）**：
  - T18-a 登录态 cookie 注入（`collector-core` 支持 `cookies`，`page-navigation.applyCookies` 注入）
  - T18-b HAR/会话导入工具（`scripts/har-import.cjs` + `extract-html-text.js`）
  - T18-c 扩展选择器/作用域覆盖更多 GitHub UI 区域
- **T19 / T20 / T23 / T24 / T25（v1.13.9）**：词库管理台能力统一经「词库管理」页接入；T20 合并入库以「入库补丁」（added/updated 分离）形式产出，供手动入库到 `src/dictionaries/`；T23 历史对比读取 `docs/collect-history.json`，采集流程写入后自动生效。
- **v1.13.24 文档治理**：详见 `CHANGELOG.md` 1.13.24 节。核心为——单一权威来源（SSOT）分工表 + 统一术语表；编码/开发规范以代码实况为准（修正函数 150 行/参数 5/复杂度 30 等失真数值）；修正失效路径（`main/index.js`、五页路由、`docs/collect-history.json`）；消除 6 处重复定义；修复 `package.json` 的 `main` 路径、`validate` 脚本、缺失的 `.husky/pre-commit`、失效 CODEOWNERS。
- **W5（v1.13.26）**：维护者决议采纳「自托管服务」路径（三选一：自托管服务 / 无头浏览器池化 / 纯客户端增强）。现状代码已完备——`server/collect-service/`（Express + SSE，复用 `collector-core`）+ `src/lib/collect-service-client.js`（代理与回退）+ 双端令牌契约均有实现与单测覆盖，故零额外核心开发；本轮交付唯一权威文档 `docs/collect-service.md`（部署 / 接口契约 / 鉴权成对配置 / 排查 / 安全建议），并在 `docs/README.md` 索引、`docs/architecture.md` 数据流要点、`docs/project.md` 任务注记中挂接引用。

---

> 完整验收要点与发版记录见 [`CHANGELOG.md`](../CHANGELOG.md) 对应版本小节。本归档文件仅作追溯，不再维护。
