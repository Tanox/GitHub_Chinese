/**
 * 翻译核心主模块
 * @file translationCore/index.js
 */
import { CONFIG } from '../config.js';
import { ErrorHandler } from '../core/errorHandler.js';
import { dictionaryManager } from './dictionaryManager.js';
import { pageModeDetector } from './pageModeDetector.js';
import { elementTranslator } from './elementTranslator.js';
import { performanceMonitor } from './performanceMonitor.js';
import { cacheController } from './cacheController.js';
import { translate, translateCriticalElementsOnly } from './translator.js';
import { setupPageUnloadHandler, startCacheCleanupTimer } from './lifecycle.js';

export const translationCore = {
  isPageUnloading: false,
  cacheCleanupTimer: null,
  unloadHandler: null,

  init() {
    try {
      dictionaryManager.init();
      this.unloadHandler = setupPageUnloadHandler(this);
      this.cacheCleanupTimer = startCacheCleanupTimer(this);
      this.warmUpCache();

      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 翻译核心初始化完成');
      }
    } catch (error) {
      ErrorHandler.handleError('翻译核心初始化', error, ErrorHandler.ERROR_TYPES.INITIALIZATION);
    }
  },

  cleanup() {
    try {
      if (this.cacheCleanupTimer) {
        clearInterval(this.cacheCleanupTimer);
        this.cacheCleanupTimer = null;
      }

      if (this.unloadHandler) {
        window.removeEventListener('beforeunload', this.unloadHandler);
        window.removeEventListener('unload', this.unloadHandler);
        window.removeEventListener('pagehide', this.unloadHandler);
        this.unloadHandler = null;
      }

      this.clearCache();

      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 翻译核心资源清理完成');
      }
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 翻译核心资源清理失败:', error);
      }
    }
  },

  detectPageMode() {
    return pageModeDetector.detectPageMode();
  },

  getCurrentPageModeConfig() {
    return pageModeDetector.getCurrentPageModeConfig();
  },

  async translate(targetElements = null) {
    return translate(targetElements, this);
  },

  translateCriticalElementsOnly() {
    return translateCriticalElementsOnly();
  },

  cleanCache() {
    cacheController.cleanCache(elementTranslator.performanceData);
  },

  clearCache() {
    cacheController.clearCache();
  },

  warmUpCache() {
    cacheController.warmUpCache(this.isPageUnloading);
  },

  updateDictionary(newDictionary) {
    dictionaryManager.updateDictionary(newDictionary);
  },

  // 暴露性能监控方法
  resetPerformanceData: () => performanceMonitor.resetPerformanceData(),
  logPerformanceData: () => performanceMonitor.logPerformanceData(),
  recordPerformanceEvent: (eventType, data) =>
    performanceMonitor.recordPerformanceEvent(eventType, data),
  getPerformanceStats: () => performanceMonitor.getPerformanceStats(),
  exportPerformanceData: () => performanceMonitor.exportPerformanceData(),
};
