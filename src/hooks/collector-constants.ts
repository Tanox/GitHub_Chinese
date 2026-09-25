/**
 * 采集 Hook 共享常量
 * @file src/hooks/collector-constants.ts
 * @version 1.11.6
 * @description 进度初值、词条行正则、百分比上限等常量集中管理
 */

import type { ProgressState } from './collector-types';

/** 空进度初值 */
export const IDLE_PROGRESS: ProgressState = {
  type: 'idle',
  current: 0,
  total: 0,
  percent: 0,
};

/** 匹配服务端下发的词条行（形如 `1. "term"`） */
export const TERM_LINE_RE = /^\d+\. "(.+)"$/;

/** 百分比上限 */
export const PERCENT_MAX = 100;
