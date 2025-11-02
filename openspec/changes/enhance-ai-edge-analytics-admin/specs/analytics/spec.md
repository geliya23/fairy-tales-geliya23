# 阅读量统计分析规范

**能力名称**: `analytics`
**变更ID**: `enhance-ai-edge-analytics-admin`

## 目的

实现故事阅读量的统计和跟踪，提供数据驱动的洞察，帮助了解用户偏好和内容价值。

## ADDED Requirements

### Requirement: The system SHALL create story_reads table

The system SHALL create a `story_reads` table to record reading events.

#### Scenario: 创建 story_reads 表
- **GIVEN** Supabase 数据库已配置
- **WHEN** 执行建表 SQL 脚本
- **THEN** 必须创建包含以下字段的 `story_reads` 表：
  - `id`: BIGSERIAL PRIMARY KEY
  - `story_id`: BIGINT NOT NULL REFERENCES stories(id) ON DELETE CASCADE
  - `user_identifier`: TEXT NOT NULL（IP 地址或匿名用户 ID）
  - `read_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  - `user_agent`: TEXT（浏览器信息）
  - `referrer`: TEXT（来源页面）

#### Scenario: 创建索引
- **GIVEN** `story_reads` 表已创建
- **WHEN** 执行索引脚本
- **THEN** 必须创建以下索引：
  - `idx_story_reads_story_id_read_at`: GIN 索引，优化故事+时间查询
  - `idx_story_reads_user_identifier`: B-Tree 索引，优化用户查询
  - `idx_story_reads_read_at`: B-Tree 索引，优化时间范围查询

#### Scenario: 启用行级安全
- **GIVEN** `story_reads` 表已创建
- **WHEN** 执行 `ALTER TABLE story_reads ENABLE ROW LEVEL SECURITY`
- **THEN** 必须为表启用 RLS
- **AND** 创建允许公共插入的策略：
  ```sql
  CREATE POLICY "Allow public inserts" ON story_reads
    FOR INSERT WITH CHECK (true);
  ```

#### Scenario: 设置更新时间触发器
- **GIVEN** `story_reads` 表已创建
- **WHEN** 插入新记录
- **THEN** 自动设置 `read_at` 为当前时间
- **AND** 支持后续更新操作

### Requirement: The system SHALL track reading events accurately

The system SHALL accurately record each story reading event.

#### Scenario: 记录阅读事件
- **GIVEN** 用户访问故事页面
- **WHEN** 页面加载完成
- **THEN** 系统必须：
  1. 获取用户 IP 地址
  2. 获取浏览器 User-Agent
  3. 获取来源页面 URL
  4. 向 `story_reads` 表插入记录

#### Scenario: 用户识别
- **GIVEN** 需要识别用户
- **WHEN** 记录阅读事件
- **THEN** 必须按以下优先级识别：
  1. 登录用户：使用 `auth.uid()`
  2. 匿名用户：使用 IP 地址
  3. 特殊标识：如 Cookie 或 LocalStorage

#### Scenario: 避免重复计数
- **GIVEN** 用户多次访问同一故事
- **WHEN** 5 分钟内重复访问
- **THEN** 可以选择：
  - 选项 A：记录每次访问（精确统计）
  - 选项 B：去重计数（用户友好）
- **默认**：记录每次访问（可配置）

#### Scenario: 离线访问处理
- **GIVEN** 用户离线访问（缓存）
- **WHEN** 网络恢复
- **THEN** 延迟发送阅读事件
- **AND** 标记为离线同步

### Requirement: The system SHALL provide analytics query API

The system SHALL provide Edge Functions for querying analytics data.

#### Scenario: 获取阅读摘要
- **GIVEN** 发送 GET 请求到 `/functions/v1/analytics/summary`
- **WHEN** 不带查询参数
- **THEN** 返回默认统计（最近 7 天）：
  ```json
  {
    "period": "7d",
    "total_reads": 1234,
    "unique_readers": 567,
    "avg_reads_per_story": 102.8,
    "top_stories": [
      {
        "story_id": 1,
        "title": "故事标题",
        "read_count": 456,
        "unique_readers": 234
      }
    ],
    "time_series": [
      {
        "date": "2025-11-01",
        "reads": 123,
        "unique_readers": 45
      }
    ]
  }
  ```

#### Scenario: 指定时间范围
- **GIVEN** 发送带参数的请求
- **WHEN** 查询参数：`?period=30d&limit=20`
- **THEN** 返回：
  - 时间范围：最近 30 天
  - 最多 20 个热门故事
  - 按阅读量降序排列

#### Scenario: 支持的时间周期
- **GIVEN** 查询参数 `period`
- **WHEN** 指定不同周期
- **THEN** 必须支持：
  - `1d`: 最近 1 天
  - `7d`: 最近 7 天（默认）
  - `30d`: 最近 30 天
  - `90d`: 最近 90 天
  - `custom`: 自定义范围（需 `start_date` 和 `end_date`）

#### Scenario: 故事详情统计
- **GIVEN** 发送 GET 请求到 `/functions/v1/analytics/story/{id}`
- **WHEN** 指定故事 ID
- **THEN** 返回该故事的详细统计：
  ```json
  {
    "story_id": 1,
    "title": "故事标题",
    "total_reads": 456,
    "unique_readers": 234,
    "first_read": "2025-11-01T00:00:00Z",
    "last_read": "2025-11-02T23:59:59Z",
    "daily_reads": [
      {
        "date": "2025-11-01",
        "reads": 123
      }
    ]
  }
  ```

### Requirement: The frontend SHALL automatically collect reading data

The frontend SHALL automatically collect reading data and display it in appropriate locations.

#### Scenario: 自动追踪
- **GIVEN** 用户访问 index.html
- **WHEN** 加载故事内容
- **THEN** 自动发送追踪请求：
  ```javascript
  fetch('/functions/v1/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      story_id: storyId,
      user_identifier: getUserId()
    })
  });
  ```

#### Scenario: 热门故事展示
- **GIVEN** 故事列表页面
- **WHEN** 加载完成
- **THEN** 在侧边栏显示热门故事（前 5 名）：
  - 显示阅读次数
  - 包含"🔥"或"📈"图标
  - 链接到对应故事

#### Scenario: 统计可视化
- **GIVEN** 管理员访问统计页面
- **WHEN** 页面加载
- **THEN** 显示图表：
  - 折线图：每日阅读量趋势
  - 柱状图：热门故事排行
  - 饼图：故事分类占比（如有）

### Requirement: The system SHALL protect user privacy

The system SHALL protect user privacy and comply with data protection regulations.

#### Scenario: IP 地址匿名化
- **GIVEN** 需要记录用户标识
- **WHEN** 处理 IP 地址
- **THEN** 必须进行匿名化：
  - IPv4：保留前 3 位（如：`192.168.1.xxx`）
  - IPv6：保留前 4 组（如：`2001:db8:xxx:xxx::`）
- **AND** 不存储完整 IP 地址

#### Scenario: 数据保留策略
- **GIVEN** 阅读事件数据
- **WHEN** 超过保留期限
- **THEN** 自动清理：
  - 默认保留期：90 天
  - 可配置：30-365 天
- **AND** 生成归档报告

#### Scenario: GDPR 合规
- **GIVEN** 欧盟用户访问
- **WHEN** 记录数据
- **THEN** 必须：
  - 提供隐私政策链接
  - 支持数据删除请求
  - 记录数据处理依据

#### Scenario: 用户选择退出
- **GIVEN** 用户不希望被追踪
- **WHEN** 设置 Do Not Track
- **THEN** 系统必须尊重选择：
  - 不发送追踪请求
  - 不存储用户标识
  - 显示提示信息

### Requirement: The system SHALL optimize query performance

The system SHALL optimize query performance to ensure fast responses.

#### Scenario: 聚合查询优化
- **GIVEN** 查询热门故事
- **WHEN** 执行聚合查询
- **THEN** 使用索引优化：
  - 利用 `idx_story_reads_story_id_read_at` 索引
  - 添加适当的 WHERE 条件
  - 限制返回结果数量

#### Scenario: 缓存策略
- **GIVEN** 重复查询相同数据
- **WHEN** 24 小时内请求
- **THEN** 可以返回缓存结果
- **AND** 设置适当的缓存头：
  - `Cache-Control: public, max-age=3600`
  - `ETag: "hash-of-data"`

#### Scenario: 分页查询
- **GIVEN** 查询大量数据
- **WHEN** 使用 LIMIT 和 OFFSET
- **THEN** 必须：
  - 使用索引优化分页
  - 避免 OFFSET 性能问题（大数据集）
  - 提供总计数

### Requirement: The system SHALL ensure data accuracy

The system SHALL ensure analytics data is accurate and reliable.

#### Scenario: 原子性插入
- **GIVEN** 插入阅读记录
- **WHEN** 并发请求
- **THEN** 必须使用事务保证：
  - 原子性：全部成功或全部失败
  - 一致性：数据完整性
  - 隔离性：并发安全

#### Scenario: 去重逻辑（可选）
- **GIVEN** 用户频繁刷新页面
- **WHEN** 5 分钟内重复访问
- **THEN** 可以选择：
  - 每次都计数（默认）
  - 只计数一次（需额外逻辑）
- **配置**：通过环境变量控制

#### Scenario: 数据验证
- **GIVEN** 插入数据
- **WHEN** 验证输入
- **THEN** 必须检查：
  - `story_id` 存在且有效
  - `user_identifier` 不为空
  - `read_at` 在合理范围内（不超出当前时间）

### Requirement: The system SHALL monitor data collection

The system SHALL monitor data collection and query performance.

#### Scenario: 数据量监控
- **GIVEN** 生产环境运行
- **WHEN** 监控系统检查
- **THEN** 追踪指标：
  - 每日新增阅读记录数
  - 数据库表大小
  - 查询平均响应时间

#### Scenario: 异常检测
- **GIVEN** 数据异常
- **WHEN** 检测到以下情况
- **THEN** 触发告警：
  - 阅读量突然激增（可能是爬虫）
  - 错误率超过 5%
  - 响应时间超过 2 秒

#### Scenario: 健康检查
- **GIVEN** 管理员检查系统
- **WHEN** 访问 `/health` 端点
- **THEN** 返回状态：
  ```json
  {
    "status": "ok",
    "database": "connected",
    "last_read": "2025-11-02T00:00:00Z",
    "total_records": 12345
  }
  ```

## 实现细节

### 数据库表

```sql
CREATE TABLE story_reads (
  id BIGSERIAL PRIMARY KEY,
  story_id BIGINT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  referrer TEXT
);

-- 索引
CREATE INDEX idx_story_reads_story_id_read_at
  ON story_reads (story_id, read_at);
CREATE INDEX idx_story_reads_user_identifier
  ON story_reads (user_identifier);
CREATE INDEX idx_story_reads_read_at
  ON story_reads (read_at);

-- RLS
ALTER TABLE story_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public inserts" ON story_reads
  FOR INSERT WITH CHECK (true);
```

### API 端点

#### POST /functions/v1/analytics/track

**请求体**:
```typescript
interface TrackRequest {
  story_id: number;
  user_identifier?: string;
  user_agent?: string;
  referrer?: string;
}
```

#### GET /functions/v1/analytics/summary

**查询参数**:
- `period`: 时间周期（1d, 7d, 30d, 90d, custom）
- `limit`: 返回故事数量限制（默认：10）
- `start_date`: 自定义起始日期（仅 period=custom）
- `end_date`: 自定义结束日期（仅 period=custom）

## 成功标准

1. ✅ `story_reads` 表创建成功
2. ✅ 阅读事件自动追踪
3. ✅ 统计数据 API 正常返回
4. ✅ 前端展示热门故事
5. ✅ 查询响应时间 < 500ms
6. ✅ 数据准确性 100%
7. ✅ 符合隐私保护要求
