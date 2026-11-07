/**
 * Next.js 配置（根级，与 src/ 源码解耦）
 * 采用 src/ 目录模式：src/app、src/components、src/lib、src/proxy.ts
 * @file next.config.mjs
 * @version 1.13.28
 * @description build 编号由 src/lib/build-id.js 的纯函数生成（yymmddhhmm，10 位），
 *   与应用页脚共用同一实现，避免格式漂移（见 docs/coding-style.md §15）。
 */

import { createBuildId, BUILD_ID_ENV_KEY } from './src/lib/build-id.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    [BUILD_ID_ENV_KEY]: createBuildId(),
  },
  // 用户脚本核心（src/userscript/main.js 等 .js）由 scripts/build/build.cjs 独立构建，Next 仅处理 app/components/lib
  typescript: {
    ignoreBuildErrors: false,
  },
  // puppeteer-core 为可选运行时依赖：由 browser-resolver.js 在运行期通过 createRequire（变量说明符）解析。
  // 不声明 serverExternalPackages——该包为 ESM，显式外部化会触发 Turbopack「can't be external」告警。
};

export default nextConfig;
