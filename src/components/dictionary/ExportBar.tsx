'use client';
/**
 * 导出操作栏（T24 导入导出 · T25 批量）
 * @file src/components/dictionary/ExportBar.tsx
 * @version 1.13.9
 * @description 纯展示 + 下载：导出选中 / 已审阅 / 全量词条为 JSON。下载依赖 DOM。
 */
import type { DictEntry } from './DictTable';

interface ExportBarProps {
  dictionary: Record<string, string>;
  reviewed: Set<string>;
  selected: Set<string>;
  shown: DictEntry[];
}

function downloadJson(filename: string, data: unknown): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportBar({ dictionary, reviewed, selected, shown }: ExportBarProps) {
  function exportSelected() {
    const data = shown
      .filter((e) => selected.has(e.key))
      .reduce<Record<string, string>>((acc, e) => {
        acc[e.key] = e.value;
        return acc;
      }, {});
    downloadJson('dictionary-selected.json', data);
  }
  function exportReviewed() {
    const data = [...reviewed].reduce<Record<string, string>>((acc, k) => {
      if (k in dictionary) acc[k] = dictionary[k];
      return acc;
    }, {});
    downloadJson('dictionary-reviewed.json', data);
  }
  function exportAll() {
    downloadJson('dictionary-full.json', dictionary);
  }

  return (
    <div className='dict-actions'>
      <button
        id='dict-export-sel'
        type='button'
        className='btn'
        onClick={exportSelected}
        disabled={selected.size === 0}
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
  );
}
