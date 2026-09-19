import { useState, useCallback } from 'react';

export interface LogEntry {
  type: 'log' | 'error' | 'progress' | 'done';
  message: string;
  timestamp: number;
}

export interface ProgressState {
  type: string;
  current: number;
  total: number;
  url?: string;
  percent: number;
}

export interface TermEntry {
  text: string;
  status: 'untranslated' | 'translated';
}

export function useCollector() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [terms, setTerms] = useState<TermEntry[]>([]);
  const [progress, setProgress] = useState<ProgressState>({
    type: 'idle',
    current: 0,
    total: 0,
    percent: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, { type, message, timestamp: Date.now() }]);
    
    // Simple parsing for terms in logs
    if (message.match(/^\d+\. "(.+)"$/)) {
      const match = message.match(/^\d+\. "(.+)"$/);
      if (match) {
        setTerms(prev => [...prev, { text: match[1], status: 'untranslated' }]);
      }
    }
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setTerms([]);
  }, []);

  const handleStream = async (response: Response) => {
    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = '';

    setTerms([]); // Reset terms for new run

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const event = JSON.parse(line.slice(6));
          
          if (event.type === 'log') addLog('log', event.message);
          if (event.type === 'error') addLog('error', event.message);
          if (event.type === 'progress') {
            if (event.data?.type === 'fetch') {
                const { current, total, url } = event.data;
                setProgress({
                    type: 'fetch',
                    current,
                    total,
                    url,
                    percent: Math.round((current / total) * 100)
                });
            } else if (event.data?.type === 'analyze') {
                setProgress(prev => ({ ...prev, type: 'analyze', percent: 100 }));
            }
          }
          if (event.type === 'done') {
            addLog('log', '任务完成');
            setIsProcessing(false);
          }
        }
      }
    }
  };

  const startCollect = async (data: string) => {
    setIsProcessing(true);
    clearLogs();
    addLog('log', '开始分析粘贴的数据...');
    
    try {
      const response = await fetch('/api/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });
      await handleStream(response);
    } catch (err: any) {
      addLog('error', `请求失败: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const startBatchCollect = async (urls: string[]) => {
    setIsProcessing(true);
    clearLogs();
    addLog('log', `开始批量处理 ${urls.length} 个 URL...`);

    try {
      const response = await fetch('/api/batch-collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });
      await handleStream(response);
    } catch (err: any) {
      addLog('error', `请求失败: ${err.message}`);
      setIsProcessing(false);
    }
  };

  return {
    logs,
    terms,
    progress,
    isProcessing,
    startCollect,
    startBatchCollect,
    clearLogs
  };
}
