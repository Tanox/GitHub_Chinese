/**
 * 自动字符串更新工具
 * @file src/utils/tools/autoUpdater.js
 */
import { stringExtractor } from './stringExtractor.js';

export class AutoStringUpdater {
  constructor() {
    this.processedCount = 0;
  }

  static findStringsToAdd() {
    const untranslated = stringExtractor.findUntranslatedStrings(false);
    return new Set(Array.from(untranslated).filter((str) => !str.startsWith('待翻译: ')));
  }

  generateUpdateReport() {
    const stringsToAdd = AutoStringUpdater.findStringsToAdd();
    return {
      timestamp: new Date().toISOString(),
      pageUrl: window.location.href,
      pageTitle: document.title,
      stringsToAdd: Array.from(stringsToAdd),
      totalNew: stringsToAdd.size,
    };
  }

  showReportInConsole() {
    const report = this.generateUpdateReport();
    console.log('[GitHub 中文翻译] 字符串更新报告');
    console.log(`📄 页面: ${report.pageTitle}`);
    console.log(`✅ 找到 ${report.totalNew} 个新字符串`);
  }
}
