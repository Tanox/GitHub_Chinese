/**
 * 页面分析模块
 * @file pageMonitor/pageAnalyzer.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 分析页面类型和关键区域
 */
import { CONFIG } from '../config.js';

export const pageAnalyzer = {
  isComplexPage() {
    const complexPaths = [/\/pull\/\d+/, /\/issues\/\d+/, /\/blob\//, /\/commit\//, /\/compare\//];

    return complexPaths.some((pattern) => pattern.test(window.location.pathname));
  },

  getQuickPathThresholdByPageMode(pageMode) {
    const thresholds = {
      search: 5,
      issues: 4,
      pullRequests: 4,
      wiki: 6,
      actions: 5,
      codespaces: 3,
    };
    return thresholds[pageMode] || 3;
  },

  getModeSpecificThreshold(pageMode) {
    const thresholds = {
      issues: 0.35,
      pullRequests: 0.35,
      wiki: 0.4,
      search: 0.3,
      codespaces: 0.25,
    };
    return thresholds[pageMode];
  },

  getMinTextLengthByPageMode(pageMode) {
    const lengths = {
      issues: 4,
      pullRequests: 4,
      wiki: 5,
      search: 3,
    };
    return lengths[pageMode] || CONFIG.performance?.minTextLengthToTranslate || 3;
  },

  shouldSkipElementByPageMode(element, pageMode) {
    if (!element || !pageMode) return false;

    if (
      element.tagName === 'CODE' ||
      element.tagName === 'SCRIPT' ||
      element.tagName === 'STYLE' ||
      element.classList.contains('blob-code')
    ) {
      return true;
    }

    switch (pageMode) {
      case 'codespaces':
        return (
          element.classList.contains('terminal') ||
          element.classList.contains('command-input') ||
          element.dataset.terminal
        );
      case 'wiki':
        return (
          element.classList.contains('codehilite') ||
          element.classList.contains('highlight') ||
          element.closest('.highlight')
        );
      case 'issues':
      case 'pullRequests':
        return element.classList.contains('blob-code') || element.classList.contains('diff-line');
      case 'search':
        if (element.classList.contains('search-match')) {
          return false;
        }
        return element.classList.contains('text-small') || element.classList.contains('link-gray');
      default:
        return false;
    }
  },

  identifyKeyTranslationAreas() {
    const keySelectors = [];
    const path = window.location.pathname;

    if (/\/pull\/\d+/.test(path) || /\/issues\/\d+/.test(path)) {
      keySelectors.push('.js-discussion', '.issue-details', '.js-issue-title', '.js-issue-labels');
    } else if (/\/blob\//.test(path)) {
      keySelectors.push('.blob-wrapper', '.file-header', '.file-info');
    } else if (/\/commit\//.test(path)) {
      keySelectors.push('.commit-meta', '.commit-files', '.commit-body', '.commit-desc');
    } else if (/\/notifications/.test(path)) {
      keySelectors.push('.notifications-list', '.notification-shelf');
    } else if (/\/actions/.test(path)) {
      keySelectors.push('.workflow-run-list', '.workflow-jobs', '.workflow-run-header');
    } else if (/\/settings/.test(path)) {
      keySelectors.push('.settings-content', '.js-settings-content');
    } else if (/\/projects/.test(path)) {
      keySelectors.push('.project-layout', '.project-columns');
    } else if (/\/wiki/.test(path)) {
      keySelectors.push('.wiki-wrapper', '.markdown-body');
    } else if (/\/search/.test(path)) {
      keySelectors.push('.codesearch-results', '.search-title');
    } else if (/\/orgs\//.test(path) || /\/users\//.test(path)) {
      keySelectors.push(
        '.org-profile',
        '.profile-timeline',
        '.user-profile-sticky-header',
        '.user-profile-main',
      );
    } else if (/\/repos\/\w+\/\w+/.test(path)) {
      keySelectors.push('.repository-content', '.repository-meta-content', '.readme');
    } else {
      keySelectors.push('.repository-content', '.profile-timeline', '.application-main', 'main');
    }

    const elements = [];
    for (const selector of keySelectors) {
      const element = document.querySelector(selector);
      if (element) {
        elements.push(element);
      }
    }

    if (elements.length === 0) {
      const genericSelectors = ['#js-pjax-container', '.application-main', 'main', 'body'];
      for (const selector of genericSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          elements.push(element);
          break;
        }
      }
    }

    return elements;
  },
};
