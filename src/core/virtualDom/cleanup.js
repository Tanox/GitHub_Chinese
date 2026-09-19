/**
 * 虚拟节点清理策略
 * @file src/core/virtualDom/cleanup.js
 * @description 计算过期/脱离文档的节点，以及节点数超限时按最近更新时间淘汰
 */

import { MAX_AGE_MS } from './constants.js';

/**
 * 计算需要移除的节点 ID 集合
 * @param {Map<string, object>} nodes - 虚拟节点表
 * @param {number} now - 当前时间戳
 * @returns {string[]} 待移除的节点 ID 列表
 */
export function collectStaleNodeIds(nodes, now) {
  const staleIds = [];

  for (const [id, node] of nodes) {
    if (!document.contains(node.element)) {
      staleIds.push(id);
      continue;
    }

    if (now - node.lastUpdated > MAX_AGE_MS) {
      staleIds.push(id);
    }
  }

  return staleIds;
}

/**
 * 按最近更新时间升序取出最旧的若干节点 ID
 * @param {Map<string, object>} nodes - 虚拟节点表
 * @param {number} count - 计划移除的数量
 * @returns {string[]} 待移除的节点 ID 列表
 */
export function pickOldestNodeIds(nodes, count) {
  const entries = Array.from(nodes.entries());
  entries.sort((a, b) => a[1].lastUpdated - b[1].lastUpdated);
  return entries.slice(0, count).map(([id]) => id);
}

/**
 * 从节点表与缓存中移除指定节点
 * @param {{nodes: Map, nodeCache: Map}} manager - 虚拟 DOM 管理器
 * @param {string[]} ids - 待移除的节点 ID 列表
 * @returns {number} 实际移除数量
 */
export function removeNodes(manager, ids) {
  let removedCount = 0;

  for (const id of ids) {
    manager.nodes.delete(id);
    manager.nodeCache.delete(id);
    removedCount++;
  }

  return removedCount;
}
