/**
 * 词典助手类型与常量（T21）
 * @file src/components/dictionary/types.ts
 * @version 1.12.7
 */

export interface SuggestResult {
  suggestion: string | null;
  source: string;
  confidence: number;
  llmEnabled?: boolean;
}

export interface PendingItem {
  key: string;
  value: string;
  source: string;
}

/** 本地持久化的待入库建议键名 */
export const STORAGE_KEY = 'ghzh:dict-pending';
