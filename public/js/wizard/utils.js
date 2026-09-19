/**
 * 采集向导工具模块
 * @file public/js/wizard/utils.js
 * @version 1.9.24
 */
import { NOTIFICATION_AUTO_HIDE_MS } from './constants.js';

export const wizardUtils = {
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast${type === 'error' ? ' error' : ''}`;

    toast.innerHTML = `
      <div class="flex items-center">
        ${type === 'error' ? '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>' : ''}
        ${message}
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, NOTIFICATION_AUTO_HIDE_MS);
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  async copyText(text, btn) {
    const originalText = btn.innerText;
    try {
      await navigator.clipboard.writeText(text);
      btn.innerText = '已复制！';
      btn.classList.add('is-copied');

      setTimeout(() => {
        btn.innerText = originalText;
        btn.classList.remove('is-copied');
      }, 2000);
    } catch (err) {
      this.showToast('复制失败', 'error');
    }
  },
};
