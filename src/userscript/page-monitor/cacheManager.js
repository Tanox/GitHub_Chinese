/**
 * 页面监控缓存管理模块
 * @file pageMonitor/cacheManager.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 管理页面监控中的缓存
 */
import { CONFIG } from '../config.js';

export const pageMonitorCache = {
  nodeCheckCache: new Map(),
  lastCacheCleanupTime: Date.now(),
  cacheCleanupTimerId: null,
  eventListeners: [],

  startCacheCleanupTimer() {
    this.stopCacheCleanupTimer();
    this.cacheCleanupTimerId = setInterval(() => {
      if (!this.isPageUnloading) {
        this.cleanupNodeCheckCache();
      }
    }, CONFIG.performance?.cacheCleanupInterval || 30000);
  },

  stopCacheCleanupTimer() {
    if (this.cacheCleanupTimerId) {
      clearInterval(this.cacheCleanupTimerId);
      this.cacheCleanupTimerId = null;
    }
  },

  cleanupNodeCheckCache() {
    try {
      const maxCacheSize = CONFIG.performance?.maxNodeCacheSize || 1000;
      if (this.nodeCheckCache.size > maxCacheSize) {
        const entriesToRemove = Math.floor(this.nodeCheckCache.size * 0.3);
        const keysToRemove = Array.from(this.nodeCheckCache.keys()).slice(0, entriesToRemove);

        keysToRemove.forEach((key) => {
          this.nodeCheckCache.delete(key);
        });

        if (CONFIG.debugMode) {
          console.log(`[GitHub 中文翻译] 清理了${keysToRemove.length}个节点检查缓存条目`);
        }
      }

      this.lastCacheCleanupTime = Date.now();
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 清理节点检查缓存失败:', error);
      }
    }
  },

  clearCache() {
    this.nodeCheckCache.clear();
  },

  addEventListener(listener) {
    this.eventListeners.push(listener);
    listener.target.addEventListener(listener.type, listener.handler);
  },

  cleanupEventListeners() {
    this.eventListeners.forEach((listener) => {
      try {
        listener.target.removeEventListener(listener.type, listener.handler);
      } catch (error) {
        console.warn('[GitHub 中文翻译] 移除事件监听器失败:', error);
      }
    });
    this.eventListeners = [];
  },
};
