/**
 * 采集 Hook 共享类型定义
 * @file src/hooks/collector-types.ts
 * @version 1.11.6
 * @description `useCollector` 及其拆分模块共用的类型，集中维护避免循环依赖
 */

export type LogType = 'log' | 'error' | 'progress' | 'done';

export interface LogEntry {
  type: LogType;
  message: string;
  timestamp: number;
  /** 错误码（`type === 'error'` 时由服务端给出，见 `CollectErrorCode`） */
  code?: number;
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

/** SSE 事件流中单条 `data:` 负载的结构 */
export interface StreamEvent {
  type: LogType;
  message?: string;
  code?: number;
  data?: { type?: string; current?: number; total?: number; url?: string };
}
