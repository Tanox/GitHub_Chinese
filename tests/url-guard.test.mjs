/**
 * URL 安全校验测试（SSRF 防护）
 * @file tests/url-guard.test.mjs
 * @version 1.9.35
 * @description 覆盖合法公网地址放行、非 http(s) 协议、本机 / 内网 / 元数据地址与非法格式拒绝
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { guardUrl } from '../src/lib/url-guard.js';

test('guardUrl 放行合法公网 http(s) 目标', () => {
  assert.equal(guardUrl('https://github.com/explore').ok, true);
  assert.equal(guardUrl('http://example.com/path?q=1').ok, true);
});

test('guardUrl 拒绝非 http(s) 协议', () => {
  assert.equal(guardUrl('file:///etc/passwd').ok, false);
  assert.equal(guardUrl('ftp://example.com/').ok, false);
  assert.equal(guardUrl('javascript:alert(1)').ok, false);
});

test('guardUrl 拒绝本机 / 内网 / 链路本地 / 元数据地址', () => {
  const blocked = [
    'http://localhost/',
    'http://localhost.localdomain/',
    'http://127.0.0.1/',
    'http://169.254.169.254/latest/meta-data/',
    'http://10.0.0.5/',
    'http://192.168.1.1/',
    'http://172.16.0.1/',
    'http://100.64.0.1/',
    'http://[::1]/',
    'http://metadata.google.internal/',
  ];
  for (const url of blocked) {
    assert.equal(guardUrl(url).ok, false, `${url} 应被拒绝`);
  }
});

test('guardUrl 拒绝非法输入与格式', () => {
  assert.equal(guardUrl('not-a-url').ok, false);
  assert.equal(guardUrl('').ok, false);
  assert.equal(guardUrl('   ').ok, false);
  assert.equal(guardUrl(null).ok, false);
  assert.equal(guardUrl(undefined).ok, false);
});
