/**
 * DOM观察器元素检查模块
 * @file src/page-monitor/domObserver/elementChecker.js
 */
import { pageAnalyzer } from '../pageAnalyzer.js';

export function isElementIgnored(target, ignoreElements, elementCheckCache, pageMode) {
  if (target.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  const element = target;

  if (elementCheckCache && elementCheckCache.has(element)) {
    return elementCheckCache.get(element);
  }

  let shouldIgnore = ignoreElements.some((selector) => {
    try {
      return element.matches(selector);
    } catch (_e) {
      return false;
    }
  });

  if (!shouldIgnore && pageMode) {
    switch (pageMode) {
      case 'codespaces':
        shouldIgnore =
          element.classList.contains('terminal') ||
          element.tagName === 'PRE' ||
          element.classList.contains('command-input');
        break;
      case 'wiki':
        if (element.tagName === 'PRE' && element.classList.contains('codehilite')) {
          shouldIgnore = true;
        }
        break;
      case 'search':
        if (element.tagName === 'CODE' && !element.classList.contains('search-match')) {
          shouldIgnore = true;
        }
        break;
      default:
        break;
    }
  }

  if (elementCheckCache) {
    elementCheckCache.set(element, shouldIgnore);
  }

  return shouldIgnore;
}

export function isElementImportant(target, importantElements, elementCheckCache, pageMode) {
  if (pageMode && pageAnalyzer.shouldSkipElementByPageMode(target, pageMode)) {
    return false;
  }

  if (elementCheckCache && elementCheckCache.has(target)) {
    return elementCheckCache.get(target);
  }

  let isImportant = importantElements.some((selector) => {
    try {
      return target.matches(selector);
    } catch (_e) {
      return false;
    }
  });

  if (!isImportant && pageMode) {
    switch (pageMode) {
      case 'issues':
      case 'pullRequests':
        isImportant =
          target.classList.contains('comment-body') ||
          target.classList.contains('timeline-comment-header');
        break;
      case 'wiki':
        isImportant =
          target.classList.contains('markdown-body') ||
          target.tagName === 'H1' ||
          target.tagName === 'H2';
        break;
      case 'search':
        isImportant = target.classList.contains('search-match') || target.classList.contains('f4');
        break;
      case 'codespaces':
        isImportant = target.classList.contains('codespace-status');
        break;
      default:
        break;
    }
  }

  if (elementCheckCache) {
    elementCheckCache.set(target, isImportant);
  }

  return isImportant;
}
