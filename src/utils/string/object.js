/**
 * 对象处理工具
 * @file src/utils/string/object.js
 */

export function getNestedProperty(obj, path, defaultValue = null) {
  try {
    const pathArray = Array.isArray(path) ? path : path.split('.');
    let result = obj;

    for (const key of pathArray) {
      if (result === null || result === undefined) {
        return defaultValue;
      }
      result = result[key];
    }

    return result === undefined ? defaultValue : result;
  } catch (_error) {
    return defaultValue;
  }
}

export function deepClone(obj) {
  try {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map((item) => deepClone(item));
    if (obj instanceof Object) {
      const clonedObj = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          clonedObj[key] = deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  } catch (error) {
    console.warn('[GitHub 中文翻译] 深拷贝失败:', error);
    return obj;
  }
  return null;
}
