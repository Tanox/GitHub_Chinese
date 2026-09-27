/**
 * 词典处理工具
 * @file src/utils/tools/dictionaryProcessor.js
 * @version 1.12.4
 */
import { mergeAllDictionaries } from '../../dictionaries/index.js';
import { stringExtractor } from './stringExtractor.js';

export class DictionaryProcessor {
  static mergeDictionaries() {
    return mergeAllDictionaries();
  }

  static validateDictionary() {
    const dictionary = DictionaryProcessor.mergeDictionaries();
    const total = Object.keys(dictionary).length;
    const untranslated = Array.from(stringExtractor.findUntranslatedStrings(false)).length;
    return {
      totalEntries: total,
      translatedEntries: total - untranslated,
      completionRate: total > 0 ? (((total - untranslated) / total) * 100).toFixed(2) : '0.00',
    };
  }

  static showStatisticsInConsole() {
    const stats = DictionaryProcessor.validateDictionary();
    console.log('[GitHub 中文翻译] 词典统计');
    console.log(`📊 总条目数: ${stats.totalEntries}`);
    console.log(`✅ 已翻译条目: ${stats.translatedEntries}`);
    console.log(`📈 完成率: ${stats.completionRate}%`);
  }
}
