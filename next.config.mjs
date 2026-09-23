/**
 * Next.js 配置（根级，与 src/ 源码解耦）
 * 采用 src/ 目录模式：src/app、src/components、src/lib、src/proxy.ts
 * @file next.config.mjs
 * @version 1.9.32
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 用户脚本核心（src/main.js 等 .js）由 build.cjs 独立构建，Next 仅处理 app/components/lib
  typescript: {
    ignoreBuildErrors: false,
  },
  // puppeteer-core 为可选运行时依赖：由 browser-resolver.js 在运行期通过 createRequire（变量说明符）解析。
  // 不声明 serverExternalPackages——该包为 ESM，显式外部化会触发 Turbopack「can't be external」告警。
};

export default nextConfig;
