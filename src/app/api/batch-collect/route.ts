import { NextRequest } from 'next/server';
import { collectFromUrls } from '@/lib/collector-logic';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { urls } = await req.json();

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return new Response(JSON.stringify({ error: '没有提供有效的 URL 列表' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of collectFromUrls(urls)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
      } catch (err: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
