/**
 * 国际化管理器类
 * @file src/i18n/manager.js
 */

export class I18nManager {
  constructor() {
    this.currentLocale = 'zh-CN'; // 默认中文
    this.fallbackLocale = 'en-US'; // 回退语言
    this.translations = new Map(); // 存储所有翻译
    this.loadedLocales = new Set(); // 已加载的语言
    this.observers = []; // 语言变更观察者
  }

  /**
   * 初始化国际化管理器
   * @param {string} defaultLocale - 默认语言
   * @param {string} fallbackLocale - 回退语言
   */
  init(defaultLocale = 'zh-CN', fallbackLocale = 'en-US') {
    this.currentLocale = defaultLocale;
    this.fallbackLocale = fallbackLocale;

    // 尝试从本地存储获取用户语言偏好
    if (typeof localStorage !== 'undefined') {
      const savedLocale = localStorage.getItem('github-i18n-locale');
      if (savedLocale) {
        this.currentLocale = savedLocale;
      } else {
        // 尝试从浏览器语言设置获取
        const browserLocale = navigator.language || navigator.userLanguage;
        if (browserLocale) {
          this.currentLocale = browserLocale;
        }
      }
    }

    console.log(`国际化管理器已初始化，当前语言: ${this.currentLocale}`);
  }

  /**
   * 加载翻译文件
   * @param {string} locale - 语言代码
   * @param {Object} translations - 翻译对象
   */
  loadTranslations(locale, translations) {
    if (!translations || typeof translations !== 'object') {
      console.error(`无效的翻译数据: ${locale}`);
      return false;
    }

    this.translations.set(locale, translations);
    this.loadedLocales.add(locale);

    console.log(`已加载翻译: ${locale}`);
    return true;
  }

  /**
   * 异步加载翻译文件
   * @param {string} locale - 语言代码
   * @param {string} url - 翻译文件URL
   * @returns {Promise<boolean>} 加载是否成功
   */
  async loadTranslationsAsync(locale, url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const translations = await response.json();
      return this.loadTranslations(locale, translations);
    } catch (error) {
      console.error(`加载翻译失败 ${locale}:`, error);
      return false;
    }
  }

  /**
   * 获取翻译文本
   * @param {string} key - 翻译键
   * @param {Object} params - 参数对象
   * @param {string} locale - 指定语言（可选）
   * @returns {string} 翻译文本
   */
  t(key, params = {}, locale = null) {
    const targetLocale = locale || this.currentLocale;

    // 尝试获取指定语言的翻译
    let translation = this.getTranslationByKey(key, targetLocale);

    // 如果没有找到，尝试回退语言
    if (!translation && targetLocale !== this.fallbackLocale) {
      translation = this.getTranslationByKey(key, this.fallbackLocale);
    }

    // 如果仍然没有找到，返回键名
    if (!translation) {
      console.warn(`未找到翻译: ${key} (${targetLocale})`);
      return key;
    }

    // 处理参数替换
    return I18nManager.interpolate(translation, params);
  }

  /**
   * 根据键获取翻译
   * @param {string} key - 翻译键
   * @param {string} locale - 语言代码
   * @returns {string|null} 翻译文本
   */
  getTranslationByKey(key, locale) {
    const translations = this.translations.get(locale);
    if (!translations) return null;

    // 支持嵌套键，如 "menu.file.open"
    const keys = key.split('.');
    let result = translations;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return null;
      }
    }

    return typeof result === 'string' ? result : null;
  }

  /**
   * 插值处理
   * @param {string} template - 模板字符串
   * @param {Object} params - 参数对象
   * @returns {string} 处理后的字符串
   */
  static interpolate(template, params) {
    if (!template || typeof template !== 'string') return template;
    if (!params || typeof params !== 'object') return template;

    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      if (params[key] === undefined) return match;
      return params[key];
    });
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

    // 保存到本地存储
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('github-i18n-locale', locale);
    }

    // 通知观察者
    this.notifyObservers(locale, oldLocale);

    console.log(`语言已更改: ${oldLocale} -> ${locale}`);
    return true;
  }

  /**
   * 获取当前语言
   * @returns {string} 当前语言代码
   */
  getCurrentLocale() {
    return this.currentLocale;
  }

  /**
   * 获取已加载的语言列表
   * @returns {Array<string>} 语言代码列表
   */
  getLoadedLocales() {
    return Array.from(this.loadedLocales);
  }

  /**
   * 添加语言变更观察者
   * @param {Function} observer - 观察者函数
   */
  addObserver(observer) {
    if (typeof observer === 'function') {
      this.observers.push(observer);
    }
  }

  /**
   * 移除语言变更观察者
   * @param {Function} observer - 观察者函数
   */
  removeObserver(observer) {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  /**
   * 通知所有观察者
   * @param {string} newLocale - 新语言
   * @param {string} oldLocale - 旧语言
   */
  notifyObservers(newLocale, oldLocale) {
    this.observers.forEach((observer) => {
      try {
        observer(newLocale, oldLocale);
      } catch (error) {
        console.error('观察者执行错误:', error);
      }
    });
  }

  /**
   * 格式化日期
   * @param {Date} date - 日期对象
   * @param {Object} options - 格式化选项
   * @param {string} locale - 语言代码（可选）
   * @returns {string} 格式化后的日期字符串
   */
  formatDate(date, options = {}, locale = null) {
    const targetLocale = locale || this.currentLocale;

    // 默认选项
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    const formatOptions = { ...defaultOptions, ...options };

    try {
      return new Intl.DateTimeFormat(targetLocale, formatOptions).format(date);
    } catch (error) {
      console.error('日期格式化错误:', error);
      return date.toLocaleDateString();
    }
  }

  /**
   * 格式化数字
   * @param {number} number - 数字
   * @param {Object} options - 格式化选项
   * @param {string} locale - 语言代码（可选）
   * @returns {string} 格式化后的数字字符串
   */
  formatNumber(number, options = {}, locale = null) {
    const targetLocale = locale || this.currentLocale;

    try {
      return new Intl.NumberFormat(targetLocale, options).format(number);
    } catch (error) {
      console.error('数字格式化错误:', error);
      return number.toString();
    }
  }

  /**
   * 格式化相对时间
   * @param {Date} date - 日期对象
   * @param {string} locale - 语言代码（可选）
   * @returns {string} 相对时间字符串
   */
  formatRelativeTime(date, locale = null) {
    const targetLocale = locale || this.currentLocale;
    const now = new Date();
    const MS_TO_SECONDS = 1000;
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / MS_TO_SECONDS);

    const units = [
      { max: 60, unit: 'second', divisor: 1 },
      { max: 3600, unit: 'minute', divisor: 60 },
      { max: 86400, unit: 'hour', divisor: 3600 },
      { max: 2592000, unit: 'day', divisor: 86400 },
      { max: 31536000, unit: 'month', divisor: 2592000 },
      { max: Infinity, unit: 'year', divisor: 31536000 },
    ];

    for (const { max, unit, divisor } of units) {
      if (diffInSeconds < max) {
        const value = Math.floor(diffInSeconds / divisor);
        try {
          return new Intl.RelativeTimeFormat(targetLocale).format(-value, unit);
        } catch (error) {
          console.error('相对时间格式化错误:', error);
          break;
        }
      }
    }

    return date.toLocaleDateString();
  }
}
