/**
 * 本地化格式化函数
 * @file src/i18n/formatters.js
 */

import { MS_PER_SECOND, RELATIVE_TIME_UNITS } from './constants.js';

const DEFAULT_DATE_OPTIONS = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

/**
 * 按语言格式化日期
 * @param {Date} date - 日期对象
 * @param {Object} options - Intl.DateTimeFormat 选项
 * @param {string} locale - 语言代码
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, options, locale) {
  try {
    return new Intl.DateTimeFormat(locale, { ...DEFAULT_DATE_OPTIONS, ...options }).format(date);
  } catch (error) {
    console.error('日期格式化错误:', error);
    return date.toLocaleDateString();
  }
}

/**
 * 按语言格式化数字
 * @param {number} number - 数字
 * @param {Object} options - Intl.NumberFormat 选项
 * @param {string} locale - 语言代码
 * @returns {string} 格式化后的数字字符串
 */
export function formatNumber(number, options, locale) {
  try {
    return new Intl.NumberFormat(locale, options).format(number);
  } catch (error) {
    console.error('数字格式化错误:', error);
    return number.toString();
  }
}

/**
 * 按语言格式化相对时间
 * @param {Date} date - 目标时间
 * @param {string} locale - 语言代码
 * @returns {string} 相对时间字符串
 */
export function formatRelativeTime(date, locale) {
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / MS_PER_SECOND);

  for (const { max, unit, divisor } of RELATIVE_TIME_UNITS) {
    if (diffInSeconds < max) {
      const value = Math.floor(diffInSeconds / divisor);
      try {
        return new Intl.RelativeTimeFormat(locale).format(-value, unit);
      } catch (error) {
        console.error('相对时间格式化错误:', error);
        break;
      }
    }
  }

  return date.toLocaleDateString();
}
