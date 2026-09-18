/**
 * 版本更新检查模块
 * @file versionChecker.js
 */
import { CONFIG } from './config.js';
import { utils } from './utils/utils.js';
import { extractVersion, isNewerVersion } from './versionUtils.js';
import {
  showUpdateNotification,
  recordVersionHistory,
  clearNotificationDismissal,
} from './updateNotification.js';
import { versionFetcher } from './versionChecker/fetcher.js';

const DEFAULT_INTERVAL_HOURS = 24;
const HOURS_TO_MS = 60 * 60 * 1000;
const PARSE_INT_RADIX = 10;

const versionChecker = {
  async checkForUpdates() {
    if (!CONFIG.updateCheck.enabled) {
      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 已禁用更新检查');
      }
      return false;
    }

    const lastCheck = localStorage.getItem('githubZhLastUpdateCheck');
    const now = Date.now();
    const intervalMs = (CONFIG.updateCheck.intervalHours || DEFAULT_INTERVAL_HOURS) * HOURS_TO_MS;

    if (lastCheck && now - parseInt(lastCheck, PARSE_INT_RADIX) < intervalMs) {
      if (CONFIG.debugMode) {
        console.log(
          `[GitHub 中文翻译] 未达到更新检查间隔，跳过检查 (上次检查: ${new Date(parseInt(lastCheck, PARSE_INT_RADIX)).toLocaleString()})`,
        );
      }
      return false;
    }

    try {
      localStorage.setItem('githubZhLastUpdateCheck', now.toString());

      const scriptContent = await versionFetcher.fetchWithRetry(CONFIG.updateCheck.scriptUrl);

      const remoteVersion = extractVersion(scriptContent);

      if (!remoteVersion) {
        throw new Error('无法从远程脚本提取有效的版本号');
      }

      if (CONFIG.debugMode) {
        console.log(`[GitHub 中文翻译] 当前版本: ${CONFIG.version}, 远程版本: ${remoteVersion}`);
      }

      if (isNewerVersion(remoteVersion, CONFIG.version)) {
        showUpdateNotification(remoteVersion);

        if (CONFIG.updateCheck.autoUpdateVersion) {
          this.updateVersionInStorage(remoteVersion);
        }

        recordVersionHistory(remoteVersion);

        return true;
      }

      return false;
    } catch (error) {
      const sanitizedError = utils.sanitizeErrorMessage(error);
      const errorMsg = `[GitHub 中文翻译] 检查更新时发生错误: ${sanitizedError}`;
      if (CONFIG.debugMode) {
        console.error(errorMsg);
      }

      try {
        localStorage.setItem(
          'githubZhUpdateError',
          JSON.stringify({
            message: sanitizedError,
            timestamp: now,
          }),
        );
      } catch (_e) {
        // 忽略存储错误
      }

      return false;
    }
  },

  updateVersionInStorage(newVersion) {
    try {
      const cacheData = {
        version: newVersion,
        cachedAt: Date.now(),
        currentVersion: CONFIG.version,
      };

      localStorage.setItem('githubZhCachedVersion', utils.safeJSONStringify(cacheData));

      if (CONFIG.debugMode) {
        console.log(
          `[GitHub 中文翻译] 已缓存新版本号: ${newVersion} (缓存时间: ${new Date().toLocaleString()})`,
        );
      }

      return true;
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 更新缓存版本号时出错:', error);
      }
      return false;
    }
  },

  getCachedVersion() {
    try {
      const cachedData = utils.safeJSONParse(localStorage.getItem('githubZhCachedVersion'));
      return cachedData;
    } catch (_error) {
      return null;
    }
  },

  clearNotificationDismissal,
};

export { versionChecker };
