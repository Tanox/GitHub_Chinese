/**
 * 页面可见 UI 文本提取（Node 侧，jsdom）
 * @file src/lib/extract-html-text.js
 * @version 1.13.10
 * @date 2026-10-01
 * @description T18-b：离线段提取器，复用与浏览器端 extractPageText 一致的降噪策略，
 *   供 HAR / 会话导入等无需启动浏览器的采集路径使用。基于 jsdom 构造 DOM，作用域优先
 *   #react-app / .application-main，跳过 script/style 等内容噪声；不做 CSS display 判定
 *   （静态导入场景无法获取计算样式，以属性（aria-hidden / hidden）降噪为主）。
 */

import { JSDOM } from 'jsdom';

/** 跳过非 UI 文本节点标签（与浏览器端一致） */
const SKIP_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'TEMPLATE',
  'SVG',
  'HEAD',
  'LINK',
  'META',
  'TITLE',
  'CODE',
  'PRE',
  'TEXTAREA',
  'INPUT',
]);

/** GitHub 内容型容器（噪声）：文本多为代码 / 正文 / 评论，非 UI 文案 */
const CONTENT_NOISE_CLASSES = [
  'markdown-body',
  'highlight',
  'blob-code',
  'CodeMirror',
  'js-comment-body',
  'timeline-comment',
  'diff-view',
  'comment-body',
];

/**
 * 解析提取作用域根集合（与浏览器端同策略）：SPA 根 / 主内容区回退 body；
 * 主根之外的全局头部（header / .AppHeader / .js-header-wrapper）额外纳入（T18-c）
 * @param {Document} document - jsdom document
 * @returns {Element[]} 作用域根元素集合
 */
function resolveScopeRoots(document) {
  const primary =
    document.querySelector('#react-app') ||
    document.querySelector('.application-main') ||
    document.body;
  /** @type {Element[]} */
  const roots = [primary];
  document.querySelectorAll('header, .AppHeader, .js-header-wrapper').forEach((h) => {
    if (!primary.contains(h)) roots.push(h);
  });
  return roots;
}

/**
 * 判断元素是否落在内容型容器内（噪声）
 * @param {Element} el - 待判断元素
 * @returns {boolean}
 */
function isContentNoise(el) {
  const cls = typeof el.className === 'string' ? el.className : '';
  return CONTENT_NOISE_CLASSES.some((token) => cls.split(/\s+/).includes(token));
}

/**
 * 从 HTML 字符串提取可见 UI 文本块（Node 侧）
 * @param {string} html - 页面 HTML
 * @param {{ minLength?: number, maxLength?: number }} [options] - 文本长度区间（含）
 * @returns {string[]} 文本块列表
 */
export function extractVisibleText(html, { minLength = 2, maxLength = 300 } = {}) {
  if (!html || typeof html !== 'string') return [];
  const dom = new JSDOM(html);
  const { document, NodeFilter } = dom.window;
  const roots = resolveScopeRoots(document);
  const collected = [];
  for (const root of roots) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const text = (node.textContent ?? '').trim();
      if (text.length >= minLength && text.length <= maxLength) {
        let el = node.parentElement;
        let skip = false;
        while (el && el !== root) {
          if (SKIP_TAGS.has(el.tagName) || isContentNoise(el)) {
            skip = true;
            break;
          }
          if (el.getAttribute('aria-hidden') === 'true' || el.hasAttribute('hidden')) {
            skip = true;
            break;
          }
          el = el.parentElement;
        }
        if (!skip) collected.push(text);
      }
      node = walker.nextNode();
    }
  }
  return collected;
}
