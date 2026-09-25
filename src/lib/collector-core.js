/**
 * 词典采集核心
 * @file src/lib/collector-core.js
 * @version 1.10.1
 * @description 采集流水线的唯一实现，Next Route Handler 与原型预览服务器共用，避免两份逻辑长期漂移
 */

import fs from 'fs/promises';
import { createRawTermsPath, runDictionaryProcessor } from './dictionary-processor.js';
import { CollectErrorCode } from './collect-codes.js';
import { guardUrl } from './url-guard.js';
import { loadPuppeteerCore, resolveBrowserExecutable } from './browser-resolver.js';
import { acquireBrowserSlot, releaseBrowserSlot } from './browser-semaphore.js';
import { collectBatch } from './batch-collector.js';

/**
 * @typedef {import('./dictionary-processor.js').CollectEvent} CollectEvent
 */

/** 未安装 puppeteer-core 时的提示 */
const MISSING_PUPPETEER_MESSAGE =
  '未检测到 puppeteer-core 依赖，无法启动批量抓取。请先执行 npm install 后重试。';
/** 未找到可用浏览器时的提示（puppeteer-core 不自带内核） */
const MISSING_BROWSER_MESSAGE =
  '未找到可用的 Chrome / Edge 浏览器，无法启动批量抓取。可通过环境变量 PUPPETEER_EXECUTABLE_PATH 指定浏览器路径。';

/** 单次请求允许的最大抓取 URL 数，防止请求体携带过量目标耗尽资源 */
const MAX_URLS_PER_REQUEST = 20;

/**
 * 将错误转换为可读消息
 * @param {unknown} error - 捕获到的异常
 * @returns {string} 错误消息
 */
function describeError(error) {
  return error instanceof Error ? error.message : String(error);
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

  if (targets.length > MAX_URLS_PER_REQUEST) {
    yield {
      type: 'error',
      message: `单次最多抓取 ${MAX_URLS_PER_REQUEST} 个 URL，已收到 ${targets.length} 个`,
      code: CollectErrorCode.INPUT_INVALID,
    };
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

  const total = targets.length;

  // 限制并发浏览器实例，避免多请求同时拉起无头浏览器耗尽资源
  await acquireBrowserSlot();
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  } catch (error) {
    releaseBrowserSlot();
    yield {
      type: 'error',
      message: `浏览器启动失败: ${describeError(error)}`,
      code: CollectErrorCode.SUBPROCESS_FAILED,
    };
    return;
  }

  try {
    yield { type: 'log', message: '正在初始化 Headless 浏览器...' };
    const allTexts = yield* collectBatch(browser, targets, total);

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
    releaseBrowserSlot();
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
