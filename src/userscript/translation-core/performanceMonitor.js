/**
 * 性能监控模块
 * @file translationCore/performanceMonitor.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 监控翻译性能数据
 */
import { CONFIG } from '../config.js';
import { elementTranslator } from './elementTranslator.js';

export const performanceMonitor = {
  get performanceData() {
    return elementTranslator.performanceData;
  },

  resetPerformanceData() {
    elementTranslator.performanceData = {
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
  },

  logPerformanceData() {
    if (CONFIG.debugMode && CONFIG.performance?.logTiming) {
      const duration = Date.now() - elementTranslator.performanceData.translateStartTime;
      console.log(`[GitHub 中文翻译] 性能数据 - 总耗时: ${duration}ms`);
      console.log(`  元素处理: ${elementTranslator.performanceData.elementsProcessed}`);
      console.log(`  文本翻译: ${elementTranslator.performanceData.textsTranslated}`);
      console.log(`  缓存命中: ${elementTranslator.performanceData.cacheHits}`);
      console.log(`  缓存未命中: ${elementTranslator.performanceData.cacheMisses}`);
    }
  },

  recordPerformanceEvent(eventType, data = {}) {
    switch (eventType) {
      case 'dom-operation':
        elementTranslator.performanceData.domOperations++;
        elementTranslator.performanceData.domOperationTime += data.duration || 0;
        break;
      case 'network-request':
        elementTranslator.performanceData.networkRequests++;
        elementTranslator.performanceData.networkRequestTime += data.duration || 0;
        break;
      case 'dictionary-lookup':
        elementTranslator.performanceData.dictionaryLookups++;
        break;
      case 'partial-match':
        elementTranslator.performanceData.partialMatches++;
        break;
      case 'batch-processing':
        elementTranslator.performanceData.batchProcessings++;
        break;
      case 'error':
        elementTranslator.performanceData.errorCount++;
        break;
      default:
        // 未知事件类型
        break;
    }
  },

  getPerformanceStats() {
    const stats = { ...elementTranslator.performanceData };
    if (stats.translateStartTime > 0) {
      stats.totalDuration =
        stats.translateEndTime > 0
          ? stats.translateEndTime - stats.translateStartTime
          : Date.now() - stats.translateStartTime;
    } else {
      stats.totalDuration = 0;
    }

    const totalCacheRequests = stats.cacheHits + stats.cacheMisses;
    stats.cacheHitRate =
      totalCacheRequests > 0
        ? ((stats.cacheHits / totalCacheRequests) * 100).toFixed(2) + '%'
        : '0%';

    stats.avgDomOperationTime =
      stats.domOperations > 0
        ? (stats.domOperationTime / stats.domOperations).toFixed(2) + 'ms'
        : '0ms';

    return stats;
  },

  exportPerformanceData() {
    const data = {
      timestamp: new Date().toISOString(),
      stats: this.getPerformanceStats(),
      userAgent: navigator.userAgent,
      browserLanguage: navigator.language,
    };
    return JSON.stringify(data, null, 2);
  },
};
