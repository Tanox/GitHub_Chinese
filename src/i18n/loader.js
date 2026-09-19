/**
 * 翻译数据加载
 * @file src/i18n/loader.js
 */

/**
 * 加载翻译对象
 * @param {object} manager - I18nManager 实例
 * @param {string} locale - 语言代码
 * @param {Object} translations - 翻译对象
 * @returns {boolean} 是否加载成功
 */
export function loadTranslations(manager, locale, translations) {
  if (!translations || typeof translations !== 'object') {
    console.error(`无效的翻译数据: ${locale}`);
    return false;
  }

  manager.translations.set(locale, translations);
  manager.loadedLocales.add(locale);
  console.log(`已加载翻译: ${locale}`);
  return true;
}

/**
 * 通过 URL 异步加载翻译对象
 * @param {object} manager - I18nManager 实例
 * @param {string} locale - 语言代码
 * @param {string} url - 翻译文件 URL
 * @returns {Promise<boolean>} 是否加载成功
 */
export async function loadTranslationsAsync(manager, locale, url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return loadTranslations(manager, locale, await response.json());
  } catch (error) {
    console.error(`加载翻译失败 ${locale}:`, error);
    return false;
  }
}
