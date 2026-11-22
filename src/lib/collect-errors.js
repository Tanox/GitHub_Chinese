/**
 * 采集错误脱敏与描述工具
 * @file src/lib/collect-errors.js
 * @description 从 collector-core 拆出：统一错误文案，详细错误只写服务端日志，
 *   避免 SSE error 事件把绝对路径、内部错误码泄露给客户端。
 */
import { CollectErrorCode } from './collect-codes.js';

/**
 * 将错误转换为可读消息（仅用于服务端日志）
 * @param {unknown} error - 捕获到的异常
 * @returns {string} 错误消息
 */
export function describeError(error) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * 构造对客户端安全的 SSE error 事件（详细错误写服务端日志）
 * @param {string} context - 日志上下文（如「保存或清洗失败」）
 * @param {unknown} error - 原始异常
 * @param {number} [code] - 对外错误码，默认 SUBPROCESS_FAILED
 * @returns {{type: string, message: string, code: number}} SSE 事件对象
 */
export function safeCollectorError(context, error, code = CollectErrorCode.SUBPROCESS_FAILED) {
  console.error(`[collector] ${context}:`, describeError(error));
  return {
    type: 'error',
    message: `${context}，请稍后重试或联系管理员`,
    code,
  };
}
