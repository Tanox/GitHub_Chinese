/**
 * 翻译核心生命周期管理模块
 * @file src/translation-core/lifecycle.js
 */

export function setupPageUnloadHandler(translationCore) {
  const unloadHandler = () => {
    translationCore.isPageUnloading = true;
    translationCore.cleanup();
  };

  window.addEventListener('beforeunload', unloadHandler);
  window.addEventListener('unload', unloadHandler);
  window.addEventListener('pagehide', unloadHandler);

  return unloadHandler;
}

export function startCacheCleanupTimer(translationCore) {
  const CLEANUP_INTERVAL_MS = 120000;
  return setInterval(() => {
    if (translationCore.isPageUnloading) {
      if (translationCore.cacheCleanupTimer) {
        clearInterval(translationCore.cacheCleanupTimer);
        translationCore.cacheCleanupTimer = null;
      }
      return;
    }
    translationCore.cleanCache();
  }, CLEANUP_INTERVAL_MS);
}
