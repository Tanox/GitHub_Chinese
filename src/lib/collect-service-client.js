/**
 * 采集服务客户端
 * @file src/lib/collect-service-client.js
 * @version 1.12.9
 * @date 2026-09-30
 * @description 将采集请求转发到自托管「独立采集服务」（W5 架构解耦）：
 *   仅当配置 COLLECT_SERVICE_URL 时启用，把 SSE 流透传回前端；
 *   未配置时返回 null，路由回退到本地采集逻辑（默认行为不变）。
 */
import { logger } from '../utils/logger.js';

const SERVICE_URL = process.env.COLLECT_SERVICE_URL || '';

/** 是否启用了独立采集服务 */
export function isCollectServiceEnabled() {
  return Boolean(SERVICE_URL);
}

/**
 * 将采集请求代理到独立采集服务，并透传其 SSE 响应
 * @param {Request} req - NextRequest（含 signal 与请求体）
 * @param {'collect'|'batch-collect'} kind - 接口类型
 * @returns {Promise<Response|null>} 服务不可用时返回 null（调用方回退本地）
 */
export async function proxyCollectRequest(req, kind) {
  // 未配置服务时立即返回 null，且不读取请求体，确保本地回退路径不受影响
  if (!SERVICE_URL) return null;

  try {
    const body = await req.text();
    const upstream = await fetch(`${SERVICE_URL}/api/${kind}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: req.signal,
    });

    if (!upstream.ok || !upstream.body) {
      logger.warn(`采集服务返回异常（${upstream.status}），回退本地采集`);
      return null;
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    logger.warn('采集服务代理失败，回退本地采集:', error?.message || String(error));
    return null;
  }
}
