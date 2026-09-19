/**
 * 全局 Edge 中间件
 * 为所有响应附加基础安全响应头；逻辑收敛在 src/middleware.ts，与根配置解耦
 * @file src/middleware.ts
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
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
