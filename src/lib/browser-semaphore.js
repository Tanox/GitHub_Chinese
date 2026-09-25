/**
 * 全局浏览器并发信号量
 * @file src/lib/browser-semaphore.js
 * @version 1.11.2
 * @description 限制同时拉起的 Headless 浏览器实例数量，避免多请求并发耗尽系统资源
 */

/** 全局并发浏览器实例上限 */
const MAX_CONCURRENT_BROWSERS = 2;

let activeBrowsers = 0;
const waiters = [];

/**
 * 获取一个浏览器槽位（达到上限时排队等待）
 * @returns {Promise<void>}
 */
export function acquireBrowserSlot() {
  if (activeBrowsers < MAX_CONCURRENT_BROWSERS) {
    activeBrowsers += 1;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    waiters.push(resolve);
  });
}

/** 释放一个浏览器槽位（若有等待者则直接交接，避免计数抖动） */
export function releaseBrowserSlot() {
  if (waiters.length > 0) {
    waiters.shift()();
  } else {
    activeBrowsers = Math.max(0, activeBrowsers - 1);
  }
}
