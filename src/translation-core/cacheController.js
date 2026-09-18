/**
 * 翻译缓存管理控制器
 * @file src/translation-core/cacheController.js
 */
import { CONFIG } from '../config.js';
import virtualDomManager from '../core/virtualDom.js';
import { dictionaryManager } from './dictionaryManager.js';
import { elementSelector } from './elementSelector.js';
import { performanceMonitor } from './performanceMonitor.js';

export const cacheController = {
  cleanCache(performanceData) {
    try {
      if (
        !dictionaryManager.cacheManager.translationCache ||
        !(dictionaryManager.cacheManager.translationCache instanceof Map)
      ) {
        if (CONFIG.debugMode) {
          console.warn('[GitHub 中文翻译] 缓存对象不存在或无效');
        }
        return;
      }

      dictionaryManager.cacheManager.cleanCache();
      if (performanceData) {
        performanceData.cacheCleanups = (performanceData.cacheCleanups || 0) + 1;
      }

      if (CONFIG.debugMode) {
        console.log(
          `[GitHub 中文翻译] 缓存清理完成，当前大小: ${dictionaryManager.cacheManager.translationCache.size}`,
        );
      }
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 缓存清理过程出错，使用回退策略:', error);
      }

      try {
        if (CONFIG.debugMode) {
          console.log('[GitHub 中文翻译] 执行缓存重置作为最后手段');
        }
        dictionaryManager.cacheManager.translationCache.clear();
        dictionaryManager.cacheManager.cacheStats.size = 0;
      } catch (fallbackError) {
        if (CONFIG.debugMode) {
          console.error('[GitHub 中文翻译] 缓存重置失败:', fallbackError);
        }
      }
    }
  },

  clearCache() {
    try {
      if (virtualDomManager && typeof virtualDomManager.clear === 'function') {
        virtualDomManager.clear();
      }

      if (dictionaryManager.cacheManager) {
        dictionaryManager.cacheManager.clearCache();
      }

      if (elementSelector.elementCache) {
        elementSelector.elementCache = new WeakMap();
      }

      performanceMonitor.resetPerformanceData();

      try {
        const translatedElements = document.querySelectorAll('[data-github-zh-translated]');
        translatedElements.forEach((element) => {
          element.removeAttribute('data-github-zh-translated');
        });
      } catch (domError) {
        if (CONFIG.debugMode) {
          console.warn('[GitHub 中文翻译] 清除翻译标记时出错:', domError);
        }
      }

      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 翻译缓存已彻底清除');
      }
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 清除缓存时出错:', error);
      }

      try {
        if (dictionaryManager.cacheManager) dictionaryManager.cacheManager.clearCache();
        if (elementSelector.elementCache) elementSelector.elementCache = new WeakMap();
        dictionaryManager.cacheManager.cacheStats = { hits: 0, misses: 0, evictions: 0, size: 0 };
      } catch (fallbackError) {
        if (CONFIG.debugMode) {
          console.error('[GitHub 中文翻译] 基本缓存清理也失败:', fallbackError);
        }
      }
    }
  },

  warmUpCache(isPageUnloading) {
    if (!CONFIG.performance?.enableTranslationCache) {
      return;
    }

    try {
      const commonKeys = Object.keys(dictionaryManager.dictionary)
        .filter(
          (key) => !dictionaryManager.dictionary[key].startsWith('待翻译: ') && key.length <= 50,
        )
        .slice(0, 100);

      commonKeys.forEach((key) => {
        const value = dictionaryManager.dictionary[key];
        dictionaryManager.cacheManager.setToCache(key, value, isPageUnloading);
      });

      if (CONFIG.debugMode) {
        console.log(`[GitHub 中文翻译] 缓存预热完成，已预加载${commonKeys.length}个常用词条`);
      }
    } catch (error) {
      console.error('[GitHub 中文翻译] 缓存预热失败:', error);
    }
  }
};
