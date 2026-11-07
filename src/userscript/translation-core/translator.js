/**
 * 翻译执行逻辑模块
 * @file src/userscript/translation-core/translator.js
 * @version 1.13.28
 * @description 恢复操作改为 await 真实 Promise 结果，避免异步恢复失败时外层 Promise 永不 settle。
 */
import { CONFIG } from '../config/index.js';
import { ErrorHandler } from '../core/errorHandler/index.js';
import { dictionaryManager } from './dictionaryManager.js';
import { elementSelector } from './elementSelector.js';
import { elementTranslator } from './elementTranslator.js';
import { performanceMonitor } from './performanceMonitor.js';
import { processElementsInBatches } from './batchProcessor.js';

/** 翻译完成后统一记录性能数据 */
function finishPerformance() {
  elementTranslator.performanceData.translateEndTime = Date.now();
  performanceMonitor.logPerformanceData();
}

/**
 * 批处理失败后执行「关键元素」恢复，并把恢复结果映射到外层 Promise
 * @param {unknown} batchError - 原始批处理错误
 * @param {object} translationCore - 翻译核心实例
 * @param {() => void} resolve - 外层 Promise resolve
 * @param {(error: unknown) => void} reject - 外层 Promise reject
 * @returns {void}
 */
function recoverFromBatchError(batchError, translationCore, resolve, reject) {
  const recovery = ErrorHandler.handleError(
    '批处理过程',
    batchError,
    ErrorHandler.ERROR_TYPES.TRANSLATION,
    {
      retryable: true,
      // 必须返回 Promise：recoveryManager 会 await 它并据此判断是否重试
      recoveryFn: () => translationCore.translateCriticalElementsOnly(),
      maxRetries: 2,
    },
  );
  Promise.resolve(recovery)
    .then((ok) => {
      finishPerformance();
      if (ok) resolve();
      else reject(batchError);
    })
    .catch((recoverError) => {
      finishPerformance();
      reject(recoverError);
    });
}

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
          finishPerformance();
          resolve();
        })
        .catch((batchError) => recoverFromBatchError(batchError, translationCore, resolve, reject));
    } catch (error) {
      recoverFromBatchError(error, translationCore, resolve, reject);
    }
  });
}

export function translateCriticalElementsOnly() {
  return elementTranslator.translateCriticalElementsOnly();
}
