/**
 * 版本工具模块
 * @file versionUtils.js
 * @version 1.9.24
 * @date 2026-09-19
 * @author Sut
 * @description 版本比较、提取等工具函数
 */

/**
 * 从脚本内容中提取版本号
 * 支持多种版本号格式
 * @param {string} content - 脚本内容
 * @returns {string|null} 提取的版本号或null
 */
function extractVersion(content) {
  const patterns = [
    /\/\*\s*@version\s+(\d+\.\d+\.\d+)\s*\*\//i,
    /\/\/\s*@version\s+(\d+\.\d+\.\d+)/i,
    /\/\/\s*version\s*:\s*(\d+\.\d+\.\d+)/i,
    /version\s*=\s*['"](\d+\.\d+\.\d+)['"]/i,
    /version:\s*['"](\d+\.\d+\.\d+)['"]/i,
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * 比较版本号，判断是否有新版本
 * @param {string} newVersion - 新版本号
 * @param {string} currentVersion - 当前版本号
 * @returns {boolean} 是否有新版本
 */
function isNewerVersion(newVersion, currentVersion) {
  const newParts = newVersion.split('.').map(Number);
  const currentParts = currentVersion.split('.').map(Number);

  for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
    const newPart = newParts[i] || 0;
    const currentPart = currentParts[i] || 0;

    if (newPart > currentPart) {
      return true;
    } else if (newPart < currentPart) {
      return false;
    }
  }

  return false;
}

export { extractVersion, isNewerVersion };
