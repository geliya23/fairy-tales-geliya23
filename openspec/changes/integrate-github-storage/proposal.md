# Integrate GitHub Cloud Storage - Change Proposal

## Summary
当前的故事网站缺乏持久化存储，AI生成的故事只能下载为文件后手动保存到story目录。这导致用户体验不佳，数据无法跨设备同步。本提案旨在集成GitHub API，实现故事的云端存储和多设备同步。

## Why
当前实现存在严重缺陷：
1. **手动流程繁琐**：用户需要下载文件 → 手动上传到服务器 → 编辑stories.json → 重新部署，至少需要5-10分钟
2. **技术门槛高**：普通用户无法独立完成文件管理和JSON编辑
3. **数据孤岛**：生成的故事只存在本地设备，换电脑或清除缓存就会丢失
4. **无法分享**：没有云端存储就无法向他人分享或在不同设备访问

GitHub API集成能彻底解决这些问题：
- ✅ **一键保存**：点击按钮即可完成保存，无需手动操作
- ✅ **零门槛**：无需文件管理知识，UI自动处理所有技术细节
- ✅ **永久保存**：云端存储永不丢失，自动版本控制
- ✅ **即时分享**：生成的故事立即可通过URL分享给任何人
- ✅ **零成本**：GitHub免费层即可满足需求
- ✅ **自动部署**：GitHub Pages自动同步，30秒内全球可见

这不仅是技术改进，更是用户体验的根本性提升，将童话故事平台从一个静态展示网站转变为真正的云端创作平台。

## Problem Statement
1. **数据持久化问题**：AI生成的故事缺乏持久化存储位置
2. **跨域限制**：本地文件无法通过JavaScript直接保存
3. **用户体验差**：需要手动下载、上传、编辑stories.json
4. **数据丢失风险**：浏览器缓存清除或设备故障导致数据丢失
5. **无法多设备访问**：数据仅存在于单个设备上

## Proposed Solution
集成GitHub API作为后端存储服务：
- 自动创建GitHub仓库（fairy-tales-geliya23）
- 实现故事文件的云端创建和管理
- 自动更新stories.json列表
- 支持GitHub Pages自动部署更新

## Change Scope
### In Scope
- GitHub仓库自动创建（如果不存在）
- GitHub API认证和管理
- 故事文件云端保存功能
- stories.json自动更新
- GitHub Pages部署集成
- UI优化和错误处理

### Out of Scope
- 用户认证系统（使用GitHub Token替代）
- 故事编辑功能
- 故事删除功能
- 版本控制系统

## Benefits
1. **零成本**：使用GitHub免费层（公开仓库）
2. **高可用**：99.9%可用性，自动备份
3. **多设备同步**：任何设备访问相同URL即可查看
4. **自动部署**：GitHub Pages自动更新内容
5. **版本历史**：GitHub自动维护修改历史

## Risks and Mitigations
1. **Token泄露风险**：仅存储在localStorage，不发送到服务器
2. **API限制**：GitHub API有速率限制，添加节流机制
3. **网络依赖**：保留本地文件作为降级方案
4. **仓库可见性**：需要公开仓库或Pro账号

## Success Criteria
- ✅ 用户能够一键保存故事到云端
- ✅ 保存后30秒内可在GitHub Pages看到更新
- ✅ 支持跨设备访问保存的故事
- ✅ 错误时提供清晰提示
- ✅ 保留本地文件作为备用方案

## Dependencies
- GitHub账户和Personal Access Token
- GitHub Pages功能启用
- 网络连接可用

## Timeline
预计实施时间：30-45分钟

---
**Change ID**: integrate-github-storage
**Author**: Claude Code Assistant
**Date**: 2025-11-01
