/**
 * 可选浏览器依赖解析
 * @file src/lib/browser-resolver.js
 * @version 1.9.32
 * @description 运行时解析 puppeteer-core 模块与系统浏览器可执行路径，供批量抓取使用。
 *   `puppeteer-core` 不自带浏览器内核，需配合系统已安装的 Chrome / Edge（或由环境变量指定）。
 *   模块加载采用动态 import + turbopackIgnore，避免打包器静态处理该可选 ESM 依赖而产生构建告警。
 */
import fs from 'fs';

/** 包名以变量形式传入，避免打包器在构建期静态解析 */
const CORE_PACKAGE = 'puppeteer-core';

/** 各平台常见浏览器可执行路径候选（按优先级） */
const BROWSER_CANDIDATES = {
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ],
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ],
  linux: [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/microsoft-edge',
  ],
};

/**
 * 运行时加载 puppeteer-core 依赖
 * @returns {Promise<any|null>} 模块对象，未安装时返回 null
 */
export async function loadPuppeteerCore() {
  try {
    const mod = await import(/* turbopackIgnore: true */ CORE_PACKAGE);
    return mod.default ?? mod;
  } catch {
    return null;
  }
}

/**
 * 解析浏览器可执行文件路径：优先环境变量，其次平台常见安装路径
 * @returns {string|null} 可执行文件路径，未找到返回 null
 */
export function resolveBrowserExecutable() {
  const fromEnv = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (fromEnv && fs.existsSync(fromEnv)) {
    return fromEnv;
  }
  const candidates = BROWSER_CANDIDATES[process.platform] ?? [];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}
