# 任务追踪（Task Tracker）

> 版本：**v1.11.9** ｜ 版本权威源：`src/version.js`
>
> 本文件是项目**任务清单**：仅列出未完成（活动）任务；已完成的任务记录于 `CHANGELOG.md`。
> `docs/PROGRESS.md` 仅作进度 / 架构 / 指标报告，不再重复维护任务表。

---

## 1. 活动任务（进行中 / 待办）

> 状态用 `- [ ]` 表示未完成；完成后在 `CHANGELOG.md` 对应版本小节记录。
> 优先级沿用 P0/P1/P2/P3；工作量标签：S（<0.5d）/ M（0.5–2d）/ L（>2d）。
> 每条任务附「验收要点」（设计契约），实施前以此为准；规划背景见 `docs/PROGRESS.md` §9，变更记录见 `CHANGELOG.md`。

**P1（成功率 / 覆盖率核心）**
- [x] **T12** 采集提取精准化 `M` → v1.10.0
  - 验收：抓取范围从整页 `body` 收敛到 GitHub UI 容器（`#react-app` / `.application-main` 回退 `body`），排除页脚/侧栏/内容型容器噪声
- [x] **T13** SPA/动态内容适配 `M` → v1.10.0
  - 验收：`networkidle2` 超时（30s）降级 `domcontentloaded` + 固定 3s 等待；等 hydration（`#react-app`）后提取；`autoScroll` 触发懒加载
- [x] **T14** 单次采集鲁棒性 `M` → v1.10.0
  - 验收：逐 URL 错误隔离（单页失败记日志续跑整批）；导航超时/429/网络错误指数退避（1s→2s→4s，上限 3 次）
- [x] **T16** 匹配策略增强（占位符归一） `M` → v1.11.8
  - 验收：`collect-dict.cjs` 新增 `stripTemplateTokens`，在 `findUntranslated` 构建「去占位符词典索引」；含 `%s`/`%1$s`/`%(name)s`/`{0}`/`{{var}}`/`:name` 的已翻译串可命中非模板词典词条，「已翻译却判待翻译」误报下降；增补单测覆盖命中与「不误伤无关串」回归。复数/词级模糊匹配留作后续（见 CHANGELOG）
- [ ] **T19** 词条级审阅工作流 `M`
  - 验收：每条待翻译词条可标记 已翻译/忽略/需复核，状态持久化（localStorage 或 JSON 文件），进入历史可追溯
- [ ] **T20** 一键合并入库 `M`
  - 验收：审阅通过词条按来源/分类生成词典 stub（`"词条": "待翻译: 词条"`）并渲染 PR 式 diff 预览，支持复制/下载
- [x] **T26** 修复 `extractPageText` 序列化丢失辅助（阻断 v1.10.0 批量采集） `M` → v1.10.2
  - 验收：将 `SKIP_TAGS` / `resolveScopeRoot` / `isContentNoise` 内联进 `extractPageText` 使其自包含；补 jsdom 端到端用例，确认批量采集实际提取到文本（非 0）

**P2（度量 / 管理增强）**
- [x] **T15** 采集并发上限与限流 `S` → v1.10.0
  - 验收：浏览器实例信号量（全局 2 并发）+ 单浏览器内 3 并发页（`browser-semaphore.js` / `batch-collector.js`），避免资源耗尽与 GitHub 限速
- [x] **T17** 覆盖率度量与报告（数据层） `M` → v1.11.9
  - 验收：`coverage.cjs` 新增 `computeCoverage`，复用 `findUntranslated` 计算命中词典比例、按页面/路由分类统计（`byPage`）、Top-N 低覆盖定位（`lowCoveragePages` 升序 + `topUnmatched` 频率降序），并过滤纯数字/纯标点/过短噪声以免污染分母；增补单测覆盖命中、页面分类、Top-N、占位符复用（T16）与空输入。工作台可视化看板（覆盖率/缺口面板）留作后续独立 UI 任务
- [ ] **T18** 采集源扩展 `L`
  - 验收：支持登录态 cookie 注入抓取私有页、HAR/会话导入，覆盖更多 UI 区域
- [ ] **T21** 翻译建议 `L`
  - 验收：对每条待翻译词条调用 LLM/翻译记忆给出建议译文，人工确认后入库；含失败降级（无 key 时跳过）
- [ ] **T22** 覆盖率/缺口看板 `M`
  - 验收：按词典文件（nav/repo/pr/issue/misc…）展示覆盖率、Top-N 缺口、重复/冲突检测（同键多值、近似键）
- [ ] **T23** 历史明细与轮次对比 `M`
  - 验收：`collect-history.json` 扩展为词条级 diff，工作台可按轮次对比、回滚
- [x] **T27** 统一 URL 数量上限（校验/执行不一致） `S` → v1.11.3
  - 验收：抽离单一 `MAX_COLLECT_URLS` 常量同时被 `request-body.js`（校验 50）与 `collector-core.js`（执行 20）复用，两处上限一致
- [x] **T30** 修复 SSRF 经 HTTP 重定向绕过 `url-guard` `S` → v1.11.4
  - 验收：`page-navigation.gotoWithFallback` 启用请求拦截，对所有导航/文档类请求（含重定向目标）二次 `guardUrl` 校验，命中内网/元数据/非公网即 `abort`，阻断重定向 SSRF
- [x] **T31** 抽离公共 SSE 响应工厂（消除路由样板重复） `S` → v1.11.4
  - 验收：新增 `src/lib/sse-stream.ts` `createSseResponse`，`/api/collect` 与 `/api/batch-collect` 复用同一「断连取消 + 心跳 + 错误兜底 + 收尾关闭」实现，tsc/lint 全绿
- [x] **T32** 采集端点鉴权与限流（C3） `S` → v1.11.5
  - 验收：新增 `src/lib/api-guard.ts` `checkApiAccess`；可选 `COLLECT_API_TOKEN` Bearer 鉴权（默认关闭、向后兼容、无 UI 破坏）+ 每 IP 固定窗口限流（默认 60s/30 次，超限 429 + Retry-After）；两路由在解析请求体前接入
- [x] **T33** 清理 `browser-semaphore.js` lint 警告 `S` → v1.11.5
  - 验收：`no-promise-executor-return` 警告消除，`npm run lint` 0 warning（经核查当前为块级 executor 体、已合规，标记关闭）
- [x] **T34** `useCollector.ts` 触及 200 行上限重构（T29） `S` → v1.11.6
  - 验收：按职责拆分为 `collector-types.ts`(类型) / `collector-constants.ts`(IDLE_PROGRESS·TERM_LINE_RE·PERCENT_MAX) / `collector-sse.ts`(纯函数 `readSseStream`)；主文件仅保留编排逻辑并 re-export 原有类型（组件导入契约不变）；顺手移除未使用的 `CollectErrorCode` 死导入；`npm run lint:length` 全部 <200 行、tsc/lint 全绿
- [x] **T35** 去除前端词条正则耦合（S1） `S` → v1.11.7
  - 验收：后端 `dictionary-processor.js` stdout 解析 `N. "term"` 行改发结构化 `term` 事件 `{type:'term',data:{text}}`；`useCollector.ts` 删除 `TERM_LINE_RE` 反解、`applyEvent` 直接处理 `term`；`collector-types.ts`/`collector-logic.ts`/`dictionary-processor.js` 的 `CollectEvent`/`StreamEvent` 类型均增 `'term'`；`collector-constants.ts` 移除 `TERM_LINE_RE`；tsc/lint 全绿

**P3（体验打磨）**
- [ ] **T24** 导入/导出增强 `S`
  - 验收：CSV/JSON 双向、与现有词典结构对齐、术语去重与归一校验
- [ ] **T25** 搜索与批量操作 `S`
  - 验收：按状态/来源/关键词检索；批量标记/忽略
- [x] **T28** 清理 `browser-semaphore.js` lint 警告 `S` → v1.11.5（已于 T33 交付，此处重复，归档）
  - 验收：`no-promise-executor-return` 警告消除，`npm run lint` 0 warning（T33 同义）
- [x] **T29** 重构 `useCollector.ts`（触线风险） `M` → v1.11.6（已于 T34 交付，此处重复，归档）
  - 验收：抽出事件流消费/状态归约子逻辑到独立模块，降至 200 行以内并保留导出契约（T34 同义）

---

## 2. 推进说明

- **单一来源**：项目任务以本文件为准；`docs/PROGRESS.md` 仅作进度 / 架构 / 指标报告。
- **流转规则**：活动任务完成后在 `CHANGELOG.md` 对应版本小节记录（历史任务 T1–T11、P0-1–P2-7 均已完成，详见 `CHANGELOG.md`；新增任务从 `T12` 起编号）。
- **新增任务**：按 `Txx` 编号追加到第 1 节对应优先级；文档准确性类问题优先以 T3 模式处理。
