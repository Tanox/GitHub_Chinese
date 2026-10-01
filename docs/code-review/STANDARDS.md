# 代码审查标准 (Code Review Standards)

> **版本**: 1.0.0
> **更新日期**: 2026-09-30
> **维护者**: 技术团队

## 📋 目录

1. [概述](#概述)
2. [审查原则](#审查原则)
3. [问题优先级定义](#问题优先级定义)
4. [详细检查清单](#详细检查清单)
5. [项目特定规范](#项目特定规范)
6. [审查意见示例](#审查意见示例)
7. [职责划分](#职责划分)

---

## 📌 概述

### 为什么需要代码审查？

代码审查是保证代码质量的重要手段，我们的目标是：

- ✅ **提高代码质量** — 及早发现 bug 和 Design Flaw
- ✅ **知识共享** — 团队成员了解不同模块的改动
- ✅ **保持一致性** — 统一的代码风格和架构决策
- ✅ **降低维护成本** — 可读性好的代码更容易维护
- ✅ **团队成长** — 通过审查互相学习最佳实践

### 适用范围

本标准适用于所有提交到 `main` 分支的 PR，包括：

- 新功能开发
- Bug 修复
- 重构
- 性能优化
- 文档更新（代码相关）

---

## 🎯 审查原则

### 1. 建设性而非批判性

❌ **错误示范**:
> 这代码写得什么鬼？完全看不懂。

✅ **正确示范**:
> 这个函数的逻辑比较复杂，考虑将其拆分为多个小函数，每个函数只做一件事，这样会提高可读性。

### 2. 解释"为什么"而非仅仅指出"是什么"

❌ **错误示范**:
> 这里要改。

✅ **正确示范**:
> 这里直接使用 innerHTML 可能会有 XSS 风险，建议使用 textContent 或安全的 DOM 操作方法。

### 3. 区分必须修改和建议改进

使用标准的问题优先级标记：
- 🔴 **Blocker** — 必须修改才能合并
- 🟡 **Suggestion** — 建议修改，但可以不 Block
- 💭 **Nit** — 可选的改进建议

### 4. 认可好的代码

不要只指出问题，也要表扬好的实践：

> 👍 这里的错误处理很完善，考虑了边缘情况。
> 👍 这个函数的命名很清晰，一眼就能看懂用途。

### 5. 及时响应

- **作者**: 应在 24 小时内响应审查意见
- **审查者**: 应在 2 个工作日内完成审查
- **紧急 PR**: 应在 4 小时内完成审查

---

## 🚦 问题优先级定义

### 🔴 Blocker（必须修复）

**定义**: 必须修复后才能合并的问题，通常会导致：
- 安全漏洞
- 功能缺陷
- 数据丢失风险
- 性能严重问题
- 破坏现有功能

**处理**: 必须修改并重新审查后才能合并。

**示例**:
- SQL 注入、XSS 等安全漏洞
- 未处理的 Promise rejection
- 内存泄漏
- 破坏公共 API
- 缺少关键错误处理

---

### 🟡 Suggestion（应该修复）

**定义**: 建议修复的问题，但可以由作者和审查者协商一致后合并。

**处理**: 应在 PR 中讨论，可以是：
1. 立即修复
2. 记录为后续 Tech Debt，在当前 PR 中先合并
3. 证明当前实现有合理原因

**示例**:
- 代码重复，可以提取公共函数
- 变量命名不够清晰
- 缺少单元测试
- 性能可以优化（但不影响正常使用）
- 逻辑不够直观

---

### 💭 Nit（锦上添花）

**定义**: 可选的改进建议，通常是个人的代码风格偏好。

**处理**: 作者可以选择接受或忽略，不应 Block 合并。

**示例**:
- 个人偏好的括号风格（如果项目没有统一规范）
- 轻微的命名偏好
- 可选的注释添加

---

## 📝 详细检查清单

### 1️⃣ 正确性 (Correctness)

#### 🔴 Blocker

- [ ] **逻辑正确性** — 代码是否实现了预期功能？
- [ ] **边缘情况处理** — 是否处理了 null、undefined、空数组等情况？
- [ ] **异步处理** — Promise/async-await 是否正确处理？是否有未捕获的异常？
- [ ] **条件判断** — 边界条件是否正确（off-by-one errors）？
- [ ] **类型检查** — 是否对输入进行了必要的类型验证？

**检查点**:
```javascript
// ❌ 危险：未处理异步错误
async function fetchData() {
  const data = await fetch('/api/data');
  return data.json();
}

// ✅ 安全：处理了异步错误
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

#### 🟡 Suggestion

- [ ] 是否有冗余的逻辑或死代码？
- [ ] 算法选择是否合理？是否有更简洁的实现？
- [ ] 是否过度设计（Over-engineering）？

---

### 2️⃣ 安全性 (Security)

#### 🔴 Blocker

- [ ] **XSS 防护** — 是否安全地处理用户输入？避免 `innerHTML`、`eval()`
- [ ] **CSRF 防护** — 是否验证了请求来源？
- [ ] **敏感信息** — 是否意外提交了 API Key、密码、Token？
- [ ] **输入验证** — 是否对用户输入进行了验证和转义？
- [ ] **权限检查** — 是否进行了适当的权限验证？

**检查点**:
```javascript
// ❌ 危险：XSS 漏洞
element.innerHTML = userInput;

// ✅ 安全：使用 textContent
element.textContent = userInput;

// ❌ 危险：eval 执行用户输入
eval(userInput);

// ✅ 安全：使用 JSON.parse（并捕获异常）
try {
  const data = JSON.parse(userInput);
} catch (error) {
  console.error('Invalid JSON');
}
```

#### 🟡 Suggestion

- [ ] 是否使用了过时的加密算法？
- [ ] 错误信息是否泄露了敏感信息？

---

### 3️⃣ 可维护性 (Maintainability)

#### 🔴 Blocker

- [ ] **可读性** — 代码是否易于理解？6 个月后还能看懂吗？
- [ ] **魔法数字** — 是否使用了未解释的数字常量？

**检查点**:
```javascript
// ❌ 不好：魔法数字
if (user.age > 18) { ... }

// ✅ 好：使用常量
const MIN_ADULT_AGE = 18;
if (user.age > MIN_ADULT_AGE) { ... }
```

#### 🟡 Suggestion

- [ ] **函数长度** — 单个函数是否过长（建议 ≤ 100 行，与 `coding-style.md` §5.6 一致）？
- [ ] **文件长度** — 单个文件是否过大（建议 ≤ 200 行，与 `coding-style.md` §5.8 一致；仅代码文件，文档不拆分）？
- [ ] **命名规范** — 变量、函数、类的命名是否清晰？
- [ ] **注释质量** — 复杂逻辑是否有适当的注释？
- [ ] **代码重复** — 是否有重复代码可以提取？

**命名示例**:
```javascript
// ❌ 不好：含义不明
const d = Date.now();
function proc(data) { ... }

// ✅ 好：清晰明了
const currentTime = Date.now();
function processTranslationData(data) { ... }
```

#### 💭 Nit

- [ ] 注释的语法和格式是否一致？
- [ ] 是否有多余的注释（解释 obvious 的代码）？

---

### 4️⃣ 性能 (Performance)

#### 🔴 Blocker

- [ ] **内存泄漏** — 是否正确地清理了事件监听器、定时器、引用？
- [ ] **无限循环/递归** — 是否有潜在的无限循环风险？
- [ ] **大文件/大对象** — 是否加载了不必要的大资源？

**检查点**:
```javascript
// ❌ 危险：内存泄漏
element.addEventListener('click', handleClick);
// 忘记移除监听器

// ✅ 安全：成对添加/移除
element.addEventListener('click', handleClick);
// 在适当的时候
element.removeEventListener('click', handleClick);
```

#### 🟡 Suggestion

- [ ] **N+1 查询** — 是否有不必要的重复计算或请求？
- [ ] **算法复杂度** — 是否有 O(n²) 或更高的复杂度可以优化？
- [ ] **缓存策略** — 是否可以适当使用缓存？
- [ ] **DOM 操作** — 是否频繁操作 DOM 导致重排重绘？

**性能示例**:
```javascript
// ❌ 不好：在循环中频繁操作 DOM
items.forEach(item => {
  const div = document.createElement('div');
  div.textContent = item;
  container.appendChild(div); // 每次都触发重排
});

// ✅ 好：使用 DocumentFragment
const fragment = document.createDocumentFragment();
items.forEach(item => {
  const div = document.createElement('div');
  div.textContent = item;
  fragment.appendChild(div);
});
container.appendChild(fragment); // 只触发一次重排
```

---

### 5️⃣ 测试 (Testing)

#### 🔴 Blocker

- [ ] **关键路径** — 核心功能是否有测试覆盖？
- [ ] **Bug 修复** — Bug 修复是否包含回归测试？

#### 🟡 Suggestion

- [ ] **测试覆盖率** — 是否有足够的测试覆盖？
- [ ] **测试质量** — 测试是否可靠？是否会误报或漏报？
- [ ] **边界测试** — 是否测试了边缘情况？

---

### 6️⃣ 架构与设计 (Architecture & Design)

#### 🔴 Blocker

- [ ] **单一职责** — 函数/类是否只做一件事？
- [ ] **依赖注入** — 是否避免了紧耦合？
- [ ] **API 变更** — 是否破坏了现有的公共 API？

#### 🟡 Suggestion

- [ ] **设计模式** — 是否使用了合适的设计模式？
- [ ] **模块化** — 代码组织是否合理？
- [ ] **扩展性** — 是否易于扩展？

---

### 7️⃣ 代码风格 (Code Style)

#### 🟡 Suggestion

- [ ] **一致性** — 代码风格是否与项目一致？
- [ ] **Lint 规则** — 是否通过了 ESLint 检查？

#### 💭 Nit

- [ ] 个人偏好的代码风格（如果项目没有统一规范）

**注意**: 如果项目已经配置了 ESLint + Prettier，代码风格问题应该是 💭 Nit，因为工具会自动处理。

---

## 🎯 项目特定规范

### 用户脚本项目特殊检查点

由于本项目是浏览器用户脚本（Userscript），有以下特殊考虑：

#### 1. 浏览器兼容性

- [ ] **API 使用** — 是否使用了过新的 API（需要考虑兼容版本）？
- [ ] **Polyfill** — 是否需要添加 Polyfill？

```javascript
// ❌ 可能不兼容：可选链在旧浏览器不支持
const name = user?.profile?.name;

// ✅ 兼容写法
const name = user && user.profile && user.profile.name;
```

#### 2. 性能影响

- [ ] **页面加载影响** — 脚本是否会显著拖慢页面加载？
- [ ] **内存占用** — 长期运行是否会占用过多内存？
- [ ] **DOM 操作优化** — 是否使用了高效的 DOM 操作方法？

#### 3. 用户脚本特殊规范

- [ ] **@match 规则** — 是否正确配置了匹配规则？
- [ ] **@grant 权限** — 是否请求了必要的权限？
- [ ] **元数据块** — 版本号、更新日期是否正确？

---

## 💬 审查意见示例

### 好的审查意见特征

1. **具体** — 明确指出问题和位置
2. **有理由** — 解释为什么这是问题
3. **可操作** — 提供改进建议
4. **尊重** — 语气友好，假设善意

### 示例 1: 安全性问题

```markdown
🔴 **Security: XSS Vulnerability**
Line 42: User input is directly inserted into innerHTML.

**Why:** This allows attackers to inject malicious scripts.

**Suggestion:**
Replace with `textContent` or use DOMPurify to sanitize:
\`\`\`javascript
element.textContent = userInput;
// or
element.innerHTML = DOMPurify.sanitize(userInput);
\`\`\`
```

### 示例 2: 可维护性问题

```markdown
🟡 **Maintainability: Function Too Long**
Lines 10-80: `processTranslation()` is 70 lines long and does multiple things.

**Why:** Long functions are harder to test, understand, and maintain.

**Suggestion:**
Consider extracting:
- `validateInput()` — lines 15-25
- `fetchDictionary()` — lines 30-45
- `applyTranslation()` — lines 50-70
```

### 示例 3: 性能问题

```markdown
🟡 **Performance: Potential N+1 Query**
Line 38: Fetching user details inside a loop.

**Why:** This will send N requests to the API, causing performance issues.

**Suggestion:**
Batch the request:
\`\`\`javascript
// Instead of
for (const id of userIds) {
  const user = await fetchUser(id);
}

// Do this
const users = await fetchUsersBatch(userIds);
\`\`\`
```

### 示例 4: 命名改进

```markdown
💭 **Nit: Naming**
Line 12: Consider renaming `temp` to `translatedText`.

**Why:** `temp` doesn't convey meaning. `translatedText` is more descriptive.

**Note:** This is a minor suggestion, feel free to ignore if you prefer `temp`.
```

### 示例 5: 表扬好代码

```markdown
👍 **Great Work!**
The error handling in `dictionaryManager.js` is very robust. I especially like how you've categorized errors into different severity levels. This will make debugging much easier.
```

---

## 👥 职责划分

### 代码作者 (Author) 职责

1. **提交前自检** — 使用提供的检查清单自行审查
2. **清晰的 PR 描述** — 说明改动目的、实现方式、测试方法
3. **及时响应** — 24 小时内响应审查意见
4. **尊重审查者** — 假设审查者是善意的，有不同意见时友好讨论

**提交前自检清单**:
- [ ] 代码通过了 `npm run lint`
- [ ] 代码通过了 `npm run test`
- [ ] 自测了核心功能
- [ ] 检查了是否有调试代码（console.log、 debugger）
- [ ] 更新了相关文档

---

### 审查者 (Reviewer) 职责

1. **及时审查** — 2 个工作日内完成审查
2. **全面审查** — 使用本标准进行检查
3. **建设性反馈** — 提供具体、可操作的改进建议
4. **认可优点** — 表扬好的代码实践
5. **最终决定** — 决定是否批准合并

**审查者分配规则**:
- 每个 PR 至少需要 1 名审查者
- 重要改动（核心模块、架构变更）需要 2 名审查者
- 审查者应是熟悉相关模块的团队成员

---

### 团队 Lead 职责

1. **解决争议** — 当作者和审查者无法达成一致时
2. **持续改进** — 根据团队反馈更新审查标准
3. **培训新成员** — 帮助新成员理解审查标准

---

## 📊 审查效率指标

为了持续改进审查流程，我们关注以下指标：

1. **审查响应时间** — 从提交 PR 到首次审查的平均时间
2. **审查轮次** — 每个 PR 平均需要多少轮审查
3. **合并时间** — 从提交 PR 到合并的平均时间
4. **Bug 逃逸率** — 经过审查后仍然遗漏到生产环境的 Bug 比例

---

## 🔄 持续改进

### 定期回顾

每季度进行一次代码审查流程回顾：

1. 收集团队成员反馈
2. 分析审查数据（上述指标）
3. 更新审查标准文档
4. 分享最佳实践案例

### 贡献指南

如果你发现本标准有任何可以改进的地方：

1. 在团队会议上提出
2. 或直接在文档中提交 PR
3. 或创建 Issue 讨论

---

## 📚 参考资料

- [Google Code Review Guide](https://google.github.io/eng-practices/review/)
- [Effective Code Reviews Without the Pain](https://www.developer.com/design/effective-code-reviews/)
- [Best Practices for Code Review](https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/)

---

## 📝 更新日志

| 版本 | 日期 | 作者 | 变更内容 |
|------|------|------|----------|
| 1.0.0 | 2026-09-30 | - | 初始版本（阈值对齐 coding-style.md） |

---

**记住**: 代码审查的目的是提高代码质量和帮助团队成长，而不是批评或指责。保持友善、专业、建设性！ 🚀
