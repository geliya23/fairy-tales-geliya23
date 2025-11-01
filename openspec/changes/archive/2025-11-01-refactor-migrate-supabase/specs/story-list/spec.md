# Story List - Supabase Migration Specification

## Purpose
Updates the story list functionality to use Supabase as the primary data source, replacing the previous GitHub API and local file approach while maintaining all existing features (search, grouping, collapse).

## Related Capabilities
- **data-storage**: Provides the Supabase database backend
- **frontend-architecture**: Defines the simplified frontend structure

## MODIFIED Requirements

### Requirement: 故事列表用户界面
The existing single-list display mode SHALL be enhanced to load data from Supabase while maintaining all existing UI functionality.

#### Scenario: 从Supabase加载故事列表
- **GIVEN** 用户访问故事网站首页
- **WHEN** 页面开始初始化
- **THEN** 系统必须从Supabase查询stories表，获取所有故事的id、title、filename字段
- **AND** 按id升序排序后显示在界面上
- **AND** 保持1/3宽度的侧边栏布局

#### Scenario: 数据加载失败处理
- **GIVEN** 网络连接异常或Supabase服务不可用
- **WHEN** 系统尝试从Supabase加载数据
- **THEN** 系统必须记录错误信息
- **AND** 显示友好的错误提示给用户
- **AND** 尝试从本地stories.json降级加载
- **AND** 不得崩溃或显示空白页面

#### Scenario: 故事内容加载
- **GIVEN** 用户在故事列表中点击某个故事项
- **WHEN** 系统接收到点击事件
- **THEN** 必须根据filename从Supabase查询对应的stories记录
- **AND** 获取content字段的完整Markdown内容
- **AND** 将内容渲染并显示在主内容区域
- **AND** 如果Supabase失败，降级到本地文件story/${filename}.md

### Requirement: 故事列表搜索功能
The system SHALL provide real-time search functionality that filters Supabase-loaded data on the client side.

#### Scenario: 搜索匹配的故事
- **GIVEN** 已从Supabase加载的故事列表
- **WHEN** 用户在搜索框中输入关键词
- **THEN** 系统必须即时隐藏不匹配的故事项，只显示title字段包含关键词的故事
- **AND** 搜索在客户端执行，不调用API
- **AND** 搜索不区分大小写

#### Scenario: 清空搜索
- **WHEN** 用户清空搜索框或删除所有关键词
- **THEN** 系统必须恢复显示完整的故事列表

#### Scenario: 无匹配结果
- **WHEN** 搜索关键词没有匹配的故事
- **THEN** 系统必须显示"未找到匹配故事"的提示信息

### Requirement: 故事分组显示
The system SHALL group and display stories by source using Supabase data, categorizing them into "Original Stories" and "AI-Generated Stories" groups.

#### Scenario: 原创故事分组
- **WHEN** 系统从Supabase加载故事列表
- **THEN** 所有filename字段不以"ai_generated_story_"开头的故事必须归类到"原创故事"分组

#### Scenario: AI生成故事分组
- **WHEN** 系统从Supabase加载故事列表
- **THEN** 所有filename字段以"ai_generated_story_"开头的故事必须归类到"AI生成故事"分组

#### Scenario: 空分组处理
- **WHEN** 某个分组中没有故事
- **THEN** 系统不得显示该分组或显示"暂无故事"状态

### Requirement: 分组折叠/展开控制
The system SHALL allow users to collapse or expand each story group to manage visibility.

#### Scenario: 折叠分组
- **WHEN** 用户点击已展开分组的标题或折叠按钮
- **THEN** 系统必须隐藏该分组下的所有故事项，并显示展开按钮

#### Scenario: 展开分组
- **WHEN** 用户点击已折叠分组的标题或展开按钮
- **THEN** 系统必须显示该分组下的所有故事项，并显示折叠按钮

#### Scenario: 默认分组状态
- **WHEN** 页面首次加载
- **THEN** "原创故事"分组必须默认展开，"AI生成故事"分组必须默认折叠

### Requirement: 分组计数徽章
The system SHALL display the count of stories in each group beside the group title.

#### Scenario: 显示故事计数
- **WHEN** 分组中包含N个故事
- **THEN** 分组标题必须显示格式为"分组名称 (N)"的计数徽章

#### Scenario: 计数实时更新
- **WHEN** 用户搜索并过滤故事
- **THEN** 分组计数必须实时更新以反映当前可见的故事数量
- **AND** 计数基于客户端过滤结果，不调用API

## ADDED Requirements

### Requirement: 数据完整性验证
The system SHALL validate data integrity when loading from Supabase.

#### Scenario: 故事总数验证
- **GIVEN** 系统从Supabase加载数据完成
- **WHEN** 统计故事数量
- **THEN** 必须加载Exactly 12 stories from Supabase
- **AND** 如果数量不符，显示错误提示

#### Scenario: 内容完整性验证
- **GIVEN** 用户点击某个故事
- **WHEN** 加载故事内容
- **THEN** content字段MUST NOT be empty
- **AND** 内容长度必须大于100字符
- **AND** 如果验证失败，尝试从本地文件加载

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
