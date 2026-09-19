import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..', '..');

/** 请求数据缺失时的 HTTP 状态码 */
const HTTP_BAD_REQUEST = 400;
/** 服务端内部错误时的 HTTP 状态码 */
const HTTP_SERVER_ERROR = 500;

export async function handleBatchCollect(req, res) {
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

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const allTextNodes = new Set();
    const total = urls.length;

    for (let i = 0; i < total; i++) {
      const url = urls[i];
      sendEvent('log', `[${i + 1}/${total}] 正在访问: ${url}`);
      sendEvent('progress', { type: 'fetch', current: i + 1, total, url });

      const page = await browser.newPage();
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        const texts = await page.evaluate(() => {
          const nodes = [];
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false,
          );
          while (walker.nextNode()) {
            const text = walker.currentNode.textContent.trim();
            if (text.length > 2 && !/^\s*$/.test(text)) {
              nodes.push(text);
            }
          }
          return nodes;
        });

        texts.forEach((t) => allTextNodes.add(t));
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

    const rawData = Array.from(allTextNodes).join('\n');
    const rawTermsPath = path.join(rootDir, 'raw-terms.txt');
    await fs.writeFile(rawTermsPath, rawData, 'utf-8');

    const child = spawn('node', ['collect-dict.cjs', 'raw-terms.txt'], { cwd: rootDir });

    child.stdout.on('data', (chunk) => {
      chunk
        .toString()
        .split('\n')
        .forEach((line) => {
          if (line.trim()) sendEvent('log', line);
        });
    });

    child.stderr.on('data', (chunk) => {
      chunk
        .toString()
        .split('\n')
        .forEach((line) => {
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
}

export async function handleCollect(req, res) {
  try {
    const { data } = req.body;
    if (!data) {
      res.status(HTTP_BAD_REQUEST).json({ error: '没有提供数据' });
      return;
    }

    const rawTermsPath = path.join(rootDir, 'raw-terms.txt');
    await fs.writeFile(rawTermsPath, data, 'utf-8');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const child = spawn('node', ['collect-dict.cjs', 'raw-terms.txt'], { cwd: rootDir });

    child.stdout.on('data', (chunk) => {
      chunk
        .toString()
        .split('\n')
        .forEach((line) => {
          if (line.trim()) {
            res.write(`data: ${JSON.stringify({ type: 'log', message: line })}\n\n`);
          }
        });
    });

    child.stderr.on('data', (chunk) => {
      chunk
        .toString()
        .split('\n')
        .forEach((line) => {
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
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
      res.end();
    } else {
      res.status(HTTP_SERVER_ERROR).json({ error: err.message });
    }
  }
}
