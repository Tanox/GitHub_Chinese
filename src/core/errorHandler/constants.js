/**
 * 错误处理常量与类型定义
 * @file src/core/errorHandler/constants.js
 */

export const RECOVERY_BASE_DELAY_MS = 100;
export const RECOVERY_MAX_DELAY_MS = 2000;
export const DEFAULT_THRESHOLD = 20;
export const BATCH_DELAY_MIN_MS = 50;
export const NETWORK_INTERVAL_MIN_MS = 1000;
export const NETWORK_INTERVAL_MAX_MS = 5000;
export const BATCH_DELAY_FALLBACK_MS = 100;

export const ERROR_TYPES = {
  TRANSLATION: 'translation',
  DOM_OPERATION: 'dom_operation',
  DICTIONARY: 'dictionary',
  NETWORK: 'network',
  PERFORMANCE: 'performance',
  OTHER: 'other',
};
