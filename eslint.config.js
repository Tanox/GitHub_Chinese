/**
 * ESLint 配置文件
 * @file eslint.config.js
 * @version 1.9.24
 * @description 项目代码规范配置；规则按类别拆分到 eslint/rules/ 下，此处仅做组装
 * @note 格式化相关规则由 Prettier 处理，ESLint 专注于代码质量和逻辑问题
 */

import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import { coreRules } from './eslint/rules/core.js';
import { bestPracticeRules } from './eslint/rules/bestPractices.js';
import { qualityRules } from './eslint/rules/quality.js';

/** 用户脚本管理器（Tampermonkey / Greasemonkey）注入的全局 API */
const userscriptGlobals = {
  GM_info: 'readonly',
  GM_xmlhttpRequest: 'readonly',
  GM_setValue: 'readonly',
  GM_getValue: 'readonly',
  GM_addStyle: 'readonly',
  GM_registerMenuCommand: 'readonly',
  unsafeWindow: 'readonly',
};

const scriptRules = { ...coreRules, ...bestPracticeRules, ...qualityRules };

export default [
  js.configs.recommended,
  {
    ignores: [
      'build/**',
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '.next/**',
      'docs/**',
      'prototype/**',
      'public/**',
      'eslint.config.js',
    ],
  },
  {
    // TypeScript/TSX：类型与未使用变量交由 tsc 处理，关闭易误报的 JS 规则
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-redeclare': 'off',
      'no-shadow': 'off',
      'no-dupe-class-members': 'off',
    },
  },
  {
    // 用户脚本源码与配置（ESM，运行于浏览器）
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        ...userscriptGlobals,
      },
    },
    rules: scriptRules,
  },
  {
    // 构建 / 校验 / 采集脚本与服务端入口（CommonJS 或 Node ESM）
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-undef': 'off',
    },
  },
  {
    // 测试文件
    files: ['**/*.test.js', '**/__tests__/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'max-lines-per-function': 'off',
    },
  },
];
