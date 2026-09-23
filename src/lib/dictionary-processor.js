/**
 * 词典清洗子进程桥接
 * @file src/lib/dictionary-processor.js
 * @version 1.9.28
 * @description 调用 collect-dict.cjs 清洗原始词条文件，并把子进程输出转为采集事件流
 */

import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { CollectErrorCode } from './collect-codes.js';

/**
 * 采集事件
 * @typedef {Object} CollectEvent
 * @property {'log'|'error'|'progress'|'done'} type - 事件类型
 * @property {string} [message] - 文本消息
 * @property {Record<string, unknown>} [data] - 结构化数据（进度信息）
 * @property {number|null} [code] - 子进程退出码
 */

/** 采集原始文本落在系统临时目录，避免污染仓库工作区 */
export const RAW_TERMS_FILE = path.join(os.tmpdir(), 'github-i18n-raw-terms.txt');
/** 词典清洗脚本（相对项目根解析） */
const PROCESSOR_SCRIPT = path.join(process.cwd(), 'collect-dict.cjs');
const QUEUE_POLL_INTERVAL_MS = 100;

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
export async function* runDictionaryProcessor() {
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
          queue.push({
            type,
            message: line,
            code: type === 'error' ? CollectErrorCode.SUBPROCESS_FAILED : undefined,
          });
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
