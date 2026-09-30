/**
 * 词典采集核心
 * @file src/lib/collector-core.js
 * @version 1.13.4
 * @date 2026-09-30
 * @author Sut
 * @description 采集流水线的唯一实现，Next Route Handler 与原型预览服务器共用，避免两份逻辑长期漂移
 */

import fs from 'fs/promises';
import { createRawTermsPath, runDictionaryProcessor } from './dictionary-processor.js';
import { CollectErrorCode } from './collect-codes.js';
import { guardUrl } from './url-guard.js';
import { MAX_COLLECT_URLS } from './request-body.js';
import { acquireBrowser, releaseBrowser } from './browser-pool.js';
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

/** 单次请求允许的最大抓取 URL 数（与 request-body.js 共用 MAX_COLLECT_URLS，T27 统一） */

/**
 * 将错误转换为可读消息
 * @param {unknown} error - 捕获到的异常
 * @returns {string} 错误消息
 */
function describeError(error) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * 将浏览器池的获取失败原因映射为用户可读消息与错误码（纯函数，便于无浏览器环境单测）。
 * 语义区分：依赖/浏览器缺失属于「可选依赖缺失」（1001）；依赖齐全但 Chromium
 * 进程启动异常（权限、沙箱、端口等）属于运行时启动失败（2003），不得混入依赖缺失，
 * 也与词典清洗子进程失败（2002）区分。
 * @param {'MISSING_DEPENDENCY'|'MISSING_BROWSER'|'LAUNCH_FAILED'|string|null} reason - browser-pool 返回的失败原因
 * @returns {{ message: string, code: number }}
 */
export function resolveBrowserAcquireError(reason) {
  if (reason === 'MISSING_DEPENDENCY') {
    return { message: MISSING_PUPPETEER_MESSAGE, code: CollectErrorCode.MISSING_DEPENDENCY };
  }
  if (reason === 'MISSING_BROWSER') {
    // 浏览器可执行文件缺失同样属于「可选依赖缺失」，沿用 1001，仅消息不同
    return { message: MISSING_BROWSER_MESSAGE, code: CollectErrorCode.MISSING_DEPENDENCY };
  }
  return {
    message: '浏览器启动失败，请检查 puppeteer-core 与浏览器安装',
    code: CollectErrorCode.BROWSER_LAUNCH_FAILED,
  };
}

/**
 * 批量抓取 URL 页面文本并交由词典清洗
 * @param {string[]} urls - 目标页面 URL 列表
 * @returns {AsyncGenerator<CollectEvent>} 采集事件流
 */
export async function* collectFromUrls(urls, { signal } = {}) {
  if (signal?.aborted) {
    yield { type: 'error', message: '请求已取消', code: CollectErrorCode.INPUT_INVALID };
    return;
  }
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

  if (targets.length > MAX_COLLECT_URLS) {
    yield {
      type: 'error',
      message: `单次最多抓取 ${MAX_COLLECT_URLS} 个 URL，已收到 ${targets.length} 个`,
      code: CollectErrorCode.INPUT_INVALID,
    };
    return;
  }

  const total = targets.length;

  // 限制并发采集任务数，复用进程内浏览器实例池（M5：不再每请求新建浏览器，降低启动开销）
  await acquireBrowserSlot();
  const { browser, error } = await acquireBrowser();
  if (!browser) {
    releaseBrowserSlot();
    const failure = resolveBrowserAcquireError(error);
    yield {
      type: 'error',
      message: failure.message,
      code: failure.code,
    };
    return;
  }

  try {
    yield { type: 'log', message: '正在初始化 Headless 浏览器...' };
    const allTexts = yield* collectBatch(browser, targets, total);

    yield { type: 'log', message: '页面提取完成，开始保存并分析词典...' };
    yield { type: 'progress', data: { type: 'analyze' } };

    if (signal?.aborted) {
      yield { type: 'error', message: '请求已取消', code: CollectErrorCode.INPUT_INVALID };
      return;
    }

    // 每请求使用独立临时文件，避免并发采集互相覆盖（v1.9.47）
    const rawFile = createRawTermsPath();
    try {
      await fs.writeFile(rawFile, Array.from(allTexts).join('\n'), 'utf-8');
      yield* runDictionaryProcessor(rawFile, { signal });
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
    releaseBrowser();
    releaseBrowserSlot();
  }
}

/**
 * 处理用户在界面粘贴的文本
 * @param {string} data - 粘贴的原始文本
 * @returns {AsyncGenerator<CollectEvent>} 采集事件流
 */
export async function* processRawData(data, { signal } = {}) {
  if (signal?.aborted) {
    yield { type: 'error', message: '请求已取消', code: CollectErrorCode.INPUT_INVALID };
    return;
  }
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
    yield* runDictionaryProcessor(rawFile, { signal });
  } finally {
    await fs.rm(rawFile, { force: true }).catch(() => {});
  }
}
