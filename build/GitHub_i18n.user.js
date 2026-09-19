// ==UserScript==
// @name         GitHub Chinese 简体中文
// @namespace    https://github.com/Tanox/GitHub_i18n
// @version      1.9.21
// @description  GitHub页面自动翻译为中文
// @author       Sut
// @match        https://github.com/*
// @match        https://docs.github.com/*
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @connect      raw.githubusercontent.com
// @connect      github.com
// @run-at       document-idle
// @noframes
// @updateURL    https://raw.githubusercontent.com/Tanox/GitHub_i18n/main/build/GitHub_i18n.user.js
// @downloadURL  https://raw.githubusercontent.com/Tanox/GitHub_i18n/main/build/GitHub_i18n.user.js
// @license      GPL-2.0
// @homepage     https://github.com/Tanox/GitHub_i18n
// ==/UserScript==
(function() {
'use strict';
/**
 * 版本信息模块
 * @file version.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 统一管理GitHub自动化字符串更新工具的版本信息
 */
/**
 * 当前工具版本号
 * @type {string}
 * @description 这是项目的单一版本源，所有其他版本号引用都应从此处获取
 */
const VERSION = '1.9.21';
/**
 * GitHub 中文翻译配置文件
 * @file config.js
 */
// 定义greasemonkeyInfo以避免未定义错误
const greasemonkeyInfo = typeof window === 'undefined' ? {} : (window.GM_info ?? {});
/**
 * 从用户脚本头部注释中提取版本号
 * @returns {string} 版本号
 */
function getVersionFromComment() {
  try {
    const versionMatch = greasemonkeyInfo?.script?.version;
    if (versionMatch) {
      return versionMatch;
    }
    return VERSION;
  } catch (_e) {
    return VERSION;
  }
}
/**
 * 配置对象，包含所有可配置项
 */
const CONFIG = {
  version: VERSION,
  debounceDelay: 500,
  routeChangeDelay: 500,
  debugMode: false,
  updateCheck: {
    enabled: true,
    intervalHours: 24,
    scriptUrl: 'https://github.com/Tanox/GitHub_i18n/raw/main/build/GitHub_i18n.user.js',
    autoUpdateVersion: true,
  },
  externalTranslation: {
    enabled: false,
    minLength: 20,
    maxLength: 500,
    timeout: 3000,
    requestInterval: 500,
    cacheSize: 500,
  },
  performance: performanceConfig,
  selectors: selectorsConfig,
  pagePatterns: pagePatternsConfig,
};
/**
 * 函数工具模块
 * @file functionUtils.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 包含节流、防抖、延迟等函数相关工具
 */
/**
 * 节流函数，用于限制高频操作的执行频率
 * 支持返回Promise
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 * @param {Object} options - 配置选项
 * @param {boolean} options.leading - 是否在开始时执行（默认true）
 * @param {boolean} options.trailing - 是否在结束后执行（默认true）
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit, options = {}) {
  const { leading = true, trailing = true } = options;
  let inThrottle, lastArgs, lastThis, result, timerId;
  const later = (context, args) => {
    inThrottle = false;
    if (trailing && lastArgs) {
      result = func.apply(context, args);
      lastArgs = null;
      lastThis = null;
    }
  };
  return function () {
    const args = arguments;
    // eslint-disable-next-line no-invalid-this
    const context = this;
    if (!inThrottle) {
      if (leading) {
        result = func.apply(context, args);
      }
      inThrottle = true;
      timerId = setTimeout(() => later(context, args), limit);
    } else if (trailing) {
      lastArgs = args;
      lastThis = context;
      // 确保只有一个定时器
      clearTimeout(timerId);
      timerId = setTimeout(() => later(lastThis, lastArgs), limit);
    }
    return result;
  };
}
/**
 * 防抖函数，延迟执行函数直到停止触发一段时间
 * 支持返回Promise
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @param {Object} options - 配置选项
 * @param {boolean} options.leading - 是否在开始时执行一次（默认false）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, delay, options = {}) {
  const { leading = false } = options;
  let timeout, result;
  const later = (context, args) => {
    result = func.apply(context, args);
  };
  return function () {
    const args = arguments;
    // eslint-disable-next-line no-invalid-this
    const context = this;
    const isLeadingCall = !timeout && leading;
    clearTimeout(timeout);
    timeout = setTimeout(() => later(context, args), delay);
    if (isLeadingCall) {
      result = func.apply(context, args);
    }
    return result;
  };
}
/**
 * 延迟函数，返回Promise的setTimeout
 * @param {number} ms - 延迟时间（毫秒）
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
/**
 * 安全地执行函数，捕获可能的异常
 * @param {Function} fn - 要执行的函数
 * @param {*} defaultValue - 执行失败时的默认返回值
 * @param {Object} context - 函数执行上下文
 * @param {...*} args - 函数参数
 * @returns {*} 函数返回值或默认值
 */
function safeExecute(fn, defaultValue = null, context = null, ...args) {
  try {
    if (typeof fn === 'function') {
      return fn.apply(context, args);
    }
    return defaultValue;
  } catch (error) {
    console.error('[GitHub 中文翻译] 安全执行函数失败:', error);
    return defaultValue;
  }
}
/**
 * 字符串工具模块
 * @file stringUtils.js
 */
{ safeJSONParse, safeJSONStringify } from './string/json.js';
{ escapeRegExp, isSafeRegex, safeRegExp } from './string/regex.js';
{ getNestedProperty, deepClone } from './string/object.js';
{ sanitizeErrorMessage } from './string/security.js';
/**
 * DOM工具模块
 * @file domUtils.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 包含DOM操作相关的工具函数
 */
/**
 * 收集DOM树中的所有文本节点内容
 * @param {HTMLElement} element - 要收集文本的起始元素
 * @param {Set<string>} resultSet - 用于存储结果的Set集合
 * @param {Object} options - 配置选项
 * @param {number} options.maxLength - 最大文本长度（默认200）
 * @param {string[]} options.skipTags - 跳过的标签名数组
 */
function collectTextNodes(element, resultSet, options = {}) {
  if (!element || !resultSet || typeof resultSet.add !== 'function') return;
  const {
    maxLength = 200,
    skipTags = [
      'script',
      'style',
      'code',
      'pre',
      'textarea',
      'input',
      'select',
      'noscript',
      'template',
    ],
  } = options;
  try {
    if (element.tagName && skipTags.includes(element.tagName.toLowerCase())) {
      return;
    }
    if (element.classList && element.classList.contains('sr-only')) {
      return;
    }
    const childNodes = Array.from(element.childNodes || []);
    for (const node of childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue ? node.nodeValue.trim() : '';
        if (
          text &&
          text.length > 0 &&
          text.length < maxLength &&
          !/^\d+$/.test(text) &&
          !/^[\s\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E\u00A1-\u00BF\u2000-\u206F\u3000-\u303F]+$/.test(
            text,
          )
        ) {
          resultSet.add(text);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        collectTextNodes(node, resultSet, options);
      }
    }
  } catch (error) {
    console.error('[GitHub 中文翻译] 收集文本节点时出错:', error);
  }
}
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
/**
 * 编码安全工具模块
 * @file securityUtils.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 包含编码、加密、数据混淆等安全相关工具
 */
const RADIX_16 = 16;
const PAD_LENGTH_2 = 2;
const PAD_CHAR = '0';
/**
 * 对数据进行Base64编码（用于轻量级数据混淆，非加密）
 * @param {string} data - 要编码的数据
 * @returns {string} Base64编码后的字符串
 */
function base64Encode(data) {
  try {
    return btoa(unescape(encodeURIComponent(data)));
  } catch (_error) {
    return data;
  }
}
/**
 * 对Base64编码的数据进行解码
 * @param {string} encodedData - Base64编码的字符串
 * @returns {string|null} 解码后的字符串或null
 */
function base64Decode(encodedData) {
  try {
    return decodeURIComponent(escape(atob(encodedData)));
  } catch (_error) {
    return null;
  }
}
/**
 * 混淆敏感配置数据（轻量级保护）
 * 使用XOR加密配合Base64编码
 * @param {string} data - 要混淆的数据
 * @param {string} key - 混淆密钥
 * @returns {string} 混淆后的数据
 */
function obfuscateData(data, key = 'github-i18n-secure') {
  try {
    const encoded = base64Encode(data);
    let result = '';
    for (let i = 0; i < encoded.length; i++) {
      // eslint-disable-next-line no-bitwise
      const charCode = encoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return base64Encode(result);
  } catch (_error) {
    return data;
  }
}
/**
 * 还原被混淆的配置数据
 * @param {string} obfuscatedData - 被混淆的数据
 * @param {string} key - 混淆密钥
 * @returns {string|null} 还原后的数据或null
 */
function deobfuscateData(obfuscatedData, key = 'github-i18n-secure') {
  try {
    const decoded = base64Decode(obfuscatedData);
    if (!decoded) return null;
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      // eslint-disable-next-line no-bitwise
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return base64Decode(result);
  } catch (_error) {
    return null;
  }
}
/**
 * 计算字符串的SHA-256哈希值
 * @param {string} data - 要计算哈希的数据
 * @returns {Promise<string>} SHA-256哈希值（十六进制格式）
 */
async function sha256Hash(data) {
  try {
    const msgUint8 = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(RADIX_16).padStart(PAD_LENGTH_2, PAD_CHAR)).join('');
  } catch (_error) {
    return '';
  }
}
/**
 * 工具函数模块
 * @file utils.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 包含各种通用的辅助函数，从子模块整合导出
 */
import {
  escapeRegExp,
  safeJSONParse,
  safeJSONStringify,
  isSafeRegex,
  safeRegExp,
  getNestedProperty,
  deepClone,
  sanitizeErrorMessage,
} from './stringUtils.js';
import {
  getCurrentPath,
  getCurrentUrl,
  isCurrentPathMatch,
  getQueryParam,
  getAllQueryParams,
} from './urlUtils.js';
import {
  base64Encode,
  base64Decode,
  obfuscateData,
  deobfuscateData,
  sha256Hash,
} from './securityUtils.js';
const utils = {
  throttle,
  debounce,
  delay,
  safeExecute,
  escapeRegExp,
  safeJSONParse,
  safeJSONStringify,
  isSafeRegex,
  safeRegExp,
  getNestedProperty,
  deepClone,
  sanitizeErrorMessage,
  collectTextNodes,
  getCurrentPath,
  getCurrentUrl,
  isCurrentPathMatch,
  getQueryParam,
  getAllQueryParams,
  base64Encode,
  base64Decode,
  obfuscateData,
  deobfuscateData,
  sha256Hash,
};
/**
 * LRU缓存管理模块
 * @file cacheManager.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 实现LRU缓存策略，用于翻译结果缓存
 */
class CacheManager {
  constructor(maxSize = 2000) {
    this.translationCache = new Map();
    this.maxSize = maxSize;
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
    };
  }
  getFromCache(key) {
    const cacheItem = this.translationCache.get(key);
    if (cacheItem && cacheItem.value) {
      cacheItem.timestamp = Date.now();
      cacheItem.accessCount = (cacheItem.accessCount || 0) + 1;
      this.cacheStats.hits++;
      return cacheItem.value;
    }
    this.cacheStats.misses++;
    return null;
  }
  setToCache(key, value, isPageUnloading = false) {
    if (isPageUnloading) {
      return;
    }
    this.checkCacheSizeLimit();
    this.translationCache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1,
    });
    this.cacheStats.size = this.translationCache.size;
  }
  checkCacheSizeLimit() {
    if (this.translationCache.size >= this.maxSize) {
      this.performLRUCacheEviction(this.maxSize);
    }
  }
  performLRUCacheEviction(maxSize) {
    try {
      const targetSize = Math.floor(maxSize * 0.8);
      const cacheEntries = Array.from(this.translationCache.entries());
      cacheEntries.sort(([, itemA], [, itemB]) => {
        if (itemB.timestamp !== itemA.timestamp) {
          return itemB.timestamp - itemA.timestamp;
        }
        return (itemB.accessCount || 0) - (itemA.accessCount || 0);
      });
      const entriesToKeep = cacheEntries.slice(0, targetSize);
      const evictedCount = cacheEntries.length - entriesToKeep.length;
      this.translationCache.clear();
      entriesToKeep.forEach(([key, item]) => {
        this.translationCache.set(key, item);
      });
      this.cacheStats.evictions += evictedCount;
      this.cacheStats.size = this.translationCache.size;
    } catch (_error) {
      const evictCount = Math.max(50, Math.floor(this.translationCache.size * 0.2));
      const oldestEntries = Array.from(this.translationCache.entries())
        .sort(([, itemA], [, itemB]) => itemA.timestamp - itemB.timestamp)
        .slice(0, evictCount);
      oldestEntries.forEach(([key]) => {
        this.translationCache.delete(key);
      });
      this.cacheStats.evictions += evictCount;
      this.cacheStats.size = this.translationCache.size;
    }
  }
  cleanCache() {
    this.checkCacheSizeLimit();
  }
  clearCache() {
    this.translationCache.clear();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
    };
  }
  getStats() {
    return { ...this.cacheStats };
  }
}
/**
 * 错误处理模块
 * @file errorHandler.js
 */
import {
  ERROR_TYPES,
  DEFAULT_THRESHOLD,
  BATCH_DELAY_MIN_MS,
  NETWORK_INTERVAL_MIN_MS,
  NETWORK_INTERVAL_MAX_MS,
  BATCH_DELAY_FALLBACK_MS
} from './errorHandler/constants.js';
const ErrorHandler = {
  // 错误计数器
  errorCounts: new Map(),
  // 错误类型定义
  ERROR_TYPES,
  /**
   * 初始化错误处理器
   */
  init() {
    this.errorCounts.clear();
    // 初始化所有错误类型的计数器
    Object.values(this.ERROR_TYPES).forEach((type) => {
      this.errorCounts.set(type, 0);
    });
  },
  /**
   * 处理错误
   * @param {string} context - 错误发生的上下文
   * @param {Error} error - 错误对象
   * @param {string} type - 错误类型
   * @param {Object} [options] - 错误处理选项
   * @param {boolean} [options.retryable] - 是否可重试
   * @param {Function} [options.recoveryFn] - 恢复函数
   * @param {number} [options.maxRetries] - 最大重试次数
   */
  handleError(context, error, type = this.ERROR_TYPES.OTHER, options = {}) {
    // 更新错误计数
    const currentCount = this.errorCounts.get(type) || 0;
    this.errorCounts.set(type, currentCount + 1);
    // 记录错误日志
    this.logError(context, error, type);
    // 检查是否需要进行恢复
    if (options.recoveryFn && typeof options.recoveryFn === 'function') {
      recoveryManager.attemptRecovery(context, options.recoveryFn, options.maxRetries || 1);
    }
    // 检查是否需要采取紧急措施
    this.checkErrorThreshold(type, currentCount + 1);
  },
  /**
   * 记录错误日志
   * @param {string} context - 错误发生的上下文
   * @param {Error} error - 错误对象
   * @param {string} type - 错误类型
   */
  logError(context, error, type) {
    const sanitizedMessage = utils.sanitizeErrorMessage(error);
    const errorMessage = `[GitHub 中文翻译] ${context}时出错 (${type}): ${sanitizedMessage}`;
    if (CONFIG.debugMode) {
      console.error(errorMessage);
    } else {
      console.error(errorMessage);
    }
  },
  /**
   * 检查错误阈值
   * @param {string} type - 错误类型
   * @param {number} count - 当前错误计数
   */
  checkErrorThreshold(type, count) {
    const thresholds = {
      [this.ERROR_TYPES.TRANSLATION]: CONFIG.performance?.maxTranslationErrorCount || 10,
      [this.ERROR_TYPES.DOM_OPERATION]: CONFIG.performance?.maxDomErrorCount || DEFAULT_THRESHOLD,
      [this.ERROR_TYPES.DICTIONARY]: CONFIG.performance?.maxDictionaryErrorCount || 5,
      [this.ERROR_TYPES.NETWORK]: CONFIG.performance?.maxNetworkErrorCount || 3,
      [this.ERROR_TYPES.PERFORMANCE]: CONFIG.performance?.maxPerformanceErrorCount || 15,
      [this.ERROR_TYPES.OTHER]: CONFIG.performance?.maxOtherErrorCount || 25,
    };
    const threshold = thresholds[type] || DEFAULT_THRESHOLD;
    if (count >= threshold) {
      this.handleErrorOverflow(type, count, threshold);
    }
  },
  /**
   * 处理错误溢出
   * @param {string} type - 错误类型
   * @param {number} count - 当前错误计数
   * @param {number} threshold - 阈值
   */
  handleErrorOverflow(type, count, threshold) {
    if (CONFIG.debugMode) {
      console.warn(`[GitHub 中文翻译] ${type} 错误超过阈值 (${count}/${threshold})，采取紧急措施`);
    }
    // 根据错误类型采取不同的紧急措施
    switch (type) {
      case this.ERROR_TYPES.TRANSLATION:
        CONFIG.performance.enableFullTranslation = false;
        break;
      case this.ERROR_TYPES.DOM_OPERATION:
        CONFIG.performance.batchDelay = Math.max(
          CONFIG.performance.batchDelay || 0,
          BATCH_DELAY_MIN_MS,
        );
        break;
      case this.ERROR_TYPES.DICTIONARY:
        if (typeof window.GitHub_i18n !== 'undefined' && window.GitHub_i18n.translationCore) {
          window.GitHub_i18n.translationCore.initDictionary();
        }
        break;
      case this.ERROR_TYPES.NETWORK:
        CONFIG.performance.networkRequestInterval = Math.max(
          CONFIG.performance.networkRequestInterval || NETWORK_INTERVAL_MIN_MS,
          NETWORK_INTERVAL_MAX_MS,
        );
        break;
      default:
        CONFIG.performance.batchDelay = Math.max(
          CONFIG.performance.batchDelay || 0,
          BATCH_DELAY_FALLBACK_MS,
        );
        break;
    }
    // 重置错误计数
    this.errorCounts.set(type, 0);
  },
  /**
   * 获取错误统计信息
   * @returns {Object} 错误统计对象
   */
  getErrorStats() {
    const stats = {};
    this.errorCounts.forEach((count, type) => {
      stats[type] = count;
    });
    return stats;
  },
  /**
   * 重置错误计数
   * @param {string} [type] - 可选的错误类型，不提供则重置所有
   */
  resetErrorCounts(type) {
    if (type) {
      this.errorCounts.set(type, 0);
    } else {
      this.init();
    }
  },
};
// 初始化错误处理器
ErrorHandler.init();
/**
 * 虚拟DOM节点模块
 * @file virtualNode.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 虚拟DOM节点类，表示一个DOM元素的虚拟映射
 */
const RANDOM_BASE = 36;
const RANDOM_START_INDEX = 2;
const RANDOM_LENGTH = 9;
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    // eslint-disable-next-line no-magic-numbers
    hash = (hash * 31 + char) % 2147483647;
  }
  return Math.abs(hash).toString(RANDOM_BASE);
}
class VirtualNode {
  constructor(element) {
    this.element = element;
    this.elementId = null;
    this.contentHash = null;
    this.isTranslated = false;
    this.attributes = new Map();
    this.childNodes = new Map();
    this.lastUpdated = Date.now();
    this.initialize();
  }
  initialize() {
    try {
      this.generateId();
      this.updateContentHash();
      this.updateAttributes();
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 初始化虚拟节点失败:', error);
      }
    }
  }
  generateId() {
    try {
      if (this.element.id) {
        this.elementId = `id:${this.element.id}`;
      } else if (this.element.dataset && this.element.dataset.testid) {
        this.elementId = `testid:${this.element.dataset.testid}`;
      } else {
        this.elementId = `temp:${Date.now()}:${Math.random().toString(RANDOM_BASE).substr(RANDOM_START_INDEX, RANDOM_LENGTH)}`;
        this.element.dataset.virtualDomId = this.elementId;
      }
    } catch (_error) {
      this.elementId = `fallback:${Math.random().toString(RANDOM_BASE).substr(RANDOM_START_INDEX, RANDOM_LENGTH)}`;
    }
  }
  updateContentHash() {
    try {
      const content = this.element.textContent || '';
      this.contentHash = hashString(content);
      return this.contentHash;
    } catch (_error) {
      this.contentHash = null;
      return null;
    }
  }
  updateAttributes() {
    try {
      const importantAttrs = CONFIG.performance.importantAttributes || [];
      importantAttrs.forEach((attrName) => {
        if (this.element.hasAttribute(attrName)) {
          this.attributes.set(attrName, this.element.getAttribute(attrName));
        } else {
          this.attributes.delete(attrName);
        }
      });
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 更新属性状态失败:', error);
      }
    }
  }
  hasContentChanged() {
    const newHash = this.updateContentHash();
    return newHash !== this.contentHash;
  }
  hasAttributesChanged() {
    const originalAttributes = new Map(this.attributes);
    this.updateAttributes();
    if (originalAttributes.size !== this.attributes.size) {
      return true;
    }
    for (const [key, value] of originalAttributes) {
      if (!this.attributes.has(key) || this.attributes.get(key) !== value) {
        return true;
      }
    }
    return false;
  }
  markAsTranslated() {
    this.isTranslated = true;
    this.lastUpdated = Date.now();
    try {
      this.element.dataset.githubZhTranslated = 'true';
    } catch (_error) {
      // 忽略错误
    }
  }
  resetTranslation() {
    this.isTranslated = false;
    this.lastUpdated = Date.now();
    try {
      delete this.element.dataset.githubZhTranslated;
    } catch (_error) {
      // 忽略错误
    }
  }
}
/**
 * 虚拟DOM模块
 * @file virtualDom.js
 */
const virtualDomManager = new VirtualDomManager();
virtualDomManager;
/**
 * 开发工具模块
 * @file tools.js
 */
/**
 * 加载工具类
 * @returns {Object} 包含工具类的对象
 */
function loadTools() {
  return {
    stringExtractor,
    AutoStringUpdater,
    DictionaryProcessor,
  };
}
/**
 * 页面监控缓存管理模块
 * @file pageMonitor/cacheManager.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 管理页面监控中的缓存
 */
const pageMonitorCache = {
  nodeCheckCache: new Map(),
  lastCacheCleanupTime: Date.now(),
  cacheCleanupTimerId: null,
  eventListeners: [],
  startCacheCleanupTimer() {
    this.stopCacheCleanupTimer();
    this.cacheCleanupTimerId = setInterval(() => {
      if (!this.isPageUnloading) {
        this.cleanupNodeCheckCache();
      }
    }, CONFIG.performance?.cacheCleanupInterval || 30000);
  },
  stopCacheCleanupTimer() {
    if (this.cacheCleanupTimerId) {
      clearInterval(this.cacheCleanupTimerId);
      this.cacheCleanupTimerId = null;
    }
  },
  cleanupNodeCheckCache() {
    try {
      const maxCacheSize = CONFIG.performance?.maxNodeCacheSize || 1000;
      if (this.nodeCheckCache.size > maxCacheSize) {
        const entriesToRemove = Math.floor(this.nodeCheckCache.size * 0.3);
        const keysToRemove = Array.from(this.nodeCheckCache.keys()).slice(0, entriesToRemove);
        keysToRemove.forEach((key) => {
          this.nodeCheckCache.delete(key);
        });
        if (CONFIG.debugMode) {
          console.log(`[GitHub 中文翻译] 清理了${keysToRemove.length}个节点检查缓存条目`);
        }
      }
      this.lastCacheCleanupTime = Date.now();
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 清理节点检查缓存失败:', error);
      }
    }
  },
  clearCache() {
    this.nodeCheckCache.clear();
  },
  addEventListener(listener) {
    this.eventListeners.push(listener);
    listener.target.addEventListener(listener.type, listener.handler);
  },
  cleanupEventListeners() {
    this.eventListeners.forEach((listener) => {
      try {
        listener.target.removeEventListener(listener.type, listener.handler);
      } catch (error) {
        console.warn('[GitHub 中文翻译] 移除事件监听器失败:', error);
      }
    });
    this.eventListeners = [];
  },
};
/**
 * 页面分析模块
 * @file pageMonitor/pageAnalyzer.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 分析页面类型和关键区域
 */
const pageAnalyzer = {
  isComplexPage() {
    const complexPaths = [/\/pull\/\d+/, /\/issues\/\d+/, /\/blob\//, /\/commit\//, /\/compare\//];
    return complexPaths.some((pattern) => pattern.test(window.location.pathname));
  },
  getQuickPathThresholdByPageMode(pageMode) {
    const thresholds = {
      search: 5,
      issues: 4,
      pullRequests: 4,
      wiki: 6,
      actions: 5,
      codespaces: 3,
    };
    return thresholds[pageMode] || 3;
  },
  getModeSpecificThreshold(pageMode) {
    const thresholds = {
      issues: 0.35,
      pullRequests: 0.35,
      wiki: 0.4,
      search: 0.3,
      codespaces: 0.25,
    };
    return thresholds[pageMode];
  },
  getMinTextLengthByPageMode(pageMode) {
    const lengths = {
      issues: 4,
      pullRequests: 4,
      wiki: 5,
      search: 3,
    };
    return lengths[pageMode] || CONFIG.performance?.minTextLengthToTranslate || 3;
  },
  shouldSkipElementByPageMode(element, pageMode) {
    if (!element || !pageMode) return false;
    if (
      element.tagName === 'CODE' ||
      element.tagName === 'SCRIPT' ||
      element.tagName === 'STYLE' ||
      element.classList.contains('blob-code')
    ) {
      return true;
    }
    switch (pageMode) {
      case 'codespaces':
        return (
          element.classList.contains('terminal') ||
          element.classList.contains('command-input') ||
          element.dataset.terminal
        );
      case 'wiki':
        return (
          element.classList.contains('codehilite') ||
          element.classList.contains('highlight') ||
          element.closest('.highlight')
        );
      case 'issues':
      case 'pullRequests':
        return element.classList.contains('blob-code') || element.classList.contains('diff-line');
      case 'search':
        if (element.classList.contains('search-match')) {
          return false;
        }
        return element.classList.contains('text-small') || element.classList.contains('link-gray');
      default:
        return false;
    }
  },
  identifyKeyTranslationAreas() {
    const keySelectors = [];
    const path = window.location.pathname;
    if (/\/pull\/\d+/.test(path) || /\/issues\/\d+/.test(path)) {
      keySelectors.push('.js-discussion', '.issue-details', '.js-issue-title', '.js-issue-labels');
    } else if (/\/blob\//.test(path)) {
      keySelectors.push('.blob-wrapper', '.file-header', '.file-info');
    } else if (/\/commit\//.test(path)) {
      keySelectors.push('.commit-meta', '.commit-files', '.commit-body', '.commit-desc');
    } else if (/\/notifications/.test(path)) {
      keySelectors.push('.notifications-list', '.notification-shelf');
    } else if (/\/actions/.test(path)) {
      keySelectors.push('.workflow-run-list', '.workflow-jobs', '.workflow-run-header');
    } else if (/\/settings/.test(path)) {
      keySelectors.push('.settings-content', '.js-settings-content');
    } else if (/\/projects/.test(path)) {
      keySelectors.push('.project-layout', '.project-columns');
    } else if (/\/wiki/.test(path)) {
      keySelectors.push('.wiki-wrapper', '.markdown-body');
    } else if (/\/search/.test(path)) {
      keySelectors.push('.codesearch-results', '.search-title');
    } else if (/\/orgs\//.test(path) || /\/users\//.test(path)) {
      keySelectors.push(
        '.org-profile',
        '.profile-timeline',
        '.user-profile-sticky-header',
        '.user-profile-main',
      );
    } else if (/\/repos\/\w+\/\w+/.test(path)) {
      keySelectors.push('.repository-content', '.repository-meta-content', '.readme');
    } else {
      keySelectors.push('.repository-content', '.profile-timeline', '.application-main', 'main');
    }
    const elements = [];
    for (const selector of keySelectors) {
      const element = document.querySelector(selector);
      if (element) {
        elements.push(element);
      }
    }
    if (elements.length === 0) {
      const genericSelectors = ['#js-pjax-container', '.application-main', 'main', 'body'];
      for (const selector of genericSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          elements.push(element);
          break;
        }
      }
    }
    return elements;
  },
};
/**
 * 路径变化监听模块
 * @file pageMonitor/pathListener.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 监听URL路径变化
 */
const pathListener = {
  lastPath: '',
  onPathChange: null,
  init(pathChangeCallback) {
    this.onPathChange = pathChangeCallback;
    this.lastPath = window.location.pathname + window.location.search;
    this.setupPathListener();
  },
  setupPathListener() {
    const popstateHandler = utils.debounce(() => {
      const currentPath = window.location.pathname + window.location.search;
      if (currentPath !== this.lastPath) {
        this.handlePathChange();
      }
    }, CONFIG.routeChangeDelay || 500);
    window.addEventListener('popstate', popstateHandler);
    pageMonitorCache.addEventListener({
      target: window,
      type: 'popstate',
      handler: popstateHandler,
    });
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      pathListener.handlePathChange();
    };
    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      pathListener.handlePathChange();
    };
  },
  handlePathChange() {
    try {
      const currentPath = window.location.pathname + window.location.search;
      this.lastPath = currentPath;
      if (CONFIG.debugMode) {
        console.log(`[GitHub 中文翻译] 页面路径变化: ${currentPath}`);
      }
      if (this.onPathChange) {
        setTimeout(() => {
          this.onPathChange();
        }, CONFIG.routeChangeDelay || 500);
      }
    } catch (error) {
      console.error('[GitHub 中文翻译] 路径变化处理失败:', error);
    }
  },
};
/**
 * DOM变化观察器模块
 * @file pageMonitor/domObserver.js
 */
import {
  isElementImportant,
  isElementIgnored,
  isMutationContentRelated,
} from './domObserver.utils.js';
const domObserver = {
  observer: null,
  onTranslationTrigger: null,
  isPageUnloading: false,
  errorCount: 0,
  init(translationTriggerCallback) {
    this.onTranslationTrigger = translationTriggerCallback;
    setupDomObserver(this, translationTriggerCallback);
  },
  shouldTriggerTranslation(mutations, inputPageMode) {
    return shouldTriggerTranslation(mutations, inputPageMode);
  },
  detectImportantChanges(mutations, pageMode) {
    return detectImportantChanges(mutations, pageMode);
  },
  isImportantElement(element, importantElements, cache, pageMode) {
    return isElementImportant(element, importantElements, cache, pageMode);
  },
  shouldIgnoreElement(node, ignoreElements, cache, pageMode) {
    return isElementIgnored(node, ignoreElements, cache, pageMode);
  },
  isContentRelatedMutation(mutation, pageMode) {
    return isMutationContentRelated(mutation, pageMode);
  },
  handleError(operation, error) {
    const errorMessage = `[GitHub 中文翻译] ${operation}时出错: ${error.message}`;
    if (CONFIG.debugMode) {
      console.error(errorMessage, error);
    } else {
      console.error(errorMessage);
    }
    this.errorCount++;
    if (this.errorCount > (CONFIG.performance?.maxErrorCount || 5)) {
      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 错误次数过多，尝试重启监控');
      }
      setTimeout(() => {
        setupDomObserver(this, this.onTranslationTrigger);
      }, 1000);
      this.errorCount = 0;
    }
  },
  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  },
};
/**
 * 翻译触发模块
 * @file pageMonitor/translationTrigger.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 管理翻译触发和节流
 */
const translationTrigger = {
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
/**
 * 页面监控主模块
 * @file pageMonitor/index.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 页面监控主入口，整合所有子模块
 */
const pageMonitor = {
  isPageUnloading: false,
  init() {
    try {
      this.setupPageUnloadHandler();
      pathListener.init(() => {
        translationTrigger.translateWithThrottle();
      });
      domObserver.init(() => {
        translationTrigger.translateWithThrottle();
      });
      pageMonitorCache.startCacheCleanupTimer();
      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 页面监控初始化完成');
      }
    } catch (error) {
      console.error('[GitHub 中文翻译] 页面监控初始化失败:', error);
    }
  },
  setupPageUnloadHandler() {
    const unloadHandler = () => {
      this.isPageUnloading = true;
      domObserver.isPageUnloading = true;
      pageMonitorCache.isPageUnloading = true;
      this.cleanup();
    };
    pageMonitorCache.addEventListener({
      target: window,
      type: 'beforeunload',
      handler: unloadHandler,
    });
    pageMonitorCache.addEventListener({
      target: window,
      type: 'unload',
      handler: unloadHandler,
    });
    pageMonitorCache.addEventListener({
      target: window,
      type: 'pagehide',
      handler: unloadHandler,
    });
  },
  translateWithThrottle() {
    return translationTrigger.translateWithThrottle();
  },
  stop() {
    try {
      domObserver.stop();
      pageMonitorCache.stopCacheCleanupTimer();
      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 页面监控已停止');
      }
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 停止监控失败:', error);
      }
    }
  },
  cleanup() {
    try {
      this.stop();
      pageMonitorCache.cleanupNodeCheckCache();
      pageMonitorCache.cleanupEventListeners();
      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 页面监控资源已完全清理');
      }
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 清理页面监控资源失败:', error);
      }
    }
  },
  restart() {
    this.stop();
    setTimeout(() => {
      this.init();
    }, 100);
  },
};
/**
 * 通用翻译词典
 * @file common.js
 */
const commonDictionary = {
  ...navDictionary,
  ...repoDictionary,
  ...prDictionary,
  ...issueDictionary,
  ...miscDictionary,
};
/**
 * Codespaces 页面翻译词典
 * @file codespaces.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 包含 GitHub Codespaces 页面的翻译词典
 */
const codespacesDictionary = {
  'Skip to content': '跳转到内容',
  'You signed in with another tab or window. Reload to refresh your session.':
    '您已在另一个标签页或窗口中登录。请重新加载以刷新您的会话。',
  Reload: '重新加载',
  'You signed out in another tab or window. Reload to refresh your session.':
    '您已在另一个标签页或窗口中登出。请重新加载以刷新您的会话。',
  'Dismiss alert': '关闭警告',
  'Uh oh!\n\n              There was an error while loading. Please reload this page.':
    '哎呀！\n\n              加载时发生错误。请重新加载此页面。',
  'Uh oh!': '哎呀！',
  'There was an error while loading. Please reload this page.':
    '加载时发生错误。请重新加载此页面。',
  'Please reload this page': '请重新加载此页面',
  'Sign in with a passkey': '使用通行密钥登录',
  Terms: '条款',
  Privacy: '隐私',
  Docs: '文档',
  'Manage cookies': '管理 Cookie',
  'Do not share my personal information': '不要分享我的个人信息',
  "You can't perform that action at this time.": '您现在无法执行此操作。',
};
/**
 * Explore 页面翻译词典
 * @file explore.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 包含 GitHub Explore 页面的翻译词典
 */
const exploreDictionary = {
  'Navigation Menu': '导航菜单',
  'Toggle navigation': '切换导航',
  'Sign in\n          \n              \n    \n        \n    \n\nAppearance settings':
    '登录\n          \n              \n    \n        \n    \n\n外观设置',
  'Sign in': '登录',
  'Appearance settings': '外观设置',
  New: '新建',
  'Actions\n\n        \n\n        Automate any workflow':
    'Actions\n\n        \n\n        自动化任何工作流',
  Actions: 'Actions',
  'Codespaces\n\n        \n\n        Instant dev environments':
    'Codespaces\n\n        \n\n        即时开发环境',
  'Issues\n\n        \n\n        Plan and track work':
    'Issues\n\n        \n\n        计划和跟踪工作',
  Issues: '问题',
  'Code Review\n\n        \n\n        Manage code changes':
    '代码审查\n\n        \n\n        管理代码变更',
  'Code Review': '代码审查',
  'Discussions\n\n        \n\n        Collaborate outside of code':
    '讨论\n\n        \n\n        代码外的协作',
  'Code Search\n\n        \n\n        Find more, search less':
    '代码搜索\n\n        \n\n        查找更多，搜索更少',
  'Code Search': '代码搜索',
  Explore: '探索',
  Blog: '博客',
  'MCP Registry': 'MCP 注册表',
  'View all features': '查看全部功能',
  'By company size': '按公司规模',
  'Small and medium teams': '中小型团队',
  'By use case': '按使用场景',
  'App Modernization': '应用现代化',
  DevOps: '开发运维',
  'CI/CD': '持续集成/持续部署',
  'View all use cases': '查看全部使用场景',
  'By industry': '按行业',
  'Financial services': '金融服务',
  'View all industries': '查看全部行业',
  'View all solutions': '查看全部解决方案',
  Topics: '主题',
  AI: '人工智能',
  'Software Development': '软件开发',
  'View all': '查看全部',
  'Learning Pathways': '学习路径',
  'Events & Webinars': '活动与网络研讨会',
  'Ebooks & Whitepapers': '电子书与白皮书',
  'Customer Stories': '客户案例',
  'Executive Insights': '高管见解',
  'Open Source': '开源',
  'The ReadME Project': 'ReadME 项目',
  'Enterprise platform\n\n        \n\n        AI-powered developer platform':
    '企业平台\n\n        \n\n        人工智能驱动的开发者平台',
  'Enterprise platform': '企业平台',
  'Available add-ons': '可用附加组件',
  'Copilot for business\n\n        \n\n        Enterprise-grade AI features':
    '商业版 Copilot\n\n        \n\n        企业级人工智能功能',
  'Copilot for business': '商业版 Copilot',
  'Premium Support\n\n        \n\n        Enterprise-grade 24/7 support':
    '高级支持\n\n        \n\n        企业级 24/7 支持',
  'Premium Support': '高级支持',
  Pricing: '价格',
  'Search or jump to...': '搜索或跳转到...',
  Search: '搜索',
  Clear: '清除',
  'Search syntax tips': '搜索语法提示',
  'Provide feedback': '提供反馈',
  'We read every piece of feedback, and take your input very seriously.':
    '我们会阅读每一条反馈，并非常重视您的意见。',
  'Cancel\n\n              Submit feedback': '取消\n\n              提交反馈',
  Cancel: '取消',
  'Submit feedback': '提交反馈',
  'Saved searches\n      \n        Use saved searches to filter your results more quickly':
    '已保存的搜索\n      \n        使用已保存的搜索更快地筛选结果',
  'Saved searches': '已保存的搜索',
  'Use saved searches to filter your results more quickly': '使用已保存的搜索更快地筛选结果',
  Name: '名称',
  Query: '查询',
  'To see all available qualifiers, see our documentation.': '查看我们的文档了解所有可用的限定符。',
  'Cancel\n\n              Create saved search': '取消\n\n              创建已保存的搜索',
  'Create saved search': '创建已保存的搜索',
  'Sign up': '注册',
  'Resetting focus': '重置焦点',
  Events: '活动',
  'Collections\n    Curated lists and insight into burgeoning industries, topics, and communities.':
    '收藏集\n    精选列表和对新兴行业、主题和社区的洞察。',
  'Curated lists and insight into burgeoning industries, topics, and communities.':
    '精选列表和对新兴行业、主题和社区的洞察。',
  'Pixel Art Tools': '像素艺术工具',
  'Learn to Code\n    Resources to help people learn to code':
    '学习编程\n    帮助人们学习编程的资源',
  'Learn to Code': '学习编程',
  'Resources to help people learn to code': '帮助人们学习编程的资源',
  '#\n    Game Engines\n    Frameworks for building games across multiple platforms.':
    '#\n    游戏引擎\n    用于跨平台构建游戏的框架。',
  'Game Engines': '游戏引擎',
  'Frameworks for building games across multiple platforms.': '用于跨平台构建游戏的框架。',
  'How to choose (and contribute to) your first open source project':
    '如何选择（并贡献于）您的第一个开源项目',
  'Clean code linters': '代码整洁检查工具',
  'Open journalism': '开放新闻业',
  'Design essentials': '设计基础',
  '#\n    \n\n    \n      Music\n      Drop the code bass with these musically themed repositories.':
    '#\n    \n\n    \n      音乐\n      用这些音乐主题的仓库释放代码节奏。',
  'Music\n      Drop the code bass with these musically themed repositories.':
    '音乐\n      用这些音乐主题的仓库释放代码节奏。',
  Music: '音乐',
  'Government apps': '政府应用',
  'DevOps tools': 'DevOps 工具',
  'Front-end JavaScript frameworks': '前端 JavaScript 框架',
  'Hacking Minecraft': 'Minecraft 黑客技术',
  'JavaScript Game Engines': 'JavaScript 游戏引擎',
  'Learn to Code\n      Resources to help people learn to code':
    '学习编程\n      帮助人们学习编程的资源',
  'Getting started with machine learning': '机器学习入门',
  'Made in Africa': '非洲制造',
  'Net neutrality\n      Software, research, and organizations protecting the free and open internet.':
    '网络中立性\n      保护自由开放互联网的软件、研究和组织。',
  'Net neutrality': '网络中立性',
  'Open data': '开放数据',
  'Open source organizations\n      A showcase of organizations showcasing their open source projects.':
    '开源组织\n      展示开源项目的组织展示。',
  'Open source organizations': '开源组织',
  'Software productivity tools': '软件生产力工具',
  'Load more…': '加载更多…',
  Footer: '页脚',
  'Footer navigation': '页脚导航',
  Status: '状态',
  Contact: '联系',
  'The Download': 'The Download',
  'Get the latest developer and open source news': '获取最新的开发者和开源新闻',
  'Trending repository': '热门仓库',
  'juspay          /\n          hyperswitch': 'juspay          /\n          hyperswitch',
  juspay: 'juspay',
  'Star\n          35.6k': '星标\n          35.6k',
  Star: '星标',
  '35.6k': '35.6k',
  Code: '代码',
  'Pull requests': '拉取请求',
  'An open source payments switch written in Rust to make payments fast, reliable and affordable':
    '一个用 Rust 编写的开源支付交换机，使支付变得快速、可靠且经济实惠',
  rust: 'rust',
  redis: 'redis',
  'open-source': '开源',
  finance: '金融',
  sdk: 'SDK',
  'high-performance': '高性能',
  'beginner-friendly': '对初学者友好',
  'works-with-react': '兼容 React',
  'Updated\n            Oct 4, 2025': '更新于\n            2025年10月4日',
};
/**
 * 翻译词典合并模块
 * @file index.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 整合所有页面的翻译词典
 */
/**
 * 翻译词典对象，包含所有需要翻译的字符串
 */
const translationModule = {
  common: commonDictionary,
  codespaces: codespacesDictionary,
  explore: exploreDictionary,
  // 可以根据需要添加更多页面的词典
};
/**
 * 合并所有词典为一个完整的词典对象
 * @returns {Object} 合并后的词典
 */
function mergeAllDictionaries() {
  const merged = {};
  for (const module in translationModule) {
    if (Object.prototype.hasOwnProperty.call(translationModule, module)) {
      Object.assign(merged, translationModule[module]);
    }
  }
  return merged;
}
/**
 * 翻译词典管理模块
 * @file translationCore/dictionaryManager.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 管理翻译词典的加载和查询
 */
// 词典管理常量
const DEFAULT_MAX_DICT_SIZE = 2000; // 默认最大词典大小
const MAX_KEY_LENGTH_FOR_CASE_VARIANTS = 100; // 生成大小写变体的最大键长度
const dictionaryManager = {
  dictionary: {},
  dictionaryHash: new Map(),
  cacheManager: null,
  init() {
    try {
      let startTime;
      if (CONFIG.debugMode) {
        startTime = Date.now();
      }
      this.cacheManager = new CacheManager(
        CONFIG.performance?.maxDictSize || DEFAULT_MAX_DICT_SIZE,
      );
      this.dictionary = mergeAllDictionaries();
      this.dictionaryHash.clear();
      // 构建哈希表，支持大小写不敏感查询
      Object.keys(this.dictionary).forEach((key) => {
        const value = this.dictionary[key];
        if (value && !value.startsWith('待翻译: ')) {
          // 原始键
          this.dictionaryHash.set(key, value);
          // 小写键（用于大小写不敏感匹配）
          if (key.length <= MAX_KEY_LENGTH_FOR_CASE_VARIANTS) {
            this.dictionaryHash.set(key.toLowerCase(), value);
            this.dictionaryHash.set(key.toUpperCase(), value);
          }
        }
      });
      if (CONFIG.debugMode) {
        console.log(`[GitHub 中文翻译] 词典初始化耗时: ${Date.now() - startTime}ms`);
        console.log(`[GitHub 中文翻译] 词典条目数量: ${Object.keys(this.dictionary).length}`);
        console.log(`[GitHub 中文翻译] 哈希表条目数量: ${this.dictionaryHash.size}`);
      }
    } catch (error) {
      console.error('[GitHub 中文翻译] 词典初始化失败:', error);
      this.dictionary = {};
      this.dictionaryHash.clear();
    }
  },
  getTranslatedText(text) {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return text;
    }
    const normalizedText = text.trim();
    // 检查最小文本长度
    if (normalizedText.length < (CONFIG.performance?.minTextLengthToTranslate || 3)) {
      return null;
    }
    // 检查缓存
    if (CONFIG.performance?.enableTranslationCache) {
      const cachedResult = this.cacheManager.getFromCache(normalizedText);
      if (cachedResult !== null) {
        return cachedResult;
      }
    }
    // 查询哈希表
    let result = this.dictionaryHash.get(normalizedText);
    // 如果没有找到，尝试大小写不敏感查询
    if (result === null && normalizedText.length <= MAX_KEY_LENGTH_FOR_CASE_VARIANTS) {
      const lowerCaseText = normalizedText.toLowerCase();
      const upperCaseText = normalizedText.toUpperCase();
      result = this.dictionaryHash.get(lowerCaseText) || this.dictionaryHash.get(upperCaseText);
    }
    // 清理文本中的潜在危险内容
    if (result !== null) {
      result = this.sanitizeText(result);
    }
    // 缓存结果
    if (
      CONFIG.performance?.enableTranslationCache &&
      normalizedText.length <= (CONFIG.performance?.maxCachedTextLength || 100)
    ) {
      if (result !== null) {
        this.cacheManager.setToCache(normalizedText, result, false);
      }
    }
    return result;
  },
  sanitizeText(text) {
    // 移除 HTML 标签
    let sanitizedText = text.replace(/<[^>]*>/g, '');
    // 移除事件处理器
    sanitizedText = sanitizedText.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    // 移除危险协议
    sanitizedText = sanitizedText.replace(/javascript:/gi, '');
    sanitizedText = sanitizedText.replace(/data:/gi, '');
    sanitizedText = sanitizedText.replace(/vbscript:/gi, '');
    // 移除危险元素
    sanitizedText = sanitizedText.replace(/expression\([^)]*\)/gi, '');
    sanitizedText = sanitizedText.replace(/<\s*script/gi, '');
    sanitizedText = sanitizedText.replace(/<\s*iframe/gi, '');
    sanitizedText = sanitizedText.replace(/<\s*object/gi, '');
    sanitizedText = sanitizedText.replace(/<\s*embed/gi, '');
    sanitizedText = sanitizedText.replace(/<\s*link/gi, '');
    sanitizedText = sanitizedText.replace(/<\s*style/gi, '');
    return sanitizedText;
  },
  updateDictionary(newDictionary) {
    try {
      Object.assign(this.dictionary, newDictionary);
      Object.keys(newDictionary).forEach((key) => {
        const value = newDictionary[key];
        if (value && !value.startsWith('待翻译: ')) {
          this.dictionaryHash.set(key, value);
          if (key.length <= 100) {
            this.dictionaryHash.set(key.toLowerCase(), value);
            this.dictionaryHash.set(key.toUpperCase(), value);
          }
        }
      });
      if (CONFIG.debugMode) {
        console.log(
          `[GitHub 中文翻译] 词典已更新，新增/修改${Object.keys(newDictionary).length}个条目`,
        );
      }
    } catch (error) {
      console.error('[GitHub 中文翻译] 更新词典失败:', error);
    }
  },
};
/**
 * 页面模式检测模块
 * @file translationCore/pageModeDetector.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 检测当前页面的模式
 */
const pageModeDetector = {
  currentPageMode: null,
  pageModeConfig: {
    default: {
      batchSize: CONFIG.performance?.batchSize,
      enablePartialMatch: CONFIG.performance?.enablePartialMatch,
    },
    search: { batchSize: 100, enablePartialMatch: false },
    repository: { batchSize: 50, enablePartialMatch: false },
    issues: { batchSize: 75, enablePartialMatch: true },
    pullRequests: { batchSize: 75, enablePartialMatch: true },
    explore: { batchSize: 100, enablePartialMatch: false },
    notifications: { batchSize: 60, enablePartialMatch: true },
    marketplace: { batchSize: 80, enablePartialMatch: true },
    codespaces: { batchSize: 50, enablePartialMatch: false },
    wiki: { batchSize: 120, enablePartialMatch: true },
    actions: { batchSize: 60, enablePartialMatch: false },
  },
  detectPageMode() {
    try {
      const currentPath = window.location.pathname;
      for (const [mode, pattern] of Object.entries(CONFIG.pagePatterns)) {
        if (pattern && pattern instanceof RegExp && pattern.test(currentPath)) {
          if (mode === 'repository') {
            const isSubPage = [
              'issues',
              'pullRequests',
              'projects',
              'wiki',
              'actions',
              'packages',
              'security',
              'insights',
            ].some((subMode) => CONFIG.pagePatterns[subMode]?.test(currentPath));
            if (!isSubPage) {
              this.currentPageMode = mode;
              return mode;
            }
          } else {
            this.currentPageMode = mode;
            return mode;
          }
        }
      }
      this.currentPageMode = 'default';
      return 'default';
    } catch (error) {
      if (CONFIG.debugMode) {
        console.warn('[GitHub 中文翻译] 检测页面模式失败:', error);
      }
      this.currentPageMode = 'default';
      return 'default';
    }
  },
  getCurrentPageModeConfig() {
    const mode = this.currentPageMode || this.detectPageMode();
    return this.pageModeConfig[mode] || this.pageModeConfig.default;
  },
};
/**
 * 翻译元素选择模块
 * @file translationCore/elementSelector.js
 */
import {
  isSkipTag,
  hasSkipClass,
  hasSkipId,
  isHiddenElement,
  isNumericOrSpecialOnly
} from './selectorUtils.js';
const elementSelector = {
  elementCache: new WeakMap(),
  getElementsToTranslate() {
    const uniqueElements = new Set();
    const allSelectors = [...CONFIG.selectors.primary, ...CONFIG.selectors.popupMenus];
    if (allSelectors.length <= 10) {
      const combinedSelector = allSelectors.join(', ');
      try {
        const allElements = document.querySelectorAll(combinedSelector);
        Array.from(allElements).forEach((element) => {
          if (this.shouldTranslateElement(element)) {
            uniqueElements.add(element);
          }
        });
        if (CONFIG.debugMode && CONFIG.performance?.logTiming) {
          console.log(
            `[GitHub 中文翻译] 合并查询选择器: ${combinedSelector}, 结果数量: ${allElements.length}`,
          );
        }
        return Array.from(uniqueElements);
      } catch (error) {
        if (CONFIG.debugMode) {
          console.warn('[GitHub 中文翻译] 合并选择器查询失败，回退到逐个查询:', error);
        }
      }
    }
    allSelectors.forEach((selector) => {
      try {
        const matchedElements = document.querySelectorAll(selector);
        Array.from(matchedElements).forEach((element) => {
          if (this.shouldTranslateElement(element)) {
            uniqueElements.add(element);
          }
        });
      } catch (error) {
        if (CONFIG.debugMode) {
          console.warn(`[GitHub 中文翻译] 选择器 "${selector}" 解析失败:`, error);
        }
      }
    });
    return Array.from(uniqueElements).filter((element) => element instanceof HTMLElement);
  },
  shouldTranslateElement(element) {
    if (!element || !(element instanceof HTMLElement)) {
      return false;
    }
    if (element.hasAttribute('data-github-zh-translated')) {
      return false;
    }
    if (!element.textContent.trim()) {
      return false;
    }
    if (isSkipTag(element.tagName)) {
      return false;
    }
    if (
      element.hasAttribute('data-no-translate') ||
      (element.hasAttribute('translate') && element.getAttribute('translate') === 'no') ||
      element.hasAttribute('aria-hidden') ||
      element.hasAttribute('hidden')
    ) {
      return false;
    }
    if (hasSkipClass(element.className)) {
      return false;
    }
    if (hasSkipId(element.id)) {
      return false;
    }
    if (isHiddenElement(element)) {
      return false;
    }
    const textContent = element.textContent.trim();
    if (!textContent || isNumericOrSpecialOnly(textContent)) {
      return false;
    }
    return true;
  },
  shouldTranslate(element) {
    return virtualDomManager.shouldTranslate(element);
  },
};
/**
 * 元素翻译模块
 * @file translationCore/elementTranslator.js
 */
const elementTranslator = {
  performanceData: { ...initialPerformanceData },
  translateElement(element) {
    if (!element || !(element instanceof HTMLElement)) {
      return false;
    }
    if (!elementSelector.shouldTranslate(element)) {
      return false;
    }
    if (elementSelector.elementCache.has(element)) {
      return false;
    }
    if (element.hasAttribute('data-github-zh-translated')) {
      elementSelector.elementCache.set(element, true);
      return false;
    }
    this.performanceData.elementsProcessed++;
    if (!elementSelector.shouldTranslateElement(element)) {
      return false;
    }
    const fragment = document.createDocumentFragment();
    let hasTranslation = false;
    let hasTranslatableContent = false;
    const childNodes = Array.from(element.childNodes);
    const textNodesToProcess = [];
    for (const node of childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const trimmedText = node.nodeValue.trim();
        if (trimmedText && trimmedText.length >= CONFIG.performance?.minTextLengthToTranslate) {
          const translatedText = dictionaryManager.getTranslatedText(trimmedText);
          if (translatedText && translatedText !== trimmedText) {
            textNodesToProcess.push({ node, originalText: node.nodeValue });
            hasTranslatableContent = true;
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        try {
          element.removeChild(node);
          fragment.appendChild(node);
          const childTranslated = this.translateElement(node);
          hasTranslatableContent ||= childTranslated;
        } catch (e) {
          if (CONFIG.debugMode) {
            console.error('[GitHub 中文翻译] 处理子元素失败:', e, '元素:', node);
          }
          try {
            if (!node.parentNode) {
              element.appendChild(node);
            }
          } catch (addBackError) {
            if (CONFIG.debugMode) {
              console.error('[GitHub 中文翻译] 将子元素添加回原始位置失败:', addBackError);
            }
          }
        }
      }
    }
    if (!hasTranslatableContent) {
      return false;
    }
    textNodesToProcess.forEach(({ node, originalText }) => {
      const parentNode = node.parentNode;
      if (parentNode) {
        parentNode.removeChild(node);
      }
      const translatedText = dictionaryManager.getTranslatedText(originalText.trim());
      if (
        translatedText &&
        typeof translatedText === 'string' &&
        translatedText !== originalText.trim()
      ) {
        try {
          const safeTranslatedText =
            typeof translatedText === 'string'
              ? [...translatedText]
                  .filter((c) => c.charCodeAt(0) > 31 && c.charCodeAt(0) !== 127)
                  .join('')
              : String(translatedText || '');
          const translatedNode = document.createTextNode(safeTranslatedText);
          fragment.appendChild(translatedNode);
          hasTranslation = true;
          this.performanceData.textsTranslated++;
        } catch (e) {
          if (CONFIG.debugMode) {
            console.error('[GitHub 中文翻译] 创建翻译节点失败:', e, '翻译文本:', translatedText);
          }
          fragment.appendChild(node);
        }
      } else {
        fragment.appendChild(node);
      }
    });
    try {
      if (fragment && fragment.hasChildNodes()) {
        if (element.firstChild) {
          element.insertBefore(fragment, element.firstChild);
        } else {
          element.appendChild(fragment);
        }
      }
    } catch (appendError) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 添加文档片段失败:', appendError, '元素:', element);
      }
    }
    if (hasTranslation) {
      virtualDomManager.markElementAsTranslated(element);
    }
    elementSelector.elementCache.set(element, true);
    return hasTranslation;
  },
  async translateCriticalElementsOnly() {
    return translateCriticalElementsOnly((el) => this.translateElement(el));
  },
};
/**
 * 部分匹配翻译模块
 * @file translationCore/partialTranslator.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 使用Trie树进行部分匹配翻译
 */
const partialTranslator = {
  performPartialTranslation(text, enablePartialMatch = false) {
    if (!enablePartialMatch) {
      return null;
    }
    const textLen = text.length;
    if (textLen < 5) {
      return null;
    }
    const matches = [];
    const minKeyLength = Math.min(4, Math.floor(textLen / 2));
    const potentialMatches = dictionaryManager.dictionaryTrie.findAllMatches(text, minKeyLength);
    for (const match of potentialMatches) {
      const key = match.key;
      if (
        !Object.prototype.hasOwnProperty.call(dictionaryManager.dictionary, key) ||
        dictionaryManager.dictionary[key].startsWith('待翻译: ')
      ) {
        continue;
      }
      const value = dictionaryManager.dictionary[key];
      if (/^[0-9.,\s()[\]{}/*^$#@!~`|:;"'?>+-]+$/i.test(key)) {
        continue;
      }
      const wordRegexKey = `word_${key}`;
      let wordRegex;
      if (dictionaryManager.regexCache.has(wordRegexKey)) {
        wordRegex = dictionaryManager.regexCache.get(wordRegexKey);
      } else {
        wordRegex = utils.safeRegExp('\\b' + utils.escapeRegExp(key) + '\\b', 'gi');
        if (wordRegex) {
          dictionaryManager.regexCache.set(wordRegexKey, wordRegex);
        } else {
          continue;
        }
      }
      const wordMatches = text.match(wordRegex);
      if (wordMatches && wordMatches.length > 0) {
        matches.push({
          key,
          value,
          length: key.length,
          matches: wordMatches.length,
          regex: wordRegex,
        });
      } else {
        const nonWordRegexKey = `nonword_${key}`;
        let nonWordRegex;
        if (dictionaryManager.regexCache.has(nonWordRegexKey)) {
          nonWordRegex = dictionaryManager.regexCache.get(nonWordRegexKey);
        } else {
          nonWordRegex = utils.safeRegExp(utils.escapeRegExp(key), 'g');
          if (nonWordRegex) {
            dictionaryManager.regexCache.set(nonWordRegexKey, nonWordRegex);
          } else {
            continue;
          }
        }
        matches.push({
          key,
          value,
          length: key.length,
          matches: 1,
          regex: nonWordRegex,
        });
      }
    }
    if (matches.length === 0) {
      return null;
    }
    matches.sort((a, b) => {
      if (b.length !== a.length) {
        return b.length - a.length;
      }
      return b.matches - a.matches;
    });
    let result = text;
    let hasReplaced = false;
    const maxReplacements = Math.min(5, matches.length);
    for (let i = 0; i < maxReplacements; i++) {
      const match = matches[i];
      const newResult = result.replace(match.regex, match.value);
      if (newResult !== result) {
        result = newResult;
        hasReplaced = true;
      }
    }
    return hasReplaced ? result : null;
  },
};
/**
 * 性能监控模块
 * @file translationCore/performanceMonitor.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 监控翻译性能数据
 */
const performanceMonitor = {
  get performanceData() {
    return elementTranslator.performanceData;
  },
  resetPerformanceData() {
    elementTranslator.performanceData = {
      translateStartTime: 0,
      translateEndTime: 0,
      elementsProcessed: 0,
      textsTranslated: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheEvictions: 0,
      cacheCleanups: 0,
      domOperations: 0,
      domOperationTime: 0,
      networkRequests: 0,
      networkRequestTime: 0,
      dictionaryLookups: 0,
      partialMatches: 0,
      batchProcessings: 0,
      errorCount: 0,
      totalMemory: 0,
    };
  },
  logPerformanceData() {
    if (CONFIG.debugMode && CONFIG.performance?.logTiming) {
      const duration = Date.now() - elementTranslator.performanceData.translateStartTime;
      console.log(`[GitHub 中文翻译] 性能数据 - 总耗时: ${duration}ms`);
      console.log(`  元素处理: ${elementTranslator.performanceData.elementsProcessed}`);
      console.log(`  文本翻译: ${elementTranslator.performanceData.textsTranslated}`);
      console.log(`  缓存命中: ${elementTranslator.performanceData.cacheHits}`);
      console.log(`  缓存未命中: ${elementTranslator.performanceData.cacheMisses}`);
    }
  },
  recordPerformanceEvent(eventType, data = {}) {
    switch (eventType) {
      case 'dom-operation':
        elementTranslator.performanceData.domOperations++;
        elementTranslator.performanceData.domOperationTime += data.duration || 0;
        break;
      case 'network-request':
        elementTranslator.performanceData.networkRequests++;
        elementTranslator.performanceData.networkRequestTime += data.duration || 0;
        break;
      case 'dictionary-lookup':
        elementTranslator.performanceData.dictionaryLookups++;
        break;
      case 'partial-match':
        elementTranslator.performanceData.partialMatches++;
        break;
      case 'batch-processing':
        elementTranslator.performanceData.batchProcessings++;
        break;
      case 'error':
        elementTranslator.performanceData.errorCount++;
        break;
      default:
        // 未知事件类型
        break;
    }
  },
  getPerformanceStats() {
    const stats = { ...elementTranslator.performanceData };
    if (stats.translateStartTime > 0) {
      stats.totalDuration =
        stats.translateEndTime > 0
          ? stats.translateEndTime - stats.translateStartTime
          : Date.now() - stats.translateStartTime;
    } else {
      stats.totalDuration = 0;
    }
    const totalCacheRequests = stats.cacheHits + stats.cacheMisses;
    stats.cacheHitRate =
      totalCacheRequests > 0
        ? ((stats.cacheHits / totalCacheRequests) * 100).toFixed(2) + '%'
        : '0%';
    stats.avgDomOperationTime =
      stats.domOperations > 0
        ? (stats.domOperationTime / stats.domOperations).toFixed(2) + 'ms'
        : '0ms';
    return stats;
  },
  exportPerformanceData() {
    const data = {
      timestamp: new Date().toISOString(),
      stats: this.getPerformanceStats(),
      userAgent: navigator.userAgent,
      browserLanguage: navigator.language,
    };
    return JSON.stringify(data, null, 2);
  },
};
/**
 * 翻译核心主模块
 * @file translationCore/index.js
 */
const translationCore = {
  isPageUnloading: false,
  cacheCleanupTimer: null,
  unloadHandler: null,
  init() {
    try {
      dictionaryManager.init();
      this.unloadHandler = setupPageUnloadHandler(this);
      this.cacheCleanupTimer = startCacheCleanupTimer(this);
      this.warmUpCache();
      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 翻译核心初始化完成');
      }
    } catch (error) {
      ErrorHandler.handleError('翻译核心初始化', error, ErrorHandler.ERROR_TYPES.INITIALIZATION);
    }
  },
  cleanup() {
    try {
      if (this.cacheCleanupTimer) {
        clearInterval(this.cacheCleanupTimer);
        this.cacheCleanupTimer = null;
      }
      if (this.unloadHandler) {
        window.removeEventListener('beforeunload', this.unloadHandler);
        window.removeEventListener('unload', this.unloadHandler);
        window.removeEventListener('pagehide', this.unloadHandler);
        this.unloadHandler = null;
      }
      this.clearCache();
      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 翻译核心资源清理完成');
      }
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 翻译核心资源清理失败:', error);
      }
    }
  },
  detectPageMode() {
    return pageModeDetector.detectPageMode();
  },
  getCurrentPageModeConfig() {
    return pageModeDetector.getCurrentPageModeConfig();
  },
  async translate(targetElements = null) {
    return translate(targetElements, this);
  },
  translateCriticalElementsOnly() {
    return translateCriticalElementsOnly();
  },
  cleanCache() {
    cacheController.cleanCache(elementTranslator.performanceData);
  },
  clearCache() {
    cacheController.clearCache();
  },
  warmUpCache() {
    cacheController.warmUpCache(this.isPageUnloading);
  },
  updateDictionary(newDictionary) {
    dictionaryManager.updateDictionary(newDictionary);
  },
  // 暴露性能监控方法
  resetPerformanceData: () => performanceMonitor.resetPerformanceData(),
  logPerformanceData: () => performanceMonitor.logPerformanceData(),
  recordPerformanceEvent: (eventType, data) =>
    performanceMonitor.recordPerformanceEvent(eventType, data),
  getPerformanceStats: () => performanceMonitor.getPerformanceStats(),
  exportPerformanceData: () => performanceMonitor.exportPerformanceData(),
};
/**
 * GitHub 中文翻译配置界面模块
 * @file configUI.js
 */
import {
  updatePerformanceStats,
  exportPerformanceStats,
} from './components/performanceMonitor.js';
class ConfigUI {
  constructor() {
    this.config = CONFIG;
    this.userConfig = {};
    this.isOpen = false;
    this.container = null;
    this.settings = configStore.loadUserSettings();
    this.isPageUnloading = false;
    this.eventListeners = [];
    this.setupPageUnloadHandler();
  }
  setupPageUnloadHandler() {
    const handlePageUnload = () => {
      this.isPageUnloading = true;
      this.cleanup();
    };
    window.addEventListener('beforeunload', handlePageUnload, { once: true });
    window.addEventListener('unload', handlePageUnload, { once: true });
  }
  cleanup() {
    this.hide();
    this.cleanupEventListeners();
    this.container = null;
  }
  saveUserSettings(settings) {
    configStore.saveUserSettings(settings);
    this.userConfig = { ...settings };
    this.mergeUserConfig();
  }
  mergeUserConfig() {
    configStore.mergeUserConfig(CONFIG, this.userConfig);
  }
  createUI() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.className = 'github-i18n-config-container';
    const configPanel = document.createElement('div');
    configPanel.className = 'github-i18n-config-panel';
    const header = configRenderer.createHeader();
    const content = configRenderer.createContent(this.config);
    const footer = configRenderer.createFooter();
    configPanel.appendChild(header);
    configPanel.appendChild(content);
    configPanel.appendChild(footer);
    this.container.appendChild(configPanel);
    addConfigUIStyles();
    this.addEventListeners();
  }
  show() {
    if (!this.container) {
      this.createUI();
    }
    document.body.appendChild(this.container);
    this.isOpen = true;
    setTimeout(() => {
      updatePerformanceStats();
    }, 100);
  }
  hide() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.isOpen = false;
  }
  toggle() {
    if (this.isOpen) {
      this.hide();
    } else {
      this.show();
    }
  }
  addEventListeners() {
    if (!this.container) return;
    const closeBtn = this.container.querySelector('.github-i18n-config-close');
    const saveBtn = this.container.querySelector('.github-i18n-config-save');
    const resetBtn = this.container.querySelector('.github-i18n-config-reset');
    const cancelBtn = this.container.querySelector('.github-i18n-config-cancel');
    const refreshBtn = this.container.querySelector('#github-i18n-refresh-stats');
    const exportBtn = this.container.querySelector('#github-i18n-export-stats');
    const handleClose = () => this.hide();
    const handleSave = () => this.handleSave();
    const handleReset = () => this.handleReset();
    const handleRefresh = () => updatePerformanceStats();
    const handleExport = () => exportPerformanceStats();
    const handleContainerClick = (e) => {
      if (e.target === this.container) {
        this.hide();
      }
    };
    closeBtn?.addEventListener('click', handleClose);
    saveBtn?.addEventListener('click', handleSave);
    resetBtn?.addEventListener('click', handleReset);
    cancelBtn?.addEventListener('click', handleClose);
    refreshBtn?.addEventListener('click', handleRefresh);
    exportBtn?.addEventListener('click', handleExport);
    this.container?.addEventListener('click', handleContainerClick);
    this.eventListeners.push(
      { element: closeBtn, event: 'click', handler: handleClose },
      { element: saveBtn, event: 'click', handler: handleSave },
      { element: resetBtn, event: 'click', handler: handleReset },
      { element: cancelBtn, event: 'click', handler: handleClose },
      { element: refreshBtn, event: 'click', handler: handleRefresh },
      { element: exportBtn, event: 'click', handler: handleExport },
      { element: this.container, event: 'click', handler: handleContainerClick },
    );
  }
  cleanupEventListeners() {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element?.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }
  handleSave() {
    const newSettings = {
      debugMode: document.getElementById('github-i18n-debug-mode')?.checked || false,
      enablePartialMatch:
        document.getElementById('github-i18n-enable-partial-match')?.checked || false,
      autoUpdate: document.getElementById('github-i18n-auto-update')?.checked || false,
      enableTranslationCache:
        document.getElementById('github-i18n-translation-cache')?.checked || false,
      enableVirtualDom: document.getElementById('github-i18n-virtual-dom')?.checked || false,
    };
    this.saveUserSettings(newSettings);
    this.hide();
  }
  handleReset() {
    configStore.resetUserSettings();
    this.userConfig = {};
    this.settings = {};
    this.hide();
  }
}
/**
 * 版本工具模块
 * @file versionUtils.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 版本比较、提取等工具函数
 */
const PARSE_INT_RADIX = 10;
const HASH_DISPLAY_LENGTH = 16;
/**
 * 从脚本内容中提取版本号
 * 支持多种版本号格式
 * @param {string} content - 脚本内容
 * @returns {string|null} 提取的版本号或null
 */
function extractVersion(content) {
  const patterns = [
    /\/\*\s*@version\s+(\d+\.\d+\.\d+)\s*\*\//i,
    /\/\/\s*@version\s+(\d+\.\d+\.\d+)/i,
    /\/\/\s*version\s*:\s*(\d+\.\d+\.\d+)/i,
    /version\s*=\s*['"](\d+\.\d+\.\d+)['"]/i,
    /version:\s*['"](\d+\.\d+\.\d+)['"]/i,
  ];
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}
/**
 * 比较版本号，判断是否有新版本
 * @param {string} newVersion - 新版本号
 * @param {string} currentVersion - 当前版本号
 * @returns {boolean} 是否有新版本
 */
function isNewerVersion(newVersion, currentVersion) {
  const newParts = newVersion.split('.').map(Number);
  const currentParts = currentVersion.split('.').map(Number);
  for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
    const newPart = newParts[i] || 0;
    const currentPart = currentParts[i] || 0;
    if (newPart > currentPart) {
      return true;
    } else if (newPart < currentPart) {
      return false;
    }
  }
  return false;
}
/**
 * 更新通知模块
 * @file updateNotification.js
 */
const NOTIFICATION_AUTO_HIDE_MS = 20000;
const NOTIFICATION_ANIMATION_MS = 300;
/**
 * 显示更新通知
 * @param {string} newVersion - 新版本号
 */
function showUpdateNotification(newVersion) {
  const lastNotifiedVersion = updateStore.getLastNotifiedVersion();
  if (updateStore.isDismissed() || lastNotifiedVersion === newVersion) {
    if (CONFIG.debugMode && lastNotifiedVersion === newVersion) {
      console.log(`[GitHub 中文翻译] 已经通知过版本 ${newVersion} 的更新`);
    }
    return;
  }
  try {
    const notification = updateRenderer.createNotification(newVersion, hideNotification);
    if (document.body) {
      document.body.appendChild(notification);
      updateStore.setLastNotifiedVersion(newVersion);
      if (CONFIG.updateCheck.autoHideNotification !== false) {
        setTimeout(() => {
          hideNotification(notification, false);
        }, NOTIFICATION_AUTO_HIDE_MS);
      }
      if (CONFIG.debugMode) {
        console.log(`[GitHub 中文翻译] 显示更新通知: 版本 ${newVersion}`);
      }
    }
  } catch (error) {
    console.error('[GitHub 中文翻译] 创建更新通知失败:', error);
  }
}
/**
 * 隐藏通知元素（带动画效果）
 * @param {HTMLElement} notification - 通知元素
 * @param {boolean} permanently - 是否永久隐藏
 */
function hideNotification(notification, permanently = false) {
  try {
    notification.style.transform = 'translateY(20px)';
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, NOTIFICATION_ANIMATION_MS);
    if (permanently) {
      updateStore.setDismissed();
      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 更新通知已永久隐藏');
      }
    }
  } catch (error) {
    console.error('[GitHub 中文翻译] 隐藏通知失败:', error);
  }
}
/**
 * 记录版本历史
 * @param {string} version - 版本号
 */
function recordVersionHistory(version) {
  updateStore.recordVersionHistory(version);
}
/**
 * 清除更新通知的忽略状态
 * @returns {boolean} 是否成功
 */
function clearNotificationDismissal() {
  return updateStore.clearNotificationDismissal();
}
/**
 * 版本更新检查模块
 * @file versionChecker.js
 */
import {
  showUpdateNotification,
  recordVersionHistory,
  clearNotificationDismissal,
} from './updateNotification.js';
const DEFAULT_INTERVAL_HOURS = 24;
const HOURS_TO_MS = 60 * 60 * 1000;
const PARSE_INT_RADIX = 10;
const versionChecker = {
  async checkForUpdates() {
    if (!CONFIG.updateCheck.enabled) {
      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 已禁用更新检查');
      }
      return false;
    }
    const lastCheck = localStorage.getItem('githubZhLastUpdateCheck');
    const now = Date.now();
    const intervalMs = (CONFIG.updateCheck.intervalHours || DEFAULT_INTERVAL_HOURS) * HOURS_TO_MS;
    if (lastCheck && now - parseInt(lastCheck, PARSE_INT_RADIX) < intervalMs) {
      if (CONFIG.debugMode) {
        console.log(
          `[GitHub 中文翻译] 未达到更新检查间隔，跳过检查 (上次检查: ${new Date(parseInt(lastCheck, PARSE_INT_RADIX)).toLocaleString()})`,
        );
      }
      return false;
    }
    try {
      localStorage.setItem('githubZhLastUpdateCheck', now.toString());
      const scriptContent = await versionFetcher.fetchWithRetry(CONFIG.updateCheck.scriptUrl);
      const remoteVersion = extractVersion(scriptContent);
      if (!remoteVersion) {
        throw new Error('无法从远程脚本提取有效的版本号');
      }
      if (CONFIG.debugMode) {
        console.log(`[GitHub 中文翻译] 当前版本: ${CONFIG.version}, 远程版本: ${remoteVersion}`);
      }
      if (isNewerVersion(remoteVersion, CONFIG.version)) {
        showUpdateNotification(remoteVersion);
        if (CONFIG.updateCheck.autoUpdateVersion) {
          this.updateVersionInStorage(remoteVersion);
        }
        recordVersionHistory(remoteVersion);
        return true;
      }
      return false;
    } catch (error) {
      const sanitizedError = utils.sanitizeErrorMessage(error);
      const errorMsg = `[GitHub 中文翻译] 检查更新时发生错误: ${sanitizedError}`;
      if (CONFIG.debugMode) {
        console.error(errorMsg);
      }
      try {
        localStorage.setItem(
          'githubZhUpdateError',
          JSON.stringify({
            message: sanitizedError,
            timestamp: now,
          }),
        );
      } catch (_e) {
        // 忽略存储错误
      }
      return false;
    }
  },
  updateVersionInStorage(newVersion) {
    try {
      const cacheData = {
        version: newVersion,
        cachedAt: Date.now(),
        currentVersion: CONFIG.version,
      };
      localStorage.setItem('githubZhCachedVersion', utils.safeJSONStringify(cacheData));
      if (CONFIG.debugMode) {
        console.log(
          `[GitHub 中文翻译] 已缓存新版本号: ${newVersion} (缓存时间: ${new Date().toLocaleString()})`,
        );
      }
      return true;
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 更新缓存版本号时出错:', error);
      }
      return false;
    }
  },
  getCachedVersion() {
    try {
      const cachedData = utils.safeJSONParse(localStorage.getItem('githubZhCachedVersion'));
      return cachedData;
    } catch (_error) {
      return null;
    }
  },
  clearNotificationDismissal,
};
/**
 * GitHub 中文翻译主入口文件
 * @file main.js
 */
// 初始化函数
const init = () => lifecycleManager.init();
const cleanup = () => lifecycleManager.cleanup();
const startScript = () => lifecycleManager.startScript();
// 导出函数
// 调试模式暴露
if (typeof window !== 'undefined' && CONFIG.debugMode) {
  window.translationCore = translationCore;
  window.configUI = configUI;
}
// 启动脚本
startScript();})();
