/**
 * GitHub 中文翻译性能监控组件
 * @file performanceMonitor.js
 * @version 1.9.28
 * @date 2026-09-23
 * @author Sut
 * @description 性能监控区域组件
 */

import { VERSION } from '../../version.js';

/** 无数据时按钮反馈文案的自动复位时长（毫秒） */
const NO_DATA_FEEDBACK_MS = 1500;

/**
 * 创建性能监控区域
 * @returns {HTMLElement} 性能监控区域元素
 */
export function createPerformanceMonitoringSection() {
  const section = document.createElement('div');
  section.className = 'github-i18n-config-section';

  const sectionTitle = document.createElement('h4');
  sectionTitle.innerHTML = '<span style="color: #d29922;">📊</span> 性能监控';
  section.appendChild(sectionTitle);

  const perfGrid = document.createElement('div');
  perfGrid.className = 'github-i18n-perf-grid';
  perfGrid.id = 'github-i18n-performance-stats';

  const stats = [
    { key: 'duration', label: '总耗时', unit: 'ms', id: 'github-i18n-stat-duration' },
    { key: 'elements', label: '翻译项', unit: '', id: 'github-i18n-stat-elements' },
    { key: 'cacheRate', label: '命中率', unit: '%', id: 'github-i18n-stat-cache-rate' },
  ];

  stats.forEach((stat) => {
    const statDiv = document.createElement('div');
    statDiv.className = 'github-i18n-perf-stat';

    const k = document.createElement('div');
    k.className = 'k';
    k.textContent = stat.label;

    const v = document.createElement('div');
    v.className = 'v';
    v.id = stat.id;
    v.textContent = '-';

    statDiv.appendChild(k);
    statDiv.appendChild(v);
    perfGrid.appendChild(statDiv);
  });

  section.appendChild(perfGrid);

  const advancedStatsDiv = document.createElement('div');
  advancedStatsDiv.className = 'github-i18n-advanced-stats';

  const advancedStats = [
    { label: '缓存命中:', id: 'github-i18n-stat-cache-hits' },
    { label: '缓存未命中:', id: 'github-i18n-stat-cache-misses' },
    { label: 'DOM操作:', id: 'github-i18n-stat-dom' },
    { label: '网络请求:', id: 'github-i18n-stat-network' },
    { label: '批处理次数:', id: 'github-i18n-stat-batches' },
  ];

  advancedStats.forEach((stat) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'github-i18n-config-item';

    const label = document.createElement('span');
    label.className = 'github-i18n-config-label';
    label.textContent = stat.label;

    const value = document.createElement('span');
    value.id = stat.id;
    value.style.fontFamily =
      '"JetBrains Mono", "SF Mono", SFMono-Regular, Menlo, Consolas, "Courier New", monospace';
    value.style.color = '#8b949e';
    value.textContent = '-';

    itemDiv.appendChild(label);
    itemDiv.appendChild(value);
    advancedStatsDiv.appendChild(itemDiv);
  });

  section.appendChild(advancedStatsDiv);

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'github-i18n-config-actions';

  const refreshBtn = document.createElement('button');
  refreshBtn.id = 'github-i18n-refresh-stats';
  refreshBtn.textContent = '刷新性能数据';
  refreshBtn.addEventListener('click', updatePerformanceStats);

  const exportBtn = document.createElement('button');
  exportBtn.id = 'github-i18n-export-stats';
  exportBtn.textContent = '导出性能数据';
  exportBtn.addEventListener('click', () => {
    const data = exportPerformanceStats();
    if (!data) {
      const original = exportBtn.textContent;
      exportBtn.textContent = '暂无数据';
      exportBtn.disabled = true;
      setTimeout(() => {
        exportBtn.textContent = original;
        exportBtn.disabled = false;
      }, NO_DATA_FEEDBACK_MS);
    }
  });

  actionsDiv.appendChild(refreshBtn);
  actionsDiv.appendChild(exportBtn);

  section.appendChild(actionsDiv);

  return section;
}

/**
 * 更新性能统计数据显示
 */
export function updatePerformanceStats() {
  if (window.isPageUnloading) return;

  if (window.translationCore && window.translationCore.getPerformanceStats) {
    const stats = window.translationCore.getPerformanceStats();

    const durationEl = document.getElementById('github-i18n-stat-duration');
    if (durationEl) durationEl.textContent = `${stats.totalDuration} ms`;

    const elementsEl = document.getElementById('github-i18n-stat-elements');
    if (elementsEl) elementsEl.textContent = stats.elementsProcessed;

    const textsEl = document.getElementById('github-i18n-stat-texts');
    if (textsEl) textsEl.textContent = stats.textsTranslated;

    const cacheRateEl = document.getElementById('github-i18n-stat-cache-rate');
    if (cacheRateEl) cacheRateEl.textContent = `${stats.cacheHitRate}%`;

    const cacheHitsEl = document.getElementById('github-i18n-stat-cache-hits');
    if (cacheHitsEl) cacheHitsEl.textContent = stats.cacheHits;

    const cacheMissesEl = document.getElementById('github-i18n-stat-cache-misses');
    if (cacheMissesEl) cacheMissesEl.textContent = stats.cacheMisses;

    const domOpsEl = document.getElementById('github-i18n-stat-dom');
    if (domOpsEl) domOpsEl.textContent = stats.domOperations;

    const networkEl = document.getElementById('github-i18n-stat-network');
    if (networkEl) networkEl.textContent = stats.networkRequests;

    const batchesEl = document.getElementById('github-i18n-stat-batches');
    if (batchesEl) batchesEl.textContent = stats.batchProcessings;
  }
}

/**
 * 导出性能数据
 * @returns {Object} 性能数据对象
 */
export function exportPerformanceStats() {
  if (window.translationCore && window.translationCore.getPerformanceStats) {
    const stats = window.translationCore.getPerformanceStats();
    const exportData = {
      timestamp: new Date().toISOString(),
      version: VERSION,
      ...stats,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `github-i18n-performance-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return exportData;
  }
  return null;
}
