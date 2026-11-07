/**
 * 构建编号生成（应用与构建配置共用的唯一实现）
 * @file src/lib/build-id.js
 * @version 1.13.28
 * @description 生成 yymmddhhmm（10 位：两位年+月+日+时+分，如 2611051259）格式的本地构建编号。
 *   next.config.mjs 在 dev/build 启动时注入 NEXT_PUBLIC_BUILD_ID；应用页脚在注入缺失时按同一
 *   规则即时生成，保证展示格式恒定。纯函数、无 Node 运行时依赖，可被 Next 配置直接导入。
 */

/** 环境变量名（构建时注入） */
export const BUILD_ID_ENV_KEY = 'NEXT_PUBLIC_BUILD_ID';

/**
 * 生成本地构建编号 yymmddhhmm（10 位）
 * @param {Date} [date] - 构建时刻，缺省取当前时间
 * @returns {string} 形如 2611051259 的 10 位数字串
 */
export function createBuildId(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return [
    pad(date.getFullYear() % 100),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
  ].join('');
}
