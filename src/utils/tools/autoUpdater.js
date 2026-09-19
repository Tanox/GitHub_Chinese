/**
 * 自动字符串更新工具
 * @file src/utils/tools/autoUpdater.js
 * @version 1.9.24
 */
import { stringExtractor } from './stringExtractor.js';

export class AutoStringUpdater {
  static findStringsToAdd() {
    const untranslated = stringExtractor.findUntranslatedStrings(false);
    return new Set(Array.from(untranslated).filter((str) => !str.startsWith('待翻译: ')));
  }

  static generateUpdateReport() {
    const stringsToAdd = AutoStringUpdater.findStringsToAdd();
    return {
      timestamp: new Date().toISOString(),
      pageUrl: window.location.href,
      pageTitle: document.title,
      stringsToAdd: Array.from(stringsToAdd),
      totalNew: stringsToAdd.size,
    };
  }

  static showReportInConsole() {
    const report = AutoStringUpdater.generateUpdateReport();
    console.log('[GitHub 中文翻译] 字符串更新报告');
    console.log(`📄 页面: ${report.pageTitle}`);
    console.log(`✅ 找到 ${report.totalNew} 个新字符串`);
  }
}
