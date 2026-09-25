/**
 * SSE 流式响应工厂（采集工作台公共样板）
 * @file src/lib/sse-stream.ts
 * @version 1.11.4
 * @description 将「客户端断连取消 + 心跳保活 + 错误兜底 + 收尾关闭」的 SSE 样板
 *   抽离为单一工厂，供 `/api/collect` 与 `/api/batch-collect` 复用（S2）。
 *   调用方只需提供一个根据取消信号产出采集事件的生成器。
 */
import type { NextRequest } from 'next/server';
import type { CollectEvent } from './collector-core.js';

/** SSE 心跳间隔（毫秒），避免长任务经代理被缓冲或超时断开（W2） */
const SSE_HEARTBEAT_MS = 15_000;

/**
 * 构造一个 text/event-stream 响应
 * @param req - 请求（用于监听客户端断开信号 `req.signal`）
 * @param makeGenerator - 接收取消信号、产出采集事件的生成器工厂
 * @returns SSE 响应
 */
export function createSseResponse(
  req: NextRequest,
  makeGenerator: (signal: AbortSignal) => AsyncGenerator<CollectEvent>,
): Response {
  // 客户端断开即取消采集，释放浏览器实例与信号量槽（C1）
  const clientAbort = new AbortController();
  req.signal.addEventListener('abort', () => clientAbort.abort());

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          /* 客户端已断开，忽略写入失败 */
        }
      }, SSE_HEARTBEAT_MS);
      try {
        for await (const event of makeGenerator(clientAbort.signal)) {
          if (clientAbort.signal.aborted) break;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '未知错误';
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', message })}\n\n`),
        );
      } finally {
        clearInterval(ping);
        try {
          controller.close();
        } catch {
          /* 流已关闭，忽略 */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
