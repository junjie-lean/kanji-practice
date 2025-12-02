# 🎴 日语单词记忆助手

> 未来日语单词记忆助手 - 让你的日语学习之旅更加高效有趣！

[![Next.js](https://img.shields.io/badge/Next.js-13.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC)](https://tailwindcss.com/)

一个专为日语学习者打造的现代化单词记忆应用，结合了记忆卡片、听写练习、语音合成等先进学习方法，帮助你高效掌握日语词汇。

****

## 📋 目录

- [✨ 项目特色](#-项目特色)
- [🛠️ 技术栈](#️-技术栈)
- [🚀 快速开始](#-快速开始)
- [📁 项目结构](#-项目结构)
- [🎯 功能详解](#-功能详解)
- [💻 开发指南](#-开发指南)
- [🚢 部署说明](#-部署说明)
- [🤝 贡献指南](#-贡献指南)
- [📄 许可证](#-许可证)

## ✨ 项目特色

### 🎯 核心功能

- **智能记忆卡片**: 翻转式卡片学习，支持标记掌握/需复习状态
- **分级听写练习**: 13个精心设计的词库，从基础到进阶
- **语音合成**: 支持高质量的有道语音API，带浏览器TTS降级方案
- **单词检索**: 快速搜索和浏览所有单词
- **进度追踪**: 实时统计学习进度和掌握情况

### 🎨 用户体验

- **响应式设计**: 完美适配桌面和移动设备
- **暗黑模式**: 护眼的夜间学习模式
- **键盘快捷键**: 高效的学习操作体验
- **流畅动画**: 基于Framer Motion的优雅交互动画
- **现代化UI**: 使用NextUI组件库的精美界面

### 🔧 技术亮点

- **TypeScript**: 完整的类型安全支持
- **现代架构**: 基于Next.js 13 App Router
- **性能优化**: 优化的加载和缓存策略
- **可访问性**: 良好的键盘导航和屏幕阅读器支持

## 🛠️ 技术栈

### 前端框架

- **[Next.js 13.5.4](https://nextjs.org/)** - React全栈框架
- **[React 18](https://reactjs.org/)** - 用户界面库
- **[TypeScript 5](https://www.typescriptlang.org/)** - 类型安全的JavaScript

### UI & 样式

- **[Tailwind CSS 3](https://tailwindcss.com/)** - 实用优先的CSS框架
- **[NextUI](https://nextui.org/)** - 现代React组件库
- **[Framer Motion](https://www.framer.com/motion/)** - 动画库

### 开发工具

- **ESLint** - 代码质量检查
- **PostCSS** - CSS处理工具
- **Autoprefixer** - CSS浏览器兼容性

## 🚀 快速开始

### 环境要求

- Node.js 18.x 或更高版本
- npm/yarn/pnpm/bun 包管理器

### 安装步骤

1. **克隆项目**

   ```bash
   git clone <repository-url>
   cd my-app
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或
   yarn install
   # 或
   pnpm install
   ```

3. **启动开发服务器**

   ```bash
   npm run dev
   # 或
   yarn dev
   # 或
   pnpm dev
   ```

4. **打开浏览器**

   访问 [http://localhost:3000](http://localhost:3000) 开始使用应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 📁 项目结构

```text
my-app/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── DarkModeToggle.tsx    # 暗黑模式切换
│   │   └── FlashCard.tsx         # 记忆卡片组件
│   ├── data/                # 数据文件
│   │   ├── config.ts             # 词库配置
│   │   └── kotoba/               # 单词数据
│   │       ├── kotoba_1.json     # 第1课词汇
│   │       └── ...               # 其他词库
│   ├── hooks/               # 自定义Hooks
│   │   ├── useDarkMode.ts        # 暗黑模式管理
│   │   └── useFlashcardProgress.ts # 卡片进度管理
│   ├── pages/               # Next.js页面
│   │   ├── index.tsx             # 首页
│   │   ├── games/
│   │   │   └── flashcard.tsx     # 记忆卡片游戏
│   │   ├── practice/             # 练习相关页面
│   │   └── vocabulary/           # 单词检索页面
│   ├── styles/              # 样式文件
│   │   └── globals.css           # 全局样式
│   └── utils/               # 工具函数
│       ├── flashcardStorage.ts   # 卡片数据存储
│       ├── speechService.ts      # 语音服务
│       └── stringComparison.ts   # 字符串比较工具
├── public/                  # 静态资源
├── docs/                    # 文档
│   ├── KEYBOARD_SHORTCUTS.md    # 键盘快捷键说明
│   └── RESPONSIVE_DARK_MODE.md  # 响应式暗黑模式文档
└── package.json            # 项目配置
```

## 🎯 功能详解

### 🃏 记忆卡片游戏

**核心特色：**

- 支持日语→中文和中文→日语两种学习模式
- 智能乱序播放，避免记忆固定顺序
- 实时进度统计和可视化进度条
- 标记系统：已掌握/需复习状态追踪

**操作方式：**

- 点击卡片翻转查看答案
- 使用键盘快捷键提升效率
- 自动保存学习进度到本地存储

### 📚 听写练习系统

**词库体系：**
- 13个分级词库，从基础词汇到高级表达
- 每个词库包含精心筛选的单词
- 支持难度标识和学习建议

**练习流程：**

- 选择词库开始练习
- 系统语音播放单词读音
- 用户输入答案进行验证
- 练习完成后可重新开始

### 🔍 单词检索功能

**搜索特性：**

- 实时搜索所有词库单词
- 支持日语和中文关键词
- 快速浏览单词详情

### 🔊 语音合成功能

**技术实现：**
- **主要方案**: 集成有道词典语音API，提供高质量日语发音
- **降级方案**: 浏览器原生TTS API，确保兼容性
- 自动语音切换，保证学习体验

### 🌙 暗黑模式 & 响应式设计

**设计理念：**
- 自适应明暗主题，保护视力
- 完全响应式布局，支持各种设备
- 平滑的主题切换动画

### ⌨️ 键盘快捷键

**游戏页面快捷键：**

- `Space` - 翻转卡片
- `←` - 标记为需复习
- `→` - 标记为已掌握
- `↓` - 下一个单词
- `↑` - 上一个单词

## 💻 开发指南

### 本地开发设置

1. 安装依赖后启动开发服务器：

   ```bash
   npm run dev
   ```

2. 代码修改将自动热重载

### 添加新词库

1. 在 `src/data/kotoba/` 目录下创建新的JSON文件
2. 在 `src/data/config.ts` 中添加词库配置
3. 重启开发服务器

### 单词数据格式

```json
[
  {
    "id": "unique_id",
    "japanese": "こんにちは",
    "chinese": "你好",
    "romaji": "konnichiwa",
    "difficulty": "easy"
  }
]
```

### 代码规范

- 使用TypeScript严格模式
- 遵循ESLint配置
- 组件使用函数式编程模式
- 添加适当的JSDoc注释

## 🚢 部署说明

### Vercel 部署（推荐）

1. 连接GitHub仓库到Vercel
2. 自动检测Next.js项目并配置
3. 一键部署完成

### 其他部署选项

**使用Docker：**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**传统服务器部署：**

```bash
npm run build
npm start
```

## 🤝 贡献指南

### 贡献代码

1. Fork 本项目
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 开启 Pull Request

### 开发规范

- 确保所有测试通过
- 更新相关文档
- 遵循现有的代码风格
- 添加必要的类型定义

### 问题反馈

- 使用 GitHub Issues 报告bug
- 详细描述问题复现步骤
- 提供浏览器和系统信息

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

