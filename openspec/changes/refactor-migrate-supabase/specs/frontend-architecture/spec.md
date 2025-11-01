# Frontend Architecture - Simplified Structure Specification

## Purpose
Defines the simplified frontend architecture after removing complex GitHub integration, focusing on clean, maintainable code that solely handles story display using Supabase as the data source.

## Related Capabilities
- **story-list**: Consumes data from this architecture
- **data-storage**: Provides data via Supabase that this architecture consumes

## REMOVED Requirements

### Requirement: 删除GitHub API模块
The frontend SHALL not contain GitHub API integration code.

#### Scenario: 删除GitHubAPI类
- **GIVEN** 当前的index.html包含GitHubAPI类
- **WHEN** 执行架构重构
- **THEN** 必须完全删除GitHubAPI类及其所有方法

#### Scenario: 删除Token管理
- **GIVEN** 前端包含GitHub Token配置界面
- **WHEN** 执行架构重构
- **THEN** 必须删除Token输入、验证和存储相关代码

#### Scenario: 删除仓库管理功能
- **GIVEN** 前端包含GitHub仓库管理功能
- **WHEN** 执行架构重构
- **THEN** 必须删除创建仓库、检查状态等所有仓库操作代码

### Requirement: 删除AI生成模块
The frontend SHALL not contain AI story generation functionality.

#### Scenario: 删除AI生成界面
- **GIVEN** 前端包含AI故事生成表单和模态框
- **WHEN** 执行架构重构
- **THEN** 必须删除所有AI生成相关的UI组件

#### Scenario: 删除AI服务调用
- **GIVEN** 前端调用外部AI服务生成故事
- **WHEN** 执行架构重构
- **THEN** 必须删除AI服务调用代码和生成逻辑

## MODIFIED Requirements

### Requirement: 单一职责架构
The frontend SHALL follow single responsibility principle, with each module having a clearly defined purpose.

#### Scenario: 保留核心展示模块
- **GIVEN** 前端的基本展示功能
- **WHEN** 执行架构重构
- **THEN** 必须保留以下核心模块：
  - 故事列表渲染
  - 故事内容显示
  - 搜索和过滤
  - 分组和折叠功能
  - 响应式布局

#### Scenario: 添加Supabase集成模块
- **GIVEN** 需要从Supabase加载数据
- **WHEN** 执行架构重构
- **THEN** 必须新增以下模块：
  - Supabase客户端初始化
  - 数据库查询函数
  - 错误处理和降级机制
  - API响应处理

### Requirement: 代码量精简
The frontend code SHALL be significantly reduced while maintaining all core functionality.

#### Scenario: 代码量目标
- **GIVEN** 当前index.html文件（1443行）
- **WHEN** 完成架构重构
- **THEN** 最终代码量 MUST be approximately 400行
- **AND** 代码量减少 MUST be at least 72%

#### Scenario: 代码组织
- **GIVEN** 重构后的代码
- **WHEN** 分析代码结构
- **THEN** 代码MUST be分为以下部分：
  - HTML结构：~50行
  - CSS样式：~150行
  - JavaScript逻辑：~200行
  - 配置文件：~20行

### Requirement: 零配置使用
The frontend SHALL work without any user configuration or setup.

#### Scenario: 即开即用
- **GIVEN** 用户首次访问网站
- **WHEN** 页面加载完成
- **THEN** 用户MUST be able to：
  - 立即看到所有12个故事
  - 无需输入任何配置信息
  - 无需等待或设置
  - 直接开始浏览故事

### Requirement: 简化的数据流
The frontend SHALL have a simplified data flow from Supabase to UI.

#### Scenario: 数据加载流程
- **GIVEN** 页面初始化
- **WHEN** 开始加载数据
- **THEN** 数据流MUST be：
  1. 初始化Supabase客户端
  2. 调用stories表查询API
  3. 获取故事列表数据
  4. 转换为前端需要的格式
  5. 渲染到故事列表UI

#### Scenario: 内容加载流程
- **GIVEN** 用户点击故事项
- **WHEN** 需要加载故事内容
- **THEN** 数据流MUST be：
  1. 提取故事的filename
  2. 查询Supabase获取content
  3. 接收Markdown内容
  4. 使用marked.js转换为HTML
  5. 渲染到内容区域

#### Scenario: 降级流程
- **GIVEN** Supabase API调用失败
- **WHEN** 数据加载失败
- **THEN** 降级流程MUST be：
  1. 记录错误信息
  2. 尝试本地文件加载
  3. 读取story/{filename}
  4. 处理文件内容
  5. 正常显示（带降级提示）

### Requirement: 错误处理优化
The frontend SHALL provide clear, user-friendly error messages without exposing technical details.

#### Scenario: API错误处理
- **GIVEN** Supabase API返回错误
- **WHEN** 前端接收到错误响应
- **THEN** 系统MUST：
  - 记录详细错误到Console（供开发者调试）
  - 显示友好的用户提示（"数据加载失败，请稍后重试"）
  - 提供降级方案（本地文件）
  - 不暴露API密钥或数据库信息

#### Scenario: 网络错误处理
- **GIVEN** 网络连接中断
- **WHEN** HTTP请求失败
- **THEN** 系统MUST：
  - 检测网络错误类型
  - 显示网络连接提示
  - 提供重试按钮
  - 保持页面可交互状态

### Requirement: 保持现有功能
The frontend SHALL maintain all current user-facing features during the refactoring.

#### Scenario: 搜索功能保持
- **GIVEN** 用户依赖现有搜索功能
- **WHEN** 执行架构重构
- **THEN** 搜索功能MUST be：
  - 行为完全一致
  - 性能不降低
  - UI外观不变
  - 支持中英文关键词

#### Scenario: 分组显示保持
- **GIVEN** 故事按来源分组显示
- **WHEN** 执行架构重构
- **THEN** 分组功能MUST be：
  - 逻辑完全一致（AI生成 vs 原创）
  - 分组标题不变
  - 折叠/展开行为不变
  - 默认状态不变

#### Scenario: 响应式设计保持
- **GIVEN** 网站在不同设备上使用
- **WHEN** 执行架构重构
- **THEN** 响应式布局MUST be：
  - 在所有设备上正常工作
  - 断点设置不变
  - 移动端体验不降低
  - 触摸交互正常

#### Scenario: 视觉设计保持
- **GIVEN** 当前的视觉风格和主题
- **WHEN** 执行架构重构
- **THEN** 视觉设计MUST be：
  - 颜色方案不变
  - 字体设置不变
  - 动画效果不变
  - 整体风格保持一致

### Requirement: 性能优化
The frontend SHALL be optimized for fast loading and smooth interactions.

#### Scenario: 减少HTTP请求
- **GIVEN** 重构前多次API调用
- **WHEN** 优化数据加载
- **THEN** 系统MUST：
  - 合并故事列表查询（一次性获取）
  - 按需加载故事内容（点击时加载）
  - 避免重复请求相同数据

#### Scenario: 客户端过滤
- **GIVEN** 用户输入搜索关键词
- **WHEN** 执行搜索功能
- **THEN** 系统MUST：
  - 在客户端执行过滤（不使用API）
  - 响应时间 MUST be < 500ms
  - 支持实时搜索（无延迟）

## ADDED Requirements

### Requirement: Supabase集成
The frontend SHALL integrate with Supabase for data retrieval.

#### Scenario: 客户端初始化
- **GIVEN** 页面加载时
- **WHEN** 初始化Supabase客户端
- **THEN** 必须使用CDN引入的Supabase JavaScript客户端
- **AND** 配置正确的URL和anon key
- **AND** 创建客户端实例供后续使用

#### Scenario: 数据查询封装
- **GIVEN** 需要查询故事列表
- **WHEN** 调用查询函数
- **THEN** 必须封装Supabase API调用
- **AND** 处理查询参数和排序
- **AND** 统一错误处理
- **AND** 返回标准格式的数据

### Requirement: 降级保护
The frontend SHALL provide fallback to local files when Supabase is unavailable.

#### Scenario: 降级触发
- **GIVEN** Supabase API调用失败
- **WHEN** 网络错误、超时或服务不可用
- **THEN** 系统MUST自动切换到本地文件
- **AND** 不中断用户浏览体验
- **AND** 在Console记录降级日志

#### Scenario: 降级数据源
- **GIVEN** 使用降级方案
- **WHEN** 加载故事列表
- **THEN** 必须从本地stories.json加载
- **AND** 格式与Supabase数据保持一致
- **AND** 保持分组和搜索功能

#### Scenario: 降级内容加载
- **GIVEN** 使用降级方案
- **WHEN** 加载故事内容
- **THEN** 必须从本地story/{filename}.md加载
- **AND** 路径格式保持一致
- **AND** 内容格式保持一致

## Performance Requirements

### 加载性能
- **首次内容绘制**: < 1.5秒
- **完整页面加载**: < 3秒
- **故事列表显示**: < 1秒
- **故事内容切换**: < 800ms

### 交互性能
- **搜索响应**: < 500ms
- **分组折叠**: < 300ms
- **页面滚动**: 60fps流畅
- **动画效果**: 流畅无卡顿

## Security Requirements

### 敏感信息处理
- **API密钥**: anon key可以暴露，但受RLS保护
- **错误日志**: 不记录敏感信息
- **本地存储**: 不存储敏感数据
- **传输安全**: 所有API调用使用HTTPS

### 输入验证
- **搜索输入**: 防止XSS攻击
- **用户操作**: 验证所有输入
- **数据渲染**: 使用安全的方法（textContent而非innerHTML）

## Code Structure Specification

### 目录结构
```
项目根目录/
├── index.html          (重构后的主文件，~400行)
├── stories.json        (保留，降级数据源)
├── story/              (保留，.md文件，降级数据源)
└── README.md           (更新文档)
```

### HTML结构（约50行）
- DOCTYPE和语言声明
- Head部分（meta、title、CDN引入）
- Body主体结构（导航、内容区域、搜索框）
- Script标签（引入库和自定义代码）

### CSS样式（约150行）
- Tailwind CSS基础样式
- 自定义童话主题样式
- 响应式断点设置
- 故事列表和内容区域样式
- 搜索和分组功能样式

### JavaScript逻辑（约200行）
- Supabase配置和初始化（20行）
- 数据加载函数（40行）
  - loadStoriesList()
  - loadStoryContent()
  - handleApiError()
- 界面渲染函数（60行）
  - renderStoryList()
  - renderStoryContent()
  - filterStories()
  - toggleGroup()
- 事件监听器（40行）
  - 搜索框输入事件
  - 故事点击事件
  - 分组折叠事件
- 辅助函数（40行）
  - formatDate()
  - escapeHtml()
  - debounce()

### 配置文件（约20行）
- Supabase URL和API密钥
- 降级配置（本地文件路径）
- 性能参数（缓存设置）
