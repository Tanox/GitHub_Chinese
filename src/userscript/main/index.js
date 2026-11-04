/**
 * GitHub 中文翻译主入口文件
 * @file src/userscript/main/index.js
 * @version 1.13.22
 * @date 2026-11-04
 * @author Sut
 * @description 用户脚本入口：装配配置 / 翻译核心 / 配置面板，并委托生命周期管理器启动
 */

import { CONFIG } from '../config/index.js';
import { translationCore } from '../translation-core/index.js';
import { configUI } from '../ui/configUI/index.js';
import { lifecycleManager } from './lifecycle.js';

// 初始化函数
const init = () => lifecycleManager.init();
const cleanup = () => lifecycleManager.cleanup();
const startScript = () => lifecycleManager.startScript();

// 导出函数
export { init, startScript, cleanup };

// 对外暴露运行实例（错误处理器的词典恢复与脚本菜单依赖此命名空间）
if (typeof window !== 'undefined') {
  window.GitHub_i18n = { translationCore, configUI };

  if (CONFIG.debugMode) {
    window.translationCore = translationCore;
    window.configUI = configUI;
  }
}

// 启动脚本
startScript();
