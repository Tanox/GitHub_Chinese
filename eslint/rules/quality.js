/**
 * ESLint 代码质量规则（置于最后，用于覆盖前述规则的严重级别）
 * @file eslint/rules/quality.js
 */

export const qualityRules = {
  // ==================== 代码质量规则 ====================
  'logical-assignment-operators': ['warn', 'always'], // 优先使用逻辑赋值
  'no-restricted-syntax': 'off', // 禁用：避免使用 for-in（已有 guard-for-in 规则）
  'guard-for-in': 'warn', // 降级为警告：for-in 应过滤原型链属性
  'consistent-return': 'warn', // 降级为警告：函数应一致地返回值
  'no-promise-executor-return': 'warn', // 降级为警告：Promise executor 不应返回值
  radix: 'warn', // 降级为警告：parseInt 应提供基数
};
