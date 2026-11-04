/**
 * Next.js 配置（根级，与 src/ 源码解耦）
 * 采用 src/ 目录模式：src/app、src/components、src/lib、src/proxy.ts
 * @file next.config.mjs
 * @version 1.13.21
 */

/** 生成本地构建编号 yyyymmddhhmm（dev/build 启动时自动注入） */
function createBuildId(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
  ].join('');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BUILD_ID: createBuildId(),
  },
  // 用户脚本核心（src/userscript/main.js 等 .js）由 scripts/build/build.cjs 独立构建，Next 仅处理 app/components/lib
  typescript: {
    ignoreBuildErrors: false,
  },
  // puppeteer-core 为可选运行时依赖：由 browser-resolver.js 在运行期通过 createRequire（变量说明符）解析。
  // 不声明 serverExternalPackages——该包为 ESM，显式外部化会触发 Turbopack「can't be external」告警。
};

export default nextConfig;
