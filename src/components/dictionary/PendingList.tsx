'use client';
/**
 * 待入库建议列表（T21 子组件）
 * @file src/components/dictionary/PendingList.tsx
 * @version 1.12.7
 */
import type { PendingItem } from './types';

interface PendingListProps {
  pending: PendingItem[];
  onRemove: (index: number) => void;
  onClear: () => void;
  onExport: () => void;
}

export function PendingList({ pending, onRemove, onClear, onExport }: PendingListProps) {
  return (
    <section className='card' id='dict-pending' aria-label='待入库建议'>
      <div className='card-head'>
        <h2 className='card-title'>待入库（本地 {pending.length}）</h2>
        <div className='btn-row'>
          <button type='button' className='btn' onClick={onExport} disabled={pending.length === 0}>
            导出 JSON
          </button>
          <button type='button' className='btn' onClick={onClear} disabled={pending.length === 0}>
            清空
          </button>
        </div>
      </div>
      {pending.length === 0 ? (
        <p className='card-desc'>暂无采纳的建议。</p>
      ) : (
        <ul className='spec-list'>
          {pending.map((p, i) => (
            <li key={`${p.key}-${i}`} className='pending-item'>
              <code>{p.key}</code>
              <span className='arrow' aria-hidden='true'>
                →
              </span>
              <span>{p.value}</span>
              <button
                type='button'
                className='btn btn-copy'
                onClick={() => onRemove(i)}
                aria-label={`移除 ${p.key}`}
              >
                移除
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
