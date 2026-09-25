import { NextRequest } from 'next/server';
import { processRawData } from '@/lib/collector-logic';
import { createSseResponse } from '@/lib/sse-stream';
import { checkApiAccess } from '@/lib/api-guard';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const denied = checkApiAccess(req);
  if (denied) return denied;

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
