/**
 * 翻译建议接口响应的运行时收窄
 * @file src/components/dictionary/suggest-response.ts
 * @version 1.12.13
 * @date 2026-09-30
 * @author Sut
 * @description resp.json() 的结果类型是 unknown，直接按 SuggestResult 取字段会绕过
 *   TS 类型安全；本模块按接口契约做结构校验，字段缺失或类型错误时返回 null 由调用方降级。
 */
import type { SuggestResult } from './types';

/**
 * 收窄 /api/dictionary/suggest 的成功响应
 * @param data resp.json() 得到的未知结构
 * @returns 合法建议结果；结构不符时返回 null
 */
export function narrowSuggestResponse(data: unknown): SuggestResult | null {
  if (typeof data !== 'object' || data === null) return null;
  const obj = data as Record<string, unknown>;
  if (
    (obj.suggestion !== null && typeof obj.suggestion !== 'string') ||
    typeof obj.source !== 'string' ||
    typeof obj.confidence !== 'number'
  ) {
    return null;
  }
  return {
    suggestion: obj.suggestion,
    source: obj.source,
    confidence: obj.confidence,
    llmEnabled: typeof obj.llmEnabled === 'boolean' ? obj.llmEnabled : undefined,
  };
}

/**
 * 从错误响应中提取 human-readable 消息
 * @param data resp.json() 得到的未知结构
 * @returns 合法错误消息字符串；缺失时返回 null
 */
export function readErrorMessage(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return null;
  const error = (data as Record<string, unknown>).error;
  return typeof error === 'string' && error.trim() ? error : null;
}
