/**
 * 翻译查询与插值
 * @file src/i18n/lookup.js
 */

/**
 * 根据键获取翻译（支持嵌套键，如 "menu.file.open"）
 * @param {Map<string, Object>} translations - 语言 → 翻译对象映射
 * @param {string} key - 翻译键
 * @param {string} locale - 语言代码
 * @returns {string|null} 翻译文本，未命中返回 null
 */
export function getTranslationByKey(translations, key, locale) {
  const bundle = translations.get(locale);
  if (!bundle) return null;

  let result = bundle;

  for (const segment of key.split('.')) {
    if (result && typeof result === 'object' && segment in result) {
      result = result[segment];
    } else {
      return null;
    }
  }

  return typeof result === 'string' ? result : null;
}

/**
 * 解析指定语言下的翻译文本，未命中时回退到回退语言
 * @param {Map<string, Object>} translations - 语言 → 翻译对象映射
 * @param {string} key - 翻译键
 * @param {string} targetLocale - 目标语言
 * @param {string} fallbackLocale - 回退语言
 * @returns {string|null} 翻译文本，均未命中返回 null
 */
export function resolveTranslation(translations, key, targetLocale, fallbackLocale) {
  const translation = getTranslationByKey(translations, key, targetLocale);
  if (translation || targetLocale === fallbackLocale) {
    return translation || null;
  }

  return getTranslationByKey(translations, key, fallbackLocale);
}

/**
 * 插值处理（将 {{key}} 替换为参数值，缺失参数保留原占位符）
 * @param {string} template - 模板字符串
 * @param {Object} params - 参数对象
 * @returns {string} 处理后的字符串
 */
export function interpolate(template, params) {
  if (!template || typeof template !== 'string') return template;
  if (!params || typeof params !== 'object') return template;

  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (params[key] === undefined) return match;
    return params[key];
  });
}
