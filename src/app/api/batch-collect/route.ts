import { NextRequest } from 'next/server';
import { collectFromUrls } from '@/lib/collector-logic';
import { extractUrls } from '@/lib/request-body';

export const runtime = 'nodejs';

/** SSE 心跳间隔（毫秒），避免长任务经代理被缓冲或超时断开（W2） */
const SSE_HEARTBEAT_MS = 15_000;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: '请求体不是合法的 JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const parsed = extractUrls(body);
  if (!parsed.ok) {
    return new Response(JSON.stringify({ error: parsed.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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
        for await (const event of collectFromUrls(parsed.urls, { signal: clientAbort.signal })) {
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
