'use client';
/**
 * 词典助手客户端岛（T21）
 * @file src/components/DictionaryHelper.tsx
 * @version 1.12.7
 * @description 输入英文词条 → 调用 /api/dictionary/suggest 获取建议；采纳后存入 localStorage 待入库（含导出/清空）。
 */
import { useEffect, useState } from 'react';
import type { PendingItem, SuggestResult } from './dictionary/types';
import { STORAGE_KEY } from './dictionary/types';
import { SuggestPanel } from './dictionary/SuggestPanel';
import { PendingList } from './dictionary/PendingList';

export default function DictionaryHelper({
  samples,
  totalEntries,
}: {
  samples: string[];
  totalEntries: number;
}) {
  const [term, setTerm] = useState('');
  const [result, setResult] = useState<SuggestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<PendingItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPending(JSON.parse(raw));
    } catch {
      // 忽略损坏的本地数据
    }
  }, []);

  function persist(next: PendingItem[]) {
    setPending(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 存储不可用时静默
    }
  }

  async function handleSuggest(target?: string) {
    const q = (target ?? term).trim();
    if (!q) {
      setError('请输入英文词条');
      return;
    }
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const resp = await fetch(`/api/dictionary/suggest?term=${encodeURIComponent(q)}`);
      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.error ?? '请求失败');
      } else {
        setResult({
          suggestion: data.suggestion,
          source: data.source,
          confidence: data.confidence,
          llmEnabled: data.llmEnabled,
        });
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }

  function accept() {
    if (!result?.suggestion || !term.trim()) return;
    persist([
      ...pending,
      { key: term.trim(), value: result.suggestion, source: result.source },
    ]);
    setResult(null);
    setTerm('');
  }

  function removeAt(i: number) {
    persist(pending.filter((_, idx) => idx !== i));
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(pending, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dictionary-suggestions.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className='dict-wrap'>
      <SuggestPanel
        term={term}
        onTermChange={setTerm}
        onSuggest={handleSuggest}
        loading={loading}
        result={result}
        error={error}
        samples={samples}
        onAccept={accept}
        totalEntries={totalEntries}
      />
      <PendingList
        pending={pending}
        onRemove={removeAt}
        onClear={() => persist([])}
        onExport={exportJson}
      />
    </div>
  );
}
