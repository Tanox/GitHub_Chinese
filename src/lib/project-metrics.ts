/**
 * 项目指标（服务端）
 * @file src/lib/project-metrics.ts
 * @version 1.9.26
 * @description 磁盘指标在模块加载时一次性计算，供「项目概览」页展示；严禁在客户端组件中引用
 */

import fs from 'fs';
import path from 'path';
import { mergeAllDictionaries } from '@/dictionaries/index';
import { VERSION } from '@/version';

/** 计入源码统计的扩展名 */
const SOURCE_EXT_RE = /\.(js|cjs|mjs|ts|tsx|css)$/;
/** 原型页面扩展名 */
const HTML_EXT_RE = /\.html$/;
/** 统计时跳过的目录 */
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'build', 'dist', 'coverage']);

export interface ProjectMetrics {
  /** 单一版本源 src/version.js */
  version: string;
  /** 词典词条总数 */
  dictionaryEntries: number;
  /** 词典模块文件数 */
  dictionaryModules: number;
  /** src 下源码文件数（含工作台） */
  sourceFiles: number;
  /** src 下源码总行数 */
  sourceLines: number;
  /** 用户脚本产物体积（KB，保留一位小数） */
  artifactKB: number;
  /** 原型页面数量 */
  prototypePages: number;
}

/** 单次采集记录（由 `collect-dict.cjs` 写入 docs/collect-history.json） */
export interface CollectRecord {
  /** ISO 时间戳 */
  time: string;
  /** 本轮待翻译词条总数 */
  total: number;
  /** 相比上一轮新增数 */
  added: number;
  /** 相比上一轮移除数 */
  removed: number;
}

/**
 * 递归收集匹配扩展名的文件
 * @param dir - 起始目录
 * @param extRe - 扩展名正则
 * @param acc - 累积结果
 * @returns 文件绝对路径列表
 */
function listFiles(dir: string, extRe: RegExp, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) {
    return acc;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listFiles(full, extRe, acc);
    } else if (extRe.test(entry.name)) {
      acc.push(full);
    }
  }

  return acc;
}

/**
 * 统计文件总行数
 * @param files - 文件绝对路径列表
 * @returns 行数合计
 */
function countLines(files: string[]): number {
  return files.reduce(
    (total, file) => total + fs.readFileSync(file, 'utf-8').split('\n').length,
    0,
  );
}

/**
 * 读取用户脚本产物体积
 * @returns KB 数值，产物缺失时返回 0
 */
function readArtifactKB(): number {
  const artifact = path.join(process.cwd(), 'build', 'GitHub_i18n.user.js');
  if (!fs.existsSync(artifact)) {
    return 0;
  }
  return Math.round((fs.statSync(artifact).size / 1024) * 10) / 10;
}

const ROOT = process.cwd();
const SOURCE_FILES = listFiles(path.join(ROOT, 'src'), SOURCE_EXT_RE);

/** 采集历史文件（与 collect-dict.cjs 的写入路径一致） */
const HISTORY_FILE = path.join(ROOT, 'docs', 'collect-history.json');

/**
 * 读取采集历史（文件缺失或损坏时返回空数组）
 * @returns 采集记录列表（旧 → 新）
 */
function readCollectHistory(): CollectRecord[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** 静态指标：同一进程内只计算一次 */
export const projectMetrics: ProjectMetrics = {
  version: VERSION,
  dictionaryEntries: Object.keys(mergeAllDictionaries()).length,
  dictionaryModules: listFiles(path.join(ROOT, 'src', 'dictionaries'), /\.js$/).length,
  sourceFiles: SOURCE_FILES.length,
  sourceLines: countLines(SOURCE_FILES),
  artifactKB: readArtifactKB(),
  prototypePages: listFiles(path.join(ROOT, 'prototype'), HTML_EXT_RE).length,
};

/** 采集历史：供「项目概览」页展示采集趋势 */
export const collectHistory: CollectRecord[] = readCollectHistory();
