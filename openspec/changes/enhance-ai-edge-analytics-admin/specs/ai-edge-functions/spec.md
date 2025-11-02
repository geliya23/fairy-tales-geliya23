# AI 边缘函数规范

**能力名称**: `ai-edge-functions`
**变更ID**: `enhance-ai-edge-analytics-admin`

## 目的

实现基于 Supabase Edge Functions 的 AI 故事生成服务端，提供安全、可扩展的故事创作能力。

## ADDED Requirements

### Requirement: Supabase Edge Functions 环境设置 SHALL be configured

The system SHALL create necessary Supabase Edge Functions directory structure and configuration files.

#### Scenario: 初始化 Edge Functions 项目
- **GIVEN** 开发者具有 Supabase CLI 访问权限
- **WHEN** 执行 `supabase init` 初始化项目
- **THEN** 创建 `supabase/functions/` 目录结构
- **AND** 生成 `supabase/config.toml` 配置文件

#### Scenario: 配置环境变量
- **GIVEN** Edge Functions 项目已初始化
- **WHEN** 在 Supabase Dashboard 设置环境变量
- **THEN** 必须配置以下变量：
  - `OPENAI_API_KEY`: OpenAI 兼容 API 密钥
  - `OPENAI_BASE_URL`: API 基础地址（默认：https://api.openai.com）
  - `OPENAI_MODEL`: 默认模型（默认：gpt-3.5-turbo）

### Requirement: The system SHALL provide generate-story Edge Function

The system SHALL provide a `generate-story` Edge Function that receives prompts and returns AI-generated stories.

#### Scenario: 成功生成故事
- **GIVEN** 用户发送 POST 请求到 `/functions/v1/generate-story`
- **WHEN** 请求体包含有效提示词（`prompt` 字段）
- **THEN** Edge Function 必须：
  1. 调用 OpenAI 兼容 API
  2. 生成完整的童话故事（包含标题、副标题、正文）
  3. 将故事保存到 `stories` 表
  4. 返回 JSON 响应：`{ id, title, content, filename }`

#### Scenario: 使用自定义模型
- **GIVEN** 用户请求生成故事
- **WHEN** 请求体包含 `model` 字段（如：gpt-4, claude-3）
- **THEN** Edge Function 必须使用指定的模型而非默认模型
- **AND** 如果模型不存在，返回错误：`{ error: { code: "INVALID_MODEL", message: "..." } }`

#### Scenario: 处理流式响应
- **GIVEN** OpenAI API 返回流式数据
- **WHEN** Edge Function 接收流式响应
- **THEN** 必须实时返回数据流到客户端
- **AND** 保持 SSE（Server-Sent Events）连接直到完成

#### Scenario: 处理非流式响应
- **GIVEN** OpenAI API 返回完整响应
- **WHEN** Edge Function 接收完整数据
- **THEN** 必须：
  1. 解析响应内容
  2. 提取标题、副标题、正文
  3. 格式化返回
  4. 关闭连接

#### Scenario: 验证输入参数
- **GIVEN** 用户发送无效请求
- **WHEN** 缺少 `prompt` 字段或为空
- **THEN** Edge Function 必须返回 400 错误：
  ```json
  {
    "error": {
      "code": "INVALID_INPUT",
      "message": "提示词不能为空",
      "details": { "field": "prompt" }
    }
  }
  ```

#### Scenario: API 密钥缺失
- **GIVEN** Edge Function 运行但未配置 API 密钥
- **WHEN** 尝试调用 OpenAI API
- **THEN** 必须返回 500 错误：
  ```json
  {
    "error": {
      "code": "CONFIGURATION_ERROR",
      "message": "AI API 密钥未配置"
    }
  }
  ```

#### Scenario: AI API 调用失败
- **GIVEN** 网络或服务异常
- **WHEN** 调用 OpenAI API 失败
- **THEN** Edge Function 必须：
  1. 记录错误日志
  2. 返回 502 错误：
  ```json
  {
    "error": {
      "code": "AI_GENERATION_FAILED",
      "message": "AI 服务暂不可用，请稍后重试"
    }
  }
  ```

#### Scenario: 数据库保存失败
- **GIVEN** 故事生成成功
- **WHEN** 保存到 Supabase 数据库失败
- **THEN** Edge Function 必须：
  1. 记录错误日志
  2. 返回 500 错误：
  ```json
  {
    "error": {
      "code": "DATABASE_ERROR",
      "message": "保存故事失败"
    }
  }
  ```

#### Scenario: 超时处理
- **GIVEN** AI API 响应缓慢
- **WHEN** 请求超时（30 秒）
- **THEN** Edge Function 必须：
  1. 中断请求
  2. 返回 504 错误：
  ```json
  {
    "error": {
      "code": "TIMEOUT",
      "message": "生成超时，请尝试简化提示词"
    }
  }
  ```

#### Scenario: 速率限制
- **GIVEN** 用户频繁请求
- **WHEN** 超过速率限制（每分钟 10 次）
- **THEN** Edge Function 必须返回 429 错误：
  ```json
  {
    "error": {
      "code": "RATE_LIMITED",
      "message": "请求过于频繁，请稍后再试",
      "details": { "retry_after": 60 }
    }
  }
  ```

### Requirement: The system SHALL validate story format

The system SHALL validate that generated stories conform to the standard format.

#### Scenario: 验证故事结构
- **GIVEN** AI 生成故事内容
- **WHEN** 解析响应内容
- **THEN** 必须验证：
  1. 第一行是标题（# 开头）
  2. 第二行是副标题（简短描述）
  3. 第三行及以后是正文内容
- **AND** 如果格式不符合，自动调整或返回错误

#### Scenario: 提取故事信息
- **GIVEN** 验证通过的故事内容
- **WHEN** 保存到数据库
- **THEN** 必须提取：
  - `title`: 第一行（去除 #）
  - `content`: 完整 Markdown 内容
  - `filename`: 时间戳 + 随机字符串（格式：`ai_story_{timestamp}_{random}.md`）

### Requirement: Edge Functions SHALL configure CORS

Edge Functions SHALL properly configure CORS to support cross-origin requests.

#### Scenario: 允许前端域名
- **GIVEN** Edge Function 部署完成
- **WHEN** 前端页面发送请求
- **THEN** 必须允许来自以下域名的请求：
  - `https://geliya23.github.io`
  - `http://localhost:*`（开发环境）
- **AND** 设置 `Access-Control-Allow-Origin` 头

#### Scenario: 处理预检请求
- **GIVEN** 浏览器发送 OPTIONS 请求
- **WHEN** 检查 CORS 策略
- **THEN** Edge Function 必须返回：
  - `Access-Control-Allow-Methods: POST, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type, Authorization`

### Requirement: The system SHALL standardize error responses

All error responses SHALL follow a unified format.

#### Scenario: 标准错误格式
- **GIVEN** 发生任何错误
- **WHEN** 返回错误响应
- **THEN** 必须包含：
  - `error.code`: 错误代码（字符串）
  - `error.message`: 人类可读的错误信息
  - `error.details`: 可选的错误详情对象
  - HTTP 状态码：准确反映错误类型

#### Scenario: 错误日志记录
- **GIVEN** 发生错误
- **WHEN** 记录日志
- **THEN** 必须包含：
  - 时间戳
  - 错误代码
  - 错误消息
  - 堆栈跟踪（生产环境）

### Requirement: Edge Functions SHALL optimize performance

Edge Functions SHALL optimize performance and response time.

#### Scenario: 连接池复用
- **GIVEN** 多次请求
- **WHEN** 调用外部 API
- **THEN** 必须复用 HTTP 连接
- **AND** 设置合理的超时时间

#### Scenario: 响应缓存
- **GIVEN** 相同提示词的重复请求
- **WHEN** 24 小时内请求相同内容
- **THEN** 可以返回缓存结果（可选实现）

#### Scenario: 资源清理
- **GIVEN** 请求完成或超时
- **WHEN** 释放资源
- **THEN** 必须：
  - 关闭 HTTP 连接
  - 清理临时变量
  - 释放内存

### Requirement: The system SHALL provide testing and monitoring

The system SHALL provide testing and monitoring capabilities.

#### Scenario: 单元测试
- **GIVEN** Edge Function 代码
- **WHEN** 运行测试套件
- **THEN** 必须测试：
  - 输入验证
  - 错误处理
  - API 调用逻辑
  - 响应格式

#### Scenario: 性能监控
- **GIVEN** 生产环境部署
- **WHEN** 监控系统运行
- **THEN** 必须追踪：
  - 平均响应时间
  - 错误率
  - 成功率
  - 请求量

#### Scenario: 健康检查
- **GIVEN** 系统管理员
- **WHEN** 检查服务状态
- **THEN** 提供 `/health` 端点返回：
  ```json
  {
    "status": "ok",
    "timestamp": "2025-11-02T00:00:00Z",
    "version": "1.0.0"
  }
  ```

## 实现细节

### 技术栈
- **运行时**: Deno (Supabase Edge Functions)
- **语言**: TypeScript
- **HTTP 客户端**: Fetch API
- **数据库**: Supabase JavaScript 客户端

### 目录结构
```
supabase/
  functions/
    generate-story/
      index.ts
      import_map.json
    analytics/
      track.ts
      summary.ts
```

### API 规范

#### POST /functions/v1/generate-story

**请求体**:
```typescript
interface GenerateStoryRequest {
  prompt: string;
  model?: string;
  stream?: boolean;
}
```

**响应体**:
```typescript
interface GenerateStoryResponse {
  success: boolean;
  data?: {
    id: number;
    title: string;
    content: string;
    filename: string;
    created_at: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

**状态码**:
- `200`: 成功
- `400`: 输入参数错误
- `429`: 速率限制
- `500`: 服务器错误
- `502`: AI 服务错误
- `504`: 超时

### 依赖项
- `openai` (OpenAI SDK for Deno)
- `@supabase/supabase-js` (数据库客户端)

## 成功标准

1. ✅ Edge Functions 部署成功
2. ✅ 故事生成功能正常工作
3. ✅ 错误处理覆盖所有场景
4. ✅ 响应时间 < 10 秒
5. ✅ 支持并发请求
6. ✅ 通过所有测试用例
