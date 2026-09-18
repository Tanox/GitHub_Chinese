/**
 * 安全脱敏工具
 * @file src/utils/string/security.js
 */

export function sanitizeErrorMessage(error) {
  try {
    let message = typeof error === 'string' ? error : error.message || String(error);

    message = message.replace(/\/[a-zA-Z0-9_/.-]+:[0-9]+:[0-9]+/g, '[位置]');
    message = message.replace(/\/workspace\//g, '');
    message = message.replace(/at\s+[a-zA-Z0-9_.]+\s+[<(]/g, 'at [函数]');

    message = message.replace(
      /(password|token|secret|key)\s*[=:]\s*['"][^'"]*['"]/gi,
      '$1=[已隐藏]',
    );
    message = message.replace(/['"][a-zA-Z0-9+/=]{20,}['"]/g, '[已隐藏]');

    if (message.length > 200) {
      message = message.substring(0, 200) + '...';
    }

    return message;
  } catch (_error) {
    return '[未知错误]';
  }
}
