import fs from 'fs/promises';
import path from 'path';

const rootDir = process.cwd();

export interface CollectEvent {
  type: 'log' | 'error' | 'progress' | 'done';
  message?: string;
  data?: any;
}

export async function* collectFromUrls(urls: string[]) {
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const allTextNodes = new Set<string>();
    const total = urls.length;

    yield { type: 'log', message: '正在初始化 Headless 浏览器...' };

    for (let i = 0; i < total; i++) {
      const url = urls[i];
      yield { type: 'log', message: `[${i + 1}/${total}] 正在访问: ${url}` };
      yield { type: 'progress', data: { type: 'fetch', current: i + 1, total, url } };

      const page = await browser.newPage();
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        const texts = await page.evaluate(() => {
          const nodes: string[] = [];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          let node;
          while ((node = walker.nextNode())) {
            const text = node.textContent?.trim();
            if (text && text.length > 2 && !/^\s*$/.test(text)) {
              nodes.push(text);
            }
          }
          return nodes;
        });

        texts.forEach(t => allTextNodes.add(t));
        yield { type: 'log', message: `成功从 ${url} 提取 ${texts.length} 条文本` };
      } catch (err: any) {
        yield { type: 'error', message: `处理 ${url} 时失败: ${err.message}` };
      } finally {
        await page.close();
      }
    }

    yield { type: 'log', message: '页面提取完成，开始保存并分析词典...' };
    yield { type: 'progress', data: { type: 'analyze' } };

    const rawData = Array.from(allTextNodes).join('\n');
    const rawTermsPath = path.join(rootDir, 'raw-terms.txt');
    await fs.writeFile(rawTermsPath, rawData, 'utf-8');

    yield* runDictionaryProcessor(rawTermsPath);

  } catch (err: any) {
    yield { type: 'error', message: err.message };
  } finally {
    await browser.close();
  }
}

export async function* processRawData(data: string) {
  const rawTermsPath = path.join(rootDir, 'raw-terms.txt');
  await fs.writeFile(rawTermsPath, data, 'utf-8');
  yield* runDictionaryProcessor(rawTermsPath);
}

async function* runDictionaryProcessor(filePath: string) {
  // Use eval to hide spawn from Turbopack static analysis
  const { spawn: sp } = eval('require("child_process")');
  const scriptPath = path.join(process.cwd(), 'collect-dict.cjs');
  const child = sp('node', [scriptPath, path.basename(filePath)], { cwd: process.cwd() });

  // Use a promise to handle the stream end
  const results: CollectEvent[] = [];
  
  // This is a bit tricky with async generators and event emitters
  // We'll use a queue or a manual stream handler
  
  // For simplicity in this environment, let's use a simpler approach
  // We can't easily 'yield' from callbacks
  
  // Improved approach:
  const decoder = new TextDecoder();
  
  const streamToGenerator = (stream: any, type: 'log' | 'error') => {
      return new Promise<void>((resolve) => {
          stream.on('data', (chunk: Buffer) => {
              const lines = decoder.decode(chunk).split('\n');
              lines.forEach(line => {
                  if (line.trim()) {
                      // We need a way to push these to the outer generator
                  }
              });
          });
          stream.on('end', resolve);
      });
  };

  // Let's use a simplified version for now where we collect all and then yield, 
  // or use a more robust async stream management if needed.
  // Actually, for SSE we need real-time.
  
  // Real implementation using a pass-through or a promise-based queue:
  const queue: CollectEvent[] = [];
  let done = false;

  child.stdout.on('data', (chunk) => {
    chunk.toString().split('\n').forEach((line: string) => {
      if (line.trim()) queue.push({ type: 'log', message: line });
    });
  });

  child.stderr.on('data', (chunk) => {
    chunk.toString().split('\n').forEach((line: string) => {
      if (line.trim()) queue.push({ type: 'error', message: line });
    });
  });

  child.on('close', (code) => {
    queue.push({ type: 'done', data: { code } });
    done = true;
  });

  while (!done || queue.length > 0) {
    if (queue.length > 0) {
      yield queue.shift()!;
    } else {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}
