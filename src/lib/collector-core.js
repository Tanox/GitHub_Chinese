/**
 * 词典采集核心
 * @file src/lib/collector-core.js
 * @version 1.10.0
 * @description 采集流水线的唯一实现，Next Route Handler 与原型预览服务器共用，避免两份逻辑长期漂移
 */

import fs from 'fs/promises';
import { createRawTermsPath, runDictionaryProcessor } from './dictionary-processor.js';
import { extractPageText } from './extract-page-text.js';
import { CollectErrorCode } from './collect-codes.js';
import { guardUrl } from './url-guard.js';
import { loadPuppeteerCore, resolveBrowserExecutable } from './browser-resolver.js';
import {
  NAVIGATION_TIMEOUT_MS,
  RETRY_MAX,
  gotoWithFallback,
  waitForHydration,
  autoScroll,
  isRetryable,
  computeBackoffDelay,
  sleep,
  RetryableError,
} from './page-navigation.js';

/**
 * @typedef {import('./dictionary-processor.js').CollectEvent} CollectEvent
 */

const MIN_TEXT_LENGTH = 2;
const MAX_TEXT_LENGTH = 300;
/** HTTP 429 限流状态码（T14 退避触发条件） */
const HTTP_TOO_MANY_REQUESTS = 429;

/** 未安装 puppeteer-core 时的提示 */
const MISSING_PUPPETEER_MESSAGE =
  '未检测到 puppeteer-core 依赖，无法启动批量抓取。请先执行 npm install 后重试。';
/** 未找到可用浏览器时的提示（puppeteer-core 不自带内核） */
const MISSING_BROWSER_MESSAGE =
  '未找到可用的 Chrome / Edge 浏览器，无法启动批量抓取。可通过环境变量 PUPPETEER_EXECUTABLE_PATH 指定浏览器路径。';

/**
 * 将错误转换为可读消息
 * @param {unknown} error - 捕获到的异常
 * @returns {string} 错误消息
 */
function describeError(error) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * 带指数退避重试的导航（T14）：处理导航超时 / 反爬(429) / 网络错误，
 * 单页失败不影响整批。最多重试 RETRY_MAX 次，不可重试或达上限则向外抛出。
 * @param {import('puppeteer-core').Page} page - puppeteer 页面对象
 * @param {string} target - 目标 URL
 * @returns {AsyncGenerator<CollectEvent>} 日志事件流
 */
async function* navigateWithRetry(page, target) {
  let attempt = 0;
  for (;;) {
    attempt += 1;
    try {
      const response = await gotoWithFallback(page, target, { navigationTimeout: NAVIGATION_TIMEOUT_MS });
      if (response && response.status() === HTTP_TOO_MANY_REQUESTS) {
        throw new RetryableError('rate-limited (429)', HTTP_TOO_MANY_REQUESTS);
      }
      return;
    } catch (error) {
      const retryable = isRetryable(error);
      if (!retryable || attempt >= RETRY_MAX) {
        throw error;
      }
      const delay = computeBackoffDelay(attempt);
      yield {
        type: 'log',
        message: `访问 ${target} 暂失败（${describeError(error)}），第 ${attempt} 次重试，${delay}ms 后`,
      };
      await sleep(delay);
    }
  }
}

/**
 * 批量抓取 URL 页面文本并交由词典清洗
 * @param {string[]} urls - 目标页面 URL 列表
 * @returns {AsyncGenerator<CollectEvent>} 采集事件流
 */
export async function* collectFromUrls(urls) {
  if (!Array.isArray(urls) || urls.length === 0) {
    yield { type: 'error', message: '未提供有效的抓取 URL', code: CollectErrorCode.INPUT_INVALID };
    return;
  }

  // 先做 SSRF 校验：非法项直接透传 INVALID_URL；若全部非法则不启动浏览器
  const targets = [];
  for (const raw of urls) {
    const guard = guardUrl(raw);
    if (guard.ok) {
      targets.push(guard.url);
    } else {
      yield {
        type: 'error',
        message: `已跳过非法 URL（${guard.reason}）：${String(raw)}`,
        code: CollectErrorCode.INVALID_URL,
      };
    }
  }
  if (targets.length === 0) {
    return;
  }

  const puppeteer = await loadPuppeteerCore();
  if (!puppeteer) {
    yield {
      type: 'error',
      message: MISSING_PUPPETEER_MESSAGE,
      code: CollectErrorCode.MISSING_DEPENDENCY,
    };
    return;
  }

  const executablePath = resolveBrowserExecutable();
  if (!executablePath) {
    yield {
      type: 'error',
      message: MISSING_BROWSER_MESSAGE,
      code: CollectErrorCode.MISSING_DEPENDENCY,
    };
    return;
  }

  const allTexts = new Set();
  const total = targets.length;
  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    yield { type: 'log', message: '正在初始化 Headless 浏览器...' };

    for (let i = 0; i < total; i += 1) {
      const target = targets[i];
      yield { type: 'log', message: `[${i + 1}/${total}] 正在访问: ${target}` };
      yield { type: 'progress', data: { type: 'fetch', current: i + 1, total, url: target } };

      const page = await browser.newPage();
      try {
        yield* navigateWithRetry(page, target);
        await waitForHydration(page);
        await autoScroll(page);

        const texts = await page.evaluate(extractPageText, MIN_TEXT_LENGTH, MAX_TEXT_LENGTH);

        texts.forEach((text) => allTexts.add(text));
        yield { type: 'log', message: `成功从 ${target} 提取 ${texts.length} 条文本` };
      } catch (error) {
        yield {
          type: 'error',
          message: `处理 ${target} 时失败: ${describeError(error)}`,
          code: CollectErrorCode.FETCH_FAILED,
        };
      } finally {
        await page.close();
      }
    }

    yield { type: 'log', message: '页面提取完成，开始保存并分析词典...' };
    yield { type: 'progress', data: { type: 'analyze' } };

    // 每请求使用独立临时文件，避免并发采集互相覆盖（v1.9.47）
    const rawFile = createRawTermsPath();
    try {
      await fs.writeFile(rawFile, Array.from(allTexts).join('\n'), 'utf-8');
      yield* runDictionaryProcessor(rawFile);
    } finally {
      await fs.rm(rawFile, { force: true }).catch(() => {});
    }
  } catch (error) {
    yield {
      type: 'error',
      message: `保存或清洗失败: ${describeError(error)}`,
      code: CollectErrorCode.SUBPROCESS_FAILED,
    };
  } finally {
    await browser.close();
  }
}

/**
 * 处理用户在界面粘贴的文本
 * @param {string} data - 粘贴的原始文本
 * @returns {AsyncGenerator<CollectEvent>} 采集事件流
 */
export async function* processRawData(data) {
  if (!data || data.trim() === '') {
    yield {
      type: 'error',
      message: '粘贴内容为空，请提供待提取的页面文本',
      code: CollectErrorCode.INPUT_INVALID,
    };
    return;
  }

  // 每请求使用独立临时文件，避免并发采集互相覆盖（v1.9.47）
  const rawFile = createRawTermsPath();
  try {
    await fs.writeFile(rawFile, data, 'utf-8');
    yield* runDictionaryProcessor(rawFile);
  } finally {
    await fs.rm(rawFile, { force: true }).catch(() => {});
  }
}
