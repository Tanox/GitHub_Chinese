/**
 * 元素翻译模块
 * @file translationCore/elementTranslator.js
 */
import { CONFIG } from '../config.js';
import virtualDomManager from '../core/virtualDom.js';
import { dictionaryManager } from './dictionaryManager.js';
import { elementSelector } from './elementSelector.js';
import { initialPerformanceData } from './elementTranslator/stats.js';
import { translateCriticalElements } from './elementTranslator/critical.js';

export const elementTranslator = {
  performanceData: { ...initialPerformanceData },

  translateElement(element) {
    if (!element || !(element instanceof HTMLElement)) {
      return false;
    }

    if (!elementSelector.shouldTranslate(element)) {
      return false;
    }

    if (elementSelector.elementCache.has(element)) {
      return false;
    }

    if (element.hasAttribute('data-github-zh-translated')) {
      elementSelector.elementCache.set(element, true);
      return false;
    }

    this.performanceData.elementsProcessed++;

    if (!elementSelector.shouldTranslateElement(element)) {
      return false;
    }

    const fragment = document.createDocumentFragment();
    let hasTranslation = false;
    let hasTranslatableContent = false;

    const childNodes = Array.from(element.childNodes);
    const textNodesToProcess = [];

    for (const node of childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const trimmedText = node.nodeValue.trim();
        if (trimmedText && trimmedText.length >= CONFIG.performance?.minTextLengthToTranslate) {
          const translatedText = dictionaryManager.getTranslatedText(trimmedText);
          if (translatedText && translatedText !== trimmedText) {
            textNodesToProcess.push({ node, originalText: node.nodeValue });
            hasTranslatableContent = true;
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        try {
          element.removeChild(node);
          fragment.appendChild(node);
          const childTranslated = this.translateElement(node);
          hasTranslatableContent ||= childTranslated;
        } catch (e) {
          if (CONFIG.debugMode) {
            console.error('[GitHub 中文翻译] 处理子元素失败:', e, '元素:', node);
          }
          try {
            if (!node.parentNode) {
              element.appendChild(node);
            }
          } catch (addBackError) {
            if (CONFIG.debugMode) {
              console.error('[GitHub 中文翻译] 将子元素添加回原始位置失败:', addBackError);
            }
          }
        }
      }
    }

    if (!hasTranslatableContent) {
      return false;
    }

    textNodesToProcess.forEach(({ node, originalText }) => {
      const parentNode = node.parentNode;
      if (parentNode) {
        parentNode.removeChild(node);
      }

      const translatedText = dictionaryManager.getTranslatedText(originalText.trim());

      if (
        translatedText &&
        typeof translatedText === 'string' &&
        translatedText !== originalText.trim()
      ) {
        try {
          const safeTranslatedText =
            typeof translatedText === 'string'
              ? [...translatedText]
                  .filter((c) => c.charCodeAt(0) > 31 && c.charCodeAt(0) !== 127)
                  .join('')
              : String(translatedText || '');
          const translatedNode = document.createTextNode(safeTranslatedText);
          fragment.appendChild(translatedNode);

          hasTranslation = true;
          this.performanceData.textsTranslated++;
        } catch (e) {
          if (CONFIG.debugMode) {
            console.error('[GitHub 中文翻译] 创建翻译节点失败:', e, '翻译文本:', translatedText);
          }
          fragment.appendChild(node);
        }
      } else {
        fragment.appendChild(node);
      }
    });

    try {
      if (fragment && fragment.hasChildNodes()) {
        if (element.firstChild) {
          element.insertBefore(fragment, element.firstChild);
        } else {
          element.appendChild(fragment);
        }
      }
    } catch (appendError) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 添加文档片段失败:', appendError, '元素:', element);
      }
    }

    if (hasTranslation) {
      virtualDomManager.markElementAsTranslated(element);
    }

    elementSelector.elementCache.set(element, true);

    return hasTranslation;
  },

  async translateCriticalElementsOnly() {
    return translateCriticalElements((el) => this.translateElement(el));
  },
};
