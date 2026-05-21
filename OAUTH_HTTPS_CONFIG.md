# OAuth HTTPS 强制执行配置功能

## 概述

为 OAuth 2.0 Provider 功能添加了可选的 HTTPS 强制执行配置，允许每个 OAuth 应用单独设置是否要求 HTTPS redirect URIs。

## 功能特性

### 1. 灵活的安全配置
- ✅ **每应用独立配置**：每个 OAuth 客户端可以单独设置是否强制 HTTPS
- ✅ **默认安全**：新创建的应用默认启用 HTTPS 强制执行
- ✅ **开发友好**：开发环境可以关闭 HTTPS 要求，允许 `http://localhost` 回调
- ✅ **生产安全**：生产环境推荐启用 HTTPS 强制执行

### 2. 工作原理

当 OAuth 客户端启用 "Require HTTPS" 选项时：
- ✅ 只允许 `https://` 开头的 redirect_uri
- ❌ 拒绝所有 `http://` 开头的 redirect_uri
- 返回错误：`"This client requires HTTPS redirect URIs"`

当 OAuth 客户端关闭 "Require HTTPS" 选项时：
- ✅ 同时允许 `http://` 和 `https://` redirect_uri
- 适用于开发测试环境

## 实现细节

### 后端修改

#### 1. 数据模型 (`model/oauth_client.go`)

添加了 `RequireHttps` 字段：

```go
type OAuthClient struct {
    // ... 其他字段
    RequireHttps bool `json:"require_https" gorm:"default:true"` // Whether to enforce HTTPS for redirect URIs
    // ... 其他字段
}
```

- 默认值：`true`（推荐生产环境使用）
- 数据库会自动迁移添加此字段

#### 2. 控制器 (`controller/oauth_provider.go`)

**响应结构体更新**：
```go
type OAuthClientResponse struct {
    // ... 其他字段
    RequireHttps bool `json:"require_https"`
    // ... 其他字段
}
```

**创建请求结构体**：
```go
type CreateOAuthClientRequest struct {
    // ... 其他字段
    RequireHttps *bool `json:"require_https"` // Pointer to distinguish between false and not provided
}
```

**更新请求结构体**：
```go
type UpdateOAuthClientRequest struct {
    // ... 其他字段
    RequireHttps *bool `json:"require_https"`
}
```

**授权流程验证** (`OAuthAuthorize` 函数)：
```go
// Check HTTPS requirement if enabled for this client
if client.RequireHttps && !strings.HasPrefix(redirectUri, "https://") {
    c.JSON(http.StatusBadRequest, gin.H{
        "error":             "invalid_request",
        "error_description": "This client requires HTTPS redirect URIs",
    })
    return
}
```

### 前端修改

#### 1. 类型定义 (`web/default/src/features/oauth-clients/types.ts`)

```typescript
export const oauthClientSchema = z.object({
  // ... 其他字段
  require_https: z.boolean(),
  // ... 其他字段
})

export interface OAuthClientFormData {
  // ... 其他字段
  require_https?: boolean
}
```

#### 2. 表单组件 (`oauth-clients-mutate-drawer.tsx`)

添加了 Switch 开关：

```tsx
<FormField
  control={form.control}
  name='require_https'
  render={({ field }) => (
    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
      <div className='space-y-0.5'>
        <FormLabel className='text-base'>{t('Require HTTPS')}</FormLabel>
        <FormDescription>
          {t('Enforce HTTPS for all redirect URIs. Recommended for production.')}
        </FormDescription>
      </div>
      <FormControl>
        <Switch
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
    </FormItem>
  )}
/>
```

默认值：
- 新建应用：`true`
- 编辑应用：保持原有值

#### 3. 表格列定义 (`oauth-clients-columns.tsx`)

添加了 HTTPS 状态列：

```tsx
{
  accessorKey: 'require_https',
  header: t('HTTPS'),
  cell: ({ row }) => (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
      row.original.require_https
        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
        : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
    }`}>
      {row.original.require_https ? t('Required') : t('Optional')}
    </span>
  ),
}
```

显示效果：
- 启用：蓝色徽章 "Required"
- 关闭：黄色徽章 "Optional"

## 使用指南

### 创建 OAuth 应用

1. 登录管理后台
2. 进入 "OAuth Applications" 页面
3. 点击 "Create Application"
4. 填写应用信息
5. **配置 HTTPS 要求**：
   - ✅ 开启（推荐）：生产环境使用，只允许 HTTPS 回调
   - ❌ 关闭：开发环境使用，允许 HTTP 回调（如 `http://localhost:3000`）

### 编辑现有应用

1. 在 OAuth 应用列表中找到目标应用
2. 点击操作菜单 → "Edit"
3. 切换 "Require HTTPS" 开关
4. 保存更改

### 授权流程

当第三方应用发起授权请求时：

```
GET /api/oauth2/authorize?
  client_id=xxx&
  redirect_uri=http://localhost:3000/callback&  # HTTP 回调
  response_type=code&
  scope=openid profile email
```

**如果客户端启用了 "Require HTTPS"**：
```json
{
  "error": "invalid_request",
  "error_description": "This client requires HTTPS redirect URIs"
}
```

**如果客户端关闭了 "Require HTTPS"**：
- 正常处理授权请求
- 允许 HTTP 和 HTTPS 回调

## 安全建议

### 生产环境
- ✅ **务必启用** "Require HTTPS" 选项
- ✅ 配置 Nginx/Caddy 强制 HTTPS 重定向
- ✅ 使用有效的 SSL/TLS 证书
- ❌ 不要在生产环境使用 HTTP 回调

### 开发环境
- ✅ 可以关闭 "Require HTTPS" 以便本地测试
- ✅ 使用 `http://localhost` 或 `http://127.0.0.1` 回调
- ⚠️ 开发完成后，切换到 HTTPS 进行最终测试

### 最佳实践
1. **分离开发和生产应用**：
   - 开发应用：关闭 HTTPS 要求，使用 localhost 回调
   - 生产应用：启用 HTTPS 要求，使用真实域名回调

2. **渐进式迁移**：
   - 先在开发环境测试 HTTP 回调
   - 配置好 HTTPS 后，创建新的生产应用并启用 HTTPS 要求
   - 逐步迁移用户到新应用

3. **监控和审计**：
   - 定期检查哪些应用关闭了 HTTPS 要求
   - 对于生产应用，确保 HTTPS 要求已启用

## 数据库迁移

新字段会在服务启动时自动迁移：

```sql
-- SQLite / MySQL
ALTER TABLE oauth_clients ADD COLUMN require_https BOOLEAN DEFAULT 1;

-- PostgreSQL
ALTER TABLE oauth_clients ADD COLUMN require_https BOOLEAN DEFAULT true;
```

现有的 OAuth 客户端会自动获得默认值 `true`（启用 HTTPS 要求）。

## 故障排查

### 问题：授权请求返回 "This client requires HTTPS redirect URIs"

**原因**：客户端启用了 HTTPS 强制执行，但使用了 HTTP redirect_uri

**解决方案**：
1. **开发环境**：在 OAuth 应用管理页面关闭 "Require HTTPS" 选项
2. **生产环境**：将 redirect_uri 改为 HTTPS（如 `https://example.com/callback`）

### 问题：无法在本地测试 OAuth 授权

**原因**：本地开发使用 `http://localhost`，但客户端启用了 HTTPS 要求

**解决方案**：
1. 创建一个专门用于开发的 OAuth 应用
2. 关闭该应用的 "Require HTTPS" 选项
3. 配置 redirect_uri 为 `http://localhost:3000/callback`

### 问题：生产环境误关闭了 HTTPS 要求

**影响**：安全风险，可能遭受中间人攻击

**解决方案**：
1. 立即编辑该 OAuth 应用
2. 启用 "Require HTTPS" 选项
3. 通知所有使用该应用的第三方更新 redirect_uri 为 HTTPS

## 相关文件

### 后端
- `model/oauth_client.go` - 数据模型
- `controller/oauth_provider.go` - 控制器逻辑

### 前端
- `web/default/src/features/oauth-clients/types.ts` - 类型定义
- `web/default/src/features/oauth-clients/components/oauth-clients-mutate-drawer.tsx` - 表单组件
- `web/default/src/features/oauth-clients/components/oauth-clients-columns.tsx` - 表格列定义

### 文档
- `OAUTH_PROVIDER.md` - 完整文档
- `OAUTH_PROVIDER_README.md` - 快速开始指南

## 总结

HTTPS 强制执行配置功能提供了灵活的安全选项：

- ✅ **生产环境**：启用 HTTPS 要求，确保安全
- ✅ **开发环境**：关闭 HTTPS 要求，方便测试
- ✅ **每应用独立**：不同应用可以有不同的配置
- ✅ **默认安全**：新应用默认启用 HTTPS 要求

这种设计既保证了生产环境的安全性，又不影响开发体验。
