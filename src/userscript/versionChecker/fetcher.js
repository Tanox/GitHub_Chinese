/**
 * 版本检查请求模块
 * @file src/userscript/versionChecker/fetcher.js
 * @version 1.13.28
 * @description 拉取远端脚本内容用于版本比对。完整性校验仅在配置了可信哈希时启用：
 *   未配置时不作校验（不伪造「已校验」的安全假象）；已配置却校验失败则拒绝使用内容。
 *   此前硬编码的占位哈希无法通过真实产物校验且失败仅 warn，属于无效安全控制，已移除。
 */
import { CONFIG } from '../config/index.js';
import { utils } from '../../utils/utils.js';

const FETCH_TIMEOUT_MS = 8000;
const EXPONENTIAL_BASE = 2;

/**
 * 可信脚本哈希表：由构建/发版流程注入，键为脚本 URL、值为 SHA-256 十六进制串。
 * 运行期可通过 `globalThis.GITHUB_ZH_SCRIPT_HASHES` 覆盖（便于维护者在不改源码的情况下登记）。
 * @type {Record<string, string>}
 */
const KNOWN_SCRIPT_HASHES =
  (typeof globalThis !== 'undefined' && globalThis.GITHUB_ZH_SCRIPT_HASHES) || {};

export const versionFetcher = {
  async fetchWithRetry(url, maxRetries = 2, retryDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      let timeoutId;
      try {
        if (CONFIG.debugMode && attempt > 0) {
          console.log(`[GitHub 中文翻译] 重试更新检查 (${attempt}/${maxRetries})...`);
        }

        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            Accept: 'text/javascript, text/plain, */*',
          },
          signal: controller.signal,
          credentials: 'omit',
        });

        if (!response.ok) {
          throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }

        const scriptContent = await response.text();

        // 仅在登记了可信哈希时校验；失败必须阻断，不能继续使用可疑内容
        if (KNOWN_SCRIPT_HASHES[url]) {
          const isValid = await this.verifyScriptIntegrity(scriptContent, url);
          if (!isValid) {
            throw new Error('脚本完整性验证失败，已中止更新检查');
          }
        }

        return scriptContent;
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          throw error;
        }

        await utils.delay(retryDelay * Math.pow(EXPONENTIAL_BASE, attempt));
      } finally {
        // 超时定时器在成功、失败、重试各分支都要清理，避免遗留
        if (timeoutId !== undefined) clearTimeout(timeoutId);
      }
    }

    throw lastError;
  },

  async verifyScriptIntegrity(scriptContent, url) {
    try {
      const expectedHash = KNOWN_SCRIPT_HASHES[url];
      // 未登记可信哈希时不做校验，也不宣称已校验
      if (!expectedHash) return true;

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
  },
};
