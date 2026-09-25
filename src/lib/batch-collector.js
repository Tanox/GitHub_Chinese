/**
 * 批量页面抓取（受并发限制）
 * @file src/lib/batch-collector.js
 * @version 1.11.0
 * @description 在单个浏览器实例内分批并发抓取 URL，归集文本并产出采集事件流
 */

import { extractPageText } from './extract-page-text.js';
import { CollectErrorCode } from './collect-codes.js';
import { navigateWithRetry, waitForHydration, autoScroll } from './page-navigation.js';

const MIN_TEXT_LENGTH = 2;
const MAX_TEXT_LENGTH = 300;
/** 单个浏览器实例内并发打开的页面上限 */
const MAX_CONCURRENT_PAGES = 3;

/**
 * 分批并发抓取 URL 页面文本
 * @param {import('puppeteer-core').Browser} browser - 已启动的浏览器实例
 * @param {string[]} targets - 已通过 SSRF 校验的目标 URL
 * @param {number} total - 目标总数（用于进度展示）
 * @returns {AsyncGenerator<CollectEvent, Set<string>>} 事件流，最终返回汇总文本集合
 */
export async function* collectBatch(browser, targets, total) {
  const allTexts = new Set();
  for (let start = 0; start < targets.length; start += MAX_CONCURRENT_PAGES) {
    const slice = targets.slice(start, start + MAX_CONCURRENT_PAGES);
    const results = await Promise.all(
      slice.map(async (target, k) => {
        const i = start + k;
        const page = await browser.newPage();
        /** @type {CollectEvent[]} */
        const navEvents = [];
        try {
          for await (const ev of navigateWithRetry(page, target)) {
            navEvents.push(ev);
          }
          await waitForHydration(page);
          await autoScroll(page);
          const texts = await page.evaluate(extractPageText, MIN_TEXT_LENGTH, MAX_TEXT_LENGTH);
          return { i, target, texts, navEvents, error: null };
        } catch (error) {
          return {
            i,
            target,
            texts: [],
            navEvents,
            error: error instanceof Error ? error.message : String(error),
          };
        } finally {
          await page.close();
        }
      }),
    );

    for (const r of results) {
      for (const ev of r.navEvents) {
        yield ev;
      }
      yield { type: 'log', message: `[${r.i + 1}/${total}] 正在访问: ${r.target}` };
      yield { type: 'progress', data: { type: 'fetch', current: r.i + 1, total, url: r.target } };
      if (r.error) {
        yield {
          type: 'error',
          message: `处理 ${r.target} 时失败: ${r.error}`,
          code: CollectErrorCode.FETCH_FAILED,
        };
      } else {
        r.texts.forEach((text) => allTexts.add(text));
        yield { type: 'log', message: `成功从 ${r.target} 提取 ${r.texts.length} 条文本` };
      }
    }
  }
  return allTexts;
}
