/**
 * 翻译词典管理模块
 * @file translationCore/dictionaryManager.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 管理翻译词典的加载和查询
 */

// 词典管理常量
const DEFAULT_MAX_DICT_SIZE = 2000; // 默认最大词典大小
const MAX_KEY_LENGTH_FOR_CASE_VARIANTS = 100; // 生成大小写变体的最大键长度

import { CONFIG } from '../config.js';
import { mergeAllDictionaries } from '../dictionaries/index.js';
import { CacheManager } from '../core/cacheManager.js';
import { Trie } from '../core/trie.js';
import { partialTranslator } from './partialTranslator.js';

export const dictionaryManager = {
  dictionary: {},
  dictionaryHash: new Map(),
  dictionaryTrie: null,
  regexCache: new Map(),
  cacheManager: null,

  init() {
    try {
      let startTime;
      if (CONFIG.debugMode) {
        startTime = Date.now();
      }

      this.cacheManager = new CacheManager(
        CONFIG.performance?.maxDictSize || DEFAULT_MAX_DICT_SIZE,
      );
      this.dictionary = mergeAllDictionaries();
      this.dictionaryHash.clear();
      this.dictionaryTrie = new Trie();
      this.regexCache.clear();

      // 构建哈希表与 Trie 树：哈希用于精确查询，Trie 用于部分匹配
      Object.keys(this.dictionary).forEach((key) => {
        const value = this.dictionary[key];
        if (value && !value.startsWith('待翻译: ')) {
          // 原始键
          this.dictionaryHash.set(key, value);
          // 小写键（用于大小写不敏感匹配）
          if (key.length <= MAX_KEY_LENGTH_FOR_CASE_VARIANTS) {
            this.dictionaryHash.set(key.toLowerCase(), value);
            this.dictionaryHash.set(key.toUpperCase(), value);
          }
          this.dictionaryTrie.insert(key, value);
        }
      });

      if (CONFIG.debugMode) {
        console.log(`[GitHub 中文翻译] 词典初始化耗时: ${Date.now() - startTime}ms`);
        console.log(`[GitHub 中文翻译] 词典条目数量: ${Object.keys(this.dictionary).length}`);
        console.log(`[GitHub 中文翻译] 哈希表条目数量: ${this.dictionaryHash.size}`);
      }
    } catch (error) {
      console.error('[GitHub 中文翻译] 词典初始化失败:', error);
      this.dictionary = {};
      this.dictionaryHash.clear();
    }
  },

  getTranslatedText(text) {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return text;
    }

    const normalizedText = text.trim();

    // 检查最小文本长度
    if (normalizedText.length < (CONFIG.performance?.minTextLengthToTranslate || 3)) {
      return null;
    }

    // 检查缓存
    if (CONFIG.performance?.enableTranslationCache) {
      const cachedResult = this.cacheManager.getFromCache(normalizedText);
      if (cachedResult !== null) {
        return cachedResult;
      }
    }

    // 查询哈希表
    let result = this.dictionaryHash.get(normalizedText);

    // 如果没有找到，尝试大小写不敏感查询
    if (result === null && normalizedText.length <= MAX_KEY_LENGTH_FOR_CASE_VARIANTS) {
      const lowerCaseText = normalizedText.toLowerCase();
      const upperCaseText = normalizedText.toUpperCase();
      result = this.dictionaryHash.get(lowerCaseText) || this.dictionaryHash.get(upperCaseText);
    }

    // 精确匹配仍无结果时，按配置启用 Trie 部分匹配
    if (result === null && CONFIG.performance?.enablePartialMatch) {
      result = partialTranslator.performPartialTranslation(normalizedText, true);
    }

    // 清理文本中的潜在危险内容
    if (result !== null) {
      result = this.sanitizeText(result);
    }

    // 缓存结果
    if (
      CONFIG.performance?.enableTranslationCache &&
      normalizedText.length <= (CONFIG.performance?.maxCachedTextLength || 100)
    ) {
      if (result !== null) {
        this.cacheManager.setToCache(normalizedText, result, false);
      }
    }

    return result;
  },

  sanitizeText(text) {
    // 移除 HTML 标签
    let sanitizedText = text.replace(/<[^>]*>/g, '');
    // 移除事件处理器
    sanitizedText = sanitizedText.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    // 移除危险协议
    sanitizedText = sanitizedText.replace(/javascript:/gi, '');
    sanitizedText = sanitizedText.replace(/data:/gi, '');
    sanitizedText = sanitizedText.replace(/vbscript:/gi, '');
    // 移除危险元素
    sanitizedText = sanitizedText.replace(/expression\([^)]*\)/gi, '');
    sanitizedText = sanitizedText.replace(/<\s*script/gi, '');
    sanitizedText = sanitizedText.replace(/<\s*iframe/gi, '');
    sanitizedText = sanitizedText.replace(/<\s*object/gi, '');
    sanitizedText = sanitizedText.replace(/<\s*embed/gi, '');
    sanitizedText = sanitizedText.replace(/<\s*link/gi, '');
    sanitizedText = sanitizedText.replace(/<\s*style/gi, '');
    return sanitizedText;
  },

  updateDictionary(newDictionary) {
    try {
      Object.assign(this.dictionary, newDictionary);

      Object.keys(newDictionary).forEach((key) => {
        const value = newDictionary[key];
        if (value && !value.startsWith('待翻译: ')) {
          this.dictionaryHash.set(key, value);
          if (key.length <= MAX_KEY_LENGTH_FOR_CASE_VARIANTS) {
            this.dictionaryHash.set(key.toLowerCase(), value);
            this.dictionaryHash.set(key.toUpperCase(), value);
          }
          this.dictionaryTrie?.insert(key, value);
        }
      });

      if (CONFIG.debugMode) {
        console.log(
          `[GitHub 中文翻译] 词典已更新，新增/修改${Object.keys(newDictionary).length}个条目`,
        );
      }
    } catch (error) {
      console.error('[GitHub 中文翻译] 更新词典失败:', error);
    }
  },
};
