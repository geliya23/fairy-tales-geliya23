# 数据库设计文档

**变更ID**: `enhance-ai-edge-analytics-admin`
**版本**: 1.0
**创建日期**: 2025-11-02
**负责人**: Claude Code

---

## 📋 目录

1. [概述](#概述)
2. [数据库架构](#数据库架构)
3. [表结构设计](#表结构设计)
4. [索引策略](#索引策略)
5. [RLS 策略](#rls-策略)
6. [API 使用示例](#api-使用示例)
7. [性能考虑](#性能考虑)
8. [维护指南](#维护指南)

---

## 概述

本文档描述了童话故事集网站的数据库扩展设计，主要用于支持阅读量统计和 AI 边缘函数功能。通过添加 `story_reads` 表，我们可以追踪用户阅读行为，为内容优化和管理决策提供数据支持。

### 设计目标

- ✅ **数据完整性**: 确保阅读事件准确记录
- ✅ **查询性能**: 通过索引优化常见查询模式
- ✅ **安全性**: 使用 RLS 策略保护数据访问
- ✅ **可扩展性**: 为未来功能（用户系统、推荐算法）预留扩展空间
- ✅ **数据隐私**: 最小化数据收集，符合隐私法规

---

## 数据库架构

### 现有表

#### `stories` 表
现有故事表，存储童话故事内容。

```sql
CREATE TABLE stories (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 新增表

#### `story_reads` 表
追踪故事阅读事件的表。

---

## 表结构设计

### `story_reads` 详细设计

```sql
CREATE TABLE story_reads (
    id BIGSERIAL PRIMARY KEY,              -- 自增主键
    story_id BIGINT NOT NULL,              -- 关联故事 ID
    user_identifier TEXT NOT NULL,         -- 用户标识（IP 或匿名 ID）
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- 阅读时间
    user_agent TEXT,                       -- 浏览器信息（可选）
    referrer TEXT,                         -- 来源页面（可选）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  -- 记录创建时间
);
```

### 字段说明

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `id` | BIGSERIAL | ✅ | 自增主键 | 1, 2, 3... |
| `story_id` | BIGINT | ✅ | 关联故事 ID（外键） | 1 |
| `user_identifier` | TEXT | ✅ | 用户标识（IP 或本地存储 ID） | "192.168.1.1" 或 "user-abc123" |
| `read_at` | TIMESTAMP | ✅ | 阅读时间 | 2025-11-02 10:30:00+00 |
| `user_agent` | TEXT | ❌ | 浏览器 User-Agent | "Mozilla/5.0..." |
| `referrer` | TEXT | ❌ | 来源页面 URL | "https://google.com" |
| `created_at` | TIMESTAMP | ✅ | 记录创建时间 | 自动生成 |

### 外键约束

```sql
ALTER TABLE story_reads
ADD CONSTRAINT fk_story_reads_story_id
FOREIGN KEY (story_id) REFERENCES stories(id)
ON DELETE CASCADE;
```

**说明**: 当故事被删除时，所有相关的阅读记录也会被自动删除，保持数据一致性。

---

## 索引策略

索引设计基于常见查询模式进行优化。

### 1. 复合索引：`idx_story_reads_story_id_read_at`

```sql
CREATE INDEX idx_story_reads_story_id_read_at
    ON story_reads (story_id, read_at DESC);
```

**用途**: 优化按故事分组并按时间排序的查询

**优化查询**:
```sql
-- 获取热门故事（近 7 天）
SELECT s.id, s.title, COUNT(r.id) as read_count
FROM stories s
LEFT JOIN story_reads r ON s.id = r.story_id
WHERE r.read_at >= NOW() - INTERVAL '7 days'
GROUP BY s.id, s.title
ORDER BY read_count DESC
LIMIT 10;
```

### 2. 用户索引：`idx_story_reads_user_identifier`

```sql
CREATE INDEX idx_story_reads_user_identifier
    ON story_reads (user_identifier);
```

**用途**: 优化用户行为追踪查询

**优化查询**:
```sql
-- 获取用户阅读历史
SELECT * FROM story_reads
WHERE user_identifier = '192.168.1.1'
ORDER BY read_at DESC
LIMIT 50;
```

### 3. 时间索引：`idx_story_reads_read_at`

```sql
CREATE INDEX idx_story_reads_read_at
    ON story_reads (read_at DESC);
```

**用途**: 优化时间范围查询

**优化查询**:
```sql
-- 获取最近 30 天的所有阅读事件
SELECT * FROM story_reads
WHERE read_at >= NOW() - INTERVAL '30 days'
ORDER BY read_at DESC;
```

### 4. 复合索引：`idx_story_reads_user_time`

```sql
CREATE INDEX idx_story_reads_user_time
    ON story_reads (user_identifier, read_at DESC);
```

**用途**: 优化用户活动时间查询

**优化查询**:
```sql
-- 获取用户最近活动
SELECT * FROM story_reads
WHERE user_identifier = '192.168.1.1'
  AND read_at >= NOW() - INTERVAL '7 days'
ORDER BY read_at DESC
LIMIT 20;
```

---

## RLS 策略

行级安全（Row Level Security）策略控制数据访问权限。

### 启用 RLS

```sql
ALTER TABLE story_reads ENABLE ROW LEVEL SECURITY;
```

### 策略定义

#### 1. 公共读取访问

```sql
CREATE POLICY "Allow public read access on story_reads"
    ON story_reads FOR SELECT
    TO public
    USING (true);
```

**说明**: 允许任何人查询阅读统计数据，用于前端显示热门故事和分析图表。

#### 2. 公共插入访问

```sql
CREATE POLICY "Allow public insert on story_reads"
    ON story_reads FOR INSERT
    TO public
    WITH CHECK (true);
```

**说明**: 允许任何人记录阅读事件，无需认证。这简化了前端集成。

### 安全考虑

1. **最小权限原则**: 只开放必要的读写权限
2. **数据匿名化**: 不存储个人身份信息，只使用 IP 或匿名标识
3. **无敏感数据**: 不存储用户个人信息或详细内容

---

## API 使用示例

### 插入阅读记录

**Edge Function**: `POST /functions/v1/analytics/track`

```javascript
// 前端调用示例
const trackRead = async (storyId) => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/analytics/track`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
            story_id: storyId,
            user_identifier: getUserId(), // IP 或本地生成的用户 ID
            user_agent: navigator.userAgent,
            referrer: document.referrer
        })
    });

    return response.json();
};
```

### 查询热门故事

**Edge Function**: `GET /functions/v1/analytics/summary?period=7d&limit=10`

```javascript
// 获取热门故事
const getPopularStories = async () => {
    const response = await fetch(
        `${SUPABASE_URL}/functions/v1/analytics/summary?period=7d&limit=10`,
        {
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        }
    );

    return response.json();
};
```

### SQL 直接查询示例

```sql
-- 1. 获取总阅读量
SELECT COUNT(*) as total_reads FROM story_reads;

-- 2. 获取热门故事 TOP 10
SELECT
    s.id,
    s.title,
    COUNT(r.id) as read_count
FROM stories s
LEFT JOIN story_reads r ON s.id = r.story_id
WHERE r.read_at >= NOW() - INTERVAL '7 days'
GROUP BY s.id, s.title
ORDER BY read_count DESC
LIMIT 10;

-- 3. 获取用户活跃度
SELECT
    user_identifier,
    COUNT(*) as read_count,
    COUNT(DISTINCT story_id) as unique_stories
FROM story_reads
WHERE read_at >= NOW() - INTERVAL '24 hours'
GROUP BY user_identifier
ORDER BY read_count DESC;

-- 4. 获取时间趋势数据
SELECT
    DATE_TRUNC('day', read_at) as date,
    COUNT(*) as reads
FROM story_reads
WHERE read_at >= NOW() - INTERVAL '30 days'
GROUP BY date
ORDER BY date;
```

---

## 性能考虑

### 查询优化

1. **索引使用**: 所有查询都应使用索引，避免全表扫描
2. **时间范围限制**: 默认限制查询范围（如最近 30 天）
3. **分页**: 大数据量查询使用 LIMIT 和 OFFSET
4. **聚合优化**: 在数据库层进行聚合，减少数据传输

### 监控指标

关键性能指标：

- **查询响应时间**: 平均 < 100ms（缓存后 < 50ms）
- **索引使用率**: > 90% 的查询使用索引
- **表大小增长**: 监控存储空间使用
- **并发查询数**: 监控同时执行的查询数量

### 扩展策略

如果数据量增长（> 100万记录）：

1. **定期清理**: 归档旧数据（如保留最近 6 个月）
2. **分区表**: 按时间分区提高查询性能
3. **预计算**: 创建物化视图存储聚合结果
4. **读写分离**: 使用只读副本处理分析查询

---

## 维护指南

### 日常监控

```sql
-- 检查表大小
SELECT
    pg_size_pretty(pg_total_relation_size('story_reads')) as size;

-- 检查记录数
SELECT COUNT(*) as total_records FROM story_reads;

-- 检查索引使用情况
SELECT
    indexname,
    idx_scan as usage_count
FROM pg_stat_user_indexes
WHERE tablename = 'story_reads'
ORDER BY idx_scan DESC;
```

### 定期任务

1. **每日统计**: 更新每日阅读量汇总表
2. **周度清理**: 清理 6 个月前的旧数据（如果需要）
3. **月度分析**: 生成月度分析报告

### 备份和恢复

**自动备份**: Supabase 提供每日自动备份

**手动备份**:
```sql
-- 导出数据
COPY story_reads TO '/path/to/backup.csv' CSV HEADER;

-- 恢复数据
COPY story_reads FROM '/path/to/backup.csv' CSV HEADER;
```

---

## 故障排除

### 常见问题

**Q: 查询很慢怎么办？**
A: 检查是否有合适的索引，使用 EXPLAIN ANALYZE 分析查询计划

**Q: 数据插入失败？**
A: 检查外键约束，确认 story_id 存在

**Q: RLS 策略不工作？**
A: 检查策略是否正确应用，使用 `pg_policies` 视图验证

**Q: 如何清理测试数据？**
A: 使用 `DELETE FROM story_reads WHERE user_agent = 'Test Script'`

### 调试查询

```sql
-- 查看查询计划
EXPLAIN ANALYZE
SELECT * FROM story_reads
WHERE story_id = 1
ORDER BY read_at DESC
LIMIT 10;

-- 查看表统计信息
SELECT
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables
WHERE relname = 'story_reads';
```

---

## 更新日志

| 版本 | 日期 | 修改内容 | 作者 |
|------|------|----------|------|
| 1.0 | 2025-11-02 | 初始版本，创建 story_reads 表和索引 | Claude Code |

---

**文档状态**: ✅ 完成
**审核状态**: 待审核
**下次更新**: 根据需求变更
