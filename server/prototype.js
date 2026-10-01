/**
 * 原型预览服务器（Express + WebSocket HMR）
 * @file server.js
 * @version 1.9.46
 * @description 提供 prototype/ 的热更新预览、public/ 静态资源与采集 API；Next 工作台请使用 npm run dev
 */

import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import http from 'http';
import { collectFromUrls, processRawData } from './src/lib/collector-core.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
/** 请求参数缺失时的 HTTP 状态码 */
const HTTP_BAD_REQUEST = 400;

const app = express();
const server = http.createServer(app);

// Setup WebSocket server
const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

// Watch for file changes
const watcher = chokidar.watch(['prototype/**/*.html', 'prototype/**/*.css'], {
  ignored: /(^|[/\\])\../,
  persistent: true,
});

watcher.on('change', (changedPath) => {
  console.log(`File ${changedPath} has been changed, notifying clients...`);
  clients.forEach((client) => {
    if (client.readyState === 1) {
      // WebSocket.OPEN
      client.send(JSON.stringify({ type: 'reload' }));
    }
  });
});

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
app.use(express.json({ limit: '10mb' }));

// Middleware to inject HMR script into prototype HTML files
app.use('/prototype', async (req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/') {
    try {
      const filePath = path.join(
        __dirname,
        'prototype',
        req.path === '/' ? 'prototypes/index.html' : req.path,
      );
      let content = await fs.readFile(filePath, 'utf-8');

      const hmrScript = `
      <script>
        (function() {
          const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
          const ws = new WebSocket(protocol + window.location.host);
          ws.onmessage = function(event) {
            const data = JSON.parse(event.data);
            if (data.type === 'reload') {
              console.log('Reloading page due to file changes...');
              window.location.reload();
            }
          };
          ws.onclose = function() {
            console.log('HMR disconnected. Trying to reconnect in 3s...');
            setTimeout(() => window.location.reload(), 3000);
          }
        })();
      </script>
      `;
      content = content.replace('</body>', `${hmrScript}</body>`);
      res.send(content);
      return;
    } catch (err) {
      // If file not found, let static middleware or others handle it
      if (err.code !== 'ENOENT') {
        console.error('Error injecting HMR script:', err);
      }
    }
  }
  next();
});

app.use('/prototype', express.static(path.join(__dirname, 'prototype')));

/**
 * 初始化 SSE 响应头
 * @param {object} res - Express 响应对象
 */
function initSse(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
}

/**
 * 将采集事件流转发为 SSE
 * @param {object} res - Express 响应对象
 * @param {AsyncIterableIterator<object>} events - 采集事件流
 */
async function pipeEvents(res, events) {
  try {
    for await (const event of events) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.write(`data: ${JSON.stringify({ type: 'error', message })}\n\n`);
  } finally {
    res.end();
  }
}

app.post('/api/collect', async (req, res) => {
  const { data } = req.body ?? {};
  if (typeof data !== 'string' || data.length === 0) {
    res.status(HTTP_BAD_REQUEST).json({ error: '没有提供数据' });
    return;
  }

  initSse(res);
  await pipeEvents(res, processRawData(data));
});

app.post('/api/batch-collect', async (req, res) => {
  const { urls } = req.body ?? {};
  if (!Array.isArray(urls) || urls.length === 0) {
    res.status(HTTP_BAD_REQUEST).json({ error: '没有提供有效的 URL 列表' });
    return;
  }

  initSse(res);
  await pipeEvents(res, collectFromUrls(urls));
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
