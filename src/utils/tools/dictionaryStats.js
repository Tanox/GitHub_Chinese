/**
 * 词典统计工具
 * @file src/utils/tools/dictionaryStats.js
 * @version 1.12.8
 * @description 与 src/lib/dictionary-processor.js（采集清洗子进程桥接）同名易混，
 *   此处仅做词典合并与统计，不涉及任何子进程调用。
 */
import { mergeAllDictionaries } from '../../dictionaries/index.js';
import { stringExtractor } from './stringExtractor.js';

export class DictionaryStats {
  static mergeDictionaries() {
    return mergeAllDictionaries();
  }

  static validateDictionary() {
    const dictionary = DictionaryStats.mergeDictionaries();
    const total = Object.keys(dictionary).length;
    const untranslated = Array.from(stringExtractor.findUntranslatedStrings(false)).length;
    return {
      totalEntries: total,
      translatedEntries: total - untranslated,
      completionRate: total > 0 ? (((total - untranslated) / total) * 100).toFixed(2) : '0.00',
    };
  }

  static showStatisticsInConsole() {
    const stats = DictionaryStats.validateDictionary();
    console.log('[GitHub 中文翻译] 词典统计');
    console.log(`📊 总条目数: ${stats.totalEntries}`);
    console.log(`✅ 已翻译条目: ${stats.translatedEntries}`);
    console.log(`📈 完成率: ${stats.completionRate}%`);
  }
}
