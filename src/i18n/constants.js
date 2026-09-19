/**
 * 国际化模块常量
 * @file src/i18n/constants.js
 */

/** 默认语言 */
export const DEFAULT_LOCALE = 'zh-CN';

/** 回退语言 */
export const FALLBACK_LOCALE = 'en-US';

/** 语言偏好存储键 */
export const LOCALE_STORAGE_KEY = 'github-i18n-locale';

/** 毫秒到秒的换算基数 */
export const MS_PER_SECOND = 1000;

/** 相对时间格式化单位表（上界毫秒、单位名、除数） */
export const RELATIVE_TIME_UNITS = [
  { max: 60, unit: 'second', divisor: 1 },
  { max: 3600, unit: 'minute', divisor: 60 },
  { max: 86400, unit: 'hour', divisor: 3600 },
  { max: 2592000, unit: 'day', divisor: 86400 },
  { max: 31536000, unit: 'month', divisor: 2592000 },
  { max: Infinity, unit: 'year', divisor: 31536000 },
];
