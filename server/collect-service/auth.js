/**
 * 独立采集服务 Bearer 令牌校验
 * @file server/collect-service/auth.js
 * @version 1.13.0
 * @date 2026-09-30
 * @author Sut
 * @description 自托管采集服务暴露在公网时的最小访问控制：配置 COLLECT_SERVICE_TOKEN 后，
 *   /api/* 要求 Authorization: Bearer <token>；未配置时不启用（兼容内网/本机部署）。
 *   比较使用恒定时间算法，避免通过响应耗时枚举令牌。
 */
import crypto from 'node:crypto';

/** HTTP 401：未提供或未通过鉴权 */
const HTTP_UNAUTHORIZED = 401;

/**
 * 恒定时间比对提供的令牌与期望值
 * @param {unknown} provided 请求中携带的令牌
 * @param {string} expected 服务端配置的期望令牌
 * @returns {boolean} 是否一致
 */
export function isTokenValid(provided, expected) {
  if (typeof provided !== 'string' || typeof expected !== 'string' || expected.length === 0) {
    return false;
  }
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // 长度不同不能直接调 timingSafeEqual（会抛错），长度差异本身也不泄露有效令牌内容
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * 从 Authorization 头提取 Bearer 令牌
 * @param {unknown} header 请求头原始值
 * @returns {string|null} 令牌；头缺失或格式不符时为 null
 */
export function extractBearer(header) {
  if (typeof header !== 'string') return null;
  const match = /^Bearer\s+(.+)$/.exec(header.trim());
  return match ? match[1] : null;
}

/**
 * 创建 Express 鉴权中间件
 * @param {string|undefined} expectedToken 服务端令牌（COLLECT_SERVICE_TOKEN）
 * @returns {((req: import('express').Request, res: import('express').Response, next: Function) => void)|null}
 *   未配置令牌时返回 null——调用方据此跳过挂载，保持默认开放
 */
export function createTokenAuth(expectedToken) {
  if (!expectedToken) return null;
  return (req, res, next) => {
    const provided = extractBearer(req.headers?.authorization);
    if (isTokenValid(provided, expectedToken)) {
      next();
      return;
    }
    res
      .status(HTTP_UNAUTHORIZED)
      .set('WWW-Authenticate', 'Bearer')
      .json({ error: '未授权：采集服务令牌缺失或错误' });
  };
}
