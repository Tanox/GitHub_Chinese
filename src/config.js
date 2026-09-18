/**
 * GitHub 中文翻译配置文件
 * @file config.js
 */

import { VERSION } from './version.js';
import { performanceConfig } from './config/performance.js';
import { selectorsConfig, pagePatternsConfig } from './config/selectors.js';

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
export const CONFIG = {
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

export { getVersionFromComment };
