/**
 * 词典采集服务端逻辑
 * @file src/lib/collector-logic.ts
 * @version 1.9.25
 * @description 为 Next.js Route Handler 提供采集能力：Headless 抓取页面文本 + 调用词典清洗脚本
 */

import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import type { ChildProcess } from 'child_process';

export type CollectEventType = 'log' | 'error' | 'progress' | 'done';

export interface CollectEvent {
  type: CollectEventType;
  message?: string;
  data?: Record<string, unknown>;
  code?: number | null;
}

/** 采集原始文本落在系统临时目录，避免污染仓库工作区 */
const RAW_TERMS_FILE = path.join(os.tmpdir(), 'github-i18n-raw-terms.txt');
const PROCESSOR_SCRIPT = path.join(process.cwd(), 'collect-dict.cjs');
const QUEUE_POLL_INTERVAL_MS = 100;
const NAVIGATION_TIMEOUT_MS = 30_000;
const MIN_TEXT_LENGTH = 2;
const MAX_TEXT_LENGTH = 300;

/** 未安装可选依赖时的提示（批量抓取依赖 puppeteer 提供的浏览器内核） */
const MISSING_PUPPETEER_MESSAGE =
  '未检测到 puppeteer 依赖，无法启动批量抓取。请先执行 npm install puppeteer 后重试。';

/**
 * 批量抓取 URL 页面文本并交由词典清洗
 * @param urls - 目标页面 URL 列表
 * @returns 采集事件流
 */
export async function* collectFromUrls(urls: string[]): AsyncGenerator<CollectEvent> {
  let puppeteer: typeof import('puppeteer');
  try {
    puppeteer = await import('puppeteer');
  } catch {
    yield { type: 'error', message: MISSING_PUPPETEER_MESSAGE };
    return;
  }

  const allTexts = new Set<string>();
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
          (minLength: number, maxLength: number) => {
            const collected: string[] = [];
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
 * @param data - 粘贴的原始文本
 * @returns 采集事件流
 */
export async function* processRawData(data: string): AsyncGenerator<CollectEvent> {
  await fs.writeFile(RAW_TERMS_FILE, data, 'utf-8');
  yield* runDictionaryProcessor();
}

/**
 * 将错误转换为可读消息
 * @param error - 捕获到的异常
 * @returns 错误消息
 */
function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * 调用 collect-dict.cjs 并把子进程输出转为事件流
 * @returns 采集事件流
 */
async function* runDictionaryProcessor(): AsyncGenerator<CollectEvent> {
  const child: ChildProcess = spawn(process.execPath, [PROCESSOR_SCRIPT, RAW_TERMS_FILE], {
    cwd: process.cwd(),
  });

  const queue: CollectEvent[] = [];
  let finished = false;

  const pushLines = (chunk: Buffer, type: 'log' | 'error'): void => {
    chunk
      .toString()
      .split('\n')
      .forEach((line) => {
        if (line.trim()) {
          queue.push({ type, message: line });
        }
      });
  };

  child.stdout?.on('data', (chunk: Buffer) => pushLines(chunk, 'log'));
  child.stderr?.on('data', (chunk: Buffer) => pushLines(chunk, 'error'));
  child.on('close', (code) => {
    queue.push({ type: 'done', code });
    finished = true;
  });

  while (!finished || queue.length > 0) {
    if (queue.length > 0) {
      yield queue.shift() as CollectEvent;
    } else {
      await new Promise((resolve) => setTimeout(resolve, QUEUE_POLL_INTERVAL_MS));
    }
  }
}
