# MEMORY.md

## 项目事实（稳定）
- **GitHub_Chinese（e:/Github/GitHub_Chinese）是浏览器用户脚本项目，非 Next.js 项目。**
  源码为原生 ESM JS；`build.cjs` 将 `src/` 拼接为单文件用户脚本 `build/GitHub_i18n.user.js`；
  `web/` 是独立静态演示页，由 `server.js`（express）提供；`package.json` 无 `next` 依赖、无
  `next dev/build/start` 脚本；全仓库无 `next.config.*` / `app/` / `pages/` / `.next/` / `tsconfig.json`。
  **不应套用 Next.js 目录规范评估本仓库。**
- 目录约定：`src/`（模块化用户脚本源码：core/ translation-core/ ui/ page-monitor/ dictionaries/
  i18n/ main/ config/ utils/ server/ versionChecker/ updateNotification/）、`web/`、`prototype/`、
  `openspec/`、`docs/`、`build/`（产物）。
- 当前未提交工作集版本 **v1.9.22 → 1.9.23**（2026-09-19）：
  - web 采集演示页已升级为 **Next.js 16（App Router, `src/` 模式）**：`src/app`、`src/components`、
    `src/lib`、`src/hooks`、`src/config`；`src/middleware.ts`（Edge 安全头）；`next.config.mjs`（根级）。
  - 用户脚本核心（`src/main.js`、`src/core`、`src/translation-core`、`src/ui` 等 .js）保留独立构建
    （`build.cjs` 拼为单文件用户脚本），不纳入 Next 处理。
  - 样式：`public/css/` 保留 10 个 ≤200 行自包含模块（经 `layout.tsx` 的 `<link>` 引入）；
    `src/app/globals.css` 为 Tailwind 入口（`preflight:false` 以免重置现有样式）；根级
    `tailwind.config.ts` + `postcss.config.mjs` 已配置。
  - 根配置解耦：`next.config.mjs` / `tailwind.config.ts` / `postcss.config.mjs` / `eslint.config.js`（整合
    `eslint-config-next`）/ `.husky/pre-commit` 与 `src/` 源码清晰分离。
