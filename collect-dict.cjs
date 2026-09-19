/**
 * 词典采集工具
 * @file collect-dict.cjs
 * @version 1.9.20
 * @date 2026-06-10
 * @author Sut
 * @description 从 GitHub 页面采集未翻译的文本并生成待翻译列表
 */

const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const PROJECT_ROOT = path.resolve(__dirname);
const DICT_DIR = path.join(PROJECT_ROOT, 'src', 'dictionaries');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    console.log(`[模块分析] 正在解析模块: ${file}`);
    await sleep(20);
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
 * 从文本列表中找出未翻译的词条
 */
function findUntranslated(texts, dictionary) {
  const untranslated = [];
  const translated = new Set();

  for (const text of texts) {
    const trimmed = text.trim();
    // 基础过滤：允许长度 >= 2 的词条（同步前端逻辑）
    if (trimmed.length < 2 || trimmed.length > 300) continue;
    if (/^\d+$/.test(trimmed)) continue; // 纯数字
    if (/^[\s\p{P}]+$/u.test(trimmed)) continue; // 纯标点或空白
    if (/^[^a-zA-Z\u4e00-\u9fa5]+$/.test(trimmed)) continue; // 不包含字母或中文

    // 检查词典（不区分大小写）
    const lowerText = trimmed.toLowerCase();
    const upperText = trimmed.toUpperCase();

    if (dictionary[trimmed] || dictionary[lowerText] || dictionary[upperText]) {
      translated.add(trimmed);
    } else {
      untranslated.push(trimmed);
    }
  }

  return { untranslated, translated };
}

/**
 * 生成待翻译报告
 */
function generateReport(untranslated) {
  const uniqueUntranslated = [...new Set(untranslated)].sort();

  console.log('\n========================================');
  console.log('  GitHub 中文翻译 - 词典采集报告');
  console.log('========================================\n');
  console.log(`📊 发现 ${uniqueUntranslated.length} 个待翻译词条\n`);

  if (uniqueUntranslated.length > 0) {
    console.log('待翻译词条列表：');
    console.log('---');

    uniqueUntranslated.slice(0, 50).forEach((text, index) => {
      console.log(`${index + 1}. "${text}"`);
    });

    if (uniqueUntranslated.length > 50) {
      console.log(`\n... 还有 ${uniqueUntranslated.length - 50} 个词条`);
    }

    console.log('---\n');

    // 生成可复制到词典文件的格式
    console.log('可复制到 common.js 的格式：');
    console.log('---');
    uniqueUntranslated.slice(0, 20).forEach((text) => {
      const escapedKey = text.replace(/'/g, "\\'");
      console.log(`  '${escapedKey}': '待翻译: ${escapedKey}',`);
    });
    console.log('---\n');
  }

  // 输出到文件
  const outputPath = path.join(PROJECT_ROOT, 'docs', 'untranslated-terms.txt');
  const reportContent = uniqueUntranslated.map((text) => `"${text}"`).join('\n');
  fs.writeFileSync(outputPath, reportContent, 'utf-8');
  console.log(`✅ 报告已保存到: ${outputPath}\n`);
}

/**
 * 主函数
 */
async function main() {
  const dictionary = await mergeDictionaries();
  console.log(`[词典采集] 已加载 ${Object.keys(dictionary).length} 个词条`);

  // 从命令行参数获取待检测的文本列表
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('\n使用方法:');
    console.log('  node collect-dict.cjs <文本文件>');
    console.log('\n文本文件应包含从 GitHub 页面采集的文本，每行一个');
    console.log('\n示例:');
    console.log('  echo "Sign in\\nPull requests\\nNew issue" > terms.txt');
    console.log('  node collect-dict.cjs terms.txt\n');
    process.exit(0);
  }

  const inputFile = args[0];
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ 文件不存在: ${inputFile}`);
    process.exit(1);
  }

  const content = fs.readFileSync(inputFile, 'utf-8');
  const texts = content.split('\n').filter((t) => t.trim());

  const { untranslated, translated } = findUntranslated(texts, dictionary);
  console.log(`[词典采集] 已翻译: ${translated.size}, 待翻译: ${untranslated.length}`);

  generateReport(untranslated);
}

if (require.main === module) {
  main();
}

module.exports = { mergeDictionaries, findUntranslated, generateReport };
