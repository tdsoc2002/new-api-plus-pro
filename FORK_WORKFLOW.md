# Fork 工作流指南

## 概述

本项目是从 [Calcium-Ion/new-api](https://github.com/Calcium-Ion/new-api) fork 而来，采用以下分支策略来平衡自主开发和上游同步。

## 远程仓库配置

```bash
origin   - https://github.com/tdsoc2002/new-api-plus-pro.git (你的 fork)
upstream - https://github.com/Calcium-Ion/new-api.git (上游原仓库)
```

## 分支策略

### 核心分支

1. **`main`** - 你的主分支
   - 包含你的自定义特性和改动
   - 定期从 `upstream/main` 合并更新
   - 这是你的生产分支

2. **`upstream-sync`** - 上游同步分支（建议创建）
   - 纯净的上游代码镜像
   - 用于追踪上游变化
   - 不在此分支开发

3. **`feature/*`** - 功能分支
   - 从 `main` 创建
   - 开发新特性
   - 完成后合并回 `main`

## 工作流程

### 1. 同步上游更新

```bash
# 拉取上游最新代码
git fetch upstream

# 查看上游有哪些新变化
git log HEAD..upstream/main --oneline

# 方式 A：合并上游更新（推荐，保留完整历史）
git checkout main
git merge upstream/main

# 方式 B：变基到上游（如果你的提交很少且想保持线性历史）
git checkout main
git rebase upstream/main

# 解决冲突（如果有）
# 编辑冲突文件，然后：
git add .
git commit  # 如果是 merge
# 或
git rebase --continue  # 如果是 rebase

# 推送到你的 fork
git push origin main
```

### 2. 开发新特性

```bash
# 从 main 创建功能分支
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# 开发和提交
git add .
git commit -m "feat: 你的功能描述"

# 推送到你的 fork
git push origin feature/your-feature-name

# 在 GitHub 上创建 Pull Request 到你自己的 main 分支
# 审查后合并
```

### 3. 定期同步流程（推荐每周或每两周）

```bash
# 1. 拉取上游更新
git fetch upstream

# 2. 查看上游变化
git log HEAD..upstream/main --oneline --graph

# 3. 切换到 main 并合并
git checkout main
git merge upstream/main

# 4. 测试确保一切正常
# 运行测试、构建等

# 5. 推送到你的 fork
git push origin main
```

### 4. 处理冲突策略

当合并上游更新时遇到冲突：

```bash
# 查看冲突文件
git status

# 对于每个冲突文件，决定：
# - 保留你的改动（ours）
# - 接受上游改动（theirs）
# - 手动合并两者

# 示例：完全接受上游的某个文件
git checkout --theirs path/to/file

# 示例：完全保留你的改动
git checkout --ours path/to/file

# 手动编辑后标记为已解决
git add path/to/file

# 完成合并
git commit
```

## 最佳实践

### 1. 保持改动模块化

- 将你的自定义功能尽量独立成新文件
- 避免大量修改上游核心文件
- 如果必须修改核心文件，添加清晰的注释标记：

```go
// CUSTOM: 你的改动说明
// 你的代码
// END CUSTOM
```

### 2. 使用配置而非硬编码

- 优先通过配置文件、环境变量来实现差异化
- 减少对上游代码的直接修改

### 3. 记录你的改动

在 `CUSTOM_FEATURES.md` 中记录你添加的特性：

```markdown
# 自定义特性列表

## 1. 特性名称
- 文件：`path/to/file.go`
- 描述：功能说明
- 原因：为什么需要这个改动
```

### 4. 定期同步

- 不要让你的 fork 落后太多
- 建议每 1-2 周同步一次上游
- 上游有重大更新时及时同步

### 5. 贡献回上游

如果你开发的功能对社区有价值：

```bash
# 1. 从上游 main 创建分支
git checkout -b feature/for-upstream upstream/main

# 2. Cherry-pick 你的提交或重新实现
git cherry-pick <commit-hash>

# 3. 推送到你的 fork
git push origin feature/for-upstream

# 4. 在 GitHub 上向上游仓库创建 Pull Request
```

## 常见场景

### 场景 1：上游修复了一个 bug，你也遇到了

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### 场景 2：你修改了某个文件，上游也修改了同一个文件

```bash
git fetch upstream
git checkout main
git merge upstream/main
# 解决冲突，优先保留上游的改动，然后重新应用你的逻辑
git add .
git commit
git push origin main
```

### 场景 3：你想测试上游的某个新特性

```bash
# 创建临时分支
git checkout -b test/upstream-feature upstream/main

# 测试...

# 如果满意，合并到 main
git checkout main
git merge test/upstream-feature

# 或者放弃
git checkout main
git branch -D test/upstream-feature
```

### 场景 4：上游重构了代码结构

这是最复杂的情况，建议：

1. 先在新分支测试上游的重构
2. 评估你的自定义功能受影响程度
3. 决定是否跟随重构，或暂时保持旧结构
4. 如果跟随，可能需要重写部分自定义代码

## 工具命令

### 查看你相对上游的改动

```bash
# 查看你添加的提交
git log upstream/main..main --oneline

# 查看文件差异
git diff upstream/main..main

# 查看具体某个文件的差异
git diff upstream/main..main -- path/to/file
```

### 查看上游的新提交

```bash
git fetch upstream
git log main..upstream/main --oneline
```

### 创建上游镜像分支（可选）

```bash
# 创建纯净的上游镜像
git checkout -b upstream-sync upstream/main
git push origin upstream-sync

# 以后更新
git checkout upstream-sync
git pull upstream main
git push origin upstream-sync
```

## 紧急回滚

如果合并上游后出现严重问题：

```bash
# 查看合并前的提交
git reflog

# 回滚到合并前（假设是 HEAD@{1}）
git reset --hard HEAD@{1}

# 强制推送（谨慎！）
git push origin main --force
```

## 总结

- **origin** = 你的 fork（你有写权限）
- **upstream** = 原仓库（只读）
- **main** = 你的主分支（包含自定义功能）
- **定期同步** = 保持与上游同步
- **模块化开发** = 减少冲突
- **记录改动** = 方便维护

遵循这个工作流，你就能在享受上游更新的同时，保持自己的特性开发。
