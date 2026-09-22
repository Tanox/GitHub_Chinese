'use client';
import React from 'react';
import type { TermEntry, TermStatus } from '@/hooks/useCollector';

interface PreviewTableProps {
  terms: TermEntry[];
}

/** 词条状态的中文展示文案 */
const STATUS_LABELS: Record<TermStatus, string> = {
  untranslated: '待翻译',
  translated: '已翻译',
};

export default function PreviewTable({ terms }: PreviewTableProps) {
  if (terms.length === 0) return null;

  return (
    <section id='previewContainer' className='card'>
      <div className='card-head'>
        <h2 className='card-title'>清洗结果预览</h2>
        <span id='termCount' className='term-badge'>
          {terms.length} 词条
        </span>
      </div>
      <div className='preview'>
        <div className='preview-scroll scroll'>
          <table className='terms'>
            <thead>
              <tr>
                <th>序号</th>
                <th>采集词条</th>
                <th className='right'>状态</th>
              </tr>
            </thead>
            <tbody id='previewBody'>
              {terms.map((term, i) => (
                <tr key={i} className='term-row'>
                  <td className='term-index'>{i + 1}</td>
                  <td className='term-text'>{term.text}</td>
                  <td className='right'>
                    <span className={`badge ${term.status}`}>{STATUS_LABELS[term.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
