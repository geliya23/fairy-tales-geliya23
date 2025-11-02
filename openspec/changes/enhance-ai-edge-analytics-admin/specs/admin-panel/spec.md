# 管理后台规范

**能力名称**: `admin-panel`
**变更ID**: `enhance-ai-edge-analytics-admin`

## 目的

创建功能完整的管理后台界面，提供数据分析、内容管理和系统监控能力，提升运营效率。

## ADDED Requirements

### Requirement: The system SHALL create admin panel pages

The system SHALL create a separate admin panel page.

#### Scenario: 创建 admin.html
- **GIVEN** 项目根目录
- **WHEN** 创建 `admin.html` 文件
- **THEN** 必须包含：
  - 响应式布局（侧边栏 + 主内容区）
  - 导航菜单
  - 数据可视化组件
  - 管理功能界面

#### Scenario: 页面结构
- **GIVEN** 访问 `admin.html`
- **WHEN** 页面加载完成
- **THEN** 显示以下区域：
  - 顶部导航栏：显示标题和用户信息
  - 左侧导航：菜单项（Dashboard、分析、内容、设置）
  - 主内容区：动态加载不同页面内容
  - 底部版权信息

#### Scenario: 响应式设计
- **GIVEN** 不同屏幕尺寸
- **WHEN** 页面自适应
- **THEN** 必须支持：
  - 桌面端（>1024px）：侧边栏固定显示
  - 平板端（768-1024px）：侧边栏可折叠
  - 手机端（<768px）：侧边栏隐藏，顶部汉堡菜单

### Requirement: The system SHALL verify admin identity

The system SHALL verify administrator identity to ensure only authorized users can access.

#### Scenario: 登录页面
- **GIVEN** 未认证用户访问管理后台
- **WHEN** 检测到未认证
- **THEN** 显示登录表单：
  - 用户名/邮箱输入框
  - 密码输入框
  - 登录按钮
  - "记住我"复选框

#### Scenario: 使用 Supabase Auth
- **GIVEN** 用户输入凭据
- **WHEN** 点击登录
- **THEN** 系统必须：
  1. 调用 `supabase.auth.signInWithPassword()`
  2. 验证凭据
  3. 成功后跳转到 Dashboard
  4. 失败时显示错误信息

#### Scenario: 会话管理
- **GIVEN** 用户已登录
- **WHEN** 访问管理后台
- **THEN** 自动检查会话：
  - 会话有效：直接进入
  - 会话过期：跳转到登录页
  - 令牌刷新：自动续期

#### Scenario: 退出登录
- **GIVEN** 管理员点击退出
- **WHEN** 确认退出
- **THEN** 系统必须：
  1. 调用 `supabase.auth.signOut()`
  2. 清除本地存储
  3. 跳转到登录页

#### Scenario: 权限控制
- **GIVEN** 非管理员用户尝试访问
- **WHEN** 检查用户角色
- **THEN** 必须拒绝访问并返回 403 错误

### Requirement: The admin dashboard SHALL provide key metrics overview

The admin dashboard homepage SHALL provide a key metrics overview.

#### Scenario: 显示关键指标
- **GIVEN** 管理员登录成功
- **WHEN** 进入 Dashboard
- **THEN** 显示卡片式指标：
  - 故事总数：来自 `stories` 表的 COUNT
  - 总阅读量：来自 `story_reads` 表的 COUNT
  - 今日阅读：今日新增阅读记录
  - AI 生成故事数：AI 生成的故事数量

#### Scenario: 趋势图表
- **GIVEN** Dashboard 加载
- **WHEN** 获取统计数据
- **THEN** 显示折线图：
  - X 轴：日期（最近 30 天）
  - Y 轴：阅读量
  - 数据点：每日阅读次数
  - 使用 Chart.js 实现

#### Scenario: 热门故事列表
- **GIVEN** 数据加载完成
- **WHEN** 显示热门故事
- **THEN** 显示表格：
  - 故事标题
  - 阅读次数
  - 唯一读者数
  - 平均阅读时长（可选）
  - 趋势图标（上升/下降）

#### Scenario: 最近活动
- **GIVEN** 需要显示最新操作
- **WHEN** 查询活动日志
- **THEN** 显示列表：
  - 新增故事
  - AI 生成故事
  - 编辑操作
  - 时间戳

### Requirement: The system SHALL provide detailed analytics

The system SHALL provide detailed analytics functionality.

#### Scenario: 时间范围选择
- **GIVEN** 进入分析页面
- **WHEN** 选择时间范围
- **THEN** 提供预设选项：
  - 今天
  - 最近 7 天
  - 最近 30 天
  - 最近 90 天
  - 自定义范围（日期选择器）

#### Scenario: 阅读趋势分析
- **GIVEN** 时间范围已选择
- **WHEN** 加载图表数据
- **THEN** 显示多种图表：
  - 折线图：每日阅读量趋势
  - 柱状图：每小时阅读分布
  - 面积图：累积阅读量
- **AND** 支持图表类型切换

#### Scenario: 故事表现分析
- **GIVEN** 需要分析单个故事
- **WHEN** 选择故事
- **THEN** 显示详细信息：
  - 总阅读次数
  - 唯一读者数
  - 平均阅读时间
  - 跳出率
  - 来源分析

#### Scenario: 用户行为分析
- **GIVEN** 分析用户行为
- **WHEN** 查看数据
- **THEN** 显示：
  - 用户留存率
  - 热门阅读时段
  - 访问来源分析
  - 设备类型分布

#### Scenario: 数据导出
- **GIVEN** 需要导出数据
- **WHEN** 点击导出按钮
- **THEN** 生成 CSV 或 Excel 文件：
  - 包含选定时间范围的所有数据
  - 字段：日期、故事ID、标题、阅读数等
  - 文件名：analytics_{start_date}_{end_date}.csv

### Requirement: The system SHALL allow content management

The system SHALL allow administrators to manage story content.

#### Scenario: 故事列表
- **GIVEN** 进入内容管理页面
- **WHEN** 加载故事列表
- **THEN** 显示表格：
  - 复选框（批量操作）
  - 故事标题
  - 文件名
  - 创建时间
  - 更新时间
  - 操作按钮（编辑、删除、查看）

#### Scenario: 搜索和筛选
- **GIVEN** 大量故事
- **WHEN** 搜索故事
- **THEN** 实时搜索：
  - 按标题搜索
  - 按内容搜索
  - 按创建时间筛选
  - 按故事类型筛选（如有）

#### Scenario: 分页显示
- **GIVEN** 故事数量超过 20 个
- **WHEN** 显示列表
- **THEN** 分页导航：
  - 每页 20 条记录
  - 显示页码
  - 上一页/下一页按钮
  - 总数统计

#### Scenario: 批量操作
- **GIVEN** 选中多个故事
- **WHEN** 点击批量操作
- **THEN** 支持：
  - 批量删除（需确认）
  - 批量导出
  - 批量标记（如：精选、推荐）

#### Scenario: 创建新故事
- **GIVEN** 点击"新增故事"
- **WHEN** 打开创建表单
- **THEN** 提供输入框：
  - 故事标题（必填）
  - 故事副标题（可选）
  - 故事内容（Markdown 编辑器）
  - 保存草稿/发布选项

#### Scenario: 编辑故事
- **GIVEN** 点击编辑按钮
- **WHEN** 打开编辑页面
- **THEN** 显示：
  - 预填充现有内容
  - Markdown 编辑器
  - 实时预览
  - 保存更改按钮
  - 取消按钮

#### Scenario: 删除故事
- **GIVEN** 点击删除按钮
- **WHEN** 确认删除
- **THEN** 执行删除：
  1. 显示确认对话框
  2. 从数据库删除记录
  3. 从 `story_reads` 表删除相关记录（CASCADE）
  4. 显示成功消息

#### Scenario: AI 故事生成集成
- **GIVEN** 在管理后台
- **WHEN** 点击"AI 生成"
- **THEN** 弹出对话框：
  - 提示词输入框
  - 模型选择下拉菜单
  - 生成按钮
  - 进度指示器
- **AND** 生成后可直接保存到数据库

### Requirement: The system SHALL provide configuration settings

The system SHALL provide configuration and settings functionality.

#### Scenario: API 配置
- **GIVEN** 进入设置页面
- **WHEN** 查看 API 设置
- **THEN** 显示配置项：
  - OpenAI API Key（加密存储）
  - OpenAI Base URL
  - 默认模型
  - 连接测试按钮

#### Scenario: 数据保留设置
- **GIVEN** 数据管理
- **WHEN** 配置保留策略
- **THEN** 提供选项：
  - 阅读数据保留天数（30-365 天）
  - 自动清理开关
  - 清理频率设置

#### Scenario: 系统信息
- **GIVEN** 查看系统状态
- **WHEN** 加载信息
- **THEN** 显示：
  - Supabase 项目信息
  - 数据库大小
  - Edge Functions 状态
  - 最后更新时间

#### Scenario: 备份和恢复
- **GIVEN** 数据备份需求
- **WHEN** 访问备份功能
- **THEN** 提供：
  - 导出所有故事（JSON/Markdown）
  - 导出统计数据（CSV）
  - 导入功能（上传文件）

### Requirement: The system SHALL provide smooth admin experience

The system SHALL provide a smooth management experience.

#### Scenario: 加载状态
- **GIVEN** 异步操作
- **WHEN** 等待响应
- **THEN** 显示加载动画：
  - 按钮内 spinner
  - 页面级加载指示器
  - 进度条（长时间操作）

#### Scenario: 消息提示
- **GIVEN** 操作完成或失败
- **WHEN** 需要反馈
- **THEN** 显示提示：
  - 成功消息（绿色）
  - 错误消息（红色）
  - 警告消息（黄色）
  - 信息消息（蓝色）

#### Scenario: 确认对话框
- **GIVEN** 危险操作
- **WHEN** 执行前
- **THEN** 显示确认：
  - 操作说明
  - 可能的后果
  - 确认按钮
  - 取消按钮

#### Scenario: 键盘快捷键
- **GIVEN** 提升效率
- **WHEN** 使用键盘
- **THEN** 支持快捷键：
  - `Ctrl/Cmd + S`: 保存
  - `Ctrl/Cmd + N`: 新建
  - `Esc`: 关闭对话框
  - `/`: 聚焦搜索框

#### Scenario: 深色模式（可选）
- **GIVEN** 用户偏好
- **WHEN** 切换主题
- **THEN** 支持：
  - 亮色模式（默认）
  - 深色模式
  - 系统自动切换
  - 用户选择持久化

### Requirement: The system SHALL ensure admin panel security

The system SHALL ensure admin panel security.

#### Scenario: CSRF 保护
- **GIVEN** 表单提交
- **WHEN** 防止 CSRF 攻击
- **THEN** 使用：
  - Supabase JWT 令牌
  - 请求签名验证
  - SameSite Cookie 设置

#### Scenario: SQL 注入防护
- **GIVEN** 用户输入
- **WHEN** 处理输入
- **THEN** 使用：
  - 参数化查询
  - 输入验证和清理
  - 白名单验证

#### Scenario: XSS 防护
- **GIVEN** 显示用户内容
- **WHEN** 渲染内容
- **THEN** 转义 HTML：
  - 使用 `textContent` 而非 `innerHTML`
  - Markdown 安全渲染
  - 内容过滤

#### Scenario: 审计日志
- **GIVEN** 管理员操作
- **WHEN** 记录日志
- **THEN** 记录：
  - 操作类型
  - 操作者
  - 时间戳
  - IP 地址
  - 变更详情

## 实现细节

### 技术栈
- **HTML5 + CSS3 + JavaScript**
- **Tailwind CSS**（样式框架）
- **Chart.js**（图表库）
- **Supabase Auth**（认证）
- **Supabase Client**（数据库访问）

### 页面结构

```
admin.html
├── 头部导航栏
├── 侧边栏导航
│   ├── Dashboard
│   ├── 数据分析
│   ├── 内容管理
│   └── 系统设置
├── 主内容区
│   ├── 动态路由加载
│   └── 页面组件
└── 页脚
```

### API 集成

#### 认证相关
- `supabase.auth.signInWithPassword()`
- `supabase.auth.signOut()`
- `supabase.auth.getSession()`

#### 数据访问
- `supabase.from('stories').select()`
- `supabase.from('story_reads').select()`
- `supabase.from('stories').insert()`
- `supabase.from('stories').update()`
- `supabase.from('stories').delete()`

### 文件结构

```
/admin.html                    # 管理后台主页面
├── styles/
│   └── admin.css             # 管理后台专用样式
├── scripts/
│   ├── auth.js              # 认证逻辑
│   ├── dashboard.js         # Dashboard 页面
│   ├── analytics.js         # 数据分析
│   ├── content.js           # 内容管理
│   └── settings.js          # 系统设置
└── components/
    ├── sidebar.js           # 侧边栏组件
    ├── modal.js             # 模态框组件
    └── chart.js             # 图表组件
```

## 成功标准

1. ✅ admin.html 页面正常加载
2. ✅ 管理员认证正常工作
3. ✅ Dashboard 显示关键指标
4. ✅ 数据分析图表正常渲染
5. ✅ 内容管理 CRUD 操作成功
6. ✅ 系统设置功能完整
7. ✅ 响应式设计适配各设备
8. ✅ 所有操作有用户反馈
9. ✅ 安全性检查通过
10. ✅ 页面加载速度 < 2 秒
