'use client';
/**
 * 数据中心面板
 * @file src/components/DataCenter.tsx
 * @version 1.13.18
 * @description 文本粘贴 / 批量 URL 两种采集入口，并提供本地导出能力
 */

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
  if (typeof window === 'undefined') return;
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

/** 预设 GitHub 常用页面与样例文本 */
const PRESETS = [
  {
    name: 'GitHub 首页 (Home)',
    type: 'url' as const,
    content: 'https://github.com/',
  },
  {
    name: 'Issues 页面',
    type: 'url' as const,
    content: 'https://github.com/issues',
  },
  {
    name: 'Pull Requests 页面',
    type: 'url' as const,
    content: 'https://github.com/pulls',
  },
  {
    name: 'Explore 探索',
    type: 'url' as const,
    content: 'https://github.com/explore',
  },
  {
    name: '常用 UI 词条 (文本样例)',
    type: 'manual' as const,
    content: [
      'Dashboard',
      'Repositories',
      'Pull requests',
      'Issues',
      'Marketplace',
      'Explore',
      'Settings',
      'Sign out',
      'Create a new repository',
      'Import repository',
      'New gist',
      'New organization',
      'New project',
      'Your profile',
      'Your repositories',
      'Your projects',
      'Your stars',
      'Your gists',
      'Upgrade',
      'Feature preview',
      'Help',
    ].join('\n'),
  },
];

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

  const handleApplyPreset = (preset: (typeof PRESETS)[number]) => {
    setActiveTab(preset.type);
    setInputValue(preset.content);
  };

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
    <section id='data-center-card' className='card data-center-card'>
      <div className='card-head'>
        <div className='card-title-group'>
          <h2 className='card-title'>
            <span className='step-badge'>2</span>数据中心
          </h2>
          <p className='card-desc-inline'>
            {isManual ? '粘贴控制台 DOM 文本智能清洗' : '自动爬取批量 GitHub URL 文本'}
          </p>
        </div>

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
            <span className='tab-icon' aria-hidden='true'>📝</span>
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
            <span className='tab-icon' aria-hidden='true'>🔗</span>
            批量 URL
          </button>
        </div>
      </div>

      <div className='dc-preset-row'>
        <span className='dc-preset-label'>快捷预设：</span>
        <div className='dc-preset-chips'>
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type='button'
              className={`dc-preset-chip ${activeTab === preset.type ? 'matched' : ''}`}
              onClick={() => handleApplyPreset(preset)}
            >
              <span className='chip-plus'>+</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className='field-stack'>
        <div className='input-meta-bar'>
          <label htmlFor='data-center-input' className='input-label'>
            {isManual ? '待清洗原始文本 / 控制台 DOM 输出' : '待抓取 GitHub URL 列表（每行一个）'}
          </label>
          <span className='input-count-badge'>
            {inputValue.trim()
              ? isManual
                ? `${inputValue.split('\n').filter(Boolean).length} 行`
                : `${inputValue.split('\n').filter((u) => u.trim().startsWith(URL_PREFIX)).length} 个有效 URL`
              : '空'}
          </span>
        </div>

        <textarea
          id='data-center-input'
          className='field dc-textarea'
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          disabled={isProcessing}
          placeholder={
            isManual
              ? '在此粘贴控制台采集到的文本，例如:\nDashboard\nRepositories\nPull requests\nIssues...'
              : 'https://github.com/\nhttps://github.com/issues\nhttps://github.com/pulls'
          }
        ></textarea>

        <div className='dc-action-bar'>
          <div className='dc-stats-info'>
            <span className='dot-pulse' aria-hidden='true'></span>
            <span>已积累词条：<strong>{terms.length}</strong> 条</span>
          </div>

          <div className='dc-btn-group'>
            <button
              id='data-center-export-btn'
              type='button'
              className='btn btn-secondary'
              onClick={() => downloadTermsAsJson(terms)}
              disabled={terms.length === 0}
              title={terms.length === 0 ? '需先分析出词条后方可导出' : '导出词条 JSON'}
            >
              📥 导出 JSON ({terms.length})
            </button>
            <button
              id='data-center-run-btn'
              type='button'
              className={`btn btn-primary ${isProcessing ? 'loading' : ''}`}
              onClick={handleStart}
              disabled={isProcessing || !hasInput}
            >
              {isProcessing
                ? '⚡ 正在智能处理中...'
                : isManual
                ? '✨ 开始智能清洗分析'
                : '🚀 启动批量自动抓取'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
