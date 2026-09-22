/**
 * 词典采集核心
 * @file src/lib/collector-core.js
 * @version 1.9.26
 * @description 采集流水线的唯一实现，Next Route Handler 与原型预览服务器共用，避免两份逻辑长期漂移
 */

import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
import { spawn } from 'child_process';

/**
 * 采集事件
 * @typedef {Object} CollectEvent
 * @property {'log'|'error'|'progress'|'done'} type - 事件类型
 * @property {string} [message] - 文本消息
 * @property {Record<string, unknown>} [data] - 结构化数据（进度信息）
 * @property {number|null} [code] - 子进程退出码
 */

/** 采集原始文本落在系统临时目录，避免污染仓库工作区 */
const RAW_TERMS_FILE = path.join(os.tmpdir(), 'github-i18n-raw-terms.txt');
/** 词典清洗脚本（相对项目根解析） */
const PROCESSOR_SCRIPT = path.join(process.cwd(), 'collect-dict.cjs');
const QUEUE_POLL_INTERVAL_MS = 100;
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
 * 等待指定毫秒
 * @param {number} ms - 毫秒数
 * @returns {Promise<void>} 等待完成的 Promise
 */
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * 调用 collect-dict.cjs 并把子进程输出转为事件流
 * @returns {AsyncGenerator<CollectEvent>} 采集事件流
 */
async function* runDictionaryProcessor() {
  const child = spawn(process.execPath, [PROCESSOR_SCRIPT, RAW_TERMS_FILE], {
    cwd: process.cwd(),
  });

  /** @type {CollectEvent[]} */
  const queue = [];
  let finished = false;

  /**
   * 将子进程输出按行入队
   * @param {Buffer} chunk - 输出块
   * @param {'log'|'error'} type - 事件类型
   */
  const pushLines = (chunk, type) => {
    chunk
      .toString()
      .split('\n')
      .forEach((line) => {
        if (line.trim()) {
          queue.push({ type, message: line });
        }
      });
  };

  child.stdout?.on('data', (chunk) => pushLines(chunk, 'log'));
  child.stderr?.on('data', (chunk) => pushLines(chunk, 'error'));
  child.on('close', (code) => {
    queue.push({ type: 'done', code });
    finished = true;
  });

  for (;;) {
    if (queue.length > 0) {
      yield queue.shift();
      continue;
    }
    if (finished) {
      break;
    }
    await delay(QUEUE_POLL_INTERVAL_MS);
  }
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

        const texts = await page.evaluate(
          /**
           * 提取页面正文中的有效文本块
           * @param {number} minLength - 最短长度
           * @param {number} maxLength - 最长长度
           * @returns {string[]} 文本块列表
           */
          (minLength, maxLength) => {
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
          },
          MIN_TEXT_LENGTH,
          MAX_TEXT_LENGTH,
        );

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
