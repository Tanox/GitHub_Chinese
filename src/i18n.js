/**
 * 国际化支持框架
 * @file i18n.js
 */

import { I18nManager } from './i18n/manager.js';
import { builtinTranslations } from './i18n/translations.js';

// 创建全局国际化管理器实例
const i18nManager = new I18nManager();

/**
 * 翻译函数快捷方式
 * @param {string} key - 翻译键
 * @param {Object} params - 参数对象
 * @returns {string} 翻译文本
 */
function t(key, params = {}) {
  return i18nManager.t(key, params);
}

/**
 * 初始化国际化支持
 * @param {string} defaultLocale - 默认语言
 * @param {string} fallbackLocale - 回退语言
 * @returns {Promise<boolean>} 初始化是否成功
 */
async function initI18n(defaultLocale = 'zh-CN', fallbackLocale = 'en-US') {
  i18nManager.init(defaultLocale, fallbackLocale);

  // 加载中文翻译
  await loadLocaleTranslations('zh-CN');

  // 加载英文翻译
  await loadLocaleTranslations('en-US');

  // 如果当前语言不是中文或英文，尝试加载对应翻译
  if (i18nManager.getCurrentLocale() !== 'zh-CN' && i18nManager.getCurrentLocale() !== 'en-US') {
    await loadLocaleTranslations(i18nManager.getCurrentLocale());
  }

  return true;
}

/**
 * 加载指定语言的翻译
 * @param {string} locale - 语言代码
 * @returns {Promise<boolean>} 加载是否成功
 */
function loadLocaleTranslations(locale) {
  const translations = builtinTranslations[locale] || {};
  return i18nManager.loadTranslations(locale, translations);
}

/**
 * 切换语言
 * @param {string} locale - 语言代码
 * @returns {Promise<boolean>} 切换是否成功
 */
async function switchLanguage(locale) {
  // 如果语言未加载，尝试加载
  if (!i18nManager.getLoadedLocales().includes(locale)) {
    const success = await loadLocaleTranslations(locale);
    if (!success) {
      console.error(`无法加载语言: ${locale}`);
      return false;
    }
  }

  return i18nManager.setLocale(locale);
}

// ES6模块导出
export { I18nManager, i18nManager, t, initI18n, loadLocaleTranslations, switchLanguage };
