/**
 * 跳过翻译的标签与 class 模式
 * @file src/translation-core/selectorUtils/skipTags.js
 */

/** 这些标签的内容不参与翻译 */
export const SKIP_TAGS = [
  'script',
  'style',
  'code',
  'pre',
  'textarea',
  'input',
  'select',
  'img',
  'svg',
  'canvas',
  'video',
  'audio',
];

/** class 命中任一模式即跳过（代码块、图标、标识符等） */
export const SKIP_CLASS_PATTERNS = [
  /language-\w+/,
  /highlight/,
  /token/,
  /no-translate/,
  /octicon/,
  /emoji/,
  /avatar/,
  /timestamp/,
  /numeral/,
  /filename/,
  /hash/,
  /sha/,
  /shortsha/,
  /hex-color/,
  /code/,
  /gist/,
  /language-/,
  /markdown-/,
  /monaco-editor/,
  /syntax-/,
  /highlight-/,
  /clipboard/,
  /progress-/,
  /count/,
  /size/,
  /time/,
  /date/,
  /sortable/,
  /label/,
  /badge/,
  /url/,
  /email/,
  /key/,
  /token/,
  /user-name/,
  /repo-name/,
];
