# 文档索引

> 版本：**v1.13.35** ｜ 版本权威源：`src/userscript/version.js`

`docs/` 是本项目规范文档的**唯一权威正文**（原 `openspec/` 已于 v1.12.1 合并移除，不再维护第二份索引或副本）。

## 1. 规范体系总览

### 1.1 适用范围

本规范体系覆盖仓库内全部**源码、配置、文档与工程流程**：

| 范围 | 适用规范 |
|------|----------|
| `src/`、`server/`、`scripts/`、`tests/` | 编码风格全部章节（[coding-style.md](./coding-style.md)） |
| `prototype/*.html`（自包含静态原型） | §14 语义化 id、§15 页脚展示、§11 可访问性；其余 JS/CSS 规则参照执行 |
| `docs/`、根 `README.md`、`CONTRIBUTING.md`、`.github/` 文档 | 本文件的 SSOT 纪律与 §1.4 文档编写规范 |
| 提交 / 分支 / PR / 审查 / 发版流程 | [development.md](./development.md)、[code-review/](./code-review/) |
| `build/` 产物、`node_modules/`、`.next/`、`.tmp/` 生成内容 | **不适用**（构建或工具生成，不手工编辑） |

### 1.2 约束等级

每条规范标注以下等级；未标注时按「推荐」理解：

| 等级 | 含义 | 违反后果 |
|------|------|----------|
| **强制（MUST）** | 必须遵守，无例外或例外须维护者书面批准 | CI／门禁阻断，或 PR 不予合并 |
| **推荐（SHOULD）** | 默认遵守；确有必要可例外，但须在 PR 说明理由 | 审查意见，不自动阻断 |
| **可选（MAY）** | 工具偏好、示例写法，供参考 | 无 |

### 1.3 优先级（冲突裁决）

同一事项出现多份说法时，按以下顺序取用，**就高不就低**：

1. **安全红线与硬门禁**（`coding-style.md` §17、`package.json` scripts、`scripts/check-file-length.cjs`、ESLint/tsconfig 实况）——配置与代码是最终事实来源；
2. **SSOT 正文**（下表所列权威文件）——规范语义以它为准；
3. **派生清单与模板**（`CHECKLIST.md`、PR / Issue 模板、`tasks-done.md`）——只可引用，不得与 SSOT 冲突；
4. **示例、历史记录与项目记忆**——仅作线索；与仓库内 SSOT 冲突时，以 SSOT 为准并回改线索文件。

> 「文档说 A、代码做 B」时，先改文档（除非代码确有 bug）；「记忆说旧规则、文档说新规则」时，先改记忆。

### 1.4 文档编写规范

| 项 | 约定 |
|----|------|
| 标题层级 | `#` 文档名；`## N. 一级`（数字与标题间一个空格）；`### N.M 二级`；目录统一用无编号的 `## 目录`；不使用五级以上标题 |
| 版本行 | 规范类文档首行引用块：`> 版本：**vX.Y.Z** ｜ 版本权威源：\`src/userscript/version.js\``；任务类追加 `｜ 更新日期：YYYY-MM-DD ｜ 单一来源：...` |
| 章节引用 | 仓库内相对路径 + 章节号，如 `coding-style.md` §15；跨目录须相对跳转（如 `../CHANGELOG.md`） |
| 术语 | 一律使用 §4 统一术语表的标准称谓；旧称仅在历史叙述中括注 |
| 命令 | 使用反引号；命令清单以 `package.json` 的 `scripts` 为唯一事实来源 |
| 代码块 | 标注语言（`bash` / `json` / `javascript` / `markdown` / `html`），示例中版本号用 `vX.Y.Z` 占位 |
| 表格 | 三列以内为佳；表头与分隔行格式统一；单元格内路径与代码用反引号 |
| 数据 | 用例数、文件数、体积等须实跑或实时统计；无法稳定时标注「以 vX.Y.Z 实测为准」，禁止硬编码 |

## 2. 单一权威来源（SSOT）

同一主题只允许在一处定义；其他文档、PR 模板、贡献指南一律引用，不再复制正文。发现冲突时按 §1.3 的优先级裁决，并以本表所列权威文件为准。

| 主题 | 权威文件 | 说明 |
|------|----------|------|
| 项目定位、目录结构、量化指标 | [project.md](./project.md) | 指标以 `/overview` 页服务端实时统计为准 |
| 架构、技术选型、数据流 | [architecture.md](./architecture.md) | 两条交付链路 |
| 编码风格、命名、目录组织、注释、安全红线、临时文件管理 | [coding-style.md](./coding-style.md) | 代码规范的唯一正文；临时文件统一 `.tmp/`（§19） |
| 分支、提交、审查流程、发布、测试、命令表 | [development.md](./development.md) | 流程规范的唯一正文 |
| 原型与页面设计 | [prototype.md](./prototype.md) | 原型文件本身在 `prototype/` |
| 无浏览器采集（自托管服务）部署与接入 | [collect-service.md](./collect-service.md) | 对应任务 W5：自托管 `server/collect-service` 的部署、接口、接入与排查 |
| 活动任务清单 | [tasks.md](./tasks.md) | 唯一任务清单 |
| 已交付任务归档 | [tasks-done.md](./tasks-done.md) | 已交付任务追溯，不维护 |
| 代码审查标准 / 清单 / 流程 / 配置 | [code-review/](./code-review/) | 四个文件分工见下表 |
| 版本变更记录 | [../CHANGELOG.md](../CHANGELOG.md) | 历史记录不可篡改 |
| 项目入口与快速上手 | [../README.md](../README.md) | 面向使用者 |
| 贡献入口 | [../CONTRIBUTING.md](../CONTRIBUTING.md) | 只做导航，不重复规范 |
| npm 命令 | `package.json` 的 `scripts` | 命令表由 [development.md §2](./development.md) 镜像 |
| CI 作业 | `.github/workflows/ci-cd.yml` | 文档只描述，不复制 YAML |
| 审查者分配 | `.github/CODEOWNERS` | 文档只描述，不复制配置 |
| PR 描述结构 | `.github/pull_request_template.md` | 文档只引用 |

### 代码审查模块分工

| 文件 | 职责 |
|------|------|
| [code-review/STANDARDS.md](./code-review/STANDARDS.md) | 审查标准（各类问题的判定依据）——审查语义的唯一权威 |
| [code-review/CHECKLIST.md](./code-review/CHECKLIST.md) | 由标准派生的可执行检查清单 |
| [code-review/PROCESS.md](./code-review/PROCESS.md) | 审查角色、流程、SLA、健康度指标 |
| [code-review/SETUP_GUIDE.md](./code-review/SETUP_GUIDE.md) | 本地环境与仓库配置操作步骤 |

## 3. 文档地图

```
README.md              使用者入口（安装 / 功能 / 结构 / 命令）
CHANGELOG.md           版本变更记录
CONTRIBUTING.md        贡献入口（引用 docs/）
docs/
├── README.md          本索引 + 术语表 + SSOT
├── project.md         项目结构与量化指标
├── architecture.md    架构与技术选型
├── coding-style.md    编码规范
├── development.md     开发流程规范
├── prototype.md       原型与设计
├── tasks.md           活动任务清单
├── tasks-done.md      已交付任务归档
├── collect-service.md 无浏览器采集自托管部署与接入（W5）
├── code-review/       审查标准 / 清单 / 流程 / 配置
├── assets/            文档配图
├── collect-history.json  采集历史数据（由 scripts/collect-history.cjs 写入）
└── untranslated-terms.txt 待翻译词条（由 scripts/collect-dict.cjs 写入）
prototype/             prototype.html / wireframes.html / app.html（自包含静态预览）
.github/               CI、PR / Issue 模板、CODEOWNERS、SECURITY、SUPPORT
```

## 4. 统一术语表

同一概念在所有文档、代码注释、PR 描述中必须使用「标准称谓」；括注内的旧称仅用于解释历史，不得作为主称。

| 标准称谓 | 含义 | 禁止混用 |
|----------|------|----------|
| 用户脚本（Userscript） | `build/GitHub_zh-cn.user.js` 单文件产物，运行于 Tampermonkey 等脚本管理器 | 插件、浏览器扩展、油猴脚本 |
| 词典采集工作台（简称「工作台」） | `src/app` 下的 Next.js 16 App Router 应用 | 采集工具、Next 工作台、字符串采集工作台 |
| 词典 | 中英词条映射数据（`src/dictionaries/`） | 词条字典；「词库」仅为页面专名 |
| 词库管理台 | 专名，指 `/dictionary/manage` 页面 | 不得用来泛指词典数据 |
| 词典助手 | 专名，指 `/dictionary` 页面 | — |
| 脚本注入器（ScriptInjector） | 组件 `src/components/ScriptInjector.tsx` | 「探针组件」 |
| 探针脚本（probe script） | 注入器复制到剪贴板、用于采集 GitHub 文本的代码 | 探针注入、ScriptInjector |
| 覆盖率看板 | 专名，指 `/coverage` 页面 | 覆盖率·缺口看板 |
| 质量流水线 | `npm test`（lint → 行数门禁 → 构建 → 单测） | 完整测试流水线、自动检查 |
| 行数门禁 | `npm run lint:length` | 长度门禁 |
| CI 流水线 | `.github/workflows/ci-cd.yml` 的 7 个作业 | CI/CD（可泛指，但描述步骤时用全称） |
| 单一版本源 | `src/userscript/version.js` 的 `VERSION` | 版本权威源（仅作为同义注释） |

> 大小写与语言：提交信息 `type` 一律小写；`CHANGELOG.md` 小节标题沿用 Keep a Changelog 的 `### Added / Fixed / Changed` 首字母大写形式，二者用途不同，不视为冲突。

## 5. 按任务找文档

| 我要…… | 看哪里 |
|---------|--------|
| 安装并使用用户脚本 | `README.md` §安装说明 |
| 搭建本地开发环境 | `development.md` §1、§2 |
| 新建一个模块 / 决定文件放哪 | `coding-style.md` §2 目录组织 |
| 确认命名、注释、格式 | `coding-style.md` §3–§5 |
| 提交代码 / 起分支名 / 写 PR | `development.md` §3、§4 |
| 发起或执行代码审查 | `code-review/PROCESS.md` + `CHECKLIST.md` |
| 发版、同步版本号 | `development.md` §8 |
| 了解 CI 为什么失败 | `development.md` §6 + `.github/workflows/ci-cd.yml` |
| 查看原型与设计令牌 | `prototype.md` + `prototype/*.html` |
| 部署 / 接入自托管采集服务（无浏览器采集） | `collect-service.md` |
| 查看当前任务 | `tasks.md` |
| 查看已交付任务追溯 | `tasks-done.md` |

## 6. 文档维护义务

1. **改代码必改文档**：改动公开行为、命令、目录、API、环境变量时，同步对应的 SSOT 文件，并在 `CHANGELOG.md` 新增小节。
2. **版本号**：每次发版同步①单一版本源 ②`package.json` ③`package-lock.json` ④`README.md` 与 `docs/*.md` 顶部「适用版本」行 ⑤`prototype/*.html` 展示位 ⑥`CHANGELOG.md`。代码文件头 `@version` 仅更新**本次实际改动**的文件，禁止全仓库批量刷写。
3. **禁止复制规范正文**：新增文档、PR 模板、Issue 模板时引用 SSOT，不复制提交格式、分支策略、命名规则、审查清单。
4. **数据型描述**：「文件数 / 用例数 / 产物体积 / lint 错误数」等须实跑或实时统计后填写，不得凭记忆手写；无法稳定时标注「以 vX.Y.Z 实测为准」。

## 7. 备注

高保真原型统一在 `prototype/` 维护；`docs/` 只保留架构、流程与规范类 Markdown，避免重复。
