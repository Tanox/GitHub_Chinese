/**
 * 翻译建议响应收窄单测
 * @file tests/suggest-response.test.mjs
 * @version 1.12.13
 * @description 回归：resp.json() 的 unknown 结果必须通过结构校验后才能渲染，字段漂移不得直达视图。
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  narrowSuggestResponse,
  readErrorMessage,
} from '../src/components/dictionary/suggest-response.ts';

test('完整合法响应被保留（含可选 llmEnabled）', () => {
  assert.deepEqual(
    narrowSuggestResponse({
      suggestion: '设置',
      source: 'memory-exact',
      confidence: 0.95,
      llmEnabled: false,
    }),
    { suggestion: '设置', source: 'memory-exact', confidence: 0.95, llmEnabled: false },
  );
});

test('suggestion 为 null 的「无建议」响应合法', () => {
  assert.deepEqual(
    narrowSuggestResponse({ suggestion: null, source: 'none', confidence: 0 }),
    { suggestion: null, source: 'none', confidence: 0, llmEnabled: undefined },
  );
});

test('缺 llmEnabled 时得到 undefined 而非崩溃', () => {
  const r = narrowSuggestResponse({ suggestion: 'x', source: 'llm', confidence: 0.8 });
  assert.equal(r.llmEnabled, undefined);
});

test('结构非法一律返回 null', () => {
  assert.equal(narrowSuggestResponse(null), null);
  assert.equal(narrowSuggestResponse('x'), null);
  assert.equal(narrowSuggestResponse(42), null);
  assert.equal(narrowSuggestResponse({ source: 'x', confidence: 1 }), null); // 缺 suggestion
  assert.equal(narrowSuggestResponse({ suggestion: 1, source: 'x', confidence: 1 }), null);
  assert.equal(narrowSuggestResponse({ suggestion: 'x', source: 1, confidence: 1 }), null);
  assert.equal(narrowSuggestResponse({ suggestion: 'x', source: 'y', confidence: 'z' }), null);
});

test('readErrorMessage 只接受非空字符串', () => {
  assert.equal(readErrorMessage({ error: '未授权' }), '未授权');
  assert.equal(readErrorMessage({ error: '' }), null);
  assert.equal(readErrorMessage({ error: 1 }), null);
  assert.equal(readErrorMessage(null), null);
  assert.equal(readErrorMessage('x'), null);
});
