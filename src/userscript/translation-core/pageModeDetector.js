/**
 * 页面模式检测模块
 * @file translationCore/pageModeDetector.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 检测当前页面的模式
 */
import { CONFIG } from '../config.js';

export const pageModeDetector = {
  currentPageMode: null,

  pageModeConfig: {
    default: {
      batchSize: CONFIG.performance?.batchSize,
      enablePartialMatch: CONFIG.performance?.enablePartialMatch,
    },
    search: { batchSize: 100, enablePartialMatch: false },
    repository: { batchSize: 50, enablePartialMatch: false },
    issues: { batchSize: 75, enablePartialMatch: true },
    pullRequests: { batchSize: 75, enablePartialMatch: true },
    explore: { batchSize: 100, enablePartialMatch: false },
    notifications: { batchSize: 60, enablePartialMatch: true },
    marketplace: { batchSize: 80, enablePartialMatch: true },
    codespaces: { batchSize: 50, enablePartialMatch: false },
    wiki: { batchSize: 120, enablePartialMatch: true },
    actions: { batchSize: 60, enablePartialMatch: false },
  },

  detectPageMode() {
    try {
      const currentPath = window.location.pathname;

      for (const [mode, pattern] of Object.entries(CONFIG.pagePatterns)) {
        if (pattern && pattern instanceof RegExp && pattern.test(currentPath)) {
          if (mode === 'repository') {
            const isSubPage = [
              'issues',
              'pullRequests',
              'projects',
              'wiki',
              'actions',
              'packages',
              'security',
              'insights',
            ].some((subMode) => CONFIG.pagePatterns[subMode]?.test(currentPath));
            if (!isSubPage) {
              this.currentPageMode = mode;
              return mode;
            }
          } else {
            this.currentPageMode = mode;
            return mode;
          }
        }
      }

      this.currentPageMode = 'default';
      return 'default';
    } catch (error) {
      if (CONFIG.debugMode) {
        console.warn('[GitHub 中文翻译] 检测页面模式失败:', error);
      }
      this.currentPageMode = 'default';
      return 'default';
    }
  },

  getCurrentPageModeConfig() {
    const mode = this.currentPageMode || this.detectPageMode();
    return this.pageModeConfig[mode] || this.pageModeConfig.default;
  },
};
