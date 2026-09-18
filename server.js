import express from 'express';
import fs from 'fs/promises';
import { exec } from 'child_process';
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
  ignored: /(^|[\/\\])\../,
  persistent: true
});

watcher.on('change', (path) => {
  console.log(`File ${path} has been changed, notifying clients...`);
  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify({ type: 'reload' }));
    }
  });
});

app.use(express.static(path.join(__dirname, 'web'), { extensions: ['html'] }));
app.use(express.json({ limit: '10mb' }));

// Middleware to inject HMR script into prototype HTML files
app.use('/prototype', async (req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/') {
    try {
      const filePath = path.join(__dirname, 'prototype', req.path === '/' ? 'index.html' : req.path);
      let content = await fs.readFile(filePath, 'utf-8');
      
      const hmrScript = `
      <script>
        (function() {
          const ws = new WebSocket('ws://' + window.location.host);
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
      return res.send(content);
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

app.post('/api/batch-collect', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (type, message) => {
    res.write(`data: ${JSON.stringify({ type, message })}\n\n`);
  };

  try {
    const { urls } = req.body;
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      sendEvent('error', '没有提供有效的 URL 列表');
      res.end();
      return;
    }

    sendEvent('log', '正在初始化 Headless 浏览器...');
    const puppeteer = await import('puppeteer');
    
    // Configured for restricted environments where standard sandbox might fail
    const browser = await puppeteer.launch({ 
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });

    let allTextNodes = new Set();
    const total = urls.length;

    for (let i = 0; i < total; i++) {
      const url = urls[i];
      sendEvent('log', `[${i + 1}/${total}] 正在访问: ${url}`);
      sendEvent('progress', { type: 'fetch', current: i + 1, total, url });
      
      const page = await browser.newPage();
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Inject and run the collection script
        const texts = await page.evaluate(() => {
          const nodes = [];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
          while(walker.nextNode()) {
              const text = walker.currentNode.textContent.trim();
              if (text.length > 2 && !/^\s*$/.test(text)) {
                  nodes.push(text);
              }
          }
          return nodes;
        });

        texts.forEach(t => allTextNodes.add(t));
        sendEvent('log', `成功从 ${url} 提取 ${texts.length} 条文本`);
      } catch (err) {
        sendEvent('error', `处理 ${url} 时失败: ${err.message}`);
      } finally {
        await page.close();
      }
    }

    await browser.close();
    sendEvent('log', '页面提取完成，开始保存并分析词典...');
    sendEvent('progress', { type: 'analyze' });

    // Save aggregated texts to file
    const rawData = Array.from(allTextNodes).join('\n');
    const rawTermsPath = path.join(__dirname, 'raw-terms.txt');
    await fs.writeFile(rawTermsPath, rawData, 'utf-8');

    // Run the analysis script
    const { spawn } = await import('child_process');
    const child = spawn('node', ['collect-dict.cjs', 'raw-terms.txt']);

    child.stdout.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      lines.forEach(line => {
        if (line.trim()) sendEvent('log', line);
      });
    });

    child.stderr.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      lines.forEach(line => {
        if (line.trim()) sendEvent('error', line);
      });
    });

    child.on('close', (code) => {
      sendEvent('done', code);
      res.end();
    });

  } catch (err) {
    console.error(err);
    sendEvent('error', err.message);
    res.end();
  }
});
app.post('/api/collect', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: '没有提供数据' });
    }

    const rawTermsPath = path.join(__dirname, 'raw-terms.txt');
    await fs.writeFile(rawTermsPath, data, 'utf-8');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const { spawn } = await import('child_process');
    const child = spawn('node', ['collect-dict.cjs', 'raw-terms.txt']);

    child.stdout.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          res.write(`data: ${JSON.stringify({ type: 'log', message: line })}\n\n`);
        }
      });
    });

    child.stderr.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          res.write(`data: ${JSON.stringify({ type: 'error', message: line })}\n\n`);
        }
      });
    });

    child.on('close', (code) => {
      res.write(`data: ${JSON.stringify({ type: 'done', code })}\n\n`);
      res.end();
    });

  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
      res.end();
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
