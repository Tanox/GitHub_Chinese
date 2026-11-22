# 代码审查标准 (Code Review Standards)

> 版本：**v1.13.35** ｜ 版本权威源：`src/userscript/version.js`

本文是**审查判定语义的唯一权威**（问题优先级、检查清单、项目特定规范、审查意见示例）。流程 / 角色 / SLA / 指标见 [PROCESS.md](./PROCESS.md)，快速清单见 [CHECKLIST.md](./CHECKLIST.md)；编码规范本身以 [coding-style.md](../coding-style.md) 为准，本文不复制其正文。

## 目录

1. [概述](#概述)
2. [审查原则](#审查原则)
3. [问题优先级定义](#问题优先级定义)
4. [详细检查清单](#详细检查清单)
5. [项目特定规范](#项目特定规范)
6. [审查意见示例](#审查意见示例)
7. [职责划分](#职责划分)

---

## 概述

代码审查的目标：

- 提高代码质量 — 及早发现缺陷与设计问题
- 知识共享 — 团队成员了解不同模块的改动
- 保持一致性 — 统一的代码风格与架构决策
- 降低维护成本 — 可读性好的代码更容易维护
- 团队成长 — 通过审查互相学习最佳实践

适用范围：所有提交到 `main` 分支的 PR（新功能、Bug 修复、重构、性能优化、代码相关文档更新）。

---

## 审查原则

1. **建设性而非批判性** — 针对代码而非作者；示例：不说「这代码写得什么鬼」，而说「这个函数逻辑较复杂，建议拆分为单一职责的小函数」。
2. **解释「为什么」** — 只说「这里要改」不合格；应说明风险与理由（如「直接 innerHTML 存在 XSS 风险，建议 textContent 或转义」）。
3. **区分必须修改与建议改进** — 使用下文定义的三级优先级标记。
4. **认可好的代码** — 只指出问题不表扬，会打击协作积极性；好的实践值得明确肯定。
5. **及时响应** — SLA 见 [PROCESS.md](./PROCESS.md)「角色与职责」（作者 24 小时内回应意见；审查者首次回应 1 个工作日、完成 2 个工作日、紧急 4 小时）。

---

## 问题优先级定义

### 🔴 Blocker（必须修复）

定义：必须修复后才能合并，通常涉及：

- 安全漏洞（XSS、注入、敏感信息泄露）
- 功能缺陷、数据丢失风险
- 未处理的 Promise rejection、内存泄漏
- 破坏公共 API、缺少关键错误处理

处理：必须修改并重新审查后才能合并。

### 🟡 Suggestion（应该修复）

定义：建议修复，可由作者与审查者协商后合并。处理方式：立即修复 / 记录为 Tech Debt 先合并 / 证明当前实现合理。

示例：可提取的重复代码、不清晰的命名、缺少单元测试、可优化但不影响正常使用的性能、不直观的逻辑。

### 💭 Nit（锦上添花）

定义：可选改进，多为个人风格偏好；作者可自行决定是否接受，不阻塞合并。

---

## 详细检查清单

### 1. 正确性

Blocker：

- 逻辑正确实现了预期功能
- 边缘情况（`null` / `undefined` / 空数组 / 畸形 JSON / 非法数组元素）已处理
- 异步（Promise / async-await）错误被捕获并处理
- 边界条件正确（off-by-one）
- 输入做了必要类型校验

```javascript
// ❌ 未处理异步错误
async function fetchData() {
  const data = await fetch('/api/data');
  return data.json();
}

// ✅ 处理了异步错误与非 2xx 状态
async function fetchData() {
  try {
    const data = await fetch('/api/data');
    if (!data.ok) throw new Error(`HTTP ${data.status}`);
    return await data.json();
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error;
  }
}
```

Suggestion：冗余逻辑 / 死代码；算法选择；过度设计。

### 2. 安全性

Blocker（与 [coding-style.md §17 安全红线](../coding-style.md) 一致）：

- XSS：用户输入不进 `innerHTML` / `eval()`（原型内插值用 `esc()` 助手）
- 请求体验证与转义
- 不提交 API Key、密码、Token、Cookie
- 用户可控 URL 经 `url-guard.js` 校验（SSRF）

```javascript
// ❌ XSS 漏洞
element.innerHTML = userInput;

// ✅ 使用 textContent
element.textContent = userInput;

// ❌ eval 执行用户输入
eval(userInput);

// ✅ JSON.parse 并捕获异常
try {
  const data = JSON.parse(userInput);
} catch (error) {
  console.error('Invalid JSON');
}
```

Suggestion：错误信息是否泄露敏感信息；过时加密算法。

### 3. 可维护性

Blocker：可读性（6 个月后还能看懂）；魔法数字未提取为具名常量。

```javascript
// ❌ 魔法数字
if (user.age > 18) { /* … */ }

// ✅ 具名常量
const MIN_ADULT_AGE = 18;
if (user.age > MIN_ADULT_AGE) { /* … */ }
```

Suggestion（数值约束以 `eslint/rules/*.js` 与行数门禁实际配置为准）：

- 函数 ≤ 150 有效行（`max-lines-per-function`）
- 单文件 ≤ 200 行（`npm run lint:length` 强制；仅代码文件，文档不拆分）
- 命名清晰；复杂逻辑有注释；重复代码可提取

```javascript
// ❌ 含义不明
const d = Date.now();
function proc(data) { /* … */ }

// ✅ 清晰明了
const currentTime = Date.now();
function processTranslationData(data) { /* … */ }
```

Nit：注释格式一致性；解释显而易见行为的多余注释。

### 4. 性能

Blocker：内存泄漏（事件监听器 / 定时器 / 引用未清理）；无限循环 / 递归风险；加载不必要的大资源。

```javascript
// ❌ 泄漏：添加后从不移除
element.addEventListener('click', handleClick);

// ✅ 成对添加 / 移除（组件卸载、元素销毁时）
element.addEventListener('click', handleClick);
element.removeEventListener('click', handleClick);
```

Suggestion：N+1 请求 / 重复计算；O(n²) 及以上复杂度；缓存机会；频繁 DOM 操作引发重排。

```javascript
// ❌ 循环内逐个 append 触发多次重排
items.forEach((item) => {
  const div = document.createElement('div');
  div.textContent = item;
  container.appendChild(div);
});

// ✅ DocumentFragment 一次性挂载
const fragment = document.createDocumentFragment();
items.forEach((item) => {
  const div = document.createElement('div');
  div.textContent = item;
  fragment.appendChild(div);
});
container.appendChild(fragment);
```

### 5. 测试

Blocker：核心路径有测试覆盖；Bug 修复附带回归测试。

Suggestion：覆盖充分性；测试可靠性（误报 / 漏报）；边界输入断言。

### 6. 架构与设计

Blocker：单一职责；破坏现有公共 API。

Suggestion：设计模式选择；模块化与扩展性。

### 7. 代码风格

Suggestion：与项目规范一致；通过 ESLint。

Nit：工具未覆盖的个人偏好。

注意：项目已配置 ESLint + Prettier，风格类问题应低优先级处理（工具自动修复），审查重心放在质量与安全上。

---

## 项目特定规范

### 用户脚本（Userscript）特殊检查点

1. **浏览器兼容性**

   - 新 API 使用前确认目标浏览器基线（以仓库现有代码与用户脚本运行环境为准），避免引入需要 polyfill 的特性；
   - 确需新 API 时在 PR 中说明兼容性依据。

2. **性能影响**

   - 是否显著拖慢 GitHub 页面加载；
   - 长期驻留内存占用（缓存策略、监听器数量）；
   - DOM 操作是否高效（翻译热路径使用 Trie 部分匹配与缓存，避免全量扫描）。

3. **用户脚本元数据**

   - `@match` 规则正确；
   - `@grant` 权限最小必要；
   - 产物 `@version` 与单一版本源 `src/userscript/version.js` 一致（由 `npm run validate` 守护）。

---

## 审查意见示例

好的审查意见：具体（位置明确）、有理由（解释风险）、可操作（给出建议）、尊重（假设善意）。

示例 1（安全）：

```markdown
🔴 **Security: XSS Vulnerability**
Line 42: User input is directly inserted into innerHTML.

**Why:** This allows attackers to inject malicious scripts.

**Suggestion:**
Replace with `textContent` or sanitize before insertion.
```

示例 2（可维护性）：

```markdown
🟡 **Maintainability: Function Too Long**
Lines 10-80: `processTranslation()` is 70 lines long and does multiple things.

**Why:** Long functions are harder to test, understand, and maintain.

**Suggestion:**
Consider extracting `validateInput()` / `fetchDictionary()` / `applyTranslation()`.
```

示例 3（性能）：

```markdown
🟡 **Performance: Potential N+1 Query**
Line 38: Fetching user details inside a loop.

**Why:** N sequential requests amplify latency.

**Suggestion:**
Batch with `fetchUsersBatch(userIds)`.
```

示例 4（Nit）：

```markdown
💭 **Nit: Naming**
Line 12: Consider renaming `temp` to `translatedText`.

**Note:** Minor suggestion, feel free to keep `temp` if you prefer.
```

示例 5（表扬）：

```markdown
👍 The error handling in `dictionaryManager.js` is very robust —
categorizing errors by severity will make debugging much easier.
```

---

## 职责划分

**作者**：提交前自检（`npm test` 全绿、无调试遗留、无敏感信息、文档已同步）；24 小时内响应审查意见；尊重审查者。

**审查者**：按本标准及时审查；建设性反馈；认可优点；决定批准与否。数量要求与 SLA 见 [PROCESS.md](./PROCESS.md)。

**团队 Lead**：争议仲裁；按季度回顾流程指标并更新标准；帮助新成员上手。

---

## 参考资料

- [Google Code Review Guide](https://google.github.io/eng-practices/review/)
- [Effective Code Reviews Without the Pain](https://www.developer.com/design/effective-code-reviews/)
- [Best Practices for Code Review](https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/)

---

## 更新日志

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0.0 | 2026-09-30 | 初始版本（阈值对齐 coding-style.md） |
| 1.13.32 | 2026-11-08 | SSOT 复核：SLA 改引用 PROCESS.md 并对齐数值；移除与正文重复的效率指标表；修正与代码现状不符的「可选链不兼容」示例；元数据检查项对齐 build 编号规范；去除装饰性 emoji，横幅格式对齐标准 |
