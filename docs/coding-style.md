# 代码风格规范

> 版本：**v1.12.1** ｜ 版本权威源：`src/version.js`

本文档定义了项目的代码风格规范，包括命名约定、代码格式、注释规范和最佳实践。

## 目录

- [1. 文件和目录命名规范](#1-文件和目录命名规范)
- [2. 变量和函数命名规范](#2-变量和函数命名规范)
- [3. 代码风格](#3-代码风格)
- [4. 注释规范](#4-注释规范)
- [5. 最佳实践](#5-最佳实践)

---

## 1. 文件和目录命名规范

### 1.1 目录命名

- 使用小写字母
- 使用 kebab-case（短横线分隔）命名
- 描述性名称，清晰表达用途

**示例**：
```
src/
├── dictionaries/
├── page-monitor/
└── translation-core/
```

### 1.2 文件命名

- 使用小写字母
- 使用 camelCase（驼峰命名）或 kebab-case
- 模块文件使用 index.js 作为入口
- 测试文件使用 .test.js 后缀

**示例**：
```
src/
├── config.js
├── main.js
├── utils.js
├── translation-core/
│   ├── index.js
│   ├── dictionaryManager.js
│   └── elementTranslator.js
└── __tests__/
    └── utils.test.js
```

---

## 2. 变量和函数命名规范

### 2.1 变量命名

- 使用 camelCase（小驼峰命名）
- 常量使用 UPPER_SNAKE_CASE（全大写+下划线）
- 布尔值使用 is/has/can 等前缀
- 私有变量以下划线 _ 开头（可选，用于标识）

**示例**：
```javascript
// 普通变量
const userName = 'test';
let currentIndex = 0;

// 常量
const CONFIG = { /* ... */ };
const MAX_RETRIES = 3;

// 布尔值
const isLoaded = true;
const hasError = false;
const canProceed = true;

// 私有变量（仅用于标识）
const _internalState = {};
```

### 2.2 函数命名

- 使用 camelCase（小驼峰命名）
- 使用动词开头（get, set, is, has, can, do, handle, init, etc.）
- 描述性名称，清晰表达功能

**示例**：
```javascript
// 获取数据
function getUserInfo() { /* ... */ }

// 设置数据
function setConfig(options) { /* ... */ }

// 检查状态
function isElementVisible(element) { /* ... */ }

// 处理事件
function handleClick(event) { /* ... */ }

// 初始化
function init() { /* ... */ }

// 工具函数
function debounce(func, delay) { /* ... */ }
```

### 2.3 类命名

- 使用 PascalCase（大驼峰命名）
- 使用名词或名词短语

**示例**：
```javascript
class ErrorHandler {
  /* ... */
}

class DictionaryManager {
  /* ... */
}
```

### 2.4 对象方法命名

- 使用 camelCase（小驼峰命名）
- 遵循与函数相同的命名规范

**示例**：
```javascript
export const translationCore = {
  init() { /* ... */ },
  translate() { /* ... */ },
  clearCache() { /* ... */ },
};
```

---

## 3. 代码风格

### 3.1 Prettier 配置

项目使用 Prettier 进行代码格式化，配置如下：

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "always",
  "printWidth": 100,
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": true
}
```

### 3.2 ESLint 配置

项目使用 ESLint 进行代码质量检查，主要规则：

- **缩进**：2 个空格
- **引号**：单引号
- **分号**：必须使用
- **尾随逗号**：多行结构必须使用
- **对象大括号间距**：必须有空格
- **数组括号间距**：不能有空格
- **函数括号前空格**：
  - 匿名函数：有空格
  - 命名函数：无空格
  - 箭头函数：有空格
- **严格相等**：必须使用 === 和 !==（null 除外）
- **禁止使用 var**：必须使用 let 或 const
- **优先使用 const**：不变的变量使用 const

**示例**：
```javascript
// ✅ 正确
const name = 'GitHub';
let count = 0;

if (name === 'GitHub') {
  count++;
}

function doSomething(param) {
  return param;
}

const arrowFn = (param) => {
  return param;
};

const obj = {
  key: 'value',
  anotherKey: 'anotherValue',
};

const arr = [1, 2, 3];

// ❌ 错误
var name = "GitHub";
let count = 0;

if (name == "GitHub") {
  count++
}

function doSomething (param) {
  return param;
}

const arrowFn = param => {
  return param;
};

const obj = {
  key: "value",
  anotherKey: "anotherValue"
};

const arr = [ 1, 2, 3 ];
```

### 3.3 代码结构

- **缩进**：2 个空格
- **行宽**：最大 100 字符
- **空行**：
  - 函数/方法之间留空行
  - 逻辑块之间留空行
  - 文件末尾留空行
- **大括号**：
  - 即使只有一行语句也要使用大括号
  - 大括号与条件/函数声明在同一行

**示例**：
```javascript
// ✅ 正确
function processData(data) {
  if (!data) {
    return null;
  }

  const result = transform(data);
  return result;
}

// ❌ 错误
function processData(data)
{
  if (!data)
    return null;

  const result = transform(data);
  return result;
}
```

---

## 4. 注释规范

### 4.1 文件头部注释

每个源代码文件必须包含文件头部注释，包含：

- 文件用途描述
- 文件名
- 版本号
- 日期
- 作者
- 详细描述

**示例**：
```javascript
/**
 * GitHub Chinese 简体中文主入口文件
 * @file main.js
 * @version 1.9.24
 * @date 2026-09-19
 * @author Sut
 * @description 整合所有模块并初始化脚本
 */
```

> 版本号须与 `src/version.js` 的 `VERSION` 一致。仅在文件**实际被改动**时同步其头注释版本号，
> 未改动文件保持原值，禁止全仓库批量刷写。

### 4.2 函数/方法注释

使用 JSDoc 风格注释，包含：

- 功能描述
- 参数说明（@param）
- 返回值说明（@returns）
- 异常说明（@throws，可选）

**示例**：
```javascript
/**
 * 节流函数，用于限制高频操作的执行频率
 * 支持返回Promise
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 * @param {Object} options - 配置选项
 * @param {boolean} options.leading - 是否在开始时执行（默认true）
 * @param {boolean} options.trailing - 是否在结束后执行（默认true）
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit, options = {}) {
  /* ... */
}
```

### 4.3 内联注释

- 使用 // 进行单行注释
- 注释应该解释「为什么」而不是「做什么」
- 复杂的逻辑需要添加注释
- 注释与代码之间留一个空格

**示例**：
```javascript
// ✅ 正确
// 检查是否需要跳过此元素（避免处理不可见元素）
if (element.classList && element.classList.contains('sr-only')) {
  return;
}

// ❌ 错误
// 检查 classList 是否存在
if (element.classList && element.classList.contains('sr-only')) {
  return;
}
```

### 4.4 TODO 注释

使用 TODO 标记待办事项，包含：

- TODO 关键字
- 作者（可选）
- 日期（可选）
- 待办事项描述

**示例**：
```javascript
// TODO: 优化这个算法，时间复杂度可以从 O(n²) 降到 O(n)
// TODO(Sut): 2026-06-08 添加更多错误处理
```

---

## 5. 最佳实践

### 5.1 错误处理

- 始终处理可能的错误
- 使用 try-catch 包裹可能抛出异常的代码
- 使用 ErrorHandler 统一处理错误
- 提供有意义的错误信息

**示例**：
```javascript
try {
  const result = riskyOperation();
  return result;
} catch (error) {
  ErrorHandler.handleError('操作描述', error, ErrorHandler.ERROR_TYPES.TYPE);
  return null;
}
```

### 5.2 异步编程

- 使用 async/await 代替 Promise 链式调用
- 始终处理 Promise 的 reject
- 使用 try-catch 包裹 await 调用

**示例**：
```javascript
// ✅ 正确
async function fetchData() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取数据失败:', error);
    throw error;
  }
}

// ❌ 错误
function fetchData() {
  return fetch(url)
    .then(response => response.json());
}
```

### 5.3 代码组织

- 一个文件一个主要功能/类
- 相关函数放在一起
- 按逻辑顺序排列函数
- 使用 ES6 模块导入导出

**示例**：
```javascript
// 导入
import { CONFIG } from './config.js';
import { utils } from './utils.js';

// 常量定义
const MAX_SIZE = 100;

// 工具函数
function helper() { /* ... */ }

// 主要功能
export function mainFunction() { /* ... */ }

// 导出
export { helper };
```

### 5.4 性能考虑

- 避免不必要的 DOM 操作
- 使用防抖（debounce）和节流（throttle）
- 使用缓存避免重复计算
- 使用 requestAnimationFrame 进行动画

**示例**：
```javascript
// 使用节流
const handleScroll = throttle(() => {
  /* 滚动处理逻辑 */
}, 100);

window.addEventListener('scroll', handleScroll);

// 使用缓存
const cache = new Map();

function getCachedData(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const data = expensiveComputation(key);
  cache.set(key, data);
  return data;
}
```

### 5.5 可访问性

- 检查参数有效性
- 提供默认值
- 使用可选链操作符（?.）
- 使用空值合并操作符（??）

**示例**：
```javascript
// 提供默认值
function doSomething(options = {}) {
  const timeout = options.timeout ?? 1000;
  const data = options.data ?? {};
  /* ... */
}

// 使用可选链
const value = obj?.nested?.property;

// 安全访问嵌套属性
function getNestedProperty(obj, path, defaultValue = null) {
  try {
    const pathArray = Array.isArray(path) ? path : path.split('.');
    let result = obj;
    for (const key of pathArray) {
      if (result === null || result === undefined) {
        return defaultValue;
      }
      result = result[key];
    }
    return result === undefined ? defaultValue : result;
  } catch (_error) {
    return defaultValue;
  }
}
```

### 5.6 函数长度

- 函数应该保持简洁
- 单个函数不超过 100 行（ESLint 警告）
- 超过 100 行的函数应该拆分为多个小函数

### 5.7 参数数量

- 函数参数不超过 4 个（ESLint 警告）
- 超过 4 个参数时使用对象参数

**示例**：
```javascript
// ✅ 正确
function createUser({ name, email, age, address, phone }) {
  /* ... */
}

createUser({
  name: 'Test',
  email: 'test@example.com',
  age: 25,
  address: '123 Main St',
  phone: '123-456-7890',
});

// ❌ 错误
function createUser(name, email, age, address, phone) {
  /* ... */
}
```

### 5.8 文件行数与模块拆分

- 单个**源代码文件**不超过 200 行，超出时按职责拆分（UI 组件 / hooks / 工具函数 / 类型 / 常量分别成文件）
- 拆分不得改变外部导出契约，公开 API 保持稳定
- 文档文件（`.md`）不适用该规则，必须保持完整与连贯
- 项目内既有拆分实践：`utils/string/*`、`utils/tools/*`、`translation-core/elementTranslator/*`、
  `translation-core/selectorUtils/*`、`page-monitor/domObserver/*`、`ui/configUI/*`、`ui/styles/configUI/*`、
  `scripts/build/*`、`public/css/*`

### 5.9 语义化 id

为主要容器与交互控件添加语义化 `id`（kebab-case，表达用途），便于调试、无障碍关联与测试定位：

```html
<div id="collector-workspace">
  <aside id="collector-rail">…</aside>
  <main id="collector-main">
    <textarea id="data-center-input"></textarea>
    <button id="data-center-run-btn">开始分析</button>
  </main>
</div>
```

反例：`div1`、`box`、`wrapper2` 等无意义命名。

### 5.10 TypeScript 约定（采集工作台）

- 禁止 `any`：使用 `unknown` + 类型收窄，或定义明确的接口
- 捕获异常统一走 `describeError(error: unknown): string`
- 服务端逻辑（`src/lib/*`）与客户端组件（`src/components/*`）分离，客户端组件需 `'use client'`
- 外部可选依赖若无类型，使用最小 `declare module` 声明（见 `src/types/puppeteer-core.d.ts`）

### 5.11 复杂度控制

- 圈复杂度不超过 20（与 ESLint 规则一致）
- 使用提前返回减少嵌套
- 使用映射代替多个 if-else

**示例**：
```javascript
// ✅ 正确：提前返回
function processValue(value) {
  if (!value) {
    return null;
  }
  if (typeof value !== 'string') {
    return null;
  }
  return value.trim();
}

// ✅ 正确：使用映射
const handlers = {
  'add': (a, b) => a + b,
  'subtract': (a, b) => a - b,
  'multiply': (a, b) => a * b,
  'divide': (a, b) => a / b,
};

function calculate(operation, a, b) {
  const handler = handlers[operation];
  if (!handler) {
    throw new Error(`Unknown operation: ${operation}`);
  }
  return handler(a, b);
}
```

---

## 工具使用

### 运行代码检查

```bash
# 运行 ESLint
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix

# 运行 Prettier 格式化
npm run format

# 检查代码格式
npm run format:check
```

### Git 钩子

项目使用 Husky 和 lint-staged 自动在提交前运行检查，确保代码符合规范。

---

## 相关文档

- [development.md](./development.md) - 开发指南
- [architecture.md](./architecture.md) - 架构文档
- [project.md](./project.md) - 项目规范
