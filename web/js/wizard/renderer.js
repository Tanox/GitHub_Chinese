/**
 * 采集向导渲染模块
 * @file web/js/wizard/renderer.js
 */
import { wizardUtils } from './utils.js';
import { wizardStore } from './store.js';

export const wizardRenderer = {
  updatePreviewTable(content) {
    const previewContainer = document.getElementById('previewContainer');
    const previewBody = document.getElementById('previewBody');
    const termCount = document.getElementById('termCount');
    
    if (!previewContainer || !previewBody || !termCount) return;

    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    if (lines.length === 0) {
      previewContainer.classList.add('hidden');
      return;
    }

    previewContainer.classList.remove('hidden');
    termCount.innerText = `${lines.length} 词条`;
    
    previewBody.innerHTML = lines.map((line, index) => `
      <tr class="group even:bg-slate-50/50 hover:bg-blue-50/50 transition-colors">
        <td class="px-6 py-4 text-xs font-mono text-slate-400">#${(index + 1).toString().padStart(3, '0')}</td>
        <td class="px-6 py-4 text-sm font-medium text-slate-700">${wizardUtils.escapeHtml(line)}</td>
        <td class="px-6 py-4 text-right">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            PENDING
          </span>
        </td>
      </tr>
    `).join('');
  },

  updateProgress(width, percent, text) {
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const progressText = document.getElementById('progressText');

    if (progressBar) progressBar.style.width = width;
    if (progressPercent) progressPercent.innerText = percent;
    if (progressText) progressText.innerText = text;
  },

  updateBackupStatus(time) {
    const backupStatus = document.getElementById('backupStatus');
    if (backupStatus) {
      backupStatus.innerHTML = `
        <svg class="w-3 h-3 mr-1.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        数据已自动备份: <span class="font-mono ml-1 font-bold">${time}</span>
      `;
    }
  },

  appendLog(message) {
    const outputLog = document.getElementById('outputLog');
    if (!outputLog) return;
    
    outputLog.innerText += `${message}\n`;
    outputLog.scrollTop = outputLog.scrollHeight;
  },

  setLog(content) {
    const outputLog = document.getElementById('outputLog');
    if (outputLog) {
      outputLog.innerText = content;
      outputLog.scrollTop = outputLog.scrollHeight;
    }
  },

  switchTab(mode) {
    const tabManual = document.getElementById('tabManual');
    const tabUrls = document.getElementById('tabUrls');
    const manualMode = document.getElementById('manualMode');
    const urlMode = document.getElementById('urlMode');

    if (!tabManual || !tabUrls || !manualMode || !urlMode) return;

    const activeClass = "flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 bg-white text-blue-600 shadow-sm border border-slate-200/50";
    const inactiveClass = "flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 text-slate-500 hover:text-slate-800";

    if (mode === 'manual') {
      tabManual.className = activeClass;
      tabUrls.className = inactiveClass;
      manualMode.classList.remove('hidden');
      urlMode.classList.add('hidden');
    } else {
      tabUrls.className = activeClass;
      tabManual.className = inactiveClass;
      urlMode.classList.remove('hidden');
      manualMode.classList.add('hidden');
    }
  },

  showDashboard() {
    const dashboardSection = document.getElementById('dashboardSection');
    if (dashboardSection) {
      dashboardSection.classList.remove('hidden');
      dashboardSection.classList.add('flex');
    }
  },

  saveCurrentState() {
    const outputLog = document.getElementById('outputLog');
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const progressText = document.getElementById('progressText');

    if (outputLog && progressBar && progressPercent && progressText) {
      wizardStore.saveProgressState(
        outputLog.innerText,
        progressBar.style.width,
        progressPercent.innerText,
        progressText.innerText
      );
    }
  }
};
