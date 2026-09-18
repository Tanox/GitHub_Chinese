/**
 * 翻译元素选择工具函数与模式
 * @file src/translation-core/selectorUtils.js
 */

export { SKIP_TAGS, SKIP_CLASS_PATTERNS, SKIP_ID_PATTERNS } from './selectorUtils/patterns.js';
export {
  isSkipTag,
  hasSkipClass,
  hasSkipId,
  isHiddenElement,
  isNumericOrSpecialOnly,
} from './selectorUtils/matchers.js';
