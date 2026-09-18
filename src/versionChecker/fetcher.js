/**
 * 版本检查请求模块
 * @file src/versionChecker/fetcher.js
 */
import { CONFIG } from '../config.js';
import { utils } from '../utils/utils.js';

const FETCH_TIMEOUT_MS = 8000;
const EXPONENTIAL_BASE = 2;

const KNOWN_SCRIPT_HASHES = {
  'https://github.com/Tanox/GitHub_i18n/raw/main/build/GitHub_i18n.user.js':
    'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
};

export const versionFetcher = {
  async fetchWithRetry(url, maxRetries = 2, retryDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (CONFIG.debugMode && attempt > 0) {
          console.log(`[GitHub 中文翻译] 重试更新检查 (${attempt}/${maxRetries})...`);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            Accept: 'text/javascript, text/plain, */*',
          },
          signal: controller.signal,
          credentials: 'omit',
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }

        const scriptContent = await response.text();

        if (KNOWN_SCRIPT_HASHES[url]) {
          const isValid = await this.verifyScriptIntegrity(scriptContent, url);
          if (!isValid) {
            if (CONFIG.debugMode) {
              console.warn('[GitHub 中文翻译] 脚本完整性验证失败，可能存在安全风险');
            }
          }
        }

        return scriptContent;
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          throw error;
        }

        await utils.delay(retryDelay * Math.pow(EXPONENTIAL_BASE, attempt));
      }
    }

    throw lastError;
  },

  async verifyScriptIntegrity(scriptContent, url) {
    try {
      const expectedHash = KNOWN_SCRIPT_HASHES[url];
      if (!expectedHash) {
        return true;
      }

      const actualHash = await utils.sha256Hash(scriptContent);
      const isValid = actualHash === expectedHash;

      if (CONFIG.debugMode) {
        console.log(`[GitHub 中文翻译] 脚本完整性验证: ${isValid ? '通过' : '失败'}`);
      }

      return isValid;
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 脚本完整性验证出错:', utils.sanitizeErrorMessage(error));
      }
      return false;
    }
  }
};
