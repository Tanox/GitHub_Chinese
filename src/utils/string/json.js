/**
 * JSON处理工具
 * @file src/utils/string/json.js
 */

export function safeJSONParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('[GitHub 中文翻译] JSON解析失败:', error);
    return defaultValue;
  }
}

export function safeJSONStringify(obj, defaultValue = '{}') {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn('[GitHub 中文翻译] JSON序列化失败:', error);
    return defaultValue;
  }
}
