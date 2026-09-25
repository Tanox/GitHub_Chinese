/**
 * 采集状态管理 Hook
 * @file src/hooks/useCollector.ts
 * @version 1.11.7
 * @description 负责发起采集请求、解析 SSE 事件流并维护日志/词条/进度状态
 */

import { useCallback, useRef, useState } from 'react';
import { IDLE_PROGRESS, PERCENT_MAX } from './collector-constants';
import { readSseStream } from './collector-sse';
import type {
  LogType,
  LogEntry,
  ProgressState,
  TermStatus,
  TermEntry,
  StreamEvent,
} from './collector-types';

// 保持对外导出契约：组件从本模块导入这些类型
export type {
  LogType,
  LogEntry,
  ProgressState,
  TermStatus,
  TermEntry,
  StreamEvent,
} from './collector-types';

/** 将未知异常转换为可读消息 */
function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function useCollector() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [terms, setTerms] = useState<TermEntry[]>([]);
  const [progress, setProgress] = useState<ProgressState>(IDLE_PROGRESS);
  const [isProcessing, setIsProcessing] = useState(false);

  const addLog = useCallback((type: LogType, message: string, code?: number) => {
    setLogs((prev) => [
      ...prev,
      { type, message, timestamp: Date.now(), ...(code !== undefined ? { code } : {}) },
    ]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setTerms([]);
    setProgress(IDLE_PROGRESS);
  }, []);

  const applyEvent = useCallback(
    (event: StreamEvent) => {
      if (event.type === 'term' && event.data?.text) {
        const text = event.data.text;
        setTerms((prev) => [...prev, { text, status: 'untranslated' }]);
        return;
      }
      if (event.type === 'log' && event.message) {
        addLog('log', event.message);
        return;
      }
      if (event.type === 'error' && event.message) {
        addLog('error', event.message, event.code);
        return;
      }
      if (event.type === 'done') {
        addLog('log', '任务完成');
        setProgress((prev) => ({ ...prev, type: 'analyze', percent: PERCENT_MAX }));
        setIsProcessing(false);
        return;
      }
      if (event.type === 'progress' && event.data) {
        const { type, current, total, url } = event.data;
        if (type === 'fetch' && current && total) {
          setProgress({
            type: 'fetch',
            current,
            total,
            url,
            percent: Math.round((current / total) * PERCENT_MAX),
          });
        } else if (type === 'analyze') {
          setProgress((prev) => ({ ...prev, type: 'analyze', percent: PERCENT_MAX }));
        }
      }
    },
    [addLog],
  );

  const handleStream = useCallback(
    async (response: Response) => {
      await readSseStream(response, applyEvent, (message) => addLog('error', message));
    },
    [addLog, applyEvent],
  );

  const abortRef = useRef<AbortController | null>(null);

  const runRequest = useCallback(
    async (endpoint: string, payload: Record<string, unknown>, startMessage: string) => {
      // 取消上一次可能仍在进行的请求，避免重复点击产生多个并行流
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsProcessing(true);
      clearLogs();
      addLog('log', startMessage);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        await handleStream(response);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        addLog('error', `请求失败: ${describeError(error)}`);
      } finally {
        setIsProcessing(false);
      }
    },
    [addLog, clearLogs, handleStream],
  );

  const startCollect = useCallback(
    (data: string) => runRequest('/api/collect', { data }, '开始分析粘贴的数据...'),
    [runRequest],
  );

  const startBatchCollect = useCallback(
    (urls: string[]) =>
      runRequest('/api/batch-collect', { urls }, `开始批量处理 ${urls.length} 个 URL...`),
    [runRequest],
  );

  return {
    logs,
    terms,
    progress,
    isProcessing,
    startCollect,
    startBatchCollect,
    clearLogs,
  };
}
