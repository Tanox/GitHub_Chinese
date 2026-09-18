const STORAGE_KEYS = {
  INPUT: 'i18n_collector_raw_input',
  LOG: 'i18n_collector_log',
  PROG_WIDTH: 'i18n_collector_progress_width',
  PROG_PERCENT: 'i18n_collector_progress_percent',
  PROG_TEXT: 'i18n_collector_progress_text'
};

// Restore state on load
window.addEventListener('DOMContentLoaded', () => {
  const rawInput = document.getElementById('rawInput');
  const savedInput = localStorage.getItem(STORAGE_KEYS.INPUT);
  if (savedInput) {
    rawInput.value = savedInput;
    updatePreviewTable(savedInput);
  }

  // Auto-save input changes
  if (rawInput) {
    rawInput.addEventListener('input', (e) => {
      localStorage.setItem(STORAGE_KEYS.INPUT, e.target.value);
      updatePreviewTable(e.target.value);
    });
  }

  const savedLog = localStorage.getItem(STORAGE_KEYS.LOG);
  if (savedLog) {
    const dashboardSection = document.getElementById('dashboardSection');
    dashboardSection.classList.remove('hidden');
    dashboardSection.classList.add('flex');
    
    document.getElementById('outputLog').innerText = savedLog;
    document.getElementById('progressBar').style.width = localStorage.getItem(STORAGE_KEYS.PROG_WIDTH) || '0%';
    document.getElementById('progressPercent').innerText = localStorage.getItem(STORAGE_KEYS.PROG_PERCENT) || '0%';
    document.getElementById('progressText').innerText = localStorage.getItem(STORAGE_KEYS.PROG_TEXT) || '就绪';
    
    const outputLog = document.getElementById('outputLog');
    outputLog.scrollTop = outputLog.scrollHeight;
  }
});

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
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
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function saveProgressState() {
  localStorage.setItem(STORAGE_KEYS.LOG, document.getElementById('outputLog').innerText);
  localStorage.setItem(STORAGE_KEYS.PROG_WIDTH, document.getElementById('progressBar').style.width);
  localStorage.setItem(STORAGE_KEYS.PROG_PERCENT, document.getElementById('progressPercent').innerText);
  localStorage.setItem(STORAGE_KEYS.PROG_TEXT, document.getElementById('progressText').innerText);
}

function copyScript(btn) {
  const originalText = btn.innerText;
  const script = document.getElementById('script').innerText;
  navigator.clipboard.writeText(script).then(() => {
    btn.innerText = '已复制！';
    btn.classList.replace('bg-blue-50', 'bg-emerald-50');
    btn.classList.replace('text-blue-600', 'text-emerald-600');
    setTimeout(() => {
      btn.innerText = originalText;
      btn.classList.replace('bg-emerald-50', 'bg-blue-50');
      btn.classList.replace('text-emerald-600', 'text-blue-600');
    }, 2000);
  });
}

function cleanData() {
  const input = document.getElementById('rawInput').value;
  const lines = input.split('\n');
  const cleaned = lines.filter(line => {
    const trimmed = line.trim();
    // Allow terms with length >= 2 (e.g., 'Go', 'Up', 'UI')
    // Filter out pure numbers and pure punctuation/symbols
    return trimmed.length >= 2 && !/^\d+$/.test(trimmed) && !/^[^a-zA-Z\u4e00-\u9fa5]+$/.test(trimmed);
  });
  const newValue = [...new Set(cleaned)].join('\n');
  document.getElementById('rawInput').value = newValue;
  localStorage.setItem(STORAGE_KEYS.INPUT, newValue);
  updatePreviewTable(newValue);
}

function updatePreviewTable(content) {
  const previewContainer = document.getElementById('previewContainer');
  const previewBody = document.getElementById('previewBody');
  const termCount = document.getElementById('termCount');
  
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
      <td class="px-6 py-4 text-sm font-medium text-slate-700">${escapeHtml(line)}</td>
      <td class="px-6 py-4 text-right">
        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
          PENDING
        </span>
      </td>
    </tr>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function exportDataToJson() {
  const input = document.getElementById('rawInput').value;
  if (!input.trim()) {
    return;
  }
  
  const lines = input.split('\n').map(line => line.trim()).filter(line => line);
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
}

function switchTab(mode) {
  const tabManual = document.getElementById('tabManual');
  const tabUrls = document.getElementById('tabUrls');
  const manualMode = document.getElementById('manualMode');
  const urlMode = document.getElementById('urlMode');

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
}

function handleStreamResponse(response, runBtnId) {
  return new Promise(async (resolve, reject) => {
    const runBtn = document.getElementById(runBtnId);
    const dashboardSection = document.getElementById('dashboardSection');
    const outputLog = document.getElementById('outputLog');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');

    runBtn.disabled = true;
    runBtn.classList.add('opacity-50', 'cursor-not-allowed');
    dashboardSection.classList.remove('hidden');
    dashboardSection.classList.add('flex');
    
    outputLog.innerText = '> 引擎启动...\n';
    progressBar.style.width = '5%';
    progressPercent.innerText = '5%';
    progressText.innerText = '正在启动子进程...';
    saveProgressState();

    try {
      if (!response.body) throw new Error('流式响应失败');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      const totalModules = 7;
      let modulesProcessed = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop(); 

        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            try {
              const dataContent = line.substring(line.indexOf('data: ') + 6).trim();
              if (!dataContent) continue;
              const event = JSON.parse(dataContent);
              
              if (event.type === 'log') {
                outputLog.innerText += `${event.message}\n`;
                outputLog.scrollTop = outputLog.scrollHeight;

                if (event.message.includes('[模块分析] 正在解析模块:')) {
                  const moduleName = event.message.split('正在解析模块:')[1].trim();
                  modulesProcessed++;
                  const percent = Math.min(10 + Math.floor((modulesProcessed / totalModules) * 70), 80);
                  progressBar.style.width = `${percent}%`;
                  progressPercent.innerText = `${percent}%`;
                  progressText.innerText = `正在分析 Github 模块：${moduleName}`;
                } else if (event.message.includes('待翻译词条列表')) {
                  progressBar.style.width = `90%`;
                  progressPercent.innerText = `90%`;
                  progressText.innerText = `正在生成翻译对比报告...`;
                }
              } else if (event.type === 'progress') {
                 if (event.message.type === 'fetch') {
                   const p = Math.floor((event.message.current / event.message.total) * 40); // Fetching is first 40%
                   progressBar.style.width = `${p}%`;
                   progressPercent.innerText = `${p}%`;
                   progressText.innerText = `正在抓取页面: ${event.message.url} (${event.message.current}/${event.message.total})`;
                 } else if (event.message.type === 'analyze') {
                   progressBar.style.width = `45%`;
                   progressPercent.innerText = `45%`;
                   progressText.innerText = `开始分析词典...`;
                 }
              } else if (event.type === 'error') {
                outputLog.innerText += `[错误] ${event.message}\n`;
                outputLog.scrollTop = outputLog.scrollHeight;
              } else if (event.type === 'done') {
                progressBar.style.width = `100%`;
                progressPercent.innerText = `100%`;
                progressText.innerText = `采集与分析完成，状态码: ${event.code || 0}`;
              }
              
              saveProgressState();

            } catch (e) {
              // ignore
            }
          }
        }
      }
      resolve();
    } catch (error) {
      outputLog.innerText += `\n[系统错误] ${error.message}`;
      progressText.innerText = `执行失败`;
      progressBar.classList.add('bg-red-500');
      saveProgressState();
      reject(error);
    } finally {
      runBtn.disabled = false;
      runBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  });
}

async function runCollection() {
  const data = document.getElementById('rawInput').value.trim();
  if (!data) return showToast('请先粘贴或输入数据！', 'error');
  
  try {
    const response = await fetch('/api/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });
    await handleStreamResponse(response, 'runBtn');
  } catch(e) {}
}

async function runBatchCollection() {
  const data = document.getElementById('urlInput').value.trim();
  if (!data) return showToast('请输入需要抓取的 URL！', 'error');
  
  const urls = data.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'));
  if (urls.length === 0) return showToast('未找到有效的 http/https 链接！', 'error');

  try {
    const response = await fetch('/api/batch-collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls })
    });
    await handleStreamResponse(response, 'batchRunBtn');
  } catch(e) {}
}
