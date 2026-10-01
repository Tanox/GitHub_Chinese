/**
 * 翻译触发模块
 * @file pageMonitor/translationTrigger.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 管理翻译触发和节流
 */
import { CONFIG } from '../config.js';
import { translationCore } from '../translation-core/index.js';
import { pageAnalyzer } from './pageAnalyzer.js';

export const translationTrigger = {
  lastTranslateTimestamp: 0,
  scheduledTranslate: null,

  translateWithThrottle() {
    try {
      const now = Date.now();
      const minInterval = CONFIG.performance?.minTranslateInterval || 500;
      const useSmartThrottling = CONFIG.performance?.useSmartThrottling !== false;

      if (useSmartThrottling) {
        const complexityFactor = pageAnalyzer.isComplexPage() ? 2 : 1;
        const adjustedInterval = minInterval * complexityFactor;

        if (now - this.lastTranslateTimestamp >= adjustedInterval) {
          return this.delayedTranslate(0);
        }

        if (!this.scheduledTranslate) {
          this.scheduledTranslate = setTimeout(() => {
            this.scheduledTranslate = null;
            this.delayedTranslate(0);
          }, minInterval);
        }

        return null;
      }

      if (now - this.lastTranslateTimestamp >= minInterval) {
        return this.delayedTranslate(0);
      } else if (CONFIG.debugMode) {
        console.log(
          `[GitHub 中文翻译] 翻译请求被节流，距离上次翻译${now - this.lastTranslateTimestamp}ms`,
        );
      }
    } catch (error) {
      console.error('[GitHub 中文翻译] 翻译触发失败:', error);
    }

    return null;
  },

  async delayedTranslate() {
    try {
      this.lastTranslateTimestamp = Date.now();

      const keyAreas = pageAnalyzer.identifyKeyTranslationAreas();

      let startTime;

      if (CONFIG.debugMode && CONFIG.performance?.logTiming) {
        startTime = Date.now();
      }

      if (keyAreas.length > 0) {
        await this.processElementsInBatches(keyAreas);
        if (CONFIG.debugMode) {
          console.log(`[GitHub 中文翻译] 已翻译关键区域: ${keyAreas.length} 个`);
        }
      } else {
        await translationCore.translate();
        if (CONFIG.debugMode) {
          console.log('[GitHub 中文翻译] 已翻译整个页面');
        }
      }

      if (CONFIG.debugMode && CONFIG.performance?.logTiming) {
        console.log(`[GitHub 中文翻译] 翻译耗时: ${Date.now() - startTime}ms`);
      }
    } catch (error) {
      this.handleTranslationError(error);
    }
  },

  async processElementsInBatches(elements) {
    const batchSize = CONFIG.performance?.batchSize || 100;

    for (let i = 0; i < elements.length; i += batchSize) {
      const batch = elements.slice(i, i + batchSize);
      await translationCore.translate(batch);
    }
  },

  async handleTranslationError(error) {
    console.error('[GitHub 中文翻译] 翻译过程出错:', error);

    if (CONFIG.performance?.enableErrorRecovery !== false) {
      try {
        await translationCore.translateCriticalElementsOnly();
        if (CONFIG.debugMode) {
          console.log('[GitHub 中文翻译] 已尝试最小化翻译恢复');
        }
      } catch (recoverError) {
        console.error('[GitHub 中文翻译] 错误恢复失败:', recoverError);
      }
    }
  },
};
