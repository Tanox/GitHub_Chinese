/**
 * 词典采集工具
 * @file collect-dict.cjs
 * @version 1.9.47
 * @author Sut
 * @description 从 GitHub 页面采集未翻译的文本并生成待翻译列表（报告生成见 scripts/dict-report.cjs）
 */

const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const { generateReport } = require('./scripts/dict-report.cjs');

const PROJECT_ROOT = path.resolve(__dirname);
const DICT_DIR = path.join(PROJECT_ROOT, 'src', 'dictionaries');

/**
 * 递归收集词典目录下的全部模块文件（避免手工清单与源码结构脱节）
 * @param {string} dir - 目录绝对路径
 * @param {string[]} [acc] - 累积结果
 * @returns {string[]} 词典模块绝对路径列表
 */
function listDictionaryFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listDictionaryFiles(full, acc);
    } else if (entry.name.endsWith('.js')) {
      acc.push(full);
    }
  }
  return acc;
}

/**
 * 合并所有词典
 */
async function mergeDictionaries() {
  const merged = {};
  const dictFiles = listDictionaryFiles(DICT_DIR).sort();

  for (const filePath of dictFiles) {
    const file = path.relative(PROJECT_ROOT, filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    try {
      const ast = babel.parseSync(content, {
        sourceType: 'module',
        filename: filePath,
      });

      babel.traverse(ast, {
        ObjectProperty(propPath) {
          const keyNode = propPath.node.key;
          const valueNode = propPath.node.value;

          let key = null;
          if (keyNode.type === 'StringLiteral') {
            key = keyNode.value;
          } else if (keyNode.type === 'Identifier') {
            key = keyNode.name;
          }

          if (key && valueNode.type === 'StringLiteral') {
            merged[key] = valueNode.value;
          }
        },
      });
    } catch (err) {
      console.warn(`[WARN] 无法解析词典文件 ${file}: ${err.message}`);
    }
  }

  return merged;
}

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
 * 从文本列表中找出未翻译的词条
 * @description 先做归一化（解码实体 / 压缩空白 / 去首尾标点），再按大小写不敏感精确匹配，
 *   并在精确匹配之外增加归一化词典索引，减少把「已翻译 / 仅差标点」误判为「待翻译」。
 */
function findUntranslated(texts, dictionary) {
  const untranslated = [];
  const translated = new Set();

  // 归一化词典键，作为大小写 / 首尾标点不敏感的辅助索引
  const normalizedDict = {};
  for (const key of Object.keys(dictionary)) {
    normalizedDict[normalizeText(key).toLowerCase()] = dictionary[key];
  }

  for (const text of texts) {
    const norm = normalizeText(text);
    // 基础过滤（基于归一化结果）
    if (norm.length < 2 || norm.length > 300) continue;
    if (/^\d+$/.test(norm)) continue; // 纯数字
    if (/^[\s\p{P}]+$/u.test(norm)) continue; // 纯标点或空白
    if (/^[^a-zA-Z\u4e00-\u9fa5]+$/.test(norm)) continue; // 不包含字母或中文

    // 检查词典：精确（含大小写三态）优先，其次归一化索引
    const key = norm.toLowerCase();
    const matched =
      dictionary[norm] || dictionary[key] || dictionary[norm.toUpperCase()] || normalizedDict[key];
    if (matched) {
      translated.add(norm);
    } else {
      untranslated.push(norm);
    }
  }

  return { untranslated, translated };
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
  const { untranslated, translated } = findUntranslated(texts, dictionary);
  console.log(`[词典采集] 已翻译: ${translated.size}, 待翻译: ${untranslated.length}`);

  generateReport(untranslated);
}

if (require.main === module) {
  main();
}

module.exports = { mergeDictionaries, findUntranslated, normalizeText, generateReport };
