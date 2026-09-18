/**
 * 更新通知模块
 * @file updateNotification.js
 */
import { CONFIG } from './config.js';
import { updateStore } from './updateNotification/store.js';
import { updateRenderer } from './updateNotification/renderer.js';

const NOTIFICATION_AUTO_HIDE_MS = 20000;
const NOTIFICATION_ANIMATION_MS = 300;

/**
 * 显示更新通知
 * @param {string} newVersion - 新版本号
 */
function showUpdateNotification(newVersion) {
  const lastNotifiedVersion = updateStore.getLastNotifiedVersion();

  if (updateStore.isDismissed() || lastNotifiedVersion === newVersion) {
    if (CONFIG.debugMode && lastNotifiedVersion === newVersion) {
      console.log(`[GitHub 中文翻译] 已经通知过版本 ${newVersion} 的更新`);
    }
    return;
  }

  try {
    const notification = updateRenderer.createNotification(newVersion, hideNotification);

    if (document.body) {
      document.body.appendChild(notification);
      updateStore.setLastNotifiedVersion(newVersion);

      if (CONFIG.updateCheck.autoHideNotification !== false) {
        setTimeout(() => {
          hideNotification(notification, false);
        }, NOTIFICATION_AUTO_HIDE_MS);
      }

      if (CONFIG.debugMode) {
        console.log(`[GitHub 中文翻译] 显示更新通知: 版本 ${newVersion}`);
      }
    }
  } catch (error) {
    console.error('[GitHub 中文翻译] 创建更新通知失败:', error);
  }
}

/**
 * 隐藏通知元素（带动画效果）
 * @param {HTMLElement} notification - 通知元素
 * @param {boolean} permanently - 是否永久隐藏
 */
function hideNotification(notification, permanently = false) {
  try {
    notification.style.transform = 'translateY(20px)';
    notification.style.opacity = '0';

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, NOTIFICATION_ANIMATION_MS);

    if (permanently) {
      updateStore.setDismissed();
      if (CONFIG.debugMode) {
        console.log('[GitHub 中文翻译] 更新通知已永久隐藏');
      }
    }
  } catch (error) {
    console.error('[GitHub 中文翻译] 隐藏通知失败:', error);
  }
}

/**
 * 记录版本历史
 * @param {string} version - 版本号
 */
function recordVersionHistory(version) {
  updateStore.recordVersionHistory(version);
}

/**
 * 清除更新通知的忽略状态
 * @returns {boolean} 是否成功
 */
function clearNotificationDismissal() {
  return updateStore.clearNotificationDismissal();
}

export {
  showUpdateNotification,
  hideNotification,
  recordVersionHistory,
  clearNotificationDismissal,
};
