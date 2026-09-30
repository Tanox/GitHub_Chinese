/**
 * 开发工具模块
 * @file tools.js
 */
import { stringExtractor } from './tools/stringExtractor.js';
import { AutoStringUpdater } from './tools/autoUpdater.js';
import { DictionaryStats } from './tools/dictionaryStats.js';

export { stringExtractor, AutoStringUpdater, DictionaryStats };

/**
 * 加载工具类
 * @returns {Object} 包含工具类的对象
 */
export function loadTools() {
  return {
    stringExtractor,
    AutoStringUpdater,
    DictionaryStats,
  };
}
