/**
 * 用户脚本产物校验
 * @file scripts/validate-bundle.cjs
 * @version 1.9.24
 * @author Sut
 * @description 校验构建产物存在、语法合法，且不存在漏打包导致的未定义模块引用
 */

const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const BUNDLE_PATH = path.join(__dirname, '..', 'build', 'GitHub_i18n.user.js');
const MIN_BUNDLE_BYTES = 1000;

/** 允许出现的运行时全局（浏览器 Web API 与用户脚本管理器 API） */
const ALLOWED_GLOBALS = new Set([
  'window',
  'document',
  'console',
  'localStorage',
  'sessionStorage',
  'navigator',
  'history',
  'location',
  'fetch',
  'XMLHttpRequest',
  'setTimeout',
  'clearTimeout',
  'setInterval',
  'clearInterval',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'queueMicrotask',
  'MutationObserver',
  'HTMLElement',
  'Element',
  'Node',
  'NodeFilter',
  'CustomEvent',
  'Event',
  'Blob',
  'URL',
  'URLSearchParams',
  'AbortController',
  'TextDecoder',
  'TextEncoder',
  'Uint8Array',
  'ArrayBuffer',
  'Intl',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
  'Promise',
  'Error',
  'TypeError',
  'Symbol',
  'Proxy',
  'Reflect',
  'JSON',
  'Math',
  'Date',
  'Object',
  'Array',
  'String',
  'Number',
  'Boolean',
  'RegExp',
  'Function',
  'parseInt',
  'parseFloat',
  'isNaN',
  'isFinite',
  'encodeURIComponent',
  'decodeURIComponent',
  'atob',
  'btoa',
  'crypto',
  'performance',
  'structuredClone',
  'arguments',
  'undefined',
  'GM_setValue',
  'GM_getValue',
  'GM_addStyle',
  'GM_registerMenuCommand',
  'GM_xmlhttpRequest',
  'unsafeWindow',
  'GM_info',
]);

/**
 * 校验构建产物
 * @returns {{ok: boolean, errors: string[]}} 校验结果
 */
function validateBundle() {
  const errors = [];

  if (!fs.existsSync(BUNDLE_PATH)) {
    return { ok: false, errors: [`构建产物不存在: ${BUNDLE_PATH}`] };
  }

  const content = fs.readFileSync(BUNDLE_PATH, 'utf-8');
  if (content.length < MIN_BUNDLE_BYTES) {
    errors.push(`构建产物过小（${content.length} 字节），疑似构建异常`);
  }

  let ast;
  try {
    ast = babel.parseSync(content, { sourceType: 'script', filename: 'GitHub_i18n.user.js' });
  } catch (error) {
    return { ok: false, errors: [...errors, `语法解析失败: ${error.message}`] };
  }

  const unresolved = new Set();
  babel.traverse(ast, {
    Program(programPath) {
      programPath.scope.crawl();
      Object.keys(programPath.scope.globals).forEach((name) => unresolved.add(name));
    },
  });

  const suspicious = [...unresolved].filter((name) => !ALLOWED_GLOBALS.has(name)).sort();
  if (suspicious.length > 0) {
    errors.push(`检测到未定义引用（可能存在漏打包模块）: ${suspicious.join(', ')}`);
  }

  return { ok: errors.length === 0, errors };
}

if (require.main === module) {
  const { ok, errors } = validateBundle();
  if (ok) {
    console.log('✅ 构建产物校验通过');
    process.exit(0);
  }
  console.error('❌ 构建产物校验失败:');
  errors.forEach((error) => console.error(`   · ${error}`));
  process.exit(1);
}

module.exports = { validateBundle };
