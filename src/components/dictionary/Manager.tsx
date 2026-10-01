'use client';
/**
 * 词库管理台（T19 审阅 / T24 导入导出 / T25 搜索批量 / T20 合并入库 / T23 历史对比）
 * @file src/components/dictionary/Manager.tsx
 * @version 1.13.9
 * @description 编排层：搜索 / 排序 / 批量 / 审阅 + 子组件 DictTable（展示）、
 *   MergePatchPanel（导入·合并·入库补丁）、HistoryCompare（历史对比）。
 *   遵循「本地优先·离线可用」：服务端只读词典 + 客户端 localStorage 审阅态。
 */
import { useEffect, useMemo, useState } from 'react';
import { toEntries, filterEntries, sortEntries } from '@/lib/dictionary-io';
import DictTable from './DictTable';
import ExportBar from './ExportBar';
import MergePatchPanel from './MergePatchPanel';
import HistoryCompare from './HistoryCompare';

const REVIEW_KEY = 'ghzh:dict-review';
const LIMIT = 200;

interface ManagerProps {
  dictionary: Record<string, string>;
  stats: { totalEntries: number; translatedEntries: number; completionRate: string };
  history: Array<{
    time: string;
    total: number;
    added: number;
    removed: number;
    changed: number;
    snapshot?: Record<string, string>;
  }>;
}

export default function Manager({ dictionary, stats, history }: ManagerProps) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'key' | 'value'>('key');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(REVIEW_KEY);
      if (raw) setReviewed(new Set<string>(JSON.parse(raw)));
    } catch {
      /* 存储不可用时忽略 */
    }
  }, []);

  const allEntries = useMemo(() => toEntries(dictionary), [dictionary]);
  const visible = useMemo(
    () => sortEntries(filterEntries(allEntries, query), sortBy, sortDir),
    [allEntries, query, sortBy, sortDir],
  );
  const shown = query.trim() ? visible : visible.slice(0, LIMIT);

  function persistReview(next: Set<string>) {
    setReviewed(next);
    try {
      localStorage.setItem(REVIEW_KEY, JSON.stringify([...next]));
    } catch {
      /* 存储不可用时忽略 */
    }
  }
  function toggleReview(key: string) {
    const next = new Set(reviewed);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    persistReview(next);
  }
  function toggleSelect(key: string) {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  }
  function selectAllShown() {
    const next = new Set(selected);
    shown.forEach((e) => next.add(e.key));
    setSelected(next);
  }
  function clearSelect() {
    setSelected(new Set());
  }

  const selectedCount = selected.size;
  const shownSelectedCount = shown.filter((e) => selected.has(e.key)).length;

  return (
    <div className='dict-manage'>
      <div className='dict-stats' aria-live='polite'>
        <span className='dict-badge'>完成率 {stats.completionRate}%</span>
        <span className='dict-badge'>总词条 {stats.totalEntries}</span>
        <span className='dict-badge'>已审阅 {reviewed.size}</span>
        <span className='dict-badge'>已选 {selectedCount}</span>
      </div>

      <div className='dict-toolbar'>
        <input
          id='dict-search'
          className='dict-input'
          type='search'
          placeholder='搜索英文键或中文值…'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label='搜索词条'
        />
        <select
          id='dict-sort'
          className='dict-select'
          value={`${sortBy}-${sortDir}`}
          onChange={(e) => {
            const [b, d] = e.target.value.split('-') as ['key' | 'value', 'asc' | 'desc'];
            setSortBy(b);
            setSortDir(d);
          }}
          aria-label='排序方式'
        >
          <option value='key-asc'>键 A→Z</option>
          <option value='key-desc'>键 Z→A</option>
          <option value='value-asc'>值 A→Z</option>
          <option value='value-desc'>值 Z→A</option>
        </select>
      </div>

      <div className='dict-actions'>
        <button id='dict-select-all' type='button' className='btn' onClick={selectAllShown}>
          全选当前
        </button>
        <button
          id='dict-clear-sel'
          type='button'
          className='btn'
          onClick={clearSelect}
          disabled={selectedCount === 0}
        >
          清除选择
        </button>
      </div>

      <p className='meta'>
        {query.trim()
          ? `匹配 ${visible.length} 条`
          : `显示前 ${Math.min(LIMIT, visible.length)} / 共 ${visible.length} 条（输入关键字查看全部）`}
        {shownSelectedCount > 0 ? `，当前视图已选 ${shownSelectedCount} 条` : ''}
      </p>

      <DictTable
        entries={shown}
        selected={selected}
        reviewed={reviewed}
        onToggleSelect={toggleSelect}
        onToggleReview={toggleReview}
      />

      <ExportBar dictionary={dictionary} reviewed={reviewed} selected={selected} shown={shown} />
      <MergePatchPanel dictionary={dictionary} />
      <HistoryCompare history={history} />
    </div>
  );
}
