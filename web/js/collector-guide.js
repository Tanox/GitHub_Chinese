/**
 * 词典采集向导主入口
 * @file web/js/collector-guide.js
 */
import { wizardStore } from './wizard/store.js';
import { wizardRenderer } from './wizard/renderer.js';
import { wizardUtils } from './wizard/utils.js';
import { wizardProcessor } from './wizard/processor.js';
import { wizardStream } from './wizard/stream.js';

// 初始化
window.addEventListener('DOMContentLoaded', () => {
  const rawInput = document.getElementById('rawInput');
  const urlInput = document.getElementById('urlInput');
  const runBtn = document.getElementById('runBtn');
  const batchRunBtn = document.getElementById('batchRunBtn');
  const cleanBtn = document.getElementById('cleanBtn');
  const exportBtn = document.getElementById('exportBtn');
  const copyScriptBtn = document.getElementById('copyScriptBtn');
  const tabManual = document.getElementById('tabManual');
  const tabUrls = document.getElementById('tabUrls');
  const clearLogBtn = document.getElementById('clearLogBtn');

  // 恢复输入状态
  const savedInput = wizardStore.getRawInput();
  if (savedInput && rawInput) {
    rawInput.value = savedInput;
    wizardRenderer.updatePreviewTable(savedInput);
  }

  // 恢复进度状态
  const savedState = wizardStore.getSavedState();
  if (savedState.log) {
    wizardRenderer.showDashboard();
    wizardRenderer.setLog(savedState.log);
    wizardRenderer.updateProgress(
      savedState.width || '0%',
      savedState.percent || '0%',
      savedState.text || '就绪'
    );
  }

  // 事件绑定
  if (rawInput) {
    rawInput.addEventListener('input', (e) => {
      wizardStore.setRawInput(e.target.value);
      wizardRenderer.updatePreviewTable(e.target.value);
    });
  }

  if (tabManual) {
    tabManual.addEventListener('click', () => wizardRenderer.switchTab('manual'));
  }

  if (tabUrls) {
    tabUrls.addEventListener('click', () => wizardRenderer.switchTab('url'));
  }

  if (cleanBtn) {
    cleanBtn.addEventListener('click', () => wizardProcessor.cleanData());
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => wizardProcessor.exportDataToJson());
  }

  if (copyScriptBtn) {
    copyScriptBtn.addEventListener('click', () => {
      const script = document.getElementById('script').innerText;
      wizardUtils.copyText(script, copyScriptBtn);
    });
  }

  if (runBtn) {
    runBtn.addEventListener('click', () => wizardStream.runCollection());
  }

  if (batchRunBtn) {
    batchRunBtn.addEventListener('click', () => wizardStream.runBatchCollection());
  }

  if (clearLogBtn) {
    clearLogBtn.addEventListener('click', () => {
      wizardRenderer.setLog('');
      wizardStore.clearProgress();
    });
  }

  // 恢复备份状态显示
  const lastBackupTime = wizardStore.getLastBackupTime();
  if (lastBackupTime) {
    wizardRenderer.updateBackupStatus(lastBackupTime);
  }

  // 启动自动备份定时器 (每30秒)
  setInterval(() => {
    const rawInputVal = document.getElementById('rawInput')?.value || '';
    const outputLog = document.getElementById('outputLog');
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const progressText = document.getElementById('progressText');

    const state = {
      log: outputLog?.innerText,
      width: progressBar?.style.width,
      percent: progressPercent?.innerText,
      text: progressText?.innerText
    };

    const time = wizardStore.saveBackup(rawInputVal, state);
    wizardRenderer.updateBackupStatus(time);
  }, 30000);
});
