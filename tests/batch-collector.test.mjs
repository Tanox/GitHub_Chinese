/**
 * 批量并发抓取测试
 * @file tests/batch-collector.test.mjs
 * @version 1.11.7
 * @description 用假浏览器/页面隔离 puppeteer，验证 `batch-collector.js` 的文本聚合、
 *   并发页上限与单页失败隔离（T15）
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { collectBatch } from '../src/lib/batch-collector.js';

/**
 * 构造假浏览器：每个 newPage 返回可 mock 的 page，不触碰真实 puppeteer
 * @param {{ failAll?: boolean, texts?: string[] }} [opts] - 行为开关
 * @returns {{ browser: object, getMaxOpen: () => number }}
 */
function makeFakeBrowser(opts = {}) {
  const { failAll = false, texts = ['UI 标签 A', '按钮 提交'] } = opts;
  let opened = 0;
  let maxOpen = 0;
  const browser = {
    async newPage() {
      opened += 1;
      maxOpen = Math.max(maxOpen, opened);
      return {
        async goto() {
          if (failAll) {
            throw new TypeError('boom');
          }
          return { status: () => 200 };
        },
        async evaluate() {
          return texts;
        },
        async waitForSelector() {},
        async setRequestInterception() {},
        on() {},
        off() {},
        async close() {
          opened -= 1;
        },
      };
    },
  };
  return { browser, getMaxOpen: () => maxOpen };
}

test('collectBatch 聚合文本并返回集合，并发页不超过 3', async () => {
  const targets = [
    'https://github.com/a',
    'https://github.com/b',
    'https://github.com/c',
    'https://github.com/d',
    'https://github.com/e',
  ];
  const { browser, getMaxOpen } = makeFakeBrowser();

  const it = collectBatch(browser, targets, targets.length);
  const events = [];
  let res = await it.next();
  while (!res.done) {
    events.push(res.value);
    res = await it.next();
  }
  const allTexts = res.value;

  assert.ok(allTexts instanceof Set, '返回值应为文本集合');
  assert.ok(allTexts.has('UI 标签 A'), '聚合应含示例文本');
  assert.equal(allTexts.size, 2, '每页 2 条文本，5 页去重后仍为 2 条');

  const progressEvents = events.filter(
    (e) => e.type === 'progress' && e.data && e.data.type === 'fetch',
  );
  assert.equal(progressEvents.length, targets.length, '每个 URL 应产生一条进度事件');

  assert.ok(getMaxOpen() <= 3, `并发打开页面不应超过 3（实际 ${getMaxOpen()}）`);
  assert.equal(getMaxOpen(), 3, '5 个目标分两批，峰值并发应为 3');
});

test('collectBatch 单页失败记错误事件并续跑，不中断整批', async () => {
  const targets = ['https://github.com/a', 'https://github.com/b'];
  const { browser } = makeFakeBrowser({ failAll: true });

  const it = collectBatch(browser, targets, targets.length);
  const events = [];
  let res = await it.next();
  while (!res.done) {
    events.push(res.value);
    res = await it.next();
  }
  const allTexts = res.value;

  const errorEvents = events.filter((e) => e.type === 'error');
  assert.equal(errorEvents.length, targets.length, '每个失败 URL 应产生一条 error 事件');
  assert.equal(allTexts.size, 0, '失败页面不贡献文本');
});
