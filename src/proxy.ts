/**
 * 全局 Proxy（Next.js 16 起取代 middleware 约定）
 * 为所有响应附加基础安全响应头，含基于 nonce 的 Content-Security-Policy
 * @file src/proxy.ts
 * @version 1.9.36
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 构建内容安全策略
 * - `script-src` 采用 `nonce` + `strict-dynamic`：Next 会读取请求头中的 CSP 并为其脚本注入匹配 nonce
 * - `style-src` 需 `'unsafe-inline'`：自包含 CSS 与框架注入的内联样式依赖它
 * @param nonce - 本次请求的随机 nonce
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
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

export function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  // 同时写入请求头：Next 依据其中的 nonce 为自身脚本注入 nonce 属性
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'off');

  return response;
}

export const config = {
  // 跳过 Next 内部静态资源与图片优化
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
