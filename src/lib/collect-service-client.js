/**
 * 采集服务客户端
 * @file src/lib/collect-service-client.js
 * @version 1.13.0
 * @date 2026-09-30
 * @description 将采集请求转发到自托管「独立采集服务」（W5 架构解耦）：
 *   仅当配置 COLLECT_SERVICE_URL 时启用，把 SSE 流透传回调用方；
 *   未配置或上游不可用时返回 null，调用方用已解析的请求数据回退本地采集（默认行为不变）。
 *
 * 鉴权契约：自托管服务配置 COLLECT_SERVICE_TOKEN 强制 Bearer 校验时，Next 侧必须配置
 *   同一个值（同样的环境变量名），本客户端会携带 Authorization 头；两端配置须成对，
 *   只配一边会导致 401（服务端开了、客户端没带）或形同裸奔（客户端带了、服务端没验）。
 *
 * 设计约定：本模块不接收/不消费原始 Request——请求体由路由层读取一次并完成 JSON 校验，
 * 这里只拿原始字符串转发。否则回退本地时路由无法再次读取 body（Request.body 流只能消费一次）。
 */
import { logger } from '../utils/logger.js';

const SERVICE_URL = process.env.COLLECT_SERVICE_URL || '';
const SERVICE_TOKEN = process.env.COLLECT_SERVICE_TOKEN || '';

/** 是否启用了独立采集服务 */
export function isCollectServiceEnabled() {
  return Boolean(SERVICE_URL);
}

/**
 * 将采集请求代理到独立采集服务，并透传其 SSE 响应
 * @param {object} request - 代理请求参数
 * @param {string} request.body - 已由路由读取的原始 JSON 请求体（原样转发）
 * @param {AbortSignal} [request.signal] - 客户端中断信号（断开时无需回退）
 * @param {'collect'|'batch-collect'} kind - 接口类型
 * @returns {Promise<Response|null>} 未启用或服务不可用时返回 null（调用方回退本地）
 */
export async function proxyCollectRequest({ body, signal }, kind) {
  // 未配置服务时立即返回 null，调用方直接走本地采集
  if (!SERVICE_URL) return null;

  // 客户端已主动断开：静默返回，不打告警日志，也无需回退本地
  if (signal?.aborted) return null;

  const headers = { 'Content-Type': 'application/json' };
  // 与服务端 COLLECT_SERVICE_TOKEN 成对配置后才携带，避免对未启用鉴权的内网服务多发头
  if (SERVICE_TOKEN) headers.Authorization = `Bearer ${SERVICE_TOKEN}`;

  try {
    const upstream = await fetch(`${SERVICE_URL}/api/${kind}`, {
      method: 'POST',
      headers,
      body,
      signal,
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
    // 客户端中断导致的 fetch 失败属预期行为，不告警
    if (error?.name === 'AbortError' || signal?.aborted) return null;
    logger.warn('采集服务代理失败，回退本地采集:', error?.message || String(error));
    return null;
  }
}
