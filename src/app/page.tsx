/**
 * 词典采集工作台首页
 * @file src/app/page.tsx
 * @version 1.9.24
 * @description 组合探针脚本、数据中心、词条预览与实时处理中心面板
 */

'use client';
import React from 'react';
import ScriptInjector from '@/components/ScriptInjector';
import DataCenter from '@/components/DataCenter';
import PreviewTable from '@/components/PreviewTable';
import Dashboard from '@/components/Dashboard';
import { useCollector } from '@/hooks/useCollector';
import { VERSION } from '@/version';

export default function CollectorPage() {
  const { logs, terms, progress, isProcessing, startCollect, startBatchCollect, clearLogs } =
    useCollector();

  return (
    <div id='collector-workspace' className='workspace'>
      {/* 侧栏 */}
      <aside id='collector-rail' className='rail'>
        <div className='rail-brand'>
          <div className='rail-mark'>中</div>
          <span className='rail-name'>GitHub 中文</span>
        </div>
        <div className='rail-body scroll'>
          <div>
            <p className='rail-section-title'>工作台</p>
            <nav className='rail-nav' aria-label='工作台导航'>
              <span id='rail-link-console' className='rail-link active' aria-current='page'>
                采集控制台
              </span>
              <span
                id='rail-link-overview'
                className='rail-link is-disabled'
                aria-disabled='true'
                title='规划中'
              >
                项目概览
              </span>
              <span
                id='rail-link-design'
                className='rail-link is-disabled'
                aria-disabled='true'
                title='规划中'
              >
                设计系统
              </span>
            </nav>
          </div>
          <div>
            <p className='rail-section-title'>引擎状态</p>
            <div className='rail-stat'>
              <div className='rail-stat-row'>
                <span className='k'>引擎版本</span>
                <span className='v'>v{VERSION}</span>
              </div>
              <div className='rail-stat-row'>
                <span className='k'>运行环境</span>
                <span className='v'>本地</span>
              </div>
            </div>
          </div>
        </div>
        <div className='rail-foot'>
          <span className='dot'></span>
          <span>采集服务运行中</span>
        </div>
      </aside>

      {/* 主区 */}
      <main id='collector-main' className='workspace'>
        <div id='toastContainer' className='toast-wrap'></div>
        <header className='topbar'>
          <div>
            <h1>词典采集工作台</h1>
            <p className='topbar-sub'>从 GitHub 原生界面抓取 UI 词条，沉淀中文本地化词典</p>
          </div>
          <div className='status-pill'>
            <span className='dot'></span>
            本地优先 · 离线可用
          </div>
        </header>

        <div id='collector-content' className='content scroll'>
          <div className='content-inner'>
            <div className='steps' aria-label='采集流程'>
              <div className='step-node done'>
                <span className='step-num'>1</span>
                <span>植入探针</span>
              </div>
              <span className='step-line'></span>
              <div className='step-node done'>
                <span className='step-num'>2</span>
                <span>归集词条</span>
              </div>
              <span className='step-line'></span>
              <div className='step-node done'>
                <span className='step-num'>3</span>
                <span>解析入库</span>
              </div>
            </div>

            <div className='grid-2'>
              <ScriptInjector />
              <DataCenter
                terms={terms}
                onStartCollect={startCollect}
                onStartBatchCollect={startBatchCollect}
                isProcessing={isProcessing}
              />
            </div>

            <PreviewTable terms={terms} />
            <Dashboard logs={logs} progress={progress} onClear={clearLogs} />
          </div>
        </div>
      </main>
    </div>
  );
}
