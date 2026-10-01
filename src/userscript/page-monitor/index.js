/**
 * 页面监控主模块
 * @file pageMonitor/index.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 页面监控主入口，整合所有子模块
 */
import { CONFIG } from '../config.js';
import { pathListener } from './pathListener.js';
import { domObserver } from './domObserver.js';
import { translationTrigger } from './translationTrigger.js';
import { pageMonitorCache } from './cacheManager.js';

export const pageMonitor = {
  isPageUnloading: false,

  init() {
    try {
      this.setupPageUnloadHandler();

      pathListener.init(() => {
        translationTrigger.translateWithThrottle();
      });

      domObserver.init(() => {
        translationTrigger.translateWithThrottle();
      });

      pageMonitorCache.startCacheCleanupTimer();

      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 页面监控初始化完成');
      }
    } catch (error) {
      console.error('[GitHub 中文翻译] 页面监控初始化失败:', error);
    }
  },

  setupPageUnloadHandler() {
    const unloadHandler = () => {
      this.isPageUnloading = true;
      domObserver.isPageUnloading = true;
      pageMonitorCache.isPageUnloading = true;
      this.cleanup();
    };

    pageMonitorCache.addEventListener({
      target: window,
      type: 'beforeunload',
      handler: unloadHandler,
    });
    pageMonitorCache.addEventListener({
      target: window,
      type: 'unload',
      handler: unloadHandler,
    });
    pageMonitorCache.addEventListener({
      target: window,
      type: 'pagehide',
      handler: unloadHandler,
    });
  },

  translateWithThrottle() {
    return translationTrigger.translateWithThrottle();
  },

  stop() {
    try {
      domObserver.stop();
      pageMonitorCache.stopCacheCleanupTimer();

      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 页面监控已停止');
      }
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 停止监控失败:', error);
      }
    }
  },

  cleanup() {
    try {
      this.stop();
      pageMonitorCache.cleanupNodeCheckCache();
      pageMonitorCache.cleanupEventListeners();

      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 页面监控资源已完全清理');
      }
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 清理页面监控资源失败:', error);
      }
    }
  },

  restart() {
    this.stop();
    setTimeout(() => {
      this.init();
    }, 100);
  },
};
