/**
 * 虚拟DOM管理器类
 * @file src/core/virtualDom/manager.js
 * @version 1.9.24
 * @description 节点创建/查询与翻译状态判定；清理策略与生命周期钩子拆分到同目录子模块
 */
import { CONFIG } from '../../config.js';
import { CLEANUP_INTERVAL_MS, MAX_NODES_DEFAULT } from './constants.js';
import { collectStaleNodeIds, removeNodes } from './cleanup.js';
import { getOrCreateNode } from './nodes.js';
import { bindPageUnloadHandler, startCleanupTimer, stopCleanupTimer } from './lifecycle.js';

export class VirtualDomManager {
  constructor() {
    this.nodes = new Map();
    this.nodeCache = new Map();
    this.lastCleanupTime = Date.now();
    this.cleanupInterval = CLEANUP_INTERVAL_MS;
    this.maxNodes = MAX_NODES_DEFAULT;
    this.cleanupTimer = null;
    this.isPageUnloading = false;

    bindPageUnloadHandler(this);
    this.startAutoCleanup();
  }

  /**
   * 复用缓存节点或按需创建；节点数超限时先淘汰最旧节点
   * @param {HTMLElement} element - 目标元素
   * @returns {VirtualNode|null} 虚拟节点
   */
  getOrCreateNode(element) {
    return getOrCreateNode(this, element);
  }

  /**
   * 按元素 ID 查询虚拟节点
   * @param {string} elementId - 元素 ID
   * @returns {VirtualNode|null} 虚拟节点
   */
  findNodeById(elementId) {
    return this.nodes.get(elementId) || null;
  }

  /**
   * 判定元素是否需要重新翻译
   * @param {HTMLElement} element - 目标元素
   * @returns {boolean} 是否需要翻译
   */
  shouldTranslate(element) {
    try {
      const node = getOrCreateNode(this, element);

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

  /**
   * 标记元素已翻译
   * @param {HTMLElement} element - 目标元素
   */
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

  /**
   * 批量筛选需要翻译的元素
   * @param {Iterable<HTMLElement>} elements - 候选元素
   * @returns {HTMLElement[]} 需要翻译的元素
   */
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

  /**
   * 启动自动清理
   */
  startAutoCleanup() {
    startCleanupTimer(this);
  }

  /**
   * 停止自动清理
   */
  stopAutoCleanup() {
    stopCleanupTimer(this);
  }

  /**
   * 清理虚拟节点
   * @param {boolean} [force] - 是否强制清空全部节点
   */
  cleanup(force = false) {
    try {
      const now = Date.now();

      if (!force && now - this.lastCleanupTime < this.cleanupInterval) {
        return;
      }

      this.lastCleanupTime = now;

      if (force || this.isPageUnloading) {
        const removedCount = this.nodes.size;
        this.nodes.clear();
        this.nodeCache.clear();

        if (CONFIG.debugMode) {
          console.log(`[GitHub 中文翻译] 强制清理了${removedCount}个虚拟节点`);
        }
        return;
      }

      const removedCount = removeNodes(this, collectStaleNodeIds(this.nodes, now));

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

  /**
   * 清空全部节点
   */
  clear() {
    this.nodes.clear();
    this.nodeCache.clear();
    this.lastCleanupTime = Date.now();
  }

  /**
   * 获取管理器统计信息
   * @returns {{nodeCount: number, lastCleanupTime: number}} 统计信息
   */
  getStats() {
    return {
      nodeCount: this.nodes.size,
      lastCleanupTime: this.lastCleanupTime,
    };
  }
}
