/**
 * 语言变更观察者管理
 * @file src/i18n/observers.js
 */

/**
 * 注册观察者
 * @param {Function[]} list - 观察者列表
 * @param {Function} observer - 观察者函数
 */
export function addObserver(list, observer) {
  if (typeof observer === 'function') {
    list.push(observer);
  }
}

/**
 * 注销观察者
 * @param {Function[]} list - 观察者列表
 * @param {Function} observer - 观察者函数
 */
export function removeObserver(list, observer) {
  const index = list.indexOf(observer);
  if (index !== -1) {
    list.splice(index, 1);
  }
}

/**
 * 通知全部观察者（单个观察者异常不影响其余观察者）
 * @param {Function[]} list - 观察者列表
 * @param {string} newLocale - 新语言
 * @param {string} oldLocale - 旧语言
 */
export function notifyObservers(list, newLocale, oldLocale) {
  list.forEach((observer) => {
    try {
      observer(newLocale, oldLocale);
    } catch (error) {
      console.error('观察者执行错误:', error);
    }
  });
}
