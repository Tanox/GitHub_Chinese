/**
 * 语言偏好持久化
 * @file src/i18n/storage.js
 * @description 封装 localStorage 与浏览器语言读取，便于测试与降级
 */

import { LOCALE_STORAGE_KEY } from './constants.js';

/**
 * 读取用户保存的语言偏好
 * @returns {string|null} 语言代码，未保存或不可用时返回 null
 */
export function readSavedLocale() {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch (_error) {
    return null;
  }
}

/**
 * 读取浏览器语言设置
 * @returns {string|null} 语言代码，不可用时返回 null
 */
export function readBrowserLocale() {
  if (typeof navigator === 'undefined') {
    return null;
  }

  return navigator.language || navigator.userLanguage || null;
}

/**
 * 保存语言偏好
 * @param {string} locale - 语言代码
 */
export function saveLocale(locale) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch (_error) {
    // 存储不可用时静默降级
  }
}
