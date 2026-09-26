# GitHub Chinese 简体中文 · 字符串采集工作台原型设计

> 版本：**v1.12.0** ｜ 版本权威源：`src/version.js`
>
> 说明：本文档描述「词典采集工作台」（亦名 GitHub 页面字符串采集工具）的原型规格与其真实实现映射。可交互高保真原型位于 [`prototype/prototypes/`](../prototype/prototypes/)：[高保真原型](prototype/prototypes/index.html)。
>
> 注：翻译用户脚本（配置面板 `ui/configUI`、翻译核心 `translationCore` 等）为另一子系统，其规格见 [架构设计](./architecture.md)，不在本文档范围内。

## 1. 产品定位与概览

```
┌─────────────────────────────────────────────────────────────────┐
│             词典采集工作台（GitHub 页面字符串采集工具）            │
│       从 GitHub 原生界面抓取 UI 词条 → 沉淀中文本地化词典          │
└─────────────────────────────────────────────────────────────────┘
        │
        ├── 探针注入：在 GitHub 页面控制台执行 PROBE_SCRIPT 提取可见 UI 文本
        ├── 文本粘贴 / 批量 URL：人工归集或 puppeteer 自动抓取
        └── 解析入库：清洗 → 匹配现有词典 → 生成待翻译报告 + 历史趋势
```

- 形态：Next.js（App Router）应用，入口 `src/app/`。
- 四页面（由 `src/components/navItems.ts` 的 `NAV_ITEMS` 定义）：
  - `/`（采集控制台，`CollectorConsole` 客户端岛）
  - `/overview`（项目概览：指标卡片 + 采集趋势 + 能力清单）
  - `/coverage`（覆盖率 / 缺口看板：整体覆盖率 + 按文件细分 + Top-N 缺口 + 重复/冲突检测，T22）
  - `/design`（设计系统展示：design tokens、按钮、状态徽标、词条表格）
- 公共骨架：`src/components/Shell.tsx`（侧栏 `Rail` + 顶栏 + 移动端 `MobileNav`）。

## 2. 整体架构流程

```
┌──────────────────────────────────────────────────────────────────────┐
│                              浏览器 / 用户                            │
│   GitHub 页面控制台执行 PROBE_SCRIPT        或    工作台粘贴文本/批量URL  │
└───────────────┬───────────────────────────────────────┬──────────────┘
                │ 复制文本                                  │ 提交 {data}/{urls}
                ▼                                          ▼
        ┌───────────────┐                      ┌──────────────────────────┐
        │  DataCenter   │                      │  POST /api/collect        │
        │ (文本粘贴)     │                      │  POST /api/batch-collect   │
        └──────┬────────┘                      └────────────┬─────────────┘
               │ {data}                                     │ {urls}
               ▼                                            ▼
        ┌──────────────────────────────────────────────────────────┐
        │                     Route Handler                         │
        │  processRawData / collectFromUrls  →  SSE(text/event-stream)│
        └───────┬───────────────────────────────────────┬──────────┘
                │                                        │
                ▼                                        ▼
        ┌────────────────┐                      ┌─────────────────────────┐
        │ 写临时原始文件   │                      │ url-guard(SSRF)         │
        │ createRawTerms  │                      │ browser-semaphore 限流   │
        │ Path()          │                      │ puppeteer 抓取          │
        └───────┬────────┘                      │  page.evaluate(         │
                │                                │   extractPageText)      │
                ▼                                └───────────┬─────────────┘
        ┌─────────────────────────────────────────────────┐ │
        │            dictionary-processor.js                │◄┘
        │  spawn collect-dict.cjs（清洗子进程）              │
        │   mergeDictionaries + normalizeText +             │
        │   findUntranslated → SSE log/progress/done        │
        └───────────────┬───────────────────────────────────┘
                        ▼
        ┌─────────────────────────────────────────────────┐
        │  scripts/dict-report.cjs → docs/untranslated-terms.txt│
        │  scripts/collect-history.cjs → docs/collect-history.json│
        │  （/overview 展示趋势）                              │
        └─────────────────────────────────────────────────┘
```

关键模块（均位于 `src/lib/` 除非注明）：
- `collector-core.js`：流水线唯一实现（`collectFromUrls` / `processRawData` 异步生成器）。
- `collector-logic.ts`：类型门面，导出 `CollectEvent`、`CollectErrorCode`。
- `extract-page-text.js`：`extractPageText(minLength,maxLength)` 自包含纯函数，可经 `page.evaluate` 注入。
- `batch-collector.js`、`page-navigation.js`：批量抓取、超时回退与重试。
- `dictionary-processor.js`、`request-body.js`、`url-guard.js`、`browser-resolver.js`、`browser-semaphore.js`、`collect-codes.js`、`project-metrics.ts`。
- 解析入库脚本（项目根 / `scripts/`）：`collect-dict.cjs`、`scripts/dict-report.cjs`、`scripts/collect-history.cjs`。

## 3. 采集流程：三步闭环

```
植入探针 ─────► 归集词条 ─────► 解析入库
（提取文本）    （收集输入）     （清洗 + 匹配 + 报告）
```

对应 `src/components/CollectorConsole.tsx` 的 `STEPS = ['植入探针','归集词条','解析入库']`。

### 3.1 植入探针

- 原型：`ct-code` 展示 `document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)` 脚本，配「复制」按钮。
- 实现：`src/components/ScriptInjector.tsx` 的 `PROBE_SCRIPT`（同样基于 TreeWalker）；运行时真实提取由 `src/lib/extract-page-text.js` 完成。
- `extractPageText`：作用域根 `resolveScopeRoot()`（`#react-app` → `.application-main` → `document.body`）；跳过 `SKIP_TAGS`（script/style/code/pre/input…）、噪声类、`aria-hidden`/`hidden`/`display:none`/`visibility:hidden`；返回文本块数组（最小长度 2，最大 300）。

### 3.2 归集词条

- 原型：`ct-card` 数据中心，标签「文本粘贴 / 批量 URL」。
- 实现：`src/components/DataCenter.tsx`（tab `manual` / `url`，`downloadTermsAsJson` 导出 `{exportedAt,total,terms}`，按钮「智能清洗 / 导出 JSON / 开始分析 / 启动批量自动抓取」）。
- 入口 API：
  - `POST /api/collect`：`{ data: string }`（文本粘贴通道）。
  - `POST /api/batch-collect`：`{ urls: string[] }`（批量抓取通道，上限 `MAX_URLS = 50`）。
- `collectFromUrls`：`guardUrl` SSRF 校验 → `acquireBrowserSlot` 信号量限流（`MAX_CONCURRENT_BROWSERS = 2`）→ `puppeteer.launch` → `collectBatch`（`MAX_CONCURRENT_PAGES = 3` 组内并发）→ 文本 `Set` → 写临时原始文件 → `runDictionaryProcessor`；`finally` 中 `browser.close()` + `releaseBrowserSlot()` + 删除临时文件。

### 3.3 解析入库

- 实现：`dictionary-processor.js` `spawn(process.execPath, ['collect-dict.cjs', rawFile])`，stdout→`log` 事件；stderr 以 `[WARN]` 前缀视为 `log`，其余 → `error`（`SUBPROCESS_FAILED`）；`close` 补 `done` 事件（退出码≠0 且无错误行则补 error）。
- `collect-dict.cjs`：`mergeDictionaries()`（babel 解析 `src/dictionaries/**/*.js` 提取 `{原文:译文}`）、`normalizeText()`（解码 HTML 实体 / 压缩空白 / 去首尾标点）、`findUntranslated(texts, dictionary)`（精确 + 归一化大小写不敏感匹配，返回 `{untranslated, translated}`）。
- 报告：`scripts/dict-report.cjs` 写 `docs/untranslated-terms.txt` 并计算历史增量；`scripts/collect-history.cjs` 追加 `docs/collect-history.json`（保留 `MAX_ENTRIES = 30`）。`/overview` 读取并展示趋势。

## 4. API 契约与限流

```
POST /api/collect        { data: string }          → text/event-stream (SSE)
POST /api/batch-collect  { urls: string[] }         → text/event-stream (SSE)
```

SSE 事件（`CollectEvent`，见 `src/lib/collector-logic.ts`）：
```
{ type: 'log' | 'error' | 'progress' | 'done', message?, data?, code? }
```
- `progress.data`：`{ type:'fetch', current, total, url }` 或 `{ type:'analyze' }`。
- `code`：错误时取 `CollectErrorCode`；`done` 时携带子进程退出码。

限流与防护常量：
| 常量 | 值 | 位置 |
|------|-----|------|
| `MAX_URLS` | 50 | `request-body.js` |
| `MAX_URLS_PER_REQUEST` | 20 | `collector-core.js` |
| `MAX_CONCURRENT_BROWSERS` | 2 | `browser-semaphore.js` |
| `MAX_CONCURRENT_PAGES` | 3 | `batch-collector.js` |
| `NAVIGATION_TIMEOUT_MS` | 30000 | `page-navigation.js` |
| `HYDRATION_TIMEOUT_MS` | 15000 | `page-navigation.js` |

前端消费：`src/hooks/useCollector.ts` 的 `handleStream`（按 `\n\n` 切分、`data: ` 前缀、JSON 解析、`applyEvent` 分发），`runRequest` 用 `AbortController` 取消上一次流。

## 5. 数据中心与清洗结果预览

- 数据中心：`DataCenter.tsx` —— 标签切换「文本粘贴 / 批量 URL」，导出 JSON（`downloadTermsAsJson`），触发「开始分析」调用对应 API。
- 清洗结果预览：`PreviewTable.tsx` —— 表列「序号 / 采集词条 / 状态」，`STATUS_LABELS`（`untranslated → 待翻译`，`translated → 已翻译`）。
- 说明：原型中「智能清洗」按钮与「待翻译/已翻译」两状态示例为静态展示；真实清洗与状态判定由后端 `collect-dict.cjs` 经 SSE 透传（当前前端以正则 `TERM_LINE_RE=/^\d+\. "(.+)"$/` 将 collect-dict 输出标为 `untranslated`）。

## 6. 引擎实时处理中心

- 原型：`ct-progress-card` / `ct-terminal` / `ct-status-indicator` / `ct-progress-track` / `ct-log-line`，含「Processing」状态、进度条、SSE 终端日志、自动备份提示。
- 实现：`Dashboard.tsx`（`progress-card` / `backup-pill` / `terminal`），数据来自 `CollectEvent`（`progress.percent`、`log-line` 含 `log-time`/`log-msg`/`log-code`）。
- 超时回退（真实落点 `src/lib/page-navigation.js`）：
  - `gotoWithFallback`：优先 `networkidle2`，`TimeoutError` 降级 `domcontentloaded` + 固定等待。
  - `waitForHydration`：超时降级不阻塞。
  - `navigateWithRetry`：`RETRY_MAX=3`，指数退避 `computeBackoffDelay`（`BACKOFF_BASE_MS=1000`），`isRetryable`（超时 / 网络 / 429 / 5xx）。
  - 注：原型「抓取超时，回退到文本粘贴通道」为装饰文本，真实回退发生在服务端批量抓取内部，不切换通道。
- 自动备份 / 历史（真实落点 `scripts/dict-report.cjs` + `scripts/collect-history.cjs` 写 `docs/collect-history.json`、`docs/untranslated-terms.txt`，由 `/overview` 展示趋势）。原型中「系统自动备份已开启」为静态文案，当前 Next.js 控制台无独立备份逻辑。

## 7. 原型 ↔ 实现映射

| 原型区块 | 原型呈现 | 真实代码落点 |
|----------|----------|--------------|
| 三步闭环 | `ct-steps` | `CollectorConsole.tsx` `STEPS`；`ScriptInjector`→`DataCenter`→`collector-core`+`collect-dict.cjs` |
| 探针脚本 | `ct-code` TreeWalker | `ScriptInjector.tsx` `PROBE_SCRIPT`；`extract-page-text.js` `extractPageText` |
| 数据中心 | 文本粘贴 / 批量 URL | `DataCenter.tsx`；`/api/collect`、`/api/batch-collect` |
| 清洗结果预览 | 8 条两状态表 | `PreviewTable.tsx` `STATUS_LABELS` |
| 引擎实时处理中心 | 进度 + SSE 终端 + 备份提示 | `Dashboard.tsx` + `useCollector.ts`；`page-navigation.js` 超时回退 |
| 覆盖率 / 缺口看板 | 覆盖率进度条 + Top-N 缺口 + 冲突检测 | `src/app/coverage/page.tsx` + `src/lib/coverage-report.ts`；`public/css/coverage.css` |

## 8. 关键数据结构

```
CollectEvent = {
  type: 'log' | 'error' | 'progress' | 'done',
  message?: string,
  data?: { type:'fetch', current, total, url } | { type:'analyze' } | ...,
  code?: CollectErrorCode
}

CollectErrorCode = {
  UNKNOWN: 9000, MISSING_DEPENDENCY: 1001, FETCH_FAILED: 2001,
  SUBPROCESS_FAILED: 2002, INPUT_INVALID: 3001, INVALID_URL: 3002
}

原始词条临时文件：os.tmpdir()/github-i18n-raw-${uuid}.txt（每请求独立，防并发覆盖）
导出 JSON：{ exportedAt: string, total: number, terms: string[] }
```

## 9. 错误处理

- 输入校验：`/api/collect` 非字符串 / 空 → 400 `{error:'没有提供数据'}`；`/api/batch-collect` `urls` 超限 → 400 `{error}`。
- SSRF 防护：`url-guard.js` `guardUrl` 仅允许 http/https，拒绝 localhost / 内网 / 链路本地 / 云元数据（`PRIVATE_IPV4_PATTERN`、`PRIVATE_IPV6_PATTERN`、`BLOCKED_HOSTNAMES`）；非法项发 `INVALID_URL` 事件。
- 依赖缺失：`loadPuppeteerCore` / `resolveBrowserExecutable` 失败 → `MISSING_DEPENDENCY` 事件。
- 子进程隔离：`dictionary-processor.js` 以独立子进程运行 `collect-dict.cjs`，区分 `[WARN]` 与错误（`SUBPROCESS_FAILED`）；`finally` 清理临时文件与浏览器槽位。
- 重试与退避：见 §6 `navigateWithRetry` 指数退避。

## 10. 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.12.0 | 2026-09-26 | 同步原型规范至当前实现：版本横幅 1.9.48 → 1.12.0；导航由三页扩为四页（新增 `/coverage` 覆盖率看板，T22）；映射表补覆盖率看板行 |
| 1.9.48 | 2026-09-25 | 重写原型规范：对齐「字符串采集工作台」原型与 src/app 采集实现，版本横幅同步至 1.9.48 |
| 1.9.46 | 2026-09-25 | 原型重定向为采集工具、单一化为 index.html（旧配置面板原型规格迁出至 architecture.md） |
| 1.9.24 | 2026-09-19 | 同步文档；确认浮动按钮与菜单命令已在 `ui/configUI/bootstrap.js` 落地（旧翻译脚本原型） |
| 1.9.19 | 2026-06-08 | 添加原型设计文档（初版，描述翻译用户脚本配置面板） |
