# 任务追踪（Task Tracker）

> 版本：**v1.9.36** ｜ 版本权威源：`src/version.js`
>
> 本文件是项目**唯一任务清单**，由 `docs/PROGRESS.md`（遗留任务）与 `docs/IMPROVEMENT-TASKS.md` 合并而来。
> 已完成任务归档至第 2 节；活动任务按优先级排列于第 1 节。PROGRESS.md 仅保留进度报告，不再重复维护任务表。

---

## 1. 活动任务（进行中 / 待办）

> 状态用 `- [ ]` 表示未完成；完成后改为 `- [x]` 并补入 `CHANGELOG.md`。
> 优先级沿用 P0/P1/P2/P3；工作量标签：S（<0.5d）/ M（0.5–2d）/ L（>2d）。

### P0 — 阻塞 / 高危

- （暂无活动任务）

### P1 — 重要质量项

- （暂无活动任务）

### P2 — 体验与规范

- [ ] **T5 · API 路由与错误码集成测试**（M）
  - 现状：`tests/` 仅 8 用例，无 `/api/collect`、`/api/batch-collect` 的路由/SSE/错误码覆盖（v1.9.25 的 `req.json` 容错曾靠人工回归）。
  - 验收：新增 ≥3 用例（非法 JSON→400、空输入→`INPUT_INVALID`、非法 URL→`INVALID_URL`）；`npm run test:unit` 全绿。
- [ ] **T6 · 近 200 行文件防回潮门禁**（S）
  - 现状：`configUI.js`(191)/`virtualDom/manager.js`(190)/`useCollector.ts`(189)/`performanceMonitor.js`(186) 贴线；`scripts/` 最大 179；`public/js` 最大 147。
  - 验收：CI 在新增超长文件时失败；或 `npm run lint` 报告最大行数并随发版刷新。
- [ ] **T7 · 依赖审计纳入 CI**（S）
  - 现状：含可选 `puppeteer-core`（运行期 `createRequire` 解析）、`express`/`ws`/`next`；未见 `npm audit` 门禁。
  - 验收：CI 跑 `npm audit --audit-level=high` 且不阻塞低危；无未声明却打进产物的依赖。

### P3 — 可选 / 前瞻

- [ ] **T8 · 可访问性（a11y）走查**（M）
  - 现状：项目约定主要容器加语义化 `id`（已实现），但未做 WCAG 走查。
  - 验收：关键页（`/`、`/overview`、`/design`）无 axe 严重/高危问题。
- [ ] **T9 · 仓库命名一致性澄清**（S）
  - 现状：仓库远程仍为 `github.com/Tanox/GitHub_i18n`；README/metadata 多处用 `GitHub_i18n`；产品名 `GitHub Chinese 简体中文`。
  - 验收：文档命名表述一致无歧义（若保留旧 URL 因 `@updateURL` 依赖，至少说明"旧名兼容"）。
- [ ] **T10 · 词典来源与采集趋势可视化**（L）
  - 现状：459 词条来自 `src/dictionaries/**`；采集仅文本粘贴/URL 两种入口；`/overview` 已展示静态指标。
  - 验收：新增 ≥1 个词典来源通道；`/overview` 含趋势视图（结合 `collect-dict.cjs` 增量去重报告）。

---

## 2. 已完成（历史归档）

> 以下任务来自 `docs/PROGRESS.md` 遗留任务清单，已实际落地，归档备查。

### 来自 TASKS.md 活动任务（v1.9.35–v1.9.36）

- [x] **T1** 批量采集 SSRF 加固（v1.9.35）：新增 `src/lib/url-guard.js` 纯函数（http(s) 协议白名单 + 本机/内网/回环/链路本地/云元数据地址拦截）；`collector-core.js` 在 `page.goto` 前逐项校验并透传 `CollectErrorCode.INVALID_URL`；单测 4 组覆盖
- [x] **T2** 补充 Content-Security-Policy（v1.9.36）：`src/proxy.ts` 注入基于 nonce 的 CSP（`script-src 'self' 'nonce-…' 'strict-dynamic'`、`object-src 'none'`、`frame-ancestors 'none'` 等）
- [x] **T3** 清理 PROGRESS.md 文档漂移（v1.9.35）：修正 `:19` 「双锁并存」错误陈述，补全版本行与 §8 变更记录（1.9.33–1.9.35）
- [x] **T4** 补充 OG / Twitter 元信息（v1.9.36）：`src/app/layout.tsx` 增加 `metadataBase` / `openGraph` / `twitter` 配置

### 来自 PROGRESS.md（v1.9.x）

- [x] **P0-1** 提交 `build/GitHub_i18n.user.js` 产物（v1.9.24）
- [x] **P0-2** 批量采集改用 `puppeteer-core` + 系统 Chrome/Edge（v1.9.32）
- [x] **P1-1** 拆分超过 200 行的代码文件（v1.9.24 / v1.9.26，当前 0 个超 200 行）
- [x] **P1-2** 决策 i18n 框架去留 → 移除（v1.9.26，依据见 PROGRESS 4.2）
- [x] **P1-3** 清理未启用的 Jest，改用 Node 内置 test runner（v1.9.30）
- [x] **P1-4** 消除双锁文件漂移：删除 `bun.lock`，统一 npm 单一锁（v1.9.29 已修复；PROGRESS 曾误标 OPEN，T3 负责清理该漂移）
- [x] **P1-5** 采集服务端逻辑去重：删除 `src/server/collector.js`，统一 `collector-core.js` + `dictionary-processor.js`（v1.9.26）
- [x] **P2-1** 开启 TypeScript 严格模式（v1.9.26，`strict: true`，零错误）
- [x] **P2-2** 补齐采集工作台次级页面 `/overview`、`/design`（v1.9.26）
- [x] **P2-3** 词典采集支持增量与去重统计（v1.9.29）
- [x] **P2-4** 性能监控面板数据导出（v1.9.28）
- [x] **P2-5** 补充 E2E / 冒烟测试 `tests/smoke.test.cjs`（v1.9.31）
- [x] **P2-6** 工作台移动端导航 `MobileNav`（v1.9.27）
- [x] **P2-7** 采集流程错误码约定 `collect-codes.js`（v1.9.28）

---

## 3. 推进说明

- **单一来源**：项目任务以本文件为准；`docs/PROGRESS.md` 仅作进度/架构/指标报告。
- **流转规则**：活动任务完成后勾选 `[x]`，在 `CHANGELOG.md` 对应版本小节记录；大规模改动同步更新 `docs/PROGRESS.md` 的迭代记录。
- **新增任务**：直接追加到对应优先级小节，编号沿用 `Txx`；文档准确性类问题优先以 T3 模式处理。
