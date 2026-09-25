/**
 * 词典清洗子进程桥接
 * @file src/lib/dictionary-processor.js
 * @version 1.9.47
 * @description 调用 collect-dict.cjs 清洗原始词条文件，并把子进程输出转为采集事件流。
 *   每请求使用独立临时文件，避免并发请求互相覆盖（竞态，见 v1.9.47）。
 */

import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';
import { spawn } from 'child_process';
import { CollectErrorCode } from './collect-codes.js';

/**
 * 采集事件
 * @typedef {Object} CollectEvent
 * @property {'log'|'error'|'progress'|'done'} type - 事件类型
 * @property {string} [message] - 文本消息
 * @property {Record<string, unknown>} [data] - 结构化数据（进度信息）
 * @property {number|null} [code] - 子进程退出码（done 事件）或错误码（error 事件）
 */

/** 词典清洗脚本（相对项目根解析） */
const PROCESSOR_SCRIPT = path.join(process.cwd(), 'collect-dict.cjs');
/** 事件轮询间隔（子进程输出为流式，采用短轮询转事件流） */
const QUEUE_POLL_INTERVAL_MS = 100;
/** 子进程告警前缀：此类 stderr 行视为警告而非错误 */
const WARN_PREFIX = '[WARN]';

/**
 * 为单次采集生成独立的原始文本临时文件路径
 * @returns {string} 临时文件路径（使用后即删除，避免并发请求共享同一文件导致竞态）
 */
export function createRawTermsPath() {
  return path.join(os.tmpdir(), `github-i18n-raw-${randomUUID()}.txt`);
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
 * @param {string} rawTermsFile - 原始词条文件路径（由调用方生成，使用完毕后清理）
 * @returns {AsyncGenerator<CollectEvent>} 采集事件流
 */
export async function* runDictionaryProcessor(rawTermsFile) {
  const child = spawn(process.execPath, [PROCESSOR_SCRIPT, rawTermsFile], {
    cwd: process.cwd(),
  });

  /** @type {CollectEvent[]} */
  const queue = [];
  let finished = false;
  let sawError = false;

  const pushLine = (line, type, code) => {
    if (!line.trim()) return;
    queue.push({ type, message: line, code });
  };

  child.stdout?.on('data', (chunk) => {
    chunk
      .toString()
      .split('\n')
      .forEach((line) => pushLine(line, 'log', undefined));
  });

  child.stderr?.on('data', (chunk) => {
    chunk
      .toString()
      .split('\n')
      .forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        // 区分告警与错误：仅 [WARN] 前缀视为警告，避免把解析告警误报成失败（v1.9.47）
        if (trimmed.startsWith(WARN_PREFIX)) {
          pushLine(trimmed, 'log', undefined);
        } else {
          sawError = true;
          pushLine(trimmed, 'error', CollectErrorCode.SUBPROCESS_FAILED);
        }
      });
  });

  child.on('close', (code) => {
    // 子进程异常退出且无 stderr 错误行时，补一条明确错误事件
    if (code !== 0 && !sawError) {
      queue.push({
        type: 'error',
        message: `词典清洗子进程异常退出（退出码 ${code}）`,
        code: CollectErrorCode.SUBPROCESS_FAILED,
      });
    }
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
