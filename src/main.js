/**
 * GitHub 中文翻译主入口文件
 * @file main.js
 */

import { CONFIG } from './config.js';
import { translationCore } from './translation-core/index.js';
import { configUI } from './ui/configUI.js';
import { lifecycleManager } from './main/lifecycle.js';

// 初始化函数
const init = () => lifecycleManager.init();
const cleanup = () => lifecycleManager.cleanup();
const startScript = () => lifecycleManager.startScript();

// 导出函数
export { init, startScript, cleanup };

// 调试模式暴露
if (typeof window !== 'undefined' && CONFIG.debugMode) {
  window.translationCore = translationCore;
  window.configUI = configUI;
}

// 启动脚本
startScript();
