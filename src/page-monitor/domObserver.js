/**
 * DOM变化观察器模块
 * @file pageMonitor/domObserver.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 观察DOM变化并触发翻译
 */

import { CONFIG } from '../config.js';
import { utils } from '../utils/utils.js';
import { translationCore } from '../translation-core/index.js';
import { pageAnalyzer } from './pageAnalyzer.js';
import { pageMonitorCache } from './cacheManager.js';
import { domObserverConfig } from './domObserver.config.js';
import {
  isElementImportant,
  isElementIgnored,
  isMutationContentRelated,
  processMutationBatch,
  checkWeightedThreshold,
} from './domObserver.utils.js';

export const domObserver = {
  observer: null,
  onTranslationTrigger: null,
  isPageUnloading: false,
  errorCount: 0,

  init(translationTriggerCallback) {
    this.onTranslationTrigger = translationTriggerCallback;
    this.setupDomObserver();
  },

  setupDomObserver() {
    try {
      if (this.observer) {
        try {
          this.observer.disconnect();
          this.observer = null;
        } catch (error) {
          if (CONFIG.debugMode) {
            console.warn('[GitHub 中文翻译] 断开现有observer失败:', error);
          }
        }
      }

      const pageMode = translationCore.detectPageMode();
      const rootNode = domObserverConfig.selectOptimalRootNode(pageMode);
      const observerConfig = domObserverConfig.getOptimizedObserverConfig(pageMode);

      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 当前页面模式:', pageMode);
      }

      const handleMutations = (mutations) => {
        try {
          const pageMode = translationCore.detectPageMode();
          if (this.shouldTriggerTranslation(mutations, pageMode)) {
            if (this.onTranslationTrigger) {
              this.onTranslationTrigger();
            }
          }
        } catch (error) {
          console.error('[GitHub 中文翻译] 处理DOM变化时出错:', error);
        }
      };

      this.observer = new MutationObserver(
        utils.debounce(handleMutations, CONFIG.debounceDelay || 300),
      );

      if (rootNode) {
        try {
          this.observer.observe(rootNode, observerConfig);
          if (CONFIG.debugMode) {
            console.log(
              '[GitHub 中文翻译] DOM观察器已启动，观察范围:',
              rootNode.tagName + (rootNode.id ? '#' + rootNode.id : ''),
            );
          }
        } catch (error) {
          if (CONFIG.debugMode) {
            console.error('[GitHub 中文翻译] 启动DOM观察者失败:', error);
          }
          this.setupFallbackMonitoring();
        }
      } else {
        console.error('[GitHub 中文翻译] 无法找到合适的观察节点，回退到body');
        const domLoadedHandler = () => {
          try {
            this.setupDomObserver();
          } catch (error) {
            if (CONFIG.debugMode) {
              console.error('[GitHub 中文翻译] DOMContentLoaded后启动观察者失败:', error);
            }
          }
        };
        document.addEventListener('DOMContentLoaded', domLoadedHandler);
        pageMonitorCache.addEventListener({
          target: document,
          type: 'DOMContentLoaded',
          handler: domLoadedHandler,
        });
      }
    } catch (error) {
      console.error('[GitHub 中文翻译] 设置DOM观察器失败:', error);
      this.setupFallbackMonitoring();
    }
  },

  setupFallbackMonitoring() {
    if (CONFIG.debugMode) {
      console.log('[GitHub 中文翻译] 使用降级监控方案');
    }
  },

  shouldTriggerTranslation(mutations, inputPageMode) {
    const pageMode = inputPageMode || translationCore.detectPageMode();
    try {
      if (!mutations || mutations.length === 0) {
        return false;
      }

      const { mutationThreshold = 30, maxMutationProcessing = 50 } = CONFIG.performance || {};

      const quickPathThreshold = pageAnalyzer.getQuickPathThresholdByPageMode(pageMode);
      if (mutations.length <= quickPathThreshold) {
        return this.detectImportantChanges(mutations, pageMode);
      }

      const maxCheckCount = Math.min(
        mutations.length,
        Math.max(mutationThreshold, maxMutationProcessing),
      );

      const batchResult = processMutationBatch(
        mutations.slice(0, maxCheckCount),
        maxCheckCount,
        pageMode,
      );

      if (batchResult.shouldTrigger) {
        return true;
      }

      return checkWeightedThreshold(
        batchResult.contentChanges,
        batchResult.importantChanges,
        maxCheckCount,
        pageMode,
      );
    } catch (error) {
      console.error('[GitHub 中文翻译] 判断翻译触发条件时出错:', error);
      return false;
    }
  },

  detectImportantChanges(mutations, pageMode) {
    for (const mutation of mutations) {
      if (mutation.target && mutation.target.nodeType === Node.ELEMENT_NODE) {
        if (isElementImportant(mutation.target, [], new WeakMap(), pageMode)) {
          return true;
        }
      }
      if (isMutationContentRelated(mutation, pageMode)) {
        return true;
      }
    }
    return false;
  },

  isImportantElement(element, importantElements, cache, pageMode) {
    return isElementImportant(element, importantElements, cache, pageMode);
  },

  shouldIgnoreElement(node, ignoreElements, cache, pageMode) {
    return isElementIgnored(node, ignoreElements, cache, pageMode);
  },

  isContentRelatedMutation(mutation, pageMode) {
    return isMutationContentRelated(mutation, pageMode);
  },

  handleError(operation, error) {
    const errorMessage = `[GitHub 中文翻译] ${operation}时出错: ${error.message}`;
    if (CONFIG.debugMode) {
      console.error(errorMessage, error);
    } else {
      console.error(errorMessage);
    }

    this.errorCount++;

    if (this.errorCount > (CONFIG.performance?.maxErrorCount || 5)) {
      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 错误次数过多，尝试重启监控');
      }
      setTimeout(() => {
        this.setupDomObserver();
      }, 1000);
      this.errorCount = 0;
    }
  },

  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  },
};
