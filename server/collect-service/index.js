/**
 * 独立采集服务（W5 架构解耦）
 * @file server/collect-service/index.js
 * @version 1.13.10
 * @date 2026-10-01
 * @author Sut
 * @description 可自托管部署的 Node 服务，复用 src/lib/collector-core 的采集实现，
 *   通过 HTTP + SSE 暴露采集接口，使前端/Next 路由与「需要 Chrome 的采集」彻底解耦，
 *   解决 serverless（EdgeOne/Vercel）无浏览器导致生产采集不可用的问题。
 *
 * 运行：node server/collect-service/index.js（或 npm run collect-service）
 * 环境变量：
 *   COLLECT_SERVICE_PORT   监听端口（默认 8787）
 *   COLLECT_SERVICE_TOKEN  配置后 /api/* 要求 Bearer 令牌（公网部署必须配置；/health 始终放行）
 *   GITHUB_ZH_COOKIES      可选，登录态 cookie 的 JSON 数组（T18），用于抓取需鉴权的私有页，
 *                          例：[{"name":"user_session","value":"xxx","domain":".github.com"}]
 *                          也可随 /api/batch-collect 请求体携带 cookies 字段逐请求覆盖。
 */
import express from 'express';
import { collectFromUrls, processRawData } from '../../src/lib/collector-core.js';
import { logger } from '../../src/utils/logger.js';
import { createTokenAuth } from './auth.js';

/** 默认监听端口（可被 COLLECT_SERVICE_PORT 覆盖） */
const DEFAULT_PORT = 8787;
/** 请求体上限：批量 URL 采集可能携带较大 URL 列表 */
const BODY_LIMIT = '5mb';

const app = express();
app.use(express.json({ limit: BODY_LIMIT }));

// 配置令牌后保护全部 /api 路由；未配置时不启用（兼容内网/本机部署）。/health 在下方单独注册，不受影响。
const tokenAuth = createTokenAuth(process.env.COLLECT_SERVICE_TOKEN);
if (tokenAuth) app.use('/api', tokenAuth);

/**
 * 解析 GITHUB_ZH_COOKIES 环境变量（T18），用于抓取需鉴权的私有页。
 * 非法 JSON 或缺失时返回 undefined（不注入）；也可由请求体 cookies 字段逐请求覆盖。
 * @returns {Array<{ name: string, value: string, domain?: string, path?: string }>|undefined}
 */
function cookiesFromEnv() {
  const raw = process.env.GITHUB_ZH_COOKIES;
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    logger.warn('GITHUB_ZH_COOKIES 不是合法 JSON，已忽略');
    return undefined;
  }
}

/**
 * 将采集异步生成器包装为 SSE 响应
 * @param {(req: import('express').Request, signal: AbortSignal) => AsyncGenerator<object>} handler
 * @returns {import('express').RequestHandler}
 */
function sse(handler) {
  return async (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    const ac = new AbortController();
    req.on('close', () => ac.abort());

    try {
      const generator = handler(req, ac.signal);
      for await (const event of generator) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    } catch (error) {
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          message: error instanceof Error ? error.message : String(error),
        })}\n\n`,
      );
    } finally {
      res.end();
    }
  };
}

app.post(
  '/api/collect',
  sse((req, signal) => processRawData(req.body?.data ?? '', { signal })),
);

app.post(
  '/api/batch-collect',
  sse((req, signal) => {
    const envCookies = cookiesFromEnv();
    const cookies =
      Array.isArray(req.body?.cookies) && req.body.cookies.length > 0
        ? req.body.cookies
        : envCookies;
    return collectFromUrls(Array.isArray(req.body?.urls) ? req.body.urls : [], { signal, cookies });
  }),
);

app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = Number(process.env.COLLECT_SERVICE_PORT) || DEFAULT_PORT;
app.listen(PORT, () => {
  logger.info(`独立采集服务已启动: http://localhost:${PORT}（W5 解耦）`);
  if (tokenAuth) {
    logger.info('令牌校验已启用：/api/* 要求 Authorization: Bearer <COLLECT_SERVICE_TOKEN>');
  } else {
    logger.warn('未配置 COLLECT_SERVICE_TOKEN，采集接口无鉴权——公网部署请务必配置令牌');
  }
});
