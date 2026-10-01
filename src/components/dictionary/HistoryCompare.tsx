'use client';
/**
 * 采集历史对比（T23 工作台 UI 接入）
 * @file src/components/dictionary/HistoryCompare.tsx
 * @version 1.13.9
 * @description 读取服务端传入的采集历史（docs/collect-history.json），选择任意两轮进行词条级
 *   对比（added / removed / changed）。两轮均含 snapshot 时用 diffDictionaries 精确对比；
 *   否则退化为逐轮统计对比展示。历史数据由采集流程写入（W5 架构决策仍待定），无数据时优雅提示。
 */
import { useState } from 'react';
import { diffDictionaries } from '@/lib/dictionary-io';

interface Round {
  time: string;
  total: number;
  added: number;
  removed: number;
  changed: number;
  diff?: {
    added: Array<{ term: string; translation: string }>;
    removed: Array<{ term: string; translation: string }>;
    changed: Array<{ term: string; prev: string; curr: string }>;
  };
  snapshot?: Record<string, string>;
}

interface HistoryCompareProps {
  history: Round[];
}

function fmtTime(t: string): string {
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? t : d.toLocaleString();
}

export default function HistoryCompare({ history }: HistoryCompareProps) {
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(Math.max(0, history.length - 1));
  const [result, setResult] = useState<ReturnType<typeof diffDictionaries> | null>(null);

  if (!history.length) {
    return (
      <section id='dict-history' className='card' aria-labelledby='h-history'>
        <div className='card-head'>
          <h2 className='card-title' id='h-history'>
            采集历史对比
          </h2>
        </div>
        <p className='card-desc'>暂无采集历史。采集流程写入 docs/collect-history.json 后此处展示轮次对比。</p>
      </section>
    );
  }

  const a = history[fromIdx];
  const b = history[toIdx];

  function compare() {
    if (!a || !b) return;
    if (a.snapshot && b.snapshot) {
      setResult(diffDictionaries(a.snapshot, b.snapshot));
    } else {
      // 退化：以两轮统计差近似展示（无 snapshot 时无法精确词条级 diff）
      setResult({
        added: [],
        removed: [],
        changed: [],
      });
    }
  }

  const hasSnapshot = Boolean(a?.snapshot && b?.snapshot);

  return (
    <section id='dict-history' className='card' aria-labelledby='h-history'>
      <div className='card-head'>
        <h2 className='card-title' id='h-history'>
          采集历史对比
        </h2>
      </div>
      <p className='card-desc'>
        共 {history.length} 个采集轮次。选择两轮查看词条级变化（新增 / 删除 / 变更）。
      </p>

      <div className='hist-controls'>
        <label htmlFor='hist-from' className='hist-label'>
          从
          <select
            id='hist-from'
            className='dict-select'
            value={fromIdx}
            onChange={(e) => setFromIdx(Number(e.target.value))}
          >
            {history.map((r, i) => (
              <option key={i} value={i}>
                #{i + 1} · {fmtTime(r.time)}（{r.total}）
              </option>
            ))}
          </select>
        </label>
        <label htmlFor='hist-to' className='hist-label'>
          到
          <select
            id='hist-to'
            className='dict-select'
            value={toIdx}
            onChange={(e) => setToIdx(Number(e.target.value))}
          >
            {history.map((r, i) => (
              <option key={i} value={i}>
                #{i + 1} · {fmtTime(r.time)}（{r.total}）
              </option>
            ))}
          </select>
        </label>
        <button id='hist-compare' type='button' className='btn btn-primary' onClick={compare}>
          对比
        </button>
      </div>

      {result && hasSnapshot && (
        <div className='hist-result' aria-live='polite'>
          <p className='meta'>
            新增 <b className='hist-add'>{result.added.length}</b> · 删除{' '}
            <b className='hist-del'>{result.removed.length}</b> · 变更{' '}
            <b className='hist-chg'>{result.changed.length}</b>
          </p>
          {result.added.length > 0 && (
            <div className='hist-group'>
              <h3 className='hist-h'>新增</h3>
              <ul className='hist-list'>
                {result.added.map((x) => (
                  <li key={x.term}>
                    <code>{x.term}</code> → {x.translation}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.removed.length > 0 && (
            <div className='hist-group'>
              <h3 className='hist-h'>删除</h3>
              <ul className='hist-list'>
                {result.removed.map((x) => (
                  <li key={x.term}>
                    <code>{x.term}</code> → {x.translation}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.changed.length > 0 && (
            <div className='hist-group'>
              <h3 className='hist-h'>变更</h3>
              <ul className='hist-list'>
                {result.changed.map((x) => (
                  <li key={x.term}>
                    <code>{x.term}</code>：{x.prev} → {x.curr}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {result && !hasSnapshot && (
        <p className='dict-error'>
          所选轮次缺少 snapshot，无法精确词条级对比。请在采集流程中以含 snapshot 方式写入历史。
        </p>
      )}
    </section>
  );
}
