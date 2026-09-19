/**
 * 采集状态管理 Hook
 * @file src/hooks/useCollector.ts
 * @version 1.9.24
 * @description 负责发起采集请求、解析 SSE 事件流并维护日志/词条/进度状态
 */

import { useCallback, useState } from 'react';

export type LogType = 'log' | 'error' | 'progress' | 'done';

export interface LogEntry {
  type: LogType;
  message: string;
  timestamp: number;
}

export interface ProgressState {
  type: 'idle' | 'fetch' | 'analyze';
  current: number;
  total: number;
  url?: string;
  percent: number;
}

export type TermStatus = 'untranslated' | 'translated';

export interface TermEntry {
  text: string;
  status: TermStatus;
}

interface StreamEvent {
  type: LogType;
  message?: string;
  data?: { type?: string; current?: number; total?: number; url?: string };
}

const IDLE_PROGRESS: ProgressState = { type: 'idle', current: 0, total: 0, percent: 0 };
const TERM_LINE_RE = /^\d+\. "(.+)"$/;
const PERCENT_MAX = 100;

/**
 * 将未知异常转换为可读消息
 * @param error - 捕获到的异常
 * @returns 错误消息
 */
function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function useCollector() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [terms, setTerms] = useState<TermEntry[]>([]);
  const [progress, setProgress] = useState<ProgressState>(IDLE_PROGRESS);
  const [isProcessing, setIsProcessing] = useState(false);

  const addLog = useCallback((type: LogType, message: string) => {
    setLogs((prev) => [...prev, { type, message, timestamp: Date.now() }]);

    const matched = message.match(TERM_LINE_RE);
    if (matched) {
      setTerms((prev) => [...prev, { text: matched[1], status: 'untranslated' }]);
    }
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setTerms([]);
    setProgress(IDLE_PROGRESS);
  }, []);

  const applyEvent = useCallback(
    (event: StreamEvent) => {
      if (event.type === 'log' && event.message) {
        addLog('log', event.message);
        return;
      }
      if (event.type === 'error' && event.message) {
        addLog('error', event.message);
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
      if (!response.ok || !response.body) {
        addLog('error', `服务端返回异常状态: ${response.status}`);
        setIsProcessing(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() ?? '';

        chunks.forEach((chunk) => {
          if (!chunk.startsWith('data: ')) return;
          try {
            applyEvent(JSON.parse(chunk.slice(6)) as StreamEvent);
          } catch {
            addLog('error', '收到无法解析的事件流数据');
          }
        });
      }
    },
    [addLog, applyEvent],
  );

  const runRequest = useCallback(
    async (endpoint: string, payload: Record<string, unknown>, startMessage: string) => {
      setIsProcessing(true);
      clearLogs();
      addLog('log', startMessage);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        await handleStream(response);
      } catch (error) {
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
