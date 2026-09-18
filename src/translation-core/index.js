/**
 * 翻译核心主模块
 * @file translationCore/index.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 翻译核心主入口，整合所有子模块
 */
import { CONFIG } from '../config.js';
import { ErrorHandler } from '../core/errorHandler.js';
import { dictionaryManager } from './dictionaryManager.js';
import { pageModeDetector } from './pageModeDetector.js';
import { elementSelector } from './elementSelector.js';
import { elementTranslator } from './elementTranslator.js';
import { performanceMonitor } from './performanceMonitor.js';
import { processElementsInBatches } from './batchProcessor.js';
import { cacheController } from './cacheController.js';

export const translationCore = {
  isPageUnloading: false,
  cacheCleanupTimer: null,
  unloadHandler: null,

  init() {
    try {
      dictionaryManager.init();
      this.setupPageUnloadHandler();
      this.startCacheCleanupTimer();
      this.warmUpCache();

      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 翻译核心初始化完成');
      }
    } catch (error) {
      ErrorHandler.handleError('翻译核心初始化', error, ErrorHandler.ERROR_TYPES.INITIALIZATION);
    }
  },

  setupPageUnloadHandler() {
    const unloadHandler = () => {
      this.isPageUnloading = true;
      this.cleanup();
    };

    window.addEventListener('beforeunload', unloadHandler);
    window.addEventListener('unload', unloadHandler);
    window.addEventListener('pagehide', unloadHandler);

    this.unloadHandler = unloadHandler;
  },

  startCacheCleanupTimer() {
    this.stopCacheCleanupTimer();
    const CLEANUP_INTERVAL_MS = 120000; // 清理间隔（2分钟）
    this.cacheCleanupTimer = setInterval(() => {
      if (this.isPageUnloading) {
        this.stopCacheCleanupTimer();
        return;
      }
      this.cleanCache();
    }, CLEANUP_INTERVAL_MS);
  },

  stopCacheCleanupTimer() {
    if (this.cacheCleanupTimer) {
      clearInterval(this.cacheCleanupTimer);
      this.cacheCleanupTimer = null;
    }
  },

  cleanup() {
    try {
      this.stopCacheCleanupTimer();

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
    if (!dictionaryManager.dictionary || Object.keys(dictionaryManager.dictionary).length === 0) {
      dictionaryManager.init();
    }

    const pageMode = this.detectPageMode();
    const modeConfig = this.getCurrentPageModeConfig();

    if (CONFIG.debugMode) {
      console.log(`[GitHub 中文翻译] 当前页面模式: ${pageMode}`, modeConfig);
    }

    performanceMonitor.resetPerformanceData();
    elementTranslator.performanceData.translateStartTime = Date.now();

    return new Promise((resolve, reject) => {
      try {
        let elements;

        if (Array.isArray(targetElements)) {
          elements = targetElements.filter((el) => el && el instanceof HTMLElement);
          if (CONFIG.debugMode) {
            console.log(`[GitHub 中文翻译] 翻译特定区域，目标元素数量: ${elements.length}`);
          }
        } else {
          elements = elementSelector.getElementsToTranslate();
          if (CONFIG.debugMode) {
            console.log(`[GitHub 中文翻译] 翻译整个页面，目标元素数量: ${elements.length}`);
          }
        }

        if (!elements || elements.length === 0) {
          if (CONFIG.debugMode) {
            console.log('[GitHub 中文翻译] 没有找到需要翻译的元素');
          }
          performanceMonitor.logPerformanceData();
          resolve();
          return;
        }

        processElementsInBatches(elements, () => this.getCurrentPageModeConfig())
          .then(() => {
            elementTranslator.performanceData.translateEndTime = Date.now();
            performanceMonitor.logPerformanceData();
            resolve();
          })
          .catch((batchError) => {
            ErrorHandler.handleError(
              '批处理过程',
              batchError,
              ErrorHandler.ERROR_TYPES.TRANSLATION,
              {
                retryable: true,
                recoveryFn: () => {
                  this.translateCriticalElementsOnly()
                    .then(() => {
                      elementTranslator.performanceData.translateEndTime = Date.now();
                      performanceMonitor.logPerformanceData();
                      resolve();
                    })
                    .catch((recoverError) => {
                      ErrorHandler.handleError(
                        '错误恢复',
                        recoverError,
                        ErrorHandler.ERROR_TYPES.TRANSLATION,
                      );
                      elementTranslator.performanceData.translateEndTime = Date.now();
                      performanceMonitor.logPerformanceData();
                      reject(recoverError);
                    });
                },
                maxRetries: 2,
              },
            );
          });
      } catch (error) {
        ErrorHandler.handleError('翻译过程', error, ErrorHandler.ERROR_TYPES.TRANSLATION, {
          retryable: true,
          recoveryFn: () => {
            this.translateCriticalElementsOnly()
              .then(() => {
                performanceMonitor.logPerformanceData();
                resolve();
              })
              .catch((recoverError) => {
                ErrorHandler.handleError(
                  '错误恢复',
                  recoverError,
                  ErrorHandler.ERROR_TYPES.TRANSLATION,
                );
                performanceMonitor.logPerformanceData();
                reject(recoverError);
              });
          },
          maxRetries: 2,
        });
      }
    });
  },

  translateCriticalElementsOnly() {
    return elementTranslator.translateCriticalElementsOnly();
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
