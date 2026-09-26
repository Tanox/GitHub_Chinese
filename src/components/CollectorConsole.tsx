/**
 * 采集控制台（客户端岛）
 * @file src/components/CollectorConsole.tsx
 * @version 1.12.1
 * @description 承载采集状态与交互的最小客户端边界，外壳与静态内容保持服务端渲染
 */

'use client';
import React from 'react';
import ScriptInjector from '@/components/ScriptInjector';
import DataCenter from '@/components/DataCenter';
import PreviewTable from '@/components/PreviewTable';
import Dashboard from '@/components/Dashboard';
import { useCollector } from '@/hooks/useCollector';

/** 采集流程步骤（静态，模块级只创建一次） */
const STEPS = ['植入探针', '归集词条', '解析入库'];

export default function CollectorConsole() {
  const { logs, terms, progress, isProcessing, startCollect, startBatchCollect, clearLogs } =
    useCollector();

  return (
    <>
      <section id='section-flow' className='section' aria-labelledby='h-flow'>
        <h2 id='h-flow'>采集流程</h2>
        <p className='meta'>三步闭环：植入探针 → 归集词条 → 解析入库</p>
        <div className='steps' aria-label='采集流程'>
          {STEPS.map((label, index) => (
            <React.Fragment key={label}>
              {index > 0 && <span className='step-line'></span>}
              <div className='step-node done'>
                <span className='step-num'>{index + 1}</span>
                <span>{label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>

      <section id='section-entry' className='section' aria-labelledby='h-entry'>
        <h2 id='h-entry'>采集入口 · 探针脚本 + 数据中心</h2>
        <p className='meta'>左侧注入探针提取文本，右侧粘贴文本或批量导入 URL 后智能清洗</p>
        <div className='grid-2'>
          <ScriptInjector />
          <DataCenter
            terms={terms}
            onStartCollect={startCollect}
            onStartBatchCollect={startBatchCollect}
            isProcessing={isProcessing}
          />
        </div>
      </section>

      <section id='section-preview' className='section' aria-labelledby='h-preview'>
        <h2 id='h-preview'>清洗结果预览</h2>
        <p className='meta'>实时归集词条，标注待翻译 / 已翻译状态</p>
        <PreviewTable terms={terms} />
      </section>

      <section id='section-dashboard' className='section' aria-labelledby='h-dashboard'>
        <h2 id='h-dashboard'>引擎实时处理中心</h2>
        <p className='meta'>SSE 流式日志、进度与自动备份状态</p>
        <Dashboard logs={logs} progress={progress} onClear={clearLogs} />
      </section>
    </>
  );
}
