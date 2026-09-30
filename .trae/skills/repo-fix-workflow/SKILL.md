---
name: repo-fix-workflow
description: GitHub_Chinese 仓库的缺陷修复标准流程——复现定位、最小修复、补回归测试、版本与 CHANGELOG 及用户脚本产物同步、全量门禁验证、规范提交。当用户要求修复 bug、报错、测试失败、坏 require/import、接口不工作或审查发现的问题时使用。不适用于新功能开发、纯重构或无需改代码的咨询。
---

# 仓库缺陷修复工作流

在本仓库（GitHub_Chinese，Windows + PowerShell）修复任何缺陷时，严格按以下六步执行。这套流程来自多轮真实修复，目的是让每个修复都「可复现、不扩面、有回归、版本齐、门禁绿、可追溯」。

## 1. 复现与定位（先证据，后改动）

1. 读相关源码与调用方，用 `git log --oneline -5`、`git status --short` 了解当前版本与工作区状态。
2. 能跑测试就先跑测试拿到红灯证据：`npm run test:unit 2>&1 | Select-String -Pattern "tests |pass |fail "`，再看具体失败栈。
3. 路径/模块类问题必须用真实文件系统核对：读目标文件确认存在，再用 Node 实测加载，例如：
   - ESM：`node -e "import('./src/lib/xxx.js').then(m=>console.log('OK')).catch(e=>{console.error(e.message);process.exit(1)})"`
   - CJS：`node -e "require('./scripts/xxx.cjs'); console.log('OK')"`
4. 顺带用 Grep 排查同类残留（如迁移后的旧路径、绕过新门面的 console.log），但只记录、不顺手扩大修复范围。
5. 根因未证实前不要改代码；不要用「试几个路径直到不报错」的方式。

## 2. 最小修复

- 只改与根因直接相关的代码；结构问题优先「单点收敛」（如请求体只在路由层读一次、共用逻辑抽到唯一位置），不要在多个分支复制补丁。
- 不趁修复重构无关代码；发现的额外问题列入结尾报告，交用户决定是否处理。
- 被修改文件的文件头 JSDoc 注释必须同步：`@version`（新版本号）、`@date`（当天）、缺什么补什么（`@file` 为仓库根相对路径、`@author Sut`、`@description`）。新文件必须有完整头注释。

## 3. 补回归测试

- 测试位于 `tests/`，命名 `xxx.test.mjs`（Node ESM）或 `xxx.test.cjs`（CommonJS 脚本用），运行器是 `node:test` + `node:assert/strict`（不是 Jest，package.json 里的 jest globals 仅为兼容声明）。
- 断言必须是真实值断言（状态码、返回内容、调用次数），不要只断言「不抛错」。
- 被测模块在加载期读取环境变量时，用「临时改 env + 查询串缓存失效 + finally 还原」加载独立实例；Node 22+ 可直接 import `.ts`（原生类型擦除），参见 `tests/api-guard.test.mjs`、`tests/collect-service-client.test.mjs` 的写法。
- 核心修复点必须有一条「修复前会失败、修复后通过」的回归用例。
- 单文件不超过 200 行。

## 4. 版本与变更记录同步（SemVer，原子完成）

版本单一来源是 `src/version.js` 的 `VERSION` 常量。一次修复升 PATCH（如 1.12.12 → 1.12.13）；新功能升 MINOR。以下位置必须在同一次改动中全部改完：

1. `src/version.js`：`@version`/`@date` 头注释 + `VERSION` 常量（两处）
2. `package.json`：顶层 `"version"`
3. `README.md`：「当前版本：vX.Y.Z」行
4. 所有本次实际改动的代码文件头 `@version`
5. `CHANGELOG.md`：在文件顶部新增 `## [X.Y.Z] - 日期` 小节，类型用 `### Fix（一句话主题）`，条目写清根因、改法、影响面与新增测试；只陈述事实
6. 重建用户脚本产物：`npm run build:userscript`（产物 `build/GitHub_zh-cn.user.js` 必须包含新版本号，否则 smoke 测试会红）

注意：`docs/PROGRESS.md` 不再维护版本表，变更历史以 CHANGELOG.md 为唯一归处，不要去改它。

## 5. 全量门禁验证（全部通过才算完成）

按顺序执行，任一红灯先修再继续：

```powershell
npx prettier --check <本次改动的文件>
npm run lint            # 要求 0 error；既有 warning 可留但不得新增
npm run lint:length     # 全部代码文件 ≤ 200 行
npm run typecheck       # tsc --noEmit
npm run build:userscript
npm run test:unit       # 期望 fail 0（当前有 1 个 skip 属正常）
npm run validate        # 用户脚本产物校验
```

PowerShell 不支持 `&&`，用 `;` 分隔；不要用 bash heredoc。

## 6. 精确提交

- 用户偏好：每次修复完成后都要提交，保持仓库同步。
- 提交前再次 `git status --short` 与 `git log --oneline -3`——本仓库可能存在并行流程的自动提交。只 stage 本次改动涉及的文件（逐个列路径），**禁止 `git add -A`/`git add .`**，避免把并行改动裹进来。
- Commit message 遵循 Conventional Commits：

  ```
  fix: 动词开头的简述（≤50 字符，无句号）

  - 正文每行 ≤72 字符，说明根因与改法
  - 说明影响面与测试
  ```

  类型：`fix` 缺陷 / `feat` 功能 / `chore` 构建依赖配置 / `refactor` 重构 / `test` 测试 / `docs` 文档 / `style` 格式 / `perf` 性能 / `ci` 流水线。
- PowerShell 下多行正文用多个 `-m` 参数（每个 `-m` 成为一段），不要用 `<<'EOF'` heredoc。
- 提交后跑 `git log --oneline -2` 与 `git status --short` 确认提交成功、工作树干净。

## 完成后的汇报

向用户汇报：根因（带文件链接）、改法、验证结果表格（测试数/通过/失败、各门禁状态）、版本号与提交 SHA，以及修复中发现但未处理的遗留项。
