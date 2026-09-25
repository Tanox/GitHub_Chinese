/**
 * 词典采集服务端入口（类型门面）
 * @file src/lib/collector-logic.ts
 * @version 1.9.28
 * @description 为 Next.js Route Handler 提供带类型的采集入口，实现收敛在 collector-core.js
 */

import {
  collectFromUrls as collectFromUrlsCore,
  processRawData as processRawDataCore,
} from './collector-core.js';
import { CollectErrorCode } from './collect-codes.js';

/** 采集流程错误码（服务端与前端共用，便于前端按类型分流） */
export { CollectErrorCode };

export type CollectEventType = 'log' | 'error' | 'progress' | 'done';

export interface CollectEvent {
  type: CollectEventType;
  message?: string;
  data?: Record<string, unknown>;
  /**
   * 错误码（`type === 'error'` 时有效），取值见 `CollectErrorCode`。
   * `done` 事件携带的 `code` 为子进程退出码，语义不同。
   */
  code?: number | null;
}

/**
 * 批量抓取 URL 页面文本并交由词典清洗
 * @param urls - 目标页面 URL 列表
 * @param options - 可选取消信号等运行时选项
 * @returns 采集事件流
 */
export function collectFromUrls(
  urls: string[],
  options?: { signal?: AbortSignal },
): AsyncGenerator<CollectEvent> {
  return collectFromUrlsCore(urls, options);
}

/**
 * 处理用户在界面粘贴的文本
 * @param data - 粘贴的原始文本
 * @param options - 可选取消信号等运行时选项
 * @returns 采集事件流
 */
export function processRawData(
  data: string,
  options?: { signal?: AbortSignal },
): AsyncGenerator<CollectEvent> {
  return processRawDataCore(data, options);
}
