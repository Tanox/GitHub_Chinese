/**
 * 请求体大小上限读取（防止超大 body 阻塞主线程 / 打满磁盘）
 * @file src/lib/request-body-limit.ts
 * @description 先校验 Content-Length，再按流累计字节数读取；超限立即取消读取并返回 413。
 *   采集接口此前使用 req.text() 一次性读入内存，攻击者可通过 200MB JSON 耗尽内存与磁盘。
 */
import type { NextRequest } from 'next/server';

export type LimitedBodyResult =
  { ok: true; text: string } | { ok: false; status: number; error: string };

/**
 * 流式读取请求体，累计字节数超过上限时中止
 * @param req - Next 请求
 * @param maxBytes - 允许的最大字节数
 * @returns 读取结果或错误结果
 */
export async function readLimitedBody(
  req: NextRequest,
  maxBytes: number,
): Promise<LimitedBodyResult> {
  const declared = Number(req.headers.get('content-length') ?? '');
  if (Number.isFinite(declared) && declared > maxBytes) {
    return { ok: false, status: 413, error: '请求体过大' };
  }

  if (!req.body) return { ok: true, text: '' };

  const reader = req.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = '';

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return { ok: false, status: 413, error: '请求体过大' };
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return { ok: true, text };
  } catch {
    return { ok: false, status: 400, error: '读取请求体失败' };
  }
}

/** 采集接口请求体上限：1 MiB（粘贴文本与 URL 列表均远小于此值） */
export const MAX_COLLECT_BODY_BYTES = 1024 * 1024;
