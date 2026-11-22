/**
 * 脚本生命周期管理器
 * @file src/userscript/main/lifecycle.js
 * @version 1.13.34
 * @date 2026-11-06
 * @author Sut
 * @description 管理 init / start / cleanup 生命周期编排：翻译核心、页面监控与 UI 的启停
 */
import { CONFIG } from '../config/index.js';
import { versionChecker } from '../versionChecker/index.js';
import { translationCore } from '../translation-core/index.js';
import { pageMonitor } from '../page-monitor/index.js';
import { configUI } from '../ui/configUI/index.js';

/** 缓存事件回调引用：removeEventListener 必须使用与 addEventListener 相同的函数对象 */
let unloadHandler = null;
let visibilityChangeHandler = null;

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

      if (typeof window !== 'undefined' && unloadHandler) {
        window.removeEventListener('beforeunload', unloadHandler);
        window.removeEventListener('unload', unloadHandler);
        unloadHandler = null;
      }

      if (typeof document !== 'undefined' && visibilityChangeHandler) {
        document.removeEventListener('visibilitychange', visibilityChangeHandler);
        visibilityChangeHandler = null;
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
        // translate 内部在批处理恢复失败时可能 reject，必须显式捕获，避免未处理的 Promise rejection
        translationCore.translate().catch((error) => {
          console.error('[GitHub 中文翻译] 初始翻译失败:', error);
        });
      }

      if (typeof pageMonitor !== 'undefined' && typeof pageMonitor.init === 'function') {
        pageMonitor.init();
      }

      if (typeof configUI !== 'undefined' && typeof configUI.init === 'function') {
        configUI.init();
      }

      if (typeof window !== 'undefined') {
        // 重复 init 时先注销旧监听，避免叠加多个回调
        if (unloadHandler) {
          window.removeEventListener('beforeunload', unloadHandler);
          window.removeEventListener('unload', unloadHandler);
        }
        unloadHandler = () => this.cleanup();
        window.addEventListener('beforeunload', unloadHandler);
        window.addEventListener('unload', unloadHandler);
      }

      if (typeof document !== 'undefined') {
        if (visibilityChangeHandler) {
          document.removeEventListener('visibilitychange', visibilityChangeHandler);
        }
        visibilityChangeHandler = () => {
          if (document.visibilityState === 'hidden') {
            if (translationCore && typeof translationCore.cleanCache === 'function') {
              translationCore.cleanCache();
            }
          }
        };
        document.addEventListener('visibilitychange', visibilityChangeHandler);
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
