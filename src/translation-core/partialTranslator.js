/**
 * 部分匹配翻译模块
 * @file src/translation-core/partialTranslator.js
 * @version 1.9.26
 * @date 2026-09-22
 * @author Sut
 * @description 使用 Trie 树进行部分匹配翻译；查询上下文由调用方注入，避免与 dictionaryManager 形成循环依赖
 */
import { utils } from '../utils/utils.js';

export const partialTranslator = {
  /**
   * 基于 Trie 树的长词优先部分替换
   * @param {string} text - 待处理文本
   * @param {boolean} [enablePartialMatch] - 是否启用部分匹配
   * @param {{dictionary: Object, dictionaryTrie: Object, regexCache: Map}} [store] - 词典上下文
   * @returns {string|null} 替换结果，无可替换内容时返回 null
   */
  performPartialTranslation(text, enablePartialMatch = false, store = null) {
    if (!enablePartialMatch || !store || !store.dictionaryTrie) {
      return null;
    }

    const textLen = text.length;
    if (textLen < 5) {
      return null;
    }

    const matches = [];
    const minKeyLength = Math.min(4, Math.floor(textLen / 2));
    const potentialMatches = store.dictionaryTrie.findAllMatches(text, minKeyLength);

    for (const match of potentialMatches) {
      const key = match.key;
      if (
        !Object.prototype.hasOwnProperty.call(store.dictionary, key) ||
        store.dictionary[key].startsWith('待翻译: ')
      ) {
        continue;
      }

      const value = store.dictionary[key];

      if (/^[0-9.,\s()[\]{}/*^$#@!~`|:;"'?>+-]+$/i.test(key)) {
        continue;
      }

      const wordRegexKey = `word_${key}`;
      let wordRegex;

      if (store.regexCache.has(wordRegexKey)) {
        wordRegex = store.regexCache.get(wordRegexKey);
      } else {
        wordRegex = utils.safeRegExp('\\b' + utils.escapeRegExp(key) + '\\b', 'gi');
        if (wordRegex) {
          store.regexCache.set(wordRegexKey, wordRegex);
        } else {
          continue;
        }
      }

      const wordMatches = text.match(wordRegex);

      if (wordMatches && wordMatches.length > 0) {
        matches.push({
          key,
          value,
          length: key.length,
          matches: wordMatches.length,
          regex: wordRegex,
        });
      } else {
        const nonWordRegexKey = `nonword_${key}`;
        let nonWordRegex;

        if (store.regexCache.has(nonWordRegexKey)) {
          nonWordRegex = store.regexCache.get(nonWordRegexKey);
        } else {
          nonWordRegex = utils.safeRegExp(utils.escapeRegExp(key), 'g');
          if (nonWordRegex) {
            store.regexCache.set(nonWordRegexKey, nonWordRegex);
          } else {
            continue;
          }
        }

        matches.push({
          key,
          value,
          length: key.length,
          matches: 1,
          regex: nonWordRegex,
        });
      }
    }

    if (matches.length === 0) {
      return null;
    }

    matches.sort((a, b) => {
      if (b.length !== a.length) {
        return b.length - a.length;
      }
      return b.matches - a.matches;
    });

    let result = text;
    let hasReplaced = false;
    const maxReplacements = Math.min(5, matches.length);

    for (let i = 0; i < maxReplacements; i++) {
      const match = matches[i];
      const newResult = result.replace(match.regex, match.value);

      if (newResult !== result) {
        result = newResult;
        hasReplaced = true;
      }
    }

    return hasReplaced ? result : null;
  },
};
