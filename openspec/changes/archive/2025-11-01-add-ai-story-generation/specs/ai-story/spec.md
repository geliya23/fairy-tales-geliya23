## ADDED Requirements

### Requirement: AI 故事生成配置
The system SHALL provide a user interface that allows users to configure OpenAI-compatible API endpoint information, including baseurl and apikey.

#### Scenario: 配置 API 设置
- **WHEN** 用户点击"AI 生成故事"按钮并打开设置面板
- **THEN** 系统显示输入框供用户填写 baseurl 和 apikey

#### Scenario: 保存配置
- **WHEN** 用户填写完 API 信息并点击保存
- **THEN** 系统必须将配置保存到 localStorage 并关闭设置面板

#### Scenario: 清除配置
- **WHEN** 用户点击"清除配置"按钮
- **THEN** 系统必须删除本地存储的 API 配置信息

### Requirement: 模型列表获取
The system SHALL allow users to retrieve available model lists from the configured API endpoint and select models.

#### Scenario: 获取模型列表
- **WHEN** 用户配置完 API 并打开故事生成对话框
- **THEN** 系统必须自动调用 /models 端点获取模型列表并填充下拉菜单

#### Scenario: 加载失败处理
- **WHEN** /models 端点调用失败（网络错误或认证失败）
- **THEN** 系统必须显示错误提示并提供重试按钮

#### Scenario: 手动刷新模型列表
- **WHEN** 用户点击"刷新模型"按钮
- **THEN** 系统必须重新调用 /models 端点并更新下拉菜单

### Requirement: AI 故事生成
The system SHALL allow users to generate complete fairy tales by inputting prompts to AI.

#### Scenario: 生成故事成功
- **WHEN** 用户输入提示词、选择模型并点击生成按钮
- **THEN** 系统必须调用 AI API 生成完整故事并显示在预览区域

#### Scenario: 流式生成显示
- **WHEN** API 返回流式响应
- **THEN** 系统必须实时显示生成的内容，逐字追加到预览区域

#### Scenario: 非流式生成
- **WHEN** API 返回完整响应
- **THEN** 系统必须显示加载状态，完成后一次性展示完整故事

#### Scenario: 生成失败处理
- **WHEN** API 调用失败（错误状态码、网络错误等）
- **THEN** 系统必须显示具体错误信息并允许用户重试

### Requirement: 故事保存与集成
The system SHALL allow users to save generated stories and integrate them into the existing story system.

#### Scenario: 保存生成的故事
- **WHEN** 用户对生成的故事满意并点击保存
- **THEN** 系统必须创建新的 .md 文件并添加到 stories.json

#### Scenario: 故事格式验证
- **WHEN** 保存故事时
- **THEN** 系统必须检查故事格式（第一行标题、第二行副标题、正文内容）

#### Scenario: 编辑后保存
- **WHEN** 用户修改生成的故事内容后保存
- **THEN** 系统必须保存修改后的内容

#### Scenario: 取消保存
- **WHEN** 用户点击取消按钮
- **THEN** 系统必须关闭对话框且不保存任何内容

### Requirement: 用户体验优化
The system SHALL provide smooth user experience and clear feedback.

#### Scenario: 加载状态显示
- **WHEN** 正在进行 API 调用
- **THEN** 系统必须显示加载动画和进度指示器

#### Scenario: 提示词模板
- **WHEN** 用户打开故事生成对话框
- **THEN** 系统必须提供预设的故事主题模板供快速选择

#### Scenario: 本地配置持久化
- **WHEN** 用户再次访问网站
- **THEN** 系统必须自动加载之前保存的 API 配置
