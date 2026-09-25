/**
 * 页面文本提取测试（T26 序列化回归）
 * @file tests/extract-page-text.test.mjs
 * @version 1.10.2
 * @description 用 jsdom 构造 DOM，并在隔离 vm 上下文执行 `extractPageText`（模拟 `page.evaluate`
 *   序列化：仅保留函数源码、剥离模块闭包），验证其自包含、实际提取到文本且正确降噪。
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import { extractPageText } from '../src/lib/extract-page-text.js';

/**
 * 在隔离 vm 上下文执行 extractPageText，精确模拟 page.evaluate 的序列化语义
 * @param {string} html - 页面 HTML
 * @returns {string[]} 提取结果
 */
function extractInIsolatedContext(html) {
  const dom = new JSDOM(html);
  const { window } = dom;
  const context = vm.createContext({
    document: window.document,
    NodeFilter: window.NodeFilter,
    getComputedStyle: window.getComputedStyle.bind(window),
  });
  const src = extractPageText.toString();
  return vm.runInContext(`(${src})(2, 300)`, context);
}

test('隔离上下文（模拟 page.evaluate 序列化）下不丢失辅助、提取非 0', () => {
  const html = `
    <div id="react-app">
      <button>提交</button>
      <nav><a href="#">首页</a></nav>
      <script>var secret = 1;</script>
      <div class="markdown-body"># 标题</div>
      <div aria-hidden="true">不可见文本</div>
      <div hidden>隐藏文本</div>
    </div>`;
  const result = extractInIsolatedContext(html);

  assert.ok(result.length > 0, '批量采集应提取到文本（T26 回归：此前为 0）');
  assert.ok(result.includes('提交'), '应收集可见 UI 文案「提交」');
  assert.ok(result.includes('首页'), '应收集可见 UI 文案「首页」');
  assert.ok(!result.some((t) => t.includes('secret')), '应跳过 script 内容');
  assert.ok(!result.some((t) => t.includes('标题')), '应跳过 markdown-body 内容噪声');
  assert.ok(!result.some((t) => t.includes('不可见文本')), '应跳过 aria-hidden 文本');
  assert.ok(!result.some((t) => t.includes('隐藏文本')), '应跳过 hidden 文本');
});

test('无 SPA 根时回退到 body 提取', () => {
  const html = `<body><span>关于</span></body>`;
  const result = extractInIsolatedContext(html);
  assert.ok(result.includes('关于'), '无 #react-app 时应回退到 body 提取');
});
