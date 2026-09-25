// ==UserScript==
// @name         GitHub Chinese 简体中文
// @namespace    https://github.com/Tanox/GitHub_i18n
// @version      1.11.2
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
// @updateURL    https://raw.githubusercontent.com/Tanox/GitHub_i18n/main/build/GitHub_zh-cn.user.js
// @downloadURL  https://raw.githubusercontent.com/Tanox/GitHub_i18n/main/build/GitHub_zh-cn.user.js
// @license      GPL-2.0
// @homepage     https://github.com/Tanox/GitHub_i18n
// ==/UserScript==

(function() {
'use strict';
/**
 * 版本信息模块
 * @file version.js
 * @version 1.11.2
 * @date 2026-09-25
 * @author Sut
 * @description 统一管理 GitHub Chinese 简体中文的版本信息
 */

/**
 * 当前工具版本号
 * @type {string}
 * @description 这是项目的单一版本源，所有其他版本号引用都应从此处获取
 */
const VERSION = '1.11.2';

/**
 * GitHub 元素选择器列表配置
 * @file src/config/elements.js
 */

const importantElements = [
  '.HeaderNavlink',
  '.js-selected-navigation-item',
  '.js-issue-title',
  '.js-commit-message',
  '.js-details-container',
  '.js-comment-body',
  '.js-activity-item',
  '.js-blob-content',
  '.js-repo-description',
  '.js-issue-row',
  '.js-pinned-issue-list-item',
  '.js-project-card-content',
  '.js-user-profile-bio',
  '.js-header-search-input',
  '.js-file-line',
  '.Header-link',
  '.TabNav-link',
  '.UnderlineNav-link',
  '.Label',
  '.btn-primary',
  '.btn-secondary',
  '.TimelineItem-body',
  '.Box-title',
  '.Subhead-heading',
  '.f4',
  '.f5',
  '.text-bold',
  '.text-semibold',
  '.avatar-user',
  '.contributor-avatar',
  '.commit-author',
  '.issue-author',
];

const ignoreElements = [
  'script',
  'style',
  'link',
  'meta',
  'svg',
  'canvas',
  'pre',
  'code',
  'kbd',
  'samp',
  '.blob-code-inner',
  '.file-line',
  '.highlight',
  '.language-*',
  '.mermaid',
  '.mathjax',
  '.js-zeroclipboard-button',
  '.js-minimizable-content',
  '.reponav-dropdown',
  '.dropdown-caret',
  '.avatar',
  '.emoji',
  '.blob-code',
  '.blob-code-marker',
  '.blob-num',
  '.blob-num-hunk',
  '.diff-line',
  '.diff-addition',
  '.diff-deletion',
  '.diff-header',
  '.line-comment',
  '.inline-comment',
  '.commit-diff-title',
  '.copyable-area',
  '.copy-button',
  '.token',
  '.syntax--',
  '.octicon',
  '.github-icon',
  '.icon',
  '.spinner',
  '.timestamp',
  '.time-ago',
  '.relative-time',
  '.local-time',
  '.sha',
  '.shortsha',
  '.commit-sha',
  '.blob-sha',
  '.username',
  '.login',
  '.user-mention',
  '.team-mention',
  '.repo-name',
  '.repo-name',
  '.branch-name',
  '.tag-name',
  '.file-name',
  '.file-path',
  '.directory',
  '.folder',
  '.language-color',
  '.repo-language-color',
  '.color-block',
  '.progress-bar',
  '.meter',
  '.counter',
  '.number',
  '.size',
  '.bytes',
  '.count',
  '.stat',
  '.statistic',
  '.code-search-result-match',
  '.search-match',
  '.highlighted-text',
  '.notification-indicator',
  '.notification-badge',
  '.notification-count',
  '.unread-indicator',
  '.new-indicator',
  '.badge',
  '.label',
];

/**
 * 性能相关配置
 * @file src/config/performance.js
 */

const performanceConfig = {
  enableDeepObserver: true,
  enablePartialMatch: true,
  maxDictSize: 2000,
  enableTranslationCache: true,
  batchSize: 50,
  batchDelay: 0,
  logTiming: false,
  cacheExpiration: 3600000, // 缓存过期时间（毫秒）
  minTextLengthToTranslate: 3, // 最小翻译文本长度
  minTranslateInterval: 500, // 最小翻译间隔（毫秒）
  observeAttributes: true, // 是否观察属性变化
  observeSubtree: true, // 是否观察子树变化
  importantAttributes: [
    'title',
    'alt',
    'aria-label',
    'placeholder',
    'data-hovercard-url',
    'data-hovercard-type',
  ], // 重要的属性列表
  importantElements,
  ignoreElements,
  mutationThreshold: 30, // 单次突变数量阈值
  contentChangeWeight: 1, // 内容变化权重
  importantChangeWeight: 2, // 重要变化权重
  translationTriggerRatio: 0.3, // 触发翻译的变化比例
  enableVirtualDom: true, // 是否启用虚拟DOM优化
  virtualDomCleanupInterval: 60000, // 虚拟DOM清理间隔（毫秒）
  virtualDomNodeTimeout: 3600000, // 虚拟DOM节点超时时间（毫秒）
  useSmartThrottling: true, // 启用智能节流
  ignoreCharacterDataMutations: false, // 是否忽略字符数据变化（用于性能优化）
  ignoreAttributeMutations: false, // 是否忽略属性变化（用于性能优化）
  minContentChangesToTrigger: 3, // 触发翻译的最小内容变化数
  maxMutationProcessing: 50, // 单次处理的最大突变数
  enableFullTranslation: true, // 是否启用完整翻译模式
  networkRequestInterval: 1000, // 网络请求间隔（毫秒）
  maxTranslationErrorCount: 10, // 最大翻译错误数
  maxDomErrorCount: 20, // 最大DOM操作错误数
  maxDictionaryErrorCount: 5, // 最大词典错误数
  maxNetworkErrorCount: 3, // 最大网络错误数
  maxPerformanceErrorCount: 15, // 最大性能错误数
  maxOtherErrorCount: 25, // 最大其他错误数
};

/**
 * 选择器与页面匹配模式配置
 * @file src/config/selectors.js
 */

const selectorsConfig = {
  primary: [
    'h1, h2, h3, h4, h5, h6',
    'p, span, a, button',
    'label, strong, em',
    'li, td, th',
    '.btn, .button',
    '.link, .text',
    '.nav-item, .menu-item',
  ],
  popupMenus: ['.dropdown-menu', '.menu-dropdown', '.context-menu', '.notification-popover'],
};

const pagePatternsConfig = {
  search: /\/search/,
  repository: /\/[\w-]+\/[\w-]+/,
  issues: /\/[\w-]+\/[\w-]+\/issues/,
  pullRequests: /\/[\w-]+\/[\w-]+\/pull/,
  settings: /\/settings/,
  dashboard: /^\/$/,
  explore: /\/explore/,
  codespaces: /\/codespaces/,
  notifications: /\/notifications/,
  profile: /\/[\w-]+$/,
  organizations: /\/organizations/,
  projects: /\/[\w-]+\/[\w-]+\/projects/,
  wiki: /\/[\w-]+\/[\w-]+\/wiki/,
  actions: /\/[\w-]+\/[\w-]+\/actions/,
  packages: /\/[\w-]+\/[\w-]+\/packages/,
  security: /\/[\w-]+\/[\w-]+\/security/,
  insights: /\/[\w-]+\/[\w-]+\/insights/,
  marketplace: /\/marketplace/,
  topics: /\/topics/,
  stars: /\/stars/,
  trending: /\/trending/,
};

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
    scriptUrl: 'https://github.com/Tanox/GitHub_i18n/raw/main/build/GitHub_zh-cn.user.js',
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
 * JSON处理工具
 * @file src/utils/string/json.js
 */

function safeJSONParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('[GitHub 中文翻译] JSON解析失败:', error);
    return defaultValue;
  }
}

function safeJSONStringify(obj, defaultValue = '{}') {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn('[GitHub 中文翻译] JSON序列化失败:', error);
    return defaultValue;
  }
}

/**
 * 正则表达式工具
 * @file src/utils/string/regex.js
 */

const MAX_REGEX_LENGTH = 100;
const MAX_REPETITION_COUNT = 5;

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
}

function isSafeRegex(pattern) {
  let patternObj = pattern;
  if (typeof patternObj === 'string') {
    patternObj = new RegExp(patternObj);
  }

  const source = patternObj.source;
  let depth = 0;
  let hasNestedRepetition = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];

    if (char === '(' && source[i - 1] !== '\\') {
      depth++;
    } else if (char === ')' && source[i - 1] !== '\\') {
      depth--;
    } else if (depth > 0 && /[*+?]/.test(char) && source[i - 1] !== '\\') {
      hasNestedRepetition = true;
      break;
    }
  }

  const longPatternWarning = source.length > MAX_REGEX_LENGTH;
  const hasMultipleRepetitions = (source.match(/[*+?]/g) || []).length > MAX_REPETITION_COUNT;

  return !hasNestedRepetition && !longPatternWarning && !hasMultipleRepetitions;
}

function safeRegExp(pattern, flags = '') {
  try {
    const regex = new RegExp(pattern, flags);
    if (isSafeRegex(regex)) {
      return regex;
    }
    console.warn('[GitHub 中文翻译] 检测到可能存在ReDoS风险的正则表达式:', pattern);
    return null;
  } catch (error) {
    console.warn('[GitHub 中文翻译] 创建正则表达式失败:', error);
    return null;
  }
}

/**
 * 对象处理工具
 * @file src/utils/string/object.js
 */

function getNestedProperty(obj, path, defaultValue = null) {
  try {
    const pathArray = Array.isArray(path) ? path : path.split('.');
    let result = obj;

    for (const key of pathArray) {
      if (result === null || result === undefined) {
        return defaultValue;
      }
      result = result[key];
    }

    return result === undefined ? defaultValue : result;
  } catch (_error) {
    return defaultValue;
  }
}

function deepClone(obj) {
  try {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map((item) => deepClone(item));
    if (obj instanceof Object) {
      const clonedObj = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          clonedObj[key] = deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  } catch (error) {
    console.warn('[GitHub 中文翻译] 深拷贝失败:', error);
    return obj;
  }
  return null;
}

/**
 * 安全脱敏工具
 * @file src/utils/string/security.js
 */

function sanitizeErrorMessage(error) {
  try {
    let message = typeof error === 'string' ? error : error.message || String(error);

    message = message.replace(/\/[a-zA-Z0-9_/.-]+:[0-9]+:[0-9]+/g, '[位置]');
    message = message.replace(/\/workspace\//g, '');
    message = message.replace(/at\s+[a-zA-Z0-9_.]+\s+[<(]/g, 'at [函数]');

    message = message.replace(
      /(password|token|secret|key)\s*[=:]\s*['"][^'"]*['"]/gi,
      '$1=[已隐藏]',
    );
    message = message.replace(/['"][a-zA-Z0-9+/=]{20,}['"]/g, '[已隐藏]');

    if (message.length > 200) {
      message = message.substring(0, 200) + '...';
    }

    return message;
  } catch (_error) {
    return '[未知错误]';
  }
}

/**
 * 字符串工具模块
 * @file stringUtils.js
 */

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
const BYTE_RANGE = 256;

/**
 * 将字符串转为 UTF-8 字节串（替代已废弃的 unescape + encodeURIComponent 组合）
 * @param {string} data - 原始字符串
 * @returns {string} 每字符对应一个字节的字符串
 */
function toBinaryString(data) {
  return Array.from(new TextEncoder().encode(data), (byte) => String.fromCharCode(byte)).join('');
}

/**
 * 将 UTF-8 字节串还原为字符串（替代已废弃的 escape + decodeURIComponent 组合）
 * @param {string} binary - 每字符对应一个字节的字符串
 * @returns {string} 原始字符串
 */
function fromBinaryString(binary) {
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0) % BYTE_RANGE);
  return new TextDecoder().decode(bytes);
}

/**
 * 对数据进行Base64编码（用于轻量级数据混淆，非加密）
 * @param {string} data - 要编码的数据
 * @returns {string} Base64编码后的字符串
 */
function base64Encode(data) {
  try {
    return btoa(toBinaryString(data));
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
    return fromBinaryString(atob(encodedData));
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
 * 错误处理常量与类型定义
 * @file src/core/errorHandler/constants.js
 */

const RECOVERY_BASE_DELAY_MS = 100;
const RECOVERY_MAX_DELAY_MS = 2000;
const DEFAULT_THRESHOLD = 20;
const BATCH_DELAY_MIN_MS = 50;
const NETWORK_INTERVAL_MIN_MS = 1000;
const NETWORK_INTERVAL_MAX_MS = 5000;
const BATCH_DELAY_FALLBACK_MS = 100;

const ERROR_TYPES = {
  TRANSLATION: 'translation',
  DOM_OPERATION: 'dom_operation',
  DICTIONARY: 'dictionary',
  NETWORK: 'network',
  PERFORMANCE: 'performance',
  OTHER: 'other',
};

/**
 * 错误恢复逻辑模块
 * @file src/core/errorHandler/recovery.js
 */

const recoveryManager = {
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

/**
 * 错误处理模块
 * @file errorHandler.js
 */

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
 * 导航与菜单翻译
 * @file src/dictionaries/common/nav.js
 */

const navDictionary = {
  // ===== 导航和菜单 =====
  'Navigation Menu': '导航菜单',
  'Toggle navigation': '切换导航',
  'Skip to content': '跳转到内容',

  // ===== 用户操作 =====
  'Sign in': '登录',
  'Sign up': '注册',
  'Sign out': '登出',
  'Sign in with a passkey': '使用通行密钥登录',
  'Set status': '设置状态',
  'Clear status': '清除状态',
  'Set status message': '设置状态消息',
  'Set status emoji': '设置状态表情',
  'Set status until': '设置状态至',
  Available: '有空',
  Busy: '忙碌',
  'Do not disturb': '请勿打扰',
  'In a meeting': '会议中',
  Commuting: '通勤中',
  Sick: '生病',
  Vacationing: '休假中',
  'Working remotely': '远程工作中',
  Focusing: '专注中',
  Presenting: '演示中',
  'Custom status': '自定义状态',
  "What's on your mind?": '你在想什么？',
  Never: '从不',
  Today: '今天',
  'This week': '本周',
  'Custom date': '自定义日期',

  // ===== 用户下拉菜单 =====
  'Your profile': '您的个人资料',
  'Your repositories': '您的仓库',
  'Your projects': '您的项目',
  'Your stars': '您的星标',
  'Your gists': '您的代码片段',
  'Feature preview': '功能预览',
  Help: '帮助',
  Settings: '设置',

  // ===== 新建菜单 =====
  New: '新建',
  'New repository': '新建仓库',
  'Import repository': '导入仓库',
  'New organization': '新建组织',
  'New project': '新建项目',
  'New gist': '新建代码片段',

  // ===== 顶部导航 =====
  'Pull requests': '拉取请求',
  Issues: '问题',
  Codespaces: '代码空间',
  Explore: '探索',
  Marketplace: '应用市场',

  // ===== 搜索 =====
  'Search or jump to...': '搜索或跳转到...',
  Search: '搜索',
  Clear: '清除',
  'Search syntax tips': '搜索语法提示',
  'Provide feedback': '提供反馈',
  'We read every piece of feedback, and take your input very seriously.':
    '我们会阅读每一条反馈，并非常重视您的意见。',
  'Submit feedback': '提交反馈',
  'Saved searches': '已保存的搜索',
  'Use saved searches to filter your results more quickly': '使用已保存的搜索更快地筛选结果',
  Name: '名称',
  Query: '查询',
  'To see all available qualifiers, see our documentation.': '查看我们的文档了解所有可用的限定符。',
  'Create saved search': '创建已保存的搜索',
  'Resetting focus': '重置焦点',
};

/**
 * 仓库相关翻译
 * @file src/dictionaries/common/repo.js
 */

const repoDictionary = {
  // ===== 仓库页面 =====
  Code: '代码',
  Discussions: '讨论',
  Actions: 'Actions',
  Wiki: '维基',
  Security: '安全',
  Insights: '洞察',
  Projects: '项目',

  // ===== 仓库操作 =====
  'Use this template': '使用此模板',
  'Generate new repository': '生成新仓库',
  'Use this template to create a new repository': '使用此模板创建新仓库',
  'Include all branches': '包含所有分支',
  Star: '星标',
  Unstar: '取消星标',
  Fork: '复刻',
  Watch: '关注',
  Unwatch: '取消关注',

  // ===== 仓库信息 =====
  Owner: '所有者',
  'Repository name': '仓库名称',
  'Description (optional)': '描述（可选）',
  Public: '公开',
  'Anyone on the internet can see this repository. You choose who can commit.':
    '互联网上的任何人都可以看到此仓库。您选择谁可以提交。',
  Private: '私有',
  'You choose who can see and commit to this repository.': '您选择谁可以查看和提交到此仓库。',
  'Create repository': '创建仓库',
  'Add a README file': '添加 README 文件',
  'Add .gitignore': '添加 .gitignore',
  'Choose a license': '选择许可证',

  // ===== 文件操作 =====
  'Add file': '添加文件',
  'Create new file': '创建新文件',
  'Upload files': '上传文件',
  'Find file': '查找文件',
  'Go to file': '前往文件',
  'Add directory': '添加目录',
  'Edit file': '编辑文件',
  'Delete file': '删除文件',
  'Copy path': '复制路径',
  'Copy file': '复制文件',
  Download: '下载',
  'View raw': '查看原始文件',
  Blame: '责备',
  History: '历史',
  Preview: '预览',
  'Preview changes': '预览更改',
  'No changes': '无更改',
  'Edit new file': '编辑新文件',

  // ===== 分支操作 =====
  Branch: '分支',
  'Switch branches': '切换分支',
  'Find or create branch': '查找或创建分支',
  'Create branch': '创建分支',
  'Delete branch': '删除分支',
  'Rename branch': '重命名分支',
  'Switch to default branch': '切换到默认分支',
  'View more branches': '查看更多分支',
  'Showing recent branches': '显示最近的分支',
  'Default branch': '默认分支',

  // ===== 提交 =====
  'Commit changes': '提交更改',
  'Commit directly to the main branch.': '直接提交到 main 分支。',
  'Create a new branch for this commit and start a pull request.':
    '为此提交创建一个新分支并开始拉取请求。',
  'Learn more about pull requests.': '了解更多关于拉取请求的信息。',
  'Propose new file': '提议新文件',
  'Propose changes': '提议更改',
  Commit: '提交',
  Commits: '提交',
  'Commit history': '提交历史',
  'Recent commits': '最近提交',
};

/**
 * 拉取请求相关翻译
 * @file src/dictionaries/common/pr.js
 */

const prDictionary = {
  // ===== 拉取请求 =====
  'Create pull request': '创建拉取请求',
  'Draft pull request': '草稿拉取请求',
  'Create draft pull request': '创建草稿拉取请求',
  'Pull request': '拉取请求',
  'Open a pull request': '创建拉取请求',
  'Compare changes': '比较更改',
  'Choose a branch': '选择分支',
  'base:': '基础分支:',
  'compare:': '比较分支:',
  'Ability to merge': '合并能力',
  'This branch has no conflicts with the base branch': '此分支与基础分支没有冲突',
  'This branch has conflicts that must be resolved': '此分支有必须解决的冲突',
  'Resolve conflicts': '解决冲突',
  'Merging can be performed automatically.': '可以自动执行合并。',
  'Merge pull request': '合并拉取请求',
  'Squash and merge': '压缩并合并',
  'Rebase and merge': '变基并合并',
  'Create merge commit': '创建合并提交',
  'Confirm merge': '确认合并',
  'Restore branch': '恢复分支',

  // ===== PR 审查 =====
  Conversation: '对话',
  'Files changed': '文件已更改',
  Checks: '检查',
  'Review required': '需要审查',
  Write: '编写',
  'Leave a comment': '发表评论',
  'Write a review': '撰写审查意见',
  'Suggest a change': '建议更改',
  'Attach files by dragging & dropping, selecting or pasting them.':
    '通过拖放、选择或粘贴来附加文件。',
  'Styling with Markdown is supported': '支持 Markdown 样式',
  'Start a review': '开始审查',
  'Add your review': '添加您的审查',
  'Submit review': '提交审查',
  Approve: '批准',
  'Request changes': '请求更改',
  Comment: '评论',
  Approved: '已批准',
  'Changes requested': '已请求更改',
  Commented: '已评论',
  'Pending review': '待审查',
  'Review has been dismissed': '审查已被驳回',
};

/**
 * 问题与标签相关翻译
 * @file src/dictionaries/common/issue.js
 */

const issueDictionary = {
  // ===== 问题 =====
  'New issue': '新建问题',
  'Open a blank issue': '开启空白问题',
  'Get started': '开始',
  'Submit new issue': '提交新问题',
  Title: '标题',
  'Add title': '添加标题',
  Body: '正文',
  'Add body': '添加正文',
  Assignees: '负责人',
  Labels: '标签',
  Milestone: '里程碑',
  'No milestone': '无里程碑',
  'No assignees': '无负责人',
  'No labels': '无标签',
  'Nobody assigned': '未分配',
  'Add labels': '添加标签',
  'Set milestone': '设置里程碑',
  'Set assignees': '设置负责人',
  'Set project': '设置项目',

  // ===== 问题状态 =====
  Open: '打开',
  Closed: '已关闭',
  'Closed as completed': '已关闭（已完成）',
  'Closed as not planned': '已关闭（未计划）',
  'Close issue': '关闭问题',
  'Close as completed': '标记为已完成',
  'Close as not planned': '标记为未计划',
  'Reopen issue': '重新打开问题',
  'Edit issue': '编辑问题',
  'Delete issue': '删除问题',
  'Transfer issue': '转移问题',
  'Pin issue': '置顶问题',
  'Unpin issue': '取消置顶问题',
  'Lock conversation': '锁定对话',
  'Unlock conversation': '解锁对话',

  // ===== 标签类型 =====
  bug: '错误',
  documentation: '文档',
  duplicate: '重复',
  enhancement: '增强',
  'good first issue': '适合新手',
  'help wanted': '需要帮助',
  invalid: '无效',
  question: '问题',
  wontfix: '不予修复',
};

/**
 * 杂项词典 — 组织 / 探索 / 通知 / 页脚 / 提示信息
 * @file src/dictionaries/common/miscOrganization.js
 */

const miscOrganizationDictionary = {
  // ===== 组织和团队 =====
  Organization: '组织',
  People: '人员',
  Teams: '团队',
  Repositories: '仓库',
  Members: '成员',
  'Outside collaborators': '外部协作者',
  'Pending invitations': '待处理邀请',
  'Invite member': '邀请成员',
  'Invite outside collaborator': '邀请外部协作者',

  // ===== 探索页面 =====
  Topics: '主题',
  Trending: '趋势',
  Collections: '收藏集',
  Events: '活动',
  'Trending repositories': '趋势仓库',
  'Trending developers': '趋势开发者',
  'Explore repositories': '探索仓库',
  'Curated lists and insight into burgeoning industries, topics, and communities.':
    '精选列表和对新兴行业、主题和社区的洞察。',
  'Load more…': '加载更多…',

  // ===== 通知 =====
  Notifications: '通知',
  'Mark all as read': '全部标记为已读',
  'Mark as read': '标记为已读',
  'Mark as unread': '标记为未读',
  Unread: '未读',
  Read: '已读',
  'All notifications': '所有通知',
  Watching: '关注中',
  Participating: '参与中',
  Done: '完成',
  'No new notifications': '没有新通知',

  // ===== 页脚 =====
  Terms: '条款',
  Privacy: '隐私',
  Docs: '文档',
  Contact: '联系',
  Blog: '博客',
  Status: '状态',
  'Manage cookies': '管理 Cookie',
  'Do not share my personal information': '不要分享我的个人信息',
  About: '关于',
  API: 'API',
  Training: '培训',
  Shop: '商店',

  // ===== 提示信息 =====
  'You signed in with another tab or window. Reload to refresh your session.':
    '您已在另一个标签页或窗口中登录。请重新加载以刷新您的会话。',
  'You signed out in another tab or window. Reload to refresh your session.':
    '您已在另一个标签页或窗口中登出。请重新加载以刷新您的会话。',
  Reload: '重新加载',
  'Dismiss alert': '关闭警告',
  "You can't perform that action at this time.": '您现在无法执行此操作。',
  'Uh oh!': '哎呀！',
  'There was an error while loading. Please reload this page.':
    '加载时发生错误。请重新加载此页面。',
  'Please reload this page': '请重新加载此页面',
  "You're all set!": '一切就绪！',
  'The repository has been created.': '仓库已创建。',
  'The file has been added.': '文件已添加。',
  'The file has been updated.': '文件已更新。',
  'The file has been deleted.': '文件已删除。',
  'The pull request has been created.': '拉取请求已创建。',
  'The issue has been created.': '问题已创建。',
  'The comment has been added.': '评论已添加。',
  'The issue has been closed.': '问题已关闭。',
  'The issue has been reopened.': '问题已重新打开。',
  'The pull request has been closed.': '拉取请求已关闭。',
  'The pull request has been reopened.': '拉取请求已重新打开。',
  'The pull request has been merged.': '拉取请求已合并。',
  'The branch has been deleted.': '分支已删除。',
  'The branch has been restored.': '分支已恢复。',
  'Copied!': '已复制！',
};

/**
 * 杂项词典 — 空仓库提示 / 个人资料 / 首页 / 产品 / 企业 / 解决方案
 * @file src/dictionaries/common/miscMarketing.js
 */

const miscMarketingDictionary = {
  // ===== 空仓库提示 =====
  "Quick setup — if you've done this kind of thing before": '快速设置 — 如果您之前做过这种事',
  'Get started by creating a new file or uploading an existing file. We recommend every repository include a README, LICENSE, and .gitignore.':
    '通过创建新文件或上传现有文件开始。我们建议每个仓库都包含 README、LICENSE 和 .gitignore。',
  '…or create a new repository on the command line': '…或在命令行上创建新仓库',
  '…or push an existing repository from the command line': '…或从命令行推送现有仓库',
  '…or import code from another repository': '…或从另一个仓库导入代码',
  'You can initialize this repository with code from a Subversion, Mercurial, or TFS project.':
    '您可以使用 Subversion、Mercurial 或 TFS 项目的代码初始化此仓库。',
  'Import code': '导入代码',

  // ===== 个人资料 =====
  Overview: '概览',
  Stars: '星标',
  Followers: '关注者',
  Following: '关注中',
  Achievements: '成就',
  Pinned: '置顶',
  'Contribution settings': '贡献设置',
  'Contribution activity': '贡献活动',
  'Yearly contributions': '年度贡献',
  'Contribution graph': '贡献图',

  // ===== GitHub 首页 =====
  'The future of building happens together': '共同构建未来',
  'Try GitHub Copilot': '尝试 GitHub Copilot',
  'GitHub features': 'GitHub 功能',
  'GitHub customers': 'GitHub 客户',
  'Accelerate your entire workflow': '加速您的工作流程',
  'Automate your path to production': '自动化您的生产之路',
  'Code instantly from anywhere': '随时随地即时编写代码',
  'Keep momentum on the go': '随时保持动力',
  'Shape your toolchain': '塑造您的工具链',
  'Built-in application security where found means fixed': '内置应用安全，发现即修复',
  'Work together, achieve more': '协作共进',
  'Millions of developers and businesses call GitHub home': '数百万开发者与业务选择 GitHub',
  Technology: '科技',
  Automotive: '汽车',
  'Figma streamlines development and strengthens security': 'Figma 简化开发并加强安全',
  'Mercedes-Benz standardizes source code and automates onboarding':
    '梅赛德斯-奔驰标准化源代码并自动化入职流程',
  'Mercado Libre cuts coding time by 50%': 'Mercado Libre 将编码时间缩短 50%',

  // ===== 产品特性 =====
  'Automate any workflow': '自动化任何工作流',
  Packages: '包',
  'Host and manage packages': '托管和管理包',
  'Find and fix vulnerabilities': '查找和修复漏洞',
  'Instant dev environments': '即时开发环境',
  Copilot: 'Copilot',
  'Write better code with AI': '用 AI 写出更好的代码',
  'Code review': '代码审查',
  'Manage code changes': '管理代码变更',
  'Plan and track work': '计划和跟踪工作',
  'Collaborate outside of code': '代码外的协作',

  // ===== 企业版 =====
  'Enterprise platform': '企业平台',
  'AI-powered developer platform': '人工智能驱动的开发者平台',
  'Available add-ons': '可用附加组件',
  'Copilot for business': '商业版 Copilot',
  'Enterprise-grade AI features': '企业级人工智能功能',
  'Premium Support': '高级支持',
  'Enterprise-grade 24/7 support': '企业级 24/7 支持',
  Pricing: '价格',

  // ===== 解决方案 =====
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

  // ===== MCP =====
  'MCP Registry': 'MCP 注册表',
};

/**
 * 杂项词典 — 通用操作按钮 / 状态 / 仓库信息
 * @file src/dictionaries/common/miscActions.js
 */

const miscActionsDictionary = {
  // ===== 保存按钮 =====
  Save: '保存',
  Cancel: '取消',
  Edit: '编辑',
  Delete: '删除',
  Create: '创建',
  Update: '更新',
  Submit: '提交',
  Confirm: '确认',
  Close: '关闭',
  'Save changes': '保存更改',
  'Cancel changes': '取消更改',

  // ===== 状态 =====
  Success: '成功',
  Failure: '失败',
  Error: '错误',
  Pending: '待定',
  'In progress': '进行中',
  Queued: '排队中',
  Running: '运行中',
  Completed: '已完成',
  Skipped: '已跳过',
  Cancelled: '已取消',
  'Action required': '需要操作',
  Waiting: '等待中',
  'On hold': '暂停',

  // ===== 其他常见文本 =====
  'About this repository': '关于此仓库',
  Readme: 'README',
  License: '许可证',
  Contributing: '贡献指南',
  'Code of conduct': '行为准则',
  'Security policy': '安全政策',
  Website: '网站',
  Languages: '语言',
  'View license': '查看许可证',
  'View documentation': '查看文档',
  Contribute: '贡献',
  'Report a bug': '报告问题',
  'Request a feature': '请求功能',
  'Get help': '获取帮助',
  Sponsor: '赞助',
  Sponsors: '赞助者',
  'Sponsor this project': '赞助此项目',
  'Become a sponsor': '成为赞助者',
  'View sponsors': '查看赞助者',
};

/**
 * 其他杂项翻译
 * @file src/dictionaries/common/misc.js
 * @version 1.9.24
 * @description 按主题合并组织/探索/提示、首页/产品/方案、操作/状态三组杂项词典
 */

const miscDictionary = {
  ...miscOrganizationDictionary,
  ...miscMarketingDictionary,
  ...miscActionsDictionary,
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
 * Trie树数据结构模块
 * @file trie.js
 * @version 1.9.21
 * @date 2026-06-09
 * @author Sut
 * @description 高效的字符串匹配数据结构，用于部分匹配翻译
 */

class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.value = null;
    this.length = 0;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
    this.size = 0;
  }

  insert(word, value) {
    if (!word || typeof word !== 'string' || word.length === 0) {
      return;
    }

    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }
    node.isEndOfWord = true;
    node.value = value;
    node.length = word.length;
    this.size++;
  }

  findAllMatches(text, minKeyLength = 0) {
    if (!text || typeof text !== 'string' || text.length === 0) {
      return [];
    }

    const matches = [];
    const textLen = text.length;

    for (let i = 0; i < textLen; i++) {
      let node = this.root;
      let currentWord = '';

      for (let j = i; j < textLen; j++) {
        const char = text[j];
        if (!node.children.has(char)) {
          break;
        }

        node = node.children.get(char);
        currentWord += char;

        if (node.isEndOfWord && currentWord.length >= minKeyLength) {
          matches.push({
            key: currentWord,
            value: node.value,
            start: i,
            end: j,
            length: node.length,
          });
        }
      }
    }

    return matches;
  }

  clear() {
    this.root = new TrieNode();
    this.size = 0;
  }

  getSize() {
    return this.size;
  }
}

/**
 * 部分匹配翻译模块
 * @file src/translation-core/partialTranslator.js
 * @version 1.9.26
 * @date 2026-09-22
 * @author Sut
 * @description 使用 Trie 树进行部分匹配翻译；查询上下文由调用方注入，避免与 dictionaryManager 形成循环依赖
 */

const partialTranslator = {
  /**
   * 基于 Trie 树的长词优先部分替换
   * @param {string} text - 待处理文本
   * @param {boolean} [enablePartialMatch] - 是否启用部分匹配
   * @param {{dictionary: Object, dictionaryTrie: Object, regexCache: Map}} [store] - 词典上下文
   * @returns {string|null} 替换结果，无可替换内容时返回 null
   */
  performPartialTranslation(text, enablePartialMatch = false, store = null) {
    if (!enablePartialMatch || !store || !store.dictionaryTrie) {
      return null;
    }

    const textLen = text.length;
    if (textLen < 5) {
      return null;
    }

    const matches = [];
    const minKeyLength = Math.min(4, Math.floor(textLen / 2));
    const potentialMatches = store.dictionaryTrie.findAllMatches(text, minKeyLength);

    for (const match of potentialMatches) {
      const key = match.key;
      if (
        !Object.prototype.hasOwnProperty.call(store.dictionary, key) ||
        store.dictionary[key].startsWith('待翻译: ')
      ) {
        continue;
      }

      const value = store.dictionary[key];

      if (/^[0-9.,\s()[\]{}/*^$#@!~`|:;"'?>+-]+$/i.test(key)) {
        continue;
      }

      const wordRegexKey = `word_${key}`;
      let wordRegex;

      if (store.regexCache.has(wordRegexKey)) {
        wordRegex = store.regexCache.get(wordRegexKey);
      } else {
        wordRegex = utils.safeRegExp('\\b' + utils.escapeRegExp(key) + '\\b', 'gi');
        if (wordRegex) {
          store.regexCache.set(wordRegexKey, wordRegex);
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

        if (store.regexCache.has(nonWordRegexKey)) {
          nonWordRegex = store.regexCache.get(nonWordRegexKey);
        } else {
          nonWordRegex = utils.safeRegExp(utils.escapeRegExp(key), 'g');
          if (nonWordRegex) {
            store.regexCache.set(nonWordRegexKey, nonWordRegex);
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
 * 翻译词典管理模块
 * @file src/translation-core/dictionaryManager.js
 * @version 1.9.26
 * @date 2026-09-22
 * @author Sut
 * @description 管理翻译词典的加载和查询
 */

// 词典管理常量
const DEFAULT_MAX_DICT_SIZE = 2000; // 默认最大词典大小
const MAX_KEY_LENGTH_FOR_CASE_VARIANTS = 100; // 生成大小写变体的最大键长度

const dictionaryManager = {
  dictionary: {},
  dictionaryHash: new Map(),
  dictionaryTrie: null,
  regexCache: new Map(),
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
      this.dictionaryTrie = new Trie();
      this.regexCache.clear();

      // 构建哈希表与 Trie 树：哈希用于精确查询，Trie 用于部分匹配
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
          this.dictionaryTrie.insert(key, value);
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

    // 精确匹配仍无结果时，按配置启用 Trie 部分匹配（上下文由本模块注入，避免循环依赖）
    if (result === null && CONFIG.performance?.enablePartialMatch) {
      result = partialTranslator.performPartialTranslation(normalizedText, true, {
        dictionary: this.dictionary,
        dictionaryTrie: this.dictionaryTrie,
        regexCache: this.regexCache,
      });
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
          if (key.length <= MAX_KEY_LENGTH_FOR_CASE_VARIANTS) {
            this.dictionaryHash.set(key.toLowerCase(), value);
            this.dictionaryHash.set(key.toUpperCase(), value);
          }
          this.dictionaryTrie?.insert(key, value);
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
 * 虚拟DOM常量配置
 * @file src/core/virtualDom/constants.js
 */

const CLEANUP_INTERVAL_MS = 30000;
const MAX_NODES_DEFAULT = 5000;
const NODES_REMOVE_RATIO = 0.2;
const MAX_AGE_HOURS = 1;
const MAX_AGE_MS = MAX_AGE_HOURS * 60 * 60 * 1000;

/**
 * 虚拟节点清理策略
 * @file src/core/virtualDom/cleanup.js
 * @description 计算过期/脱离文档的节点，以及节点数超限时按最近更新时间淘汰
 */

/**
 * 计算需要移除的节点 ID 集合
 * @param {Map<string, object>} nodes - 虚拟节点表
 * @param {number} now - 当前时间戳
 * @returns {string[]} 待移除的节点 ID 列表
 */
function collectStaleNodeIds(nodes, now) {
  const staleIds = [];

  for (const [id, node] of nodes) {
    if (!document.contains(node.element)) {
      staleIds.push(id);
      continue;
    }

    if (now - node.lastUpdated > MAX_AGE_MS) {
      staleIds.push(id);
    }
  }

  return staleIds;
}

/**
 * 按最近更新时间升序取出最旧的若干节点 ID
 * @param {Map<string, object>} nodes - 虚拟节点表
 * @param {number} count - 计划移除的数量
 * @returns {string[]} 待移除的节点 ID 列表
 */
function pickOldestNodeIds(nodes, count) {
  const entries = Array.from(nodes.entries());
  entries.sort((a, b) => a[1].lastUpdated - b[1].lastUpdated);
  return entries.slice(0, count).map(([id]) => id);
}

/**
 * 从节点表与缓存中移除指定节点
 * @param {{nodes: Map, nodeCache: Map}} manager - 虚拟 DOM 管理器
 * @param {string[]} ids - 待移除的节点 ID 列表
 * @returns {number} 实际移除数量
 */
function removeNodes(manager, ids) {
  let removedCount = 0;

  for (const id of ids) {
    manager.nodes.delete(id);
    manager.nodeCache.delete(id);
    removedCount++;
  }

  return removedCount;
}

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
 * 虚拟节点创建与容量控制
 * @file src/core/virtualDom/nodes.js
 */

/**
 * 节点数超限时按最近更新时间淘汰最旧节点
 * @param {object} manager - 虚拟 DOM 管理器
 */
function trimOldestNodes(manager) {
  const nodesToRemove = Math.floor(manager.maxNodes * NODES_REMOVE_RATIO);
  const removed = removeNodes(manager, pickOldestNodeIds(manager.nodes, nodesToRemove));

  if (CONFIG.debugMode) {
    console.log(`[GitHub 中文翻译] 强制清理了${removed}个虚拟节点`);
  }
}

/**
 * 复用缓存节点或按需创建虚拟节点
 * @param {object} manager - 虚拟 DOM 管理器
 * @param {HTMLElement} element - 目标元素
 * @returns {VirtualNode|null} 虚拟节点；页面卸载中或异常时返回 null
 */
function getOrCreateNode(manager, element) {
  try {
    if (manager.isPageUnloading) {
      return null;
    }

    if (element.dataset && element.dataset.virtualDomId) {
      const cachedNode = manager.nodeCache.get(element.dataset.virtualDomId);
      if (cachedNode && cachedNode.element === element) {
        return cachedNode;
      }
    }

    if (manager.nodes.size >= manager.maxNodes) {
      manager.cleanup(true);

      if (manager.nodes.size >= manager.maxNodes) {
        trimOldestNodes(manager);
      }
    }

    const node = new VirtualNode(element);
    manager.nodes.set(node.elementId, node);
    manager.nodeCache.set(node.elementId, node);

    return node;
  } catch (error) {
    if (CONFIG.debugMode) {
      console.error('[GitHub 中文翻译] 获取或创建虚拟节点失败:', error);
    }
    return null;
  }
}

/**
 * 虚拟 DOM 生命周期钩子
 * @file src/core/virtualDom/lifecycle.js
 * @description 页面卸载时的标记与清理、自动清理定时器的启停
 */

/**
 * 绑定页面卸载处理器（卸载时标记并整体清理）
 * @param {object} manager - 虚拟 DOM 管理器
 */
function bindPageUnloadHandler(manager) {
  const unloadHandler = () => {
    manager.isPageUnloading = true;
    manager.cleanup();
  };

  window.addEventListener('beforeunload', unloadHandler);
  window.addEventListener('unload', unloadHandler);
  window.addEventListener('pagehide', unloadHandler);
}

/**
 * 启动自动清理定时器（页面卸载后自动停止）
 * @param {object} manager - 虚拟 DOM 管理器
 */
function startCleanupTimer(manager) {
  stopCleanupTimer(manager);

  manager.cleanupTimer = setInterval(() => {
    if (manager.isPageUnloading) {
      stopCleanupTimer(manager);
      return;
    }

    manager.cleanup();
  }, manager.cleanupInterval);
}

/**
 * 停止自动清理定时器
 * @param {object} manager - 虚拟 DOM 管理器
 */
function stopCleanupTimer(manager) {
  if (manager.cleanupTimer) {
    clearInterval(manager.cleanupTimer);
    manager.cleanupTimer = null;
  }
}

/**
 * 虚拟DOM管理器类
 * @file src/core/virtualDom/manager.js
 * @version 1.9.24
 * @description 节点创建/查询与翻译状态判定；清理策略与生命周期钩子拆分到同目录子模块
 */

class VirtualDomManager {
  constructor() {
    this.nodes = new Map();
    this.nodeCache = new Map();
    this.lastCleanupTime = Date.now();
    this.cleanupInterval = CLEANUP_INTERVAL_MS;
    this.maxNodes = MAX_NODES_DEFAULT;
    this.cleanupTimer = null;
    this.isPageUnloading = false;

    bindPageUnloadHandler(this);
    this.startAutoCleanup();
  }

  /**
   * 复用缓存节点或按需创建；节点数超限时先淘汰最旧节点
   * @param {HTMLElement} element - 目标元素
   * @returns {VirtualNode|null} 虚拟节点
   */
  getOrCreateNode(element) {
    return getOrCreateNode(this, element);
  }

  /**
   * 按元素 ID 查询虚拟节点
   * @param {string} elementId - 元素 ID
   * @returns {VirtualNode|null} 虚拟节点
   */
  findNodeById(elementId) {
    return this.nodes.get(elementId) || null;
  }

  /**
   * 判定元素是否需要重新翻译
   * @param {HTMLElement} element - 目标元素
   * @returns {boolean} 是否需要翻译
   */
  shouldTranslate(element) {
    try {
      const node = getOrCreateNode(this, element);

      if (!node) {
        return true;
      }

      const contentChanged = node.hasContentChanged();
      const attributesChanged = node.hasAttributesChanged();

      if (contentChanged || attributesChanged) {
        node.resetTranslation();
        return true;
      }

      if (node.isTranslated) {
        return false;
      }

      return true;
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 检查翻译状态失败:', error);
      }
      return true;
    }
  }

  /**
   * 标记元素已翻译
   * @param {HTMLElement} element - 目标元素
   */
  markElementAsTranslated(element) {
    try {
      const node = this.getOrCreateNode(element);
      if (node) {
        node.markAsTranslated();
      }
    } catch (_error) {
      // 忽略错误
    }
  }

  /**
   * 批量筛选需要翻译的元素
   * @param {Iterable<HTMLElement>} elements - 候选元素
   * @returns {HTMLElement[]} 需要翻译的元素
   */
  processElements(elements) {
    const elementsToTranslate = [];

    try {
      elements.forEach((element) => {
        if (this.shouldTranslate(element)) {
          elementsToTranslate.push(element);
        }
      });
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 批量处理元素失败:', error);
      }
      elementsToTranslate.push(...elements);
    }

    return elementsToTranslate;
  }

  /**
   * 启动自动清理
   */
  startAutoCleanup() {
    startCleanupTimer(this);
  }

  /**
   * 停止自动清理
   */
  stopAutoCleanup() {
    stopCleanupTimer(this);
  }

  /**
   * 清理虚拟节点
   * @param {boolean} [force] - 是否强制清空全部节点
   */
  cleanup(force = false) {
    try {
      const now = Date.now();

      if (!force && now - this.lastCleanupTime < this.cleanupInterval) {
        return;
      }

      this.lastCleanupTime = now;

      if (force || this.isPageUnloading) {
        const removedCount = this.nodes.size;
        this.nodes.clear();
        this.nodeCache.clear();

        if (CONFIG.debugMode) {
          console.log(`[GitHub 中文翻译] 强制清理了${removedCount}个虚拟节点`);
        }
        return;
      }

      const removedCount = removeNodes(this, collectStaleNodeIds(this.nodes, now));

      if (CONFIG.debugMode && removedCount > 0) {
        console.log(
          `[GitHub 中文翻译] 清理了${removedCount}个无效虚拟节点，当前节点数：${this.nodes.size}`,
        );
      }
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 清理虚拟节点失败:', error);
      }
    }
  }

  /**
   * 清空全部节点
   */
  clear() {
    this.nodes.clear();
    this.nodeCache.clear();
    this.lastCleanupTime = Date.now();
  }

  /**
   * 获取管理器统计信息
   * @returns {{nodeCount: number, lastCleanupTime: number}} 统计信息
   */
  getStats() {
    return {
      nodeCount: this.nodes.size,
      lastCleanupTime: this.lastCleanupTime,
    };
  }
}

/**
 * 虚拟DOM模块
 * @file virtualDom.js
 */

const virtualDomManager = new VirtualDomManager();

virtualDomManager;

/**
 * 跳过翻译的标签与 class 模式
 * @file src/translation-core/selectorUtils/skipTags.js
 */

/** 这些标签的内容不参与翻译 */
const SKIP_TAGS = [
  'script',
  'style',
  'code',
  'pre',
  'textarea',
  'input',
  'select',
  'img',
  'svg',
  'canvas',
  'video',
  'audio',
];

/** class 命中任一模式即跳过（代码块、图标、标识符等） */
const SKIP_CLASS_PATTERNS = [
  /language-\w+/,
  /highlight/,
  /token/,
  /no-translate/,
  /octicon/,
  /emoji/,
  /avatar/,
  /timestamp/,
  /numeral/,
  /filename/,
  /hash/,
  /sha/,
  /shortsha/,
  /hex-color/,
  /code/,
  /gist/,
  /language-/,
  /markdown-/,
  /monaco-editor/,
  /syntax-/,
  /highlight-/,
  /clipboard/,
  /progress-/,
  /count/,
  /size/,
  /time/,
  /date/,
  /sortable/,
  /label/,
  /badge/,
  /url/,
  /email/,
  /key/,
  /token/,
  /user-name/,
  /repo-name/,
];

/**
 * 跳过翻译的实体标识类 id 模式
 * @file src/translation-core/selectorUtils/skipIdsEntity.js
 * @description 数字编号、提交哈希、Issue/PR 编号、用户与仓库名等实体标识
 */

/** 实体标识类 id 模式（数字、哈希、编号、名称等） */
const SKIP_ID_ENTITY_PATTERNS = [
  /\d+/,
  /-\d+/,
  /_\d+/,
  /sha-/,
  /hash-/,
  /commit-/,
  /issue-/,
  /pull-/,
  /pr-/,
  /repo-/,
  /user-/,
  /file-/,
  /blob-/,
  /tree-/,
  /branch-/,
  /tag-/,
  /release-/,
  /gist-/,
  /discussion-/,
  /comment-/,
  /review-/,
  /workflow-/,
  /action-/,
  /job-/,
  /step-/,
  /runner-/,
  /package-/,
  /registry-/,
  /marketplace-/,
  /organization-/,
  /team-/,
  /project-/,
  /milestone-/,
  /assignee-/,
  /reporter-/,
  /reviewer-/,
  /author-/,
  /committer-/,
  /contributor-/,
  /sponsor-/,
  /funding-/,
  /donation-/,
  /payment-/,
  /billing-/,
  /plan-/,
  /subscription-/,
  /license-/,
  /secret-/,
  /key-/,
  /token-/,
  /password-/,
  /credential-/,
  /certificate-/,
  /ssh-/,
];

/**
 * 跳过翻译的技术设施类 id 模式
 * @file src/translation-core/selectorUtils/skipIdsTechnical.js
 * @description Git 版本控制、API/集成、安全、Actions、市场与账户等相关前缀
 */

/** 技术设施类 id 模式 */
const SKIP_ID_TECHNICAL_PATTERNS = [
  /git-/,
  /clone-/,
  /push-/,
  /pull-/,
  /fetch-/,
  /merge-/,
  /rebase-/,
  /cherry-pick-/,
  /reset-/,
  /revert-/,
  /tag-/,
  /branch-/,
  /commit-/,
  /diff-/,
  /patch-/,
  /stash-/,
  /ref-/,
  /head-/,
  /remote-/,
  /upstream-/,
  /origin-/,
  /local-/,
  /tracking-/,
  /merge-base-/,
  /conflict-/,
  /resolve-/,
  /status-/,
  /log-/,
  /blame-/,
  /bisect-/,
  /grep-/,
  /find-/,
  /filter-/,
  /archive-/,
  /submodule-/,
  /worktree-/,
  /lfs-/,
  /graphql-/,
  /rest-/,
  /api-/,
  /webhook-/,
  /event-/,
  /payload-/,
  /callback-/,
  /redirect-/,
  /oauth-/,
  /sso-/,
  /ldap-/,
  /saml-/,
  /2fa-/,
  /mfa-/,
  /security-/,
  /vulnerability-/,
  /cve-/,
  /dependency-/,
  /alert-/,
  /secret-scanning-/,
  /code-scanning-/,
  /codeql-/,
  /actions-/,
  /workflow-/,
  /job-/,
  /step-/,
  /runner-/,
  /artifact-/,
  /cache-/,
  /environment-/,
  /deployment-/,
  /app-/,
  /oauth-app-/,
  /github-app-/,
  /integration-/,
  /webhook-/,
  /marketplace-/,
  /listing-/,
  /subscription-/,
  /billing-/,
  /plan-/,
  /usage-/,
  /limits-/,
  /quota-/,
  /traffic-/,
  /analytics-/,
  /insights-/,
  /search-/,
  /explore-/,
  /trending-/,
  /stars-/,
  /forks-/,
  /watchers-/,
  /contributors-/,
  /activity-/,
  /events-/,
  /notifications-/,
  /feeds-/,
  /dashboard-/,
  /profile-/,
  /settings-/,
  /preferences-/,
  /organization-/,
  /team-/,
  /project-/,
  /milestone-/,
  /label-/,
  /\b\w+[0-9]\w*\b/,
];

/**
 * 翻译元素选择跳过模式
 * @file src/translation-core/selectorUtils/patterns.js
 * @version 1.9.24
 * @description 汇总跳过翻译的标签、class 与 id 模式（模式定义按类别拆分到同目录子模块）
 */

/** id 命中任一模式即跳过（实体标识在前、技术设施在后，保持匹配优先级） */
const SKIP_ID_PATTERNS = [...SKIP_ID_ENTITY_PATTERNS, ...SKIP_ID_TECHNICAL_PATTERNS];

/**
 * 翻译元素选择匹配模块
 * @file src/translation-core/selectorUtils/matchers.js
 */

function isSkipTag(tagName) {
  return SKIP_TAGS.includes(tagName.toLowerCase());
}

function hasSkipClass(className) {
  if (!className) return false;
  if (typeof className !== 'string') return false;
  return SKIP_CLASS_PATTERNS.some((pattern) => pattern.test(className));
}

function hasSkipId(id) {
  if (!id) return false;
  return SKIP_ID_PATTERNS.some((pattern) => pattern.test(id));
}

function isHiddenElement(element) {
  const computedStyle = window.getComputedStyle(element);
  return (
    computedStyle.display === 'none' ||
    computedStyle.visibility === 'hidden' ||
    computedStyle.opacity === '0' ||
    (computedStyle.position === 'absolute' && computedStyle.left === '-9999px')
  );
}

function isNumericOrSpecialOnly(text) {
  return /^[0-9.,\s()[\]{}/*^$#@!~`|:;"'?>+-]+$/i.test(text);
}

/**
 * 翻译元素选择工具函数与模式
 * @file src/translation-core/selectorUtils.js
 */

/**
 * 翻译元素选择模块
 * @file translationCore/elementSelector.js
 */

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
 * 翻译性能统计数据
 * @file src/translation-core/elementTranslator/stats.js
 */

const initialPerformanceData = {
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

/**
 * 关键元素翻译模块
 * @file src/translation-core/elementTranslator/critical.js
 */

/**
 * 翻译页面关键区域元素（失败降级策略的兜底实现）
 * @param {Function} translateElementFn - 单元素翻译函数
 */
function translateCriticalElements(translateElementFn) {
  const criticalSelectors = ['.Header', '.repository-content', '.js-repo-pjax-container', 'main'];

  const criticalElements = [];
  let processedElements = 0;
  let failedElements = 0;

  criticalSelectors.forEach((selector) => {
    try {
      const elements = document.querySelectorAll(selector);
      if (elements && elements.length > 0) {
        Array.from(elements).forEach((el) => {
          if (el && el instanceof HTMLElement) {
            criticalElements.push(el);
          }
        });

        if (CONFIG.debugMode) {
          console.log(`[GitHub 中文翻译] 找到关键元素: ${selector}, 数量: ${elements.length}`);
        }
      }
    } catch (err) {
      ErrorHandler.handleError('查询选择器', err, ErrorHandler.ERROR_TYPES.DOM_OPERATION);
    }
  });

  if (criticalElements.length === 0) {
    if (CONFIG.debugMode) {
      console.log('[GitHub 中文翻译] 没有找到关键元素需要翻译');
    }
    return;
  }

  criticalElements.forEach((element) => {
    try {
      translateElementFn(element);
      processedElements++;
    } catch (err) {
      failedElements++;
      ErrorHandler.handleError('关键元素翻译', err, ErrorHandler.ERROR_TYPES.DOM_OPERATION);
    }
  });

  if (CONFIG.debugMode) {
    console.log(
      `[GitHub 中文翻译] 关键元素翻译完成 - 总数量: ${criticalElements.length}, 成功: ${processedElements}, 失败: ${failedElements}`,
    );
  }
}

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
    return translateCriticalElements((el) => this.translateElement(el));
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
 * 翻译缓存管理控制器
 * @file src/translation-core/cacheController.js
 */

const cacheController = {
  cleanCache(performanceData) {
    try {
      if (
        !dictionaryManager.cacheManager.translationCache ||
        !(dictionaryManager.cacheManager.translationCache instanceof Map)
      ) {
        if (CONFIG.debugMode) {
          console.warn('[GitHub 中文翻译] 缓存对象不存在或无效');
        }
        return;
      }

      dictionaryManager.cacheManager.cleanCache();
      if (performanceData) {
        performanceData.cacheCleanups = (performanceData.cacheCleanups || 0) + 1;
      }

      if (CONFIG.debugMode) {
        console.log(
          `[GitHub 中文翻译] 缓存清理完成，当前大小: ${dictionaryManager.cacheManager.translationCache.size}`,
        );
      }
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 缓存清理过程出错，使用回退策略:', error);
      }

      try {
        if (CONFIG.debugMode) {
          console.log('[GitHub 中文翻译] 执行缓存重置作为最后手段');
        }
        dictionaryManager.cacheManager.translationCache.clear();
        dictionaryManager.cacheManager.cacheStats.size = 0;
      } catch (fallbackError) {
        if (CONFIG.debugMode) {
          console.error('[GitHub 中文翻译] 缓存重置失败:', fallbackError);
        }
      }
    }
  },

  clearCache() {
    try {
      if (virtualDomManager && typeof virtualDomManager.clear === 'function') {
        virtualDomManager.clear();
      }

      if (dictionaryManager.cacheManager) {
        dictionaryManager.cacheManager.clearCache();
      }

      if (elementSelector.elementCache) {
        elementSelector.elementCache = new WeakMap();
      }

      performanceMonitor.resetPerformanceData();

      try {
        const translatedElements = document.querySelectorAll('[data-github-zh-translated]');
        translatedElements.forEach((element) => {
          element.removeAttribute('data-github-zh-translated');
        });
      } catch (domError) {
        if (CONFIG.debugMode) {
          console.warn('[GitHub 中文翻译] 清除翻译标记时出错:', domError);
        }
      }

      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 翻译缓存已彻底清除');
      }
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 清除缓存时出错:', error);
      }

      try {
        if (dictionaryManager.cacheManager) dictionaryManager.cacheManager.clearCache();
        if (elementSelector.elementCache) elementSelector.elementCache = new WeakMap();
        dictionaryManager.cacheManager.cacheStats = { hits: 0, misses: 0, evictions: 0, size: 0 };
      } catch (fallbackError) {
        if (CONFIG.debugMode) {
          console.error('[GitHub 中文翻译] 基本缓存清理也失败:', fallbackError);
        }
      }
    }
  },

  warmUpCache(isPageUnloading) {
    if (!CONFIG.performance?.enableTranslationCache) {
      return;
    }

    try {
      const commonKeys = Object.keys(dictionaryManager.dictionary)
        .filter(
          (key) => !dictionaryManager.dictionary[key].startsWith('待翻译: ') && key.length <= 50,
        )
        .slice(0, 100);

      commonKeys.forEach((key) => {
        const value = dictionaryManager.dictionary[key];
        dictionaryManager.cacheManager.setToCache(key, value, isPageUnloading);
      });

      if (CONFIG.debugMode) {
        console.log(`[GitHub 中文翻译] 缓存预热完成，已预加载${commonKeys.length}个常用词条`);
      }
    } catch (error) {
      console.error('[GitHub 中文翻译] 缓存预热失败:', error);
    }
  },
};

/**
 * 翻译批处理模块
 * @file src/translation-core/batchProcessor.js
 */

async function processElementsInBatches(inputElements, getCurrentPageModeConfig) {
  const elements = virtualDomManager.processElements(inputElements);
  const modeConfig = getCurrentPageModeConfig();
  const batchSize = modeConfig.batchSize || CONFIG.performance?.batchSize || 50;
  const delay = CONFIG.performance?.batchDelay || 0;

  if (!elements || !Array.isArray(elements) || elements.length === 0) {
    return Promise.resolve();
  }

  const validElements = elements.filter((element) => element instanceof HTMLElement);

  if (validElements.length <= batchSize) {
    validElements.forEach((element) => {
      try {
        elementTranslator.translateElement(element);
      } catch (error) {
        ErrorHandler.handleError('翻译元素', error, ErrorHandler.ERROR_TYPES.DOM_OPERATION);
      }
    });
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const processBatch = (startIndex) => {
      try {
        const endIndex = Math.min(startIndex + batchSize, validElements.length);
        const batch = validElements.slice(startIndex, endIndex);

        batch.forEach((element) => {
          try {
            elementTranslator.translateElement(element);
          } catch (error) {
            ErrorHandler.handleError('翻译元素', error, ErrorHandler.ERROR_TYPES.DOM_OPERATION);
          }
        });

        if (
          CONFIG.performance?.logTiming &&
          (endIndex % (batchSize * 5) === 0 || endIndex === validElements.length)
        ) {
          const progress = Math.round((endIndex / validElements.length) * 100);
          console.log(
            `[GitHub 中文翻译] 翻译进度: ${progress}%, 已处理: ${endIndex}/${validElements.length} 元素`,
          );
        }

        if (endIndex < validElements.length) {
          if (delay > 0) {
            setTimeout(() => processBatch(endIndex), delay);
          } else {
            requestAnimationFrame(() => processBatch(endIndex));
          }
        } else {
          resolve();
        }
      } catch (error) {
        ErrorHandler.handleError('批处理过程', error, ErrorHandler.ERROR_TYPES.TRANSLATION);
        resolve();
      }
    };

    processBatch(0);
  });
}

/**
 * 翻译执行逻辑模块
 * @file src/translation-core/translator.js
 */

async function translate(targetElements = null, translationCore) {
  if (!dictionaryManager.dictionary || Object.keys(dictionaryManager.dictionary).length === 0) {
    dictionaryManager.init();
  }

  const pageMode = translationCore.detectPageMode();
  const modeConfig = translationCore.getCurrentPageModeConfig();

  if (CONFIG.debugMode) {
    console.log(`[GitHub 中文翻译] 当前页面模式: ${pageMode}`, modeConfig);
  }

  performanceMonitor.resetPerformanceData();
  elementTranslator.performanceData.translateStartTime = Date.now();

  return new Promise((resolve, reject) => {
    try {
      let elements;

      if (Array.isArray(targetElements)) {
        elements = targetElements.filter((el) => el && el instanceof HTMLElement);
        if (CONFIG.debugMode) {
          console.log(`[GitHub 中文翻译] 翻译特定区域，目标元素数量: ${elements.length}`);
        }
      } else {
        elements = elementSelector.getElementsToTranslate();
        if (CONFIG.debugMode) {
          console.log(`[GitHub 中文翻译] 翻译整个页面，目标元素数量: ${elements.length}`);
        }
      }

      if (!elements || elements.length === 0) {
        if (CONFIG.debugMode) {
          console.log('[GitHub 中文翻译] 没有找到需要翻译的元素');
        }
        performanceMonitor.logPerformanceData();
        resolve();
        return;
      }

      processElementsInBatches(elements, () => translationCore.getCurrentPageModeConfig())
        .then(() => {
          elementTranslator.performanceData.translateEndTime = Date.now();
          performanceMonitor.logPerformanceData();
          resolve();
        })
        .catch((batchError) => {
          ErrorHandler.handleError('批处理过程', batchError, ErrorHandler.ERROR_TYPES.TRANSLATION, {
            retryable: true,
            recoveryFn: () => {
              translationCore
                .translateCriticalElementsOnly()
                .then(() => {
                  elementTranslator.performanceData.translateEndTime = Date.now();
                  performanceMonitor.logPerformanceData();
                  resolve();
                })
                .catch((recoverError) => {
                  ErrorHandler.handleError(
                    '错误恢复',
                    recoverError,
                    ErrorHandler.ERROR_TYPES.TRANSLATION,
                  );
                  elementTranslator.performanceData.translateEndTime = Date.now();
                  performanceMonitor.logPerformanceData();
                  reject(recoverError);
                });
            },
            maxRetries: 2,
          });
        });
    } catch (error) {
      ErrorHandler.handleError('翻译过程', error, ErrorHandler.ERROR_TYPES.TRANSLATION, {
        retryable: true,
        recoveryFn: () => {
          translationCore
            .translateCriticalElementsOnly()
            .then(() => {
              performanceMonitor.logPerformanceData();
              resolve();
            })
            .catch((recoverError) => {
              ErrorHandler.handleError(
                '错误恢复',
                recoverError,
                ErrorHandler.ERROR_TYPES.TRANSLATION,
              );
              performanceMonitor.logPerformanceData();
              reject(recoverError);
            });
        },
        maxRetries: 2,
      });
    }
  });
}

function translateCriticalElementsOnly() {
  return elementTranslator.translateCriticalElementsOnly();
}

/**
 * 翻译核心生命周期管理模块
 * @file src/translation-core/lifecycle.js
 */

function setupPageUnloadHandler(translationCore) {
  const unloadHandler = () => {
    translationCore.isPageUnloading = true;
    translationCore.cleanup();
  };

  window.addEventListener('beforeunload', unloadHandler);
  window.addEventListener('unload', unloadHandler);
  window.addEventListener('pagehide', unloadHandler);

  return unloadHandler;
}

function startCacheCleanupTimer(translationCore) {
  const CLEANUP_INTERVAL_MS = 120000;
  return setInterval(() => {
    if (translationCore.isPageUnloading) {
      if (translationCore.cacheCleanupTimer) {
        clearInterval(translationCore.cacheCleanupTimer);
        translationCore.cacheCleanupTimer = null;
      }
      return;
    }
    translationCore.cleanCache();
  }, CLEANUP_INTERVAL_MS);
}

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
 * 配置界面基础布局样式
 * @file src/ui/styles/configUI/base.js
 */

const baseStyles = `
    /* ========== 配置面板容器 ========== */
    .github-i18n-config-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.55);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2147483200;
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC",
        "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial,
        sans-serif;
    }

    /* ========== 配置面板主体 ========== */
    .github-i18n-config-panel {
      background-color: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      width: 560px;
      max-width: 90%;
      max-height: 80vh;
      overflow: hidden;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
    }

    /* ========== 面板头部 ========== */
    .github-i18n-config-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background-color: #0d1117;
      border-bottom: 1px solid #21262d;
    }

    .github-i18n-config-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #e6edf3;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .github-i18n-config-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #8b949e;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.12s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .github-i18n-config-close:hover {
      background-color: #21262d;
      color: #e6edf3;
    }

    /* ========== 面板底部 ========== */
    .github-i18n-config-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      background-color: #0d1117;
      border-top: 1px solid #21262d;
    }

    .github-i18n-config-footer .github-i18n-config-footer-right {
      display: flex;
      gap: 8px;
    }
`;

/**
 * 配置界面组件样式
 * @file src/ui/styles/configUI/components.js
 */

const componentStyles = `
    /* ========== 面板内容区 ========== */
    .github-i18n-config-content {
      padding: 24px;
      max-height: calc(80vh - 120px);
      overflow-y: auto;
      display: grid;
      gap: 20px;
    }

    /* 滚动条样式 */
    .github-i18n-config-content::-webkit-scrollbar {
      width: 8px;
    }
    .github-i18n-config-content::-webkit-scrollbar-track {
      background: #010409;
    }
    .github-i18n-config-content::-webkit-scrollbar-thumb {
      background: #30363d;
      border-radius: 4px;
    }
    .github-i18n-config-content::-webkit-scrollbar-thumb:hover {
      background: #484f58;
    }

    /* ========== 配置分组 ========== */
    .github-i18n-config-section {
      background-color: #0d1117;
      border: 1px solid #21262d;
      border-radius: 8px;
      padding: 16px;
    }

    .github-i18n-config-section h4 {
      margin: 0 0 12px 0;
      font-size: 15px;
      font-weight: 600;
      color: #e6edf3;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* ========== 配置项行 ========== */
    .github-i18n-config-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px dashed #21262d;
    }

    .github-i18n-config-item:last-child {
      border-bottom: none;
    }

    .github-i18n-config-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 14px;
      color: #e6edf3;
      gap: 8px;
      flex: 1;
    }

    .github-i18n-config-label input[type="checkbox"] {
      margin: 0;
      accent-color: #2ea44f;
      width: 16px;
      height: 16px;
    }

    /* ========== 配置项提示文字 ========== */
    .github-i18n-config-hint {
      font-size: 12px;
      color: #6e7681;
      margin-top: 2px;
    }

    /* ========== 性能监控网格 ========== */
    .github-i18n-perf-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 8px;
    }

    .github-i18n-perf-stat {
      background-color: #010409;
      border: 1px solid #21262d;
      border-radius: 6px;
      padding: 8px 10px;
      text-align: left;
    }

    .github-i18n-perf-stat .k {
      font-family: "JetBrains Mono", "SF Mono", SFMono-Regular, Menlo, Consolas,
        "Courier New", monospace;
      font-size: 11px;
      color: #6e7681;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .github-i18n-perf-stat .v {
      font-size: 20px;
      font-weight: 600;
      color: #3fb950;
      margin-top: 4px;
    }

    /* ========== 高级统计区 ========== */
    .github-i18n-advanced-stats {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed #21262d;
    }

    /* ========== 操作按钮区 ========== */
    .github-i18n-config-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed #21262d;
    }
`;

/**
 * 配置界面按钮样式
 * @file src/ui/styles/configUI/buttons.js
 */

const buttonStyles = `
    .github-i18n-config-footer button {
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.12s cubic-bezier(0.22, 1, 0.36, 1);
      font-family: inherit;
    }

    .github-i18n-config-reset {
      background-color: transparent;
      color: #8b949e;
      border-color: transparent;
    }

    .github-i18n-config-reset:hover {
      background-color: #21262d;
      color: #e6edf3;
    }

    .github-i18n-config-cancel {
      background-color: transparent;
      color: #8b949e;
      border-color: transparent;
    }

    .github-i18n-config-cancel:hover {
      background-color: #21262d;
      color: #e6edf3;
    }

    .github-i18n-config-save {
      background-color: #2ea44f;
      color: #ffffff;
      border-color: rgba(240, 246, 252, 0.1);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 1px 2px rgba(0, 0, 0, 0.25);
    }

    .github-i18n-config-save:hover {
      background-color: #2c974b;
    }

    .github-i18n-config-save:active {
      background-color: #298e46;
      transform: translateY(1px);
    }

    /* ========== 浮动设置按钮 ========== */
    .github-i18n-toggle-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background-color: #2ea44f !important;
      color: #ffffff !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      border-radius: 50% !important;
      width: 56px !important;
      height: 56px !important;
      font-size: 22px !important;
      cursor: pointer !important;
      box-shadow: 0 6px 18px rgba(46, 160, 67, 0.22), 0 2px 6px rgba(0, 0, 0, 0.35) !important;
      z-index: 2147483000 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 0.2s cubic-bezier(0.22, 1, 0.36, 1) !important;
      opacity: 1 !important;
      visibility: visible !important;
      pointer-events: auto !important;
    }

    .github-i18n-toggle-btn:hover {
      background-color: #2c974b !important;
      transform: translateY(-2px) scale(1.05) !important;
      box-shadow: 0 10px 28px rgba(46, 160, 67, 0.3),
        0 4px 12px rgba(0, 0, 0, 0.35) !important;
    }

    .github-i18n-toggle-btn:active {
      transform: translateY(1px) scale(0.98) !important;
    }

    .github-i18n-config-actions button {
      flex: 1;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid #30363d;
      background-color: #161b22;
      color: #e6edf3;
      transition: all 0.12s cubic-bezier(0.22, 1, 0.36, 1);
      font-family: inherit;
    }

    .github-i18n-config-actions button:hover {
      background-color: #21262d;
      border-color: #484f58;
    }
`;

/**
 * GitHub 中文翻译配置界面样式模块
 * @file configUI.styles.js
 */

/**
 * 获取配置界面的完整样式
 * @returns {string} CSS样式字符串
 */
function getConfigUIStyles() {
  return baseStyles + componentStyles + buttonStyles;
}

/**
 * 将样式添加到页面
 */
function addConfigUIStyles() {
  const style = document.createElement('style');
  style.textContent = getConfigUIStyles();
  document.head.appendChild(style);
}

/**
 * GitHub 中文翻译性能监控组件
 * @file performanceMonitor.js
 * @version 1.9.28
 * @date 2026-09-23
 * @author Sut
 * @description 性能监控区域组件
 */

/** 无数据时按钮反馈文案的自动复位时长（毫秒） */
const NO_DATA_FEEDBACK_MS = 1500;

/**
 * 创建性能监控区域
 * @returns {HTMLElement} 性能监控区域元素
 */
function createPerformanceMonitoringSection() {
  const section = document.createElement('div');
  section.className = 'github-i18n-config-section';

  const sectionTitle = document.createElement('h4');
  sectionTitle.innerHTML = '<span style="color: #d29922;">📊</span> 性能监控';
  section.appendChild(sectionTitle);

  const perfGrid = document.createElement('div');
  perfGrid.className = 'github-i18n-perf-grid';
  perfGrid.id = 'github-i18n-performance-stats';

  const stats = [
    { key: 'duration', label: '总耗时', unit: 'ms', id: 'github-i18n-stat-duration' },
    { key: 'elements', label: '翻译项', unit: '', id: 'github-i18n-stat-elements' },
    { key: 'cacheRate', label: '命中率', unit: '%', id: 'github-i18n-stat-cache-rate' },
  ];

  stats.forEach((stat) => {
    const statDiv = document.createElement('div');
    statDiv.className = 'github-i18n-perf-stat';

    const k = document.createElement('div');
    k.className = 'k';
    k.textContent = stat.label;

    const v = document.createElement('div');
    v.className = 'v';
    v.id = stat.id;
    v.textContent = '-';

    statDiv.appendChild(k);
    statDiv.appendChild(v);
    perfGrid.appendChild(statDiv);
  });

  section.appendChild(perfGrid);

  const advancedStatsDiv = document.createElement('div');
  advancedStatsDiv.className = 'github-i18n-advanced-stats';

  const advancedStats = [
    { label: '缓存命中:', id: 'github-i18n-stat-cache-hits' },
    { label: '缓存未命中:', id: 'github-i18n-stat-cache-misses' },
    { label: 'DOM操作:', id: 'github-i18n-stat-dom' },
    { label: '网络请求:', id: 'github-i18n-stat-network' },
    { label: '批处理次数:', id: 'github-i18n-stat-batches' },
  ];

  advancedStats.forEach((stat) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'github-i18n-config-item';

    const label = document.createElement('span');
    label.className = 'github-i18n-config-label';
    label.textContent = stat.label;

    const value = document.createElement('span');
    value.id = stat.id;
    value.style.fontFamily =
      '"JetBrains Mono", "SF Mono", SFMono-Regular, Menlo, Consolas, "Courier New", monospace';
    value.style.color = '#8b949e';
    value.textContent = '-';

    itemDiv.appendChild(label);
    itemDiv.appendChild(value);
    advancedStatsDiv.appendChild(itemDiv);
  });

  section.appendChild(advancedStatsDiv);

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'github-i18n-config-actions';

  const refreshBtn = document.createElement('button');
  refreshBtn.id = 'github-i18n-refresh-stats';
  refreshBtn.textContent = '刷新性能数据';
  refreshBtn.addEventListener('click', updatePerformanceStats);

  const exportBtn = document.createElement('button');
  exportBtn.id = 'github-i18n-export-stats';
  exportBtn.textContent = '导出性能数据';
  exportBtn.addEventListener('click', () => {
    const data = exportPerformanceStats();
    if (!data) {
      const original = exportBtn.textContent;
      exportBtn.textContent = '暂无数据';
      exportBtn.disabled = true;
      setTimeout(() => {
        exportBtn.textContent = original;
        exportBtn.disabled = false;
      }, NO_DATA_FEEDBACK_MS);
    }
  });

  actionsDiv.appendChild(refreshBtn);
  actionsDiv.appendChild(exportBtn);

  section.appendChild(actionsDiv);

  return section;
}

/**
 * 更新性能统计数据显示
 */
function updatePerformanceStats() {
  if (window.isPageUnloading) return;

  if (window.translationCore && window.translationCore.getPerformanceStats) {
    const stats = window.translationCore.getPerformanceStats();

    const durationEl = document.getElementById('github-i18n-stat-duration');
    if (durationEl) durationEl.textContent = `${stats.totalDuration} ms`;

    const elementsEl = document.getElementById('github-i18n-stat-elements');
    if (elementsEl) elementsEl.textContent = stats.elementsProcessed;

    const textsEl = document.getElementById('github-i18n-stat-texts');
    if (textsEl) textsEl.textContent = stats.textsTranslated;

    const cacheRateEl = document.getElementById('github-i18n-stat-cache-rate');
    if (cacheRateEl) cacheRateEl.textContent = `${stats.cacheHitRate}%`;

    const cacheHitsEl = document.getElementById('github-i18n-stat-cache-hits');
    if (cacheHitsEl) cacheHitsEl.textContent = stats.cacheHits;

    const cacheMissesEl = document.getElementById('github-i18n-stat-cache-misses');
    if (cacheMissesEl) cacheMissesEl.textContent = stats.cacheMisses;

    const domOpsEl = document.getElementById('github-i18n-stat-dom');
    if (domOpsEl) domOpsEl.textContent = stats.domOperations;

    const networkEl = document.getElementById('github-i18n-stat-network');
    if (networkEl) networkEl.textContent = stats.networkRequests;

    const batchesEl = document.getElementById('github-i18n-stat-batches');
    if (batchesEl) batchesEl.textContent = stats.batchProcessings;
  }
}

/**
 * 导出性能数据
 * @returns {Object} 性能数据对象
 */
function exportPerformanceStats() {
  if (window.translationCore && window.translationCore.getPerformanceStats) {
    const stats = window.translationCore.getPerformanceStats();
    const exportData = {
      timestamp: new Date().toISOString(),
      version: VERSION,
      ...stats,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `github-i18n-performance-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return exportData;
  }
  return null;
}

/**
 * 配置界面数据持久化模块
 * @file src/ui/configUI/store.js
 */

const CONFIG_STORAGE_KEY = 'github-i18n-config';

const configStore = {
  loadUserSettings() {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (!saved) return {};

      // 尝试解码混淆的数据
      const decoded = utils.deobfuscateData(saved);
      if (decoded) {
        return JSON.parse(decoded);
      }

      // 如果解码失败，尝试直接解析（兼容旧格式）
      try {
        return JSON.parse(saved);
      } catch (_e) {
        return {};
      }
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 加载用户配置失败:', utils.sanitizeErrorMessage(error));
      }
      return {};
    }
  },

  saveUserSettings(settings) {
    try {
      const jsonData = JSON.stringify(settings);
      // 混淆存储配置数据
      const obfuscatedData = utils.obfuscateData(jsonData);
      localStorage.setItem(CONFIG_STORAGE_KEY, obfuscatedData);
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 保存用户配置失败:', utils.sanitizeErrorMessage(error));
      }
    }
  },

  resetUserSettings() {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  },

  mergeUserConfig(target, source) {
    const merge = (t, s) => {
      for (const key in s) {
        if (Object.prototype.hasOwnProperty.call(s, key)) {
          if (s[key] && typeof s[key] === 'object' && !Array.isArray(s[key])) {
            if (!t[key]) t[key] = {};
            merge(t[key], s[key]);
          } else {
            t[key] = s[key];
          }
        }
      }
      return t;
    };

    return merge(target, source);
  },
};

/**
 * 配置界面渲染模块
 * @file src/ui/configUI/renderer.js
 */

const configRenderer = {
  createHeader() {
    const header = document.createElement('div');
    header.className = 'github-i18n-config-header';

    const title = document.createElement('h3');
    title.textContent = 'GitHub 中文翻译';

    const versionBadge = document.createElement('span');
    versionBadge.style.fontFamily =
      '"JetBrains Mono", "SF Mono", SFMono-Regular, Menlo, Consolas, "Courier New", monospace';
    versionBadge.style.fontSize = '11px';
    versionBadge.style.color = '#6e7681';
    versionBadge.style.padding = '2px 8px';
    versionBadge.style.borderRadius = '4px';
    versionBadge.style.background = '#010409';
    versionBadge.style.border = '1px solid #21262d';
    versionBadge.textContent = `v${VERSION}`;

    const headerLeft = document.createElement('div');
    headerLeft.style.display = 'flex';
    headerLeft.style.alignItems = 'center';
    headerLeft.style.gap = '10px';
    headerLeft.appendChild(title);
    headerLeft.appendChild(versionBadge);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'github-i18n-config-close';
    closeBtn.textContent = '×';

    header.appendChild(headerLeft);
    header.appendChild(closeBtn);

    return header;
  },

  createFooter() {
    const footer = document.createElement('div');
    footer.className = 'github-i18n-config-footer';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'github-i18n-config-reset';
    resetBtn.textContent = '重置默认';

    const footerRight = document.createElement('div');
    footerRight.className = 'github-i18n-config-footer-right';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'github-i18n-config-cancel';
    cancelBtn.textContent = '取消';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'github-i18n-config-save';
    saveBtn.textContent = '保存配置';

    footerRight.appendChild(cancelBtn);
    footerRight.appendChild(saveBtn);

    footer.appendChild(resetBtn);
    footer.appendChild(footerRight);

    return footer;
  },

  createConfigSection(title, items) {
    const section = document.createElement('div');
    section.className = 'github-i18n-config-section';

    const sectionTitle = document.createElement('h4');
    sectionTitle.textContent = title;
    section.appendChild(sectionTitle);

    items.forEach((item) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'github-i18n-config-item';

      const label = document.createElement('label');
      label.className = 'github-i18n-config-label';

      const input = document.createElement('input');
      input.type = item.type;
      input.id = item.id;
      if (item.checked !== undefined) {
        input.checked = item.checked;
      }

      const textNode = document.createTextNode(item.label);

      label.appendChild(input);
      label.appendChild(textNode);
      itemDiv.appendChild(label);
      section.appendChild(itemDiv);
    });

    return section;
  },

  createContent(config) {
    const content = document.createElement('div');
    content.className = 'github-i18n-config-content';

    const basicSection = this.createConfigSection('基本设置', [
      {
        type: 'checkbox',
        id: 'github-i18n-debug-mode',
        label: '启用调试模式',
        checked: config.debugMode,
      },
      {
        type: 'checkbox',
        id: 'github-i18n-enable-partial-match',
        label: '启用部分匹配',
        checked: config.performance.enablePartialMatch,
      },
    ]);

    const updateSection = this.createConfigSection('更新设置', [
      {
        type: 'checkbox',
        id: 'github-i18n-auto-update',
        label: '自动检查更新',
        checked: config.updateCheck.enabled,
      },
    ]);

    const performanceSection = this.createConfigSection('性能设置', [
      {
        type: 'checkbox',
        id: 'github-i18n-translation-cache',
        label: '启用翻译缓存',
        checked: config.performance.enableTranslationCache,
      },
      {
        type: 'checkbox',
        id: 'github-i18n-virtual-dom',
        label: '启用虚拟DOM优化',
        checked: config.performance.enableVirtualDom,
      },
    ]);

    const monitoringSection = createPerformanceMonitoringSection();

    content.appendChild(basicSection);
    content.appendChild(updateSection);
    content.appendChild(performanceSection);
    content.appendChild(monitoringSection);

    return content;
  },
};

/**
 * 配置界面启动引导模块
 * @file src/ui/configUI/bootstrap.js
 * @description 负责浮动入口按钮注入、用户脚本菜单注册与清理
 */

/** 浮动按钮元素 ID（语义化，便于脚本选取与测试定位） */
const FLOATING_BUTTON_ID = 'github-i18n-floating-button';

const FLOATING_BUTTON_STYLE_ID = 'github-i18n-floating-button-style';

const FLOATING_BUTTON_STYLES = `
#${FLOATING_BUTTON_ID} {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid #2ea44f;
  background: #0d1117;
  color: #2ea44f;
  font-size: 20px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  z-index: 2147483646;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  transition: transform 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}
#${FLOATING_BUTTON_ID}:hover {
  transform: scale(1.08);
  background: #2ea44f;
  color: #ffffff;
}
#${FLOATING_BUTTON_ID}:focus-visible {
  outline: 2px solid #3fb950;
  outline-offset: 2px;
}
`;

const configBootstrap = {
  /**
   * 注入浮动按钮所需样式（幂等）
   */
  injectStyles() {
    if (document.getElementById(FLOATING_BUTTON_STYLE_ID)) {
      return;
    }
    const style = document.createElement('style');
    style.id = FLOATING_BUTTON_STYLE_ID;
    style.textContent = FLOATING_BUTTON_STYLES;
    document.head.appendChild(style);
  },

  /**
   * 创建页面右下角浮动入口按钮
   * @param {Function} onClick - 点击回调
   * @returns {HTMLButtonElement} 按钮元素
   */
  createFloatingButton(onClick) {
    this.injectStyles();

    const existing = document.getElementById(FLOATING_BUTTON_ID);
    if (existing) {
      return existing;
    }

    const button = document.createElement('button');
    button.id = FLOATING_BUTTON_ID;
    button.type = 'button';
    button.title = '打开 GitHub 中文翻译设置';
    button.setAttribute('aria-label', '打开 GitHub 中文翻译设置');
    button.textContent = '中';
    button.addEventListener('click', onClick);

    document.body.appendChild(button);
    return button;
  },

  /**
   * 移除浮动入口按钮
   */
  removeFloatingButton() {
    const button = document.getElementById(FLOATING_BUTTON_ID);
    if (button && button.parentNode) {
      button.parentNode.removeChild(button);
    }
  },

  /**
   * 注册用户脚本管理器菜单命令（管理器不支持时静默跳过）
   * @param {{open: Function, translate: Function}} handlers - 菜单回调
   */
  registerMenuCommands(handlers) {
    if (typeof GM_registerMenuCommand !== 'function') {
      return;
    }

    try {
      GM_registerMenuCommand('打开配置面板', handlers.open);
      GM_registerMenuCommand('立即翻译页面', handlers.translate);
    } catch (_error) {
      // 菜单注册失败不影响主流程
    }
  },
};

/**
 * GitHub 中文翻译配置界面模块
 * @file configUI.js
 */

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

  /**
   * 初始化配置界面：合并用户配置、注册脚本菜单、创建浮动入口按钮
   */
  init() {
    this.mergeUserConfig();

    configBootstrap.registerMenuCommands({
      open: () => this.show(),
      translate: () => window.GitHub_i18n?.translationCore?.translate?.(),
    });

    configBootstrap.createFloatingButton(() => this.toggle());
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
    configBootstrap.removeFloatingButton();
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

/** 全局配置界面单例（供脚本生命周期与菜单调用） */
const configUI = new ConfigUI();

/**
 * 版本工具模块
 * @file versionUtils.js
 * @version 1.9.24
 * @date 2026-09-19
 * @author Sut
 * @description 版本比较、提取等工具函数
 */

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
 * 更新通知数据持久化模块
 * @file src/updateNotification/store.js
 */

const NOTIFICATION_DISMISSED_KEY = 'githubZhUpdateNotificationDismissed';
const LAST_NOTIFIED_VERSION_KEY = 'githubZhLastNotifiedVersion';
const VERSION_HISTORY_KEY = 'githubZhVersionHistory';
const MAX_HISTORY_LENGTH = 10;

const updateStore = {
  isDismissed() {
    return localStorage.getItem(NOTIFICATION_DISMISSED_KEY) === 'dismissed';
  },

  setDismissed() {
    localStorage.setItem(NOTIFICATION_DISMISSED_KEY, 'dismissed');
  },

  getLastNotifiedVersion() {
    return localStorage.getItem(LAST_NOTIFIED_VERSION_KEY);
  },

  setLastNotifiedVersion(version) {
    localStorage.setItem(LAST_NOTIFIED_VERSION_KEY, version);
  },

  clearNotificationDismissal() {
    try {
      localStorage.removeItem(NOTIFICATION_DISMISSED_KEY);
      localStorage.removeItem(LAST_NOTIFIED_VERSION_KEY);
      return true;
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 清除通知忽略状态失败:', error);
      }
      return false;
    }
  },

  recordVersionHistory(version) {
    try {
      let history = utils.safeJSONParse(localStorage.getItem(VERSION_HISTORY_KEY), []);
      if (!Array.isArray(history)) history = [];

      history.push({
        version,
        detectedAt: Date.now(),
      });

      if (history.length > MAX_HISTORY_LENGTH) {
        history = history.slice(-MAX_HISTORY_LENGTH);
      }

      localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(history));
    } catch (_error) {
      // 忽略存储错误
    }
  },
};

/**
 * 更新通知渲染模块
 * @file src/updateNotification/renderer.js
 */

const updateRenderer = {
  createNotification(newVersion, onHide) {
    const notification = document.createElement('div');
    notification.className =
      'fixed bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg z-50 max-w-md transform transition-all duration-300 translate-y-0 opacity-100';

    const notificationId = `github-zh-update-${Date.now()}`;
    notification.id = notificationId;

    const flexContainer = document.createElement('div');
    flexContainer.className = 'flex items-start';
    notification.appendChild(flexContainer);

    const iconContainer = document.createElement('div');
    iconContainer.className = 'flex-shrink-0 bg-blue-100 rounded-full p-2';
    flexContainer.appendChild(iconContainer);

    const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgIcon.setAttribute('class', 'h-6 w-6 text-blue-600');
    svgIcon.setAttribute('fill', 'none');
    svgIcon.setAttribute('viewBox', '0 0 24 24');
    svgIcon.setAttribute('stroke', 'currentColor');
    iconContainer.appendChild(svgIcon);

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElement.setAttribute('stroke-linecap', 'round');
    pathElement.setAttribute('stroke-linejoin', 'round');
    pathElement.setAttribute('stroke-width', '2');
    pathElement.setAttribute('d', 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z');
    svgIcon.appendChild(pathElement);

    const contentContainer = document.createElement('div');
    contentContainer.className = 'ml-3 flex-1';
    flexContainer.appendChild(contentContainer);

    const titleElement = document.createElement('p');
    titleElement.className = 'text-sm font-medium text-blue-800';
    titleElement.textContent = 'GitHub 中文翻译脚本更新';
    contentContainer.appendChild(titleElement);

    const messageElement = document.createElement('p');
    messageElement.className = 'text-sm text-blue-700 mt-1';
    messageElement.textContent = `发现新版本 ${newVersion}，建议更新以获得更好的翻译体验。`;
    contentContainer.appendChild(messageElement);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'mt-3 flex space-x-2';
    contentContainer.appendChild(buttonsContainer);

    const updateButton = document.createElement('a');
    updateButton.id = `${notificationId}-update-btn`;
    updateButton.href = CONFIG.updateCheck.scriptUrl || '#';
    updateButton.target = '_blank';
    updateButton.rel = 'noopener noreferrer';
    updateButton.className =
      'inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors';
    updateButton.textContent = '立即更新';
    buttonsContainer.appendChild(updateButton);

    const laterButton = document.createElement('button');
    laterButton.id = `${notificationId}-later-btn`;
    laterButton.className =
      'inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-transparent hover:bg-blue-50 transition-colors';
    laterButton.textContent = '稍后';
    laterButton.addEventListener('click', () => {
      onHide(notification, false);
    });
    buttonsContainer.appendChild(laterButton);

    const dismissButton = document.createElement('button');
    dismissButton.id = `${notificationId}-dismiss-btn`;
    dismissButton.className =
      'inline-flex items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors';
    dismissButton.textContent = '不再提醒';
    dismissButton.addEventListener('click', () => {
      onHide(notification, true);
    });
    buttonsContainer.appendChild(dismissButton);

    return notification;
  },
};

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
 * 版本检查请求模块
 * @file src/versionChecker/fetcher.js
 */

const FETCH_TIMEOUT_MS = 8000;
const EXPONENTIAL_BASE = 2;

const KNOWN_SCRIPT_HASHES = {
  'https://github.com/Tanox/GitHub_i18n/raw/main/build/GitHub_zh-cn.user.js':
    'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
};

const versionFetcher = {
  async fetchWithRetry(url, maxRetries = 2, retryDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (CONFIG.debugMode && attempt > 0) {
          console.log(`[GitHub 中文翻译] 重试更新检查 (${attempt}/${maxRetries})...`);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            Accept: 'text/javascript, text/plain, */*',
          },
          signal: controller.signal,
          credentials: 'omit',
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }

        const scriptContent = await response.text();

        if (KNOWN_SCRIPT_HASHES[url]) {
          const isValid = await this.verifyScriptIntegrity(scriptContent, url);
          if (!isValid) {
            if (CONFIG.debugMode) {
              console.warn('[GitHub 中文翻译] 脚本完整性验证失败，可能存在安全风险');
            }
          }
        }

        return scriptContent;
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          throw error;
        }

        await utils.delay(retryDelay * Math.pow(EXPONENTIAL_BASE, attempt));
      }
    }

    throw lastError;
  },

  async verifyScriptIntegrity(scriptContent, url) {
    try {
      const expectedHash = KNOWN_SCRIPT_HASHES[url];
      if (!expectedHash) {
        return true;
      }

      const actualHash = await utils.sha256Hash(scriptContent);
      const isValid = actualHash === expectedHash;

      if (CONFIG.debugMode) {
        console.log(`[GitHub 中文翻译] 脚本完整性验证: ${isValid ? '通过' : '失败'}`);
      }

      return isValid;
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 脚本完整性验证出错:', utils.sanitizeErrorMessage(error));
      }
      return false;
    }
  },
};

/**
 * 版本更新检查模块
 * @file versionChecker.js
 */

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
 * DOM观察器阈值常量
 * @file src/page-monitor/domObserver/constants.js
 */

const PAGE_MODE_THRESHOLDS = {
  issues: { contentWeight: 1, importantWeight: 2, minContent: 3 },
  pullRequests: { contentWeight: 1, importantWeight: 2, minContent: 3 },
  wiki: { contentWeight: 1, importantWeight: 2, minContent: 4 },
  search: { contentWeight: 1, importantWeight: 2, minContent: 3 },
  codespaces: { contentWeight: 1, importantWeight: 2, minContent: 2 },
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
 * DOM观察器元素检查模块
 * @file src/page-monitor/domObserver/elementChecker.js
 */

function isElementIgnored(target, ignoreElements, elementCheckCache, pageMode) {
  if (target.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  const element = target;

  if (elementCheckCache && elementCheckCache.has(element)) {
    return elementCheckCache.get(element);
  }

  let shouldIgnore = ignoreElements.some((selector) => {
    try {
      return element.matches(selector);
    } catch (_e) {
      return false;
    }
  });

  if (!shouldIgnore && pageMode) {
    switch (pageMode) {
      case 'codespaces':
        shouldIgnore =
          element.classList.contains('terminal') ||
          element.tagName === 'PRE' ||
          element.classList.contains('command-input');
        break;
      case 'wiki':
        if (element.tagName === 'PRE' && element.classList.contains('codehilite')) {
          shouldIgnore = true;
        }
        break;
      case 'search':
        if (element.tagName === 'CODE' && !element.classList.contains('search-match')) {
          shouldIgnore = true;
        }
        break;
      default:
        break;
    }
  }

  if (elementCheckCache) {
    elementCheckCache.set(element, shouldIgnore);
  }

  return shouldIgnore;
}

function isElementImportant(target, importantElements, elementCheckCache, pageMode) {
  if (pageMode && pageAnalyzer.shouldSkipElementByPageMode(target, pageMode)) {
    return false;
  }

  if (elementCheckCache && elementCheckCache.has(target)) {
    return elementCheckCache.get(target);
  }

  let isImportant = importantElements.some((selector) => {
    try {
      return target.matches(selector);
    } catch (_e) {
      return false;
    }
  });

  if (!isImportant && pageMode) {
    switch (pageMode) {
      case 'issues':
      case 'pullRequests':
        isImportant =
          target.classList.contains('comment-body') ||
          target.classList.contains('timeline-comment-header');
        break;
      case 'wiki':
        isImportant =
          target.classList.contains('markdown-body') ||
          target.tagName === 'H1' ||
          target.tagName === 'H2';
        break;
      case 'search':
        isImportant = target.classList.contains('search-match') || target.classList.contains('f4');
        break;
      case 'codespaces':
        isImportant = target.classList.contains('codespace-status');
        break;
      default:
        break;
    }
  }

  if (elementCheckCache) {
    elementCheckCache.set(target, isImportant);
  }

  return isImportant;
}

/**
 * DOM观察器变化分析模块
 * @file src/page-monitor/domObserver/mutationAnalyzer.js
 */

function isMutationContentRelated(mutation, pageMode) {
  try {
    if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
      const oldValue = mutation.oldValue || '';
      const newValue = mutation.target.textContent || '';

      if (oldValue.trim() === newValue.trim()) {
        return false;
      }

      const minLength = pageAnalyzer.getMinTextLengthByPageMode(pageMode);
      return (
        oldValue !== newValue &&
        (newValue.length >= minLength ||
          oldValue.length >= minLength ||
          Math.abs(newValue.length - oldValue.length) >= 3)
      );
    }

    if (
      mutation.type === 'childList' &&
      (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)
    ) {
      return Array.from(mutation.addedNodes).some((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node;
          if (
            element.tagName === 'SCRIPT' ||
            element.tagName === 'STYLE' ||
            element.tagName === 'META'
          ) {
            return false;
          }
          if (pageMode) {
            switch (pageMode) {
              case 'issues':
              case 'pullRequests':
                return (
                  element.classList.contains('comment-body') ||
                  element.classList.contains('timeline-comment') ||
                  element.classList.contains('js-issue-title')
                );
              case 'wiki':
                return (
                  element.classList.contains('markdown-body') || /^H[1-6]$/.test(element.tagName)
                );
              case 'codespaces':
                if (
                  element.classList.contains('terminal') ||
                  element.classList.contains('command-input')
                ) {
                  return false;
                }
                break;
              case 'search':
                return (
                  element.classList.contains('search-result') ||
                  element.classList.contains('search-match')
                );
              default:
                return false;
            }
          }
          return true;
        }
        return node.nodeType === Node.TEXT_NODE;
      });
    }

    return false;
  } catch (_error) {
    return false;
  }
}

function calculateMutationWeights(mutation, pageMode, elementCheckCache) {
  const config = PAGE_MODE_THRESHOLDS[pageMode] || PAGE_MODE_THRESHOLDS.search;
  let contentChanges = 0;
  let importantChanges = 0;
  let shouldTrigger = false;

  if (mutation.target) {
    const isIgnored = isElementIgnored(mutation.target, [], elementCheckCache, pageMode);

    if (!isIgnored) {
      const isImportant = isElementImportant(mutation.target, [], elementCheckCache, pageMode);

      if (isImportant) {
        shouldTrigger = true;
      }
    }

    if (mutation.type === 'attributes') {
      const importantAttributes = ['id', 'class', 'href', 'title'];
      if (importantAttributes.includes(mutation.attributeName)) {
        importantChanges++;
        if (importantChanges >= 3) {
          shouldTrigger = true;
        }
      }
    }

    if (isMutationContentRelated(mutation, pageMode)) {
      contentChanges++;
      if (contentChanges >= Math.max(5, config.minContent)) {
        shouldTrigger = true;
      }
    }
  }

  return { shouldTrigger, contentChanges, importantChanges };
}

function processMutationBatch(mutations, maxCheckCount, pageMode) {
  const elementCheckCache = new WeakMap();
  let totalContentChanges = 0;
  let totalImportantChanges = 0;

  for (let i = 0; i < maxCheckCount; i++) {
    const mutation = mutations[i];

    if (mutation.type === 'characterData' && CONFIG.performance?.ignoreCharacterDataMutations) {
      continue;
    }
    if (mutation.type === 'attributes' && CONFIG.performance?.ignoreAttributeMutations) {
      continue;
    }

    const result = calculateMutationWeights(mutation, pageMode, elementCheckCache);
    totalContentChanges += result.contentChanges;
    totalImportantChanges += result.importantChanges;

    if (result.shouldTrigger) {
      return {
        shouldTrigger: true,
        contentChanges: totalContentChanges,
        importantChanges: totalImportantChanges,
      };
    }
  }

  return {
    shouldTrigger: false,
    contentChanges: totalContentChanges,
    importantChanges: totalImportantChanges,
  };
}

function checkWeightedThreshold(contentChanges, importantChanges, maxCheckCount, pageMode) {
  const config = PAGE_MODE_THRESHOLDS[pageMode] || PAGE_MODE_THRESHOLDS.search;
  const minContentChanges = config.minContent;

  if (contentChanges < minContentChanges) {
    return false;
  }

  const weightedChanges =
    contentChanges * config.contentWeight + importantChanges * config.importantWeight;
  const threshold = pageAnalyzer.getModeSpecificThreshold(pageMode) || 0.3;

  return weightedChanges / maxCheckCount > threshold;
}

/**
 * DOM观察器工具函数模块
 * @file domObserver.utils.js
 */

/**
 * DOM观察器配置与节点选择模块
 * @file src/page-monitor/domObserver.config.js
 */

const domObserverConfig = {
  selectOptimalRootNode(pageMode) {
    const effectivePageMode = pageMode || translationCore.detectPageMode();
    let candidateSelectors;

    switch (effectivePageMode) {
      case 'search':
        candidateSelectors = ['.codesearch-results', '#js-pjax-container', 'main', 'body'];
        break;
      case 'issues':
      case 'pullRequests':
        candidateSelectors = [
          '.js-discussion',
          '.issue-details',
          '#js-issue-title',
          '#js-pjax-container',
          'main',
          'body',
        ];
        break;
      case 'repository':
        candidateSelectors = [
          '#js-repo-pjax-container',
          '.repository-content',
          '.application-main',
          'body',
        ];
        break;
      case 'notifications':
        candidateSelectors = [
          '.notifications-list',
          '.notification-shelf',
          '#js-pjax-container',
          'main',
          'body',
        ];
        break;
      case 'wiki':
        candidateSelectors = [
          '.wiki-wrapper',
          '.markdown-body',
          '#js-pjax-container',
          'main',
          'body',
        ];
        break;
      case 'actions':
        candidateSelectors = [
          '.workflow-run-list',
          '.workflow-jobs',
          '.workflow-run-header',
          '#js-pjax-container',
          'main',
          'body',
        ];
        break;
      case 'projects':
        candidateSelectors = [
          '.project-layout',
          '.project-columns',
          '#js-pjax-container',
          'main',
          'body',
        ];
        break;
      default:
        candidateSelectors = ['#js-pjax-container', 'main', '.application-main', 'body'];
    }

    for (const selector of candidateSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim().length > 0) {
        return element;
      }
    }

    return document.body;
  },

  getOptimizedObserverConfig(inputPageMode) {
    const pageMode = inputPageMode || translationCore.detectPageMode();
    const baseConfig = { childList: true };

    if (!CONFIG.performance?.ignoreCharacterDataMutations) {
      baseConfig.characterData = true;
    }

    const complexPages = ['wiki', 'issues', 'pullRequests', 'markdown'];
    const simplePages = ['search', 'codespaces', 'marketplace'];

    if (complexPages.includes(pageMode)) {
      baseConfig.subtree = CONFIG.performance?.observeSubtree;
    } else if (simplePages.includes(pageMode)) {
      baseConfig.subtree = false;
    } else {
      baseConfig.subtree = CONFIG.performance?.observeSubtree;
    }

    if (CONFIG.performance?.observeAttributes && !CONFIG.performance?.ignoreAttributeMutations) {
      baseConfig.attributes = true;
      baseConfig.attributeFilter = CONFIG.performance?.importantAttributes || [
        'id',
        'class',
        'href',
        'title',
      ];
    }

    return baseConfig;
  },
};

/**
 * DOM观察器启动模块
 * @file src/page-monitor/domObserver/setup.js
 */

function setupDomObserver(domObserver, translationTriggerCallback) {
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

function setupFallbackMonitoring() {
  if (CONFIG.debugMode) {
    console.log('[GitHub 中文翻译] 使用降级监控方案');
  }
}

/**
 * DOM观察器触发逻辑模块
 * @file src/page-monitor/domObserver/trigger.js
 */

function shouldTriggerTranslation(mutations, inputPageMode) {
  const pageMode = inputPageMode || translationCore.detectPageMode();
  try {
    if (!mutations || mutations.length === 0) {
      return false;
    }

    const { mutationThreshold = 30, maxMutationProcessing = 50 } = CONFIG.performance || {};

    const quickPathThreshold = pageAnalyzer.getQuickPathThresholdByPageMode(pageMode);
    if (mutations.length <= quickPathThreshold) {
      return detectImportantChanges(mutations, pageMode);
    }

    const maxCheckCount = Math.min(
      mutations.length,
      Math.max(mutationThreshold, maxMutationProcessing),
    );

    const batchResult = processMutationBatch(
      mutations.slice(0, maxCheckCount),
      maxCheckCount,
      pageMode,
    );

    if (batchResult.shouldTrigger) {
      return true;
    }

    return checkWeightedThreshold(
      batchResult.contentChanges,
      batchResult.importantChanges,
      maxCheckCount,
      pageMode,
    );
  } catch (error) {
    console.error('[GitHub 中文翻译] 判断翻译触发条件时出错:', error);
    return false;
  }
}

function detectImportantChanges(mutations, pageMode) {
  for (const mutation of mutations) {
    if (mutation.target && mutation.target.nodeType === Node.ELEMENT_NODE) {
      if (isElementImportant(mutation.target, [], new WeakMap(), pageMode)) {
        return true;
      }
    }
    if (isMutationContentRelated(mutation, pageMode)) {
      return true;
    }
  }
  return false;
}

/**
 * DOM变化观察器模块
 * @file pageMonitor/domObserver.js
 */

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
 * 脚本生命周期管理器
 * @file src/main/lifecycle.js
 */

const lifecycleManager = {
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

      window.removeEventListener('beforeunload', this.cleanup.bind(this));
      window.removeEventListener('unload', this.cleanup.bind(this));

      if (window.visibilityChangeHandler) {
        document.removeEventListener('visibilitychange', window.visibilityChangeHandler);
        window.visibilityChangeHandler = null;
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
        translationCore.translate();
      }

      if (typeof pageMonitor !== 'undefined' && typeof pageMonitor.init === 'function') {
        pageMonitor.init();
      }

      if (typeof configUI !== 'undefined' && typeof configUI.init === 'function') {
        configUI.init();
      }

      window.addEventListener('beforeunload', this.cleanup.bind(this));
      window.addEventListener('unload', this.cleanup.bind(this));

      const visibilityChangeHandler = () => {
        if (document.visibilityState === 'hidden') {
          if (translationCore && typeof translationCore.cleanCache === 'function') {
            translationCore.cleanCache();
          }
        }
      };
      document.addEventListener('visibilitychange', visibilityChangeHandler);
      window.visibilityChangeHandler = visibilityChangeHandler;
    } catch (error) {
      console.error('[GitHub 中文翻译] 脚本初始化失败:', error);
    }
  },

  startScript() {
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

/**
 * GitHub 中文翻译主入口文件
 * @file main.js
 */

// 初始化函数
const init = () => lifecycleManager.init();
const cleanup = () => lifecycleManager.cleanup();
const startScript = () => lifecycleManager.startScript();

// 导出函数

// 对外暴露运行实例（错误处理器的词典恢复与脚本菜单依赖此命名空间）
if (typeof window !== 'undefined') {
  window.GitHub_i18n = { translationCore, configUI };

  if (CONFIG.debugMode) {
    window.translationCore = translationCore;
    window.configUI = configUI;
  }
}

// 启动脚本
startScript();

/**
 * 字符串提取工具
 * @file src/utils/tools/stringExtractor.js
 */

const stringExtractor = {
  collectStrings(showInConsole = true) {
    const strings = new Set();
    utils.collectTextNodes(document.body, strings);

    if (showInConsole) {
      console.log(`[GitHub 中文翻译] 收集到 ${strings.size} 个字符串`);
      console.log('收集到的字符串:', strings);
    }

    return strings;
  },

  findUntranslatedStrings(showInConsole = true) {
    const allStrings = this.collectStrings(false);
    const untranslated = new Set();

    const mergedDictionary = {};
    for (const module in translationModule) {
      if (Object.prototype.hasOwnProperty.call(translationModule, module)) {
        Object.assign(mergedDictionary, translationModule[module]);
      }
    }

    allStrings.forEach((string) => {
      if (!mergedDictionary[string] || mergedDictionary[string].startsWith('待翻译: ')) {
        untranslated.add(string);
      }
    });

    if (showInConsole) {
      console.log(`[GitHub 中文翻译] 找到 ${untranslated.size} 个未翻译的字符串`);
      console.log('未翻译的字符串:', untranslated);
    }

    return untranslated;
  },
};

/**
 * 自动字符串更新工具
 * @file src/utils/tools/autoUpdater.js
 * @version 1.9.24
 */

class AutoStringUpdater {
  static findStringsToAdd() {
    const untranslated = stringExtractor.findUntranslatedStrings(false);
    return new Set(Array.from(untranslated).filter((str) => !str.startsWith('待翻译: ')));
  }

  static generateUpdateReport() {
    const stringsToAdd = AutoStringUpdater.findStringsToAdd();
    return {
      timestamp: new Date().toISOString(),
      pageUrl: window.location.href,
      pageTitle: document.title,
      stringsToAdd: Array.from(stringsToAdd),
      totalNew: stringsToAdd.size,
    };
  }

  static showReportInConsole() {
    const report = AutoStringUpdater.generateUpdateReport();
    console.log('[GitHub 中文翻译] 字符串更新报告');
    console.log(`📄 页面: ${report.pageTitle}`);
    console.log(`✅ 找到 ${report.totalNew} 个新字符串`);
  }
}

/**
 * 词典处理工具
 * @file src/utils/tools/dictionaryProcessor.js
 * @version 1.9.24
 */

class DictionaryProcessor {
  static mergeDictionaries() {
    const merged = {};
    for (const module in translationModule) {
      if (Object.prototype.hasOwnProperty.call(translationModule, module)) {
        Object.assign(merged, translationModule[module]);
      }
    }
    return merged;
  }

  static validateDictionary() {
    const dictionary = DictionaryProcessor.mergeDictionaries();
    const total = Object.keys(dictionary).length;
    const untranslated = Array.from(stringExtractor.findUntranslatedStrings(false)).length;
    return {
      totalEntries: total,
      translatedEntries: total - untranslated,
      completionRate: total > 0 ? (((total - untranslated) / total) * 100).toFixed(2) : '0.00',
    };
  }

  static showStatisticsInConsole() {
    const stats = DictionaryProcessor.validateDictionary();
    console.log('[GitHub 中文翻译] 词典统计');
    console.log(`📊 总条目数: ${stats.totalEntries}`);
    console.log(`✅ 已翻译条目: ${stats.translatedEntries}`);
    console.log(`📈 完成率: ${stats.completionRate}%`);
  }
}

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
}})();
