/**
 * GitHub 中文翻译配置界面模块
 * @file configUI.js
 */

import { CONFIG } from '../config.js';
import { addConfigUIStyles } from './styles/configUI.styles.js';
import {
  updatePerformanceStats,
  exportPerformanceStats,
} from './components/performanceMonitor.js';
import { configStore } from './configUI/store.js';
import { configRenderer } from './configUI/renderer.js';

class ConfigUI {
  constructor() {
    this.config = CONFIG;
    this.userConfig = {};
    this.isOpen = false;
    this.container = null;
    this.settings = configStore.loadUserSettings();
    this.isPageUnloading = false;
    this.eventListeners = [];

    this.setupPageUnloadHandler();
  }

  setupPageUnloadHandler() {
    const handlePageUnload = () => {
      this.isPageUnloading = true;
      this.cleanup();
    };

    window.addEventListener('beforeunload', handlePageUnload, { once: true });
    window.addEventListener('unload', handlePageUnload, { once: true });
  }

  cleanup() {
    this.hide();
    this.cleanupEventListeners();
    this.container = null;
  }

  saveUserSettings(settings) {
    configStore.saveUserSettings(settings);
    this.userConfig = { ...settings };
    this.mergeUserConfig();
  }

  mergeUserConfig() {
    configStore.mergeUserConfig(CONFIG, this.userConfig);
  }

  createUI() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.className = 'github-i18n-config-container';

    const configPanel = document.createElement('div');
    configPanel.className = 'github-i18n-config-panel';

    const header = configRenderer.createHeader();
    const content = configRenderer.createContent(this.config);
    const footer = configRenderer.createFooter();

    configPanel.appendChild(header);
    configPanel.appendChild(content);
    configPanel.appendChild(footer);

    this.container.appendChild(configPanel);

    addConfigUIStyles();
    this.addEventListeners();
  }

  show() {
    if (!this.container) {
      this.createUI();
    }

    document.body.appendChild(this.container);
    this.isOpen = true;

    setTimeout(() => {
      updatePerformanceStats();
    }, 100);
  }

  hide() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.isOpen = false;
  }

  toggle() {
    if (this.isOpen) {
      this.hide();
    } else {
      this.show();
    }
  }

  addEventListeners() {
    if (!this.container) return;

    const closeBtn = this.container.querySelector('.github-i18n-config-close');
    const saveBtn = this.container.querySelector('.github-i18n-config-save');
    const resetBtn = this.container.querySelector('.github-i18n-config-reset');
    const cancelBtn = this.container.querySelector('.github-i18n-config-cancel');
    const refreshBtn = this.container.querySelector('#github-i18n-refresh-stats');
    const exportBtn = this.container.querySelector('#github-i18n-export-stats');

    const handleClose = () => this.hide();
    const handleSave = () => this.handleSave();
    const handleReset = () => this.handleReset();
    const handleRefresh = () => updatePerformanceStats();
    const handleExport = () => exportPerformanceStats();
    const handleContainerClick = (e) => {
      if (e.target === this.container) {
        this.hide();
      }
    };

    closeBtn?.addEventListener('click', handleClose);
    saveBtn?.addEventListener('click', handleSave);
    resetBtn?.addEventListener('click', handleReset);
    cancelBtn?.addEventListener('click', handleClose);
    refreshBtn?.addEventListener('click', handleRefresh);
    exportBtn?.addEventListener('click', handleExport);
    this.container?.addEventListener('click', handleContainerClick);

    this.eventListeners.push(
      { element: closeBtn, event: 'click', handler: handleClose },
      { element: saveBtn, event: 'click', handler: handleSave },
      { element: resetBtn, event: 'click', handler: handleReset },
      { element: cancelBtn, event: 'click', handler: handleClose },
      { element: refreshBtn, event: 'click', handler: handleRefresh },
      { element: exportBtn, event: 'click', handler: handleExport },
      { element: this.container, event: 'click', handler: handleContainerClick },
    );
  }

  cleanupEventListeners() {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element?.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }

  handleSave() {
    const newSettings = {
      debugMode: document.getElementById('github-i18n-debug-mode')?.checked || false,
      enablePartialMatch:
        document.getElementById('github-i18n-enable-partial-match')?.checked || false,
      autoUpdate: document.getElementById('github-i18n-auto-update')?.checked || false,
      enableTranslationCache:
        document.getElementById('github-i18n-translation-cache')?.checked || false,
      enableVirtualDom: document.getElementById('github-i18n-virtual-dom')?.checked || false,
    };

    this.saveUserSettings(newSettings);
    this.hide();
  }

  handleReset() {
    configStore.resetUserSettings();
    this.userConfig = {};
    this.settings = {};
    this.hide();
  }
}

export { ConfigUI };
