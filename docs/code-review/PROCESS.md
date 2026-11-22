# 代码审查流程规范 (Code Review Process)

> 版本：**v1.13.35** ｜ 版本权威源：`src/userscript/version.js`

本文是**审查角色、审查流程、响应 SLA 与流程健康度指标的唯一权威正文**。审查判定标准见 [STANDARDS.md](./STANDARDS.md)，可执行清单见 [CHECKLIST.md](./CHECKLIST.md)，本地与仓库配置操作见 [SETUP_GUIDE.md](./SETUP_GUIDE.md)；分支 / 提交 / CI 的流程规范以 [development.md](../development.md) 为准，本文不复制。

## 目录

1. [流程概述](#流程概述)
2. [角色与职责](#角色与职责)
3. [详细流程](#详细流程)
4. [审查者分配规则](#审查者分配规则)
5. [批准与合并标准](#批准与合并标准)
6. [争议解决机制](#争议解决机制)
7. [紧急修复流程](#紧急修复流程)
8. [工具配置](#工具配置)
9. [流程健康度指标](#流程健康度指标)

---

## 流程概述

```
开发者提交 PR
    ↓
自动检查（CI：lint / build / integration / security，见 development.md §6）
    ↓
按 CODEOWNERS 分配审查者
    ↓
代码审查（Reviewer，按 STANDARDS.md 判定）
    ↓
[有问题?] ──是──> 作者修改并推送 ──> 重新审查
    ↓ 否
批准合并（merge commit）
```

---

## 角色与职责

### 代码作者 (Author)

**主要职责**：

- 编写高质量代码，提交前自行审查
- 编写清晰的 PR 描述（结构以 `.github/pull_request_template.md` 为准）
- 及时响应审查意见
- 本地跑通 `npm test` 与 `npm run typecheck`、`npm run format:check` 后再发起 PR

**提交前自检清单**（完整版见 [CHECKLIST.md](./CHECKLIST.md)「作者自检」小节）：

1. `npm test` 全流水线通过（lint → 行数门禁 → 构建 → 单测）；
2. 无遗留 `console.log` 调试输出与 `debugger`；
3. 无硬编码敏感信息；
4. 涉及公开行为 / 命令 / 目录 / API / 环境变量的改动已同步对应文档。

### 审查者 (Reviewer)

**主要职责**：

- 按 [STANDARDS.md](./STANDARDS.md) 的优先级定义（Blocker / Suggestion / Nit）审查并标注问题
- 提供具体、可操作、解释「为什么」的反馈
- 认可好的实现；决定 Approve / Request Changes / Comment

**响应 SLA**（唯一权威定义，与 [development.md §5](../development.md) 保持一致）：

| 场景 | 要求 |
|------|------|
| 首次回应 | 工作日 1 个工作日内 |
| 完成审查 | 2 个工作日内 |
| 紧急 PR（`hotfix/*` 或标题含 `[URGENT]`） | 4 小时内 |
| 作者回应审查意见 | 24 小时内 |

**审查者资格**：熟悉相关模块或有经验的团队成员；新成员在资深成员指导下审查。

### 团队 Lead / Maintainer

**主要职责**：最终批准重要改动；解决审查争议；维护审查标准与 `CODEOWNERS`；按季度回顾流程指标。

---

## 详细流程

### Step 1: 提交 PR

1. 从 `main` 创建功能分支（命名与工作流见 [development.md §3](../development.md)）：

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

2. 开发、提交（提交信息格式见 [development.md §4](../development.md)）、本地跑 `npm test`；
3. 推送分支并在 GitHub 创建 PR，按 `.github/pull_request_template.md` 填写（模板由 GitHub 自动填充，不在本文复制）。

### Step 2: 自动检查

PR 触发 CI（唯一权威配置 `.github/workflows/ci-cd.yml`，作业明细见 [development.md §6](../development.md)）：

- lint 作业：ESLint + Prettier 校验 + 行数门禁 + TypeScript 类型检查
- build 作业：Next 构建 + 用户脚本构建 + 产物校验 + 单元测试（含 a11y 与产物冒烟）
- integration 作业：真实启动 Next 服务做 API HTTP 断言
- security 作业：`npm audit --audit-level=high`

当前未配置覆盖率门禁。任一检查失败，PR 处于阻塞状态，无法合并。

本地提交时 `.husky/pre-commit`（`npx lint-staged`）会自动对暂存的 `*.{js,cjs,mjs,ts,tsx}` 运行 `eslint --fix` + `prettier --write`。

### Step 3: 分配审查者

由 `.github/CODEOWNERS` 自动请求审查（唯一权威配置，本文不复制）；未命中规则时作者手动 @ 相关成员或请求 Lead 分配。数量要求见下文「审查者分配规则」。

### Step 4: 代码审查

- 使用 GitHub PR 行内评论、Suggested Changes 与正式 Review 提交意见；
- 意见按 STANDARDS.md 的格式标注严重级别（🔴 Blocker / 🟡 Suggestion / 💭 Nit），说明位置、原因与建议。

审查结果三选一：

1. **Approve** — 无 Blocker / Suggestion 级问题（或仅剩协商一致的 Nit）；
2. **Request Changes** — 存在 Blocker 或未达成一致的 Suggestion；
3. **Comment** — 仅反馈，不阻塞。

### Step 5: 作者修改

1. 逐条回应审查意见（GitHub 评论），说明如何修复或不修改的理由；
2. 修改后以新的提交推送（保持审查历史，不 force push、不 amend 已审查提交）；
3. 在 PR 中通知审查者重新审查。

### Step 6: 批准与合并

满足「批准与合并标准」后以 **merge commit** 合并（分支合并策略的唯一权威定义见 [development.md §3.2](../development.md)：保留提交历史、便于整体回滚，不做 squash、不 rebase 已推送分支）。合并后删除已合并分支：

```bash
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

---

## 审查者分配规则

自动分配以 `.github/CODEOWNERS` 为准（默认所有者 `@sutandkb`，按 `src/userscript/`、`src/app/`、`src/lib/`、`scripts/`、`docs/` 等目录显式声明）。

数量要求：

| PR 类型 | 审查者数量 |
|---------|-----------|
| 普通 PR | 至少 1 名 |
| 重要改动（核心模块、架构变更） | 至少 2 名 |
| 核心模块改动 | 需模块对应 CODEOWNERS 人员 |

手动分配建议（未配置 CODEOWNERS 时）：新功能找熟悉模块的成员；Bug 修复找发现者或模块负责人；重构找模块负责人；文档更新 1 名成员快速审查。

---

## 批准与合并标准

必须全部满足：

- 所有 CI 检查通过；
- 至少 1 名审查者批准（重要改动按上表要求 2 名）；
- 所有 Blocker 问题已修复；
- 所有 Suggestion 问题已讨论并达成一致（修复、或记录为 Tech Debt 后续处理）。

不能合并：

- 存在未修复的 Blocker；
- CI 检查失败；
- 审查者 Request Changes 未处理；
- PR 描述不清晰、无法判断改动目的。

---

## 争议解决机制

**作者与审查者意见不一致**：在 PR 中公开讨论并说明理由 → 请第三位成员发表意见 → 仍无法一致时由 Lead 仲裁做最终决定。

**审查者长时间未响应**：PR 中友好提醒 → 等待 24–48 小时 → 请求其他成员审查 → 阻塞重要功能时上报 Lead。

**紧急 PR 快速通道**：标题加 `[URGENT]` 或使用 `hotfix/*` 分支 → 即时通讯工具通知审查者 → 只检查 Blocker 级问题，Suggestion 记录为后续处理。

---

## 紧急修复流程

紧急修复（Hotfix）指需要立即进入 `main` 的生产缺陷 / 安全漏洞 / 严重性能问题：

1. 从 `main` 创建 `hotfix/<描述>` 分支（命名见 [development.md §3](../development.md)）：

```bash
git checkout main
git pull origin main
git checkout -b hotfix/fix-critical-issue
```

2. 最小化修复并按规范提交；
3. 简化审查：只检查 Blocker 级问题；
4. 经 PR 批准后以 merge commit 合回 `main`（不绕过分支保护），随后按 [development.md §8](../development.md) 发布。

---

## 工具配置

- **分支保护**：`main` 禁止直推，要求 PR + 至少 1 个 approval + CI 状态检查通过；推荐状态检查为 CI 的四个检查作业 `lint` / `build` / `integration` / `security`。操作步骤与截图级说明见 [SETUP_GUIDE.md](./SETUP_GUIDE.md)。
- **PR / Issue 模板**：`.github/pull_request_template.md` 与 `.github/ISSUE_TEMPLATE/`（唯一权威，本文只引用）。
- **CI**：`.github/workflows/ci-cd.yml`（唯一权威，本文不复制 YAML）。
- **lint-staged**：配置位于 `package.json` 的 `lint-staged` 字段，由 `.husky/pre-commit` 触发。

---

## 流程健康度指标

每季度回顾（目标值为参考基线，可由 Lead 调整）：

| 指标 | 目标 | 说明 |
|------|------|------|
| 审查首次响应时间 | < 1 个工作日 | 从提交 PR 到首次审查评论 |
| 平均合并时间 | < 3 天（非紧急） | 从提交 PR 到合并 |
| 审查轮次 | < 2 轮 | 每个 PR 平均审查往返次数 |
| Bug 逃逸率 | < 5% | 审查后仍遗漏到生产环境的缺陷比例 |

指标异常时的改进方向：响应慢 → 增加审查者或缩小 PR 体量；合并慢 → 拆小 PR；逃逸率高 → 收紧 STANDARDS.md 检查项或补自动化测试。

---

## 参考资料

- [GitHub Code Review](https://docs.github.com/en/pull-requests/conducting-a-review)
- [Google Code Review Guide](https://google.github.io/eng-practices/review/)
- [How to Do Code Reviews Like a Human](https://mtlynch.io/human-code-reviews-1/)

---

## 更新日志

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0.0 | 2026-09-30 | 初始版本 |
| 1.13.24 | 2026-11-04 | 与代码实况对齐：分支 / 提交 / CI / CODEOWNERS / PR 模板改为引用唯一权威来源，移除虚构配置副本 |
| 1.13.32 | 2026-11-08 | SSOT 复核：移除内嵌 PR 描述模板（改引用 `.github/pull_request_template.md`）；合并策略统一为 merge commit；SLA 与 development.md §5 对齐（首次回应 1 个工作日 / 完成 2 个工作日 / 紧急 4 小时）；紧急修复流程去重；修正 `upstream`→`origin`；去除装饰性 emoji，横幅格式对齐标准 |
