/**
 * DOM观察器配置与节点选择模块
 * @file src/page-monitor/domObserver.config.js
 */
import { CONFIG } from '../config.js';
import { translationCore } from '../translation-core/index.js';

export const domObserverConfig = {
  selectOptimalRootNode(pageMode) {
    const effectivePageMode = pageMode || translationCore.detectPageMode();
    let candidateSelectors;

    switch (effectivePageMode) {
      case 'search':
        candidateSelectors = ['.codesearch-results', '#js-pjax-container', 'main', 'body'];
        break;
      case 'issues':
      case 'pullRequests':
        candidateSelectors = [
          '.js-discussion',
          '.issue-details',
          '#js-issue-title',
          '#js-pjax-container',
          'main',
          'body',
        ];
        break;
      case 'repository':
        candidateSelectors = [
          '#js-repo-pjax-container',
          '.repository-content',
          '.application-main',
          'body',
        ];
        break;
      case 'notifications':
        candidateSelectors = [
          '.notifications-list',
          '.notification-shelf',
          '#js-pjax-container',
          'main',
          'body',
        ];
        break;
      case 'wiki':
        candidateSelectors = [
          '.wiki-wrapper',
          '.markdown-body',
          '#js-pjax-container',
          'main',
          'body',
        ];
        break;
      case 'actions':
        candidateSelectors = [
          '.workflow-run-list',
          '.workflow-jobs',
          '.workflow-run-header',
          '#js-pjax-container',
          'main',
          'body',
        ];
        break;
      case 'projects':
        candidateSelectors = [
          '.project-layout',
          '.project-columns',
          '#js-pjax-container',
          'main',
          'body',
        ];
        break;
      default:
        candidateSelectors = ['#js-pjax-container', 'main', '.application-main', 'body'];
    }

    for (const selector of candidateSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim().length > 0) {
        return element;
      }
    }

    return document.body;
  },

  getOptimizedObserverConfig(inputPageMode) {
    const pageMode = inputPageMode || translationCore.detectPageMode();
    const baseConfig = { childList: true };

    if (!CONFIG.performance?.ignoreCharacterDataMutations) {
      baseConfig.characterData = true;
    }

    const complexPages = ['wiki', 'issues', 'pullRequests', 'markdown'];
    const simplePages = ['search', 'codespaces', 'marketplace'];

    if (complexPages.includes(pageMode)) {
      baseConfig.subtree = CONFIG.performance?.observeSubtree;
    } else if (simplePages.includes(pageMode)) {
      baseConfig.subtree = false;
    } else {
      baseConfig.subtree = CONFIG.performance?.observeSubtree;
    }

    if (CONFIG.performance?.observeAttributes && !CONFIG.performance?.ignoreAttributeMutations) {
      baseConfig.attributes = true;
      baseConfig.attributeFilter = CONFIG.performance?.importantAttributes || [
        'id',
        'class',
        'href',
        'title',
      ];
    }

    return baseConfig;
  },
};
