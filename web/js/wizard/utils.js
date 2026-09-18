/**
 * 采集向导工具模块
 * @file web/js/wizard/utils.js
 */
import { NOTIFICATION_AUTO_HIDE_MS } from './constants.js';

export const wizardUtils = {
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `mt-4 px-6 py-3 rounded-2xl shadow-xl text-white font-bold text-sm pointer-events-auto animate-in fade-in slide-in-from-bottom-5 duration-300 ${
      type === 'error' ? 'bg-rose-500 shadow-rose-500/20' : 'bg-slate-800 shadow-slate-900/20'
    }`;
    
    toast.innerHTML = `
      <div class="flex items-center">
        ${type === 'error' ? '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>' : ''}
        ${message}
      </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
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
      btn.classList.replace('bg-blue-50', 'bg-emerald-50');
      btn.classList.replace('text-blue-600', 'text-emerald-600');
      
      setTimeout(() => {
        btn.innerText = originalText;
        btn.classList.replace('bg-emerald-50', 'bg-blue-50');
        btn.classList.replace('text-emerald-600', 'text-blue-600');
      }, 2000);
    } catch (err) {
      this.showToast('复制失败', 'error');
    }
  }
};
