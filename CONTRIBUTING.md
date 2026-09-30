# 贡献指南

感谢您对 GitHub 中文翻译插件项目的关注！本文档将帮助您了解如何为项目做出贡献。

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
  - [报告问题](#报告问题)
  - [提交功能请求](#提交功能请求)
  - [提交代码](#提交代码)
- [开发环境设置](#开发环境设置)
- [代码规范](#代码规范)
- [提交信息规范](#提交信息规范)
- [翻译词条贡献](#翻译词条贡献)
- [审查流程](#审查流程)

## 行为准则

- 保持友善和尊重
- 接受建设性的批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

## 如何贡献

### 报告问题

如果您发现了 bug 或有改进建议，请通过 [GitHub Issues](https://github.com/Tanox/GitHub_i18n/issues) 提交。

提交问题时，请包含以下信息：

- **问题描述**：清晰描述问题
- **复现步骤**：详细说明如何复现问题
- **期望行为**：描述您期望的行为
- **实际行为**：描述实际发生的行为
- **环境信息**：
  - 浏览器版本
  - Tampermonkey 版本
  - 脚本版本
  - 操作系统
- **截图**：如有必要，请附上截图

### 提交功能请求

功能请求也应通过 Issues 提交，请包含：

- **功能描述**：清晰描述您想要的功能
- **使用场景**：描述这个功能的使用场景
- **可能的实现方案**：如果您有实现思路，请分享

### 提交代码

1. Fork 本仓库
2. 创建您的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'feat: 添加某个功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 开发环境设置

### 前置要求

- Node.js >= 22.22.2
- npm >= 9.0.0

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/Tanox/GitHub_i18n.git
cd GitHub_i18n

# 安装依赖
npm install

# 运行测试
npm test

# 构建项目
npm run build
```

### 开发命令

```bash
# 运行完整测试流水线（lint → build → validate）
npm test

# 运行代码检查
npm run lint

# 自动修复代码问题
npm run lint:fix

# 格式化代码
npm run format

# 检查代码格式
npm run format:check

# 构建项目
npm run build

# 验证构建产物
npm run validate
```

## 代码规范

### ESLint 规则

项目使用 ESLint 进行代码检查，主要规则包括：

- 使用 ES6+ 语法
- 使用单引号
- 2 空格缩进
- 语句末尾使用分号
- 对象和数组使用尾随逗号

### 代码风格

- 使用有意义的变量名
- 函数长度不超过 100 行
- 函数参数不超过 4 个
- 复杂度不超过 20（与 ESLint 规则一致）

### 注释规范

- 所有函数都应包含 JSDoc 注释
- 复杂逻辑需要添加行内注释
- 使用中文注释

示例：

```javascript
/**
 * 翻译单个元素
 * @param {HTMLElement} element - 要翻译的元素
 * @param {Object} dictionary - 翻译词典
 * @returns {boolean} 是否成功翻译
 */
function translateElement(element, dictionary) {
  // 实现逻辑
}
```

## 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### 格式

```
<类型>(<范围>): <描述>

[可选的正文]

[可选的脚注]
```

### 类型

- **feat**: 新功能
- **fix**: 修复 bug
- **docs**: 文档更新
- **style**: 代码格式调整（不影响功能）
- **refactor**: 代码重构
- **perf**: 性能优化
- **test**: 测试相关
- **chore**: 构建过程或辅助工具的变动
- **ci**: CI/CD 相关
- **build**: 构建系统相关
- **revert**: 回滚提交

### 示例

```
feat: 添加对 GitHub Projects 页面的翻译支持

fix: 修复某些下拉菜单无法翻译的问题

docs: 更新安装说明

test: 添加缓存管理器的单元测试
```

## 翻译词条贡献

### 词典文件位置

- `src/dictionaries/common.js` - 通用翻译
- `src/dictionaries/codespaces.js` - Codespaces 相关
- `src/dictionaries/explore.js` - Explore 页面相关

### 添加新词条

1. 找到对应的词典文件
2. 按照字母顺序添加新词条
3. 确保键名使用英文原文（小写，空格用下划线替换）
4. 值使用简体中文

示例：

```javascript
export const commonDictionary = {
  // ... 已有词条
  "pull_requests": "拉取请求",
  "new_feature": "新功能",  // 新增词条
};
```

### 翻译原则

- 保持 GitHub 官方中文文档的术语一致性
- 优先使用技术社区通用的翻译
- 保持简洁，避免过长的翻译
- 对于专有名词（如 GitHub、Git），保持原文

### 常用术语对照表

| 英文 | 中文 |
|------|------|
| Repository | 仓库 |
| Pull Request | 拉取请求 |
| Issue | 议题/问题 |
| Commit | 提交 |
| Branch | 分支 |
| Fork | 复刻 |
| Star | 星标 |
| Watch | 关注 |
| Wiki | 维基 |
| Milestone | 里程碑 |
| Label | 标签 |

## 审查流程

1. 提交 Pull Request 后，维护者会在 7 天内进行审查
2. 可能需要根据反馈进行修改
3. 通过审查后，代码将被合并到主分支
4. 合并后，更改将在下一个版本中发布

## 获取帮助

如果您在贡献过程中遇到问题，可以：

- 查看 [GitHub Issues](https://github.com/Tanox/GitHub_i18n/issues) 是否有类似问题
- 创建新的 Issue 寻求帮助
- 通过邮件联系维护者

## 许可证

通过贡献代码，您同意您的贡献将在 [GPL-2.0](LICENSE) 许可证下发布。

---

再次感谢您对项目的贡献！🎉
