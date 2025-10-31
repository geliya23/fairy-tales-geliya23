# Project Context

## Purpose
这个项目是一个中文童话故事集网站，旨在为用户提供一个优雅的阅读平台，展示精心编写的中文童话故事。网站采用简洁的设计风格，让读者能够专注于故事内容，体验沉浸式的阅读乐趣。项目包含多个原创童话故事，每个故事都传达着勇气、智慧、善良等积极的人生价值观。

## Tech Stack
- **前端技术**: 纯 HTML5 + CSS3 + JavaScript (ES6+)
- **样式框架**: Tailwind CSS (CDN 版本)
- **Markdown 渲染**: marked.js 库
- **字体**: Google Fonts (Cinzel Decorative, EB Garamond)
- **数据存储**: JSON 配置文件
- **静态资源**: 在线纹理背景图片
- **架构模式**: 客户端单页应用 (SPA)

## Project Conventions

### Code Style
- **JavaScript**: 
  - 使用 ES6+ 现代语法（async/await、箭头函数、解构赋值）
  - 变量命名采用 camelCase 规范
  - 函数名采用描述性的动词命名
  - 添加适当的错误处理和用户反馈
- **HTML**:
  - 使用语义化标签
  - id 和 class 命名遵循语义化原则
  - 保持良好的层次结构
- **CSS**:
  - 采用 BEM 命名方法（虽然简化版本）
  - 优先使用 Tailwind CSS 工具类
  - 自定义样式遵循设计一致性原则

### Architecture Patterns
- **数据驱动**: 故事列表通过 JSON 配置文件动态生成
- **组件化思想**: 将 UI 分为故事列表和内容展示两个主要区域
- **事件驱动**: 使用事件监听器处理用户交互
- **异步加载**: 使用 Fetch API 异步加载故事内容
- **渐进式增强**: 支持逐步加载内容并提供加载状态反馈

### Testing Strategy
- **功能测试**: 验证故事加载、切换、渲染功能
- **兼容性测试**: 在主流浏览器中测试兼容性
- **用户体验测试**: 确保界面响应式设计和交互流畅性
- **性能测试**: 优化加载速度和渲染性能

### Git Workflow
- **分支策略**: 使用简单的 main 分支进行开发
- **提交规范**: 
  - feat: 新功能添加
  - fix: 问题修复
  - docs: 文档更新
  - style: 样式调整
  - refactor: 代码重构
- **文件组织**: 按功能模块分类管理文件

## Domain Context
**童话故事领域知识**:
- 故事主题涵盖勇气、智慧、善良、坚持等正面价值观
- 目标受众包括儿童和家长，注重教育意义
- 故事内容原创编写，具有寓教于乐的特点
- 支持中文内容展示和良好的阅读体验

**阅读体验设计**:
- 采用温暖的色调和优雅的字体营造童话氛围
- 支持 Markdown 格式的故事内容渲染
- 提供故事列表导航和内容切换功能
- 响应式设计适配不同设备屏幕

## Important Constraints
- **浏览器兼容性**: 需要支持现代浏览器（Chrome、Firefox、Safari、Edge）
- **性能要求**: 快速加载和流畅的用户交互
- **内容安全**: 确保故事内容适合目标受众
- **可访问性**: 考虑无障碍访问需求

## External Dependencies
- **CDN 服务**: 
  - Tailwind CSS: https://cdn.tailwindcss.com
  - marked.js: https://cdn.jsdelivr.net/npm/marked/marked.min.js
  - Google Fonts: https://fonts.googleapis.com
- **在线资源**: 
  - 背景纹理图案: toptal.com design patterns
  - 图标和装饰元素 (如需要)
- **外部 API**: 无
- **第三方服务**: 无

## Future Considerations
- 考虑添加故事搜索和分类功能
- 支持用户收藏和书签功能
- 考虑添加故事朗读功能
- 未来可能支持多语言版本
- 可考虑添加用户评论和互动功能
