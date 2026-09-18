/**
 * 配置界面数据持久化模块
 * @file src/ui/configUI/store.js
 */
import { CONFIG } from '../../config.js';
import { utils } from '../../utils/utils.js';

const CONFIG_STORAGE_KEY = 'github-i18n-config';

export const configStore = {
  loadUserSettings() {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (!saved) return {};

      // 尝试解码混淆的数据
      const decoded = utils.deobfuscateData(saved);
      if (decoded) {
        return JSON.parse(decoded);
      }

      // 如果解码失败，尝试直接解析（兼容旧格式）
      try {
        return JSON.parse(saved);
      } catch (_e) {
        return {};
      }
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 加载用户配置失败:', utils.sanitizeErrorMessage(error));
      }
      return {};
    }
  },

  saveUserSettings(settings) {
    try {
      const jsonData = JSON.stringify(settings);
      // 混淆存储配置数据
      const obfuscatedData = utils.obfuscateData(jsonData);
      localStorage.setItem(CONFIG_STORAGE_KEY, obfuscatedData);
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 保存用户配置失败:', utils.sanitizeErrorMessage(error));
      }
    }
  },

  resetUserSettings() {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  },

  mergeUserConfig(target, source) {
    const merge = (t, s) => {
      for (const key in s) {
        if (Object.prototype.hasOwnProperty.call(s, key)) {
          if (s[key] && typeof s[key] === 'object' && !Array.isArray(s[key])) {
            if (!t[key]) t[key] = {};
            merge(t[key], s[key]);
          } else {
            t[key] = s[key];
          }
        }
      }
      return t;
    };

    return merge(target, source);
  }
};
