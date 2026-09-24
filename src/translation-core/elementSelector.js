/**
 * 翻译元素选择模块
 * @file translationCore/elementSelector.js
 */
import { CONFIG } from '../config.js';
import virtualDomManager from '../core/virtualDom.js';
import {
  isSkipTag,
  hasSkipClass,
  hasSkipId,
  isHiddenElement,
  isNumericOrSpecialOnly,
} from './selectorUtils.js';

export const elementSelector = {
  elementCache: new WeakMap(),

  getElementsToTranslate() {
    const uniqueElements = new Set();
    const allSelectors = [...CONFIG.selectors.primary, ...CONFIG.selectors.popupMenus];

    if (allSelectors.length <= 10) {
      const combinedSelector = allSelectors.join(', ');
      try {
        const allElements = document.querySelectorAll(combinedSelector);
        Array.from(allElements).forEach((element) => {
          if (this.shouldTranslateElement(element)) {
            uniqueElements.add(element);
          }
        });
        if (CONFIG.debugMode && CONFIG.performance?.logTiming) {
          console.log(
            `[GitHub 中文翻译] 合并查询选择器: ${combinedSelector}, 结果数量: ${allElements.length}`,
          );
        }
        return Array.from(uniqueElements);
      } catch (error) {
        if (CONFIG.debugMode) {
          console.warn('[GitHub 中文翻译] 合并选择器查询失败，回退到逐个查询:', error);
        }
      }
    }

    allSelectors.forEach((selector) => {
      try {
        const matchedElements = document.querySelectorAll(selector);
        Array.from(matchedElements).forEach((element) => {
          if (this.shouldTranslateElement(element)) {
            uniqueElements.add(element);
          }
        });
      } catch (error) {
        if (CONFIG.debugMode) {
          console.warn(`[GitHub 中文翻译] 选择器 "${selector}" 解析失败:`, error);
        }
      }
    });

    return Array.from(uniqueElements).filter((element) => element instanceof HTMLElement);
  },

  shouldTranslateElement(element) {
    if (!element || !(element instanceof HTMLElement)) {
      return false;
    }

    if (element.hasAttribute('data-github-zh-translated')) {
      return false;
    }

    if (!element.textContent.trim()) {
      return false;
    }

    if (isSkipTag(element.tagName)) {
      return false;
    }

    if (
      element.hasAttribute('data-no-translate') ||
      (element.hasAttribute('translate') && element.getAttribute('translate') === 'no') ||
      element.hasAttribute('aria-hidden') ||
      element.hasAttribute('hidden')
    ) {
      return false;
    }

    if (hasSkipClass(element.className)) {
      return false;
    }

    if (hasSkipId(element.id)) {
      return false;
    }

    if (isHiddenElement(element)) {
      return false;
    }

    const textContent = element.textContent.trim();
    if (!textContent || isNumericOrSpecialOnly(textContent)) {
      return false;
    }

    return true;
  },

  shouldTranslate(element) {
    return virtualDomManager.shouldTranslate(element);
  },
};
