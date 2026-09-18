/**
 * 正则表达式工具
 * @file src/utils/string/regex.js
 */

const MAX_REGEX_LENGTH = 100;
const MAX_REPETITION_COUNT = 5;

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
}

export function isSafeRegex(pattern) {
  let patternObj = pattern;
  if (typeof patternObj === 'string') {
    patternObj = new RegExp(patternObj);
  }

  const source = patternObj.source;
  let depth = 0;
  let hasNestedRepetition = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];

    if (char === '(' && source[i - 1] !== '\\') {
      depth++;
    } else if (char === ')' && source[i - 1] !== '\\') {
      depth--;
    } else if (depth > 0 && /[*+?]/.test(char) && source[i - 1] !== '\\') {
      hasNestedRepetition = true;
      break;
    }
  }

  const longPatternWarning = source.length > MAX_REGEX_LENGTH;
  const hasMultipleRepetitions = (source.match(/[*+?]/g) || []).length > MAX_REPETITION_COUNT;

  return !hasNestedRepetition && !longPatternWarning && !hasMultipleRepetitions;
}

export function safeRegExp(pattern, flags = '') {
  try {
    const regex = new RegExp(pattern, flags);
    if (isSafeRegex(regex)) {
      return regex;
    }
    console.warn('[GitHub 中文翻译] 检测到可能存在ReDoS风险的正则表达式:', pattern);
    return null;
  } catch (error) {
    console.warn('[GitHub 中文翻译] 创建正则表达式失败:', error);
    return null;
  }
}
