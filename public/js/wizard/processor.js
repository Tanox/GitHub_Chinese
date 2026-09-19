/**
 * 采集向导处理器模块
 * @file public/js/wizard/processor.js
 */
import { wizardStore } from './store.js';
import { wizardRenderer } from './renderer.js';

export const wizardProcessor = {
  cleanData() {
    const rawInput = document.getElementById('rawInput');
    if (!rawInput) return;

    const input = rawInput.value;
    const lines = input.split('\n');
    const cleaned = lines.filter((line) => {
      const trimmed = line.trim();
      // 允许长度 >= 2 的项
      // 过滤纯数字和纯标点
      return (
        trimmed.length >= 2 && !/^\d+$/.test(trimmed) && !/^[^a-zA-Z\u4e00-\u9fa5]+$/.test(trimmed)
      );
    });

    const newValue = [...new Set(cleaned)].join('\n');
    rawInput.value = newValue;
    wizardStore.setRawInput(newValue);
    wizardRenderer.updatePreviewTable(newValue);
  },

  exportDataToJson() {
    const rawInput = document.getElementById('rawInput');
    if (!rawInput) return;

    const input = rawInput.value.trim();
    if (!input) return;

    const lines = input
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line);
    const jsonData = JSON.stringify(lines, null, 2);

    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `github-terms-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
