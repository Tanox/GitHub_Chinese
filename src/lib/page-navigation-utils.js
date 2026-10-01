/**
 * 页面导航纯函数工具（与浏览器无关，可独立单元测试）
 * @file src/lib/page-navigation-utils.js
 * @version 1.13.10
 * @date 2026-10-01
 * @description 从 page-navigation.js 抽离的纯逻辑：指数退避 / 可重试判定 / RetryableError /
 *   延迟 / T18 新增的 applyCookies（登录态 cookie 注入）。供 page-navigation.js 复用并对外再导出。
 */

/** 单页最大重试次数（含首次） */
export const RETRY_MAX = 3;
/** 指数退避基数（毫秒） */
export const BACKOFF_BASE_MS = 1_000;

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
 * 归一化并注入 cookie 到页面，仅注入与目标主机匹配的 cookie（T18 登录态采集）
 * @description 适用于抓取需登录态的私有页：在导航前 setCookie。跳过与目标主机不匹配的
 *   cookie（避免 puppeteer 抛出 domain 不匹配），无 domain 时用目标 url 兜底。单条失败静默跳过，
 *   不影响其余 cookie 注入。接受含 setCookie 方法的对象（puppeteer page 或兼容替身），便于单测。
 * @param {{ setCookie?: (...c: object[]) => Promise<unknown> }} page - 含 setCookie 方法的页面对象
 * @param {Array<{ name: string, value: string, domain?: string, path?: string }>} [cookies] - cookie 列表
 * @param {string} target - 目标 URL（用于主机匹配与无 domain 时的 url 兜底）
 * @returns {Promise<void>}
 */
export async function applyCookies(page, cookies, target) {
  if (!cookies || cookies.length === 0) return;
  const setCookie = typeof page?.setCookie === 'function' ? page.setCookie.bind(page) : null;
  if (!setCookie) return;

  let host = '';
  try {
    host = new URL(target).hostname.toLowerCase();
  } catch {
    host = '';
  }

  for (const c of cookies) {
    const domain = String(c.domain || '')
      .replace(/^\./, '')
      .toLowerCase();
    // 仅注入与目标主机匹配的 cookie（含后缀匹配，如 .github.com 适配 github.com）
    if (domain && host && !host.endsWith(domain)) continue;

    /** @type {Record<string, string>} */
    const cookie = { name: String(c.name), value: String(c.value) };
    if (domain) cookie.domain = domain;
    else cookie.url = target;
    if (c.path) cookie.path = String(c.path);
    try {
      await setCookie(cookie);
    } catch {
      // 单条 cookie 注入失败（格式/安全限制）静默跳过，不中断采集
    }
  }
}
