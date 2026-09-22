/**
 * 全局 Proxy（Next.js 16 起取代 middleware 约定）
 * 为所有响应附加基础安全响应头
 * @file src/proxy.ts
 * @version 1.9.26
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

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
