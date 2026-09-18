/**
 * 开发工具模块
 * @file tools.js
 */
import { stringExtractor } from './tools/stringExtractor.js';
import { AutoStringUpdater } from './tools/autoUpdater.js';
import { DictionaryProcessor } from './tools/dictionaryProcessor.js';

export { stringExtractor, AutoStringUpdater, DictionaryProcessor };

/**
 * 加载工具类
 * @returns {Object} 包含工具类的对象
 */
export function loadTools() {
  return {
    stringExtractor,
    AutoStringUpdater,
    DictionaryProcessor,
  };
}
