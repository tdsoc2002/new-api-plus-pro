# OAuth 2.0 Provider 功能实现说明

## 概述

本次更新为 new-api 项目添加了完整的 **OAuth 2.0 Provider** 功能，允许第三方应用使用本平台的账号进行登录授权。

## 功能特性

### ✅ 核心功能
- **OAuth 2.0 Authorization Code Flow** - 标准授权码流程
- **客户端管理** - 创建、编辑、删除 OAuth 应用
- **用户授权管理** - 用户可查看和撤销已授权的应用
- **Token 管理** - Access Token（1小时）和 Refresh Token（30天）
- **Scope 权限控制** - 支持 `openid`、`profile`、`email` 三种权限范围
- **HTTPS 强制执行** - 可选的每应用 HTTPS 要求配置

### 🔐 安全特性
- ✅ **client_secret 加密存储** - 使用 bcrypt 加密，创建时仅显示一次
- ✅ **授权码防重放** - 一次性使用 + 数据库锁 + 10分钟过期
- ✅ **redirect_uri 严格校验** - 完全匹配白名单，防止重定向攻击
- ✅ **PKCE 支持** - 支持 S256 和 plain 方法，增强移动应用安全性
- ✅ **Token 过期机制** - Access Token 1小时，Refresh Token 30天
- ✅ **Scope 最小权限** - 只授予请求的权限范围

### 💾 数据库兼容性
- ✅ 同时支持 **SQLite**、**MySQL**、**PostgreSQL** 三种数据库
- ✅ 使用 GORM 抽象层，避免数据库特定函数
- ✅ 自动迁移，启动时自动创建表结构

---

## 新增文件清单

### 后端文件（Go）

#### 数据模型（`model/`）
- `oauth_client.go` - OAuth 客户端应用管理
- `oauth_authorization_code.go` - 授权码管理（10分钟有效）
- `oauth_access_token.go` - 访问令牌和刷新令牌管理
- `oauth_user_consent.go` - 用户授权记录管理

#### 控制器（`controller/`）
- `oauth_provider.go` - OAuth Provider 完整实现
  - 客户端管理 API（CRUD + 重新生成密钥）
  - OAuth 授权流程（authorize、token、userinfo、revoke）
  - 用户授权管理

#### 中间件（`middleware/`）
- `oauth_token_auth.go` - OAuth access_token 验证中间件

#### 路由（`router/`）
- `api-router.go` - 已添加 OAuth Provider 相关路由

### 前端文件（React + TypeScript）

#### 功能模块（`web/default/src/features/oauth-clients/`）
- `types.ts` - 类型定义
- `api.ts` - API 调用封装
- `index.tsx` - 主页面组件
- `components/oauth-clients-provider.tsx` - 状态管理
- `components/oauth-clients-table.tsx` - 表格主体
- `components/oauth-clients-columns.tsx` - 表格列定义
- `components/oauth-clients-mutate-drawer.tsx` - 创建/编辑表单
- `components/oauth-clients-delete-dialog.tsx` - 删除确认对话框
- `components/oauth-clients-secret-dialog.tsx` - client_secret 显示对话框
- `components/data-table-row-actions.tsx` - 行操作菜单

#### 路由（`web/default/src/routes/`）
- `_authenticated/oauth-clients/index.tsx` - 路由配置（管理员权限）

#### 配置（`web/default/src/hooks/`）
- `use-sidebar-data.ts` - 已添加菜单项
- `use-sidebar-config.ts` - 已添加权限配置

---

## API 端点

### OAuth 授权流程

```
GET  /api/oauth2/authorize      - 授权页面（需要用户登录）
POST /api/oauth2/authorize      - 用户确认授权
POST /api/oauth2/token          - 令牌交换（支持 authorization_code 和 refresh_token）
GET  /api/oauth2/userinfo       - 获取用户信息（需要 OAuth access_token）
POST /api/oauth2/revoke         - 撤销令牌
```

### 客户端管理（管理员权限）

```
GET    /api/oauth-clients/                    - 获取客户端列表
GET    /api/oauth-clients/:id                 - 获取单个客户端
POST   /api/oauth-clients/                    - 创建客户端
PUT    /api/oauth-clients/:id                 - 更新客户端
DELETE /api/oauth-clients/:id                 - 删除客户端
POST   /api/oauth-clients/:id/regenerate-secret - 重新生成 client_secret
```

### 用户授权管理

```
GET    /api/user/oauth-authorizations/           - 查看已授权的应用
DELETE /api/user/oauth-authorizations/:client_id - 撤销授权
```

**前端页面**：
- 授权页面：`/oauth2/authorize` - 用户首次授权应用时显示
- 授权管理：`/oauth-authorizations` - 用户查看和撤销已授权的应用

---

## 使用指南

### 1. 启动服务

启动服务后，数据库会自动创建以下 4 个新表：
- `oauth_clients` - OAuth 客户端应用
- `oauth_authorization_codes` - 授权码
- `oauth_access_tokens` - 访问令牌
- `oauth_user_consents` - 用户授权记录

### 2. 创建 OAuth 应用

**管理员登录后**，在侧边栏找到 **"OAuth Applications"** 菜单：

1. 点击 **"Create Application"** 按钮
2. 填写应用信息：
   - **Application Name**: 应用名称（如 "我的第三方应用"）
   - **Description**: 应用描述（可选）
   - **Redirect URIs**: 回调地址（JSON 数组格式）
     ```json
     ["https://example.com/callback", "http://localhost:3000/callback"]
     ```
   - **Scopes**: 权限范围（默认 `openid profile email`）
   - **Require HTTPS**: 是否强制要求 HTTPS（默认开启，推荐生产环境使用）
     - ✅ 开启：只允许 `https://` 开头的 redirect_uri
     - ❌ 关闭：同时允许 `http://` 和 `https://`（仅用于开发测试）

3. 创建成功后，会显示 **client_id** 和 **client_secret**
   - ⚠️ **client_secret 只显示一次，请妥善保存！**

### 3. OAuth 授权流程示例

#### 步骤 1: 引导用户授权

将用户重定向到授权页面：

```
https://your-domain.com/api/oauth2/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://example.com/callback&
  response_type=code&
  scope=openid profile email&
  state=RANDOM_STATE
```

**参数说明**：
- `client_id`: 你的应用 ID
- `redirect_uri`: 回调地址（必须在白名单中）
- `response_type`: 固定为 `code`
- `scope`: 请求的权限范围（空格分隔）
- `state`: 随机字符串，用于防止 CSRF 攻击

#### 步骤 2: 用户授权后获取授权码

用户授权后，会重定向到你的回调地址：

```
https://example.com/callback?code=AUTHORIZATION_CODE&state=RANDOM_STATE
```

#### 步骤 3: 使用授权码换取 access_token

```bash
curl -X POST https://your-domain.com/api/oauth2/token \
  -d "grant_type=authorization_code" \
  -d "code=AUTHORIZATION_CODE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=https://example.com/callback"
```

**响应示例**：
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_here",
  "scope": "openid profile email"
}
```

#### 步骤 4: 使用 access_token 获取用户信息

```bash
curl -H "Authorization: Bearer ACCESS_TOKEN" \
  https://your-domain.com/api/oauth2/userinfo
```

**响应示例**：
```json
{
  "sub": "123",
  "preferred_username": "johndoe",
  "name": "John Doe",
  "email": "john@example.com",
  "email_verified": true
}
```

#### 步骤 5: 使用 refresh_token 刷新 access_token

```bash
curl -X POST https://your-domain.com/api/oauth2/token \
  -d "grant_type=refresh_token" \
  -d "refresh_token=REFRESH_TOKEN" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

### 4. PKCE 支持（推荐用于移动应用）

PKCE（Proof Key for Code Exchange）增强了授权码流程的安全性，特别适合移动应用。

#### 生成 code_verifier 和 code_challenge

```javascript
// 1. 生成 code_verifier（43-128 个字符的随机字符串）
const codeVerifier = base64UrlEncode(crypto.randomBytes(32))

// 2. 生成 code_challenge（SHA256 哈希）
const codeChallenge = base64UrlEncode(
  crypto.createHash('sha256').update(codeVerifier).digest()
)
```

#### 授权请求（带 PKCE）

```
https://your-domain.com/api/oauth2/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://example.com/callback&
  response_type=code&
  scope=openid profile email&
  state=RANDOM_STATE&
  code_challenge=CODE_CHALLENGE&
  code_challenge_method=S256
```

#### Token 交换（带 PKCE）

```bash
curl -X POST https://your-domain.com/api/oauth2/token \
  -d "grant_type=authorization_code" \
  -d "code=AUTHORIZATION_CODE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=https://example.com/callback" \
  -d "code_verifier=CODE_VERIFIER"
```

### 5. 用户管理已授权应用

用户可以在个人中心查看和撤销已授权的应用：

#### 查看已授权应用

1. 登录后，在侧边栏找到 **"Personal"** 部分
2. 点击 **"OAuth Authorizations"** 菜单项
3. 查看所有已授权的应用列表，包括：
   - 应用名称
   - 授权时间
   - 授权的权限范围（scopes）

#### 撤销授权

1. 在授权列表中找到要撤销的应用
2. 点击 **"Revoke"** 按钮
3. 确认撤销操作
4. 撤销后，该应用的所有 access_token 将立即失效
5. 应用需要重新请求授权才能访问你的账号

#### 授权页面

当第三方应用首次请求授权时：

1. 用户会被重定向到 `/oauth2/authorize` 授权页面
2. 页面显示：
   - 应用名称和描述
   - 请求的权限列表（openid、profile、email）
   - "授权" 和 "拒绝" 按钮
3. 用户点击 "授权" 后：
   - 系统保存授权记录
   - 生成授权码并重定向回应用
4. 用户点击 "拒绝" 后：
   - 重定向回应用，携带 `error=access_denied` 参数

**注意**：如果用户已经授权过该应用，后续授权请求会自动跳过授权页面，直接生成授权码。

---

## 数据库表结构

### oauth_clients（OAuth 客户端应用）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| client_id | varchar(64) | 客户端 ID（唯一） |
| client_secret | varchar(128) | 客户端密钥（bcrypt 加密） |
| name | varchar(128) | 应用名称 |
| description | varchar(512) | 应用描述 |
| redirect_uris | text | 回调地址（JSON 数组） |
| scopes | varchar(256) | 权限范围 |
| enabled | boolean | 是否启用 |
| user_id | int | 创建者 ID |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

### oauth_authorization_codes（授权码）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| code | varchar(64) | 授权码（唯一） |
| client_id | varchar(64) | 客户端 ID |
| user_id | int | 用户 ID |
| redirect_uri | varchar(512) | 回调地址 |
| scopes | varchar(256) | 权限范围 |
| code_challenge | varchar(128) | PKCE 挑战码 |
| code_challenge_method | varchar(16) | PKCE 方法（S256/plain） |
| used | boolean | 是否已使用 |
| expires_at | timestamp | 过期时间（10分钟） |
| created_at | timestamp | 创建时间 |

### oauth_access_tokens（访问令牌）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| access_token | varchar(64) | 访问令牌（唯一） |
| refresh_token | varchar(64) | 刷新令牌（唯一） |
| client_id | varchar(64) | 客户端 ID |
| user_id | int | 用户 ID |
| scopes | varchar(256) | 权限范围 |
| expires_at | timestamp | 访问令牌过期时间（1小时） |
| refresh_expires_at | timestamp | 刷新令牌过期时间（30天） |
| created_at | timestamp | 创建时间 |

### oauth_user_consents（用户授权记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| user_id | int | 用户 ID |
| client_id | varchar(64) | 客户端 ID |
| scopes | varchar(256) | 授权的权限范围 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

**复合唯一索引**: `(user_id, client_id)` - 确保每个用户对每个应用只有一条授权记录

---

## 安全建议

### 生产环境部署

1. **强制 HTTPS**
   - OAuth 2.0 必须在 HTTPS 环境下使用
   - 配置 Nginx/Caddy 强制 HTTPS 重定向
   - 在创建 OAuth 应用时，启用 **"Require HTTPS"** 选项
   - 启用后，系统会拒绝所有 `http://` 开头的 redirect_uri

2. **client_secret 保护**
   - 永远不要在前端代码中暴露 client_secret
   - 只在服务器端使用 client_secret

3. **redirect_uri 白名单**
   - 严格配置允许的回调地址
   - 不要使用通配符或正则表达式

4. **Rate Limiting**
   - 对 `/oauth2/token` 端点进行限流
   - 防止暴力破解 client_secret

5. **定期清理过期令牌**
   - 可以添加定时任务清理过期的授权码和令牌
   - 示例：每天凌晨执行清理

### 开发环境测试

1. **使用 localhost 回调**
   ```json
   ["http://localhost:3000/callback"]
   ```
   - 开发环境可以关闭 **"Require HTTPS"** 选项以允许 HTTP 回调
   - 生产环境务必启用 HTTPS 强制执行

2. **测试工具推荐**
   - Postman - API 测试
   - OAuth 2.0 Playground - 在线测试工具

---

## 故障排查

### 常见问题

#### 1. "invalid_client" 错误
- 检查 client_id 和 client_secret 是否正确
- 确认客户端应用是否已启用

#### 2. "invalid_request" - redirect_uri 错误
- 确认 redirect_uri 完全匹配白名单中的地址
- 注意 URL 末尾的斜杠 `/` 也需要匹配
- 如果客户端启用了 "Require HTTPS"，确保使用 `https://` 而非 `http://`
- 注意 URL 末尾的斜杠 `/` 也需要匹配

#### 3. "invalid_grant" - 授权码无效
- 授权码只能使用一次
- 授权码有效期为 10 分钟
- 确认 redirect_uri 与授权时使用的一致

#### 4. "invalid_token" - 访问令牌无效
- 访问令牌有效期为 1 小时
- 使用 refresh_token 刷新访问令牌

#### 5. PKCE 验证失败
- 确认 code_verifier 与生成 code_challenge 时使用的一致
- 确认 code_challenge_method 正确（S256 或 plain）

---

## 技术实现细节

### Token 生成
- 使用 `common.GenerateRandomKey(32)` 生成 32 字节的随机字符串
- Base64 编码后作为 token

### client_secret 加密
- 使用 bcrypt 算法加密存储
- 成本因子与用户密码相同
- 验证时使用 `common.ValidatePasswordAndHash()`

### 授权码一次性使用
- 使用数据库行锁（`FOR UPDATE`）
- 标记 `used` 字段为 `true`
- 事务保证原子性

### PKCE 验证
- 支持 S256（SHA256）和 plain 两种方法
- S256: `BASE64URL(SHA256(code_verifier)) == code_challenge`
- plain: `code_verifier == code_challenge`

---

## 未来扩展

### 可选功能（未实现）

1. **OpenID Connect 完整支持**
   - ID Token（JWT 格式）
   - Discovery 端点（`/.well-known/openid-configuration`）
   - UserInfo 端点扩展

2. **更多 Grant Types**
   - Client Credentials
   - Password Grant（不推荐）
   - Device Code Flow

3. **高级功能**
   - Token 撤销列表（黑名单）
   - 动态客户端注册
   - JWT 格式的 Access Token
   - 自定义 Scope 和 Claims

4. **管理功能**
   - 客户端使用统计
   - 审计日志
   - Token 使用分析

---

## 相关标准

- [RFC 6749 - OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)
- [RFC 7636 - PKCE](https://tools.ietf.org/html/rfc7636)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)

---

## 许可证

本功能遵循项目原有的 AGPL-3.0 许可证。

---

## 技术支持

如有问题或建议，请提交 Issue 或联系项目维护者。
