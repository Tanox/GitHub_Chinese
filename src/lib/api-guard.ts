/**
 * 采集 / 词典 API 访问控制（C3）：可选 Bearer 令牌鉴权 + 每 IP 限流
 * @file src/lib/api-guard.ts
 * @version 1.13.28
 * @date 2026-11-06
 * @description 为 `/api/collect`、`/api/batch-collect` 与 `/api/dictionary/suggest` 提供统一门禁：
 *   1. 可选令牌：仅当配置 `COLLECT_API_TOKEN` 时启用，默认开放（向后兼容，无 UI 破坏）；
 *   2. 每 IP 固定窗口限流：默认 60s 内 30 次，超出返回 429 + Retry-After。
 *   调用方在解析请求体前执行 `checkApiAccess`，被拒时直接返回对应 Response。
 */
import type { NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';

/** 配置令牌；留空则关闭鉴权（默认开放） */
const TOKEN = process.env.COLLECT_API_TOKEN ?? '';
/**
 * 解析正整数配置；非法值（NaN / 0 / 负数 / 无穷）回退到默认值，
 * 避免 `count > NaN` 恒为 false 导致限流静默失效。
 * @param {string | undefined} raw - 环境变量原值
 * @param {number} fallback - 默认值
 * @returns {number} 有效的正整数
 */
function positiveInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === '') return fallback;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}

/** 每窗口允许请求数（可通过环境变量覆盖） */
const RATE_LIMIT = positiveInt(process.env.COLLECT_RATE_LIMIT, 30);
/** 限流窗口毫秒数 */
const RATE_WINDOW_MS = positiveInt(process.env.COLLECT_RATE_WINDOW_MS, 60_000);
/**
 * 受信任的客户端 IP 请求头：仅当运维显式声明边缘节点（Cloudflare/EdgeOne/Nginx）
 * 保证覆写该头时才读取，取值如 `cf-connecting-ip`、`x-real-ip`、`x-forwarded-for`。
 * 不配置时一律归入 'unknown' 共享桶——这些头在直达链路上可被客户端任意伪造，
 * 无条件信任等于让攻击者每请求换值即可获得新限流桶，每 IP 限流将完全失效。
 */
const TRUSTED_IP_HEADER = (process.env.COLLECT_TRUSTED_IP_HEADER ?? '').trim().toLowerCase();

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** 桶数量软上限：超过后触发淘汰，防止长期运行内存膨胀 */
const BUCKET_MAX = 5000;

/**
 * 淘汰限流桶：先清已过期桶；仍超上限则按窗口重置时间淘汰最旧的一批。
 * 不能整表 clear()——那会让所有 IP 计数同时归零，
 * 攻击者可借大量伪造 IP 制造「限流重置」窗口绕过限流。
 */
function evictBuckets(now: number): void {
  if (buckets.size <= BUCKET_MAX) return;
  // 1) 已过期桶对限流不再生效，直接移除
  for (const [key, b] of buckets) {
    if (now >= b.resetAt) buckets.delete(key);
  }
  // 2) 仍超上限：按 resetAt 升序淘汰最旧桶，降至上限一半
  if (buckets.size > BUCKET_MAX) {
    const target = Math.floor(BUCKET_MAX / 2);
    const oldest = [...buckets.entries()]
      .sort((a, b) => a[1].resetAt - b[1].resetAt)
      .slice(0, buckets.size - target);
    for (const [key] of oldest) buckets.delete(key);
  }
}

/**
 * 推导限流用客户端标识。
 * 安全模型：只读取运维通过 COLLECT_TRUSTED_IP_HEADER 显式信任的那一个头；
 * 未配置时返回 'unknown'（匿名流量共享一桶，以「宁可误限、不可漏限」保证限流不被绕过）。
 * 注意：内存态固定窗口限流仅对单一 Node 实例有效；serverless 多实例下计数独立，
 * 需在边缘层或接入分布式存储（如 Redis）统一计数。
 */
function clientIp(req: NextRequest): string {
  if (!TRUSTED_IP_HEADER) return 'unknown';
  const value = req.headers.get(TRUSTED_IP_HEADER);
  if (!value) return 'unknown';
  // x-forwarded-for 形如 "client, proxy1, proxy2"，取首段；配置该头意味着运维确认
  // 边缘会清洗/覆写 XFF，否则首段仍可伪造（此时应改用 cf-connecting-ip 等单值头）。
  return value.split(',')[0].trim() || 'unknown';
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
    evictBuckets(now); // 只淘汰过期/最旧桶，防止内存膨胀且不产生「限流重置」窗口
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
