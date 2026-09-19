/**
 * Next.js 配置（根级，与 src/ 源码解耦）
 * 采用 src/ 目录模式：src/app、src/components、src/lib、src/middleware.ts
 * @file next.config.mjs
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 用户脚本核心（src/main.js 等 .js）由 build.cjs 独立构建，Next 仅处理 app/components/lib
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
