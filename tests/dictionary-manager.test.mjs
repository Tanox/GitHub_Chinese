/**
 * 词典管理单测
 * @file tests/dictionary-manager.test.mjs
 * @description 覆盖 XSS 防护 sanitizeText 与注入式 getTranslatedText 精确查询
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { dictionaryManager } from '../src/userscript/translation-core/dictionaryManager.js';
import { CacheManager } from '../src/userscript/core/cacheManager.js';

function seed(entries) {
  dictionaryManager.cacheManager = new CacheManager(100);
  dictionaryManager.dictionaryHash.clear();
  dictionaryManager.dictionary = {};
  Object.entries(entries).forEach(([k, v]) => {
    dictionaryManager.dictionary[k] = v;
    dictionaryManager.dictionaryHash.set(k, v);
  });
}

test('sanitizeText 移除危险内容（XSS 防护）', () => {
  assert.equal(dictionaryManager.sanitizeText('<script>alert(1)</script>'), 'alert(1)');
  assert.equal(dictionaryManager.sanitizeText('a<iframe></iframe>b'), 'ab');
  assert.equal(dictionaryManager.sanitizeText('onclick="x"'), '');
  assert.equal(dictionaryManager.sanitizeText('javascript:alert(1)'), 'alert(1)');
  assert.ok(!dictionaryManager.sanitizeText('<img src=x onerror=y>').includes('<'));
});

test('getTranslatedText 精确命中', () => {
  seed({ 'Sign in': '登录' });
  assert.equal(dictionaryManager.getTranslatedText('Sign in'), '登录');
});

test('getTranslatedText 命中结果经 sanitizeText 净化', () => {
  seed({ evil: '<script>bad</script>' });
  assert.equal(dictionaryManager.getTranslatedText('evil'), 'bad');
});

test('getTranslatedText 未知词条返回 null', () => {
  seed({ 'Sign in': '登录' });
  assert.equal(dictionaryManager.getTranslatedText('zzz not a term zzz'), null);
});

test('getTranslatedText 空/空白返回原文本', () => {
  seed({});
  assert.equal(dictionaryManager.getTranslatedText(''), '');
  assert.equal(dictionaryManager.getTranslatedText('   '), '   ');
});
