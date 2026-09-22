/**
 * 词典采集服务端入口（类型门面）
 * @file src/lib/collector-logic.ts
 * @version 1.9.26
 * @description 为 Next.js Route Handler 提供带类型的采集入口，实现收敛在 collector-core.js
 */

import {
  collectFromUrls as collectFromUrlsCore,
  processRawData as processRawDataCore,
} from './collector-core.js';

export type CollectEventType = 'log' | 'error' | 'progress' | 'done';

export interface CollectEvent {
  type: CollectEventType;
  message?: string;
  data?: Record<string, unknown>;
  code?: number | null;
}

/**
 * 批量抓取 URL 页面文本并交由词典清洗
 * @param urls - 目标页面 URL 列表
 * @returns 采集事件流
 */
export function collectFromUrls(urls: string[]): AsyncGenerator<CollectEvent> {
  return collectFromUrlsCore(urls);
}

/**
 * 处理用户在界面粘贴的文本
 * @param data - 粘贴的原始文本
 * @returns 采集事件流
 */
export function processRawData(data: string): AsyncGenerator<CollectEvent> {
  return processRawDataCore(data);
}
