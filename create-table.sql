-- 创建stories表
-- 在Supabase项目的SQL Editor中执行此脚本

CREATE TABLE stories (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  filename TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建全文搜索索引
CREATE INDEX idx_stories_title ON stories USING gin(to_tsvector('simple', title));

-- 启用行级安全
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- 创建允许所有人读取的策略
CREATE POLICY "Enable read access for all users" ON stories
  FOR SELECT USING (true);

-- 验证表创建
-- 执行后运行: SELECT * FROM stories LIMIT 1;
