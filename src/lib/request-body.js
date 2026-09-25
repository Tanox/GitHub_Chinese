/**
 * 采集请求体归一化
 * @file src/lib/request-body.js
 * @version 1.11.3
 * @description 纯函数：校验并归一化批量采集请求体，供 Route Handler 复用，便于独立单测
 */

/** 单次采集允许的最大 URL 数量（防止海量 URL 造成服务端 DoS）；校验与执行共用同一上限（T27） */
export const MAX_COLLECT_URLS = 20;

/**
 * 从请求体中提取有效的 URL 字符串列表
 * @param {unknown} body - 已解析的请求体
 * @returns {{ok: true, urls: string[]} | {ok: false, error: string}} 归一化结果
 */
export function extractUrls(body) {
  const raw = body && typeof body === 'object' ? body.urls : undefined;
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: '没有提供有效的 URL 列表' };
  }

  const urls = raw.filter((item) => typeof item === 'string' && item.trim() !== '');
  if (urls.length === 0) {
    return { ok: false, error: 'URL 列表中没有有效的字符串项' };
  }

  if (urls.length > MAX_COLLECT_URLS) {
    return { ok: false, error: `URL 数量超出上限（最多 ${MAX_COLLECT_URLS} 个）` };
  }

  return { ok: true, urls };
}
