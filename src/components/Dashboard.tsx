import React, { useRef, useEffect } from 'react';
import { LogEntry, ProgressState } from '@/hooks/useCollector';

interface DashboardProps {
  logs: LogEntry[];
  progress: ProgressState;
  onClear: () => void;
}

export default function Dashboard({ logs, progress, onClear }: DashboardProps) {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <section className='progress-card'>
      <div className='progress-head'>
        <h2>引擎实时处理中心</h2>
        <div className={`status-indicator ${progress.type !== 'idle' ? 'active' : ''}`}>
          <span className='ping'></span>
          {progress.type === 'idle' ? 'Ready' : 'Processing'}
        </div>
      </div>

      <div className='progress-meta'>
        <div className='progress-label'>当前任务</div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '1rem',
          }}
        >
          <span className='progress-task'>
            {progress.type === 'idle'
              ? '引擎准备就绪'
              : progress.type === 'fetch'
                ? `抓取中: ${progress.url}`
                : '分析并清洗词典...'}
          </span>
          <span className='progress-percent'>{progress.percent}%</span>
        </div>
      </div>

      <div
        className='progress-track'
        role='progressbar'
        aria-label='采集进度'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.percent}
      >
        <div className='progress-fill' style={{ width: `${progress.percent}%` }}></div>
      </div>

      <div className='backup-pill'>
        {progress.type === 'idle' ? '等待首次自动备份...' : '系统自动备份已开启'}
      </div>

      <div className='terminal'>
        <div className='term-bar'>
          <div className='term-dots' aria-hidden='true'>
            <i className='r'></i>
            <i className='y'></i>
            <i className='g'></i>
          </div>
          <span className='term-title'>i18n-engine --stream</span>
          <button className='term-clear' onClick={onClear}>
            Clear
          </button>
        </div>
        <div
          className='term-body'
          ref={terminalRef}
          role='log'
          aria-live='polite'
          aria-label='引擎实时日志'
        >
          {logs.map((log, i) => (
            <div key={i} className={`log-line ${log.type}`}>
              <span className='log-time'>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className='log-msg'>{log.message}</span>
              {log.code !== undefined && <span className='log-code'>E{log.code}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
