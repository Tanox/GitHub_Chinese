/**
 * 关键元素翻译模块
 * @file src/translation-core/elementTranslator/critical.js
 */
import { CONFIG } from '../../config.js';
import { ErrorHandler } from '../../core/errorHandler.js';

/**
 * 翻译页面关键区域元素（失败降级策略的兜底实现）
 * @param {Function} translateElementFn - 单元素翻译函数
 */
export function translateCriticalElements(translateElementFn) {
  const criticalSelectors = ['.Header', '.repository-content', '.js-repo-pjax-container', 'main'];

  const criticalElements = [];
  let processedElements = 0;
  let failedElements = 0;

  criticalSelectors.forEach((selector) => {
    try {
      const elements = document.querySelectorAll(selector);
      if (elements && elements.length > 0) {
        Array.from(elements).forEach((el) => {
          if (el && el instanceof HTMLElement) {
            criticalElements.push(el);
          }
        });

        if (CONFIG.debugMode) {
          console.log(`[GitHub 中文翻译] 找到关键元素: ${selector}, 数量: ${elements.length}`);
        }
      }
    } catch (err) {
      ErrorHandler.handleError('查询选择器', err, ErrorHandler.ERROR_TYPES.DOM_OPERATION);
    }
  });

  if (criticalElements.length === 0) {
    if (CONFIG.debugMode) {
      console.log('[GitHub 中文翻译] 没有找到关键元素需要翻译');
    }
    return;
  }

  criticalElements.forEach((element) => {
    try {
      translateElementFn(element);
      processedElements++;
    } catch (err) {
      failedElements++;
      ErrorHandler.handleError('关键元素翻译', err, ErrorHandler.ERROR_TYPES.DOM_OPERATION);
    }
  });

  if (CONFIG.debugMode) {
    console.log(
      `[GitHub 中文翻译] 关键元素翻译完成 - 总数量: ${criticalElements.length}, 成功: ${processedElements}, 失败: ${failedElements}`,
    );
  }
}
