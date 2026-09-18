/**
 * DOM变化观察器模块
 * @file pageMonitor/domObserver.js
 */

import { CONFIG } from '../config.js';
import {
  isElementImportant,
  isElementIgnored,
  isMutationContentRelated,
} from './domObserver.utils.js';
import { setupDomObserver } from './domObserver/setup.js';
import { shouldTriggerTranslation, detectImportantChanges } from './domObserver/trigger.js';

export const domObserver = {
  observer: null,
  onTranslationTrigger: null,
  isPageUnloading: false,
  errorCount: 0,

  init(translationTriggerCallback) {
    this.onTranslationTrigger = translationTriggerCallback;
    setupDomObserver(this, translationTriggerCallback);
  },

  shouldTriggerTranslation(mutations, inputPageMode) {
    return shouldTriggerTranslation(mutations, inputPageMode);
  },

  detectImportantChanges(mutations, pageMode) {
    return detectImportantChanges(mutations, pageMode);
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
        setupDomObserver(this, this.onTranslationTrigger);
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
