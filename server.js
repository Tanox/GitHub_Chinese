/**
 * 原型预览服务器（Express + WebSocket HMR）
 * @file server.js
 * @version 1.9.24
 * @description 提供 prototype/ 的热更新预览、public/ 静态资源与采集 API；Next 工作台请使用 npm run dev
 */

import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
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

watcher.on('change', (path) => {
  console.log(`File ${path} has been changed, notifying clients...`);
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
        req.path === '/' ? 'index.html' : req.path,
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

import { handleBatchCollect, handleCollect } from './src/server/collector.js';

app.post('/api/batch-collect', handleBatchCollect);
app.post('/api/collect', handleCollect);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
