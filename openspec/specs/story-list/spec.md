# story-list Specification

## Purpose
Provides enhanced navigation and organization for the story list, including search, grouping, and collapse functionality to improve user experience when managing multiple stories.

## Requirements

### Requirement: 故事列表搜索功能
The system SHALL provide real-time search functionality that allows users to quickly filter the story list by entering keywords.

#### Scenario: 搜索匹配的故事
- **WHEN** 用户在搜索框中输入关键词
- **THEN** 系统必须即时隐藏不匹配的故事项，只显示标题包含关键词的故事

#### Scenario: 清空搜索
- **WHEN** 用户清空搜索框或删除所有关键词
- **THEN** 系统必须恢复显示完整的故事列表

#### Scenario: 无匹配结果
- **WHEN** 搜索关键词没有匹配的故事
- **THEN** 系统必须显示"未找到匹配故事"的提示信息

### Requirement: 故事分组显示
The system SHALL group and display stories by source, categorizing them into "Original Stories" and "AI-Generated Stories" groups.

#### Scenario: 原创故事分组
- **WHEN** 系统加载故事列表
- **THEN** 所有文件名不以"ai_generated_story_"开头的故事必须归类到"原创故事"分组

#### Scenario: AI生成故事分组
- **WHEN** 系统加载故事列表
- **THEN** 所有文件名以"ai_generated_story_"开头的故事必须归类到"AI生成故事"分组

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

### Requirement: 故事列表用户界面
The existing single-list display mode SHALL be enhanced to support search, grouping, and collapse functionality through a structured interface.

#### Scenario: 界面布局
- **WHEN** 用户查看故事列表区域
- **THEN** 必须显示搜索框在顶部，分组列表在下方，且保持1/3宽度的侧边栏布局

#### Scenario: 故事项显示
- **WHEN** 故事分组展开且未被搜索过滤
- **THEN** 每个故事项必须以列表项形式显示，包含标题和云端标识（对于AI生成的故事）

#### Scenario: 视觉层级
- **WHEN** 界面加载完成
- **THEN** 必须形成清晰的视觉层级：搜索框 → 分组标题(含计数) → 故事项 → 状态提示

#### Scenario: 保持现有交互
- **WHEN** 用户点击故事项
- **THEN** 必须保持原有的故事加载功能不变

#### Scenario: 云端标识保留
- **WHEN** 显示AI生成故事
- **THEN** 必须保留现有的"☁️"云端图标标识

### Requirement: 键盘导航支持
The system SHALL provide keyboard shortcuts for efficient navigation.

#### Scenario: 箭头键导航
- **WHEN** 用户按下上箭头或下箭头键（且焦点不在搜索框）
- **THEN** 系统必须选中上一个或下一个故事项，并自动滚动到可见区域

#### Scenario: ESC键功能
- **WHEN** 用户在搜索框中按ESC键
- **THEN** 系统必须清空搜索框并恢复显示所有故事

### Requirement: 平滑过渡动画
The system SHALL provide smooth transition animations for improved user experience.

#### Scenario: 分组展开动画
- **WHEN** 用户展开一个分组
- **THEN** 分组内容必须以平滑动画方式显示

#### Scenario: 分组折叠动画
- **WHEN** 用户折叠一个分组
- **THEN** 分组内容必须以平滑动画方式隐藏

### Requirement: 向后兼容性
The system SHALL maintain all existing functionality while adding new features.

#### Scenario: 故事加载保持不变
- **WHEN** 用户点击故事项
- **THEN** 故事加载行为必须与之前完全一致

#### Scenario: 云存储功能保持不变
- **WHEN** 用户使用GitHub云存储功能
- **THEN** 所有云存储相关功能必须继续正常工作

#### Scenario: AI生成功能保持不变
- **WHEN** 用户使用AI故事生成功能
- **THEN** 所有AI生成相关功能必须继续正常工作
