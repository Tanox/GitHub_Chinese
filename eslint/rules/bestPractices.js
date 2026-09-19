/**
 * ESLint 最佳实践规则
 * @file eslint/rules/bestPractices.js
 */

export const bestPracticeRules = {
  // ==================== 最佳实践规则 ====================
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
  'no-else-return': 'error', // 在 if return 后不需要 else
  'no-empty-function': ['warn', { allow: ['arrowFunctions', 'functions', 'methods'] }], // 警告空函数
  'no-eq-null': 'error', // 不允许 == null
  'no-extend-native': 'error', // 不允许扩展原生对象
  'no-extra-bind': 'error', // 不需要的 bind
  'no-extra-label': 'error', // 不需要的标签
  'no-fallthrough': 'error', // 不允许 switch case 贯穿
  'no-floating-decimal': 'error', // 不允许浮点数缺少前导或尾随数字
  'no-global-assign': 'error', // 不允许对全局变量赋值
  'no-implicit-coercion': 'warn', // 警告隐式类型转换
  'no-implicit-globals': 'warn', // 警告隐式全局变量
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
  'no-self-compare': 'warn', // 警告自己与自己比较
  'no-sequences': 'error', // 不允许逗号操作符
  'no-unmodified-loop-condition': 'warn', // 警告未修改的循环条件
  'no-unneeded-ternary': 'error', // 不需要的三元
  'no-unused-expressions': 'error', // 不允许未使用的表达式
  'no-useless-call': 'error', // 不需要的 call/apply
  'no-useless-catch': 'error', // 不需要的 catch
  'no-useless-computed-key': 'error', // 不需要的计算键
  'no-useless-concat': 'error', // 不需要的字符串连接
  'no-useless-constructor': 'error', // 不需要的构造函数
  'no-useless-escape': 'error', // 不需要的转义
  'no-useless-rename': 'error', // 不需要的重命名
  'no-useless-return': 'error', // 不需要的 return
  'no-void': 'error', // 不允许 void
  'no-warning-comments': ['warn', { terms: ['todo', 'fixme', 'xxx', 'hack'], location: 'start' }], // 警告待办注释
  radix: 'error', // parseInt 应提供基数
  'require-unicode-regexp': 'off', // 不强制使用 Unicode 正则
  'vars-on-top': 'error', // 变量声明应放在顶部
  'wrap-iife': ['error', 'any'], // IIFE 应被包裹
  yoda: ['error', 'never'], // 不允许 Yoda 条件
};
