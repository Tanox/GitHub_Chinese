/**
 * 数据中心面板
 * @file src/components/DataCenter.tsx
 * @version 1.9.24
 * @description 文本粘贴 / 批量 URL 两种采集入口，并提供本地导出能力
 */

'use client';
import React, { useState } from 'react';
import type { TermEntry } from '@/hooks/useCollector';

interface DataCenterProps {
  terms: TermEntry[];
  onStartCollect: (data: string) => void;
  onStartBatchCollect: (urls: string[]) => void;
  isProcessing: boolean;
}

type InputTab = 'manual' | 'url';

const URL_PREFIX = 'http';

/**
 * 将词条导出为 JSON 文件
 * @param terms - 当前清洗出的词条
 */
function downloadTermsAsJson(terms: TermEntry[]): void {
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

export default function DataCenter({
  terms,
  onStartCollect,
  onStartBatchCollect,
  isProcessing,
}: DataCenterProps) {
  const [activeTab, setActiveTab] = useState<InputTab>('manual');
  const [inputValue, setInputValue] = useState('');

  const hasInput = inputValue.trim().length > 0;
  const isManual = activeTab === 'manual';

  const handleStart = () => {
    if (!hasInput) return;
    if (isManual) {
      onStartCollect(inputValue);
      return;
    }
    const urls = inputValue
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.startsWith(URL_PREFIX));
    onStartBatchCollect(urls);
  };

  return (
    <section id='data-center-card' className='card'>
      <div className='card-head'>
        <h2 className='card-title'>
          <span className='step-badge'>2</span>数据中心
        </h2>
        <div className='tabbar' role='tablist'>
          <button
            id='data-center-tab-manual'
            type='button'
            role='tab'
            aria-selected={isManual}
            aria-controls='data-center-input'
            className={`tab ${isManual ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            文本粘贴
          </button>
          <button
            id='data-center-tab-url'
            type='button'
            role='tab'
            aria-selected={!isManual}
            aria-controls='data-center-input'
            className={`tab ${!isManual ? 'active' : ''}`}
            onClick={() => setActiveTab('url')}
          >
            批量 URL
          </button>
        </div>
      </div>

      <div className='field-stack'>
        <label htmlFor='data-center-input' className='sr-only'>
          {isManual ? '待清洗文本' : '待抓取 URL 列表'}
        </label>
        <textarea
          id='data-center-input'
          className='field'
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          disabled={isProcessing}
          placeholder={
            isManual
              ? '在此粘贴控制台采集到的文本...'
              : 'https://github.com/\nhttps://github.com/issues'
          }
        ></textarea>
        <div className='btn-row'>
          <button
            id='data-center-clean-btn'
            type='button'
            className='btn'
            onClick={handleStart}
            disabled={isProcessing || !hasInput}
          >
            智能清洗
          </button>
          <button
            id='data-center-export-btn'
            type='button'
            className='btn'
            onClick={() => downloadTermsAsJson(terms)}
            disabled={terms.length === 0}
          >
            导出 JSON
          </button>
          <button
            id='data-center-run-btn'
            type='button'
            className={`btn btn-primary ${isProcessing ? 'loading' : ''}`}
            style={{ flex: 1 }}
            onClick={handleStart}
            disabled={isProcessing || !hasInput}
          >
            {isProcessing ? '处理中...' : isManual ? '开始分析' : '启动批量自动抓取'}
          </button>
        </div>
      </div>
    </section>
  );
}
