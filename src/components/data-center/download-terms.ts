/**
 * 数据中心导出工具
 * @file src/components/data-center/download-terms.ts
 * @version 1.13.19
 * @description 将清洗出的词条导出为 JSON 文件，从 DataCenter.tsx 抽离以避免单文件超 200 行
 */

import type { TermEntry } from '@/hooks/useCollector';

/**
 * 将词条导出为 JSON 文件
 * @param terms - 当前清洗出的词条
 */
export function downloadTermsAsJson(terms: TermEntry[]): void {
  if (typeof window === 'undefined') return;
  const payload = {
    exportedAt: new Date().toISOString(),
    total: terms.length,
    terms,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `github-i18n-terms-${Date.now()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
