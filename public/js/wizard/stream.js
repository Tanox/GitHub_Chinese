/**
 * 采集向导流式处理模块
 * @file web/js/wizard/stream.js
 * @version 1.9.22
 */
import { wizardRenderer } from './renderer.js';
import { TOTAL_MODULES } from './constants.js';
import { wizardUtils } from './utils.js';

export const wizardStream = {
  async handleStreamResponse(response, runBtnId) {
    const runBtn = document.getElementById(runBtnId);
    if (!runBtn) return;

    runBtn.disabled = true;
    runBtn.classList.add('opacity-50', 'cursor-not-allowed');
    
    wizardRenderer.showDashboard();
    wizardRenderer.setLog('> 引擎启动...\n');
    wizardRenderer.updateProgress('5%', '5%', '正在启动子进程...');
    wizardRenderer.saveCurrentState();

    try {
      if (!response.body) throw new Error('流式响应失败');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
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
                wizardRenderer.appendLog(event.message);

                if (event.message.includes('[模块分析] 正在解析模块:')) {
                  const moduleName = event.message.split('正在解析模块:')[1].trim();
                  modulesProcessed++;
                  const percent = Math.min(10 + Math.floor((modulesProcessed / TOTAL_MODULES) * 70), 80);
                  wizardRenderer.updateProgress(`${percent}%`, `${percent}%`, `正在分析 Github 模块：${moduleName}`);
                } else if (event.message.includes('待翻译词条列表')) {
                  wizardRenderer.updateProgress('90%', '90%', '正在生成翻译对比报告...');
                }
              } else if (event.type === 'progress') {
                if (event.message.type === 'fetch') {
                  const p = Math.floor((event.message.current / event.message.total) * 40); 
                  wizardRenderer.updateProgress(`${p}%`, `${p}%`, `正在抓取页面: ${event.message.url} (${event.message.current}/${event.message.total})`);
                } else if (event.message.type === 'analyze') {
                  wizardRenderer.updateProgress('45%', '45%', '开始分析词典...');
                }
              } else if (event.type === 'error') {
                wizardRenderer.appendLog(`[错误] ${event.message}`);
              } else if (event.type === 'done') {
                wizardRenderer.updateProgress('100%', '100%', `采集与分析完成，状态码: ${event.code || 0}`);
              }
              
              wizardRenderer.saveCurrentState();

            } catch (e) {
              // ignore
            }
          }
        }
      }
    } catch (error) {
      wizardRenderer.appendLog(`\n[系统错误] ${error.message}`);
      wizardRenderer.updateProgress('100%', '失败', '执行失败');
      const progressBar = document.getElementById('progressBar');
      if (progressBar) progressBar.classList.add('is-error');
      wizardRenderer.saveCurrentState();
    } finally {
      runBtn.disabled = false;
      runBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  },

  async runCollection() {
    const rawInput = document.getElementById('rawInput');
    if (!rawInput) return;
    
    const data = rawInput.value.trim();
    if (!data) return wizardUtils.showToast('请先粘贴或输入数据！', 'error');
    
    try {
      const response = await fetch('/api/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });
      await this.handleStreamResponse(response, 'runBtn');
    } catch(e) {
      wizardUtils.showToast(`请求失败: ${e.message}`, 'error');
    }
  },

  async runBatchCollection() {
    const urlInput = document.getElementById('urlInput');
    if (!urlInput) return;

    const data = urlInput.value.trim();
    if (!data) return wizardUtils.showToast('请输入需要抓取的 URL！', 'error');
    
    const urls = data.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'));
    if (urls.length === 0) return wizardUtils.showToast('未找到有效的 http/https 链接！', 'error');

    try {
      const response = await fetch('/api/batch-collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls })
      });
      await this.handleStreamResponse(response, 'batchRunBtn');
    } catch(e) {
      wizardUtils.showToast(`批量采集请求失败: ${e.message}`, 'error');
    }
  }
};
