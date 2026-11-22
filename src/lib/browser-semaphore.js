/**
 * 全局浏览器并发信号量
 * @file src/lib/browser-semaphore.js
 * @version 1.13.34
 * @description 限制同时拉起的 Headless 浏览器实例数量，避免多请求并发耗尽系统资源。
 *   支持 AbortSignal：客户端断连时将等待者从队列移除，避免占用槽位后无谓启动浏览器。
 */

/** 全局并发浏览器实例上限 */
const MAX_CONCURRENT_BROWSERS = 2;

let activeBrowsers = 0;
const waiters = [];

/**
 * 获取一个浏览器槽位（达到上限时排队等待）
 * @param {AbortSignal} [signal] - 取消信号；取消时从队列移除并 reject
 * @returns {Promise<void>}
 */
export function acquireBrowserSlot(signal) {
  if (signal?.aborted) {
    return Promise.reject(new Error('浏览器槽位等待已取消'));
  }
  if (activeBrowsers < MAX_CONCURRENT_BROWSERS) {
    activeBrowsers += 1;
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const waiter = {
      resolve,
      signal,
      onAbort: () => {
        const index = waiters.indexOf(waiter);
        if (index >= 0) waiters.splice(index, 1);
        reject(new Error('浏览器槽位等待已取消'));
      },
    };
    waiters.push(waiter);
    signal?.addEventListener('abort', waiter.onAbort, { once: true });
  });
}

/** 释放一个浏览器槽位（若有等待者则直接交接，避免计数抖动） */
export function releaseBrowserSlot() {
  if (waiters.length > 0) {
    const waiter = waiters.shift();
    waiter.signal?.removeEventListener('abort', waiter.onAbort);
    waiter.resolve();
  } else {
    activeBrowsers = Math.max(0, activeBrowsers - 1);
  }
}
