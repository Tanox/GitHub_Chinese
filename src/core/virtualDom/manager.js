/**
 * 虚拟DOM管理器类
 * @file src/core/virtualDom/manager.js
 */
import { CONFIG } from '../../config.js';
import { VirtualNode } from '../virtualNode.js';
import {
  CLEANUP_INTERVAL_MS,
  MAX_NODES_DEFAULT,
  NODES_REMOVE_RATIO,
  MAX_AGE_MS
} from './constants.js';

export class VirtualDomManager {
  constructor() {
    this.nodes = new Map();
    this.nodeCache = new Map();
    this.lastCleanupTime = Date.now();
    this.cleanupInterval = CLEANUP_INTERVAL_MS;
    this.maxNodes = MAX_NODES_DEFAULT;
    this.cleanupTimer = null;
    this.isPageUnloading = false;

    this.setupPageUnloadHandler();
    this.startAutoCleanup();
  }

  setupPageUnloadHandler() {
    const unloadHandler = () => {
      this.isPageUnloading = true;
      this.cleanup();
    };

    window.addEventListener('beforeunload', unloadHandler);
    window.addEventListener('unload', unloadHandler);
    window.addEventListener('pagehide', unloadHandler);
  }

  getOrCreateNode(element) {
    try {
      if (this.isPageUnloading) {
        return null;
      }

      if (element.dataset && element.dataset.virtualDomId) {
        const cachedNode = this.nodeCache.get(element.dataset.virtualDomId);
        if (cachedNode && cachedNode.element === element) {
          return cachedNode;
        }
      }

      if (this.nodes.size >= this.maxNodes) {
        this.cleanup(true);

        if (this.nodes.size >= this.maxNodes) {
          const nodesToRemove = Math.floor(this.maxNodes * NODES_REMOVE_RATIO);
          const entries = Array.from(this.nodes.entries());

          entries.sort((a, b) => a[1].lastUpdated - b[1].lastUpdated);

          for (let i = 0; i < nodesToRemove; i++) {
            const [id] = entries[i];
            this.nodes.delete(id);
            this.nodeCache.delete(id);
          }

          if (CONFIG.debugMode) {
            console.log(`[GitHub 中文翻译] 强制清理了${nodesToRemove}个虚拟节点`);
          }
        }
      }

      const node = new VirtualNode(element);
      this.nodes.set(node.elementId, node);
      this.nodeCache.set(node.elementId, node);

      return node;
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 获取或创建虚拟节点失败:', error);
      }
      return null;
    }
  }

  findNodeById(elementId) {
    return this.nodes.get(elementId) || null;
  }

  shouldTranslate(element) {
    try {
      const node = this.getOrCreateNode(element);

      if (!node) {
        return true;
      }

      const contentChanged = node.hasContentChanged();
      const attributesChanged = node.hasAttributesChanged();

      if (contentChanged || attributesChanged) {
        node.resetTranslation();
        return true;
      }

      if (node.isTranslated) {
        return false;
      }

      return true;
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 检查翻译状态失败:', error);
      }
      return true;
    }
  }

  markElementAsTranslated(element) {
    try {
      const node = this.getOrCreateNode(element);
      if (node) {
        node.markAsTranslated();
      }
    } catch (_error) {
      // 忽略错误
    }
  }

  processElements(elements) {
    const elementsToTranslate = [];

    try {
      elements.forEach((element) => {
        if (this.shouldTranslate(element)) {
          elementsToTranslate.push(element);
        }
      });
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 批量处理元素失败:', error);
      }
      elementsToTranslate.push(...elements);
    }

    return elementsToTranslate;
  }

  startAutoCleanup() {
    this.stopAutoCleanup();
    this.cleanupTimer = setInterval(() => {
      if (this.isPageUnloading) {
        this.stopAutoCleanup();
        return;
      }

      this.cleanup();
    }, this.cleanupInterval);
  }

  stopAutoCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  cleanup(force = false) {
    try {
      const now = Date.now();

      if (!force && now - this.lastCleanupTime < this.cleanupInterval) {
        return;
      }

      this.lastCleanupTime = now;
      let removedCount = 0;

      if (force || this.isPageUnloading) {
        removedCount = this.nodes.size;
        this.nodes.clear();
        this.nodeCache.clear();

        if (CONFIG.debugMode) {
          console.log(`[GitHub 中文翻译] 强制清理了${removedCount}个虚拟节点`);
        }
        return;
      }

      const nodesToRemove = [];

      for (const [id, node] of this.nodes) {
        if (!document.contains(node.element)) {
          nodesToRemove.push(id);
          continue;
        }

        const timeSinceUpdate = now - node.lastUpdated;
        const maxAge = MAX_AGE_MS;

        if (timeSinceUpdate > maxAge) {
          nodesToRemove.push(id);
        }
      }

      for (const id of nodesToRemove) {
        this.nodes.delete(id);
        this.nodeCache.delete(id);
        removedCount++;
      }

      if (CONFIG.debugMode && removedCount > 0) {
        console.log(
          `[GitHub 中文翻译] 清理了${removedCount}个无效虚拟节点，当前节点数：${this.nodes.size}`,
        );
      }
    } catch (error) {
      if (CONFIG.debugMode) {
        console.error('[GitHub 中文翻译] 清理虚拟节点失败:', error);
      }
    }
  }

  clear() {
    this.nodes.clear();
    this.nodeCache.clear();
    this.lastCleanupTime = Date.now();
  }

  getStats() {
    return {
      nodeCount: this.nodes.size,
      lastCleanupTime: this.lastCleanupTime,
    };
  }
}
