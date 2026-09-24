/**
 * 翻译执行逻辑模块
 * @file src/translation-core/translator.js
 */
import { CONFIG } from '../config.js';
import { ErrorHandler } from '../core/errorHandler.js';
import { dictionaryManager } from './dictionaryManager.js';
import { elementSelector } from './elementSelector.js';
import { elementTranslator } from './elementTranslator.js';
import { performanceMonitor } from './performanceMonitor.js';
import { processElementsInBatches } from './batchProcessor.js';

export async function translate(targetElements = null, translationCore) {
  if (!dictionaryManager.dictionary || Object.keys(dictionaryManager.dictionary).length === 0) {
    dictionaryManager.init();
  }

  const pageMode = translationCore.detectPageMode();
  const modeConfig = translationCore.getCurrentPageModeConfig();

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

      processElementsInBatches(elements, () => translationCore.getCurrentPageModeConfig())
        .then(() => {
          elementTranslator.performanceData.translateEndTime = Date.now();
          performanceMonitor.logPerformanceData();
          resolve();
        })
        .catch((batchError) => {
          ErrorHandler.handleError('批处理过程', batchError, ErrorHandler.ERROR_TYPES.TRANSLATION, {
            retryable: true,
            recoveryFn: () => {
              translationCore
                .translateCriticalElementsOnly()
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
          });
        });
    } catch (error) {
      ErrorHandler.handleError('翻译过程', error, ErrorHandler.ERROR_TYPES.TRANSLATION, {
        retryable: true,
        recoveryFn: () => {
          translationCore
            .translateCriticalElementsOnly()
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
}

export function translateCriticalElementsOnly() {
  return elementTranslator.translateCriticalElementsOnly();
}
