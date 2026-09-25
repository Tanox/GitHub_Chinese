/**
 * 采集 API 访问控制（C3）：可选 Bearer 令牌鉴权 + 每 IP 限流
 * @file src/lib/api-guard.ts
 * @version 1.11.5
 * @description 为 `/api/collect` 与 `/api/batch-collect` 提供统一门禁：
 *   1. 可选令牌：仅当配置 `COLLECT_API_TOKEN` 时启用，默认开放（向后兼容，无 UI 破坏）；
 *   2. 每 IP 固定窗口限流：默认 60s 内 30 次，超出返回 429 + Retry-After。
 *   调用方在解析请求体前执行 `checkApiAccess`，被拒时直接返回对应 Response。
 */
import type { NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';

/** 配置令牌；留空则关闭鉴权（默认开放） */
const TOKEN = process.env.COLLECT_API_TOKEN ?? '';
/** 每窗口允许请求数（可通过环境变量覆盖） */
const RATE_LIMIT = Number(process.env.COLLECT_RATE_LIMIT ?? 30);
/** 限流窗口毫秒数 */
const RATE_WINDOW_MS = Number(process.env.COLLECT_RATE_WINDOW_MS ?? 60_000);

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** 从代理头推导客户端 IP（无代理时回退 unknown） */
function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

/** 恒定时间比较，避免令牌可枚举 */
function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * 校验采集请求访问权限
 * @param req - 请求
 * @returns 通过返回 null；被拒返回 401（缺令牌/令牌错误）或 429（限流）Response
 */
export function checkApiAccess(req: NextRequest): Response | null {
  // 可选 Bearer 令牌：仅在显式配置后启用
  if (TOKEN) {
    const auth = req.headers.get('authorization') ?? '';
    const m = /^Bearer\s+(.+)$/i.exec(auth);
    if (!m || !constantTimeEqual(m[1], TOKEN)) {
      return new Response(JSON.stringify({ error: '未授权：缺少或错误的 API 令牌' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // 每 IP 固定窗口限流
  const ip = clientIp(req);
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    if (buckets.size > 5000) buckets.clear(); // 防止长期运行内存膨胀
    buckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
  } else {
    bucket.count += 1;
    if (bucket.count > RATE_LIMIT) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      return new Response(JSON.stringify({ error: '请求过于频繁，请稍后再试' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
        },
      });
    }
  }
  return null;
}
