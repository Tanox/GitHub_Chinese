import { NextRequest } from 'next/server';
import { collectFromUrls } from '@/lib/collector-logic';
import { extractUrls } from '@/lib/request-body';
import { createSseResponse } from '@/lib/sse-stream';
import { checkApiAccess } from '@/lib/api-guard';
import { proxyCollectRequest } from '@/lib/collect-service-client';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const denied = checkApiAccess(req);
  if (denied) return denied;

  // W5 解耦：配置了独立采集服务时代理其 SSE 流；否则回退本地采集（默认行为不变）
  const proxied = await proxyCollectRequest(req, 'batch-collect');
  if (proxied) return proxied;

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

  return createSseResponse(req, (signal) => collectFromUrls(parsed.urls, { signal }));
}
