/**
 * 全局 Proxy（Next.js 16 起取代 middleware 约定）
 * 为所有响应附加基础安全响应头，含基于 nonce 的 Content-Security-Policy
 * @file src/proxy.ts
 * @version 1.13.16
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 构建内容安全策略
 * - `script-src` 采用 `nonce` + `strict-dynamic`：Next 通过请求头 `x-nonce` 为自身脚本注入匹配 nonce
 * - `style-src` 需 `'unsafe-inline'`：自包含 CSS 与框架注入的内联样式依赖它
 * - `frame-ancestors` 允许 `'self'` 与 Google Cloud / AI Studio 预览容器（避免 iFrame 嵌入白屏）
 * @param nonce - 本次请求的随机 nonce（base64url 安全）
 * @returns 可直接写入响应头的 CSP 字符串
 */
function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self' https://*.google.com https://*.run.app",
    'upgrade-insecure-requests',
  ].join('; ');
}

export function proxy(request: NextRequest) {
  // 生成 128-bit 随机 nonce（UUID 去横线，符合 Next 内置脚本 nonce 注入约定）
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const csp = buildCsp(nonce);

  // 写入 x-nonce 请求头：Next 据此为自身注入的 <script> 添加匹配 nonce 属性
  // 注意：须在生产环境用浏览器 DevTools 核验脚本均带 nonce（strict-dynamic 生效），本环境无 .next 产物无法真实验证
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // 允许在 AI Studio 等同源或可信 iframe 容器中预览展示
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'off');

  return response;
}

export const config = {
  // 跳过 Next 内部静态资源与图片优化
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
