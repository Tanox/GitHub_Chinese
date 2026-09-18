/**
 * DOM观察器阈值常量
 * @file src/page-monitor/domObserver/constants.js
 */

export const PAGE_MODE_THRESHOLDS = {
  issues: { contentWeight: 1, importantWeight: 2, minContent: 3 },
  pullRequests: { contentWeight: 1, importantWeight: 2, minContent: 3 },
  wiki: { contentWeight: 1, importantWeight: 2, minContent: 4 },
  search: { contentWeight: 1, importantWeight: 2, minContent: 3 },
  codespaces: { contentWeight: 1, importantWeight: 2, minContent: 2 },
};
