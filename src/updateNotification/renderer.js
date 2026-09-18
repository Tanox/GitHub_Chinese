/**
 * 更新通知渲染模块
 * @file src/updateNotification/renderer.js
 */
import { CONFIG } from '../config.js';

export const updateRenderer = {
  createNotification(newVersion, onHide) {
    const notification = document.createElement('div');
    notification.className =
      'fixed bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg z-50 max-w-md transform transition-all duration-300 translate-y-0 opacity-100';

    const notificationId = `github-zh-update-${Date.now()}`;
    notification.id = notificationId;

    const flexContainer = document.createElement('div');
    flexContainer.className = 'flex items-start';
    notification.appendChild(flexContainer);

    const iconContainer = document.createElement('div');
    iconContainer.className = 'flex-shrink-0 bg-blue-100 rounded-full p-2';
    flexContainer.appendChild(iconContainer);

    const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgIcon.setAttribute('class', 'h-6 w-6 text-blue-600');
    svgIcon.setAttribute('fill', 'none');
    svgIcon.setAttribute('viewBox', '0 0 24 24');
    svgIcon.setAttribute('stroke', 'currentColor');
    iconContainer.appendChild(svgIcon);

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElement.setAttribute('stroke-linecap', 'round');
    pathElement.setAttribute('stroke-linejoin', 'round');
    pathElement.setAttribute('stroke-width', '2');
    pathElement.setAttribute(
      'd',
      'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    );
    svgIcon.appendChild(pathElement);

    const contentContainer = document.createElement('div');
    contentContainer.className = 'ml-3 flex-1';
    flexContainer.appendChild(contentContainer);

    const titleElement = document.createElement('p');
    titleElement.className = 'text-sm font-medium text-blue-800';
    titleElement.textContent = 'GitHub 中文翻译脚本更新';
    contentContainer.appendChild(titleElement);

    const messageElement = document.createElement('p');
    messageElement.className = 'text-sm text-blue-700 mt-1';
    messageElement.textContent = `发现新版本 ${newVersion}，建议更新以获得更好的翻译体验。`;
    contentContainer.appendChild(messageElement);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'mt-3 flex space-x-2';
    contentContainer.appendChild(buttonsContainer);

    const updateButton = document.createElement('a');
    updateButton.id = `${notificationId}-update-btn`;
    updateButton.href = CONFIG.updateCheck.scriptUrl || '#';
    updateButton.target = '_blank';
    updateButton.rel = 'noopener noreferrer';
    updateButton.className =
      'inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors';
    updateButton.textContent = '立即更新';
    buttonsContainer.appendChild(updateButton);

    const laterButton = document.createElement('button');
    laterButton.id = `${notificationId}-later-btn`;
    laterButton.className =
      'inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-transparent hover:bg-blue-50 transition-colors';
    laterButton.textContent = '稍后';
    laterButton.addEventListener('click', () => {
      onHide(notification, false);
    });
    buttonsContainer.appendChild(laterButton);

    const dismissButton = document.createElement('button');
    dismissButton.id = `${notificationId}-dismiss-btn`;
    dismissButton.className =
      'inline-flex items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors';
    dismissButton.textContent = '不再提醒';
    dismissButton.addEventListener('click', () => {
      onHide(notification, true);
    });
    buttonsContainer.appendChild(dismissButton);

    return notification;
  }
};
