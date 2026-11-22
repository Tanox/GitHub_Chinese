/**
 * 路径变化监听模块
 * @file pageMonitor/pathListener.js
 * @version 1.13.34
 * @date 2026-06-10
 * @author Sut
 * @description 监听URL路径变化
 */
import { CONFIG } from '../config/index.js';
import { utils } from '../../utils/utils.js';
import { pageMonitorCache } from './cacheManager.js';

export const pathListener = {
  lastPath: '',
  onPathChange: null,
  originalPushState: null,
  originalReplaceState: null,

  /** 还原 history 方法，避免重复 init 层层包装、cleanup 后仍污染页面 */
  restoreHistoryMethods() {
    if (this.originalPushState && typeof history !== 'undefined') {
      history.pushState = this.originalPushState;
      history.replaceState = this.originalReplaceState;
      this.originalPushState = null;
      this.originalReplaceState = null;
    }
  },

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

    this.restoreHistoryMethods();
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    this.originalPushState = originalPushState;
    this.originalReplaceState = originalReplaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      pathListener.handlePathChange();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      pathListener.handlePathChange();
    };
  },

  stop() {
    this.restoreHistoryMethods();
  },

  handlePathChange() {
    try {
      const currentPath = window.location.pathname + window.location.search;
      if (currentPath === this.lastPath) return;
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
