/**
 * 字符串提取工具
 * @file src/utils/tools/stringExtractor.js
 */
import { utils } from '../utils.js';
import { translationModule } from '../../dictionaries/index.js';

export const stringExtractor = {
  collectStrings(showInConsole = true) {
    const strings = new Set();
    utils.collectTextNodes(document.body, strings);

    if (showInConsole) {
      console.log(`[GitHub 中文翻译] 收集到 ${strings.size} 个字符串`);
      console.log('收集到的字符串:', strings);
    }

    return strings;
  },

  findUntranslatedStrings(showInConsole = true) {
    const allStrings = this.collectStrings(false);
    const untranslated = new Set();

    const mergedDictionary = {};
    for (const module in translationModule) {
      if (Object.prototype.hasOwnProperty.call(translationModule, module)) {
        Object.assign(mergedDictionary, translationModule[module]);
      }
    }

    allStrings.forEach((string) => {
      if (!mergedDictionary[string] || mergedDictionary[string].startsWith('待翻译: ')) {
        untranslated.add(string);
      }
    });

    if (showInConsole) {
      console.log(`[GitHub 中文翻译] 找到 ${untranslated.size} 个未翻译的字符串`);
      console.log('未翻译的字符串:', untranslated);
    }

    return untranslated;
  },
};
