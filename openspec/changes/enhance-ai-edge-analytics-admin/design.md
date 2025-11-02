# 设计决策记录

**变更ID**: `enhance-ai-edge-analytics-admin`

## 架构决策

### 1. 为什么选择 Supabase Edge Functions？

**决策**: 使用 Supabase Edge Functions 而非独立服务端

**理由**:
- ✅ 与现有数据库无缝集成
- ✅ 自动扩缩和高可用
- ✅ 无需维护额外服务器
- ✅ 支持 Deno 运行时（现代 JavaScript/TypeScript）
- ✅ 内置请求签名和验证

**替代方案考虑**:
- ~~AWS Lambda~~: 需要额外配置，增加复杂度
- ~~独立 Node.js 服务~~: 需要服务器维护
- ~~Vercel Functions~~: 需要迁移现有托管方案

### 2. 数据库表结构设计

**决策**: 创建独立的 `story_reads` 表记录阅读事件

**设计**:
```sql
story_reads (
  id: BIGSERIAL PRIMARY KEY,
  story_id: BIGINT REFERENCES stories(id),
  user_identifier: TEXT, -- IP 或匿名用户 ID
  read_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent: TEXT, -- 可选，用于分析
  referrer: TEXT -- 可选，分析来源
)
```

**理由**:
- ✅ 规范化设计，避免数据冗余
- ✅ 支持聚合查询（COUNT, GROUP BY）
- ✅ 可扩展（添加更多维度数据）
- ✅ 符合第三范式

**替代方案**:
- ~~在 stories 表添加 view_count 字段~~: 不支持时间范围查询
- ~~使用事件溯源模式~~: 过度设计

### 3. 索引策略

**决策**: 使用复合索引优化查询性能

**索引设计**:
```sql
CREATE INDEX idx_story_reads_story_id_read_at
  ON story_reads (story_id, read_at);

CREATE INDEX idx_story_reads_user_identifier
  ON story_reads (user_identifier);
```

**理由**:
- `idx_story_reads_story_id_read_at`: 支持按故事分组+时间排序查询
- `idx_story_reads_user_identifier`: 支持用户行为分析

### 4. Edge Functions API 设计

**决策**: RESTful API 设计，遵循 HTTP 标准

**API 端点**:
```
POST /functions/v1/generate-story
  Body: { prompt: string, model?: string }
  Response: { id: number, title: string, content: string }

POST /functions/v1/analytics/track
  Body: { story_id: number, user_identifier?: string }

GET /functions/v1/analytics/summary
  Query: ?period=7d&limit=10
  Response: { total_reads: number, top_stories: Array }
```

**理由**:
- ✅ 标准 HTTP 方法
- ✅ 清晰的资源语义
- ✅ 易于调试和文档化
- ✅ 支持缓存（GET 请求）

### 5. 管理后台认证

**决策**: 使用 Supabase Auth 而非自定义认证

**实现**:
- 创建 `admin` 角色用户
- 使用 RLS 策略限制管理功能
- JWT 令牌自动管理

**理由**:
- ✅ 无需实现认证逻辑
- ✅ 内置安全最佳实践
- ✅ 支持多种登录方式
- ✅ 与 Supabase 生态集成

**替代方案**:
- ~~简单密码验证~~: 安全风险高
- ~~OAuth~~: 增加复杂度，现阶段不必要

### 6. 前端技术选择

**决策**: 使用纯 JavaScript + Chart.js

**技术栈**:
- **Chart.js**: 轻量级图表库，CDN 引入
- **原生 JavaScript**: 无需构建工具
- **Tailwind CSS**: 已有样式框架

**理由**:
- ✅ 保持与现有代码一致性
- ✅ 最小化外部依赖
- ✅ 快速开发
- ✅ 易于维护

**替代方案**:
- ~~React/Vue~~: 需要构建工具，增加复杂度
- ~~D3.js~~: 学习曲线陡峭
- ~~ECharts~~: 体积较大

### 7. 数据聚合策略

**决策**: 实时聚合而非预计算

**实现**:
```sql
-- 获取热门故事（实时聚合）
SELECT s.id, s.title, COUNT(r.id) as read_count
FROM stories s
LEFT JOIN story_reads r ON s.id = r.story_id
WHERE r.read_at >= NOW() - INTERVAL '7 days'
GROUP BY s.id, s.title
ORDER BY read_count DESC
LIMIT 10;
```

**理由**:
- ✅ 数据实时准确
- ✅ 无需维护物化视图
- ✅ 适合小规模数据（< 10万阅读记录）

**性能考虑**:
- 如果数据量增长，可考虑定期预计算
- 使用 TimescaleDB 扩展（如果需要）

### 8. 错误处理策略

**决策**: 分层错误处理

**Edge Functions 错误响应**:
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

**错误码定义**:
- `INVALID_INPUT`: 输入参数错误
- `AI_GENERATION_FAILED`: AI API 调用失败
- `DATABASE_ERROR`: 数据库操作失败
- `UNAUTHORIZED`: 认证失败
- `RATE_LIMITED`: 请求频率限制

### 9. 降级方案

**决策**: 保留客户端 AI 生成作为降级

**策略**:
- Edge Functions 失败时，显示错误提示
- 提供"使用客户端生成"选项
- 记录降级使用次数（可选）

**理由**:
- ✅ 提高系统可用性
- ✅ 用户体验不中断
- ✅ 便于调试和监控

### 10. 数据隐私

**决策**: 最小化数据收集

**收集的数据**:
- ✅ 故事阅读事件（匿名 IP）
- ✅ 浏览器类型（可选）
- ✅ 来源页面（可选）

**不收集**:
- ❌ 个人身份信息
- ❌ 详细内容
- ❌ 用户行为追踪

**理由**:
- ✅ 符合隐私法规
- ✅ 降低数据泄露风险
- ✅ 减少存储成本

## 性能权衡

### 查询优化 vs 代码复杂度
**选择**: 查询优化，适度增加代码复杂度

**原因**: 数据库查询优化可显著提升性能，且易于监控

### 实时性 vs 缓存
**选择**: 实时查询，添加简单 HTTP 缓存

**原因**: 数据量小，实时性更重要

### 功能完整性 vs 开发速度
**选择**: 分阶段实现，优先核心功能

**原因**: 快速迭代，及时获得反馈

## 安全决策

### API 安全
- CORS 策略限制来源
- Rate Limiting（Supabase 内置）
- 输入验证和清理
- SQL 注入防护（参数化查询）

### 数据安全
- RLS 策略保护敏感表
- 管理员权限验证
- 敏感操作审计日志（可选）

## 可扩展性考虑

### 水平扩展
- Edge Functions 自动扩缩
- 数据库读写分离（未来）
- CDN 加速静态资源

### 功能扩展
- 用户系统（基于现有认证）
- 故事收藏功能
- 个性化推荐

## 监控和可观测性

### 关键指标
- Edge Functions 响应时间
- 错误率
- 阅读事件数量
- AI 生成成功率

### 日志策略
- 结构化日志（JSON）
- 错误级别分类
- 审计跟踪（管理操作）

## 部署和运维

### 环境管理
- 开发环境：本地 Supabase
- 生产环境：Supabase 云

### 配置管理
- 环境变量（API 密钥）
- 文档化所有配置项

### 备份策略
- 数据库自动备份（Supabase）
- 代码版本控制（Git）

---

**更新日期**: 2025-11-02
**负责人**: Claude Code
**下次评审**: 实现完成后
