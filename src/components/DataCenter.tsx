'use client';
import React, { useState } from 'react';

interface DataCenterProps {
  onStartCollect: (data: string) => void;
  onStartBatchCollect: (urls: string[]) => void;
  isProcessing: boolean;
}

export default function DataCenter({ onStartCollect, onStartBatchCollect, isProcessing }: DataCenterProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'url'>('manual');
  const [inputValue, setInputValue] = useState('');

  const handleStart = () => {
    if (!inputValue.trim()) return;
    if (activeTab === 'manual') {
      onStartCollect(inputValue);
    } else {
      const urls = inputValue.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'));
      onStartBatchCollect(urls);
    }
  };

  return (
    <section className="card">
      <div className="card-head">
        <h2 className="card-title"><span className="step-badge">2</span>数据中心</h2>
        <div className="tabbar">
          <button 
            className={`tab ${activeTab === 'manual' ? 'active' : ''}`} 
            onClick={() => setActiveTab('manual')}
          >
            文本粘贴
          </button>
          <button 
            className={`tab ${activeTab === 'url' ? 'active' : ''}`} 
            onClick={() => setActiveTab('url')}
          >
            批量 URL
          </button>
        </div>
      </div>

      <div className="field-stack">
        <textarea 
          className="field" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isProcessing}
          placeholder={activeTab === 'manual' ? "在此粘贴控制台采集到的文本..." : "https://github.com/\nhttps://github.com/issues"}
        ></textarea>
        <div className="btn-row">
          <button className="btn" disabled={isProcessing}>智能清洗</button>
          <button className="btn" disabled={isProcessing}>导出 JSON</button>
          <button 
            className={`btn btn-primary ${isProcessing ? 'loading' : ''}`} 
            style={{flex:1}}
            onClick={handleStart}
            disabled={isProcessing}
          >
            {isProcessing ? '处理中...' : (activeTab === 'manual' ? '开始分析' : '启动批量自动抓取')}
          </button>
        </div>
      </div>
    </section>
  );
}
