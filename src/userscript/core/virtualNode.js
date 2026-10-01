/**
 * 虚拟DOM节点模块
 * @file virtualNode.js
 * @version 1.9.21
 * @date 2026-06-10
 * @author Sut
 * @description 虚拟DOM节点类，表示一个DOM元素的虚拟映射
 */
import { CONFIG } from '../config.js';

const RANDOM_BASE = 36;
const RANDOM_START_INDEX = 2;
const RANDOM_LENGTH = 9;

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    // eslint-disable-next-line no-magic-numbers
    hash = (hash * 31 + char) % 2147483647;
  }
  return Math.abs(hash).toString(RANDOM_BASE);
}

class VirtualNode {
  constructor(element) {
    this.element = element;
    this.elementId = null;
    this.contentHash = null;
    this.isTranslated = false;
    this.attributes = new Map();
    this.childNodes = new Map();
    this.lastUpdated = Date.now();

    this.initialize();
  }

  initialize() {
    try {
      this.generateId();
      this.updateContentHash();
      this.updateAttributes();
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 初始化虚拟节点失败:', error);
      }
    }
  }

  generateId() {
    try {
      if (this.element.id) {
        this.elementId = `id:${this.element.id}`;
      } else if (this.element.dataset && this.element.dataset.testid) {
        this.elementId = `testid:${this.element.dataset.testid}`;
      } else {
        this.elementId = `temp:${Date.now()}:${Math.random().toString(RANDOM_BASE).substr(RANDOM_START_INDEX, RANDOM_LENGTH)}`;
        this.element.dataset.virtualDomId = this.elementId;
      }
    } catch (_error) {
      this.elementId = `fallback:${Math.random().toString(RANDOM_BASE).substr(RANDOM_START_INDEX, RANDOM_LENGTH)}`;
    }
  }

  updateContentHash() {
    try {
      const content = this.element.textContent || '';
      this.contentHash = hashString(content);
      return this.contentHash;
    } catch (_error) {
      this.contentHash = null;
      return null;
    }
  }

  updateAttributes() {
    try {
      const importantAttrs = CONFIG.performance.importantAttributes || [];

      importantAttrs.forEach((attrName) => {
        if (this.element.hasAttribute(attrName)) {
          this.attributes.set(attrName, this.element.getAttribute(attrName));
        } else {
          this.attributes.delete(attrName);
        }
      });
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 更新属性状态失败:', error);
      }
    }
  }

  hasContentChanged() {
    const newHash = this.updateContentHash();
    return newHash !== this.contentHash;
  }

  hasAttributesChanged() {
    const originalAttributes = new Map(this.attributes);
    this.updateAttributes();

    if (originalAttributes.size !== this.attributes.size) {
      return true;
    }

    for (const [key, value] of originalAttributes) {
      if (!this.attributes.has(key) || this.attributes.get(key) !== value) {
        return true;
      }
    }

    return false;
  }

  markAsTranslated() {
    this.isTranslated = true;
    this.lastUpdated = Date.now();
    try {
      this.element.dataset.githubZhTranslated = 'true';
    } catch (_error) {
      // 忽略错误
    }
  }

  resetTranslation() {
    this.isTranslated = false;
    this.lastUpdated = Date.now();
    try {
      delete this.element.dataset.githubZhTranslated;
    } catch (_error) {
      // 忽略错误
    }
  }
}

export { VirtualNode, hashString };
