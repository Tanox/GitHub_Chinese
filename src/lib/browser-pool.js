/**
 * 浏览器实例池（复用单例，降低每请求启动开销）
 * @file src/lib/browser-pool.js
 * @version 1.13.2
 * @date 2026-09-30
 * @author Sut
 * @description 在进程内复用单个 puppeteer-core 浏览器实例，避免每次采集请求都 launch/close
 *   （M5 性能优化）。并发仍由 browser-semaphore 控制（限制同时进行的采集任务数）。
 *   浏览器意外断开时自动清空单例，下次 acquire 重建。
 */

import { loadPuppeteerCore, resolveBrowserExecutable } from './browser-resolver.js';

/** 进程内复用的浏览器实例（单例） */
let browser = null;
/** 创建中的 Promise，避免并发重复创建 */
let creating = null;

/**
 * 构造 Chromium 启动参数：容器内非 root 用户运行时不强制 --no-sandbox（提升隔离）；
 * 以 root 运行（如部分容器默认 root）必须 --no-sandbox，否则 Chromium 拒绝启动。
 * --disable-dev-shm-usage 缓解容器 /dev/shm 过小导致的崩溃。
 * @returns {string[]}
 */
function buildLaunchArgs() {
  const args = ['--disable-setuid-sandbox', '--disable-dev-shm-usage'];
  const isRoot = typeof process.getuid === 'function' ? process.getuid() === 0 : false;
  if (isRoot) args.push('--no-sandbox');
  return args;
}

/**
 * 创建并缓存浏览器实例；实例断开时清空缓存
 * @returns {Promise<import('puppeteer-core').Browser|null>}
 */
async function createBrowser() {
  const puppeteer = await loadPuppeteerCore();
  if (!puppeteer) return null;
  const executablePath = resolveBrowserExecutable();
  if (!executablePath) return null;
  try {
    const instance = await puppeteer.launch({
      headless: true,
      executablePath,
      args: buildLaunchArgs(),
    });
    instance.on('disconnected', () => {
      if (browser === instance) {
        browser = null;
        creating = null;
      }
    });
    return instance;
  } catch {
    return null;
  }
}

/**
 * 获取一个可复用的浏览器实例
 * @returns {Promise<{ browser: import('puppeteer-core').Browser | null, error: string | null }>}
 *   error 取值：'MISSING_DEPENDENCY' | 'MISSING_BROWSER' | 'LAUNCH_FAILED' | null
 */
export async function acquireBrowser() {
  if (browser && browser.connected) return { browser, error: null };
  if (!creating) creating = createBrowser();
  const instance = await creating;
  if (!instance || !instance.connected) {
    browser = null;
    creating = null;
    if (!(await loadPuppeteerCore())) return { browser: null, error: 'MISSING_DEPENDENCY' };
    if (!resolveBrowserExecutable()) return { browser: null, error: 'MISSING_BROWSER' };
    return { browser: null, error: 'LAUNCH_FAILED' };
  }
  browser = instance;
  return { browser, error: null };
}

/**
 * 归还浏览器实例（复用模式：仅标记可再次获取，不关闭进程内单例）
 */
export function releaseBrowser() {
  // 单例复用：此处无需关闭浏览器，仅由 disconnected 事件或 closeBrowserPool 回收
}

/**
 * 进程退出时关闭浏览器实例，释放系统资源（可由上层在 SIGTERM 钩子中调用）
 */
export function closeBrowserPool() {
  creating = null;
  if (browser) {
    const b = browser;
    browser = null;
    b.close().catch(() => {});
  }
}
