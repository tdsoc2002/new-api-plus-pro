# OAuth 2.0 Provider 功能

## 🎉 新功能

本项目现已支持 **OAuth 2.0 Provider** 功能！允许第三方应用使用本平台的账号进行登录授权。

## 快速开始

### 1. 创建 OAuth 应用

管理员登录后，在侧边栏找到 **"OAuth Applications"** 菜单，点击 **"Create Application"** 创建新应用。

### 2. 获取凭证

创建成功后会显示：
- **client_id**: 客户端 ID
- **client_secret**: 客户端密钥（⚠️ 只显示一次，请妥善保存）

### 3. 授权流程

```bash
# 步骤 1: 引导用户授权
https://your-domain.com/api/oauth2/authorize?client_id=xxx&redirect_uri=xxx&response_type=code&scope=openid profile email

# 步骤 2: 用户授权后获取 code
# 重定向到: https://your-callback.com?code=xxx&state=xxx

# 步骤 3: 使用 code 换取 access_token
curl -X POST https://your-domain.com/api/oauth2/token \
  -d "grant_type=authorization_code" \
  -d "code=xxx" \
  -d "client_id=xxx" \
  -d "client_secret=xxx" \
  -d "redirect_uri=xxx"

# 步骤 4: 使用 access_token 获取用户信息
curl -H "Authorization: Bearer xxx" \
  https://your-domain.com/api/oauth2/userinfo
```

## 核心特性

✅ **标准 OAuth 2.0 流程** - Authorization Code Flow  
✅ **安全加密** - client_secret bcrypt 加密存储  
✅ **PKCE 支持** - 增强移动应用安全性  
✅ **Token 管理** - Access Token（1小时）+ Refresh Token（30天）  
✅ **权限控制** - 支持 openid、profile、email 三种 scope  
✅ **HTTPS 强制执行** - 可选的每应用 HTTPS 要求配置  
✅ **多数据库支持** - SQLite、MySQL、PostgreSQL  

## 详细文档

完整的使用指南、API 文档和安全建议，请查看：

👉 **[OAUTH_PROVIDER.md](./OAUTH_PROVIDER.md)**

## API 端点

```
GET  /api/oauth2/authorize      - 授权页面
POST /api/oauth2/authorize      - 确认授权
POST /api/oauth2/token          - 令牌交换
GET  /api/oauth2/userinfo       - 获取用户信息
POST /api/oauth2/revoke         - 撤销令牌

GET    /api/oauth-clients/      - 客户端管理（管理员）
POST   /api/oauth-clients/      - 创建客户端
PUT    /api/oauth-clients/:id   - 更新客户端
DELETE /api/oauth-clients/:id   - 删除客户端
```

## 数据库表

启动服务后会自动创建以下表：
- `oauth_clients` - OAuth 客户端应用
- `oauth_authorization_codes` - 授权码
- `oauth_access_tokens` - 访问令牌
- `oauth_user_consents` - 用户授权记录

## 安全提示

⚠️ **生产环境必须使用 HTTPS**  
⚠️ **client_secret 只在创建时显示一次**  
⚠️ **严格配置 redirect_uri 白名单**  
⚠️ **定期清理过期令牌**  

---

更多详情请查看 [OAUTH_PROVIDER.md](./OAUTH_PROVIDER.md)
