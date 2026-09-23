/**
 * 采集流程错误码约定（服务端与前端共用）
 * @file src/lib/collect-codes.js
 * @version 1.9.32
 * @description 错误码便于前端按类型分流处理，避免仅靠文本消息判定。
 *   该模块**不含任何服务端运行时依赖**（`fs` / `child_process` / `puppeteer-core`），
 *   可被客户端组件安全导入，不会把服务端代码带入客户端包。
 */

/**
 * 错误码枚举
 * @typedef {number} CollectErrorCodeValue
 */

/** @type {Readonly<Record<string, number>>} */
export const CollectErrorCode = Object.freeze({
  /** 未分类错误 */
  UNKNOWN: 9000,
  /** 缺少可选依赖（如 puppeteer 未安装） */
  MISSING_DEPENDENCY: 1001,
  /** 单个 URL 抓取失败 */
  FETCH_FAILED: 2001,
  /** 词典清洗子进程失败 */
  SUBPROCESS_FAILED: 2002,
  /** 输入非法（空文本 / 无有效 URL） */
  INPUT_INVALID: 3001,
});
