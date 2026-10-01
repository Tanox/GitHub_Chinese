/**
 * 路径变化监听模块
 * @file pageMonitor/pathListener.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 监听URL路径变化
 */
import { CONFIG } from '../config.js';
import { utils } from '../utils/utils.js';
import { pageMonitorCache } from './cacheManager.js';

export const pathListener = {
  lastPath: '',
  onPathChange: null,

  init(pathChangeCallback) {
    this.onPathChange = pathChangeCallback;
    this.lastPath = window.location.pathname + window.location.search;
    this.setupPathListener();
  },

  setupPathListener() {
    const popstateHandler = utils.debounce(() => {
      const currentPath = window.location.pathname + window.location.search;
      if (currentPath !== this.lastPath) {
        this.handlePathChange();
      }
    }, CONFIG.routeChangeDelay || 500);

    window.addEventListener('popstate', popstateHandler);
    pageMonitorCache.addEventListener({
      target: window,
      type: 'popstate',
      handler: popstateHandler,
    });

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      pathListener.handlePathChange();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      pathListener.handlePathChange();
    };
  },

  handlePathChange() {
    try {
      const currentPath = window.location.pathname + window.location.search;
      this.lastPath = currentPath;

      if (CONFIG.debugMode) {
        console.log(`[GitHub 中文翻译] 页面路径变化: ${currentPath}`);
      }

      if (this.onPathChange) {
        setTimeout(() => {
          this.onPathChange();
        }, CONFIG.routeChangeDelay || 500);
      }
    } catch (error) {
      console.error('[GitHub 中文翻译] 路径变化处理失败:', error);
    }
  },
};
