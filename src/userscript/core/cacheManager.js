/**
 * LRU缓存管理模块
 * @file cacheManager.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 实现LRU缓存策略，用于翻译结果缓存
 */

export class CacheManager {
  constructor(maxSize = 2000) {
    this.translationCache = new Map();
    this.maxSize = maxSize;
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
    };
  }

  getFromCache(key) {
    const cacheItem = this.translationCache.get(key);

    if (cacheItem && cacheItem.value) {
      cacheItem.timestamp = Date.now();
      cacheItem.accessCount = (cacheItem.accessCount || 0) + 1;
      this.cacheStats.hits++;
      return cacheItem.value;
    }

    this.cacheStats.misses++;
    return null;
  }

  setToCache(key, value, isPageUnloading = false) {
    if (isPageUnloading) {
      return;
    }

    this.checkCacheSizeLimit();

    this.translationCache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1,
    });

    this.cacheStats.size = this.translationCache.size;
  }

  checkCacheSizeLimit() {
    if (this.translationCache.size >= this.maxSize) {
      this.performLRUCacheEviction(this.maxSize);
    }
  }

  performLRUCacheEviction(maxSize) {
    try {
      const targetSize = Math.floor(maxSize * 0.8);
      const cacheEntries = Array.from(this.translationCache.entries());

      cacheEntries.sort(([, itemA], [, itemB]) => {
        if (itemB.timestamp !== itemA.timestamp) {
          return itemB.timestamp - itemA.timestamp;
        }
        return (itemB.accessCount || 0) - (itemA.accessCount || 0);
      });

      const entriesToKeep = cacheEntries.slice(0, targetSize);
      const evictedCount = cacheEntries.length - entriesToKeep.length;

      this.translationCache.clear();
      entriesToKeep.forEach(([key, item]) => {
        this.translationCache.set(key, item);
      });

      this.cacheStats.evictions += evictedCount;
      this.cacheStats.size = this.translationCache.size;
    } catch (_error) {
      const evictCount = Math.max(50, Math.floor(this.translationCache.size * 0.2));
      const oldestEntries = Array.from(this.translationCache.entries())
        .sort(([, itemA], [, itemB]) => itemA.timestamp - itemB.timestamp)
        .slice(0, evictCount);

      oldestEntries.forEach(([key]) => {
        this.translationCache.delete(key);
      });

      this.cacheStats.evictions += evictCount;
      this.cacheStats.size = this.translationCache.size;
    }
  }

  cleanCache() {
    this.checkCacheSizeLimit();
  }

  clearCache() {
    this.translationCache.clear();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
    };
  }

  getStats() {
    return { ...this.cacheStats };
  }
}
