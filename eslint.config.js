/**
 * ESLint 配置文件
 * @file eslint.config.js
 * @description 项目代码规范配置
 * @note 格式化相关规则由 Prettier 处理，ESLint 专注于代码质量和逻辑问题
 */

import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
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
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        GM_info: 'readonly',
        GM_xmlhttpRequest: 'readonly',
        GM_setValue: 'readonly',
        GM_getValue: 'readonly',
        GM_addStyle: 'readonly',
        GM_registerMenuCommand: 'readonly',
        unsafeWindow: 'readonly',
      },
    },
    rules: {
      // ==================== 现有规则 ====================
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

      // ==================== 新增：安全性规则 ====================
      // 防止 XSS 和代码注入
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-script-url': 'error',
      'no-new-func': 'warn', // new Function() 可能用于动态代码执行

      // ==================== 新增：正确性规则 ====================
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

      // ==================== 新增：最佳实践规则 ====================
      'accessor-pairs': ['error', { getWithoutSet: false }], // 强制 getter/setter 成对出现
      'array-callback-return': 'error', // 数组方法的回调必须返回值
      'block-scoped-var': 'error', // 强制块作用域变量
      'class-methods-use-this': 'warn', // 类方法应该使用 this
      'consistent-return': 'error', // 函数应一致地返回值
      'default-case': 'warn', // switch 应有 default 分支
      'default-case-last': 'error', // default 应在最后
      'dot-notation': ['error', { allowKeywords: true }], // 优先使用点表示法
      'grouped-accessor-pairs': 'error', // 强制 get/set 成对且相邻
      'guard-for-in': 'error', // 防止 for-in 遍历原型链
      'max-classes-per-file': ['warn', 2], // 每个文件最多 2 个类
      'no-alert': 'warn', // 警告使用 alert/confirm/prompt（浏览器扩展可能例外）
      'no-bitwise': 'warn', // 警告使用位运算符（通常有更好的方式）
      'no-caller': 'error', // 不允许使用 arguments.caller/callee
      'no-constructor-return': 'error', // 构造函数不应返回值
      'no-div-regex': 'warn', // 警告看起来像除法的正则
      'no-dupe-args': 'error', // 不允许重复的参数
      'no-dupe-class-members': 'error', // 不允许重复的类成员
      'no-dupe-else-if': 'error', // 不允许重复的 if 条件
      'no-dupe-keys': 'error', // 不允许重复的对象键
      'no-duplicate-case': 'error', // 不允许重复的 case（已在上面）
      'no-else-return': 'error', // 在 if return 后不需要 else
      'no-empty-function': ['warn', { allow: ['arrowFunctions', 'functions', 'methods'] }], // 警告空函数
      // 'no-empty-static-class-name': 'error', // 不允许空的静态类 - 需要 eslint-plugin-tailwindcss 插件
      'no-eq-null': 'error', // 不允许 == null
      'no-eval': 'error', // 已在上面
      'no-extend-native': 'error', // 不允许扩展原生对象
      'no-extra-bind': 'error', // 不需要的 bind
      'no-extra-label': 'error', // 不需要的标签
      'no-fallthrough': 'error', // 不允许 switch case 贯穿
      'no-floating-decimal': 'error', // 不允许浮点数缺少前导或尾随数字
      'no-global-assign': 'error', // 不允许对全局变量赋值
      'no-implicit-coercion': 'warn', // 警告隐式类型转换
      'no-implicit-globals': 'warn', // 警告隐式全局变量
      'no-implied-eval': 'error', // 已在上面
      'no-invalid-this': 'warn', // 警告无效的 this
      'no-iterator': 'error', // 不允许 __iterator__
      'no-label-var': 'error', // 标签不应与变量名相同
      'no-labels': ['error', { allowLoop: false, allowSwitch: false }], // 不允许标签
      'no-lone-blocks': 'error', // 不允许不必要的块
      'no-loop-func': 'warn', // 警告循环中定义函数
      'no-magic-numbers': [
        'warn',
        {
          ignore: [
            0, 0.1, 0.2, 0.3, 0.5, 0.8, 1, -1, 2, 3, 4, 5, 10, 15, 16, 20, 25, 31, 50, 60, 100, 127,
            200, 300, 500, 1000, 2000, 3000, 5000, 3600, 86400, 2592000, 31536000, 30000,
          ],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreClassFieldInitialValues: true,
        },
      ], // 警告魔法数字（忽略常用数字）
      'no-multi-assign': 'warn', // 警告链式赋值
      'no-multi-str': 'error', // 不允许多行字符串
      'no-native-reassign': 'error', // 不允许重新分配原生对象
      'no-negated-condition': 'warn', // 警告否定的条件
      'no-nested-ternary': 'warn', // 警告嵌套的三元
      'no-new': 'warn', // 警告不使用返回值的 new
      'no-new-object': 'error', // 不允许 new Object()
      'no-new-require': 'error', // 不允许 new require
      'no-new-wrappers': 'error', // 不允许 new String/Number/Boolean
      'no-param-reassign': 'warn', // 警告重新赋值参数
      'no-promise-executor-return': 'error', // Promise executor 不应返回值
      'no-proto': 'error', // 不允许 __proto__
      'no-reduce': 'off', // 允许使用 reduce
      'no-return-assign': ['error', 'always'], // 不允许在 return 中赋值
      'no-return-await': 'error', // 已在上面
      'no-script-url': 'error', // 已在上面
      'no-self-compare': 'warn', // 警告自己与自己比较
      'no-sequences': 'error', // 不允许逗号操作符
      'no-throw-literal': 'error', // 已在上面
      'no-unmodified-loop-condition': 'warn', // 警告未修改的循环条件
      'no-unneeded-ternary': 'error', // 不需要的三元
      'no-unused-expressions': 'error', // 不允许未使用的表达式
      'no-unused-labels': 'error', // 已在上面
      'no-useless-call': 'error', // 不需要的 call/apply
      'no-useless-catch': 'error', // 不需要的 catch
      'no-useless-computed-key': 'error', // 不需要的计算键
      'no-useless-concat': 'error', // 不需要的字符串连接
      'no-useless-constructor': 'error', // 不需要的构造函数
      'no-useless-escape': 'error', // 不需要的转义
      'no-useless-rename': 'error', // 不需要的重命名
      'no-useless-return': 'error', // 不需要的 return
      'no-var': 'error', // 已在上面
      'no-void': 'error', // 不允许 void
      'no-warning-comments': [
        'warn',
        { terms: ['todo', 'fixme', 'xxx', 'hack'], location: 'start' },
      ], // 警告待办注释
      'no-with': 'error', // 已在上面
      'prefer-promise-reject-errors': 'error', // 已在上面
      radix: 'error', // parseInt 应提供基数
      'require-await': 'off', // 已在上面
      'require-unicode-regexp': 'off', // 不强制使用 Unicode 正则
      'vars-on-top': 'error', // 变量声明应放在顶部
      'wrap-iife': ['error', 'any'], // IIFE 应被包裹
      yoda: ['error', 'never'], // 不允许 Yoda 条件

      // ==================== 新增：代码质量规则 ====================
      'logical-assignment-operators': ['warn', 'always'], // 优先使用逻辑赋值
      'no-restricted-syntax': 'off', // 禁用：避免使用 for-in（已有 guard-for-in 规则）
      'guard-for-in': 'warn', // 降级为警告：for-in 应过滤原型链属性
      'consistent-return': 'warn', // 降级为警告：函数应一致地返回值
      'no-promise-executor-return': 'warn', // 降级为警告：Promise executor 不应返回值
      radix: 'warn', // 降级为警告：parseInt 应提供基数
    },
  },
  {
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
  {
    files: ['build.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
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
    files: ['build.js', 'utils/**/*.js'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    ignores: [
      'build/**',
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'docs/**',
      'eslint.config.js',
    ],
  },
];
