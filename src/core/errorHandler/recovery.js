/**
 * 错误恢复逻辑模块
 * @file src/core/errorHandler/recovery.js
 */
import { CONFIG } from '../../config.js';
import { RECOVERY_BASE_DELAY_MS, RECOVERY_MAX_DELAY_MS } from './constants.js';

export const recoveryManager = {
  attemptRecovery(context, recoveryFn, maxRetries, currentAttempt = 0) {
    try {
      recoveryFn();
      if (CONFIG.debugMode) {
        console.log(`[GitHub 中文翻译] ${context} - 恢复操作成功 (尝试: ${currentAttempt + 1})`);
      }
    } catch (recoveryError) {
      const attempt = currentAttempt + 1;
      if (CONFIG.debugMode) {
        console.error(
          `[GitHub 中文翻译] ${context} - 恢复操作失败 (尝试: ${attempt}/${maxRetries}):`,
          recoveryError,
        );
      }

      if (attempt < maxRetries) {
        // 指数退避重试
        const delay = Math.pow(2, attempt) * RECOVERY_BASE_DELAY_MS;
        setTimeout(
          () => {
            this.attemptRecovery(context, recoveryFn, maxRetries, attempt);
          },
          Math.min(delay, RECOVERY_MAX_DELAY_MS),
        );
      }
    }
  },
};
