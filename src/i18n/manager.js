/**
 * 国际化管理器类
 * @file src/i18n/manager.js
 * @version 1.9.24
 * @description 语言加载、翻译查询与语言切换；查询/插值、持久化、观察者与格式化拆分到同目录子模块
 */

import { DEFAULT_LOCALE, FALLBACK_LOCALE } from './constants.js';
import { readBrowserLocale, readSavedLocale, saveLocale } from './storage.js';
import { addObserver, notifyObservers, removeObserver } from './observers.js';
import { formatDate, formatNumber, formatRelativeTime } from './formatters.js';
import { getTranslationByKey, interpolate, resolveTranslation } from './lookup.js';
import { loadTranslations, loadTranslationsAsync } from './loader.js';

export class I18nManager {
  constructor() {
    this.currentLocale = DEFAULT_LOCALE;
    this.fallbackLocale = FALLBACK_LOCALE;
    this.translations = new Map();
    this.loadedLocales = new Set();
    this.observers = [];
  }

  /**
   * 初始化国际化管理器（优先本地存储偏好，其次浏览器语言）
   * @param {string} defaultLocale - 默认语言
   * @param {string} fallbackLocale - 回退语言
   */
  init(defaultLocale = DEFAULT_LOCALE, fallbackLocale = FALLBACK_LOCALE) {
    this.currentLocale = defaultLocale;
    this.fallbackLocale = fallbackLocale;

    const savedLocale = readSavedLocale();
    const browserLocale = readBrowserLocale();

    if (savedLocale) {
      this.currentLocale = savedLocale;
    } else if (browserLocale) {
      this.currentLocale = browserLocale;
    }

    console.log(`国际化管理器已初始化，当前语言: ${this.currentLocale}`);
  }

  /**
   * 加载翻译数据
   * @param {string} locale - 语言代码
   * @param {Object} translations - 翻译对象
   * @returns {boolean} 是否加载成功
   */
  loadTranslations(locale, translations) {
    return loadTranslations(this, locale, translations);
  }

  /**
   * 通过 URL 异步加载翻译
   * @param {string} locale - 语言代码
   * @param {string} url - 翻译文件 URL
   * @returns {Promise<boolean>} 是否加载成功
   */
  async loadTranslationsAsync(locale, url) {
    return loadTranslationsAsync(this, locale, url);
  }

  /**
   * 获取翻译文本
   * @param {string} key - 翻译键
   * @param {Object} [params] - 插值参数
   * @param {string} [locale] - 指定语言（可选）
   * @returns {string} 翻译文本，未命中时返回键名
   */
  t(key, params = {}, locale = null) {
    const targetLocale = locale || this.currentLocale;
    const translation = resolveTranslation(
      this.translations,
      key,
      targetLocale,
      this.fallbackLocale,
    );

    if (!translation) {
      console.warn(`未找到翻译: ${key} (${targetLocale})`);
      return key;
    }

    return interpolate(translation, params);
  }

  /**
   * 根据键获取指定语言的翻译
   * @param {string} key - 翻译键
   * @param {string} locale - 语言代码
   * @returns {string|null} 翻译文本
   */
  getTranslationByKey(key, locale) {
    return getTranslationByKey(this.translations, key, locale);
  }

  /** 插值处理（保留为静态 API，实现见 lookup.js） */
  static interpolate(template, params) {
    return interpolate(template, params);
  }

  /**
   * 设置当前语言
   * @param {string} locale - 语言代码
   * @returns {boolean} 设置是否成功
   */
  setLocale(locale) {
    if (!this.loadedLocales.has(locale)) {
      console.warn(`语言未加载: ${locale}`);
      return false;
    }

    const oldLocale = this.currentLocale;
    this.currentLocale = locale;

    saveLocale(locale);
    notifyObservers(this.observers, locale, oldLocale);

    console.log(`语言已更改: ${oldLocale} -> ${locale}`);
    return true;
  }

  /** 获取当前语言 @returns {string} 当前语言代码 */
  getCurrentLocale() {
    return this.currentLocale;
  }

  /** 获取已加载的语言列表 @returns {Array<string>} 语言代码列表 */
  getLoadedLocales() {
    return Array.from(this.loadedLocales);
  }

  /**
   * 添加语言变更观察者
   * @param {Function} observer - 观察者函数
   */
  addObserver(observer) {
    addObserver(this.observers, observer);
  }

  /**
   * 移除语言变更观察者
   * @param {Function} observer - 观察者函数
   */
  removeObserver(observer) {
    removeObserver(this.observers, observer);
  }

  /**
   * 通知所有观察者
   * @param {string} newLocale - 新语言
   * @param {string} oldLocale - 旧语言
   */
  notifyObservers(newLocale, oldLocale) {
    notifyObservers(this.observers, newLocale, oldLocale);
  }

  /**
   * 格式化日期
   * @param {Date} date - 日期对象
   * @param {Object} [options] - 格式化选项
   * @param {string} [locale] - 语言代码（可选）
   * @returns {string} 格式化后的日期字符串
   */
  formatDate(date, options = {}, locale = null) {
    return formatDate(date, options, locale || this.currentLocale);
  }

  /**
   * 格式化数字
   * @param {number} number - 数字
   * @param {Object} [options] - 格式化选项
   * @param {string} [locale] - 语言代码（可选）
   * @returns {string} 格式化后的数字字符串
   */
  formatNumber(number, options = {}, locale = null) {
    return formatNumber(number, options, locale || this.currentLocale);
  }

  /**
   * 格式化相对时间
   * @param {Date} date - 日期对象
   * @param {string} [locale] - 语言代码（可选）
   * @returns {string} 相对时间字符串
   */
  formatRelativeTime(date, locale = null) {
    return formatRelativeTime(date, locale || this.currentLocale);
  }
}
