# 变更提案：迁移到Supabase并简化架构

## 变更概览

**变更ID**: `refactor-migrate-supabase`

**变更类型**: 架构重构 (Architectural Refactor)

**优先级**: 高

**提交时间**: 2025-11-01

---

## 背景

当前项目（`index.html` 1443行）包含过多功能，导致：
- 代码复杂度高，维护困难
- 需要用户配置GitHub Token，用户体验差
- 混合架构（GitHub API + 本地文件）造成逻辑混乱
- 违反单一职责原则

## 目标

1. **简化架构**: 从混合功能（GitHub管理 + 展示）重构为纯展示 + 数据库
2. **降低复杂度**: 代码量从1443行减少到~400行（减少72%）
3. **提升易用性**: 零配置，打开即用
4. **提高稳定性**: 使用Supabase替代不稳定的GitHub API
5. **保持可扩展性**: 为未来添加用户系统、评论等功能预留空间

---

## 详细变更描述

### 需要删除的功能（约1000行）

1. **GitHubAPI类及所有相关方法**
   - `createRepository()` - 创建仓库
   - `initializeRepository()` - 初始化仓库
   - `createOrUpdateFile()` - 文件操作
   - `getFile()` - 获取文件
   - `saveStory()` - 保存故事
   - `validateToken()` - Token验证
   - `saveToken()` / `loadToken()` / `clearToken()` - Token管理

2. **Token管理相关代码**
   - GitHub Token输入UI
   - Token验证和存储逻辑
   - GitHub账户配置界面

3. **AI故事生成功能**
   - AI生成故事的表单和UI
   - 调用外部AI服务的代码
   - 生成故事的保存逻辑

4. **GitHub仓库管理界面**
   - 创建仓库按钮和模态框
   - 仓库状态检查
   - GitHub相关提示信息

5. **复杂的加载逻辑**
   - `useGitHub` 标志和切换逻辑
   - GitHub加载失败的降级处理
   - 云端/本地数据源标识

### 需要保留的功能（约300行）

1. **核心展示功能**
   - 故事列表显示
   - 故事内容加载和渲染
   - 搜索功能
   - 分组显示和折叠功能
   - 响应式界面

2. **UI样式和交互**
   - 故事列表项的hover效果
   - 活跃状态显示
   - 故事内容渲染
   - 页面布局和样式

### 需要新增的功能（约100行）

1. **Supabase集成**
   - Supabase客户端初始化
   - 数据库连接配置
   - API调用封装

2. **数据查询逻辑**
   - 从Supabase获取故事列表
   - 从Supabase获取故事内容
   - 错误处理和降级方案

---

## 数据库设计

### stories表

```sql
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
```

### 数据迁移

- 从 `stories.json` 读取12个故事索引
- 从 `story/*.md` 文件读取内容
- 批量插入到Supabase数据库

---

## 风险和缓解策略

### 高风险项

1. **数据丢失风险**
   - **缓解**: 在执行前创建完整备份
   - **验证**: 迁移后对比记录数量和内容完整性

2. **功能缺失**
   - **缓解**: 详细测试所有保留功能
   - **验证**: 创建测试清单，逐项验证

3. **用户访问中断**
   - **缓解**: 在GitHub Pages上测试通过后再切换
   - **验证**: 部署后立即进行线上测试

### 中等风险项

1. **Supabase服务稳定性**
   - **缓解**: 选择稳定的区域（日本/新加坡）
   - **验证**: 监控服务状态，准备降级方案

2. **API限制**
   - **缓解**: Supabase免费额度足够当前需求
   - **验证**: 监控API使用量

### 低风险项

1. **代码重构错误**
   - **缓解**: 逐步删除，每步测试
   - **验证**: 使用Git版本控制，可以随时回滚

---

## 成功标准

### 代码质量
- [ ] 代码行数从1443行减少到~400行
- [ ] 删除所有GitHub API相关代码
- [ ] 删除所有Token管理代码
- [ ] 删除所有AI生成相关代码
- [ ] 代码结构清晰，职责单一

### 功能验证
- [ ] 所有12个故事正常显示
- [ ] 点击故事可以正常加载内容
- [ ] 搜索功能正常工作
- [ ] 分组显示和折叠功能正常
- [ ] 响应式布局在各设备上正常

### 性能指标
- [ ] 页面加载时间 < 2秒
- [ ] 故事切换时间 < 1秒
- [ ] 搜索响应时间 < 0.5秒

### 用户体验
- [ ] 打开页面即可使用，无需配置
- [ ] 界面简洁，操作直观
- [ ] 错误信息友好明确

---

## 相关变更

### 依赖的变更
- 无（这是独立的基础架构变更）

### 被影响的变更
- 之前的 `github-cloud-storage` 功能将被完全移除
- 之前的 `ai-story` 生成功能将转移到后端（Supabase Edge Functions）
- 之前的 `story-list` 展示功能将被简化

---

## 后续计划

### 短期（1-2周）
1. 完成Supabase迁移和代码重构
2. 测试所有功能
3. 部署到生产环境

### 中期（1个月）
1. 在Supabase Edge Functions中重新实现AI故事生成功能
2. 添加基础统计分析（阅读量等）

### 长期（2-3个月）
1. 添加用户系统（可选）
2. 添加评论功能
3. 添加故事收藏功能
4. 考虑移动端App

---

## 决策记录

**为什么选择Supabase而不是其他方案？**
- 免费额度充足（500MB数据库 + 1GB文件）
- 中国大陆访问优化
- 实时功能支持
- 完整的PostgreSQL功能
- 易于扩展

**为什么删除而不是保留GitHub功能？**
- 复杂度高，维护成本高
- 用户体验差（需要Token配置）
- 违反单一职责原则
- 可通过管理后台或API替代

**为什么保留本地文件而不是全部迁移？**
- 作为降级方案，提高稳定性
- 避免单点故障
- 可以离线使用部分功能

---

## 批准请求

请确认是否批准此变更提案。一旦批准，将立即开始执行任务列表中的各项任务。

**提案人**: Claude Code
**日期**: 2025-11-01
**状态**: 待批准
