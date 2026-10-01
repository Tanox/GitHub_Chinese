/**
 * HAR / 会话导入工具（T18-b）
 * @file scripts/har-import.cjs
 * @version 1.13.10
 * @date 2026-10-01
 * @author Sut
 * @description 从浏览器开发者工具导出的 HAR（录制的一次会话）中解析 GitHub HTML 响应体，
 *   提取可见 UI 文本并复用 collect-dict.cjs 的清洗管线产出待翻译词条。无需启动浏览器，
 *   适合离线 / 无头环境批量补采未覆盖的 UI 区域。
 *
 * 用法：node scripts/har-import.cjs <path-to.har> [--out <输出文件>]
 * 依赖：src/lib/extract-html-text.js（jsdom）、scripts/collect-dict.cjs（词典匹配）
 */

const fs = require('fs');
const path = require('path');
const { mergeDictionaries, analyzeTexts, normalizeText } = require('./collect-dict.cjs');

/** 动态加载 ESM 提取器（CJS 不支持静态 import ESM） */
let _extractVisibleText = null;
async function getExtractVisibleText() {
  if (!_extractVisibleText) {
    const mod = await import('../src/lib/extract-html-text.js');
    _extractVisibleText = mod.extractVisibleText;
  }
  return _extractVisibleText;
}

/**
 * 仅保留 GitHub 页面的 HTML 响应（其余类型跳过）
 * @param {{ request?: { url?: string }, response?: { content?: { mimeType?: string, text?: string, encoding?: string } } }} entry - HAR 条目
 * @returns {boolean}
 */
function isGitHubHtml(entry) {
  const url = entry?.request?.url || '';
  const mime = entry?.response?.content?.mimeType || '';
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (!host.endsWith('github.com')) return false;
  } catch {
    return false;
  }
  return /text\/html|application\/xhtml/i.test(mime);
}

/**
 * 从 HAR 对象提取 GitHub HTML 响应中的可见文本
 * @param {object} har - 解析后的 HAR JSON（含 log.entries）
 * @returns {Promise<{ texts: string[], pages: number, skipped: number }>}
 */
async function extractFromHar(har) {
  const extractVisibleText = await getExtractVisibleText();
  const entries = Array.isArray(har?.log?.entries) ? har.log.entries : [];
  const texts = [];
  let pages = 0;
  let skipped = 0;

  for (const entry of entries) {
    if (!isGitHubHtml(entry)) {
      skipped += 1;
      continue;
    }
    const content = entry.response?.content || {};
    let raw = content.text;
    if (raw == null) {
      skipped += 1;
      continue;
    }
    if (content.encoding === 'base64') {
      try {
        raw = Buffer.from(raw, 'base64').toString('utf-8');
      } catch {
        skipped += 1;
        continue;
      }
    }
    const found = extractVisibleText(raw);
    found.forEach((t) => texts.push(t));
    pages += 1;
  }

  return { texts, pages, skipped };
}

/**
 * 主函数：解析 HAR 并产出待翻译词条报告
 */
async function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const outFile = outIdx >= 0 ? args[outIdx + 1] : null;
  const harPath = args.find((a) => !a.startsWith('--') && a !== outFile);

  if (!harPath) {
    console.log('用法: node scripts/har-import.cjs <path-to.har> [--out <输出文件>]');
    process.exit(0);
  }
  if (!fs.existsSync(harPath)) {
    console.error(`❌ 文件不存在: ${harPath}`);
    process.exit(1);
  }

  let har;
  try {
    // 容错：剥离可能的 UTF-8 BOM（部分工具/Windows 导出会带 BOM）
    let raw = fs.readFileSync(harPath, 'utf-8');
    if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
    har = JSON.parse(raw);
  } catch (e) {
    console.error(`❌ HAR 解析失败: ${e.message}`);
    process.exit(1);
  }

  const { texts, pages, skipped } = await extractFromHar(har);
  console.log(`[HAR 导入] 解析 GitHub HTML 页面 ${pages} 个，跳过 ${skipped} 个，提取文本 ${texts.length} 条`);

  const dictionary = await mergeDictionaries();
  const { untranslated, translated, coverage } = analyzeTexts(texts, dictionary);
  console.log(`[词典采集] 已翻译: ${translated.size}, 待翻译: ${untranslated.length}`);
  console.log(
    `[覆盖率] 候选 ${coverage.total} / 覆盖 ${coverage.covered} / 覆盖率 ${(coverage.rate * 100).toFixed(1)}%`,
  );

  const lines = untranslated.map((t) => normalizeText(t));
  const unique = [...new Set(lines)].filter(Boolean);
  const defaultOut = path.join(process.cwd(), 'docs', 'har-imported-terms.txt');
  const target = outFile || defaultOut;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, unique.join('\n') + '\n', 'utf-8');
  console.log(`[HAR 导入] 已写出 ${unique.length} 条待翻译候选到: ${target}`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error(`❌ HAR 导入失败: ${e.message}`);
    process.exit(1);
  });
}

module.exports = { extractFromHar, isGitHubHtml };
