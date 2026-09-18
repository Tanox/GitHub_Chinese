/**
 * DOM观察器启动模块
 * @file src/page-monitor/domObserver/setup.js
 */
import { CONFIG } from '../../config.js';
import { utils } from '../../utils/utils.js';
import { translationCore } from '../../translation-core/index.js';
import { domObserverConfig } from '../domObserver.config.js';
import { pageMonitorCache } from '../cacheManager.js';

export function setupDomObserver(domObserver, translationTriggerCallback) {
  try {
    if (domObserver.observer) {
      try {
        domObserver.observer.disconnect();
        domObserver.observer = null;
      } catch (error) {
        if (CONFIG.debugMode) {
          console.warn('[GitHub 中文翻译] 断开现有observer失败:', error);
        }
      }
    }

    const pageMode = translationCore.detectPageMode();
    const rootNode = domObserverConfig.selectOptimalRootNode(pageMode);
    const observerConfig = domObserverConfig.getOptimizedObserverConfig(pageMode);

    if (CONFIG.debugMode) {
      console.log('[GitHub 中文翻译] 当前页面模式:', pageMode);
    }

    const handleMutations = (mutations) => {
      try {
        const pageMode = translationCore.detectPageMode();
        if (domObserver.shouldTriggerTranslation(mutations, pageMode)) {
          if (translationTriggerCallback) {
            translationTriggerCallback();
          }
        }
      } catch (error) {
        console.error('[GitHub 中文翻译] 处理DOM变化时出错:', error);
      }
    };

    domObserver.observer = new MutationObserver(
      utils.debounce(handleMutations, CONFIG.debounceDelay || 300),
    );

    if (rootNode) {
      try {
        domObserver.observer.observe(rootNode, observerConfig);
        if (CONFIG.debugMode) {
          console.log(
            '[GitHub 中文翻译] DOM观察器已启动，观察范围:',
            rootNode.tagName + (rootNode.id ? '#' + rootNode.id : ''),
          );
        }
      } catch (error) {
        if (CONFIG.debugMode) {
          console.error('[GitHub 中文翻译] 启动DOM观察者失败:', error);
        }
        setupFallbackMonitoring();
      }
    } else {
      console.error('[GitHub 中文翻译] 无法找到合适的观察节点，回退到body');
      const domLoadedHandler = () => {
        try {
          setupDomObserver(domObserver, translationTriggerCallback);
        } catch (error) {
          if (CONFIG.debugMode) {
            console.error('[GitHub 中文翻译] DOMContentLoaded后启动观察者失败:', error);
          }
        }
      };
      document.addEventListener('DOMContentLoaded', domLoadedHandler);
      pageMonitorCache.addEventListener({
        target: document,
        type: 'DOMContentLoaded',
        handler: domLoadedHandler,
      });
    }
  } catch (error) {
    console.error('[GitHub 中文翻译] 设置DOM观察器失败:', error);
    setupFallbackMonitoring();
  }
}

export function setupFallbackMonitoring() {
  if (CONFIG.debugMode) {
    console.log('[GitHub 中文翻译] 使用降级监控方案');
  }
}
