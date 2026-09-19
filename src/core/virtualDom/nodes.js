/**
 * 虚拟节点创建与容量控制
 * @file src/core/virtualDom/nodes.js
 */

import { CONFIG } from '../../config.js';
import { VirtualNode } from '../virtualNode.js';
import { NODES_REMOVE_RATIO } from './constants.js';
import { pickOldestNodeIds, removeNodes } from './cleanup.js';

/**
 * 节点数超限时按最近更新时间淘汰最旧节点
 * @param {object} manager - 虚拟 DOM 管理器
 */
export function trimOldestNodes(manager) {
  const nodesToRemove = Math.floor(manager.maxNodes * NODES_REMOVE_RATIO);
  const removed = removeNodes(manager, pickOldestNodeIds(manager.nodes, nodesToRemove));

  if (CONFIG.debugMode) {
    console.log(`[GitHub 中文翻译] 强制清理了${removed}个虚拟节点`);
  }
}

/**
 * 复用缓存节点或按需创建虚拟节点
 * @param {object} manager - 虚拟 DOM 管理器
 * @param {HTMLElement} element - 目标元素
 * @returns {VirtualNode|null} 虚拟节点；页面卸载中或异常时返回 null
 */
export function getOrCreateNode(manager, element) {
  try {
    if (manager.isPageUnloading) {
      return null;
    }

    if (element.dataset && element.dataset.virtualDomId) {
      const cachedNode = manager.nodeCache.get(element.dataset.virtualDomId);
      if (cachedNode && cachedNode.element === element) {
        return cachedNode;
      }
    }

    if (manager.nodes.size >= manager.maxNodes) {
      manager.cleanup(true);

      if (manager.nodes.size >= manager.maxNodes) {
        trimOldestNodes(manager);
      }
    }

    const node = new VirtualNode(element);
    manager.nodes.set(node.elementId, node);
    manager.nodeCache.set(node.elementId, node);

    return node;
  } catch (error) {
    if (CONFIG.debugMode) {
      console.error('[GitHub 中文翻译] 获取或创建虚拟节点失败:', error);
    }
    return null;
  }
}
