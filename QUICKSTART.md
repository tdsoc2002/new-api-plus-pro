# 🚀 快速部署指南

## 第一步：初始化服务器（只需执行一次）

### 1. SSH 登录服务器
```bash
ssh root@43.167.205.250
# 输入密码：123qweasdzxcA!
```

### 2. 执行初始化脚本
```bash
# 下载初始化脚本
curl -o init.sh https://raw.githubusercontent.com/YOUR_USERNAME/new-api-plus-pro/main/deploy/server-init.sh

# 执行
chmod +x init.sh
./init.sh
```

**重要：保存脚本输出的 SESSION_SECRET！**

### 3. 创建配置文件
```bash
cd /opt/new-api
nano .env
```

粘贴以下内容（修改密码）：
```bash
VERSION=latest
SESSION_SECRET=<刚才输出的值>
REDIS_PASSWORD=<生成一个强密码>
```

生成强密码：
```bash
openssl rand -base64 32
```

保存并退出（Ctrl+X, Y, Enter）

---

## 第二步：配置 GitHub Secrets

### 1. 获取 SSH 私钥
在你的**本地电脑**执行：
```bash
cat ~/.ssh/id_ed25519
```

复制全部内容（包括 BEGIN 和 END 行）

### 2. 添加 GitHub Secrets
进入 GitHub 仓库：**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

添加 3 个 secrets：

| Name | Value |
|------|-------|
| `SERVER_HOST` | `43.167.205.250` |
| `SERVER_USER` | `root` |
| `SSH_PRIVATE_KEY` | `<刚才复制的私钥内容>` |

---

## 第三步：推送代码触发自动部署

```bash
# 在本地项目目录
git push origin main
```

然后：
1. 进入 GitHub 仓库的 **Actions** 标签
2. 查看部署进度
3. 等待部署完成（约 3-5 分钟）

部署成功后访问：**http://43.167.205.250:3000**

---

## 🔧 常用命令

### 查看服务状态
```bash
ssh root@43.167.205.250
cd /opt/new-api
docker-compose -f docker-compose.prod.yml ps
```

### 查看日志
```bash
docker-compose -f docker-compose.prod.yml logs -f new-api
```

### 手动重启
```bash
docker-compose -f docker-compose.prod.yml restart
```

---

## ⚠️ 重要提醒

**部署完成后立即修改服务器密码：**
```bash
ssh root@43.167.205.250
passwd
# 输入新密码
```

---

## 📞 遇到问题？

查看详细文档：`deploy/DEPLOYMENT.md`
