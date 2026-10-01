# 长期记忆（GitHub_Chinese）

## 项目布局约定
- 部署的 Next.js 工作台（`src/app`）采用**顶部导航 + 内容的上下布局**（全局 `TopNav` 顶栏 + 各页面 `Shell` 内的 `topbar` 页头 + 内容 + 页脚）。**不要**恢复左侧 `Rail` 侧栏。
- 导航数据源唯一来源：`src/components/navItems.ts` 的 `NAV_ITEMS`（6 项：console/overview/coverage/design/dictionary/dict-manage），类型 `NavSection`。
- 原型位于 `prototype/prototypes/index.html`（经 `npm run dev:prototype` 预览），为上下单页展示，定位"设计走查"，与 Next 应用是两套独立产物。

## 常见脚本
- `npm run dev`（Next）、`npm run dev:prototype`（原型预览服务器 server.js）。
- `npm run format` / `typecheck` / `lint` / `build`（build 含 `next build` + `node build.cjs`）。
- 部署：GitHub Pages（`deploy-pages`），产物为 Next 应用而非原型。

## 版本权威源
- 权威版本来源：`package.json` 的 `version` 字段 + `src/userscript/version.js` 的 `VERSION`（二者须一致）。版本源已迁至 `src/userscript/version.js`，旧 `src/version.js` 于 v1.13.6 删除，勿再引用。
- 每次修改（含纯文档）按规则 bump 最小版本（patch）；仅更新被改文件的头注释版本。

## 待处理预存问题（2026-10-01 发现，与布局改造无关）
- `batch-collect/route.ts:44` cookies 类型缺失；`MergePatchPanel.tsx:89` key/value 未定义；`tests/batch-collector.test.mjs` `_` 未使用。
