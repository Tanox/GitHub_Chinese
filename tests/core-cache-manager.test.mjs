/**
 * LRU 缓存管理单测
 * @file tests/core-cache-manager.test.mjs
 * @description 覆盖命中/未命中统计、LRU 淘汰、卸载态不写入与重置
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { CacheManager } from '../src/core/cacheManager.js';

test('set/get：命中与未命中统计', () => {
  const cm = new CacheManager(10);
  cm.setToCache('k', 'v');
  assert.equal(cm.getFromCache('k'), 'v');
  assert.equal(cm.getStats().hits, 1);
  assert.equal(cm.getStats().misses, 0);
  assert.equal(cm.getFromCache('missing'), null);
  assert.equal(cm.getStats().misses, 1);
});

test('LRU 淘汰：超容量缩减到 80%', () => {
  const cm = new CacheManager(10);
  for (let i = 0; i < 10; i++) cm.setToCache(`k${i}`, i);
  assert.equal(cm.translationCache.size, 10);
  cm.setToCache('overflow', 1);
  // checkCacheSizeLimit 触发 evict 到 floor(10*0.8)=8，再写入 overflow => 9
  assert.equal(cm.translationCache.size, 9);
  assert.ok(cm.getStats().evictions >= 2);
});

test('页面卸载态 setToCache 不写入', () => {
  const cm = new CacheManager(10);
  cm.setToCache('k', 'v', true);
  assert.equal(cm.getFromCache('k'), null);
});

test('clearCache 重置统计', () => {
  const cm = new CacheManager(10);
  cm.setToCache('k', 'v');
  cm.getFromCache('k');
  cm.clearCache();
  assert.equal(cm.translationCache.size, 0);
  const s = cm.getStats();
  assert.equal(s.hits, 0);
  assert.equal(s.misses, 0);
});
