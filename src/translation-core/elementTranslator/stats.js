/**
 * 翻译性能统计数据
 * @file src/translation-core/elementTranslator/stats.js
 */

export const initialPerformanceData = {
  translateStartTime: 0,
  translateEndTime: 0,
  elementsProcessed: 0,
  textsTranslated: 0,
  cacheHits: 0,
  cacheMisses: 0,
  cacheEvictions: 0,
  cacheCleanups: 0,
  domOperations: 0,
  domOperationTime: 0,
  networkRequests: 0,
  networkRequestTime: 0,
  dictionaryLookups: 0,
  partialMatches: 0,
  batchProcessings: 0,
  errorCount: 0,
  totalMemory: 0,
};
