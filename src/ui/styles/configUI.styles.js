/**
 * GitHub 中文翻译配置界面样式模块
 * @file configUI.styles.js
 */

import { baseStyles } from './configUI/base.js';
import { componentStyles } from './configUI/components.js';
import { buttonStyles } from './configUI/buttons.js';

/**
 * 获取配置界面的完整样式
 * @returns {string} CSS样式字符串
 */
export function getConfigUIStyles() {
  return baseStyles + componentStyles + buttonStyles;
}

/**
 * 将样式添加到页面
 */
export function addConfigUIStyles() {
  const style = document.createElement('style');
  style.textContent = getConfigUIStyles();
  document.head.appendChild(style);
}
