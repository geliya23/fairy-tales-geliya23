# 项目上下文

## 项目概述
这是一个展示童话故事集合的静态网站。项目通过一个主页面(index.html)提供导航侧边栏来选择不同故事，故事内容从story/目录下的独立HTML文件中动态加载。

## 技术栈
- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **样式框架**: Tailwind CSS (CDN)
- **Markdown解析**: Marked.js (CDN)
- **字体**: Google Fonts (Cinzel Decorative, EB Garamond)
- **项目类型**: 纯静态网站，无构建过程

## 项目约定

### 代码风格
- **文件编码**: UTF-8
- **语言**: 中文 (zh-CN)
- **缩进**: 4个空格
- **命名规范**:
  - 文件名使用小写字母和下划线：`the_brave_hedgehog.md`
  - HTML/CSS类名使用短横线分隔：`story-list-container`
  - JavaScript变量和函数使用驼峰命名法：`loadStory`, `storyContentElement`

### 架构模式
- **前端架构**: 单页面应用(SPA)模式
- **数据流**: 基于事件驱动的动态内容加载
- **内容管理**: 故事以Markdown格式存储，通过JavaScript动态解析和渲染
- **响应式设计**: 采用移动优先的响应式布局策略

### 测试策略
- **测试方式**: 手动浏览器测试
- **测试覆盖**:
  - 故事列表加载
  - 故事内容切换
  - 响应式布局（桌面端、平板、手机）
  - Markdown渲染
- **兼容性**: 支持现代浏览器（Chrome 60+, Firefox 55+, Safari 12+）

### Git工作流
- **分支策略**: 简化的工作流，使用main分支
- **提交约定**: 使用清晰的提交信息，描述变更内容
- **文件管理**: 直接编辑静态文件，无需构建步骤

## 领域上下文

### 故事结构
每个故事文件使用Markdown格式，包含：
- 第一行：故事主标题（以#开头）
- 第二行：故事副标题（简短描述）
- 第三行及以后：故事正文内容

### 现有故事列表
1. **小老鼠与太阳石莓果** (`the_little_mouse_and_the_sunstone_berry.md`)
2. **聪明的狐狸** (`the_clever_fox.md`)
3. **勇敢的小刺猬波奇** (`the_brave_hedgehog.md`)
4. **爱唱歌的百灵鸟丽丽** (`the_singing_lark.md`)

### 视觉设计主题
- **色彩**: 羊皮纸色调背景 (#fdf6e3)
- **字体**: 经典衬线字体营造童话氛围
- **布局**: 左右分栏（侧边栏 + 主内容区）
- **动效**: 平滑的过渡动画和悬停效果

## 重要约束

### 技术约束
- **纯静态**: 无服务器端逻辑，所有功能依赖客户端JavaScript
- **无依赖管理**: 不使用包管理器，直接通过CDN引入外部库
- **浏览器安全**: 受CORS策略限制，需要通过HTTP服务器访问（不能直接双击打开）

### 内容约束
- **编码**: 所有文件必须使用UTF-8编码
- **Markdown**: 严格遵循故事文件格式（前两行为标题和副标题）
- **图片**: 目前不支持故事内嵌图片（可扩展）

### 性能约束
- **资源加载**: 通过CDN加载外部资源，需网络连接
- **加载策略**: 使用fetch API异步加载故事内容
- **缓存**: 依赖浏览器HTTP缓存机制

## 外部依赖

### CDN依赖
- **Tailwind CSS**: v3.x (样式框架)
  - 用途: 快速响应式布局和基础样式
  - 替代方案: 可迁移至本地CSS文件

- **Marked.js**: v12.x (Markdown解析器)
  - 用途: 将Markdown文本转换为HTML
  - 替代方案: 其他Markdown解析器如 `markdown-it`

- **Google Fonts**: (网络字体)
  - 用途: Cinzel Decorative (标题) 和 EB Garamond (正文)
  - 替代方案: 系统字体或本地字体文件

### 文件依赖
- **stories.json**: 故事列表配置文件
  - 用途: 定义故事标题和文件名映射
  - 格式: JSON数组，每个元素包含title和file字段

## 功能特性

### 已实现功能
1. **动态故事列表**: 根据stories.json自动生成侧边栏导航
2. **内容切换**: 点击故事名称动态加载并显示内容
3. **平滑过渡**: 故事切换时的淡入淡出效果
4. **响应式布局**: 适配不同屏幕尺寸
5. **Markdown渲染**: 自动解析并渲染故事内容
6. **视觉主题**: 童话风格的视觉设计
7. **AI故事生成**: 🤖 使用 OpenAI 兼容 API 生成个性化童话故事

### AI 生成故事功能
- **API 配置**: 支持配置 OpenAI、OpenRouter、Ollama 等 OpenAI 兼容 API
- **模型选择**: 自动获取并展示可用模型列表
- **提示词模板**: 提供5个预设故事主题模板快速开始
- **故事生成**: 输入提示词即可生成完整童话故事
- **故事保存**: 生成的故事可下载为 .md 文件
- **本地存储**: API 配置保存在浏览器本地，刷新后自动恢复

### 核心JavaScript功能
- `initialize()`: 初始化应用，加载故事列表
- `loadStory(fileName)`: 异步加载指定故事文件
- `fetchModels()`: 获取 API 模型列表
- `generateBtn.addEventListener()`: 处理故事生成事件
- 事件监听: 处理故事列表点击、AI功能等事件
- 错误处理: 网络请求失败的用户提示
- localStorage: API 配置持久化

## 目录结构

```
/Users/songchaoping/Code/Python/novel/
├── index.html                      # 主页面
├── stories.json                    # 故事列表配置
├── story/                          # 故事文件目录
│   ├── the_brave_hedgehog.md
│   ├── the_clever_fox.md
│   ├── the_little_mouse_and_the_sunstone_berry.md
│   └── the_singing_lark.md
└── openspec/                       # OpenSpec项目
    ├── project.md                  # 项目文档
    ├── AGENTS.md                  # AI助手指令
    └── ...                        # 其他OpenSpec文件
```

## 扩展指南

### 添加新故事
1. 在`story/`目录创建新的`.md`文件
2. 遵循Markdown格式：第一行为标题，第二行为副标题
3. 在`stories.json`中添加条目：`{"title": "故事标题", "file": "文件名.md"}`

### AI 功能使用指南
#### 1. 配置 API
1. 点击页面右上角"🤖 AI 生成故事"按钮
2. 在弹出的设置面板中填写：
   - **API Base URL**: 你的 API 基础地址（如 `https://api.openai.com`、`https://openrouter.ai/api`）
   - **API Key**: 你的 API 密钥
3. 点击"保存"按钮

#### 2. 选择模型
1. 在故事生成对话框中点击"🔄 刷新"按钮
2. 从下拉菜单中选择可用的模型

#### 3. 生成故事
1. 在提示词输入框中描述你想要的故事
2. 或点击预设模板快速开始
3. 点击"✨ 生成故事"按钮
4. 等待故事生成完成

#### 4. 保存故事
1. 在结果预览区域查看生成的故事
2. 可以编辑内容（支持直接修改）
3. 点击"💾 保存故事"按钮下载为 .md 文件
4. 将文件放入 `story/` 目录
5. 在 `stories.json` 中添加新条目即可在网站中查看

#### 支持的 API 提供商
- **OpenAI**: `https://api.openai.com`
- **OpenRouter**: `https://openrouter.ai/api`
- **Ollama** (本地): `http://localhost:11434`
- **其他 OpenAI 兼容 API**

#### 安全说明
- API 密钥仅保存在浏览器本地存储中
- 不会传输到任何第三方服务器
- 建议定期更换 API 密钥
- 避免在公共设备上使用

### 修改样式
- 主要样式定义在`index.html`的`<style>`标签内
- 使用CSS自定义属性管理颜色主题
- 响应式断点：移动端(<768px)、平板(768px-1024px)、桌面(>1024px)

### 功能扩展建议
1. **搜索功能**: 添加故事内容搜索
2. **书签功能**: 记住上次阅读位置
3. **阅读进度**: 显示阅读进度条
4. **主题切换**: 提供多种视觉主题
5. **字体大小**: 可调节阅读字体大小
6. **离线支持**: 添加Service Worker实现离线访问

## 部署说明

### 开发环境
- 使用任意HTTP服务器运行项目
- 推荐: `python -m http.server 8000` 或 `npx serve`

### 生产环境
- 可部署到任何静态网站托管服务
- 示例: GitHub Pages, Netlify, Vercel
- 确保正确配置MIME类型（.md文件为text/plain或text/markdown）

## 维护要点

### 定期检查
- CDN链接可用性
- Markdown语法正确性
- 响应式布局兼容性
- 浏览器控制台错误

### 版本更新
- 外部依赖版本更新（Tailwind CSS, Marked.js）
- 浏览器兼容性测试
- 性能优化评估
