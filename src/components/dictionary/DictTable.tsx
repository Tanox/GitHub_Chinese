'use client';
/**
 * 词库条目表格（T19 / T25 展示层）
 * @file src/components/dictionary/DictTable.tsx
 * @version 1.13.9
 * @description 纯展示组件：渲染当前词库条目，支持逐条选择与审阅勾选。
 */

interface DictEntry {
  key: string;
  value: string;
}

interface DictTableProps {
  entries: DictEntry[];
  selected: Set<string>;
  reviewed: Set<string>;
  onToggleSelect: (key: string) => void;
  onToggleReview: (key: string) => void;
}

export default function DictTable({
  entries,
  selected,
  reviewed,
  onToggleSelect,
  onToggleReview,
}: DictTableProps) {
  return (
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
      {entries.map((e) => (
        <div className='dict-tr' role='row' key={e.key}>
          <span role='cell' className='c-sel'>
            <input
              type='checkbox'
              aria-label={`选择 ${e.key}`}
              checked={selected.has(e.key)}
              onChange={() => onToggleSelect(e.key)}
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
              onChange={() => onToggleReview(e.key)}
            />
          </span>
        </div>
      ))}
    </div>
  );
}
