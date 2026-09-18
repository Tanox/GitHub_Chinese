/**
 * 翻译元素选择匹配模块
 * @file src/translation-core/selectorUtils/matchers.js
 */
import { SKIP_TAGS, SKIP_CLASS_PATTERNS, SKIP_ID_PATTERNS } from './patterns.js';

export function isSkipTag(tagName) {
  return SKIP_TAGS.includes(tagName.toLowerCase());
}

export function hasSkipClass(className) {
  if (!className) return false;
  if (typeof className !== 'string') return false;
  return SKIP_CLASS_PATTERNS.some((pattern) => pattern.test(className));
}

export function hasSkipId(id) {
  if (!id) return false;
  return SKIP_ID_PATTERNS.some((pattern) => pattern.test(id));
}

export function isHiddenElement(element) {
  const computedStyle = window.getComputedStyle(element);
  return (
    computedStyle.display === 'none' ||
    computedStyle.visibility === 'hidden' ||
    computedStyle.opacity === '0' ||
    (computedStyle.position === 'absolute' && computedStyle.left === '-9999px')
  );
}

export function isNumericOrSpecialOnly(text) {
  return /^[0-9.,\s()[\]{}/*^$#@!~`|:;"'?>+-]+$/i.test(text);
}
