## 改动描述 (Description)

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

## 测试计划 (Testing Plan)

### 测试步骤 (Test Steps)

1.
2.
3.

### 预期结果 (Expected Result)

<!-- 描述预期的行为 -->

### 实际结果 (Actual Result)

<!-- 描述实际的测试结果，可以附上截图 -->

---

## 截图/录屏 (Screenshots/Demo)

<!-- 如果涉及 UI 改动，请提供截图或录屏 -->

| Before | After |
|--------|-------|
| <!-- 截图 --> | <!-- 截图 --> |

---

## 作者自检清单 (Author Checklist)

### 质量门禁

- [ ] `npm test` 全流水线通过（lint → 行数门禁 → 构建 → 单测）
- [ ] `npm run typecheck` 与 `npm run format:check` 通过
- [ ] 无遗留 `console.log` / `debugger`，无硬编码敏感信息

### 功能与测试

- [ ] 已实现 PR 描述中的全部改动，并处理边缘情况（null / undefined / 空数组 / 非法 JSON）
- [ ] 新增核心逻辑配套了 `tests/*.test.mjs` / `*.test.cjs` 用例；Bug 修复附带回归测试

### 文档与版本

- [ ] 公开行为 / 命令 / 目录 / API / 环境变量的改动已同步对应 SSOT 文档（见 [docs/README.md](docs/README.md)）
- [ ] 发版改动已按 [development.md §8](docs/development.md) 同步版本号与 CHANGELOG

> 完整审查清单见 [docs/code-review/CHECKLIST.md](docs/code-review/CHECKLIST.md)；编码规范见 [docs/coding-style.md](docs/coding-style.md)。

---

## 相关问题 (Related Issues)

<!-- 关联相关的 Issue，如 Fixes #123, Closes #456 -->

Fixes #
Related to #

---

## 其他说明 (Additional Notes)

<!-- 任何其他需要审查者注意的信息 -->

---

## 审查者 (Reviewers)

<!-- 由 CODEOWNERS 自动分配；如需补充请 @ 相关成员 -->

@
