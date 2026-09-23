# 开发指南（索引）

> 版本：**v1.9.42** ｜ 版本权威源：`src/version.js`
>
> 本文件为索引。开发指南的**唯一权威正文位于 [docs/development.md](../docs/development.md)**，
> 此处不再重复维护正文，以避免同一内容出现两份副本而长期脱节。

## 开发要点速览

### 分支策略

- `main`：稳定发布分支
- `feature/*`：新功能开发
- `fix/*`：缺陷修复

### 提交规范

Conventional Commits：`<type>(<scope>): <description>`

### 质量门禁

```bash
npm run lint      # ESLint，须 0 error
npm run build     # 构建用户脚本
npm run validate  # 校验产物：存在性 / 体积 / 语法 / 未定义引用
npm test          # lint → build → validate
```

Next 工作台类型检查：`node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json`

> 注意：`jest.config.js` / `jest.setup.js` 目前为未启用状态（`jest` 未安装且无测试用例），
> `npm test` 不执行单元测试。

### 发布流程

1. 更新单一版本源 `src/version.js` 的 `VERSION`
2. 同步 `package.json`、`CHANGELOG.md`、`docs/`、`openspec/config.yaml`、`prototype/` 中的版本展示位
3. 运行 `npm test`
4. 重建并提交 `build/GitHub_i18n.user.js`
5. 打 Tag（`git tag v1.9.24`）并推送，触发 CI/CD 产出 Release 资产

> 仅同步**实际改动文件**的头注释版本号，禁止全仓库批量刷写。

---

## 权威正文

| 章节 | 位置 |
|------|------|
| 分支策略 | [docs/development.md §1](../docs/development.md) |
| 语义化提交规范 | [docs/development.md §2](../docs/development.md) |
| 版本发布流程 | [docs/development.md §3](../docs/development.md) |
| 测试要求 | [docs/development.md §4](../docs/development.md) |
| 开发命令速查 | [docs/development.md 附录](../docs/development.md) |
