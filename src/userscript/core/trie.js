/**
 * Trie树数据结构模块
 * @file trie.js
 * @version 1.13.34
 * @date 2026-06-09
 * @author Sut
 * @description 高效的字符串匹配数据结构，用于部分匹配翻译
 */

export class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.value = null;
    this.length = 0;
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode();
    this.size = 0;
  }

  insert(word, value) {
    if (!word || typeof word !== 'string' || word.length === 0) {
      return;
    }

    let node = this.root;
    // 与 findAllMatches 的 text[j] 保持一致，按 UTF-16 code unit 建节点：
    // for...of 按 Unicode code point 遍历，emoji 等非 BMP 字符会建成单节点，
    // 查询时取到的是代理项，导致含 emoji 的键永远匹配不上
    for (let i = 0; i < word.length; i += 1) {
      const char = word[i];
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }
    node.isEndOfWord = true;
    node.value = value;
    node.length = word.length;
    this.size++;
  }

  findAllMatches(text, minKeyLength = 0) {
    if (!text || typeof text !== 'string' || text.length === 0) {
      return [];
    }

    const matches = [];
    const textLen = text.length;

    for (let i = 0; i < textLen; i++) {
      let node = this.root;
      let currentWord = '';

      for (let j = i; j < textLen; j++) {
        const char = text[j];
        if (!node.children.has(char)) {
          break;
        }

        node = node.children.get(char);
        currentWord += char;

        if (node.isEndOfWord && currentWord.length >= minKeyLength) {
          matches.push({
            key: currentWord,
            value: node.value,
            start: i,
            end: j,
            length: node.length,
          });
        }
      }
    }

    return matches;
  }

  clear() {
    this.root = new TrieNode();
    this.size = 0;
  }

  getSize() {
    return this.size;
  }
}
