/**
 * 采集控制台（客户端岛）
 * @file src/components/CollectorConsole.tsx
 * @version 1.9.26
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
    </>
  );
}
