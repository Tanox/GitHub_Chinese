/**
 * 词典采集工具
 * @file collect-dict.cjs
 * @version 1.11.15
 * @author Sut
 * @description 从 GitHub 页面采集未翻译的文本并生成待翻译列表（报告生成见 scripts/dict-report.cjs）
 */

const fs = require('fs');
const { generateReport } = require('./scripts/dict-report.cjs');
const { mergeDictionaries } = require('./merge-dictionaries.cjs');

/**
 * 归一化候选文本，降低误判：解码常见 HTML 实体、压缩空白、去除首尾标点
 * @param {string} raw - 原始文本
 * @returns {string} 归一化后的文本
 */
function normalizeText(raw) {
  let s = (raw ?? '').trim();
  s = s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
  s = s.replace(/\s+/g, ' ');
  s = s.replace(/^[\s\p{P}]+|[\s\p{P}]+$/gu, '').trim();
  return s;
}

/**
 * 模板 / 占位符 token 正则：printf（`%s`/`%1$s`/`%%`）、Python 命名（`%(name)s`）、
 * 编号（`{0}`）、mustache（`{{var}}`）、Ruby 命名（`:name`）。用于在归一化后消除占位符差异（T16）。
 * @type {RegExp}
 */
// 模板/占位符 token（printf %s/%1$s/%%、Python %(name)s、编号 {0}、mustache {{var}}、Ruby :name）
const TEMPLATE_TOKEN_RE = /%(\d+\$)?[sdnioxXfgeEGc%]|%\([^)]+\)[sdnioxX]|\{\d+\}|\{\{[^}]+\}\}|:[A-Za-z_]\w*/g;

// 去占位符使「含占位符已翻译串」可命中「非模板词典词条」，降低误报（T16）。
// 注意：本函数在 normalizeText 之后调用；normalizeText 会先剥离开头标点，
// 故 `{{` 位于串首的 mustache 会被提前吃掉而归一不到（真实占位符多在串中，影响小）。
function stripTemplateTokens(raw) {
  return raw.replace(TEMPLATE_TOKEN_RE, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * 从文本列表中找出未翻译的词条
 * @description 先做归一化（解码实体 / 压缩空白 / 去首尾标点），再按大小写不敏感精确匹配，
 *   并在精确匹配之外增加归一化词典索引与去占位符索引（T16），减少误判。
 */
function findUntranslated(texts, dictionary) {
  const untranslated = [];
  const translated = new Set();

  // 归一化词典键，作为大小写 / 首尾标点不敏感的辅助索引
  const normalizedDict = {};
  for (const key of Object.keys(dictionary)) {
    normalizedDict[normalizeText(key).toLowerCase()] = dictionary[key];
  }

  // 去占位符词典索引（T16）：避免含占位符已翻译串误判待翻译
  const strippedDict = {};
  for (const nk of Object.keys(normalizedDict)) {
    const sk = stripTemplateTokens(nk);
    if (sk) strippedDict[sk] = normalizedDict[nk];
  }

  for (const text of texts) {
    const norm = normalizeText(text);
    // 基础过滤（基于归一化结果）
    if (norm.length < 2 || norm.length > 300) continue;
    if (/^\d+$/.test(norm)) continue; // 纯数字
    if (/^[\s\p{P}]+$/u.test(norm)) continue; // 纯标点或空白
    if (/^[^a-zA-Z\u4e00-\u9fa5]+$/.test(norm)) continue; // 不包含字母或中文

    const key = norm.toLowerCase();
    const strippedKey = stripTemplateTokens(key);
    const matched = dictionary[norm] || dictionary[key] || dictionary[norm.toUpperCase()] || normalizedDict[key] || (strippedKey && strippedDict[strippedKey]);
    if (matched) {
      translated.add(norm);
    } else {
      untranslated.push(norm);
    }
  }

  return { untranslated, translated };
}

/**
 * 解析入库分析：在文本列表上执行「未翻译匹配 + 覆盖率度量」一站式分析
 * @description 合并 `findUntranslated` 与 `coverage.cjs` 的 `computeCoverage`；
 *   为避免与 `coverage.cjs` 的顶层循环依赖，此处按需（运行时）require。
 * @param {string[]} texts - 原始文本行
 * @param {Object<string,string>} dictionary - 合并后的词典
 * @returns {{untranslated:string[], translated:Set<string>, coverage:ReturnType<typeof computeCoverage>}}
 */
function analyzeTexts(texts, dictionary) {
  const { untranslated, translated } = findUntranslated(texts, dictionary);
  const { computeCoverage } = require('./coverage.cjs');
  const coverage = computeCoverage(texts, dictionary);
  return { untranslated, translated, coverage };
}

/**
 * 主函数
 */
async function main() {
  const dictionary = await mergeDictionaries();
  console.log(`[词典采集] 已加载 ${Object.keys(dictionary).length} 个词条`);

  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('用法: node collect-dict.cjs <文本文件>（每行一个待检测文本）');
    process.exit(0);
  }

  const inputFile = args[0];
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ 文件不存在: ${inputFile}`);
    process.exit(1);
  }

  const texts = fs
    .readFileSync(inputFile, 'utf-8')
    .split('\n')
    .filter((t) => t.trim());
  const { untranslated, translated, coverage } = analyzeTexts(texts, dictionary);
  console.log(`[词典采集] 已翻译: ${translated.size}, 待翻译: ${untranslated.length}`);
  console.log(
    `[覆盖率] 候选 ${coverage.total} / 覆盖 ${coverage.covered} / 覆盖率 ${(coverage.rate * 100).toFixed(1)}%`,
  );

  generateReport(untranslated, { dictionary, coverage });
}

if (require.main === module) {
  main();
}

module.exports = {
  mergeDictionaries,
  findUntranslated,
  normalizeText,
  stripTemplateTokens,
  analyzeTexts,
  generateReport,
};
