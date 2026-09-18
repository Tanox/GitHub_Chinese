/**
 * 配置界面组件样式
 * @file src/ui/styles/configUI/components.js
 */

export const componentStyles = `
    /* ========== 面板内容区 ========== */
    .github-i18n-config-content {
      padding: 24px;
      max-height: calc(80vh - 120px);
      overflow-y: auto;
      display: grid;
      gap: 20px;
    }

    /* 滚动条样式 */
    .github-i18n-config-content::-webkit-scrollbar {
      width: 8px;
    }
    .github-i18n-config-content::-webkit-scrollbar-track {
      background: #010409;
    }
    .github-i18n-config-content::-webkit-scrollbar-thumb {
      background: #30363d;
      border-radius: 4px;
    }
    .github-i18n-config-content::-webkit-scrollbar-thumb:hover {
      background: #484f58;
    }

    /* ========== 配置分组 ========== */
    .github-i18n-config-section {
      background-color: #0d1117;
      border: 1px solid #21262d;
      border-radius: 8px;
      padding: 16px;
    }

    .github-i18n-config-section h4 {
      margin: 0 0 12px 0;
      font-size: 15px;
      font-weight: 600;
      color: #e6edf3;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* ========== 配置项行 ========== */
    .github-i18n-config-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px dashed #21262d;
    }

    .github-i18n-config-item:last-child {
      border-bottom: none;
    }

    .github-i18n-config-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 14px;
      color: #e6edf3;
      gap: 8px;
      flex: 1;
    }

    .github-i18n-config-label input[type="checkbox"] {
      margin: 0;
      accent-color: #2ea44f;
      width: 16px;
      height: 16px;
    }

    /* ========== 配置项提示文字 ========== */
    .github-i18n-config-hint {
      font-size: 12px;
      color: #6e7681;
      margin-top: 2px;
    }

    /* ========== 性能监控网格 ========== */
    .github-i18n-perf-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 8px;
    }

    .github-i18n-perf-stat {
      background-color: #010409;
      border: 1px solid #21262d;
      border-radius: 6px;
      padding: 8px 10px;
      text-align: left;
    }

    .github-i18n-perf-stat .k {
      font-family: "JetBrains Mono", "SF Mono", SFMono-Regular, Menlo, Consolas,
        "Courier New", monospace;
      font-size: 11px;
      color: #6e7681;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .github-i18n-perf-stat .v {
      font-size: 20px;
      font-weight: 600;
      color: #3fb950;
      margin-top: 4px;
    }

    /* ========== 高级统计区 ========== */
    .github-i18n-advanced-stats {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed #21262d;
    }

    /* ========== 操作按钮区 ========== */
    .github-i18n-config-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed #21262d;
    }
`;
