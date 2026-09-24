/**
 * URL工具模块
 * @file urlUtils.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 包含URL和页面路径相关的工具函数
 */

/**
 * 获取当前页面路径
 * @returns {string} 当前页面的路径
 */
function getCurrentPath() {
  return window.location.pathname;
}

/**
 * 获取完整的当前页面URL（包含查询参数）
 * @returns {string} 完整的URL
 */
function getCurrentUrl() {
  return window.location.href;
}

/**
 * 判断当前页面是否匹配某个路径模式
 * @param {RegExp} pattern - 路径模式
 * @returns {boolean} 是否匹配
 */
function isCurrentPathMatch(pattern) {
  return pattern.test(getCurrentPath());
}

/**
 * 从URL获取查询参数
 * @param {string} name - 参数名
 * @param {string} url - URL字符串，默认使用当前页面URL
 * @returns {string|null} 参数值或null
 */
function getQueryParam(name, url = window.location.href) {
  const match = RegExp(`[?&]${name}=([^&]*)`).exec(url);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

/**
 * 获取URL中的所有查询参数
 * @param {string} url - URL字符串，默认使用当前页面URL
 * @returns {Object} 查询参数对象
 */
function getAllQueryParams(url = window.location.href) {
  const params = {};
  try {
    const searchParams = new URL(url || window.location.href).searchParams;
    for (const [key, value] of searchParams) {
      params[key] = value;
    }
  } catch (error) {
    console.warn('[GitHub 中文翻译] 解析URL参数失败:', error);
  }
  return params;
}

export { getCurrentPath, getCurrentUrl, isCurrentPathMatch, getQueryParam, getAllQueryParams };
