# 代码风格规范

> 版本：**v1.13.24** ｜ 版本权威源：`src/userscript/version.js`

本文是**编码风格、命名约定、目录组织、注释、错误处理、日志、React / TypeScript、API 路由、CSS、可访问性与安全红线的唯一权威正文**。数值型约束（行数、参数、复杂度）以 `eslint/rules/*.js` 与 `scripts/check-file-length.cjs` 的实际配置为准，本文如实转述；两者冲突时以配置文件为准并回改本文。流程类规范见 [development.md](./development.md)。

## 目录

- [1. 目录组织](#1-目录组织)
- [2. 命名约定](#2-命名约定)
- [3. 格式化与 Lint](#3-格式化与-lint)
- [4. 注释规范](#4-注释规范)
- [5. import 与模块组织](#5-import-与模块组织)
- [6. 错误处理与日志](#6-错误处理与日志)
- [7. 异步编程](#7-异步编程)
- [8. TypeScript 与 React](#8-typescript-与-react)
- [9. API 路由规范](#9-api-路由规范)
- [10. CSS 组织](#10-css-组织)
- [11. 可访问性](#11-可访问性)
- [12. 性能预算](#12-性能预算)
- [13. 文件行数与拆分](#13-文件行数与拆分)
- [14. 语义化 id](#14-语义化-id)
- [15. 页脚版本信息](#15-页脚版本信息)
- [16. 依赖引入](#16-依赖引入)
- [17. 安全红线](#17-安全红线)
- [18. 工具使用](#18-工具使用)

---

## 1. 目录组织

### 1.1 顶层结构

```
src/                        应用与脚本源码
├── app/                    词典采集工作台（Next.js 16 App Router）
│   ├── api/                API 路由（collect / batch-collect / dictionary/suggest）
│   ├── coverage/           覆盖率看板页
│   ├── dictionary/         词典助手页 + dictionary/manage 词库管理台
│   ├── overview/           量化指标页
│   ├── styles/             工作台样式（模块化 CSS，见 §10）
│   ├── layout.tsx / page.tsx / proxy 级错误与加载文件
│   └── robots.ts / sitemap.ts
├── components/             工作台组件（服务端外壳 + 'use client' 客户端岛）
├── hooks/                  工作台状态 Hook（useCollector 等）
├── lib/                    工作台服务端逻辑（采集核心 / 守卫 / SSE / 指标）
├── dictionaries/           翻译词典数据（common[+common/ 分片]、codespaces、explore）
├── types/                  类型声明（如 puppeteer-core.d.ts）
├── userscript/             用户脚本引擎（见 1.2）
├── utils/                  双端共用工具（string/、tools/ 分片）
└── proxy.ts                安全响应头（Next 16 取代 middleware）
prototype/                  高保真原型（自包含 HTML，内联 JS/CSS，不参与 lint 与构建）
scripts/                    构建依赖图、行数门禁、版本一致性、词典采集工具链（.cjs）
scripts/build/              用户脚本构建器（入口 src/userscript/main/index.js）
server/collect-service/     独立采集服务（自托管 Node 服务）
tests/                      单测（*.test.mjs / *.test.cjs）、integration/、helpers/
build/                      用户脚本构建产物（纳入版本控制）
docs/                       规范文档唯一权威正文
```

### 1.2 用户脚本引擎（src/userscript/）

```
userscript/
├── main/                   入口与生命周期编排（index.js、lifecycle.js）
├── core/                   基础设施（LRU 缓存、错误处理、Trie、虚拟 DOM）
├── translation-core/       翻译核心（词典管理、元素翻译、部分匹配、性能监控）
├── page-monitor/           页面监控（DOM / 路径监听）
├── ui/                     配置面板（configUI/ 拆为 index/store/renderer/bootstrap）
│   └── styles/configUI/    配置面板样式分片
├── config/                 全局配置与配置分片
├── versionChecker/         版本更新检查
├── updateNotification/     更新通知 UI
├── version.js              单一版本源（VERSION）
└── versionUtils.js         版本工具
```

### 1.3 新文件归属

| 要放的东西 | 放哪里 |
|-----------|--------|
| 页面 / 路由 / API | `src/app/<segment>/page.tsx`、`route.ts` |
| 跨页 UI 组件 | `src/components/`（复杂组件再建同名子目录） |
| 客户端状态 Hook | `src/hooks/` |
| 仅服务端业务逻辑 | `src/lib/` |
| 双端通用纯函数 | `src/utils/`（超 200 行拆 `string/`、`tools/` 子目录） |
| 用户脚本功能模块 | `src/userscript/<域>/`，并保证从 `main/index.js` **可达**（构建器按依赖图打包，未被入口引用的模块不会进入产物，如 `src/utils/logger.js`） |
| 词典数据 | `src/dictionaries/` |
| 测试 | `tests/`（见 [development.md §7](./development.md)） |
| 一次性运维脚本 | `scripts/*.cjs`（CommonJS） |

---

## 2. 命名约定

| 对象 | 规则 | 示例 |
|------|------|------|
| 目录 | kebab-case（`src/userscript/` 内历史模块名为 kebab：`translation-core/`、`page-monitor/`） | `collect-service/` |
| `src/userscript/`、`src/utils/` 文件 | camelCase | `dictionaryManager.js`、`domUtils.js` |
| `src/lib/` 文件 | kebab-case | `api-guard.ts`、`sse-stream.ts` |
| `src/app/` 路由与特殊文件 | Next 约定小写 | `page.tsx`、`route.ts`、`layout.tsx`、`not-found.tsx` |
| 组件文件与导出 | PascalCase | `ScriptInjector.tsx`、`DataCenter.tsx` |
| Hook | `use` 前缀 camelCase | `useCollector.ts` |
| 类 / 接口 / 类型 | PascalCase | `ErrorHandler`、`CollectErrorCode` |
| 变量 / 函数 | camelCase，动词开头（get/set/is/has/handle/init…） | `findAllMatches()` |
| 常量 | UPPER_SNAKE_CASE | `MAX_URLS`、`MIN_BUNDLE_SIZE` |
| 布尔值 | `is` / `has` / `can` 前缀 | `isLoaded`、`canProceed` |
| CSS 类 | kebab-case | `.collector-topbar` |
| 语义化 id | kebab-case（见 §14） | `data-center-input` |
| 测试文件 | `<模块名>.test.mjs` / `.test.cjs` | `url-guard.test.mjs` |
| 分支名 | kebab-case（见 development.md §3） | `feature/add-projects-translation` |

私有成员以下划线前缀仅为标识（可选）；ESLint 忽略 `_` 开头的未用变量 / 参数 / 捕获错误。

---

## 3. 格式化与 Lint

### 3.1 Prettier（权威配置内嵌于 `package.json` 的 `"prettier"` 字段，无独立 `.prettierrc`）

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "always",
  "printWidth": 100,
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": true
}
```

### 3.2 ESLint（flat config：`eslint.config.js` 组装 `eslint/rules/{core,bestPractices,quality}.js`）

格式化规则全部交由 Prettier，ESLint 只管质量与安全。关键规则（实际值）：

| 规则 | 级别 | 值 |
|------|------|-----|
| `max-lines-per-function` | warn | **150**（忽略空行与注释） |
| `max-params` | warn | **5** |
| `complexity` | warn | **30** |
| `eqeqeq` | error | `always`，`null` 比较例外 |
| `curly` | error | `multi-line`（**单行 if 允许省略大括号，多行必须加大括号且与条件同行**） |
| `no-var` / `prefer-const` | error | 必须用 `const`，可变的用 `let` |
| `no-debugger` | error | 禁止 |
| `no-console` | warn | 允许 `log` / `warn` / `error`（日志约定见 §6） |
| `no-throw-literal` / `prefer-promise-reject-errors` | error | 只抛 `Error` 对象 |
| `no-return-await` / `no-async-promise-executor` | error | — |
| `no-eval` / `no-implied-eval` / `no-script-url` | error | 防代码注入 |
| `no-unused-vars` | warn | `_` 前缀豁免 |
| `.ts/.tsx` | — | `no-undef` / `no-unused-vars` 等交由 `tsc`（strict）处理 |
| 测试文件 | — | `no-console`、`max-lines-per-function` 关闭 |

> 行数门禁独立于 ESLint：`scripts/check-file-length.cjs`（见 §13）。

### 3.3 代码结构

- 行宽 ≤ 100（Prettier 自动换行）。
- 文件末尾留空行（LF）。
- 函数 / 逻辑块之间留空行。
- 多行结构必须尾随逗号；数组括号内无多余空格。

---

## 4. 注释规范

### 4.1 文件头注释

每个源代码文件必须包含文件头注释（实际项目格式）：

```javascript
/**
 * GitHub Chinese 简体中文主入口
 * @file src/userscript/main/index.js
 * @version 1.13.24
 * @date 2026-11-04
 * @author Sut
 * @description 整合所有模块并初始化脚本
 */
```

> `@version` 仅在文件**实际被改动**时同步为当前发布版本；未改动文件保持原值，**禁止全仓库批量刷写**（发布清单见 [development.md §8](./development.md)）。

### 4.2 函数 / 方法注释

导出函数与复杂函数使用 JSDoc：功能描述、`@param`、`@returns`，必要时 `@throws`。

```javascript
/**
 * 节流函数，用于限制高频操作的执行频率
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 * @param {Object} [options] - 配置项
 * @param {boolean} [options.leading=true] - 是否在开始时执行
 * @returns {Function} 节流后的函数
 */
```

### 4.3 内联注释

- 使用 `//`，注释解释「为什么」而非「做什么」。
- 关键逻辑必须有中文注释；注释与代码之间留一个空格。
- TODO 格式：`// TODO: 描述` 或 `// TODO(作者): 日期 描述`。

---

## 5. import 与模块组织

### 5.1 import 顺序

1. Node 内置模块（`node:fs`、`node:path`…）
2. 第三方依赖（`next`、`react`、`ws`…）
3. 别名导入：工作台 TS/TSX 使用 `@/*`（`tsconfig.json` 的 `paths`，指向 `src/*`）
4. 相对路径导入（`./`、`../`）

分组之间留一个空行；组内按字母序不作强制。

### 5.2 扩展名与边界

- ESM 源码显式写扩展名（`.js` / `.mjs`）；CommonJS 工具脚本（`scripts/*.cjs`）用 `require`。
- **用户脚本侧（`src/userscript/`、`src/utils/`）只用相对路径导入**——构建器从 `src/userscript/main/index.js` 递归解析依赖图，`@/*` 别名在产物中不可用。
- 禁止循环依赖：发现 `a → b → a` 时抽取公共模块下沉到更底层目录。
- 一个文件一个主要功能 / 类；文件内顺序：import → 常量 → 工具函数 → 主功能 → 导出。

---

## 6. 错误处理与日志

### 6.1 错误处理

- 可能抛错的调用必须 `try-catch` 包裹；捕获后要么处理（降级返回 `null` / 默认值 / 兜底 UI），要么**带上上下文重新抛出**，禁止吞错。
- 用户脚本侧统一走 `ErrorHandler.handleError(描述, error, 类型)`（`src/userscript/core/`）。
- 工作台侧捕获 `unknown` 后用 `describeError(error): string` 归一化为消息（见 §8）。
- 错误码集中定义并冻结：`src/lib/collect-codes.js` 的 `CollectErrorCode`（覆盖超时、SSRF、浏览器不可用等关键场景，取值唯一）。
- SSE 链路错误以 `{type:'error', ...}` 事件下发，不中断流；单页失败记错误事件后续跑，不中断整批。
- API 层错误响应返回明确状态码与 JSON 错误体（见 §9）。

### 6.2 日志

- ES Lint 允许 `console.log/warn/error`（warn 级），但**禁止提交调试遗留的 `console.log` 与 `debugger`**（PR 自检项）。
- 正式诊断输出：用户脚本侧带统一前缀（如 `[GitHub Chinese]`）；服务端使用带时间戳与错误码的结构化输出；测试与工具脚本（`.cjs`）不受限。
- **禁止在日志中输出敏感信息**：令牌、Cookie、Authorization 头、完整带凭据 URL。

---

## 7. 异步编程

- 使用 `async/await`，禁止无处理的裸 Promise 链（`require-await` 关闭，但创建后必须消费）。
- `await` 必须 `try-catch` 或由上层统一捕获；Promise executor 内禁止 async（ESLint error）。
- 用户交互触发的请求使用 `AbortController`：组件卸载 / 新请求替换旧请求时 `abort()`，并在 `finally` 中**仅在当前请求仍是活动请求时**复位 loading 状态（防竞态，见 `src/hooks/useCollector.ts`）。
- 外部请求设置超时（如词典建议 15s，见 §12），超时后 `abort()` 并给出「请求超时」提示，与网络错误区分。
- 竞态敏感的共享状态更新必须校验「结果仍属于当前上下文」。

---

## 8. TypeScript 与 React

### 8.1 TypeScript

- `tsconfig.json` 开启 `strict`；`npm run typecheck` 必须零错误。
- **禁止 `any`**：用 `unknown` + 类型收窄，或定义明确接口。
- 外部可选依赖无类型时，写最小 `declare module`（见 `src/types/puppeteer-core.d.ts`），并收敛在 `src/types/`。
- 类型只做声明用途：`src/lib/` 服务端逻辑可 TS 也可 JS（既有混合），**新文件优先 TS**；公共数据结构类型放 `src/hooks/collector-types.ts` 等就近模块。

### 8.2 React（Next.js 16 App Router）

- 服务端组件默认；需要状态 / 副作用 / 浏览器 API 的组件文件顶部加 `'use client'`。
- 客户端组件 props 用显式 TS 类型（`type Props = { … }`），回调命名 `onXxx`。
- Hook 顺序固定：状态 → ref → 派生值 → 副作用 → 回调；`useEffect` 必须返回清理函数（订阅、定时器、进行中的 `AbortController`）。
- 列表渲染提供稳定 `key`（业务 id，禁用数组下标）；频繁重渲染的子树用 `memo` / `useMemo` / `useCallback` 按需优化。
- 组件文件 ≤ 200 行，超出时拆子组件到同名子目录（既有实践：`components/data-center/`、`components/dictionary/`）。
- 错误边界：页面级 `error.tsx` / 全局 `global-error.tsx` 必须存在且提供恢复操作。

---

## 9. API 路由规范

适用于 `src/app/api/**/route.ts` 与 `server/collect-service/`。

- 声明 `export const runtime = 'nodejs'`（依赖 Node API 与可选 puppeteer-core）。
- **请求体先校验后使用**：复用 `src/lib/request-body.js`、`url-guard.js`（SSRF 防护：拒绝内网 / 链路本地 / 元数据地址与非 http(s) 协议）；畸形输入返回 `400` + 明确错误体，服务端逻辑不做二次假设。
- 鉴权与限流统一走 `src/lib/api-guard.ts`：默认按客户端 IP 限流（60s 30 次，`COLLECT_RATE_LIMIT` / `COLLECT_RATE_WINDOW_MS` 可调），默认**不信任任何代理头**，仅在可信边缘后显式配置 `COLLECT_TRUSTED_IP_HEADER`；桶数量上限 5000，超限先清过期再淘汰最旧桶（防限流重置绕过）。限流命中返回 `429` + `Retry-After`。
- 集成服务鉴权：`COLLECT_SERVICE_TOKEN` 恒定时间比对 `Authorization: Bearer`，`/health` 探活始终放行；未配置令牌默认放行（仅本机 / 内网）。
- SSE 响应：事件统一 `{type:'log'|'error'|'progress'|'done'}`；写入前检查客户端是否已断开，`controller.enqueue` 需自包 try/catch。
- 错误响应：`{error: string, code?: CollectErrorCode}`；上游失败 `502`，参数非法 `400`，未授权 `401`，限流 `429`。

---

## 10. CSS 组织

- 工作台样式全部在 `src/app/styles/`，当前 17 个模块：`base / buttons / cards / cards-data-center / cards-probe / code / coverage / dictionary / dictionary-manage / footer / layout / progress / showcase / terminal / terms / toast / topnav`。
- 命名 kebab-case，与页面 / 组件域对应；**新增样式优先落入既有模块**，模块超出 200 行时按业务域拆分新文件并在 `src/app/layout.tsx` 注册 import（由 Next 构建打包）。
- 设计令牌（颜色、圆角、阴影、间距）定义在 `base.css` / `globals.css`，原型侧同源令牌见 `prototype/wireframes.html`；业务样式引用令牌变量，禁止散落魔法值。
- 不使用 Tailwind 运行时类写工作台核心布局（依赖已声明但样式以模块化 CSS 为准）；类名禁止与语义化 id 混用。
- 单个 CSS 文件同样受 200 行门禁约束。

---

## 11. 可访问性

- 交互控件使用语义化标签（`button` / `nav` / `main` / `aside`），补齐 `aria-*` 与 `aria-labelledby/describedby` 关联；关联目标必须是**真实存在**的 id（见 §14）。
- 键盘可操作：可点击元素可 Tab 聚焦、Enter / Space 触发；弹层提供 Esc 关闭与焦点管理。
- 文本对比度满足 WCAG AA（≥ 4.5:1 正文）。
- 原型与静态页面由 `tests/a11y.test.mjs`（axe-core）守护：**不得引入 serious / critical 违规**；改动原型 HTML 后本地跑 `npm run test:unit` 验证。

---

## 12. 性能预算

以下为当前实测基线（以 v1.13.24 实测为准，`/overview` 页可查实时统计）：

| 指标 | 预算 | 守护方式 |
|------|------|----------|
| 用户脚本产物体积 | 约 196 KB；冒烟下限 50 KB | `tests/smoke.test.cjs` + `npm run validate` |
| 批量采集 URL 数 | ≤ 50 / 批 | `MAX_URLS` 常量 |
| 无头浏览器并发 | 槽位 2（超出排队）；单批页并发 ≤ 3 | `browser-semaphore.js` / `batch-collector.js` |
| 请求超时 | 词典建议 15s；采集页 30s | `AbortController` + `setTimeout` |
| 限流窗口 | 60s 30 次 / IP（可配） | `api-guard.ts` |
| 行数 | 单文件 ≤ 200 行 | 行数门禁 |

新增功能不得突破预算；确需调整时修改对应常量与本文，并在 CHANGELOG 说明。

---

## 13. 文件行数与拆分

- 单个**源代码文件** ≤ 200 行，覆盖 `.js / .cjs / .mjs / .ts / .tsx / .css`，由 `npm run lint:length` 强制（门禁 fail 即流水线失败）。
- 超出时按职责拆分：UI 组件 / hooks / 工具函数 / 类型 / 常量分别成文件；**拆分不得改变外部导出契约**。
- 文档（`.md`）与原型 HTML 不适用该规则，必须保持完整连贯。
- 既有拆分实践（新拆分参照）：`utils/string/*`、`utils/tools/*`、`translation-core/elementTranslator/*`、`translation-core/selectorUtils/*`、`page-monitor/domObserver/*`、`ui/configUI/*`、`ui/styles/configUI/*`、`scripts/build/*`、`src/app/styles/*`。

---

## 14. 语义化 id

为主要容器与交互控件添加语义化 `id`（kebab-case，表达用途），便于调试、无障碍关联与测试定位：

```html
<div id="collector-workspace">
  <aside id="collector-nav">…</aside>
  <main id="collector-main">
    <textarea id="data-center-input"></textarea>
    <button id="data-center-run-btn">开始分析</button>
  </main>
</div>
```

- 命名统一 **kebab-case**（含 JS 动态创建的元素，如 `proto-toast`），禁止 camelCase / 无意义命名（`div1`、`box`、`wrapper2`）。
- 重命名 id 时必须**上下文感知**地同步所有引用：`id` 属性、`getElementById('…')`、`$('#…')`、CSS `#…` 选择器、`aria-*` 关联——禁止盲目字符串替换（会误伤同名 JS 标识符，如 `const dictBody`）。
- 改动原型 HTML 后校验：id 引用可解析、id 唯一、内联 JS 语法通过（`node --check`）。

---

## 15. 页脚版本信息

应用页脚展示**版本号 + build 编号**（取代旧「更新日期」展示）：

- 版本号取自单一版本源 `src/userscript/version.js` 的 `VERSION`，**禁止硬编码**；
- build 编号格式 `yyyymmddhhmm`，由构建流程在 dev / build 启动时自动注入 `NEXT_PUBLIC_BUILD_ID`，缺失时回退为版本号；
- 页脚容器带语义化 id（`site-footer` / `app-footer`）。

```html
<footer id="site-footer">
  <span>GitHub 中文 · 采集工具</span>
  <span>v1.13.24 · build 202611040930</span>
</footer>
```

---

## 16. 依赖引入

- 运行时依赖（`dependencies`）保持最小：当前仅 `@babel/core`、`chokidar`、`express`、`next`、`puppeteer-core`、`react`、`react-dom`、`recharts`、`ws`。新增运行时依赖须在 PR 说明用途、体积与替代方案，经审查同意。
- `puppeteer-core` 为**可选运行时**：不随用户脚本打包，仅在采集工作台批量 URL 采集使用；相关导入须容错（浏览器缺失时返回明确提示，其余功能不受影响）。
- 工具链一律用 Node 内置模块优先（`node:fs`、`node:path`、`node:test`、`node:vm`），避免为一次性脚本引入依赖。
- 测试框架用 Node 内置 `node:test`，不引入 Jest / Vitest；a11y 断言用 `axe-core`（devDependency）。

---

## 17. 安全红线

以下为 **error 级硬约束**，违反即阻断合并：

1. 禁止 `eval` / `new Function` / `javascript:` URL（ESLint `no-eval` / `no-implied-eval` / `no-script-url` / `no-new-func`）。
2. 只抛 `Error` 对象，禁止 `throw` 字面量（`no-throw-literal`）。
3. 用户可控 URL 必须经 `url-guard.js` 校验（协议白名单 + 内网 / 元数据地址拒绝）。
4. 请求体必须校验后使用；SSE / API 输出前转义，原型内插值使用 `esc()` 助手防 XSS。
5. 禁止提交任何密钥、令牌、Cookie、内网地址；鉴权令牌只经环境变量注入，日志脱敏（见 §6.2）。
6. 公网部署必须配置 `COLLECT_SERVICE_TOKEN`（两端同值）；限流不得信任未配置的代理头（见 §9）。
7. 产物校验（`npm run validate`）必须在发布前通过：存在性、体积、UserScript 元数据、当前版本号、vm 编译无语法错误。

---

## 18. 工具使用

```bash
npm run lint            # ESLint 检查
npm run lint:fix        # ESLint 自动修复
npm run format          # Prettier 格式化
npm run format:check    # Prettier 校验（CI 门禁）
npm run lint:length     # 行数门禁（js/cjs/mjs/ts/tsx/css ≤ 200 行）
npm run typecheck       # tsc --noEmit（strict）
npm run validate        # 产物校验（存在性/体积/元数据/语法）
npm test                # 质量流水线：lint → lint:length → build → test:unit
```

### Git 钩子

`.husky/pre-commit` 执行 `npx lint-staged`：对暂存的 `*.{js,cjs,mjs,ts,tsx}` 依次 `eslint --fix` + `prettier --write`（配置见 `package.json` 的 `lint-staged`）。提交前检查失败会中止提交；完整流程见 [development.md §4.4](./development.md)。

---

## 相关文档

- [development.md](./development.md) — 分支 / 提交 / 审查 / 测试 / 发布流程
- [architecture.md](./architecture.md) — 架构设计与数据流
- [project.md](./project.md) — 目录结构与量化指标
- [README.md](./README.md) — 文档索引、SSOT 与术语表
- [code-review/STANDARDS.md](./code-review/STANDARDS.md) — 审查判定标准
