/**
 * 配置界面启动引导模块
 * @file src/ui/configUI/bootstrap.js
 * @description 负责浮动入口按钮注入、用户脚本菜单注册与清理
 */

/** 浮动按钮元素 ID（语义化，便于脚本选取与测试定位） */
export const FLOATING_BUTTON_ID = 'github-i18n-floating-button';

const FLOATING_BUTTON_STYLE_ID = 'github-i18n-floating-button-style';

const FLOATING_BUTTON_STYLES = `
#${FLOATING_BUTTON_ID} {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid #2ea44f;
  background: #0d1117;
  color: #2ea44f;
  font-size: 20px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  z-index: 2147483646;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  transition: transform 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}
#${FLOATING_BUTTON_ID}:hover {
  transform: scale(1.08);
  background: #2ea44f;
  color: #ffffff;
}
#${FLOATING_BUTTON_ID}:focus-visible {
  outline: 2px solid #3fb950;
  outline-offset: 2px;
}
`;

export const configBootstrap = {
  /**
   * 注入浮动按钮所需样式（幂等）
   */
  injectStyles() {
    if (document.getElementById(FLOATING_BUTTON_STYLE_ID)) {
      return;
    }
    const style = document.createElement('style');
    style.id = FLOATING_BUTTON_STYLE_ID;
    style.textContent = FLOATING_BUTTON_STYLES;
    document.head.appendChild(style);
  },

  /**
   * 创建页面右下角浮动入口按钮
   * @param {Function} onClick - 点击回调
   * @returns {HTMLButtonElement} 按钮元素
   */
  createFloatingButton(onClick) {
    this.injectStyles();

    const existing = document.getElementById(FLOATING_BUTTON_ID);
    if (existing) {
      return existing;
    }

    const button = document.createElement('button');
    button.id = FLOATING_BUTTON_ID;
    button.type = 'button';
    button.title = '打开 GitHub 中文翻译设置';
    button.setAttribute('aria-label', '打开 GitHub 中文翻译设置');
    button.textContent = '中';
    button.addEventListener('click', onClick);

    document.body.appendChild(button);
    return button;
  },

  /**
   * 移除浮动入口按钮
   */
  removeFloatingButton() {
    const button = document.getElementById(FLOATING_BUTTON_ID);
    if (button && button.parentNode) {
      button.parentNode.removeChild(button);
    }
  },

  /**
   * 注册用户脚本管理器菜单命令（管理器不支持时静默跳过）
   * @param {{open: Function, translate: Function}} handlers - 菜单回调
   */
  registerMenuCommands(handlers) {
    if (typeof GM_registerMenuCommand !== 'function') {
      return;
    }

    try {
      GM_registerMenuCommand('打开配置面板', handlers.open);
      GM_registerMenuCommand('立即翻译页面', handlers.translate);
    } catch (_error) {
      // 菜单注册失败不影响主流程
    }
  },
};
