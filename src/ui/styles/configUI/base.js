/**
 * 配置界面基础布局样式
 * @file src/ui/styles/configUI/base.js
 */

export const baseStyles = `
    /* ========== 配置面板容器 ========== */
    .github-i18n-config-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.55);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2147483200;
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC",
        "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial,
        sans-serif;
    }

    /* ========== 配置面板主体 ========== */
    .github-i18n-config-panel {
      background-color: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      width: 560px;
      max-width: 90%;
      max-height: 80vh;
      overflow: hidden;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
    }

    /* ========== 面板头部 ========== */
    .github-i18n-config-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background-color: #0d1117;
      border-bottom: 1px solid #21262d;
    }

    .github-i18n-config-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #e6edf3;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .github-i18n-config-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #8b949e;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.12s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .github-i18n-config-close:hover {
      background-color: #21262d;
      color: #e6edf3;
    }

    /* ========== 面板底部 ========== */
    .github-i18n-config-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      background-color: #0d1117;
      border-top: 1px solid #21262d;
    }

    .github-i18n-config-footer .github-i18n-config-footer-right {
      display: flex;
      gap: 8px;
    }
`;
