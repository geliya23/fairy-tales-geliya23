# data-storage Specification

## Purpose
TBD - created by archiving change refactor-migrate-supabase. Update Purpose after archive.
## Requirements
### Requirement: PostgreSQL数据库表结构
The system SHALL create and maintain a PostgreSQL database table named 'stories' to store all fairy tale content.

#### Scenario: 创建stories表
- **GIVEN** Supabase项目已初始化
- **WHEN** 执行建表SQL脚本
- **THEN** 必须创建包含以下字段的stories表：
  - `id`: BIGSERIAL PRIMARY KEY（自动增长主键）
  - `title`: TEXT NOT NULL（故事标题）
  - `filename`: TEXT（原始文件名，向后兼容）
  - `content`: TEXT NOT NULL（故事完整Markdown内容）
  - `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  - `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Requirement: 数据库索引优化
The system SHALL create database indexes to optimize query performance.

#### Scenario: 全文搜索索引
- **GIVEN** stories表已创建
- **WHEN** 创建GIN索引
- **THEN** 必须创建以下索引：
  - `idx_stories_title`: 使用GIN索引 `to_tsvector('simple', title)`
  - 这个索引必须用于优化title字段的全文搜索查询

### Requirement: 行级安全策略（RLS）
The system SHALL enable Row Level Security to protect data integrity while allowing public read access.

#### Scenario: 启用RLS
- **GIVEN** stories表已创建
- **WHEN** 执行 `ALTER TABLE stories ENABLE ROW LEVEL SECURITY;`
- **THEN** 必须为stories表启用行级安全策略

#### Scenario: 公共读取策略
- **GIVEN** RLS已启用
- **WHEN** 匿名用户尝试读取stories表
- **THEN** 必须创建允许公共读取的策略

### Requirement: API查询接口
The system SHALL provide REST API endpoints for story list and content retrieval.

#### Scenario: 获取故事列表
- **GIVEN** 用户访问 `/rest/v1/stories` 端点
- **WHEN** 发送GET请求
- **THEN** API必须返回JSON格式的故事列表
- **AND** 包含字段: `id`, `title`, `filename`
- **AND** 默认按 `id` 升序排序

#### Scenario: 获取单个故事内容
- **GIVEN** 用户需要查看特定故事的详细内容
- **WHEN** 发送GET请求 `/rest/v1/stories?filename=eq.{filename}`
- **THEN** API必须返回匹配filename的记录
- **AND** 包含完整 `content` 字段

