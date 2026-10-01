/**
 * HAR 导入工具测试（T18-b）
 * @file tests/har-import.test.mjs
 * @version 1.13.10
 * @description 验证 extractFromHar 从 HAR 中筛选 GitHub HTML 响应并提取可见文本，
 *   跳过非 GitHub / 非 HTML / 无响应体的条目；base64 编码内容可正确解码。
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { extractFromHar, isGitHubHtml } from '../scripts/har-import.cjs';

const SAMPLE_HAR = {
  log: {
    entries: [
      {
        request: { url: 'https://github.com/foo/bar' },
        response: {
          content: {
            mimeType: 'text/html',
            text: '<div id="react-app"><button>Settings</button></div>',
          },
        },
      },
      {
        request: { url: 'https://github.com/foo' },
        response: {
          content: {
            mimeType: 'text/html',
            encoding: 'base64',
            text: Buffer.from('<header><a href="#">Profile</a></header>').toString('base64'),
          },
        },
      },
      {
        request: { url: 'https://example.com/x' },
        response: { content: { mimeType: 'text/html', text: '<div>other</div>' } },
      },
      {
        request: { url: 'https://github.com/api' },
        response: { content: { mimeType: 'application/json', text: '{}' } },
      },
      {
        request: { url: 'https://github.com/empty' },
        response: { content: { mimeType: 'text/html' } }, // 无响应体
      },
    ],
  },
};

test('isGitHubHtml 仅匹配 GitHub HTML 响应', () => {
  assert.ok(isGitHubHtml(SAMPLE_HAR.log.entries[0]));
  assert.ok(isGitHubHtml(SAMPLE_HAR.log.entries[1]));
  assert.equal(isGitHubHtml(SAMPLE_HAR.log.entries[2]), false, '非 GitHub 域名应跳过');
  assert.equal(isGitHubHtml(SAMPLE_HAR.log.entries[3]), false, '非 HTML 应跳过');
});

test('extractFromHar 解析 GitHub HTML 并提取可见文本（含 base64 解码）', async () => {
  const { texts, pages, skipped } = await extractFromHar(SAMPLE_HAR);
  assert.equal(pages, 2, '应解析 2 个 GitHub HTML 页面');
  assert.equal(skipped, 3, '应跳过 3 个非目标条目');
  assert.ok(texts.includes('Settings'), '应提取可见文案 Settings');
  assert.ok(texts.includes('Profile'), '应解码 base64 并提取 Profile');
});
