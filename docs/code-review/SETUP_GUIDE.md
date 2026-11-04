# 代码审查体系设置指南 (Setup Guide)

> **目标**: 帮助团队快速搭建和启用代码审查体系

---

## 📋 已完成的工作

我们已经为你的项目创建了完整的代码审查体系，包括：

### 1. 代码审查标准文档

📄 **文件**: `docs/code-review/STANDARDS.md`

**内容**:
- 审查原则和理念
- 问题优先级定义（🔴 Blocker / 🟡 Suggestion / 💭 Nit）
- 详细检查清单（正确性、安全性、可维护性、性能、测试）
- 项目特定规范（用户脚本特殊考虑）
- 审查意见示例
- 职责划分

**用途**: 所有团队成员应阅读并遵守此标准

---

### 2. 代码审查流程规范

📄 **文件**: `docs/code-review/PROCESS.md`

**内容**:
- 完整的审查流程图
- 详细的步骤说明（提交 PR → 自动检查 → 审查 → 修改 → 批准 → 合并）
- 审查者分配规则
- 批准与合并标准
- 争议解决机制
- 紧急修复流程

**用途**: 规范团队的代码审查工作流程

---

### 3. 快速检查清单

📄 **文件**: `docs/code-review/CHECKLIST.md`

**内容**:
- 打印友好的快速检查清单
- 审查意见模板
- 快速审查技巧
- 不要做的事项

**用途**: 审查者可以快速参考，确保不遗漏重要检查点

---

### 4. PR 模板

📄 **文件**: `.github/pull_request_template.md`

**内容**:
- 改动描述模板
- 测试计划模板
- 作者自检清单
- 相关问题跟踪

**用途**: 当创建 PR 时，GitHub 会自动显示此模板，帮助作者提供完整信息

---

### 5. Issue 模板

📄 **文件**:
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`

**内容**:
- Bug 报告的详细模板（复现步骤、环境信息等）
- 功能请求的详细模板（使用场景、实现建议等）

**用途**: 标准化 Issue 提交，收集必要信息

---

### 6. 自动审查者分配

📄 **文件**: `.github/CODEOWNERS`

**内容**:
- 定义哪些文件需要哪些审查者
- 当 PR 修改匹配的文件时，自动请求审查

**用途**: 确保关键模块有合适的审查者

---

### 7. 增强的 ESLint 配置

📄 **文件**: `eslint.config.js`

**新增规则**:
- ✅ 安全性规则（防止 XSS、代码注入）
- ✅ 正确性规则（防止常见错误）
- ✅ 最佳实践规则（提高代码质量）
- ✅ 代码质量规则（保持代码一致性）

**用途**: 自动捕获常见问题，减少人工审查负担

---

## 🚀 下一步：如何启用代码审查体系

### Step 1: 提交这些文件到仓库

```bash
# 添加所有新文件
git add docs/code-review/
git add .github/
git add eslint.config.js

# 提交
git commit -m "feat: 建立代码审查标准和流程

- 添加代码审查标准文档 (STANDARDS.md)
- 添加代码审查流程规范 (PROCESS.md)
- 添加快速检查清单 (CHECKLIST.md)
- 添加 PR 和 Issue 模板
- 添加 CODEOWNERS 自动审查者分配
- 增强 ESLint 配置，添加更多质量控制规则

详见 docs/code-review/STANDARDS.md"

# 推送到远程仓库（经功能分支 + PR 合并，禁止直推 main）
git checkout -b docs/add-code-review-framework
git push origin docs/add-code-review-framework
```

---

### Step 2: 配置 GitHub 分支保护规则

1. 进入 GitHub 仓库页面
2. 点击 **Settings** > **Branches**
3. 点击 **Add rule**
4. 配置以下规则：

```
Branch name pattern: main

✅ Require a pull request before merging
  ✅ Required number of approvals: 1
  ✅ Dismiss stale reviews when new commits are pushed
  ✅ Require review from Code Owners (如果配置了 CODEOWNERS)

✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging
  ✅ 添加以下状态检查（如果配置了 CI）:
    - lint
    - build
    - test

✅ Include administrators (可选，强制管理员也遵守规则)
```

5. 点击 **Create** 保存规则

---

### Step 3: 确认 GitHub Actions CI

CI 流水线已维护于 `.github/workflows/ci-cd.yml`（唯一权威配置，7 个作业：lint / build / integration / security / release / deploy-pages / notify），本文档不复制 YAML；作业明细见 [development.md §6](../development.md)。

分支保护中应启用的状态检查（与 CI 作业对应）：`lint`、`build`、`integration`、`security`。

---

### Step 4: 团队培训和沟通

#### 4.1 召开团队会议

**议程**:
1. 介绍代码审查的重要性和好处
2. 讲解新的审查标准和流程
3. 演示如何使用 PR 模板和检查清单
4. 讨论和收集反馈
5. 确定实施时间表

#### 4.2 分发文档

- 将 `docs/code-review/` 目录中的文档分享给团队
- 建议在团队 Wiki 或知识库中存档
- 打印 `CHECKLIST.md` 放在办公区域（如果适用）

#### 4.3 试运行

**建议**:
- 先选择 1-2 个非关键 PR 进行试运行
- 收集团队反馈
- 调整流程和规则
- 2 周后再全面推广

---

### Step 5: 测试新配置

#### 5.1 测试 ESLint 配置

```bash
# 安装依赖
npm install

# 运行 lint 检查
npm run lint

# 如果有错误，修复
npm run lint:fix

# 格式化代码
npm run format
```

#### 5.2 测试 PR 模板

1. 创建一个测试分支
   ```bash
   git checkout -b test/code-review-demo
   ```

2. 做一个小改动（如修改 README）
   ```bash
   echo "测试代码审查流程" >> README.md
   git add README.md
   git commit -m "test: 测试代码审查流程"
   git push origin test/code-review-demo
   ```

3. 在 GitHub 上创建 PR
   - 应该看到 PR 模板自动填充
   - 按照模板填写信息
   - 确认 CODEOWNERS 自动分配了审查者

4. 进行测试审查
   - 添加一些测试评论
   - 练习使用 🔴 🟡 💭 标记
   - 测试批准和合并流程

5. 删除测试 PR 和分支

---

## 📊 监控和持续改进

### 跟踪指标

建议每月跟踪以下指标：

1. **审查响应时间**
   - 目标: < 24 小时
   - 跟踪方式: GitHub Insights 或手动记录

2. **平均合并时间**
   - 目标: < 3 天（非紧急 PR）
   - 跟踪方式: GitHub Insights

3. **审查轮次**
   - 目标: < 2 轮
   - 跟踪方式: 手动记录或工具

4. **Bug 逃逸率**
   - 目标: < 5%
   - 定义: 经过审查后仍然遗漏到生产环境的 Bug 比例

### 定期回顾

**频率**: 每季度一次

**议程**:
1. 回顾上述指标
2. 收集团队反馈（匿名调查）
3. 讨论常见问题和痛点
4. 更新审查标准和流程
5. 分享最佳实践案例

---

## 🛠️ 故障排查

### 问题 1: CODEOWNERS 不生效

**可能原因**:
- 文件位置错误（必须在 `.github/CODEOWNERS`）
- 语法错误
- 分支保护规则未启用 "Require review from Code Owners"

**解决方法**:
1. 检查文件位置是否正确
2. 验证语法（参考 GitHub 文档）
3. 在分支保护规则中启用相关选项

---

### 问题 2: PR 模板不显示

**可能原因**:
- 文件位置错误（必须在 `.github/pull_request_template.md`）
- 文件名错误

**解决方法**:
1. 确认文件名是 `pull_request_template.md`（注意是下划线）
2. 确认文件在 `.github/` 目录下

---

### 问题 3: ESLint 报错太多

**可能原因**:
- 新增的规则与现有代码冲突
- 需要逐步迁移

**解决方法**:
1. **逐步启用规则**: 先将新规则设为 `warn`，而不是 `error`
2. **批量修复**: 使用 `npm run lint:fix` 自动修复
3. **使用 eslint-disable**: 在必要时临时禁用规则（但不推荐长期使用）

示例：逐步启用
```javascript
// 在 eslint.config.js 中
'no-alert': 'warn', // 而不是 'error'
```

---

### 问题 4: 团队成员不遵守审查标准

**可能原因**:
- 不熟悉标准
- 认为标准太严格
- 时间压力

**解决方法**:
1. **加强培训**: 定期举办代码审查分享会
2. **以身作则**: Lead 和资深成员率先遵守
3. **工具辅助**: 使用 ESLint、Prettier 等工具自动检查
4. **激励机制**: 表扬遵守标准的团队成员

---

## 📚 参考资料

### 外部资源

- [Google Code Review Guide](https://google.github.io/eng-practices/review/)
- [Effective Code Reviews Without the Pain](https://www.developer.com/design/effective-code-reviews/)
- [GitHub Code Review Features](https://docs.github.com/en/pull-requests/conducting-a-review)
- [ESLint Rules Documentation](https://eslint.org/docs/latest/rules/)

### 项目内部资源

- `docs/code-review/STANDARDS.md` — 审查标准
- `docs/code-review/PROCESS.md` — 审查流程
- `docs/code-review/CHECKLIST.md` — 快速检查清单
- `.github/pull_request_template.md` — PR 模板

---

## ✅ 设置完成检查清单

在完成设置后，请确认：

- [ ] 所有文档已提交到仓库
- [ ] GitHub 分支保护规则已配置
- [ ] CODEOWNERS 文件已测试（创建测试 PR 验证）
- [ ] PR 模板已测试（创建测试 PR 验证）
- [ ] ESLint 配置已测试（`npm run lint` 通过）
- [ ] 团队成员已收到通知和培训
- [ ] 已确定试点 PR 或时间表
- [ ] 已建立指标跟踪机制

---

## 🎉 恭喜！

完成上述步骤后，你的团队就拥有了一套完整的代码审查体系！

**记住**:
- 代码审查是一个持续改进的过程
- 保持耐心和友善
- 关注代码质量，而不是个人
- 定期回顾和优化流程

祝你们的代码审查之旅顺利！🚀
