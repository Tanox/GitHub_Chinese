/**
 * 翻译建议引擎单元测试（T21）
 * @file tests/translation-suggest.test.mjs
 * @version 1.12.6
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { suggestTranslation, isPlaceholder, normalizeEn } from '../src/lib/translation-suggest.js';

const dict = {
  Open: '打开',
  'New issue': '新建议题',
  issue: '议题',
  Settings: '设置',
  '待翻译: Foo bar': '待翻译: Foo bar',
};

test('normalizeEn 合并空白与去首尾', () => {
  assert.equal(normalizeEn('  Open   a   new  issue '), 'Open a new issue');
});

test('isPlaceholder 识别待翻译占位', () => {
  assert.equal(isPlaceholder('待翻译: x'), true);
  assert.equal(isPlaceholder('打开'), false);
});

test('精确命中返回 memory-exact', async () => {
  const r = await suggestTranslation('New issue', { dictionary: dict });
  assert.equal(r.source, 'memory-exact');
  assert.equal(r.suggestion, '新建议题');
});

test('精确命中跳过待翻译占位（不返回占位值）', async () => {
  const r = await suggestTranslation('Foo bar', { dictionary: dict });
  assert.notEqual(r.suggestion, '待翻译: Foo bar');
});

test('大小写不敏感命中返回 memory-ci', async () => {
  const r = await suggestTranslation('settings', { dictionary: dict });
  assert.equal(r.source, 'memory-ci');
  assert.equal(r.suggestion, '设置');
});

test('单词组合命中返回 memory-composed', async () => {
  const r = await suggestTranslation('Open issue', { dictionary: dict });
  assert.equal(r.source, 'memory-composed');
  assert.equal(r.suggestion, '打开 议题');
});

test('无匹配且无 LLM 返回 none', async () => {
  const r = await suggestTranslation('Completely unknown string', { dictionary: dict });
  assert.equal(r.source, 'none');
  assert.equal(r.suggestion, null);
});

test('空词条返回 empty', async () => {
  const r = await suggestTranslation('   ', { dictionary: dict });
  assert.equal(r.source, 'empty');
});

test('注入 llm 回调可覆盖为 llm 来源', async () => {
  const r = await suggestTranslation('Unknown term', {
    dictionary: dict,
    llm: async () => '未知词条',
  });
  assert.equal(r.source, 'llm');
  assert.equal(r.suggestion, '未知词条');
});

test('llm 抛错时降级为 none', async () => {
  const r = await suggestTranslation('Unknown term', {
    dictionary: dict,
    llm: async () => {
      throw new Error('boom');
    },
  });
  assert.equal(r.source, 'none');
  assert.equal(r.suggestion, null);
});
