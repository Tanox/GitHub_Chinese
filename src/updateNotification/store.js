/**
 * 更新通知数据持久化模块
 * @file src/updateNotification/store.js
 */
import { CONFIG } from '../config.js';
import { utils } from '../utils/utils.js';

const NOTIFICATION_DISMISSED_KEY = 'githubZhUpdateNotificationDismissed';
const LAST_NOTIFIED_VERSION_KEY = 'githubZhLastNotifiedVersion';
const VERSION_HISTORY_KEY = 'githubZhVersionHistory';
const MAX_HISTORY_LENGTH = 10;

export const updateStore = {
  isDismissed() {
    return localStorage.getItem(NOTIFICATION_DISMISSED_KEY) === 'dismissed';
  },

  setDismissed() {
    localStorage.setItem(NOTIFICATION_DISMISSED_KEY, 'dismissed');
  },

  getLastNotifiedVersion() {
    return localStorage.getItem(LAST_NOTIFIED_VERSION_KEY);
  },

  setLastNotifiedVersion(version) {
    localStorage.setItem(LAST_NOTIFIED_VERSION_KEY, version);
  },

  clearNotificationDismissal() {
    try {
      localStorage.removeItem(NOTIFICATION_DISMISSED_KEY);
      localStorage.removeItem(LAST_NOTIFIED_VERSION_KEY);
      return true;
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 清除通知忽略状态失败:', error);
      }
      return false;
    }
  },

  recordVersionHistory(version) {
    try {
      let history = utils.safeJSONParse(localStorage.getItem(VERSION_HISTORY_KEY), []);
      if (!Array.isArray(history)) history = [];

      history.push({
        version,
        detectedAt: Date.now(),
      });

      if (history.length > MAX_HISTORY_LENGTH) {
        history = history.slice(-MAX_HISTORY_LENGTH);
      }

      localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(history));
    } catch (_error) {
      // 忽略存储错误
    }
  }
};
