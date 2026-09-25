import { NextRequest } from 'next/server';
import { collectFromUrls } from '@/lib/collector-logic';
import { extractUrls } from '@/lib/request-body';
import { createSseResponse } from '@/lib/sse-stream';

export const runtime = 'nodejs';

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

  return createSseResponse(req, (signal) => collectFromUrls(parsed.urls, { signal }));
}
