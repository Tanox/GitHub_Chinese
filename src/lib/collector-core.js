/**
 * 词典采集核心
 * @file src/lib/collector-core.js
 * @version 1.9.26
 * @description 采集流水线的唯一实现，Next Route Handler 与原型预览服务器共用，避免两份逻辑长期漂移
 */

import fs from 'fs/promises';
import { createRequire } from 'module';
import { RAW_TERMS_FILE, runDictionaryProcessor } from './dictionary-processor.js';

/**
 * @typedef {import('./dictionary-processor.js').CollectEvent} CollectEvent
 */

const NAVIGATION_TIMEOUT_MS = 30_000;
const MIN_TEXT_LENGTH = 2;
const MAX_TEXT_LENGTH = 300;

/** 未安装可选依赖时的提示（批量抓取依赖 puppeteer 提供的浏览器内核） */
const MISSING_PUPPETEER_MESSAGE =
  '未检测到 puppeteer 依赖，无法启动批量抓取。请先执行 npm install puppeteer 后重试。';

/** 可选依赖名以变量形式传入，避免打包器在构建期静态解析未安装的包 */
const PUPPETEER_PACKAGE = 'puppeteer';
const nodeRequire = createRequire(import.meta.url);

/**
 * 运行时加载可选的 puppeteer 依赖
 * @returns {any|null} puppeteer 模块对象，未安装时返回 null
 */
function loadPuppeteer() {
  try {
    return nodeRequire(PUPPETEER_PACKAGE);
  } catch {
    return null;
  }
}

/**
 * 将错误转换为可读消息
 * @param {unknown} error - 捕获到的异常
 * @returns {string} 错误消息
 */
function describeError(error) {
  return error instanceof Error ? error.message : String(error);
}

/**
 * 提取页面正文中的有效文本块（在浏览器上下文中执行，须自包含）
 * @param {number} minLength - 最短长度
 * @param {number} maxLength - 最长长度
 * @returns {string[]} 文本块列表
 */
function extractPageText(minLength, maxLength) {
  const collected = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    const text = node.textContent?.trim() ?? '';
    if (text.length > minLength && text.length <= maxLength) {
      collected.push(text);
    }
    node = walker.nextNode();
  }
  return collected;
}

/**
 * 批量抓取 URL 页面文本并交由词典清洗
 * @param {string[]} urls - 目标页面 URL 列表
 * @returns {AsyncGenerator<CollectEvent>} 采集事件流
 */
export async function* collectFromUrls(urls) {
  const puppeteer = loadPuppeteer();
  if (!puppeteer) {
    yield { type: 'error', message: MISSING_PUPPETEER_MESSAGE };
    return;
  }

  const allTexts = new Set();
  const total = urls.length;
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    yield { type: 'log', message: '正在初始化 Headless 浏览器...' };

    for (let i = 0; i < total; i += 1) {
      const url = urls[i];
      yield { type: 'log', message: `[${i + 1}/${total}] 正在访问: ${url}` };
      yield { type: 'progress', data: { type: 'fetch', current: i + 1, total, url } };

      const page = await browser.newPage();
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: NAVIGATION_TIMEOUT_MS });

        const texts = await page.evaluate(extractPageText, MIN_TEXT_LENGTH, MAX_TEXT_LENGTH);

        texts.forEach((text) => allTexts.add(text));
        yield { type: 'log', message: `成功从 ${url} 提取 ${texts.length} 条文本` };
      } catch (error) {
        yield { type: 'error', message: `处理 ${url} 时失败: ${describeError(error)}` };
      } finally {
        await page.close();
      }
    }

    yield { type: 'log', message: '页面提取完成，开始保存并分析词典...' };
    yield { type: 'progress', data: { type: 'analyze' } };

    await fs.writeFile(RAW_TERMS_FILE, Array.from(allTexts).join('\n'), 'utf-8');
    yield* runDictionaryProcessor();
  } catch (error) {
    yield { type: 'error', message: describeError(error) };
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
  await fs.writeFile(RAW_TERMS_FILE, data, 'utf-8');
  yield* runDictionaryProcessor();
}
