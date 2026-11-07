# 开发流程规范

> 版本：**v1.13.31** ｜ 版本权威源：`src/userscript/version.js`

本文是**分支策略、提交信息、代码审查流程、质量门禁、测试与发布流程的唯一权威正文**。编码风格与命名见 [coding-style.md](./coding-style.md)，文档权威来源分工见 [docs/README.md](./README.md)。

## 目录

- [1. 环境与前置要求](#1-环境与前置要求)
- [2. 命令速查](#2-命令速查)
- [3. 分支管理](#3-分支管理)
- [4. 提交信息格式](#4-提交信息格式)
- [5. 代码审查流程](#5-代码审查流程)
- [6. 质量门禁与 CI](#6-质量门禁与-ci)
- [7. 测试规范](#7-测试规范)
- [8. 版本发布流程](#8-版本发布流程)
- [9. 文档同步义务](#9-文档同步义务)

---

## 1. 环境与前置要求

| 项 | 要求 | 依据 |
|----|------|------|
| Node.js | `>= 22.22.2` | `package.json` 的 `engines.node`；CI 固定 `22` |
| 包管理器 | npm（仓库提供 `package-lock.json`，用 `npm ci` 安装） | CI 各作业 |
| 浏览器 | 系统已安装 Chrome / Edge（仅批量 URL 采集需要） | `puppeteer-core` 为可选运行时依赖 |
| Git 钩子 | `npm ci` 触发 `prepare: husky` 安装 `.husky/pre-commit` | 提交前自动执行 `lint-staged` |

```bash
git clone https://github.com/Tanox/GitHub_Chinese.git
cd GitHub_Chinese
npm ci
npm run dev        # http://localhost:3000
```

### 1.1 环境变量

| 变量 | 用途 | 默认 |
|------|------|------|
| `COLLECT_SERVICE_PORT` | 独立采集服务监听端口 | `8787` |
| `COLLECT_SERVICE_URL` | 配置后工作台把采集请求代理到自托管服务并透传 SSE | 未配置→本地采集 |
| `COLLECT_SERVICE_TOKEN` | 采集服务鉴权密钥；**公网部署时两端必须配置同一个值** | 未配置→不鉴权（仅本机/内网） |
| `COLLECT_RATE_LIMIT` / `COLLECT_RATE_WINDOW_MS` | 采集 / 词典接口每 IP 限流次数与窗口 | `30` 次 / `60000` ms |
| `COLLECT_TRUSTED_IP_HEADER` | 仅在可信边缘（Cloudflare / EdgeOne / Nginx）之后设置，如 `cf-connecting-ip` | 未配置→不信任任何代理头 |
| `NEXT_PUBLIC_SITE_URL` | 覆盖 `metadataBase` 绝对地址 | `https://tanox.github.io/GitHub_Chinese` |
| `NEXT_PUBLIC_BUILD_ID` | 构建时自动注入的 `yymmddhhmm`（10 位）build 编号，页脚按 `V<版本>· build <编号>` 展示 | 缺失→`createBuildId()` 即时生成 |

---

## 2. 命令速查

下表镜像 `package.json` 的 `scripts`（权威源），**不得使用表中不存在的命令**。

| 命令 | 作用 |
|------|------|
| `npm ci` | 按锁文件安装依赖，并触发 `prepare` 安装 Husky 钩子 |
| `npm run dev` | 启动 Next.js 工作台开发服务器 |
| `npm run build` / `build:web` | 构建 Next.js 工作台（`next build`） |
| `npm run build:userscript` | 构建用户脚本 → `build/GitHub_zh-cn.user.js`（须纳入版本控制） |
| `npm run start` | 启动已构建的 Next.js 生产服务 |
| `npm run lint` / `lint:fix` | ESLint 检查 / 自动修复（`src/ scripts/ tests/ server/`） |
| `npm run lint:length` | 行数门禁：所有 js/cjs/mjs/ts/tsx/css 文件 ≤ 200 行 |
| `npm run typecheck` | `tsc --noEmit -p tsconfig.json`（strict 模式） |
| `npm run format` / `format:check` | Prettier 格式化 / 格式校验 |
| `npm run test:unit` | `node --test`，运行 `tests/` 全部单测（含 a11y 与产物冒烟） |
| `npm run test:integration` | 真实启动 Next 服务，对 API 路由做 HTTP 断言 |
| `npm run validate` | 产物校验：存在性 / 体积 / UserScript 元数据 / 版本号 / JS 语法（`tests/smoke.test.cjs`） |
| `npm test` | 质量流水线：`lint` → `lint:length` → `build` → `test:unit` |
| `npm run dict:collect -- <文件>` | 从文本文件采集待翻译词条 |
| `npm run collect-service` | 启动独立采集服务 |
| `npm run clean` | 清理 `build/` `dist/` `coverage/` `.next/` |
| `npm run prepare` | 由 `npm ci` 自动调用（husky），一般不手工执行 |

> 发布前建议额外跑：`npm run typecheck`、`npm run format:check`、`npm run test:integration`、`npm run validate`、`npm run build:userscript`。

---

## 3. 分支管理

### 3.1 分支清单

| 分支 | 用途 | 规则 |
|------|------|------|
| `main` | 唯一稳定发布分支 | 禁止直接 push；必须经 PR + 1 个 approval + CI 全绿后合并 |
| `develop` | 可选集成分支 | CI 的 push 触发包含它；未启用时无需创建，不得绕过 `main` 保护 |
| `feature/<描述>` | 新功能 | 从 `main`（或启用 `develop` 时从其）创建 |
| `fix/<描述>` | 缺陷修复 | 同上 |
| `refactor/<描述>` | 重构 | 同上 |
| `docs/<描述>` | 文档变更 | 同上 |
| `test/<描述>` / `chore/<描述>` | 测试 / 构建与依赖 | 同上 |
| `hotfix/<描述>` | 紧急生产修复 | 从 `main` 创建，修复后优先 PR 回 `main` |

分支名一律**小写 kebab-case**，禁止中文、下划线与大写。示例：`feature/add-projects-translation`、`fix/dropdown-menu-translation`。

### 3.2 工作流

```
feature/* ──PR──▶ main（或 develop ──PR──▶ main）
    ▲                 │
    │                 ├─ push main      → CI 全量 + 部署 Pages + 全绿自动发布 Release
    └─ 从 main 创建    ├─ push tag v*    → CI 全量 + 发布 Release（版本须与单一版本源一致）
                      └─ PR 到 main     → CI 全量（不含发布/部署）
```

步骤：
1. 从 `main` 创建功能分支；
2. 在分支上开发并提交（遵循 §4）；
3. 本地跑 `npm test`，必要时补跑 §2 的附加命令；
4. 推送分支，创建 PR 到 `main`，填写 `.github/pull_request_template.md`；
5. 通过 §5 审查与 §6 CI 后，以 **merge commit** 合并（保留提交历史，不做 squash，便于快速回滚）；
6. 删除已合并的功能分支。

---

## 4. 提交信息格式

采用 [Conventional Commits](https://www.conventionalcommits.org/)，**scope 可选**：

```
<type>(<scope>): <description>

[可选正文]

[可选页脚]
```

### 4.1 type（小写，固定 11 类）

| type | 用途 |
|------|------|
| `feat` | 新功能 |
| `fix` | 缺陷修复 |
| `docs` | 文档更新 |
| `style` | 代码风格 / 格式调整（不影响功能） |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建 / 依赖 / 配置变更 |
| `ci` | CI/CD 配置变更 |
| `build` | 构建系统相关变更 |
| `revert` | 回滚提交 |

### 4.2 其余字段

- `scope`：可选，kebab-case，标识模块，如 `userscript`、`translation-core`、`dictionaries`、`collector`、`api-guard`、`docs`。**不得使用 camelCase**。
- `description`：中文、动词开头、≤ 50 字符、无句号结尾。
- 正文：每行 ≤ 72 字符，说明变更原因与影响。
- 页脚：引用 issue（`Closes #123`）、标注破坏性变更，并注明版本号（如 `Version: v1.13.24`）。

### 4.3 示例

```
fix: 修复 SSE 连发请求时按钮提前解锁

旧请求被新请求中断后仍会重置 isProcessing，
导致采集按钮在流未结束时可再次点击。
仅当请求仍是当前活动请求时才解锁。

Closes #123
Version: v1.13.22
```

> `CHANGELOG.md` 小节标题使用 `### Added / Fixed / Changed` 等首字母大写形式（Keep a Changelog 惯例），与提交信息的小写 `type` 用途不同，不冲突。

### 4.4 Git 钩子

`.husky/pre-commit` 执行 `npx lint-staged`：对暂存的 `*.{js,cjs,mjs,ts,tsx}` 依次运行 `eslint --fix` 与 `prettier --write`（配置见 `package.json` 的 `lint-staged`）。钩子失败则提交中止。跳过钩子须在 PR 中说明理由，且 CI 仍会校验格式。

---

## 5. 代码审查流程

细则见 [code-review/PROCESS.md](./code-review/PROCESS.md) 与 [CHECKLIST.md](./code-review/CHECKLIST.md)；本节给出必须遵守的硬性要求。

| 角色 | 职责 |
|------|------|
| Author | 自检清单、跑通 §2 门禁、填写 PR 描述、及时回应评论 |
| Reviewer | 依据 [STANDARDS.md](./code-review/STANDARDS.md) 判定问题，按严重级别标注 |
| Maintainer | 合并、处理争议、维护 `CODEOWNERS` 与分支保护 |

- 所有改动经 PR 进入 `main`；至少 **1 个 approval**；`CODEOWNERS` 默认分配 `@sutandkb`。
- CI 全绿是合并前置条件；审查意见未闭环不得合并。
- 审查响应 SLA：工作日 1 个工作日内首次回应；紧急 `hotfix/*` 优先。
- 合并方式：merge commit（不 squash、不 rebase 已推送分支）。
- PR 描述结构以 `.github/pull_request_template.md` 为准，不在其他文档复制模板。

---

## 6. 质量门禁与 CI

### 6.1 本地质量流水线

`npm test` = `npm run lint` → `npm run lint:length` → `npm run build` → `npm run test:unit`。四步全部通过方可提交 PR。

### 6.2 CI 流水线（`.github/workflows/ci-cd.yml`）

触发条件：`push` 到 `main` / `develop`、推送 `v*` tag、`pull_request` 到 `main`。同一 ref 并发取消在途作业。

| 作业 | 依赖 | 内容 |
|------|------|------|
| `lint` | — | `lint`、`format:check`、`lint:length`、`typecheck` |
| `build` | `lint` | `next build` → `build:userscript` → `test:unit` → `validate` → 上传用户脚本产物 |
| `integration` | `lint` | `build:web` → `test:integration`（真实启动 Next 服务） |
| `security` | `lint` | `npm audit --audit-level=high` |
| `release` | `build`+`integration`+`security` | **自动发布**：`push main` 且三个检查作业全绿后自动创建 GitHub Release；`push v*` tag 亦可触发（版本须与单一版本源一致） |
| `deploy-pages` | 同上 | 仅 `push main`：部署仓库内容到 GitHub Pages |
| `notify` | 同上 | 汇总前三个作业结果，任一失败即报错 |

- 所有作业固定 Node `22`。
- **自动发布**：`release` 作业不依赖手动打 tag——推送到 `main` 且 `build` / `integration` / `security` 全部成功后自动发布。版本号取自单一版本源（`package.json` 的 `version`，并校验与 CHANGELOG 顶部一致）；发布时在当前 commit 自动创建 `v<版本号>` tag 并上传用户脚本产物与发布包（`GitHub_zh-cn_v<版本号>.zip`）。
- **幂等护栏**：`release` 作业以「`v<版本号>` tag 是否已存在」判断该版本是否已发布——已存在则整体跳过。因此**重新触发不会重复发布**；要发布新内容必须按 §8 升级版本号。tag push 时若与 `package.json` 版本不一致直接失败。
- **发布并发安全**：`release` 作业使用独立并发组（`release-<ref>`，不取消在途作业、排队执行），连续推送 `main` 时不会因取消而丢失发布。
- 手工在 GitHub 上创建 Release 不会触发本工作流，也不受其管理，禁止手工创建。
- 产物校验由 `npm run validate` 执行（复用 `tests/smoke.test.cjs`）；`build` 作业先构建用户脚本再校验、上传，不依赖仓库里已提交的产物。

---

## 7. 测试规范

### 7.1 框架与位置

- 框架：Node 内置 `node:test` + `node:assert/strict`（`npm run test:unit`），**不用 Jest**。
- 位置：统一放在仓库根 `tests/`，不设 `__tests__/` 目录。

| 路径 | 用途 | 命名 |
|------|------|------|
| `tests/*.test.mjs` | ESM 单元测试 | `<模块名>.test.mjs` |
| `tests/*.test.cjs` | CommonJS 单元测试 | `<模块名>.test.cjs` |
| `tests/integration/` | 集成测试（真实 HTTP） | `*.integration.mjs` |
| `tests/helpers/` | 测试辅助（如 axe 封装） | 不以 `.test.` 开头 |
| `tests/a11y.test.mjs` | 原型无障碍断言（axe-core，无 serious/critical 违规） | 固定名 |
| `tests/smoke.test.cjs` | 用户脚本产物冒烟校验 | 固定名 |

### 7.2 编写要求

- 用 `test()`（或 `describe()` / `it()`）组织，描述清晰说明被测行为（中英文均可，同一文件内保持一致）。
- 每个用例独立；用 `beforeEach` / `afterEach` 或 `t.after()` 清理；Mock 外部依赖，禁止真实网络与真实浏览器进入单测。
- 新增核心逻辑须配套用例；词典数据文件与 UI 展示组件不强求单测。
- 断言边界输入：`null` / `undefined` / 空数组 / 非法 JSON / 畸形数组元素。
- 当前**未设置覆盖率门禁**；不得在文档中声称「发布前覆盖率达标」。

### 7.3 合并前

`npm test` + `npm run typecheck` + `npm run format:check` 通过；涉及 API 路由时再跑 `npm run test:integration`。CI 全绿方可合并。

---

## 8. 版本发布流程

### 8.1 版本语义（SemVer）

`MAJOR.MINOR.PATCH`：不兼容变更 → MAJOR；向后兼容新增 → MINOR；修复 / 文档 / 重构 / 样式 / 配置 → PATCH。每次改动至少 bump 一次 PATCH。

### 8.2 版本同步清单

单一版本源是 `src/userscript/version.js` 的 `VERSION`。发版时必须逐项核对：

1. `src/userscript/version.js`（`VERSION` 与文件头 `@version`）；
2. `package.json` 与 `package-lock.json` 的 `version`；
3. `README.md`、`docs/*.md` 顶部「适用版本」行；
4. `prototype/*.html` 的标题 / 品牌 / 页脚 / 文件头展示位；
5. `CHANGELOG.md` 新增对应版本小节；
6. 代码文件头 `@version`：**仅更新本次实际改动的文件**，未改动文件保持原值，禁止全仓库批量刷写；
7. 重建用户脚本产物：`npm run build:userscript`（产物须纳入版本控制）。

`CHANGELOG.md` 中的历史版本号属于历史记录，不得改写；示例文本与占位符 `vX.Y.Z` 不参与批量替换。

### 8.3 CHANGELOG 小节格式

```markdown
## [1.13.24] - 2026-11-04

### Added
- 新增能力

### Fixed
- 修复项

### Changed
- 行为变更

---
```

### 8.4 发布步骤

发布为**全自动**：`main` 分支 CI 全绿后自动创建 GitHub Release，无需手动打 tag。

1. 确认 `main` 为最新，`npm test` 与 §2 附加命令全部通过；
2. 按 §8.2 同步版本、写 CHANGELOG、重建产物并提交（提交信息页脚注明版本号）；
3. 推送 `main`；CI 自动全量检查并部署 Pages；
4. `build` / `integration` / `security` 三个作业全部成功后，`release` 作业自动执行：校验版本一致性 → 幂等护栏（tag 已存在则跳过）→ 构建产物 → 抽取 Release Notes → 创建 `v<版本号>` tag 与 GitHub Release；
5. 发布失败时，修复后重新推送 `main` 即可重试（版本未发布过会再次进入发布流程）。

---

## 9. 文档同步义务

改动下列内容时必须同步对应文档（权威来源见 [docs/README.md](./README.md)）：

| 改动 | 必须同步 |
|------|----------|
| npm 脚本、依赖、Node 版本 | 本文 §1、§2；`README.md` 命令表 |
| 目录结构、模块迁移 | `project.md`、`architecture.md`、本文 §2 |
| API 路由、环境变量 | `architecture.md`、`README.md`、本文 §1 |
| 分支 / 提交 / 审查 / CI | 本文 §3–§6、`.github/` 模板 |
| 编码风格、命名、行数门禁 | `coding-style.md` |
| 原型页面、设计令牌 | `prototype.md` + `prototype/*.html` |
| 任何改动 | `CHANGELOG.md` 新小节；任务状态变化同步 `tasks.md` |

数据型描述（用例数、文件数、产物体积、lint 错误数）须实跑后填写，或标注「以 vX.Y.Z 实测为准」。

---

## 相关文档

- [docs/README.md](./README.md) — 文档索引、SSOT 与术语表
- [coding-style.md](./coding-style.md) — 编码风格与命名
- [architecture.md](./architecture.md) — 架构设计
- [project.md](./project.md) — 项目结构与指标
- [code-review/PROCESS.md](./code-review/PROCESS.md) — 审查流程细则
- [../CONTRIBUTING.md](../CONTRIBUTING.md) — 贡献入口
