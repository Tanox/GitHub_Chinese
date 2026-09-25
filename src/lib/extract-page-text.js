/**
 * 页面可见 UI 文本提取（浏览器上下文）
 * @file src/lib/extract-page-text.js
 * @version 1.10.0
 * @description 在浏览器上下文中提取可见 UI 文本节点，须为自包含纯函数以便 page.evaluate 序列化。
 *   T12 改进：作用域从整页 body 收窄为 GitHub SPA 根（#react-app / .application-main 回退 body），
 *   并跳过 markdown 正文 / 代码高亮 / 评论等「内容型容器」，进一步降噪、提升信噪比。
 */

/**
 * 解析提取作用域根：优先 SPA 挂载根，其次主内容区，最后回退 body（T12）
 * @returns {Element} 作用域根元素
 */
function resolveScopeRoot() {
  return (
    document.querySelector('#react-app') ||
    document.querySelector('.application-main') ||
    document.body
  );
}

/**
 * 判断元素是否落在「内容型容器」内（噪声）：
 * 其文本多为代码 / 正文 / 评论，并非可翻译的 UI 文案（T12）
 * @param {Element} el - 待判断元素
 * @returns {boolean} 是否内容噪声
 */
function isContentNoise(el) {
  const cls = typeof el.className === 'string' ? el.className : '';
  return [
    'markdown-body', 'highlight', 'blob-code', 'CodeMirror',
    'js-comment-body', 'timeline-comment', 'diff-view', 'comment-body',
  ].some((token) => cls.split(/\s+/).includes(token));
}

/**
 * 提取页面 UI 容器的可见文本块
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

  const root = resolveScopeRoot();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    const text = node.textContent?.trim() ?? '';
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
