## 📝 改动描述 (Description)

<!-- 请简要描述这个 PR 的改动内容和目的 -->

### 改动目的 (Why)

<!-- 为什么需要这个改动？解决了什么问题？ -->

### 实现方式 (How)

<!-- 简要说明如何实现这个改动 -->

### 影响范围 (Impact)

- [ ] 仅影响内部实现，不影响用户
- [ ] 影响用户界面
- [ ] 影响核心功能
- [ ] 影响性能
- [ ] 其他: ___________

---

## 🧪 测试计划 (Testing Plan)

### 测试环境 (Test Environment)

- 浏览器: <!-- 如 Chrome 120, Firefox 115 -->
- 系统: <!-- 如 Windows 11, macOS 14 -->
- 测试地址: <!-- 如 https://github.com/xxx -->

### 测试步骤 (Test Steps)

1.
2.
3.

### 预期结果 (Expected Result)

<!-- 描述预期的行为 -->

### 实际结果 (Actual Result)

<!-- 描述实际的测试结果，可以附上截图 -->

---

## 📸 截图/录屏 (Screenshots/Demo)

<!-- 如果涉及 UI 改动，请提供截图或录屏 -->

| Before | After |
|--------|-------|
| <!-- 截图 --> | <!-- 截图 --> |

---

## ✅ 代码审查自检清单 (Author Checklist)

### 代码质量

- [ ] 代码已通过 `npm run lint` 检查
- [ ] 代码已通过 `npm run format` 格式化
- [ ] 代码已通过 `npm run build` 构建检查
- [ ] 没有遗留的 `console.log` 或 `debugger` 语句
- [ ] 没有硬编码的敏感信息（API Key、密码等）

### 功能完整性

- [ ] 已实现 PR 描述中的所有功能
- [ ] 已处理边缘情况（null、undefined、空数组等）
- [ ] 已添加必要的错误处理

### 性能考虑

- [ ] 没有明显的性能问题（如频繁的 DOM 操作、无限循环等）
- [ ] 对于性能敏感的代码，已进行优化

### 可维护性

- [ ] 代码易于理解，必要时添加了注释
- [ ] 变量和函数命名清晰
- [ ] 没有重复代码（或已提取为公共函数）

### 测试

- [ ] 已进行手动测试，功能正常
- [ ] `npm test` 全流水线通过（lint → 行数门禁 → 构建 → 单测）
- [ ] 新增核心逻辑已配套 `tests/*.test.mjs` 或 `*.test.cjs` 用例

### 文档

- [ ] 已更新相关文档（README、注释等）
- [ ] 代码中的注释清晰、准确

---

## 🔗 相关问题 (Related Issues)

<!-- 关联相关的 Issue，如 Fixes #123, Closes #456 -->

Fixes #
Related to #

---

## 📌 其他说明 (Additional Notes)

<!-- 任何其他需要审查者注意的信息 -->

---

## 👥 审查者 (Reviewers)

<!-- 请 @ 相关的审查者 -->

@

---

**PR 创建者检查清单**:

- [ ] PR 标题清晰、准确
- [ ] PR 描述完整
- [ ] 已分配审查者
- [ ] 已添加适当的标签（如 `enhancement`, `bug`, `documentation`）
- [ ] 已关联到相关 Project/Milestone（如果有）
