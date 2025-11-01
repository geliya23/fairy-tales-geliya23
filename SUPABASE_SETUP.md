# Supabase设置指南

本指南将帮助您完成Supabase项目的设置和数据迁移。

## 第一步：创建Supabase项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 注册或登录账户
3. 点击 "New Project"
4. 选择组织
5. 填写项目信息：
   - **Name**: `fairy-tales-geliya23`
   - **Database Password**: 设置一个强密码（请妥善保存）
   - **Region**: 选择 `Northeast Asia (Tokyo)`
6. 点击 "Create new project"
7. **等待 2-3 分钟** 项目初始化完成

## 第二步：获取项目配置信息

项目创建完成后：

1. 进入项目 Dashboard
2. 点击左侧 "Settings"
3. 点击 "API"
4. 复制以下信息：
   - **Project URL** (类似: `https://xxx.supabase.co`)
   - **anon public** key

## 第三步：配置环境变量

1. 复制 `.env.example` 为 `.env`:
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入真实信息：
   ```env
   SUPABASE_URL=https://vvuqvvfwrmjsyybmptgd.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dXF2dmZ3cm1qc3l5Ym1wdGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMTA4MjYsImV4cCI6MjA3NzU4NjgyNn0.sOyVSYOKjmZVo-thtu5ESnQ6OZC0-xuCLA4edn5FPeY
   ```

## 第四步：创建数据库表

1. 在Supabase Dashboard中，点击左侧 "SQL Editor"
2. 点击 "New query"
3. 复制 `create-table.sql` 文件中的所有内容
4. 点击 "Run" 执行
5. 确认看到 "Success. No rows returned" 消息

## 第五步：执行数据迁移

```bash
# 运行迁移脚本
node migrate-to-supabase.js
```

如果看到 `🎉 所有故事迁移成功！` 说明迁移完成。

## 第六步：验证数据

在Supabase Dashboard中：
1. 点击左侧 "Table Editor"
2. 选择 "stories" 表
3. 确认看到 12 条记录

## 故障排除

### 错误：找不到 stories.json
- 确保在项目根目录执行命令
- 检查 `stories.json` 文件是否存在

### 错误：插入失败
- 确认已执行 `create-table.sql` 脚本
- 检查 Supabase 配置是否正确

### 错误：网络连接
- 检查网络连接
- 确认 Supabase 项目状态正常

## 常见问题

**Q: 需要付费吗？**
A: 免费计划足够使用（500MB数据库 + 1GB文件存储）

**Q: 中国访问速度如何？**
A: 选择Tokyo区域，访问速度较好

**Q: 如何删除项目？**
A: 在项目 Settings → Delete project

## 下一步

完成迁移后，继续执行前端重构：
```bash
# 查看当前状态
git status

# 进入重构阶段...
```

## 支持

如有问题，请检查：
1. Supabase Dashboard 的日志
2. 终端的错误输出
3. `.env` 配置是否正确
