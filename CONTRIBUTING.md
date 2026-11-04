# 贡献指南

感谢您对 GitHub Chinese 简体中文项目的关注！本文是贡献入口；**所有规范正文以 `docs/` 为唯一权威来源**，本文不重复定义，只做导航。

## 行为准则

- 保持友善和尊重，接受建设性批评
- 关注对社区最有利的事情，对其他社区成员表示同理心

## 如何贡献

### 报告问题

通过 [GitHub Issues](https://github.com/Tanox/GitHub_Chinese/issues) 提交，使用 [.github/ISSUE_TEMPLATE/bug_report.md](.github/ISSUE_TEMPLATE/bug_report.md) 模板，包含：问题描述、复现步骤、期望 / 实际行为、环境信息（浏览器、Tampermonkey、用户脚本版本、操作系统）与必要截图。

安全漏洞请勿公开提交，按 [.github/SECURITY.md](.github/SECURITY.md) 的流程私下报告。

### 提交功能请求

同样通过 Issues（模板 `.github/ISSUE_TEMPLATE/feature_request.md`），说明功能描述、使用场景与可能的实现思路。

### 提交代码

1. Fork 或克隆本仓库，`npm ci` 安装依赖（自动安装 Git 钩子）
2. 从 `main` 创建功能分支（命名规则见 [docs/development.md](docs/development.md) §3）
3. 开发并提交（提交信息格式见 [docs/development.md](docs/development.md) §4）
4. 本地跑 `npm test` 全绿
5. 推送分支并创建 PR，按 `.github/pull_request_template.md` 填写

## 快速上手

```bash
git clone https://github.com/Tanox/GitHub_Chinese.git
cd GitHub_Chinese
npm ci
npm test        # lint → 行数门禁 → 构建 → 单测
npm run dev     # 启动词典采集工作台 http://localhost:3000
```

环境要求与完整命令表见 [docs/development.md](docs/development.md) §1–§2（权威来源为 `package.json` 的 `scripts`）。

## 代码规范

编码风格、命名约定、目录组织、注释与安全红线的唯一正文是 [docs/coding-style.md](docs/coding-style.md)；要点：

- 命名：目录 / CSS 类 / 语义化 id 用 kebab-case；`src/userscript/`、`src/utils/` 文件用 camelCase；`src/lib/`、`src/app/` 路由与样式文件用 kebab-case；组件 PascalCase；常量 UPPER_SNAKE_CASE
- 格式化：Prettier（2 空格、单引号、分号、多行尾随逗号、行宽 100、LF），配置内嵌于 `package.json`
- 质量约束：单文件 ≤ 200 行（行数门禁）、函数 ≤ 150 有效行、参数 ≤ 5、圈复杂度 ≤ 30（均与 ESLint 配置一致）、禁止 `any` / `var`、必须 `===`、关键逻辑中文注释

## 审查流程

提交 PR 后由 `CODEOWNERS` 分配审查者，首次响应通常在 1 个工作日内；按审查意见修改并通过 CI 后以 merge commit 合并。角色、SLA 与判定标准见 [docs/code-review/PROCESS.md](docs/code-review/PROCESS.md) 与 [STANDARDS.md](docs/code-review/STANDARDS.md)。合并后改动将随下一个版本发布（发布流程见 [docs/development.md](docs/development.md) §8）。

## 翻译词条贡献

### 词典文件位置

- `src/dictionaries/common.js`（及 `common/` 分片）— 通用翻译
- `src/dictionaries/codespaces.js` — Codespaces 相关
- `src/dictionaries/explore.js` — Explore 页面相关
- 新页面词典经 `src/dictionaries/index.js` 汇总注册

### 添加新词条

1. 找到对应词典文件，遵循文件内既有风格（键为英文原文小写、空格用下划线，值为简体中文）
2. 按字母顺序插入，保持文件行数 ≤ 200 行（超出时拆入 `common/` 分片）
3. 更新 `docs/CHANGELOG.md` 与词典覆盖相关文档

```javascript
export const commonDictionary = {
  // ... 已有词条
  pull_requests: '拉取请求',
  new_feature: '新功能', // 新增词条
};
```

### 翻译原则

- 保持 GitHub 官方中文文档的术语一致性，优先使用技术社区通用译法
- 简洁，避免过长翻译；专有名词（GitHub、Git 等）保持原文

常用术语对照：Repository 仓库、Pull Request 拉取请求、Issue 议题、Commit 提交、Branch 分支、Fork 复刻、Star 星标、Watch 关注、Wiki 维基、Milestone 里程碑、Label 标签。

## 获取帮助

- 查看 [GitHub Issues](https://github.com/Tanox/GitHub_Chinese/issues) 是否有类似问题，或创建新 Issue
- 文档入口：[docs/README.md](docs/README.md)（文档地图、术语表、权威来源分工）
- 支持渠道与联系方式见 [.github/SUPPORT.md](.github/SUPPORT.md)

## 许可证

通过贡献代码，您同意您的贡献将在 [GPL-2.0](LICENSE) 许可证下发布。
