import { NextRequest } from 'next/server';
import { processRawData } from '@/lib/collector-logic';
import { createSseResponse } from '@/lib/sse-stream';
import { checkApiAccess } from '@/lib/api-guard';
import { proxyCollectRequest } from '@/lib/collect-service-client';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const denied = checkApiAccess(req);
  if (denied) return denied;

  // W5 解耦：配置了独立采集服务时代理其 SSE 流；否则回退本地采集（默认行为不变）
  const proxied = await proxyCollectRequest(req, 'collect');
  if (proxied) return proxied;

  let data: unknown;
  try {
    ({ data } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: '请求体不是合法的 JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (typeof data !== 'string' || data.length === 0) {
    return new Response(JSON.stringify({ error: '没有提供数据' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return createSseResponse(req, (signal) => processRawData(data, { signal }));
}
