# OAuth Provider 功能翻译补丁

## 需要添加到翻译文件的内容

### 中文翻译 (zh.json)

在 `web/default/src/i18n/locales/zh.json` 的 `translation` 对象中添加以下翻译：

```json
"OAuth Applications": "OAuth 应用",
"OAuth Authorizations": "OAuth 授权",
"Create OAuth Application": "创建 OAuth 应用",
"Edit OAuth Application": "编辑 OAuth 应用",
"Application Name": "应用名称",
"My Application": "我的应用",
"Application description": "应用描述",
"Redirect URIs": "回调地址",
"JSON array of allowed redirect URIs": "允许的回调地址（JSON 数组格式）",
"Space-separated list of OAuth scopes": "OAuth 权限范围（空格分隔）",
"Require HTTPS": "强制 HTTPS",
"Enforce HTTPS for all redirect URIs. Recommended for production.": "强制所有回调地址使用 HTTPS。推荐生产环境使用。",
"Required": "必需",
"Optional": "可选",
"Client ID": "客户端 ID",
"Client Secret": "客户端密钥",
"Client Secret (Only shown once)": "客户端密钥（只显示一次）",
"Copy Client ID": "复制客户端 ID",
"Copy Client Secret": "复制客户端密钥",
"Regenerate Secret": "重新生成密钥",
"Are you sure you want to regenerate the client secret?": "确定要重新生成客户端密钥吗？",
"This will invalidate the old secret immediately.": "这将立即使旧密钥失效。",
"Authorize Application": "授权应用",
"wants to access your account": "想要访问你的账号",
"This application will be able to:": "此应用将能够：",
"Basic identity information": "基本身份信息",
"Your username and display name": "你的用户名和显示名称",
"Your email address": "你的邮箱地址",
"By authorizing, you allow this application to access the information listed above. You can revoke access at any time from your account settings.": "授权后，你允许此应用访问上述信息。你可以随时在账号设置中撤销访问权限。",
"Deny": "拒绝",
"Authorize": "授权",
"Redirecting to:": "重定向到：",
"Authorization Error": "授权错误",
"Back to Home": "返回首页",
"Failed to load authorization request": "加载授权请求失败",
"Authorization failed": "授权失败",
"Manage applications that have access to your account": "管理有权访问你账号的应用",
"You have not authorized any applications yet": "你还没有授权任何应用",
"Revoking authorization will immediately revoke all access tokens for that application. The application will need to request authorization again.": "撤销授权将立即撤销该应用的所有访问令牌。应用需要重新请求授权。",
"Authorized on": "授权于",
"Revoke": "撤销",
"Permissions:": "权限：",
"Revoke Authorization": "撤销授权",
"Are you sure you want to revoke authorization for": "确定要撤销对以下应用的授权吗",
"This will immediately revoke all access tokens. The application will need to request authorization again to access your account.": "这将立即撤销所有访问令牌。应用需要重新请求授权才能访问你的账号。",
"Authorization revoked successfully": "授权已成功撤销",
"Failed to revoke authorization": "撤销授权失败",
"Failed to load authorizations": "加载授权列表失败",
"Access your": "访问你的"
```

### 英文翻译 (en.json)

英文翻译通常使用 key 本身，但如果需要明确添加，可以添加以下内容：

```json
"OAuth Applications": "OAuth Applications",
"OAuth Authorizations": "OAuth Authorizations",
"Create OAuth Application": "Create OAuth Application",
"Edit OAuth Application": "Edit OAuth Application",
"Application Name": "Application Name",
"My Application": "My Application",
"Application description": "Application description",
"Redirect URIs": "Redirect URIs",
"JSON array of allowed redirect URIs": "JSON array of allowed redirect URIs",
"Space-separated list of OAuth scopes": "Space-separated list of OAuth scopes",
"Require HTTPS": "Require HTTPS",
"Enforce HTTPS for all redirect URIs. Recommended for production.": "Enforce HTTPS for all redirect URIs. Recommended for production.",
"Required": "Required",
"Optional": "Optional",
"Client ID": "Client ID",
"Client Secret": "Client Secret",
"Client Secret (Only shown once)": "Client Secret (Only shown once)",
"Copy Client ID": "Copy Client ID",
"Copy Client Secret": "Copy Client Secret",
"Regenerate Secret": "Regenerate Secret",
"Are you sure you want to regenerate the client secret?": "Are you sure you want to regenerate the client secret?",
"This will invalidate the old secret immediately.": "This will invalidate the old secret immediately.",
"Authorize Application": "Authorize Application",
"wants to access your account": "wants to access your account",
"This application will be able to:": "This application will be able to:",
"Basic identity information": "Basic identity information",
"Your username and display name": "Your username and display name",
"Your email address": "Your email address",
"By authorizing, you allow this application to access the information listed above. You can revoke access at any time from your account settings.": "By authorizing, you allow this application to access the information listed above. You can revoke access at any time from your account settings.",
"Deny": "Deny",
"Authorize": "Authorize",
"Redirecting to:": "Redirecting to:",
"Authorization Error": "Authorization Error",
"Back to Home": "Back to Home",
"Failed to load authorization request": "Failed to load authorization request",
"Authorization failed": "Authorization failed",
"Manage applications that have access to your account": "Manage applications that have access to your account",
"You have not authorized any applications yet": "You have not authorized any applications yet",
"Revoking authorization will immediately revoke all access tokens for that application. The application will need to request authorization again.": "Revoking authorization will immediately revoke all access tokens for that application. The application will need to request authorization again.",
"Authorized on": "Authorized on",
"Revoke": "Revoke",
"Permissions:": "Permissions:",
"Revoke Authorization": "Revoke Authorization",
"Are you sure you want to revoke authorization for": "Are you sure you want to revoke authorization for",
"This will immediately revoke all access tokens. The application will need to request authorization again to access your account.": "This will immediately revoke all access tokens. The application will need to request authorization again to access your account.",
"Authorization revoked successfully": "Authorization revoked successfully",
"Failed to revoke authorization": "Failed to revoke authorization",
"Failed to load authorizations": "Failed to load authorizations",
"Access your": "Access your"
```

## 如何添加翻译

### 方法 1: 手动添加（推荐）

1. 打开 `web/default/src/i18n/locales/zh.json`
2. 在 `translation` 对象中按字母顺序添加上述翻译
3. 保存文件

### 方法 2: 使用 i18n 同步工具

如果项目有 i18n 同步工具，可以运行：

```bash
cd web/default
bun run i18n:sync
```

## 注意事项

1. **字母顺序**：翻译文件中的 key 是按字母顺序排列的，添加时请保持顺序
2. **JSON 格式**：确保添加的内容符合 JSON 格式，注意逗号和引号
3. **其他语言**：如果需要支持其他语言（fr、ja、ru、vi），也需要添加相应的翻译

## 验证

添加翻译后，重启前端开发服务器：

```bash
cd web/default
bun run dev
```

然后访问 OAuth Applications 页面，检查所有文本是否正确显示中文。

## 当前状态

- ✅ 功能代码已完成
- ⚠️ 翻译需要手动添加到翻译文件
- ✅ 菜单项已添加到侧边栏

添加翻译后，OAuth Provider 功能将完全支持中英文界面。
