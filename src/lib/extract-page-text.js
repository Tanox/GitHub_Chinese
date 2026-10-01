/**
 * 页面可见 UI 文本提取（浏览器上下文）
 * @file src/lib/extract-page-text.js
 * @version 1.13.10
 * @description 在浏览器上下文中提取可见 UI 文本节点，须为自包含纯函数以便 page.evaluate 序列化。
 *   T12 改进：作用域从整页 body 收窄为 GitHub SPA 根（#react-app / .application-main 回退 body），
 *   并跳过 markdown 正文 / 代码高亮 / 评论等「内容型容器」，进一步降噪、提升信噪比。
 *   T26 修复：SKIP_TAGS / resolveScopeRoot / isContentNoise 全部内联进 extractPageText，
 *   避免经 page.evaluate 序列化时丢失模块闭包（杜绝整批提取 0 文本回归）。
 *   T18-c：扩展作用域根覆盖更多 UI 区域（header / .AppHeader），并导出 UI_REGION_SELECTORS
 *   声明覆盖的 GitHub UI 区域清单。
 */

/**
 * 声明覆盖的 GitHub UI 区域清单（T18-c）：采集时优先从这些 SPA / 主内容 / 全局导航区域提取可见 UI 文案。
 * 非穷举，作为「覆盖更多 UI 区域」的能力声明，供文档与前端核对。
 * @type {string[]}
 */
export const UI_REGION_SELECTORS = [
  '#react-app', // GitHub SPA 挂载根（绝大多数页面）
  '.application-main', // 传统多页应用主内容区
  'header', // 全局顶部导航（AppHeader / 旧版 header）
  '.AppHeader', // 新版全局头部
  '.js-header-wrapper', // 旧版头部包裹
  '.js-repo-pjax-container', // 仓库主内容容器（AJAX 局部刷新）
  '.js-command-palette', // 命令面板
];

/**
 * 提取页面 UI 容器的可见文本块
 * @param {number} minLength - 最短长度（含）
 * @param {number} maxLength - 最长长度（含）
 * @returns {string[]} 文本块列表
 */
export function extractPageText(minLength, maxLength) {
  // 跳过非 UI 文本节点：脚本 / 样式 / 模板 / SVG / 表单控件 / 代码块，以及隐藏元素
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
  // GitHub 内容型容器（噪声）：其文本多为代码 / 正文 / 评论，非 UI 文案
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
   * 解析提取作用域根集合：优先 SPA 挂载根 / 主内容区，回退 body（T12）；
   * 若全局头部（header / .AppHeader / .js-header-wrapper）渲染在 SPA 根之外（旧版 / 部分页面），
   * 额外纳入以覆盖顶部导航文案（T18-c）。避免重复：已在主根内的头部不再重复收集。
   * @returns {Element[]} 作用域根元素集合
   */
  function resolveScopeRoots() {
    const primary =
      document.querySelector('#react-app') ||
      document.querySelector('.application-main') ||
      document.body;
    const roots = [primary];
    document.querySelectorAll('header, .AppHeader, .js-header-wrapper').forEach((h) => {
      if (!primary.contains(h)) roots.push(h);
    });
    return roots;
  }

  /**
   * 判断元素是否落在「内容型容器」内（噪声）（T12）
   * @param {Element} el - 待判断元素
   * @returns {boolean} 是否内容噪声
   */
  function isContentNoise(el) {
    const cls = typeof el.className === 'string' ? el.className : '';
    return CONTENT_NOISE_CLASSES.some((token) => cls.split(/\s+/).includes(token));
  }

  const collected = [];
  const roots = resolveScopeRoots();
  // 多根并集遍历：逐根构造 TreeWalker（TreeWalker 仅接受单一根节点）
  for (const root of roots) {
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
  }
  return collected;
}
