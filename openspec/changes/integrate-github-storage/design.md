# GitHub Cloud Storage - Design Document

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                        │
├─────────────────────────────────────────────────────────┤
│  index.html                                             │
│  ├─ LocalStorage (API Token)                           │
│  ├─ GitHub API Client                                  │
│  └─ UI Components                                      │
└─────────────────────────────────────────────────────────┘
           │                                    │
           │ HTTPS/API                         │
           │                                    │
┌─────────────────────────────────────────────────────────┐
│              GitHub API (api.github.com)               │
├─────────────────────────────────────────────────────────┤
│  ├─ /repos (创建/获取仓库)                             │
│  ├─ /repos/{owner}/{repo}/contents (文件CRUD)          │
│  └─ /repos/{owner}/{repo}/contents/stories.json        │
└─────────────────────────────────────────────────────────┘
           │
           │ GitHub Pages
           │
┌─────────────────────────────────────────────────────────┐
│               Static Website (GitHub Pages)             │
├─────────────────────────────────────────────────────────┤
│  ├─ index.html                                         │
│  ├─ stories.json                                       │
│  └─ story/*.md                                         │
└─────────────────────────────────────────────────────────┘
```

## Key Components

### 1. GitHub Repository Manager
**Purpose**: 自动创建和管理GitHub仓库

**Operations**:
- 检查仓库是否存在
- 创建公开仓库（用于GitHub Pages）
- 初始化基础文件结构

**Implementation**:
```javascript
async function ensureRepository() {
  const repoName = 'fairy-tales-geliya23';
  // Check if exists
  // Create if not exists
  // Initialize files
}
```

### 2. File Storage Manager
**Purpose**: 管理故事文件的创建和更新

**Operations**:
- 创建新故事文件：`story/ai_generated_story_[timestamp].md`
- 更新stories.json列表
- 使用GitHub Contents API

**Implementation Strategy**:
- 先获取现有stories.json的SHA
- 添加新故事到列表
- 使用PUT /contents接口更新

### 3. Authentication Manager
**Purpose**: 安全管理GitHub Token

**Security Model**:
- Token存储：localStorage（仅客户端）
- 权限范围：repo（完整仓库权限）
- 传输安全：HTTPS only
- 零后端：所有API调用从客户端发起

### 4. Fallback Strategy
**Purpose**: 确保服务可用性

**Hierarchical Fallback**:
1. 优先：GitHub API
2. 降级：本地fetch stories.json
3. 兜底：静态HTML故事

**Error Handling**:
- 网络错误 → 自动重试（3次）
- 认证错误 → 提示重新配置
- 权限错误 → 提示检查Token权限
- API限制 → 显示限流提示

## Data Flow

### Story Save Flow
```
User clicks Save
    ↓
Validate story format
    ↓
Create markdown file
    ↓
Update stories.json
    ↓
GitHub API call
    ↓
Success → Show notification
    ↓
GitHub Pages auto-deploy (30s delay)
```

### Story Load Flow
```
Page load
    ↓
Try GitHub API first
    ↓
If fails → Try local fetch
    ↓
If fails → Show error
    ↓
Render story list
```

## API Endpoints Used

| Endpoint | Method | Purpose | Rate Limit |
|----------|--------|---------|------------|
| /repos/{owner}/{repo} | GET | 检查仓库存在 | 60/hour |
| /repos | POST | 创建仓库 | 50/hour |
| /repos/{owner}/{repo}/contents/{path} | GET | 读取文件 | 60/hour |
| /repos/{owner}/{repo}/contents/{path} | PUT | 创建/更新文件 | 60/hour |

## Error Handling Strategy

### Network Errors
- **类型**：超时、DNS错误、连接拒绝
- **处理**：显示网络错误提示，提供重试按钮
- **重试**：用户手动触发，不自动重试

### API Errors
- **401 Unauthorized**：Token无效 → 引导重新配置
- **403 Forbidden**：权限不足 → 提示检查Token权限
- **404 Not Found**：仓库或文件不存在 → 自动创建
- **422 Unprocessable**：文件内容无效 → 显示格式错误
- **429 Rate Limit**：API限流 → 显示等待时间

### User Experience
- **加载状态**：每个API调用显示加载动画
- **成功反馈**：显示"已保存到GitHub"通知
- **错误提示**：具体错误信息 + 解决方案
- **降级提示**：切换到本地模式时的说明

## Performance Considerations

### API Efficiency
- **批量操作**：合并文件读取和写入操作
- **缓存策略**：本地缓存stories.json 5分钟
- **并发控制**：串行化文件写入，避免冲突

### GitHub Pages延迟
- **用户期望**：告知用户30秒延迟
- **前端状态**：本地立即更新UI
- **后端同步**：后台自动同步到GitHub Pages

## Security Considerations

### Token Security
- **存储**：localStorage（非HTTPOnly，可被JS读取但不在网络传输）
- **范围**：最小权限原则（仅需要repo权限）
- **传输**：HTTPS加密传输
- **过期**：Token过期后自动提示重新配置

### Data Privacy
- **仓库**：使用公开仓库（GitHub Pages要求）
- **数据**：故事内容公开可见（符合童话故事特性）
- **历史**：GitHub自动保存版本历史

## Monitoring and Observability

### Client-Side Logging
- API调用成功率
- 错误类型统计
- 用户操作路径

### GitHub Webhooks (可选)
- 仓库创建事件
- 文件更新事件
- Pages部署状态

---
**Design Version**: 1.0
**Last Updated**: 2025-11-01
