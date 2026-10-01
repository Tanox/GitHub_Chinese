'use client';
/**
 * 词库管理台（T19 审阅 / T24 导入导出 / T25 搜索批量）
 * @file src/components/dictionary/Manager.tsx
 * @version 1.13.8
 * @description 服务端只读词典 + 客户端 localStorage 审阅态；支持搜索 / 排序 / 批量 /
 *   导入导出。遵循「本地优先·离线可用」范式：不直接写服务器词典文件，导入仅产出合并
 *   结果 JSON 供用户手动入库到 src/dictionaries/。
 */
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  toEntries,
  filterEntries,
  sortEntries,
  parseImportedDictionary,
  mergeDictionaries,
} from '@/lib/dictionary-io';

const REVIEW_KEY = 'ghzh:dict-review';
const LIMIT = 200;

interface ManagerProps {
  dictionary: Record<string, string>;
  stats: { totalEntries: number; translatedEntries: number; completionRate: string };
}

function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Manager({ dictionary, stats }: ManagerProps) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'key' | 'value'>('key');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<{ ok: boolean; count?: number; error?: string } | null>(
    null,
  );
  const fileRef = useRef<HTMLInputElement>(null);

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

  function exportSelected() {
    const data = shown
      .filter((e) => selected.has(e.key))
      .reduce<Record<string, string>>((acc, e) => {
        acc[e.key] = e.value;
        return acc;
      }, {});
    downloadJson('dictionary-selected.json', data);
  }
  function exportAll() {
    downloadJson('dictionary-full.json', dictionary);
  }
  function exportReviewed() {
    const data = [...reviewed].reduce<Record<string, string>>((acc, k) => {
      if (k in dictionary) acc[k] = dictionary[k];
      return acc;
    }, {});
    downloadJson('dictionary-reviewed.json', data);
  }

  function handleImport() {
    const res = parseImportedDictionary(importText);
    setImportResult(res.ok ? { ok: true, count: res.count } : { ok: false, error: res.error });
  }
  function downloadMerge() {
    const res = parseImportedDictionary(importText);
    if (!res.ok || !res.data) return;
    downloadJson('dictionary-merged.json', mergeDictionaries(dictionary, res.data));
  }
  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImportText(String(reader.result ?? ''));
    reader.readAsText(f);
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
        <button
          id='dict-export-sel'
          type='button'
          className='btn'
          onClick={exportSelected}
          disabled={selectedCount === 0}
        >
          导出选中
        </button>
        <button
          id='dict-export-reviewed'
          type='button'
          className='btn'
          onClick={exportReviewed}
          disabled={reviewed.size === 0}
        >
          导出已审阅
        </button>
        <button id='dict-export-all' type='button' className='btn btn-primary' onClick={exportAll}>
          导出全量
        </button>
      </div>

      <p className='meta'>
        {query.trim()
          ? `匹配 ${visible.length} 条`
          : `显示前 ${Math.min(LIMIT, visible.length)} / 共 ${visible.length} 条（输入关键字查看全部）`}
        {shownSelectedCount > 0 ? `，当前视图已选 ${shownSelectedCount} 条` : ''}
      </p>

      <div className='dict-table' role='table' aria-label='词库条目'>
        <div className='dict-thead' role='row'>
          <span role='columnheader' className='c-sel'>
            选择
          </span>
          <span role='columnheader' className='c-key'>
            英文键
          </span>
          <span role='columnheader' className='c-val'>
            中文值
          </span>
          <span role='columnheader' className='c-rev'>
            审阅
          </span>
        </div>
        {shown.map((e) => (
          <div className='dict-tr' role='row' key={e.key}>
            <span role='cell' className='c-sel'>
              <input
                type='checkbox'
                aria-label={`选择 ${e.key}`}
                checked={selected.has(e.key)}
                onChange={() => toggleSelect(e.key)}
              />
            </span>
            <span role='cell' className='c-key'>
              <code>{e.key}</code>
            </span>
            <span role='cell' className='c-val'>
              {e.value}
            </span>
            <span role='cell' className='c-rev'>
              <input
                type='checkbox'
                aria-label={`审阅 ${e.key}`}
                checked={reviewed.has(e.key)}
                onChange={() => toggleReview(e.key)}
              />
            </span>
          </div>
        ))}
      </div>

      <section id='dict-import' className='card' aria-labelledby='h-import'>
        <div className='card-head'>
          <h2 className='card-title' id='h-import'>
            导入 / 合并预览
          </h2>
        </div>
        <p className='card-desc'>
          粘贴或上传词典 JSON（扁平对象或 [{key,value}]），解析后仅生成合并结果供手动入库，不写服务器文件。
        </p>
        <div className='field-stack'>
          <label htmlFor='dict-import-text' className='sr-only'>
            导入词典文本
          </label>
          <textarea
            id='dict-import-text'
            className='field'
            rows={4}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='{"Settings":"设置"} 或 [{"key":"Settings","value":"设置"}]'
          />
          <div className='btn-row'>
            <button id='dict-import-btn' type='button' className='btn' onClick={handleImport}>
              解析
            </button>
            <button
              id='dict-import-file'
              type='button'
              className='btn'
              onClick={() => fileRef.current?.click()}
            >
              选择文件
            </button>
            <button
              id='dict-merge-btn'
              type='button'
              className='btn btn-primary'
              onClick={downloadMerge}
              disabled={!importResult?.ok}
            >
              下载合并结果
            </button>
            <input
              ref={fileRef}
              type='file'
              accept='application/json,.json'
              onChange={onFile}
              hidden
            />
          </div>
        </div>
        {importResult &&
          (importResult.ok ? (
            <p className='dict-import-ok'>已解析 {importResult.count} 条，可下载合并结果。</p>
          ) : (
            <p className='dict-error'>{importResult.error}</p>
          ))}
      </section>
    </div>
  );
}
