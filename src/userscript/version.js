/**
 * 版本信息模块
 * @file version.js
 * @version 1.13.18
 * @date 2026-10-04
 * @author Sut
 * @description 统一管理 GitHub Chinese 简体中文的版本信息
 */

/**
 * 当前工具版本号
 * @type {string}
 * @description 这是项目的单一版本源，所有其他版本号引用都应从此处获取
 */
export const VERSION = '1.13.18';

/**
 * 当前构建 / 发版日期（YYYY-MM-DD）
 * @type {string}
 * @description 页脚「更新时间」单一来源；与 VERSION 同步，避免硬编码漂移。
 */
export const BUILD_DATE = '2026-10-04';
