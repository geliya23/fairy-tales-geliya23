# frontend-architecture Specification

## Purpose
TBD - created by archiving change refactor-migrate-supabase. Update Purpose after archive.
## Requirements
### Requirement: 简化前端架构
The frontend SHALL implement a simplified, single-responsibility architecture focused solely on story display.

#### Scenario: 核心展示模块
- **GIVEN** 用户访问网站
- **WHEN** 页面加载
- **THEN** 系统MUST提供以下核心模块：
  - 故事列表渲染
  - 故事内容显示
  - 搜索和过滤
  - 分组和折叠功能
  - 响应式布局

#### Scenario: Supabase集成模块
- **GIVEN** 需要从数据库加载故事数据
- **WHEN** 页面初始化
- **THEN** 系统MUST包含以下组件：
  - Supabase客户端初始化
  - 数据库查询函数
  - 错误处理和降级机制
  - API响应处理

#### Scenario: 无GitHub依赖
- **GIVEN** 简化的前端架构
- **WHEN** 代码审查
- **THEN** 系统MUST NOT包含：
  - GitHub API集成代码
  - GitHub Token管理功能
  - 仓库操作功能
  - AI生成相关UI或逻辑

### Requirement: 代码量精简
The frontend code SHALL be significantly reduced while maintaining all core functionality.

#### Scenario: 代码量目标
- **GIVEN** 完成架构重构
- **WHEN** 统计代码行数
- **THEN** 总代码量 MUST be approximately 400行
- **AND** 比原有1443行减少至少72%

#### Scenario: 代码组织结构
- **GIVEN** 重构后的代码
- **WHEN** 分析结构
- **THEN** 代码MUST分为以下部分：
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

### Requirement: Supabase数据流
The frontend SHALL have a simplified data flow from Supabase to UI.

#### Scenario: 数据加载流程
- **GIVEN** 页面初始化
- **WHEN** 开始加载数据
- **THEN** 数据流MUST遵循以下步骤：
  1. 初始化Supabase客户端
  2. 调用stories表查询API
  3. 获取故事列表数据
  4. 转换为前端需要的格式
  5. 渲染到故事列表UI

#### Scenario: 内容加载流程
- **GIVEN** 用户点击故事项
- **WHEN** 需要加载故事内容
- **THEN** 数据流MUST遵循以下步骤：
  1. 提取故事的filename
  2. 查询Supabase获取content
  3. 接收Markdown内容
  4. 使用marked.js转换为HTML
  5. 渲染到内容区域

#### Scenario: 降级流程
- **GIVEN** Supabase API调用失败
- **WHEN** 数据加载失败
- **THEN** 系统MUST自动切换到本地文件：
  1. 记录错误信息到Console
  2. 尝试从stories.json加载列表
  3. 读取story/{filename}文件
  4. 正常显示内容
  5. 显示降级提示

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
The frontend SHALL maintain all current user-facing features.

#### Scenario: 搜索功能保持
- **GIVEN** 用户使用搜索功能
- **WHEN** 输入关键词
- **THEN** 搜索功能MUST：
  - 行为与原功能完全一致
  - 性能不降低
  - UI外观不变
  - 支持中英文关键词

#### Scenario: 分组显示保持
- **GIVEN** 故事列表显示
- **WHEN** 加载完成
- **THEN** 分组功能MUST：
  - 逻辑与原功能一致（AI生成 vs 原创）
  - 分组标题不变
  - 折叠/展开行为不变
  - 默认状态不变（原创展开，AI折叠）

#### Scenario: 响应式设计保持
- **GIVEN** 网站在不同设备上使用
- **WHEN** 访问网站
- **THEN** 响应式布局MUST：
  - 在所有设备上正常工作
  - 断点设置不变
  - 移动端体验不降低
  - 触摸交互正常

#### Scenario: 视觉设计保持
- **GIVEN** 当前的视觉风格
- **WHEN** 重构完成后
- **THEN** 视觉设计MUST：
  - 颜色方案保持不变
  - 字体设置保持不变
  - 动画效果保持不变
  - 整体风格保持一致

### Requirement: 性能优化
The frontend SHALL be optimized for fast loading and smooth interactions.

#### Scenario: 优化HTTP请求
- **GIVEN** 重构后的数据加载
- **WHEN** 页面访问
- **THEN** 系统MUST：
  - 合并故事列表查询（一次性获取）
  - 按需加载故事内容（点击时加载）
  - 避免重复请求相同数据

#### Scenario: 客户端过滤
- **GIVEN** 用户输入搜索关键词
- **WHEN** 执行搜索
- **THEN** 系统MUST：
  - 在客户端执行过滤（不使用API）
  - 响应时间 < 500ms
  - 支持实时搜索（无延迟）

#### Scenario: Supabase集成
- **GIVEN** 需要从Supabase加载数据
- **WHEN** 初始化客户端
- **THEN** 系统MUST：
  - 使用CDN引入的Supabase JavaScript客户端
  - 配置正确的URL和anon key
  - 封装Supabase API调用
  - 统一错误处理机制

#### Scenario: 降级保护机制
- **GIVEN** Supabase不可用
- **WHEN** API调用失败
- **THEN** 系统MUST：
  - 自动切换到本地文件
  - 从stories.json加载列表
  - 从story/{filename}.md加载内容
  - 在Console记录降级日志
  - 不中断用户浏览体验

