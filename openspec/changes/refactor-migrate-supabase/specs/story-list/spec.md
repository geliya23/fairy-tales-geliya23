# Story List - Supabase Migration Specification

## Purpose
Updates the story list functionality to use Supabase as the primary data source, replacing the previous GitHub API and local file approach while maintaining all existing features (search, grouping, collapse).

## Related Capabilities
- **data-storage**: Provides the Supabase database backend
- **frontend-architecture**: Defines the simplified frontend structure

## MODIFIED Requirements

### Requirement: 从Supabase加载故事列表
The system SHALL load the story list from Supabase database instead of local files or GitHub API.

#### Scenario: 页面加载时获取故事列表
- **GIVEN** 用户访问故事网站首页
- **WHEN** 页面开始初始化
- **THEN** 系统必须从Supabase查询stories表，获取所有故事的id、title、filename字段
- **AND** 按id升序排序后显示在界面上

#### Scenario: 数据加载失败处理
- **GIVEN** 网络连接异常或Supabase服务不可用
- **WHEN** 系统尝试从Supabase加载数据
- **THEN** 系统必须记录错误信息
- **AND** 显示友好的错误提示给用户
- **AND** 不得崩溃或显示空白页面

### Requirement: 故事内容加载
The system SHALL load individual story content from Supabase database instead of fetching markdown files.

#### Scenario: 点击故事加载内容
- **GIVEN** 用户在故事列表中点击某个故事项
- **WHEN** 系统接收到点击事件
- **THEN** 必须根据filename从Supabase查询对应的stories记录
- **AND** 获取content字段的完整Markdown内容
- **AND** 将内容渲染并显示在主内容区域

#### Scenario: 内容加载降级
- **GIVEN** Supabase查询失败或内容不存在
- **WHEN** 系统无法从Supabase获取故事内容
- **THEN** 系统必须尝试从本地文件加载作为降级方案
- **AND** 路径格式为 `story/${filename}`
- **AND** 读取对应的.md文件内容
- **AND** 如果降级也失败，显示错误提示

### Requirement: 故事分组显示
The system SHALL maintain the existing grouping logic while adapting to Supabase data structure.

#### Scenario: 按来源分组
- **GIVEN** 从Supabase加载的故事列表
- **WHEN** 系统渲染故事列表
- **THEN** 必须根据filename字段判断故事来源：
  - 以"ai_generated_story_"开头的归类到"AI生成故事"分组
  - 其他归类到"原创故事"分组

### Requirement: 实时搜索功能
The system SHALL maintain client-side search functionality, filtering the loaded Supabase data.

#### Scenario: 搜索过滤
- **GIVEN** 已从Supabase加载的故事列表
- **WHEN** 用户在搜索框输入关键词
- **THEN** 系统必须即时过滤故事列表
- **AND** 只显示title字段包含关键词的故事
- **AND** 搜索不区分大小写

### Requirement: 分组折叠/展开
The system SHALL maintain the existing collapse/expand functionality for groups.

#### Scenario: 折叠分组
- **GIVEN** 用户查看已展开的故事分组
- **WHEN** 用户点击分组标题的折叠按钮
- **THEN** 系统必须隐藏该分组下的所有故事
- **AND** 分组标题显示展开图标
- **AND** 用户状态必须持久化（本地存储）

#### Scenario: 展开分组
- **GIVEN** 用户查看已折叠的故事分组
- **WHEN** 用户点击分组标题的展开按钮
- **THEN** 系统必须显示该分组下的所有故事
- **AND** 分组标题显示折叠图标
- **AND** 用户状态必须持久化（本地存储）

## Performance Requirements

### 数据加载性能
- **页面初始加载**: 从Supabase获取故事列表的响应时间 MUST be less than 2 seconds
- **故事切换**: 点击故事后内容显示时间 MUST be less than 1 second
- **搜索响应**: 客户端过滤执行时间 MUST be less than 500 milliseconds

### 数据完整性
- **故事总数**: 系统 MUST load exactly 12 stories from Supabase
- **内容完整性**: 每个故事的内容 MUST match the corresponding .md file
- **标题一致性**: 所有故事标题 MUST be consistent with the original files

## Security Requirements

### 数据访问
- **只读访问**: 前端只能从Supabase读取数据，MUST NOT have write permissions
- **公共读取**: stories表 MUST be configured to allow public read access via RLS policy
- **API密钥**: anon public key MAY be exposed in frontend code but MUST be restricted to read operations

### 错误处理
- **敏感信息**: 错误日志 MUST NOT expose API keys or database credentials
- **降级保护**: 即使Supabase不可用，系统 MUST gracefully degrade without crashing

## Compatibility Requirements

### 浏览器支持
- **现代浏览器**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript特性**: 仅使用ES6+标准特性
- **API兼容性**: 使用标准的Fetch API和Supabase JavaScript客户端

### 响应式设计
- **桌面端**: 故事列表在左侧，内容区域在右侧
- **平板端**: 保持两栏布局，适配中等屏幕
- **移动端**: 故事列表可折叠，内容区域全屏显示
