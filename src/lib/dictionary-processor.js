/**
 * 词典清洗子进程桥接
 * @file src/lib/dictionary-processor.js
 * @version 1.13.28
 * @date 2026-11-06
 * @description 调用 collect-dict.cjs 清洗原始词条文件，并把子进程输出转为采集事件流。
 *   每请求使用独立临时文件，避免并发请求互相覆盖（竞态，见 v1.9.47）。
 *   修复：stdout/stderr 跨 chunk 断行、spawn error 未监听、取消/超时后误发 done 事件。
 */

import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';
import { spawn } from 'child_process';
import { CollectErrorCode } from './collect-codes.js';

/**
 * 采集事件
 * @typedef {Object} CollectEvent
 * @property {'log'|'error'|'progress'|'done'|'term'} type - 事件类型（term 为结构化词条事件，data.text 为词条文本）
 * @property {string} [message] - 文本消息
 * @property {Record<string, unknown>} [data] - 结构化数据（进度信息 / term 事件的词条文本）
 * @property {number|null} [code] - 子进程退出码（done 事件）或错误码（error 事件）
 */

/** 词典清洗脚本（相对项目根解析） */
const PROCESSOR_SCRIPT = path.join(process.cwd(), 'scripts', 'collect-dict.cjs');
/** 事件轮询间隔（子进程输出为流式，采用短轮询转事件流） */
const QUEUE_POLL_INTERVAL_MS = 100;
/** 子进程告警前缀：此类 stderr 行视为警告而非错误 */
const WARN_PREFIX = '[WARN]';
/** 词条行正则：匹配 `dict-report.cjs` 输出的 `N. "term"` 格式，用于下发结构化 term 事件（S1） */
const TERM_LINE_RE = /^(\d+)\. "(.+)"$/;
/** 子进程硬超时（毫秒） */
const CHILD_TIMEOUT_MS = 120_000;

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
 * 把可读流按行切分，保留跨 chunk 的半行（避免日志/词条行被截断）
 * @param {import('stream').Readable | null} readable - 子进程输出流
 * @param {(line: string) => void} onLine - 完整行的回调
 * @returns {() => void} 流结束时冲刷剩余半行
 */
function pipeLines(readable, onLine) {
  let pending = '';
  readable?.on('data', (chunk) => {
    pending += chunk.toString();
    const lines = pending.split('\n');
    pending = lines.pop() ?? '';
    for (const line of lines) onLine(line);
  });
  return () => {
    if (pending !== '') {
      onLine(pending);
      pending = '';
    }
  };
}

/**
 * 调用 collect-dict.cjs 并把子进程输出转为事件流
 * @param {string} rawTermsFile - 原始词条文件路径（由调用方生成，使用完毕后清理）
 * @param {{ signal?: AbortSignal }} [options] - 取消信号
 * @returns {AsyncGenerator<CollectEvent>} 采集事件流
 */
export async function* runDictionaryProcessor(rawTermsFile, { signal } = {}) {
  const child = spawn(process.execPath, [PROCESSOR_SCRIPT, rawTermsFile], {
    cwd: process.cwd(),
  });

  /** @type {CollectEvent[]} */
  const queue = [];
  let finished = false;
  let sawError = false;
  /** 取消 / 超时 / spawn 失败：此时不得下发 done，否则前端会误报成功 */
  let terminated = false;
  let timer = null;

  const pushLine = (line, type, code) => {
    if (!line.trim()) return;
    queue.push({ type, message: line, code });
  };

  const terminate = (message) => {
    if (terminated) return;
    terminated = true;
    sawError = true;
    queue.push({ type: 'error', message, code: CollectErrorCode.SUBPROCESS_FAILED });
    try {
      child.kill('SIGKILL');
    } catch {}
  };

  // 客户端取消：立即终止子进程并结束事件流（C1）
  const onAbort = () => terminate('请求已取消，已终止词典清洗子进程');
  if (signal) {
    if (signal.aborted) onAbort();
    else signal.addEventListener('abort', onAbort, { once: true });
  }

  if (!terminated) {
    timer = setTimeout(() => {
      terminate(`词典清洗超时（>${CHILD_TIMEOUT_MS / 1000}s），已终止子进程`);
    }, CHILD_TIMEOUT_MS);
  }

  const flushStdout = pipeLines(child.stdout, (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    // 后端解析词条行，下发结构化 term 事件，前端不再依赖 dict-report.cjs 输出格式（S1）
    const m = TERM_LINE_RE.exec(trimmed);
    if (m) queue.push({ type: 'term', data: { text: m[2] } });
    pushLine(line, 'log', undefined);
  });

  const flushStderr = pipeLines(child.stderr, (line) => {
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

  // spawn 失败（ENOENT / EACCES）会触发未捕获的 'error' 事件，必须显式处理
  child.on('error', (error) => {
    terminate(`词典清洗子进程启动失败: ${error instanceof Error ? error.message : String(error)}`);
    finished = true;
  });

  child.on('close', (code) => {
    if (timer) clearTimeout(timer);
    flushStdout();
    flushStderr();
    // 子进程异常退出且无 stderr 错误行时，补一条明确错误事件
    if (!terminated && code !== 0 && !sawError) {
      queue.push({
        type: 'error',
        message: `词典清洗子进程异常退出（退出码 ${code}）`,
        code: CollectErrorCode.SUBPROCESS_FAILED,
      });
    }
    // 正常结束才下发 done；取消 / 超时 / 启动失败仅保留 error，避免 UI 误报 100% 成功
    if (!terminated) queue.push({ type: 'done', code });
    finished = true;
  });

  try {
    for (;;) {
      if (queue.length > 0) {
        yield queue.shift();
        continue;
      }
      if (finished) break;
      await delay(QUEUE_POLL_INTERVAL_MS);
    }
  } finally {
    if (timer) clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onAbort);
    if (!finished) {
      try {
        child.kill('SIGKILL');
      } catch {}
    }
  }
}
