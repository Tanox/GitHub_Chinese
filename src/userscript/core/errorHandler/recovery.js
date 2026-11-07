/**
 * 错误恢复逻辑模块
 * @file src/userscript/core/errorHandler/recovery.js
 * @version 1.13.28
 * @description 同步与异步恢复函数统一支持：await 恢复结果后再决定是否重试，
 *   避免 Promise rejection 绕过 try/catch 导致调用方永远收不到结果。
 */
import { CONFIG } from '../../config/index.js';
import { RECOVERY_BASE_DELAY_MS, RECOVERY_MAX_DELAY_MS } from './constants.js';

/** 等待指定毫秒（指数退避用） */
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const recoveryManager = {
  /**
   * 尝试恢复（支持返回 Promise 的异步恢复函数）
   * @param {string} context - 错误上下文
   * @param {() => unknown | Promise<unknown>} recoveryFn - 恢复函数，可同步或异步
   * @param {number} maxRetries - 最大尝试次数
   * @param {number} [currentAttempt] - 当前已尝试次数
   * @returns {Promise<boolean>} 是否恢复成功（重试耗尽返回 false）
   */
  async attemptRecovery(context, recoveryFn, maxRetries, currentAttempt = 0) {
    try {
      await recoveryFn();
      if (CONFIG.debugMode) {
        console.log(`[GitHub 中文翻译] ${context} - 恢复操作成功 (尝试: ${currentAttempt + 1})`);
      }
      return true;
    } catch (recoveryError) {
      const attempt = currentAttempt + 1;
      if (CONFIG.debugMode) {
        console.error(
          `[GitHub 中文翻译] ${context} - 恢复操作失败 (尝试: ${attempt}/${maxRetries}):`,
          recoveryError,
        );
      }

      if (attempt < maxRetries) {
        // 指数退避重试；await 保证重试结果能回传给调用方
        const delay = Math.min(
          Math.pow(2, attempt) * RECOVERY_BASE_DELAY_MS,
          RECOVERY_MAX_DELAY_MS,
        );
        await wait(delay);
        return this.attemptRecovery(context, recoveryFn, maxRetries, attempt);
      }
      return false;
    }
  },
};
