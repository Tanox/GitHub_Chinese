/**
 * Next.js 配置（根级，与 src/ 源码解耦）
 * 采用 src/ 目录模式：src/app、src/components、src/lib、src/proxy.ts
 * @file next.config.mjs
 * @version 1.9.26
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 用户脚本核心（src/main.js 等 .js）由 build.cjs 独立构建，Next 仅处理 app/components/lib
  typescript: {
    ignoreBuildErrors: false,
  },
  // puppeteer 为可选运行时依赖：不参与打包，未安装时由业务代码捕获并给出提示
  serverExternalPackages: ['puppeteer'],
};

export default nextConfig;
