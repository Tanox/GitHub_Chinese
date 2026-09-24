/**
 * 配置界面渲染模块
 * @file src/ui/configUI/renderer.js
 */
import { VERSION } from '../../version.js';
import { createPerformanceMonitoringSection } from '../components/performanceMonitor.js';

export const configRenderer = {
  createHeader() {
    const header = document.createElement('div');
    header.className = 'github-i18n-config-header';

    const title = document.createElement('h3');
    title.textContent = 'GitHub 中文翻译';

    const versionBadge = document.createElement('span');
    versionBadge.style.fontFamily =
      '"JetBrains Mono", "SF Mono", SFMono-Regular, Menlo, Consolas, "Courier New", monospace';
    versionBadge.style.fontSize = '11px';
    versionBadge.style.color = '#6e7681';
    versionBadge.style.padding = '2px 8px';
    versionBadge.style.borderRadius = '4px';
    versionBadge.style.background = '#010409';
    versionBadge.style.border = '1px solid #21262d';
    versionBadge.textContent = `v${VERSION}`;

    const headerLeft = document.createElement('div');
    headerLeft.style.display = 'flex';
    headerLeft.style.alignItems = 'center';
    headerLeft.style.gap = '10px';
    headerLeft.appendChild(title);
    headerLeft.appendChild(versionBadge);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'github-i18n-config-close';
    closeBtn.textContent = '×';

    header.appendChild(headerLeft);
    header.appendChild(closeBtn);

    return header;
  },

  createFooter() {
    const footer = document.createElement('div');
    footer.className = 'github-i18n-config-footer';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'github-i18n-config-reset';
    resetBtn.textContent = '重置默认';

    const footerRight = document.createElement('div');
    footerRight.className = 'github-i18n-config-footer-right';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'github-i18n-config-cancel';
    cancelBtn.textContent = '取消';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'github-i18n-config-save';
    saveBtn.textContent = '保存配置';

    footerRight.appendChild(cancelBtn);
    footerRight.appendChild(saveBtn);

    footer.appendChild(resetBtn);
    footer.appendChild(footerRight);

    return footer;
  },

  createConfigSection(title, items) {
    const section = document.createElement('div');
    section.className = 'github-i18n-config-section';

    const sectionTitle = document.createElement('h4');
    sectionTitle.textContent = title;
    section.appendChild(sectionTitle);

    items.forEach((item) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'github-i18n-config-item';

      const label = document.createElement('label');
      label.className = 'github-i18n-config-label';

      const input = document.createElement('input');
      input.type = item.type;
      input.id = item.id;
      if (item.checked !== undefined) {
        input.checked = item.checked;
      }

      const textNode = document.createTextNode(item.label);

      label.appendChild(input);
      label.appendChild(textNode);
      itemDiv.appendChild(label);
      section.appendChild(itemDiv);
    });

    return section;
  },

  createContent(config) {
    const content = document.createElement('div');
    content.className = 'github-i18n-config-content';

    const basicSection = this.createConfigSection('基本设置', [
      {
        type: 'checkbox',
        id: 'github-i18n-debug-mode',
        label: '启用调试模式',
        checked: config.debugMode,
      },
      {
        type: 'checkbox',
        id: 'github-i18n-enable-partial-match',
        label: '启用部分匹配',
        checked: config.performance.enablePartialMatch,
      },
    ]);

    const updateSection = this.createConfigSection('更新设置', [
      {
        type: 'checkbox',
        id: 'github-i18n-auto-update',
        label: '自动检查更新',
        checked: config.updateCheck.enabled,
      },
    ]);

    const performanceSection = this.createConfigSection('性能设置', [
      {
        type: 'checkbox',
        id: 'github-i18n-translation-cache',
        label: '启用翻译缓存',
        checked: config.performance.enableTranslationCache,
      },
      {
        type: 'checkbox',
        id: 'github-i18n-virtual-dom',
        label: '启用虚拟DOM优化',
        checked: config.performance.enableVirtualDom,
      },
    ]);

    const monitoringSection = createPerformanceMonitoringSection();

    content.appendChild(basicSection);
    content.appendChild(updateSection);
    content.appendChild(performanceSection);
    content.appendChild(monitoringSection);

    return content;
  },
};
