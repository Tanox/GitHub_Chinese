/**
 * 翻译批处理模块
 * @file src/translation-core/batchProcessor.js
 */
import { CONFIG } from '../config.js';
import { ErrorHandler } from '../core/errorHandler.js';
import virtualDomManager from '../core/virtualDom.js';
import { elementTranslator } from './elementTranslator.js';

export async function processElementsInBatches(inputElements, getCurrentPageModeConfig) {
  const elements = virtualDomManager.processElements(inputElements);
  const modeConfig = getCurrentPageModeConfig();
  const batchSize = modeConfig.batchSize || CONFIG.performance?.batchSize || 50;
  const delay = CONFIG.performance?.batchDelay || 0;

  if (!elements || !Array.isArray(elements) || elements.length === 0) {
    return Promise.resolve();
  }

  const validElements = elements.filter((element) => element instanceof HTMLElement);

  if (validElements.length <= batchSize) {
    validElements.forEach((element) => {
      try {
        elementTranslator.translateElement(element);
      } catch (error) {
        ErrorHandler.handleError('翻译元素', error, ErrorHandler.ERROR_TYPES.DOM_OPERATION);
      }
    });
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const processBatch = (startIndex) => {
      try {
        const endIndex = Math.min(startIndex + batchSize, validElements.length);
        const batch = validElements.slice(startIndex, endIndex);

        batch.forEach((element) => {
          try {
            elementTranslator.translateElement(element);
          } catch (error) {
            ErrorHandler.handleError('翻译元素', error, ErrorHandler.ERROR_TYPES.DOM_OPERATION);
          }
        });

        if (
          CONFIG.performance?.logTiming &&
          (endIndex % (batchSize * 5) === 0 || endIndex === validElements.length)
        ) {
          const progress = Math.round((endIndex / validElements.length) * 100);
          console.log(
            `[GitHub 中文翻译] 翻译进度: ${progress}%, 已处理: ${endIndex}/${validElements.length} 元素`,
          );
        }

        if (endIndex < validElements.length) {
          if (delay > 0) {
            setTimeout(() => processBatch(endIndex), delay);
          } else {
            requestAnimationFrame(() => processBatch(endIndex));
          }
        } else {
          resolve();
        }
      } catch (error) {
        ErrorHandler.handleError('批处理过程', error, ErrorHandler.ERROR_TYPES.TRANSLATION);
        resolve();
      }
    };

    processBatch(0);
  });
}
