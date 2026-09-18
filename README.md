# GitHub Chinese 简体中文

让 GitHub 以中文的节奏呼吸。这是一套为 GitHub Chinese 简体中文插件量身定制的设计系统。它承袭 GitHub 的深色美学、精确排版与克制交互，同时以中文衬线字体、语义色彩与细腻动效，塑造属于插件自身的独立识别。

[![GitHub license](https://img.shields.io/github/license/Tanox/GitHub_i18n?color=blue)](LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/Tanox/GitHub_i18n?display_name=tag&color=green)](https://github.com/Tanox/GitHub_i18n/releases)

## 功能介绍

- **即时翻译**：本地词典，无需联网，瞬间生效
- **覆盖全面**：仓库、Issues、PR、设置、通知、Codespaces、Explore、Wiki、Actions、Projects 等页面
- **不破坏布局**：只翻译文字内容，保持页面原有样式
- **实时更新**：支持动态加载内容翻译，自动检测页面变化
- **性能优化**：智能缓存、虚拟 DOM 优化、批量处理，不会拖慢页面速度
- **配置面板**：内置配置界面，可调整翻译行为
- **性能监控**：实时查看翻译统计数据
- **自动升级**：Tampermonkey 自动检测新版本

## 安装说明

### 1. 安装浏览器扩展

- Chrome / Edge: 安装 [Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- Firefox: 安装 [Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/)
- Safari: 安装 [Tampermonkey](https://apps.apple.com/app/tampermonkey/id1482490089)

### 2. 安装脚本

点击 [一键安装](https://github.com/Tanox/GitHub_i18n/raw/refs/heads/main/build/GitHub_i18n.user.js)，然后在 Tampermonkey 中点击「安装」。

### 3. 开始使用

刷新 GitHub 页面，界面就会变成中文。页面右下角的绿色浮动按钮可打开配置面板。

## 设计系统与原型

本项目维护一套统一的设计系统与高保真原型，方便设计师与开发者协作：

| 模块 | 路径 | 说明 |
|------|------|------|
| 设计系统 | [prototype/design-system/](prototype/design-system/) | 色彩 / 字体 / 间距 / 图标 / 动效 |
| 组件库 | [prototype/components/](prototype/components/) | 基础组件 / 复合组件 / 业务组件 |
| 交互标准 | [prototype/interaction/](prototype/interaction/) | 交互模式 / 反馈 / 错误处理 / 空状态 |
| 高保真原型 | [prototype/prototypes/](prototype/prototypes/) | 桌面端 / 移动端 |

**快速入口**：在浏览器中打开 [prototype/index.html](prototype/index.html) 即可浏览完整的原型设计。

## 项目结构

```
src/
├── core/                    # 核心模块
│   ├── cacheManager.js      # LRU 缓存管理器
│   ├── errorHandler.js      # 统一错误处理
│   ├── trie.js              # Trie 树数据结构
│   ├── virtualNode.js       # 虚拟 DOM 节点
│   └── virtualDom.js        # 虚拟 DOM 管理器
├── dictionaries/            # 翻译词典 (common/codespaces/explore)
├── page-monitor/            # 页面监控 (DOM 监听、路径监听、翻译触发)
├── translation-core/        # 翻译核心 (词典管理、元素翻译、性能监控)
├── ui/                      # UI 组件 (配置面板、性能监控)
├── utils/                   # 工具函数
│   ├── functionUtils.js     # 函数工具 (节流、防抖、延迟)
│   ├── stringUtils.js       # 字符串工具 (JSON、正则、深拷贝)
│   ├── domUtils.js          # DOM 工具 (文本节点收集)
│   ├── urlUtils.js          # URL 工具 (路径解析、参数获取)
│   ├── securityUtils.js     # 安全工具 (Base64、哈希、混淆)
│   ├── tools.js             # 其他工具函数
│   └── utils.js             # 工具函数统一导出
├── config.js                # 全局配置
├── i18n.js                  # 国际化框架
├── main.js                  # 主入口
├── version.js               # 版本信息
├── versionUtils.js          # 版本工具函数
├── versionChecker.js        # 版本更新检查
└── updateNotification.js    # 更新通知 UI
prototype/                   # 设计系统与高保真原型
build/                       # 构建产物
openspec/                    # 项目规范 (架构 / 代码风格 / 开发流程)
```

## 参与开发

克隆本仓库：

```bash
git clone https://github.com/Tanox/GitHub_i18n.git
cd GitHub_i18n
npm install
npm run build
```

### 开发命令

- `npm run build` — 构建用户脚本
- `npm run lint` — 代码检查
- `npm run format` — 代码格式化
- `npm run validate` — 验证构建产物

## 许可证

GNU General Public License v2.0
