/**
 * 统一日志门面
 * @file src/utils/logger.js
 * @version 1.12.8
 * @description 全项目统一日志出口：统一前缀、按级别过滤（默认 info）。
 *   Node 侧可用环境变量 GITHUB_ZH_LOG 调整级别（debug/info/warn/error）；
 *   浏览器侧日志沿用既有 CONFIG.debugMode 守卫，本门面仅作统一前缀与可替换出口。
 */
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

function resolveLevel() {
  if (typeof process !== 'undefined' && process.env?.GITHUB_ZH_LOG) {
    return LEVELS[process.env.GITHUB_ZH_LOG] ?? LEVELS.info;
  }
  return LEVELS.info;
}

let currentLevel = resolveLevel();

/**
 * 调整日志级别（debug / info / warn / error）
 * @param {string} level - 目标级别
 */
export function setLogLevel(level) {
  if (Object.prototype.hasOwnProperty.call(LEVELS, level)) {
    currentLevel = LEVELS[level];
  }
}

function emit(level, method, args) {
  if (currentLevel > LEVELS[level]) return;
  if (typeof console !== 'undefined' && typeof console[method] === 'function') {
    console[method]('[GitHub 中文翻译]', ...args);
  }
}

export const logger = {
  debug: (...args) => emit('debug', 'debug', args),
  info: (...args) => emit('info', 'info', args),
  warn: (...args) => emit('warn', 'warn', args),
  error: (...args) => emit('error', 'error', args),
};

export default logger;
