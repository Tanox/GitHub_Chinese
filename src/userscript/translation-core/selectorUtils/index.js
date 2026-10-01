/**
 * 翻译元素选择工具函数与模式
 * @file src/userscript/translation-core/selectorUtils.js
 */

export { SKIP_TAGS, SKIP_CLASS_PATTERNS, SKIP_ID_PATTERNS } from './patterns.js';
export {
  isSkipTag,
  hasSkipClass,
  hasSkipId,
  isHiddenElement,
  isNumericOrSpecialOnly,
} from './matchers.js';
