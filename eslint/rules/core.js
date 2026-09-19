/**
 * ESLint 核心规则（基础 / 格式化禁用 / 安全性 / 正确性）
 * @file eslint/rules/core.js
 */

export const coreRules = {
  // ==================== 基础规则 ====================
  'no-unused-vars': [
    'warn',
    {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    },
  ],
  'no-console': ['warn', { allow: ['error', 'warn', 'log'] }],
  'no-debugger': 'error',
  'no-var': 'error',
  'prefer-const': 'error',

  // 禁用与 Prettier 冲突的格式化规则
  indent: 'off',
  quotes: 'off',
  semi: 'off',
  'comma-dangle': 'off',
  'object-curly-spacing': 'off',
  'array-bracket-spacing': 'off',
  'space-before-function-paren': 'off',
  'keyword-spacing': 'off',
  'space-infix-ops': 'off',
  'eol-last': 'off',
  'no-trailing-spaces': 'off',

  eqeqeq: ['error', 'always', { null: 'ignore' }],
  curly: ['error', 'multi-line'],
  'no-throw-literal': 'error',
  'prefer-promise-reject-errors': 'error',
  'no-return-await': 'error',
  'require-await': 'off',

  'max-lines-per-function': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],
  'max-params': ['warn', 5],
  complexity: ['warn', 30],

  'no-prototype-builtins': 'error',
  'no-control-regex': 'error',

  // ==================== 安全性规则 ====================
  // 防止 XSS 和代码注入
  'no-eval': 'error',
  'no-implied-eval': 'error',
  'no-script-url': 'error',
  'no-new-func': 'warn', // new Function() 可能用于动态代码执行

  // ==================== 正确性规则 ====================
  // 防止常见错误
  'no-async-promise-executor': 'error', // new Promise(async () => {}) 通常是错误的
  'no-case-declarations': 'error', // case 块中不允许声明词法变量
  'no-compare-neg-zero': 'error', // 不允许与 -0 比较
  'no-cond-assign': ['error', 'always'], // 不允许在条件中意外赋值
  'no-constant-condition': ['error', { checkLoops: true }], // 检测常量条件
  'no-duplicate-case': 'error', // 不允许重复的 case 标签
  'no-empty': ['error', { allowEmptyCatch: true }], // 不允许空块，但允许空的 catch
  'no-empty-character-class': 'error', // 不允许空的正则字符类
  'no-ex-assign': 'error', // 不允许重新分配异常变量
  'no-extra-boolean-cast': 'error', // 不需要的布尔转换
  'no-func-assign': 'error', // 不允许对函数声明重新赋值
  'no-import-assign': 'error', // 不允许对导入赋值
  'no-inner-declarations': ['error', 'both'], // 不允许嵌套块中的声明
  'no-invalid-regexp': 'error', // 不允许无效的正则表达式
  'no-irregular-whitespace': 'error', // 不允许不规则的空白
  'no-loss-of-precision': 'error', // 检测精度损失
  'no-misleading-character-class': 'error', // 检测误导性的字符类
  'no-new-symbol': 'error', // 不允许 new Symbol()
  'no-obj-calls': 'error', // 不允许将全局对象作为函数调用
  'no-octal': 'error', // 不允许八进制字面量
  'no-redeclare': ['error', { builtinGlobals: false }], // 不允许重复声明
  'no-regex-spaces': 'error', // 不允许正则中的多个空格
  'no-self-assign': 'error', // 不允许自我赋值
  'no-setter-return': 'error', // setter 不应返回值
  'no-sparse-arrays': 'error', // 不允许稀疏数组
  'no-this-before-super': 'error', // 不允许在 super() 前使用 this
  'no-undef': 'error', // 不允许使用未声明的变量
  'no-unreachable': 'error', // 不允许无法到达的代码
  'no-unsafe-finally': 'error', // 不允许在 finally 中使用控制流语句
  'no-unsafe-negation': 'error', // 不允许不安全的逻辑取反
  'no-unused-labels': 'error', // 不允许未使用的标签
  'no-useless-backreference': 'error', // 检测无用的反向引用
  'no-with': 'error', // 不允许使用 with 语句
};
