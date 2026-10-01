/**
 * Node 侧可见文本提取测试（T18-b）
 * @file tests/extract-html-text.test.mjs
 * @version 1.13.10
 * @description 验证 extractVisibleText 在无需浏览器时，复用与浏览器端一致的降噪策略，
 *   正确提取 GitHub SPA 根内的可见 UI 文案，并跳过 script / 内容噪声 / aria-hidden。
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { extractVisibleText } from '../src/lib/extract-html-text.js';

test('extractVisibleText 提取 SPA 根内可见 UI 文案并降噪', () => {
  const html = `
    <html><body>
      <div id="react-app">
        <button>提交</button>
        <nav><a href="#">首页</a></nav>
        <script>var secret = 1;</script>
        <div class="markdown-body"># 标题正文</div>
        <div aria-hidden="true">不可见文本</div>
      </div>
    </body></html>`;
  const result = extractVisibleText(html);

  assert.ok(result.includes('提交'), '应收集可见 UI 文案「提交」');
  assert.ok(result.includes('首页'), '应收集可见 UI 文案「首页」');
  assert.ok(!result.some((t) => t.includes('secret')), '应跳过 script 内容');
  assert.ok(!result.some((t) => t.includes('标题正文')), '应跳过 markdown-body 内容噪声');
  assert.ok(!result.some((t) => t.includes('不可见文本')), '应跳过 aria-hidden 文本');
});

test('extractVisibleText 无 SPA 根时回退到 body / header 提取', () => {
  const html = `<body><header><a href="#">关于</a></header><span>帮助</span></body>`;
  const result = extractVisibleText(html);
  assert.ok(result.includes('关于'), '应收集 header 内文案');
  assert.ok(result.includes('帮助'), '应收集 body 内文案');
});

test('extractVisibleText 空输入安全返回空数组', () => {
  assert.deepEqual(extractVisibleText(''), []);
  assert.deepEqual(extractVisibleText(null), []);
});
