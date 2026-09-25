/**
 * 页面可见 UI 文本提取（浏览器上下文）
 * @file src/lib/extract-page-text.js
 * @version 1.9.47
 * @description 在浏览器上下文中提取可见 UI 文本节点，须为自包含纯函数以便 page.evaluate 序列化
 */

/**
 * 提取页面正文的可见 UI 文本块
 * @param {number} minLength - 最短长度（含）
 * @param {number} maxLength - 最长长度（含）
 * @returns {string[]} 文本块列表
 */
export function extractPageText(minLength, maxLength) {
  const collected = [];
  // 跳过非 UI 文本节点：脚本 / 样式 / 模板 / SVG / 表单控件 / 代码块，以及隐藏元素
  const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'HEAD',
    'LINK', 'META', 'TITLE', 'CODE', 'PRE', 'TEXTAREA', 'INPUT',
  ]);

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    const text = node.textContent?.trim() ?? '';
    if (text.length >= minLength && text.length <= maxLength) {
      let el = node.parentElement;
      let skip = false;
      while (el) {
        if (SKIP_TAGS.has(el.tagName)) {
          skip = true;
          break;
        }
        if (el.getAttribute('aria-hidden') === 'true' || el.hasAttribute('hidden')) {
          skip = true;
          break;
        }
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') {
          skip = true;
          break;
        }
        el = el.parentElement;
      }
      if (!skip) collected.push(text);
    }
    node = walker.nextNode();
  }
  return collected;
}
