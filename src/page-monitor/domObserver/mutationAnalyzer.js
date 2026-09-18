/**
 * DOM观察器变化分析模块
 * @file src/page-monitor/domObserver/mutationAnalyzer.js
 */
import { CONFIG } from '../../config.js';
import { pageAnalyzer } from '../pageAnalyzer.js';
import { PAGE_MODE_THRESHOLDS } from './constants.js';
import { isElementIgnored, isElementImportant } from './elementChecker.js';

export function isMutationContentRelated(mutation, pageMode) {
  try {
    if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
      const oldValue = mutation.oldValue || '';
      const newValue = mutation.target.textContent || '';

      if (oldValue.trim() === newValue.trim()) {
        return false;
      }

      const minLength = pageAnalyzer.getMinTextLengthByPageMode(pageMode);
      return (
        oldValue !== newValue &&
        (newValue.length >= minLength ||
          oldValue.length >= minLength ||
          Math.abs(newValue.length - oldValue.length) >= 3)
      );
    }

    if (
      mutation.type === 'childList' &&
      (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)
    ) {
      return Array.from(mutation.addedNodes).some((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node;
          if (
            element.tagName === 'SCRIPT' ||
            element.tagName === 'STYLE' ||
            element.tagName === 'META'
          ) {
            return false;
          }
          if (pageMode) {
            switch (pageMode) {
              case 'issues':
              case 'pullRequests':
                return (
                  element.classList.contains('comment-body') ||
                  element.classList.contains('timeline-comment') ||
                  element.classList.contains('js-issue-title')
                );
              case 'wiki':
                return (
                  element.classList.contains('markdown-body') || /^H[1-6]$/.test(element.tagName)
                );
              case 'codespaces':
                if (
                  element.classList.contains('terminal') ||
                  element.classList.contains('command-input')
                ) {
                  return false;
                }
                break;
              case 'search':
                return (
                  element.classList.contains('search-result') ||
                  element.classList.contains('search-match')
                );
              default:
                return false;
            }
          }
          return true;
        }
        return node.nodeType === Node.TEXT_NODE;
      });
    }

    return false;
  } catch (_error) {
    return false;
  }
}

export function calculateMutationWeights(mutation, pageMode, elementCheckCache) {
  const config = PAGE_MODE_THRESHOLDS[pageMode] || PAGE_MODE_THRESHOLDS.search;
  let contentChanges = 0;
  let importantChanges = 0;
  let shouldTrigger = false;

  if (mutation.target) {
    const isIgnored = isElementIgnored(mutation.target, [], elementCheckCache, pageMode);

    if (!isIgnored) {
      const isImportant = isElementImportant(mutation.target, [], elementCheckCache, pageMode);

      if (isImportant) {
        shouldTrigger = true;
      }
    }

    if (mutation.type === 'attributes') {
      const importantAttributes = ['id', 'class', 'href', 'title'];
      if (importantAttributes.includes(mutation.attributeName)) {
        importantChanges++;
        if (importantChanges >= 3) {
          shouldTrigger = true;
        }
      }
    }

    if (isMutationContentRelated(mutation, pageMode)) {
      contentChanges++;
      if (contentChanges >= Math.max(5, config.minContent)) {
        shouldTrigger = true;
      }
    }
  }

  return { shouldTrigger, contentChanges, importantChanges };
}

export function processMutationBatch(mutations, maxCheckCount, pageMode) {
  const elementCheckCache = new WeakMap();
  let totalContentChanges = 0;
  let totalImportantChanges = 0;

  for (let i = 0; i < maxCheckCount; i++) {
    const mutation = mutations[i];

    if (mutation.type === 'characterData' && CONFIG.performance?.ignoreCharacterDataMutations) {
      continue;
    }
    if (mutation.type === 'attributes' && CONFIG.performance?.ignoreAttributeMutations) {
      continue;
    }

    const result = calculateMutationWeights(mutation, pageMode, elementCheckCache);
    totalContentChanges += result.contentChanges;
    totalImportantChanges += result.importantChanges;

    if (result.shouldTrigger) {
      return {
        shouldTrigger: true,
        contentChanges: totalContentChanges,
        importantChanges: totalImportantChanges,
      };
    }
  }

  return {
    shouldTrigger: false,
    contentChanges: totalContentChanges,
    importantChanges: totalImportantChanges,
  };
}

export function checkWeightedThreshold(contentChanges, importantChanges, maxCheckCount, pageMode) {
  const config = PAGE_MODE_THRESHOLDS[pageMode] || PAGE_MODE_THRESHOLDS.search;
  const minContentChanges = config.minContent;

  if (contentChanges < minContentChanges) {
    return false;
  }

  const weightedChanges =
    contentChanges * config.contentWeight + importantChanges * config.importantWeight;
  const threshold = pageAnalyzer.getModeSpecificThreshold(pageMode) || 0.3;

  return weightedChanges / maxCheckCount > threshold;
}
