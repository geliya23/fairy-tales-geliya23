# GitHub Pages 部署指南

## 问题：404错误
**原因**：文件尚未推送到GitHub仓库

---

## 解决方案：推送文件到GitHub

### 方法一：使用Git命令行（推荐）

```bash
# 1. 进入项目目录
cd /Users/songchaoping/Code/Python/novel

# 2. 初始化Git仓库（如果尚未初始化）
git init

# 3. 添加远程仓库
git remote add origin https://github.com/geliya23/fairy-tales-geliya23.git

# 4. 添加所有文件
git add .

# 5. 提交更改
git commit -m "Initial commit: Add fairy tales website"

# 6. 推送到main分支
git branch -M main
git push -u origin main
```

### 方法二：使用GitHub Desktop

1. 下载并安装 [GitHub Desktop](https://desktop.github.com/)
2. 点击 "Add an Existing Repository from your Hard Drive"
3. 选择 `/Users/songchaoping/Code/Python/novel` 目录
4. 点击 "Publish repository"
5. 填写：
   - Name: `fairy-tales-geliya23`
   - Description: `我的童话故事集`
   - ✅ Public (公开)
6. 点击 "Publish Repository"

### 方法三：使用GitHub Web Interface

1. 访问：https://github.com/new
2. Repository name: `fairy-tales-geliya23`
3. Description: `我的童话故事集`
4. ✅ Public
5. ✅ Add a README file
6. Click "Create repository"

然后上传文件：
1. 点击 "uploading an existing file"
2. 拖拽或选择所有文件：
   - `index.html`
   - `stories.json`
   - `story/` 目录及其所有文件
3. Commit changes

---

## 推送后：配置GitHub Pages

1. 访问：https://github.com/geliya23/fairy-tales-geliya23/settings/pages
2. Source: 选择 "Deploy from a branch"
3. Branch: 选择 "main"
4. 点击 "Save"
5. 等待 5-10 分钟

---

## 验证部署

### 检查1：仓库文件
访问：https://github.com/geliya23/fairy-tales-geliya23
✅ 确认能看到：
- `index.html`
- `stories.json`
- `story/` 目录（包含4个.md文件）

### 检查2：Pages设置
访问：https://github.com/geliya23/fairy-tales-geliya23/settings/pages
✅ 应该显示：
- Source: Deploy from a branch
- Branch: main
- 状态：正在部署 或 部署成功

### 检查3：访问网站
访问：https://geliya23.github.io/fairy-tales-geliya23/
✅ 应该能看到网站首页

---

## 文件清单

**确保以下文件在仓库根目录**：

✅ `index.html` (56KB) - 主页面
✅ `stories.json` (327B) - 故事列表
✅ `story/` 目录 - 故事文件目录
  ✅ `the_little_mouse_and_the_sunstone_berry.md` (5.3KB)
  ✅ `the_clever_fox.md` (1KB)
  ✅ `the_brave_hedgehog.md` (6.1KB)
  ✅ `the_singing_lark.md` (5.4KB)

---

## 常见问题

### Q: GitHub显示仓库为空
**A**: 检查是否正确推送到main分支，可能推送到了master或gh-pages分支

### Q: 推送时提示认证失败
**A**: 需要GitHub Personal Access Token或SSH密钥
- 使用Token：用户名输入 `geliya23`，密码输入Token
- 配置SSH：参考GitHub SSH配置指南

### Q: Pages仍显示404
**A**:
1. 确认文件在main分支
2. 确认index.html在仓库根目录
3. 等待最多24小时（DNS传播）
4. 尝试清除浏览器缓存

### Q: Custom domain错误
**A**:
1. 在Pages设置中删除Custom domain
2. 确保 "Enforce HTTPS" 未勾选
3. 等待5-10分钟重新部署

---

## 部署后测试

**完整流程测试**：

1. **基础功能**：
   - ✅ 打开网站
   - ✅ 故事列表显示
   - ✅ 点击故事加载内容

2. **AI生成功能**：
   - ✅ 点击"云存储设置"
   - ✅ 配置GitHub Token
   - ✅ 点击"AI生成故事"
   - ✅ 输入提示词生成故事
   - ✅ 保存故事到GitHub

3. **GitHub Pages**：
   - ✅ 访问 https://geliya23.github.io/fairy-tales-geliya23/
   - ✅ 所有功能正常工作
   - ✅ 新故事30秒内可见

---

## 成功标志

✅ **GitHub仓库**：https://github.com/geliya23/fairy-tales-geliya23
✅ **GitHub Pages**：https://geliya23.github.io/fairy-tales-geliya23/
✅ **所有文件可见且完整**

---

**下一步**：选择一种方法完成部署，然后配置GitHub Pages
