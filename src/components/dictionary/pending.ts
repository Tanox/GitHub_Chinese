/**
 * 待入库建议的本地数据校验
 * @file src/components/dictionary/pending.ts
 * @version 1.12.13
 * @date 2026-09-30
 * @author Sut
 * @description localStorage 中的 JSON 可能损坏或被其他版本/脚本写成任意结构，
 *   渲染前必须收窄为 PendingItem[]，否则 .map/.filter 会让整个词典助手岛崩溃。
 */
import type { PendingItem } from './types';

/**
 * 判断未知值是否为合法待入库条目
 * @param value 任意值
 * @returns 是否为含字符串 key/value/source 的对象
 */
export function isPendingItem(value: unknown): value is PendingItem {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.key === 'string' &&
    typeof item.value === 'string' &&
    typeof item.source === 'string'
  );
}

/**
 * 将 localStorage 原始内容收窄为待入库列表；任何损坏/漂移数据安全降级为空列表
 * @param raw localStorage 读出的原始字符串（可能为 null）
 * @returns 合法条目数组
 */
export function parsePending(raw: string | null): PendingItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isPendingItem) : [];
  } catch {
    return [];
  }
}
