/**
 * 覆盖率 / 缺口看板取数（T22，服务端）
 * @file src/lib/coverage-report.ts
 * @version 1.11.16
 * @description 基于磁盘词典实时计算翻译覆盖率、按文件细分、Top-N 缺口与重复/冲突检测。
 *   纯服务端模块（依赖 fs / process.cwd），仅由服务端组件调用，严禁在客户端组件引用。
 */
import fs from 'fs';
import path from 'path';
import { mergeAllDictionaries } from '@/dictionaries/index';
import { commonDictionary } from '@/dictionaries/common';
import { codespacesDictionary } from '@/dictionaries/codespaces';
import { exploreDictionary } from '@/dictionaries/explore';

/** 待翻译占位前缀：值为「待翻译: x」的条目视作词典缺口 */
const UNTRANSLATED_PREFIX = '待翻译: ';
/** 最近一次采集的未翻译词条语料（由 collect-dict.cjs 的 generateReport 写出） */
const TERMS_FILE = path.join(process.cwd(), 'docs', 'untranslated-terms.txt');

export interface FileCoverage {
  /** 词典模块名（common/codespaces/explore…） */
  name: string;
  total: number;
  translated: number;
  untranslated: number;
  /** 已翻译占比 0~1 */
  rate: number;
}

export interface ConflictItem {
  /** 跨模块同键 */
  key: string;
  /** 该键出现过的不同译文 */
  values: string[];
  /** 出现该键的模块名 */
  modules: string[];
}

export interface NearDuplicateItem {
  /** 归一化后的键 */
  norm: string;
  /** 字面不同的近似键集合 */
  keys: string[];
}

export interface CoverageReport {
  total: number;
  translated: number;
  untranslated: number;
  rate: number;
  byFile: FileCoverage[];
  /** 同键多值冲突 */
  conflicts: ConflictItem[];
  /** 跨模块重复键数（含冲突与一致重复） */
  duplicateKeys: number;
  /** 近似键簇（大小写/空白/标点差异的同义键） */
  nearDuplicates: NearDuplicateItem[];
  /** Top-N 采集缺口词条 */
  gaps: string[];
  /** 是否存在采集语料文件 */
  hasCorpus: boolean;
}

/** 统计单个词典对象的翻译/缺口分布 */
function statsOf(dict: Record<string, string>): Omit<FileCoverage, 'name'> {
  const entries = Object.entries(dict);
  const total = entries.length;
  let translated = 0;
  let untranslated = 0;
  for (const [, value] of entries) {
    if (value.startsWith(UNTRANSLATED_PREFIX)) untranslated += 1;
    else translated += 1;
  }
  return { total, translated, untranslated, rate: total > 0 ? translated / total : 0 };
}

/** 轻量键归一化（与 collect-dict.cjs normalizeText 思路一致，用于近似键聚类） */
function normKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/^[\s\p{P}]+|[\s\p{P}]+$/gu, '')
    .replace(/\s+/g, ' ');
}

/**
 * 计算覆盖率看板所需的全部指标（每次调用实时扫描磁盘词典）
 * @returns 覆盖率报告
 */
export function getCoverageReport(): CoverageReport {
  const modules: Record<string, Record<string, string>> = {
    common: commonDictionary as Record<string, string>,
    codespaces: codespacesDictionary as Record<string, string>,
    explore: exploreDictionary as Record<string, string>,
  };

  const byFile: FileCoverage[] = Object.entries(modules).map(([name, dict]) => ({
    name,
    ...statsOf(dict),
  }));

  const merged = mergeAllDictionaries() as Record<string, string>;
  const mergedStats = statsOf(merged);

  // 跨模块重复 / 冲突检测：同键在多个模块出现
  const keyMap = new Map<string, { module: string; value: string }[]>();
  for (const [module, dict] of Object.entries(modules)) {
    for (const [key, value] of Object.entries(dict)) {
      if (!keyMap.has(key)) keyMap.set(key, []);
      keyMap.get(key)!.push({ module, value });
    }
  }
  const conflicts: ConflictItem[] = [];
  let duplicateKeys = 0;
  for (const [key, occ] of keyMap) {
    if (occ.length > 1) {
      duplicateKeys += 1;
      const values = [...new Set(occ.map((o) => o.value))];
      if (values.length > 1) {
        conflicts.push({ key, values, modules: occ.map((o) => o.module) });
      }
    }
  }

  // 近似键检测：归一化后相同但字面不同的键（大小写/空白/标点差异）
  const normGroups = new Map<string, string[]>();
  for (const key of Object.keys(merged)) {
    const nk = normKey(key);
    if (!normGroups.has(nk)) normGroups.set(nk, []);
    normGroups.get(nk)!.push(key);
  }
  const nearDuplicates: NearDuplicateItem[] = [];
  for (const [norm, keys] of normGroups) {
    const distinct = [...new Set(keys)];
    if (distinct.length > 1) nearDuplicates.push({ norm, keys: distinct });
  }

  // 采集语料缺口（docs/untranslated-terms.txt，每行 "term"）
  let gaps: string[] = [];
  let hasCorpus = false;
  try {
    if (fs.existsSync(TERMS_FILE)) {
      gaps = fs
        .readFileSync(TERMS_FILE, 'utf-8')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => line.replace(/^"(.*)"$/, '$1'));
      hasCorpus = gaps.length > 0;
    }
  } catch {
    gaps = [];
  }

  return {
    total: mergedStats.total,
    translated: mergedStats.translated,
    untranslated: mergedStats.untranslated,
    rate: mergedStats.rate,
    byFile,
    conflicts,
    duplicateKeys,
    nearDuplicates,
    gaps,
    hasCorpus,
  };
}
