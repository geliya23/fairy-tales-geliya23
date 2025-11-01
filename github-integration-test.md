# GitHub API 集成测试指南

## 测试前准备

### 1. 打开网站
```bash
# 在浏览器中打开 index.html
open index.html
```

### 2. 验证代码结构
检查以下元素是否存在：
- ✅ 页面顶部有两个按钮："云存储设置" 和 "AI 生成故事"
- ✅ 点击"云存储设置"打开GitHub配置模态框
- ✅ 点击"AI 生成故事"打开AI故事生成模态框

---

## 测试步骤

### 阶段1：GitHub配置

#### Test 1.1: 打开GitHub设置
1. 点击页面右上角的"☁️ 云存储设置"按钮
2. ✅ 应该弹出GitHub云存储设置模态框

#### Test 1.2: 配置GitHub Token
1. 在GitHub用户名输入框中确认显示：`geliya23`
2. 在Token输入框中输入你的GitHub Personal Access Token
3. 点击"保存"按钮
4. ✅ 应该显示验证进度：
   - "正在验证 Token..."
   - "Token 验证成功"
   - "正在检查仓库..."
   - "仓库不存在，正在创建..."
   - "仓库创建成功！"
   - 最后显示成功Toast通知

#### Test 1.3: 验证仓库创建
1. 登录GitHub.com
2. 访问：https://github.com/geliya23/fairy-tales-geliya23
3. ✅ 应该看到名为"fairy-tales-geliya23"的仓库
4. ✅ 检查仓库是否包含：
   - `stories.json` 文件
   - `story/` 目录
   - `story/README.md` 文件

---

### 阶段2：故事加载

#### Test 2.1: 从GitHub加载故事列表
1. 刷新网页
2. 打开浏览器控制台 (F12 → Console)
3. ✅ 控制台应显示：
   - "✅ 使用 GitHub 云端故事列表"
4. ✅ 故事列表应显示带有"☁️"云朵图标的故事

#### Test 2.2: 点击故事查看
1. 点击任意故事
2. ✅ 故事内容应正常显示
3. ✅ 故事标题旁边应显示蓝色"☁️ 云端故事"标签

---

### 阶段3：生成并保存故事

#### Test 3.1: 生成故事
1. 点击"🤖 AI 生成故事"按钮
2. 如果没有AI API配置，点击设置配置AI API
3. 在提示词框中输入：`一只小兔子的冒险`
4. 选择模型并点击"生成故事"
5. ✅ 应该成功生成故事内容

#### Test 3.2: 保存故事到GitHub
1. 生成故事后，点击"💾 保存故事"按钮
2. ✅ 按钮应显示"正在保存到云端..."
3. ✅ 应该出现Toast通知：
   - "故事已成功保存到 GitHub 云端！"
   - "文件: ai_generated_story_[timestamp].md"
   - "30秒后可在 GitHub Pages 查看"

#### Test 3.3: 验证故事已保存
1. 等待保存完成后，故事列表应自动刷新
2. ✅ 新故事应出现在列表中，标题旁边有"☁️"图标
3. 点击新故事，确认内容正确

---

### 阶段4：GitHub Pages验证

#### Test 4.1: 检查GitHub Pages设置
1. 访问GitHub仓库：https://github.com/geliya23/fairy-tales-geliya23
2. 进入 Settings → Pages
3. ✅ Source应设置为"Deploy from a branch"
4. ✅ Branch应设置为"main"

#### Test 4.2: 访问GitHub Pages
1. 等待30秒后，访问：https://geliya23.github.io/fairy-tales-geliya23/
2. ✅ 页面应正常加载
3. ✅ 新保存的故事应在故事列表中可见
4. ✅ 点击故事，内容应正常显示

---

### 阶段5：错误处理测试

#### Test 5.1: Token无效
1. 打开GitHub设置
2. 清除Token，输入错误Token
3. 点击保存
4. ✅ 应显示错误Toast："Token 验证失败，请检查 Token 是否正确"

#### Test 5.2: 网络错误模拟
1. 断开网络连接
2. 刷新页面
3. ✅ 应自动降级到本地文件模式
4. ✅ 控制台应显示降级警告

---

## 预期结果

### 成功指标
- ✅ 所有Toast通知正常显示
- ✅ 故事可成功保存到GitHub
- ✅ 30秒内可在GitHub Pages查看更新
- ✅ 云端故事有"☁️"图标标记
- ✅ 错误时显示明确错误信息
- ✅ GitHub仓库正确创建并包含所需文件

### 性能指标
- 故事保存时间：< 5秒
- GitHub Pages同步：~30秒
- 故事列表加载：< 3秒
- Toast通知自动消失：5秒

---

## 故障排除

### 问题1：Token验证失败
**原因**：Token无效或权限不足
**解决**：
1. 确保Token有repo权限
2. 检查Token是否过期
3. 重新生成Token

### 问题2：仓库创建失败
**原因**：仓库名已存在或权限不足
**解决**：
1. 检查是否已存在同名仓库
2. 确保Token有创建仓库的权限
3. 手动删除已存在的仓库

### 问题3：故事保存失败
**原因**：网络问题或API限制
**解决**：
1. 检查网络连接
2. 等待一段时间后重试（GitHub API限制）
3. 检查Token权限

### 问题4：GitHub Pages未更新
**原因**：部署延迟或配置问题
**解决**：
1. 确认Pages设置为从main分支部署
2. 等待最长5分钟
3. 在GitHub仓库手动触发Pages重新部署

---

**测试完成标志**：所有测试通过 ✅
