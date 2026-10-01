# 代码审查流程规范 (Code Review Process)

> **版本**: 1.0.0
> **更新日期**: 2026-09-30
> **维护者**: 技术团队

---

## 📋 目录

1. [流程概述](#流程概述)
2. [角色与职责](#角色与职责)
3. [详细流程](#详细流程)
4. [审查者分配规则](#审查者分配规则)
5. [批准与合并标准](#批准与合并标准)
6. [争议解决机制](#争议解决机制)
7. [紧急修复流程](#紧急修复流程)
8. [工具配置](#工具配置)

---

## 🔄 流程概述

### 整体流程图

```
开发者提交 PR
    ↓
自动检查 (CI/Lint/Test)
    ↓
分配审查者
    ↓
代码审查 (Reviewer)
    ↓
[有问题?] ──Yes──> 作者修改代码 ──> 重新审查
    ↓ No
批准合并
    ↓
自动/手动合并到主分支
```

---

## 👥 角色与职责

### 1. 代码作者 (Author)

**主要职责**:
- 编写高质量代码
- 提交前自行审查
- 编写清晰的 PR 描述
- 及时响应审查意见

**提交前自检清单**:
```bash
# 1. 代码风格检查
npm run lint

# 2. 代码格式化
npm run format

# 3. 构建检查
npm run build

# 4. 完整测试
npm run test
```

**PR 描述模板**:
```markdown
## 改动目的
<!-- 为什么需要这个改动？解决了什么问题？ -->

## 实现方式
<!-- 简要说明如何实现 -->

## 测试计划
<!-- 如何测试这个改动？ -->

## 截图/录屏
<!-- 如果涉及 UI 改动，提供截图 -->

## 相关问题
<!-- 关联的 Issue 编号，如 Fixes #123 -->
```

---

### 2. 审查者 (Reviewer)

**主要职责**:
- 全面审查代码质量
- 提供建设性反馈
- 判断是否批准合并
- 确保知识传递

**审查时间要求**:
- 普通 PR: 2 个工作日内
- 紧急 PR: 4 小时内
- 周末/假期: 可协商

**审查者资格**:
- 熟悉相关代码模块
- 或是有经验的团队成员
- 新成员需要在资深成员指导下审查

---

### 3. 团队 Lead / Maintainer

**主要职责**:
- 最终批准重要改动
- 解决审查争议
- 维护审查标准
- 持续改进流程

---

## 📝 详细流程

### Step 1: 开发者提交 PR

#### 1.1 创建功能分支

```bash
# 从主分支创建新分支
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

**分支命名规范**:
- 新功能: `feature/功能描述`
- Bug 修复: `fix/问题描述`
- 重构: `refactor/模块名`
- 文档: `docs/描述`

#### 1.2 编写代码并提交

```bash
# 编写代码...

# 提交前自检
npm run test

# 提交代码（使用规范的 commit message）
git add .
git commit -m "feat: 添加 XXX 功能"
```

**Commit Message 规范**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**:
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例**:
```bash
feat(translation): 添加批量翻译功能

- 实现批量翻译核心逻辑
- 添加进度显示
- 优化性能，减少 DOM 操作

Fixes #123
```

#### 1.3 推送分支并创建 PR

```bash
git push origin feature/your-feature-name
```

然后在 GitHub 上创建 Pull Request，使用提供的 PR 模板。

---

### Step 2: 自动检查

#### 2.1 CI/CD 自动检查

PR 提交后，自动触发以下检查：

- ✅ **Lint 检查** — ESLint 自动检查代码风格
- ✅ **构建检查** — 确保代码可以正常构建
- ✅ **单元测试** — 运行自动化测试（如果有）
- ✅ **代码覆盖率** — 检查测试覆盖率（如果配置了）

**注意**: 如果任何检查失败，PR 会被 Block，无法合并。

#### 2.2 预提交检查 (可选)

如果配置了 `lint-staged`，每次提交会自动运行：

```json
// package.json
"lint-staged": {
  "*.js": ["eslint --fix", "prettier --write"]
}
```

---

### Step 3: 分配审查者

#### 3.1 自动分配

如果使用 GitHub CODEOWNERS 文件：

```bash
# .github/CODEOWNERS
# 核心模块需要特定人员审查
src/userscript/core/* @reviewer1 @reviewer2
src/userscript/translation-core/* @reviewer3
```

#### 3.2 手动分配

如果未配置自动分配，作者应：

1. 在 PR 中 @ 相关团队成员
2. 或请求团队 Lead 分配审查者

**审查者数量要求**:
- 普通 PR: 至少 1 名审查者
- 重要改动: 至少 2 名审查者
- 核心模块改动: 需要模块负责人审查

---

### Step 4: 代码审查

#### 4.1 审查者收到通知

审查者会通过以下方式收到通知：
- GitHub 邮件通知
- GitHub 桌面通知
- 团队沟通工具（如 Slack、企业微信）

#### 4.2 审查者进行审查

审查者应使用 [STANDARDS.md](./STANDARDS.md) 中的检查清单进行审查。

**审查工具使用**:
- GitHub PR 界面 — 添加行内评论
- GitHub Suggested Changes — 建议具体修改
- GitHub Review 功能 — 提交正式审查意见

**审查意见格式**:
```markdown
🔴 **Blocker: 安全漏洞**
Line 42: 直接使用 innerHTML 可能导致 XSS 攻击。

**建议**: 使用 textContent 或 DOMPurify.sanitize()
```

#### 4.3 提交审查结果

审查者有以下选项：

1. **Approve** — 批准合并（无问题或只有 Nit 级别问题）
2. **Request Changes** — 请求修改（有 Blocker 或 Suggestion 级别问题）
3. **Comment** — 仅评论（不阻止合并，但提供反馈）

---

### Step 5: 作者修改代码

#### 5.1 响应审查意见

作者应：

1. **逐条回应** — 在 GitHub 上回复每条审查意见
2. **说明修改** — 解释如何修复问题
3. **询问澄清** — 如果意见不清晰，礼貌地询问

**回应示例**:
```markdown
> 🔴 这里可能会有 XSS 漏洞

Thanks for catching this! I've fixed it by using `textContent` instead of `innerHTML`. See line 45.
```

#### 5.2 修改代码并推送

```bash
# 根据审查意见修改代码
git add .
git commit -m "fix: 修复 XSS 漏洞，使用 textContent"
git push origin feature/your-feature-name
```

**注意**:
- 不要_force push_（会丢失审查历史）
- 除非是微调，否则不要修改之前的 commit（保持审查历史清晰）

#### 5.3 通知审查者重新审查

在 GitHub PR 中添加评论：

```markdown
@reviewer1 @reviewer2 我已经修复了所有问题，请重新审查。
```

---

### Step 6: 批准与合并

#### 6.1 最终审查

当所有审查者都批准，且所有自动检查通过：

- 作者可以合并（如果有权限）
- 或请求 Maintainer 合并

#### 6.2 合并方式选择

**Merge Commit** (推荐用于重要功能):
- 保留完整的提交历史
- 适合多个 commit 的 PR

**Squash and Merge** (推荐用于小 PR):
- 将多个 commit 合并为一个
- 保持主分支历史整洁

**Rebase and Merge** (谨慎使用):
- 适合个人分支，保持线性历史
- 会修改 commit hash

#### 6.3 合并后清理

```bash
# 删除远程分支（GitHub 可以自动完成）
git push origin --delete feature/your-feature-name

# 删除本地分支
git checkout main
git pull upstream main
git branch -d feature/your-feature-name
```

---

## 👥 审查者分配规则

### 自动分配规则

使用 `.github/CODEOWNERS` 文件：

```bash
# .github/CODEOWNERS

# 默认审查者
* @team-lead

# 核心模块需要核心团队成员审查
/src/userscript/core/* @core-team1 @core-team2
/src/userscript/translation-core/* @translation-team1 @translation-team2

# UI 相关需要前端专家审查
/src/userscript/ui/* @frontend-expert

# 构建脚本需要 DevOps 审查
/build.* @devops-team
```

### 手动分配建议

如果没有配置 CODEOWNERS，建议按以下规则分配：

| PR 类型 | 建议审查者 |
|---------|-----------|
| 新功能 | 熟悉相关模块的开发者 + 1 名其他团队成员 |
| Bug 修复 | Bug 发现者或相关模块负责人 |
| 重构 | 被重构模块的负责人 + 架构师 |
| 性能优化 | 性能专家或相关模块负责人 |
| 文档更新 | 1 名团队成员（快速审查） |

---

## ✅ 批准与合并标准

### 必须全部满足

- ✅ 所有自动检查通过（CI/Lint/Test）
- ✅ 至少 1 名审查者批准（或根据 CODEOWNERS 要求）
- ✅ 所有 🔴 Blocker 问题已修复
- ✅ 所有 🟡 Suggestion 问题已讨论并达成一致

### 可以合并的情况

- ✅ 只有 💭 Nit 级别问题（作者和审查者协商一致）
- ✅ 有 🟡 Suggestion 问题，但记录为 Tech Debt，后续修复

### 不能合并的情况

- ❌ 有未修复的 🔴 Blocker 问题
- ❌ 自动检查失败
- ❌ 审查者要求修改但未修改
- ❌ PR 描述不清晰，无法判断改动目的

---

## 🤝 争议解决机制

### 场景 1: 作者和审查者意见不一致

**解决步骤**:

1. **友好讨论** — 在 PR 中公开讨论，说明理由
2. **寻求第三方意见** — 请另一位团队成员发表意见
3. **团队 Lead 仲裁** — 如果仍无法达成一致，由 Lead 做最终决定

**讨论示例**:
```markdown
@reviewer1 我理解你的担心，但我认为当前的实现更适合这个场景，原因是：

1. 性能更好（减少了一次循环）
2. 代码更简洁

当然，如果你认为可读性更重要，我可以重构为两个函数。
```

### 场景 2: 审查者长时间未响应

**解决步骤**:

1. **友好提醒** — 在 PR 中 @ 审查者，询问进度
2. **等待 24-48 小时** — 给审查者足够时间
3. **请求其他审查者** — 如果仍无响应，请求其他团队成员审查
4. **上报 Lead** — 如果阻塞重要功能，请 Lead 介入

### 场景 3: 紧急 PR 需要快速审查

**解决步骤**:

1. **标记紧急** — 在 PR 标题中添加 `[URGENT]` 标记
2. **通知审查者** — 通过即时通讯工具通知审查者
3. **简化审查** — 只检查 Blocker 级别问题，Suggestion 可以后续优化

---

## 🚨 紧急修复流程

### 定义

紧急修复（Hotfix）是指需要立即合并到生产环境的修复，如：

- 生产环境 Bug
- 安全漏洞
- 严重性能问题

### 流程

1. **从生产分支创建 Hotfix 分支**
   ```bash
   git checkout main
   git checkout -b hotfix/critical-bug-fix
   ```

2. **快速修复并提交**
   ```bash
   # 快速修复...
   git add .
   git commit -m "hotfix: 修复严重的 XXX 问题"
   ```

3. **简化审查** — 只检查 Blocker 问题

4. **快速合并** — 批准后立即合并

5. **同步到开发分支** — 确保修复也应用到开发分支

---

## 🛠️ 工具配置

### GitHub 配置

#### 1. 分支保护规则

在 GitHub 仓库设置中：

```
Settings > Branches > Add rule

Branch name pattern: main

✅ Require a pull request before merging
  ✅ Require approvals: 1
  ✅ Dismiss stale reviews when new commits are pushed

✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging

✅ Include administrators (可选)
```

#### 2. PR 模板

创建 `.github/pull_request_template.md`，参见 [PR-TEMPLATE.md](./PR-TEMPLATE.md)

#### 3. Issue 模板

创建 `.github/ISSUE_TEMPLATE/`，用于标准化 Issue 提交。

---

### 自动检查配置

#### 1. GitHub Actions 配置示例

创建 `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run lint

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run build
      - run: npm run validate
```

#### 2. Lint-staged 配置

在 `package.json` 中：

```json
"lint-staged": {
  "*.js": ["eslint --fix", "prettier --write"]
}
```

---

## 📊 流程健康度指标

### 跟踪指标

定期（每月/每季度）跟踪以下指标：

1. **平均审查响应时间** — 目标: < 24 小时
2. **平均合并时间** — 目标: < 3 天（非紧急 PR）
3. **审查轮次** — 目标: < 2 轮
4. **Bug 逃逸率** — 目标: < 5%

### 改进措施

如果指标不正常：

- **审查响应慢** — 增加审查者数量，或优化审查流程
- **合并时间长** — 减少 PR 大小，或提高代码质量
- **Bug 逃逸率高** — 加强审查标准，或增加自动化测试

---

## 📚 参考资料

- [GitHub Code Review](https://docs.github.com/en/pull-requests/conducting-a-review)
- [Effective Code Reviews](https://www.developer.com/design/effective-code-reviews/)
- [How to Do Code Reviews Like a Human](https://mtlynch.io/human-code-reviews-1/)

---

## 📝 更新日志

| 版本 | 日期 | 作者 | 变更内容 |
|------|------|------|----------|
| 1.0.0 | 2026-09-30 | - | 初始版本 |

---

**记住**: 代码审查是一个协作过程，目的是提高代码质量和帮助团队成长。保持耐心、友善、专业！ 🤝
