/**
 * 虚拟 DOM 生命周期钩子
 * @file src/core/virtualDom/lifecycle.js
 * @description 页面卸载时的标记与清理、自动清理定时器的启停
 */

/**
 * 绑定页面卸载处理器（卸载时标记并整体清理）
 * @param {object} manager - 虚拟 DOM 管理器
 */
export function bindPageUnloadHandler(manager) {
  const unloadHandler = () => {
    manager.isPageUnloading = true;
    manager.cleanup();
  };

  window.addEventListener('beforeunload', unloadHandler);
  window.addEventListener('unload', unloadHandler);
  window.addEventListener('pagehide', unloadHandler);
}

/**
 * 启动自动清理定时器（页面卸载后自动停止）
 * @param {object} manager - 虚拟 DOM 管理器
 */
export function startCleanupTimer(manager) {
  stopCleanupTimer(manager);

  manager.cleanupTimer = setInterval(() => {
    if (manager.isPageUnloading) {
      stopCleanupTimer(manager);
      return;
    }

    manager.cleanup();
  }, manager.cleanupInterval);
}

/**
 * 停止自动清理定时器
 * @param {object} manager - 虚拟 DOM 管理器
 */
export function stopCleanupTimer(manager) {
  if (manager.cleanupTimer) {
    clearInterval(manager.cleanupTimer);
    manager.cleanupTimer = null;
  }
}
