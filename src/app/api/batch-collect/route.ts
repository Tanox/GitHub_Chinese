/**
 * 批量 URL 采集 SSE 接口
 * @file src/app/api/batch-collect/route.ts
 * @version 1.13.10
 * @date 2026-10-01
 * @description POST /api/batch-collect：鉴权后读取并校验一次请求体；配置 COLLECT_SERVICE_URL
 *   时代理独立采集服务的 SSE 流，代理不可用时用已解析 URL 回退本地采集（默认行为不变）。
 *   T18：请求体可选携带 cookies 字段（登录态 cookie）以抓取私有页。
 */
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

  // 请求体只读取一次：原始字符串供代理转发，解析结果供本地回退，避免二次消费 body 流
  const raw = await req.text();
  let body: unknown;
  try {
    body = JSON.parse(raw);
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

  // T18：可选登录态 cookie（数组），用于抓取需鉴权的私有页；非数组则忽略
  const cookies = Array.isArray(body?.cookies) ? body.cookies : undefined;

  // W5 解耦：配置了独立采集服务时代理其 SSE 流；返回 null 则回退本地采集
  const proxied = await proxyCollectRequest({ body: raw, signal: req.signal }, 'batch-collect');
  if (proxied) return proxied;

  return createSseResponse(req, (signal) => collectFromUrls(parsed.urls, { signal, cookies }));
}
