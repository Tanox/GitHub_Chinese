'use client';
/**
 * 词典助手客户端岛（T21）
 * @file src/components/DictionaryHelper.tsx
 * @version 1.12.13
 * @date 2026-09-30
 * @description 输入英文词条 → 调用 /api/dictionary/suggest 获取建议；采纳后存入 localStorage 待入库（含导出/清空）。
 *   健壮性：本地数据收窄、接口响应 unknown 校验、连发请求用 AbortController 防止旧响应覆盖新结果。
 */
import { useEffect, useRef, useState } from 'react';
import type { PendingItem, SuggestResult } from './dictionary/types';
import { STORAGE_KEY } from './dictionary/types';
import { parsePending } from './dictionary/pending';
import { narrowSuggestResponse, readErrorMessage } from './dictionary/suggest-response';
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
  /** 当前在飞请求的中断器：新查询发起前中断上一个，卸载时中断全部 */
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      setPending(parsePending(localStorage.getItem(STORAGE_KEY)));
    } catch {
      // localStorage 不可用时保持空列表
    }
    return () => abortRef.current?.abort();
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
    // 中断上一个在飞请求，避免慢响应晚到后覆盖新查询的结果
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setError('');
    setResult(null);
    setLoading(true);
    try {
      const resp = await fetch(`/api/dictionary/suggest?term=${encodeURIComponent(q)}`, {
        signal: ac.signal,
      });
      const data: unknown = await resp.json();
      if (!resp.ok) {
        setError(readErrorMessage(data) ?? '请求失败');
        return;
      }
      const narrowed = narrowSuggestResponse(data);
      if (!narrowed) {
        setError('接口返回数据格式异常');
        return;
      }
      setResult(narrowed);
    } catch (err) {
      // 主动中断的陈旧请求：不更新任何 UI，状态由新请求负责
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError('网络错误，请重试');
    } finally {
      if (abortRef.current === ac) setLoading(false);
    }
  }

  function accept() {
    if (!result?.suggestion || !term.trim()) return;
    const key = term.trim();
    const next: PendingItem = { key, value: result.suggestion, source: result.source };
    // 同 key 去重：已存在则就地替换为最新建议，否则追加
    const existed = pending.some((item) => item.key === key);
    persist(existed ? pending.map((item) => (item.key === key ? next : item)) : [...pending, next]);
    setResult(null);
    setTerm('');
  }

  function removeAt(i: number) {
    persist(pending.filter((_, idx) => idx !== i));
  }

  function exportJson() {
    if (typeof window === 'undefined') return;
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
