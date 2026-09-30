/**
 * 文本采集 SSE 接口
 * @file src/app/api/collect/route.ts
 * @version 1.12.12
 * @date 2026-09-30
 * @description POST /api/collect：鉴权后读取并校验一次请求体；配置 COLLECT_SERVICE_URL
 *   时代理独立采集服务的 SSE 流，代理不可用时用已解析数据回退本地采集（默认行为不变）。
 */
import { NextRequest } from 'next/server';
import { processRawData } from '@/lib/collector-logic';
import { createSseResponse } from '@/lib/sse-stream';
import { checkApiAccess } from '@/lib/api-guard';
import { proxyCollectRequest } from '@/lib/collect-service-client';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const denied = checkApiAccess(req);
  if (denied) return denied;

  // 请求体只读取一次：原始字符串供代理转发，解析结果供本地回退，避免二次消费 body 流
  const raw = await req.text();
  let data: unknown;
  try {
    ({ data } = JSON.parse(raw));
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

  // W5 解耦：配置了独立采集服务时代理其 SSE 流；返回 null 则回退本地采集
  const proxied = await proxyCollectRequest({ body: raw, signal: req.signal }, 'collect');
  if (proxied) return proxied;

  return createSseResponse(req, (signal) => processRawData(data as string, { signal }));
}
