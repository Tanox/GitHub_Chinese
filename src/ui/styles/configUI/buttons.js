/**
 * 配置界面按钮样式
 * @file src/ui/styles/configUI/buttons.js
 */

export const buttonStyles = `
    .github-i18n-config-footer button {
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.12s cubic-bezier(0.22, 1, 0.36, 1);
      font-family: inherit;
    }

    .github-i18n-config-reset {
      background-color: transparent;
      color: #8b949e;
      border-color: transparent;
    }

    .github-i18n-config-reset:hover {
      background-color: #21262d;
      color: #e6edf3;
    }

    .github-i18n-config-cancel {
      background-color: transparent;
      color: #8b949e;
      border-color: transparent;
    }

    .github-i18n-config-cancel:hover {
      background-color: #21262d;
      color: #e6edf3;
    }

    .github-i18n-config-save {
      background-color: #2ea44f;
      color: #ffffff;
      border-color: rgba(240, 246, 252, 0.1);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 1px 2px rgba(0, 0, 0, 0.25);
    }

    .github-i18n-config-save:hover {
      background-color: #2c974b;
    }

    .github-i18n-config-save:active {
      background-color: #298e46;
      transform: translateY(1px);
    }

    /* ========== 浮动设置按钮 ========== */
    .github-i18n-toggle-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background-color: #2ea44f !important;
      color: #ffffff !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      border-radius: 50% !important;
      width: 56px !important;
      height: 56px !important;
      font-size: 22px !important;
      cursor: pointer !important;
      box-shadow: 0 6px 18px rgba(46, 160, 67, 0.22), 0 2px 6px rgba(0, 0, 0, 0.35) !important;
      z-index: 2147483000 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 0.2s cubic-bezier(0.22, 1, 0.36, 1) !important;
      opacity: 1 !important;
      visibility: visible !important;
      pointer-events: auto !important;
    }

    .github-i18n-toggle-btn:hover {
      background-color: #2c974b !important;
      transform: translateY(-2px) scale(1.05) !important;
      box-shadow: 0 10px 28px rgba(46, 160, 67, 0.3),
        0 4px 12px rgba(0, 0, 0, 0.35) !important;
    }

    .github-i18n-toggle-btn:active {
      transform: translateY(1px) scale(0.98) !important;
    }

    .github-i18n-config-actions button {
      flex: 1;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid #30363d;
      background-color: #161b22;
      color: #e6edf3;
      transition: all 0.12s cubic-bezier(0.22, 1, 0.36, 1);
      font-family: inherit;
    }

    .github-i18n-config-actions button:hover {
      background-color: #21262d;
      border-color: #484f58;
    }
`;
