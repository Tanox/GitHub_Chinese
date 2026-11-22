# 代码审查体系配置指南 (Setup Guide)

> 版本：**v1.13.35** ｜ 版本权威源：`src/userscript/version.js`

本文是审查体系**仓库配置的操作手册**（分支保护、CODEOWNERS、模板的启用与排障）。标准与流程正文见 [STANDARDS.md](./STANDARDS.md) 与 [PROCESS.md](./PROCESS.md)。审查体系文件均已提交入库，本文只描述现状与运维操作。

## 体系文件清单

| 文件 | 职责 |
|------|------|
| [STANDARDS.md](./STANDARDS.md) | 审查判定标准：优先级定义、检查清单、意见示例（唯一权威） |
| [PROCESS.md](./PROCESS.md) | 审查角色、流程、SLA、健康度指标（唯一权威） |
| [CHECKLIST.md](./CHECKLIST.md) | 由标准派生的可执行快速清单 |
| `.github/pull_request_template.md` | PR 描述结构（唯一权威） |
| `.github/ISSUE_TEMPLATE/bug_report.md` | Bug 报告模板 |
| `.github/ISSUE_TEMPLATE/feature_request.md` | 功能请求模板 |
| `.github/CODEOWNERS` | 审查者自动分配（唯一权威） |
| `eslint.config.js`（组装 `eslint/rules/*.js`） | 质量与安全规则的自动守护 |

## GitHub 仓库配置

### 1. 分支保护规则（当前生效配置）

仓库 Settings > Branches > `main` 规则：

```
✅ Require a pull request before merging
  ✅ Required number of approvals: 1
  ✅ Dismiss stale reviews when new commits are pushed
  ✅ Require review from Code Owners（已配置 CODEOWNERS）

✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging
  ✅ 状态检查（与 CI 作业一一对应）：
    - lint
    - build
    - integration
    - security

✅ Include administrators（可选，强制管理员也遵守）
```

CI 作业明细见 [development.md §6](../development.md)；工作流唯一权威配置为 `.github/workflows/ci-cd.yml`。

### 2. CODEOWNERS

位置：`.github/CODEOWNERS`（必须在该路径才生效）。默认所有者 `@sutandkb`，按 `src/userscript/`、`src/app/`、`src/lib/`、`scripts/`、`docs/` 等目录显式声明。修改负责人时直接改该文件，文档不复制其内容。

### 3. PR / Issue 模板

- `.github/pull_request_template.md`：PR 创建时自动填充；
- `.github/ISSUE_TEMPLATE/`：`bug_report` / `feature_request` 两个模板。

模板内容如需调整直接修改文件；规范正文一律引用 `docs/` 的 SSOT 文件，不在模板中复制（见 [docs/README.md §2](../README.md)）。

## 新成员上手

1. 阅读 [STANDARDS.md](./STANDARDS.md)（判定标准）与 [PROCESS.md](./PROCESS.md)（流程与 SLA）；
2. 本地执行 `npm ci`（自动安装 Husky 钩子），跑通 `npm test`；
3. 首个 PR 可选一个低风险改动练手，体验模板填写、CODEOWNERS 分配与审查往返；
4. 审查实操中对照 [CHECKLIST.md](./CHECKLIST.md) 逐项检查，使用 🔴 / 🟡 / 💭 标记问题级别。

## 故障排查

### CODEOWNERS 不生效

- 文件必须在 `.github/CODEOWNERS`；
- 语法错误（路径模式或用户名）；
- 分支保护未启用「Require review from Code Owners」。

### PR 模板不显示

- 文件名必须是 `pull_request_template.md`（下划线）；
- 必须位于 `.github/` 目录（或仓库根）。

### ESLint 报错过多

- 查看规则级别：`warn` 不阻塞，`error` 阻塞；
- `npm run lint:fix` 批量自动修复；
- 确需临时豁免时使用行内 `eslint-disable` 并注明原因与期限（不推荐长期使用）。

## 参考

- [GitHub Code Review Features](https://docs.github.com/en/pull-requests/conducting-a-review)
- [ESLint Rules Documentation](https://eslint.org/docs/latest/rules/)
- [About CODEOWNERS](https://docs.github.com/en/repositories/managing-a-repository/customizing-your-repository/about-code-owners)

---

## 更新日志

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0.0 | 2026-09-30 | 初始版本 |
| 1.13.32 | 2026-11-08 | 由「一次性启用叙事」改写为现状配置手册：移除已过时的提交启用步骤与 SLA / 指标数字（改引用 PROCESS.md）；分支保护状态检查统一为 lint / build / integration / security 四个作业；`npm install` 改 `npm ci`；去除装饰性 emoji，横幅格式对齐标准 |
