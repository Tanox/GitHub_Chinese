/**
 * DOM观察器触发逻辑模块
 * @file src/page-monitor/domObserver/trigger.js
 */
import { CONFIG } from '../../config.js';
import { translationCore } from '../../translation-core/index.js';
import { pageAnalyzer } from '../pageAnalyzer.js';
import {
  isElementImportant,
  isMutationContentRelated,
  processMutationBatch,
  checkWeightedThreshold,
} from '../domObserver.utils.js';

export function shouldTriggerTranslation(mutations, inputPageMode) {
  const pageMode = inputPageMode || translationCore.detectPageMode();
  try {
    if (!mutations || mutations.length === 0) {
      return false;
    }

    const { mutationThreshold = 30, maxMutationProcessing = 50 } = CONFIG.performance || {};

    const quickPathThreshold = pageAnalyzer.getQuickPathThresholdByPageMode(pageMode);
    if (mutations.length <= quickPathThreshold) {
      return detectImportantChanges(mutations, pageMode);
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
}

export function detectImportantChanges(mutations, pageMode) {
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
}
