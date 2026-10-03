/**
 * 脚本生命周期管理器
 * @file src/userscript/main/lifecycle.js
 */
import { CONFIG } from '../config/index.js';
import { versionChecker } from '../versionChecker/index.js';
import { translationCore } from '../translation-core/index.js';
import { pageMonitor } from '../page-monitor/index.js';
import { configUI } from '../ui/configUI/index.js';

export const lifecycleManager = {
  cleanup() {
    try {
      if (pageMonitor && typeof pageMonitor.stop === 'function') {
        pageMonitor.stop();
      }

      if (translationCore && typeof translationCore.clearCache === 'function') {
        translationCore.clearCache();
      }

      if (configUI && typeof configUI.cleanup === 'function') {
        configUI.cleanup();
      }

      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', this.cleanup.bind(this));
        window.removeEventListener('unload', this.cleanup.bind(this));
      }

      if (typeof document !== 'undefined' && typeof window !== 'undefined' && window.visibilityChangeHandler) {
        document.removeEventListener('visibilitychange', window.visibilityChangeHandler);
        window.visibilityChangeHandler = null;
      }

      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 资源清理完成');
      }
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 资源清理失败:', error);
      }
    }
  },

  init() {
    try {
      if (CONFIG.updateCheck.enabled) {
        versionChecker.checkForUpdates().catch(() => {});
      }

      if (typeof translationCore !== 'undefined' && typeof translationCore.init === 'function') {
        translationCore.init();
      }

      if (
        typeof translationCore !== 'undefined' &&
        typeof translationCore.translate === 'function'
      ) {
        translationCore.translate();
      }

      if (typeof pageMonitor !== 'undefined' && typeof pageMonitor.init === 'function') {
        pageMonitor.init();
      }

      if (typeof configUI !== 'undefined' && typeof configUI.init === 'function') {
        configUI.init();
      }

      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', this.cleanup.bind(this));
        window.addEventListener('unload', this.cleanup.bind(this));
      }

      const visibilityChangeHandler = () => {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
          if (translationCore && typeof translationCore.cleanCache === 'function') {
            translationCore.cleanCache();
          }
        }
      };
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', visibilityChangeHandler);
      }
      if (typeof window !== 'undefined') {
        window.visibilityChangeHandler = visibilityChangeHandler;
      }
    } catch (error) {
      console.error('[GitHub 中文翻译] 脚本初始化失败:', error);
    }
  },

  startScript() {
    if (typeof document === 'undefined') return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', async () => {
        try {
          await this.init();
        } catch (error) {
          console.error('[GitHub 中文翻译] DOMContentLoaded 回调中初始化失败:', error);
        }
      });
    } else {
      try {
        this.init();
      } catch (error) {
        console.error('[GitHub 中文翻译] 直接初始化失败:', error);
      }
    }
  },
};
