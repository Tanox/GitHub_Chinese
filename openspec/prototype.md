# 原型设计（索引）

> 版本：**v1.9.41** ｜ 版本权威源：`src/version.js`
>
> 本文件为索引。原型设计说明的**唯一权威正文位于 [docs/prototype.md](../docs/prototype.md)**，
> 可交互高保真原型位于 [prototype/](../prototype/)（入口 [prototype/index.html](../prototype/index.html)）。

## 原型要点速览

### 关键 UI 规格

| 元素 | 规格 |
|------|------|
| 浮动入口按钮 | `fixed`，右下 20px，圆形，品牌绿边框，`z-index: 2147483646` |
| 配置面板 | 宽 90%（最大 600px），最大高 80vh，圆角 8px |
| 面板分组 | 基本设置 / 更新设置 / 性能设置 / 性能监控 |
| 面板按钮 | 重置默认（次要）· 取消（次要）· 保存配置（主色绿 `#2ea44f`） |
| 响应式断点 | `<480px` 单列 95% ｜ `480–768px` 单列 85% ｜ `>768px` 600px |

### 配置持久化

```
localStorage['github-i18n-config']   ← 用户配置（轻量混淆）
        ↓ configStore.loadUserSettings()
     userConfig（内存）
        ↓ mergeUserConfig()
        CONFIG（与默认配置合并后生效）
```

### 页面模式检测

| 路径 | 模式 |
|------|------|
| `/<user>/<repo>` | code |
| `/<user>/<repo>/pull/*` | pr |
| `/<user>/<repo>/issues/*` | issue |
| `/explore` | explore |
| `/codespaces` | codespaces |
| `/notifications` | notification |
| `/settings` | settings |
| 其他 | default |

原型实现落点：`ui/configUI.js`（面板主类）、`ui/configUI/renderer.js`（DOM 渲染）、
`ui/configUI/bootstrap.js`（浮动按钮与菜单）、`ui/styles/configUI/*`（样式）。

---

## 权威正文

| 章节 | 位置 |
|------|------|
| 脚本原型图与架构流程 | [docs/prototype.md §1](../docs/prototype.md) |
| 配置面板原型设计 | [docs/prototype.md §2](../docs/prototype.md) |
| 状态管理流程 | [docs/prototype.md §3](../docs/prototype.md) |
| 性能监控数据流 | [docs/prototype.md §4](../docs/prototype.md) |
| 页面模式检测流程 | [docs/prototype.md §5](../docs/prototype.md) |
| 关键数据结构 | [docs/prototype.md §6](../docs/prototype.md) |
| 错误处理流程 | [docs/prototype.md §7](../docs/prototype.md) |
