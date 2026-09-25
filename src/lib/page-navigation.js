/**
 * 页面导航与动态适配辅助（Node 侧，操作 puppeteer page）
 * @file src/lib/page-navigation.js
 * @version 1.10.0
 * @description 从 collector-core 抽离的浏览器交互辅助：导航超时降级、hydration 等待、
 *   懒加载滚动、可重试错误判定与指数退避。本模块不依赖浏览器启动，可独立单元测试。
 */

/** GitHub SPA 挂载根选择器（hydration 完成标志） */
export const HYDRATION_SELECTOR = '#react-app';
/** 单次导航超时（毫秒） */
export const NAVIGATION_TIMEOUT_MS = 30_000;
/** hydration 等待超时（毫秒） */
export const HYDRATION_TIMEOUT_MS = 15_000;
/** hydration 后额外稳定等待（毫秒），确保 React 完成文本挂载 */
export const HYDRATION_SETTLE_MS = 800;
/** networkidle2 失败降级为 domcontentloaded 后的固定等待（毫秒） */
export const DOMCONTENTLOADED_WAIT_MS = 3_000;
/** 单页最大重试次数（含首次） */
export const RETRY_MAX = 3;
/** 指数退避基数（毫秒） */
export const BACKOFF_BASE_MS = 1_000;
/** 懒加载滚动步数 */
export const SCROLL_STEPS = 3;
/** 懒加载每步停顿（毫秒） */
export const SCROLL_PAUSE_MS = 150;

/** 可重试错误（携带 HTTP 状态码，用于 429 退避） */
export class RetryableError extends Error {
  /**
   * @param {string} message - 错误消息
   * @param {number} [status] - HTTP 状态码（如 429）
   */
  constructor(message, status) {
    super(message);
    this.name = 'RetryableError';
    this.status = status;
  }
}

/** 延迟指定毫秒 */
export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** 计算第 attempt 次重试的指数退避延迟（1s / 2s / 4s …） */
export function computeBackoffDelay(attempt) {
  const safe = Math.max(1, attempt);
  return BACKOFF_BASE_MS * 2 ** (safe - 1);
}

/** 判断错误是否可重试（超时 / 网络中断 / 429 / 5xx） */
export function isRetryable(error) {
  if (error instanceof RetryableError) return true;
  if (error?.name === 'TimeoutError') return true;
  const message = error?.message ?? String(error);
  return /net::ERR|Navigation timeout|Navigation failed|ERR_CONNECTION|429|502|503|504/i.test(
    message,
  );
}

/**
 * 导航：优先 networkidle2，超时降级为 domcontentloaded + 固定等待（T13）
 * @param {import('puppeteer-core').Page} page - puppeteer 页面对象
 * @param {string} target - 目标 URL
 * @param {{ navigationTimeout?: number }} [options] - 导航超时配置
 * @returns {Promise<import('puppeteer-core').HTTPResponse | null>}
 */
export async function gotoWithFallback(
  page,
  target,
  { navigationTimeout = NAVIGATION_TIMEOUT_MS } = {},
) {
  try {
    return await page.goto(target, { waitUntil: 'networkidle2', timeout: navigationTimeout });
  } catch (error) {
    if (
      error?.name === 'TimeoutError' ||
      /Navigation timeout|net::ERR_TIMED_OUT/i.test(error?.message ?? '')
    ) {
      const response = await page.goto(target, {
        waitUntil: 'domcontentloaded',
        timeout: navigationTimeout,
      });
      await sleep(DOMCONTENTLOADED_WAIT_MS);
      return response;
    }
    throw error;
  }
}

/**
 * 等待 hydration（react-app 出现）并额外稳定等待；超时降级不阻塞主流程（T13）
 * @param {import('puppeteer-core').Page} page - puppeteer 页面对象
 * @param {object} [options] - 选择器 / 超时 / 稳定等待配置
 */
export async function waitForHydration(
  page,
  {
    selector = HYDRATION_SELECTOR,
    timeout = HYDRATION_TIMEOUT_MS,
    settleMs = HYDRATION_SETTLE_MS,
  } = {},
) {
  try {
    await page.waitForSelector(selector, { timeout });
  } catch {
    // 超时降级：不阻塞主流程，由固定稳定等待兜底
  }
  await sleep(settleMs);
}

/**
 * 滚动触发懒加载，结束后回到顶部（T13）
 * @param {import('puppeteer-core').Page} page - puppeteer 页面对象
 * @param {{ steps?: number }} [options] - 滚动步数
 */
export async function autoScroll(page, { steps = SCROLL_STEPS } = {}) {
  await page.evaluate(async (scrollSteps) => {
    const height = document.body.scrollHeight;
    for (let i = 1; i <= scrollSteps; i += 1) {
      window.scrollTo(0, (height * i) / scrollSteps);
      await new Promise((resolve) => {
        setTimeout(resolve, SCROLL_PAUSE_MS);
      });
    }
    window.scrollTo(0, 0);
  }, steps);
}

/** HTTP 429 限流状态码（退避触发条件） */
const HTTP_TOO_MANY_REQUESTS = 429;

/** 将错误转换为可读消息 */
function describeError(error) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * 带指数退避重试的导航（T14）：处理导航超时 / 反爬(429) / 网络错误，
 * 单页失败不影响整批。最多重试 RETRY_MAX 次，不可重试或达上限则向外抛出。
 * @param {import('puppeteer-core').Page} page - puppeteer 页面对象
 * @param {string} target - 目标 URL
 * @returns {AsyncGenerator<{ type: 'log', message: string }>} 日志事件流
 */
export async function* navigateWithRetry(page, target) {
  let attempt = 0;
  for (;;) {
    attempt += 1;
    try {
      const response = await gotoWithFallback(page, target, {
        navigationTimeout: NAVIGATION_TIMEOUT_MS,
      });
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
