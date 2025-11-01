# github-cloud-storage Specification

## Purpose
TBD - created by archiving change integrate-github-storage. Update Purpose after archive.
## Requirements
### Requirement: GitHub仓库自动创建
The system SHALL automatically create a GitHub repository when saving stories if the repository does not exist.

#### Scenario: 仓库不存在时自动创建
- **GIVEN** 用户配置了GitHub Token且仓库不存在
- **WHEN** 用户点击"保存故事"按钮
- **THEN** 系统必须自动创建名为 `fairy-tales-geliya23` 的公开仓库
- **AND** 系统必须初始化仓库基础文件结构（stories.json, story/目录）

#### Scenario: 仓库已存在
- **GIVEN** 仓库已存在
- **WHEN** 用户点击"保存故事"按钮
- **THEN** 系统必须跳过创建步骤，直接保存故事文件

### Requirement: GitHub Token管理
The system SHALL securely manage GitHub Personal Access Token for API authentication.

#### Scenario: Token配置
- **GIVEN** 用户首次使用云存储功能
- **WHEN** 用户输入GitHub Token并点击保存
- **THEN** 系统必须将Token保存到localStorage并验证Token有效性

#### Scenario: Token验证
- **GIVEN** 已配置Token
- **WHEN** 系统需要调用GitHub API
- **THEN** 系统必须使用Token进行身份验证

#### Scenario: Token权限检查
- **GIVEN** 用户已配置Token
- **WHEN** Token权限不足时
- **THEN** 系统必须显示错误提示，要求用户配置具有`repo`权限的Token

### Requirement: 故事云端保存
The system SHALL save AI-generated stories directly to GitHub repository without manual file management.

#### Scenario: 保存新故事
- **GIVEN** 用户已生成故事内容且Token有效
- **WHEN** 用户点击"保存故事"按钮
- **THEN** 系统必须创建新文件：`story/ai_generated_story_[timestamp].md`
- **AND** 文件内容必须包含完整的markdown格式故事

#### Scenario: 文件内容格式
- **GIVEN** 用户保存故事
- **WHEN** 创建故事文件时
- **THEN** 文件内容必须是：
  - 第1行：故事标题（`# 标题`格式）
  - 第2行：副标题描述
  - 第3行开始：故事正文内容

#### Scenario: 保存成功反馈
- **GIVEN** 故事文件保存成功
- **WHEN** 保存操作完成
- **THEN** 系统必须显示"故事已保存到GitHub"提示
- **AND** 显示GitHub Pages链接（30秒后可访问）

### Requirement: 自动更新故事列表
The system SHALL automatically update stories.json to include newly saved stories.

#### Scenario: 更新stories.json
- **GIVEN** 用户保存新故事
- **WHEN** 故事文件创建成功后
- **THEN** 系统必须更新stories.json文件，添加新故事条目

#### Scenario: stories.json格式
- **GIVEN** 更新stories.json
- **WHEN** 添加新故事时
- **THEN** 必须包含以下字段：
  - `title`: 故事标题
  - `file`: 文件名（`story/文件名.md`格式）

#### Scenario: 并发更新处理
- **GIVEN** 多个用户可能同时保存故事
- **WHEN** 更新stories.json时
- **THEN** 系统必须先获取现有文件SHA再进行更新，避免冲突

### Requirement: 故事列表云端加载
The system SHALL load story lists from GitHub repository when available, falling back to local files.

#### Scenario: 优先从GitHub加载
- **GIVEN** 用户打开网站
- **WHEN** 页面初始化时
- **THEN** 系统必须首先尝试从GitHub仓库加载stories.json
- **AND** 如果成功则使用GitHub的故事列表

#### Scenario: 降级到本地加载
- **GIVEN** GitHub API调用失败
- **WHEN** 无法从GitHub获取stories.json时
- **THEN** 系统必须降级到本地stories.json文件
- **AND** 显示"使用本地缓存"提示

#### Scenario: 全部失败处理
- **GIVEN** GitHub和本地文件都不可用
- **WHEN** 完全无法加载故事列表时
- **THEN** 系统必须显示错误页面，提示用户检查网络连接

### Requirement: GitHub Pages集成
The system SHALL enable automatic deployment via GitHub Pages for instant website updates.

#### Scenario: Pages部署状态
- **GIVEN** 故事已保存到GitHub
- **WHEN** 用户等待访问新故事时
- **THEN** 系统必须告知用户GitHub Pages需要30秒自动部署时间

#### Scenario: Pages访问链接
- **GIVEN** 故事保存成功
- **WHEN** 显示成功提示时
- **THEN** 系统必须提供GitHub Pages URL格式：`https://geliya23.github.io/fairy-tales-geliya23/`

### Requirement: 错误处理和用户反馈
The system SHALL provide clear error messages and recovery options when GitHub operations fail.

#### Scenario: 网络错误
- **GIVEN** 网络连接中断
- **WHEN** API调用失败时
- **THEN** 系统必须显示网络错误提示
- **AND** 提供"重试"按钮

#### Scenario: 认证失败
- **GIVEN** Token无效或已过期
- **WHEN** API返回401错误时
- **THEN** 系统必须显示"Token无效，请重新配置"提示
- **AND** 打开Token配置对话框

#### Scenario: API限流
- **GIVEN** GitHub API达到速率限制
- **WHEN** API返回429错误时
- **THEN** 系统必须显示"API调用过于频繁，请稍后重试"提示
- **AND** 显示建议等待时间

#### Scenario: 权限不足
- **GIVEN** Token缺少必要权限
- **WHEN** API返回403错误时
- **THEN** 系统必须显示"Token权限不足，请配置具有repo权限的Token"提示

### Requirement: UI增强
The system SHALL provide enhanced UI to indicate cloud storage status and operations.

#### Scenario: 保存按钮状态
- **GIVEN** 用户点击保存
- **WHEN** 正在执行保存操作时
- **THEN** 按钮必须显示加载状态
- **AND** 禁用按钮防止重复点击

#### Scenario: 云存储状态指示
- **GIVEN** 用户在故事列表页面
- **WHEN** 故事从GitHub加载时
- **THEN** 系统必须显示云朵图标表示云端同步状态

#### Scenario: 成功通知
- **GIVEN** 保存操作成功完成
- **WHEN** 操作完成后
- **THEN** 系统必须显示成功通知（3秒后自动消失）
- **AND** 通知内容包含"已保存到GitHub"和访问链接

### Requirement: 本地缓存机制
The system SHALL cache recently loaded data locally to improve performance and offline usability.

#### Scenario: 故事列表缓存
- **GIVEN** 从GitHub成功加载stories.json
- **WHEN** 数据加载完成后
- **THEN** 系统必须将数据缓存到localStorage
- **AND** 设置5分钟过期时间

#### Scenario: 使用缓存数据
- **GIVEN** 缓存数据未过期且网络不可用
- **WHEN** 页面加载时
- **THEN** 系统必须优先使用缓存数据
- **AND** 显示"使用离线缓存"提示

#### Scenario: 缓存更新
- **GIVEN** 网络恢复连接
- **WHEN** 缓存数据过期时
- **THEN** 系统必须自动从GitHub刷新数据
- **AND** 更新缓存内容

### Requirement: 跨设备同步
The system SHALL ensure saved stories are accessible from any device with the same GitHub Pages URL.

#### Scenario: 多设备访问
- **GIVEN** 设备A保存了故事
- **WHEN** 用户在设备B打开相同网站时
- **THEN** 设备B必须能够看到设备A保存的故事

#### Scenario: 同步延迟处理
- **GIVEN** 故事刚保存到GitHub
- **WHEN** 用户在另一设备立即访问时
- **THEN** 系统必须显示"同步中，请稍后查看"提示
- **AND** 自动在30秒后重试加载

