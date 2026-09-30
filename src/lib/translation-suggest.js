/**
 * 翻译建议引擎（T21 核心）
 * @file src/lib/translation-suggest.js
 * @version 1.12.13
 * @date 2026-09-30
 * @description 纯函数、无 I/O、无网络：基于现有词典（翻译记忆）为待翻译英文词条给出建议译文。
 *   可选注入 llm 回调实现 LLM 增强；任何异常由调用方负责降级（无 key 时跳过）。
 */

/** 词典「待翻译」占位前缀（未真正翻译的条目） */
const PLACEHOLDER_PREFIX = '待翻译';

/** 各命中来源的置信度（取值即排序：精确 > 大小写 > LLM > 组合拼接） */
const CONFIDENCE = {
  /** 精确命中现有词典 */
  EXACT: 0.95,
  /** 仅大小写不同的命中（可靠性略低于精确） */
  CASE_INSENSITIVE: 0.9,
  /** LLM 生成（无翻译记忆佐证） */
  LLM: 0.8,
  /** 多词逐词拼接（语序未必自然） */
  COMPOSED: 0.6,
  /** 无建议 */
  NONE: 0,
};

/**
 * 判断词典值是否为「待翻译」占位（应被建议引擎忽略）
 * @param {unknown} value
 * @returns {boolean}
 */
export function isPlaceholder(value) {
  return typeof value === 'string' && value.startsWith(PLACEHOLDER_PREFIX);
}

/**
 * 归一化英文词条：去首尾空白、合并连续空白
 * @param {unknown} term
 * @returns {string}
 */
export function normalizeEn(term) {
  return String(term ?? '')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * 将英文拆为基础单词（去标点、转小写），用于组合翻译
 * @param {string} term
 * @returns {string[]}
 */
function toWords(term) {
  return normalizeEn(term)
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

/**
 * 大小写不敏感查词：先精确、再遍历小写匹配
 * @param {Record<string,string>} dictionary
 * @param {string} key
 * @returns {string|undefined}
 */
function lookupCi(dictionary, key) {
  if (Object.prototype.hasOwnProperty.call(dictionary, key)) return dictionary[key];
  const lk = key.toLowerCase();
  for (const k of Object.keys(dictionary)) {
    if (k.toLowerCase() === lk) return dictionary[k];
  }
  return undefined;
}

/**
 * 生成翻译建议
 * @param {string} term 待翻译英文词条
 * @param {object} [opts]
 * @param {Record<string,string>} [opts.dictionary] 合并后的词典（英文→中文）
 * @param {(term:string)=>Promise<string|null>|string|null} [opts.llm] 可选 LLM 回调
 * @returns {Promise<{suggestion:string|null, source:string, confidence:number}>}
 */
export async function suggestTranslation(term, opts = {}) {
  const dictionary = opts.dictionary ?? {};
  const normalized = normalizeEn(term);
  if (!normalized) return { suggestion: null, source: 'empty', confidence: CONFIDENCE.NONE };

  // 1) 精确命中（跳过占位）；区分大小写精确与大小写不敏感命中
  const exactKey = Object.prototype.hasOwnProperty.call(dictionary, normalized)
    ? normalized
    : Object.keys(dictionary).find((k) => k.toLowerCase() === normalized.toLowerCase());
  if (exactKey && !isPlaceholder(dictionary[exactKey])) {
    const ci = exactKey !== normalized;
    return {
      suggestion: dictionary[exactKey],
      source: ci ? 'memory-ci' : 'memory-exact',
      confidence: ci ? CONFIDENCE.CASE_INSENSITIVE : CONFIDENCE.EXACT,
    };
  }

  // 2) 单词组合：每个基础词都是独立词条时拼接
  const words = toWords(normalized);
  if (words.length > 1) {
    const parts = [];
    let ok = true;
    for (const w of words) {
      const hit = lookupCi(dictionary, w);
      if (hit && !isPlaceholder(hit)) parts.push(hit);
      else {
        ok = false;
        break;
      }
    }
    if (ok && parts.length === words.length) {
      return {
        suggestion: parts.join(' '),
        source: 'memory-composed',
        confidence: CONFIDENCE.COMPOSED,
      };
    }
  }

  // 3) 可选 LLM（异常由调用方在回调内处理，这里兜底）
  if (typeof opts.llm === 'function') {
    try {
      const llmOut = await opts.llm(normalized);
      if (typeof llmOut === 'string' && llmOut.trim()) {
        return {
          suggestion: llmOut.trim(),
          source: 'llm',
          confidence: CONFIDENCE.LLM,
        };
      }
    } catch {
      // 降级：忽略 LLM 失败
    }
  }

  return { suggestion: null, source: 'none', confidence: CONFIDENCE.NONE };
}
