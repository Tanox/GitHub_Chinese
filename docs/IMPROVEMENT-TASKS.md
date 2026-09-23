# 完善改进建议任务文档

> 版本：**v1.9.33** ｜ 版本权威源：`src/version.js` ｜ 基准核查：v1.9.32（2026-09-23）
>
> 本文档由「代码审查 + 子代理实地核查」生成，记录 GitHub Chinese 简体中文项目的完善改进任务。
> 项目核心能力（用户脚本引擎 + 词典采集工作台）已就绪，本清单以**发布就绪 + 安全加固**为锚点做综合梳理。

---

## 1. 设计树（grill-me 共识）

| 决策点 | 结论 |
|--------|------|
| 覆盖范围 | **D 综合**（锚点：发布就绪 + 安全加固） |
| 文档漂移处理 | **A 纳入正式任务**（PROGRESS 漂移应作为可验收任务，而非口头说明） |
| 文档结构 | **A 优先级任务清单**（编号 / 标题 / 优先级 / 工作量 / 验收标准 / 理由） |
| 优先级方案 | **A 复用 P0/P1/P2 + 工作量标签 S/M/L**（与 PROGRESS.md 体系一致） |
| 输出位置 | **A `docs/IMPROVEMENT-TASKS.md`**（独立成篇，PROGRESS 可加一行链接） |

---

## 2. 现状核查摘要（事实，非推测）

| # | 发现 | 证据 | 判定 |
|---|------|------|------|
| F1 | 批量采集无 URL 校验，直接 `page.goto(url)` | `src/app/api/batch-collect/route.ts:17-28` 仅 `Array.isArray`；`src/lib/collector-core.js:101-107` 直接 goto | **高危 SSRF** |
| F2 | 缺 Content-Security-Policy | `src/proxy.ts:11-20` 仅 nosniff/frame-deny/referrer/x-dns | 安全短板 |
| F3 | 缺 OG / Twitter 元信息 | `src/app/layout.tsx:11-14` 仅 title/description | SEO 短板 |
| F4 | PROGRESS.md 文档漂移 | `docs/PROGRESS.md:232` P1-4 未划线；`:19` 仍写"双锁并存"；实际无 `bun.lock`（CHANGELOG 1.9.29 已记录修复） | 文档准确性 |
| F5 | 多文件逼近 200 行上限 | configUI.js 191 / virtualDom/manager.js 190 / useCollector.ts 189 / performanceMonitor.js 186（审计全仓，均 <200） | 约定回潮风险 |
| F6 | API 路由无测试覆盖 | `tests/` 仅 collect-codes(2)+collect-dict(3)+smoke(3)=8 用例，无 SSE/错误码/路由测试 | 回归风险 |
| F7 | 依赖审计未纳入流程 | 含 `puppeteer-core`（可选运行时）/ `express`/`ws`/`next`；未见 `npm audit` 门禁 | 供应链 |
| — | 已确认健康项 | req.json 容错已落地；构建可复现（无 Date/random 嵌入）；无 >200 行文件；双锁已消除 | 不需重复处理 |

---

## 3. 任务清单

### P0 — 阻塞 / 高危

#### T1 · 批量采集 SSRF 加固 ｜ 工作量：L
- **现状**：`batch-collect` 仅校验 `Array.isArray(urls)`，未校验协议/主机；`collector-core.js` 直接 `page.goto(url)`，攻击者可令服务端抓取内网地址（`http://169.254.169.254/`、`http://localhost`、`file://`）。
- **措施**：新增 `src/lib/url-guard.js`（纯函数、可单测）：
  1. `new URL()` 解析，仅允许 `http`/`https`；
  2. 主机白名单（至少 `github.com` + `*.github.com`，可配置扩展）；
  3. 拒绝保留/私网地址：`127/8`、`10/8`、`172.16/12`、`192.168/16`、`169.254/16`、`::1`、`[::]`、`0.0.0.0`；
  4. 可选：拒绝非标准端口。
  在 `batch-collect/route.ts` 进入 `collectFromUrls` 前逐 URL 校验，非法者返回 `400` + `INVALID_URL` 错误码（`collect-codes.js` 已有错误码体系可扩展）。
- **验收**：
  - 单测覆盖：合法 `https://github.com/...` 通过；`file://`、`http://localhost`、`http://169.254.169.254`、`http://10.0.0.1`、`ftp://x` 被拒；
  - 非法 URL 经 SSE 透传 `E<code>` 错误码徽标；
  - 集成冒烟：仅白名单主机被抓取。
- **理由**：服务端出网抓取，SSRF 可致内网探测与云元数据泄露，是当前最高风险项。

### P1 — 重要质量项

#### T2 · 补充 Content-Security-Policy ｜ 工作量：M
- **现状**：`src/proxy.ts` 仅设 3 个头，无 CSP。
- **措施**：在 `proxy()` 中增加 `Content-Security-Policy`。工作台为静态页 + 少量内联脚本/动态 DOM 文本注入，建议策略：
  `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'`
  （`style-src` 需 `unsafe-inline` 以兼容 `public/css` 自包含样式；`script-src` 保持 `'self'`，避免内联脚本）。
- **验收**：响应头含 CSP；浏览器控制台对当前页面/采集流无 CSP 违规（重点确认 SSE 动态注入节点不触发 `script-src` 执行——当前注入为文本节点，风险低）。
- **理由**：降低 XSS/注入影响面，属安全基线。

#### T3 · 清理 PROGRESS.md 文档漂移 ｜ 工作量：S
- **现状**：`docs/PROGRESS.md:232` 的 P1-4（双锁漂移）未加删除线仍为 OPEN；`:19` 仍写"仓库同时存在 `bun.lock`"；但根目录实际无 `bun.lock`（CHANGELOG 1.9.29 已记录修复）。
- **措施**：
  1. 将 P1-4 标记 `~~P1-4~~` 已完成（与 CHANGELOG 对齐）；
  2. 修正 `:19`"双锁并存"描述为"已统一为 npm 单一锁（`package-lock.json`）"；
  3. 顺带核对 `docs/project.md`/`architecture.md`/`development.md` 是否仍提"双锁"或"i18n 框架"（i18n 已于 v1.9.26 移除），消除同类漂移。
- **验收**：全仓 `grep "bun.lock"` 文档中的错误陈述已清除；P1 编号状态与 CHANGELOG 一致。
- **理由**：文档准确性是项目硬约定；误导性表述会让维护者误判漂移仍在。

### P2 — 体验与规范

#### T4 · 补充 OG / Twitter 元信息 ｜ 工作量：S
- **现状**：`src/app/layout.tsx:11-14` 仅有 `title`/`description`。
- **措施**：`metadata` 增加 `openGraph`（title/description/type/url/siteName）+ `twitter`（card/title/description）；可选 `opengraph-image` 路由。
- **验收**：`<head>` 含 `og:`/`twitter:` 标签；社交分享预览正常。
- **理由**：SEO 与分享体验基线。

#### T5 · API 路由与错误码集成测试 ｜ 工作量：M
- **现状**：`tests/` 仅 8 用例，无 `/api/collect`、`/api/batch-collect` 的路由/SSE/错误码覆盖（v1.9.25 的 `req.json` 容错即曾靠人工回归）。
- **措施**：新增 `tests/api-collect.test.mjs`，覆盖：
  1. 非法 JSON → `400`；
  2. 空输入/空 URL → `400` + `INPUT_INVALID`；
  3. 非法 URL → `400` + `INVALID_URL`（依赖 T1）；
  4. 正常输入经 SSE 透传 `E<code>` 错误码徽标。
  可用 Node 内置 `fetch` 起 `next start` 或 mock `processRawData`/`collectFromUrls` 做单元级验证。
- **验收**：新增 ≥3 用例；`npm run test:unit` 全绿。
- **理由**：采集是核心链路，缺集成测试易无声回归。

#### T6 · 近 200 行文件防回潮门禁 ｜ 工作量：S
- **现状**：审计发现 `configUI.js`(191)、`virtualDom/manager.js`(190)、`useCollector.ts`(189)、`performanceMonitor.js`(186) 等贴线；`scripts/` 最大 179、`public/js` 最大 147。
- **措施**：在 `eslint` 或独立脚本中加"行数上限"门禁（>`200` 失败/告警）；`PROGRESS.md` 指标项增"最大文件行数"实算值。
- **验收**：CI 在新增超长文件时失败；或 `npm run lint` 报告最大行数并随发版刷新。
- **理由**：防止"单文件 ≤200 行"约定静默回潮（已有 4 文件贴线）。

#### T7 · 依赖审计纳入 CI ｜ 工作量：S
- **现状**：依赖含可选 `puppeteer-core`（运行期 `createRequire` 解析）、`express`/`ws`/`next 16`；未见 `npm audit` 门禁。
- **措施**：CI 增加 `npm audit --audit-level=high`；确认 `puppeteer-core` 确为可选（未安装不崩溃）；清理未声明却打包的依赖（如 `serve` 是否仅 dev 用）。
- **验收**：CI 跑 audit 且不阻塞低危；无未声明却打进产物的依赖。
- **理由**：供应链安全基线。

### P3 — 可选 / 前瞻

#### T8 · 可访问性（a11y）走查 ｜ 工作量：M
- **现状**：项目约定主要容器加语义化 `id`（已实现），但未做 WCAG 走查。
- **措施**：用 axe / Lighthouse 走查 `/`、`/overview`、`/design`；补全 `aria-*`、对比度、键盘可达性。
- **验收**：关键页无 axe 严重/高危问题。
- **理由**：可访问性基线，提升普适可用性。

#### T9 · 仓库命名一致性澄清 ｜ 工作量：S
- **现状**：仓库远程仍为 `github.com/Tanox/GitHub_i18n`；README/metadata 多处用 `GitHub_i18n`；产品名 `GitHub Chinese 简体中文`。
- **措施**：评估是否统一仓库名/URL 或文档表述；若保留旧 URL（`@updateURL` 依赖 raw 路径），至少在文档澄清"旧名兼容"。
- **验收**：文档中命名表述一致无歧义。
- **理由**：降低用户困惑（非阻塞）。

#### T10 · 词典来源与采集趋势可视化 ｜ 工作量：L
- **现状**：459 词条来自 `src/dictionaries/**`；采集仅文本粘贴/URL 两种入口；`/overview` 已展示静态指标。
- **措施**：研究从 GitHub 官方界面快照/社区词典增量导入；在 `/overview` 展示词典增长趋势（结合 `collect-dict.cjs` 的增量去重报告）。
- **验收**：新增 ≥1 个词典来源通道；`/overview` 含趋势视图。
- **理由**：提升词典覆盖与可观测性（前瞻，可选）。

---

## 4. 推进建议

- **立即处理**：T1（SSRF，P0）与 T3（文档漂移，P1）风险/成本低，建议本迭代内完成。
- **本迭代**：T2（CSP）、T4（OG）、T5（测试）、T6（门禁）、T7（审计）。
- **后续迭代**：T8–T10 按资源排期。
- 完成后将对应任务标记 `~~已完成~~` 并补入 `CHANGELOG.md`，保持与 PROGRESS.md 体系一致。
