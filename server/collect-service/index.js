/**
 * 独立采集服务（W5 架构解耦）
 * @file server/collect-service/index.js
 * @version 1.12.11
 * @date 2026-09-30
 * @author Sut
 * @description 可自托管部署的 Node 服务，复用 src/lib/collector-core 的采集实现，
 *   通过 HTTP + SSE 暴露采集接口，使前端/Next 路由与「需要 Chrome 的采集」彻底解耦，
 *   解决 serverless（EdgeOne/Vercel）无浏览器导致生产采集不可用的问题。
 *
 * 运行：node server/collect-service/index.js（或 npm run collect-service）
 * 环境变量：COLLECT_SERVICE_PORT（默认 8787）
 */
import express from 'express';
import { collectFromUrls, processRawData } from '../../src/lib/collector-core.js';
import { logger } from '../../src/utils/logger.js';

/** 默认监听端口（可被 COLLECT_SERVICE_PORT 覆盖） */
const DEFAULT_PORT = 8787;
/** 请求体上限：批量 URL 采集可能携带较大 URL 列表 */
const BODY_LIMIT = '5mb';

const app = express();
app.use(express.json({ limit: BODY_LIMIT }));

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
  sse((req, signal) =>
    collectFromUrls(Array.isArray(req.body?.urls) ? req.body.urls : [], { signal }),
  ),
);

app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = Number(process.env.COLLECT_SERVICE_PORT) || DEFAULT_PORT;
app.listen(PORT, () => {
  logger.info(`独立采集服务已启动: http://localhost:${PORT}（W5 解耦）`);
});
