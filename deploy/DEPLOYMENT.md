# New-API 自动部署指南

本指南将帮助你配置从 GitHub 推送代码到自动部署到生产服务器的完整流程。

## 📋 前置条件

- Ubuntu 服务器（2GB 内存 / 2 核 CPU）
- 服务器 IP: 43.167.205.250
- GitHub 仓库已配置

---

## 🚀 快速开始

### 第一步：初始化服务器

1. **SSH 登录到服务器**：
```bash
ssh root@43.167.205.250
```

2. **下载并执行初始化脚本**：
```bash
# 下载脚本
curl -o server-init.sh https://raw.githubusercontent.com/YOUR_USERNAME/new-api-plus-pro/main/deploy/server-init.sh

# 或者手动创建脚本文件
nano server-init.sh
# 粘贴 deploy/server-init.sh 的内容

# 执行脚本
chmod +x server-init.sh
./server-init.sh
```

3. **保存输出的 SESSION_SECRET**（后面需要用到）

4. **创建生产环境配置**：
```bash
cd /opt/new-api
nano .env
```

填入以下内容（修改密码）：
```bash
VERSION=latest
SESSION_SECRET=<刚才脚本输出的值>
REDIS_PASSWORD=<生成一个强密码>
```

生成强密码的方法：
```bash
openssl rand -base64 32
```

---

### 第二步：配置 GitHub Secrets

在 GitHub 仓库页面：

1. 进入 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**，添加以下 3 个 secrets：

| Name | Value | 说明 |
|------|-------|------|
| `SERVER_HOST` | `43.167.205.250` | 服务器 IP |
| `SERVER_USER` | `root` | SSH 用户名 |
| `SSH_PRIVATE_KEY` | `<你的私钥内容>` | SSH 私钥 |

**获取 SSH 私钥**：
```bash
# 在你的本地电脑执行
cat ~/.ssh/id_ed25519
```

复制全部内容（包括 `-----BEGIN` 和 `-----END` 行）粘贴到 GitHub Secret。

---

### 第三步：测试自动部署

1. **提交代码到 main 分支**：
```bash
git add .
git commit -m "feat: setup auto deployment"
git push origin main
```

2. **查看部署进度**：
   - 进入 GitHub 仓库的 **Actions** 标签
   - 查看最新的 workflow 运行状态

3. **部署成功后访问**：
```
http://43.167.205.250:3000
```

---

## 📊 服务器管理命令

### 查看服务状态
```bash
cd /opt/new-api
docker-compose -f docker-compose.prod.yml ps
```

### 查看日志
```bash
# 查看应用日志
docker-compose -f docker-compose.prod.yml logs -f new-api

# 查看 Redis 日志
docker-compose -f docker-compose.prod.yml logs -f redis
```

### 重启服务
```bash
docker-compose -f docker-compose.prod.yml restart
```

### 停止服务
```bash
docker-compose -f docker-compose.prod.yml down
```

### 查看资源占用
```bash
# 查看容器资源
docker stats --no-stream

# 查看系统内存
free -h

# 查看磁盘空间
df -h
```

---

## 🔧 故障排查

### 部署失败

1. **查看 GitHub Actions 日志**：
   - 进入 Actions 标签查看详细错误信息

2. **SSH 到服务器查看容器日志**：
```bash
cd /opt/new-api
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### 服务无法访问

1. **检查容器是否运行**：
```bash
docker ps
```

2. **检查防火墙**：
```bash
sudo ufw status
# 如果 3000 端口未开放
sudo ufw allow 3000/tcp
```

3. **检查健康状态**：
```bash
curl http://localhost:3000/api/status
```

### 内存不足

1. **查看内存使用**：
```bash
free -h
docker stats --no-stream
```

2. **如果 swap 未启用**：
```bash
sudo swapon -s
# 如果没有输出，重新执行初始化脚本中的 swap 配置部分
```

---

## 🔒 安全建议

### 1. 修改 root 密码（重要！）
```bash
passwd
```

### 2. 禁用密码登录（只允许 SSH 密钥）
```bash
sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

### 3. 创建非 root 用户
```bash
adduser deploy
usermod -aG sudo,docker deploy

# 为新用户配置 SSH 密钥
su - deploy
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# 粘贴你的公钥
chmod 600 ~/.ssh/authorized_keys
```

然后修改 GitHub Secret `SERVER_USER` 为 `deploy`。

### 4. 配置自动安全更新
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 📈 性能优化

### 1. 启用 HTTP/2 和 HTTPS（可选）

使用 Caddy 作为反向代理（自动 HTTPS）：

```bash
# 安装 Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# 配置 Caddy
sudo nano /etc/caddy/Caddyfile
```

添加以下内容：
```
your-domain.com {
    reverse_proxy localhost:3000
}
```

```bash
sudo systemctl restart caddy
```

### 2. 监控和告警

安装 Netdata（轻量级监控）：
```bash
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

访问 `http://43.167.205.250:19999` 查看监控面板。

---

## 🔄 回滚到上一个版本

如果新版本有问题，快速回滚：

```bash
cd /opt/new-api

# 查看可用的镜像版本
docker images new-api

# 回滚到指定版本
docker-compose -f docker-compose.prod.yml down
docker tag new-api:<old-version> new-api:latest
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 支持

如有问题，请查看：
- GitHub Issues: https://github.com/YOUR_USERNAME/new-api-plus-pro/issues
- 服务器日志: `/opt/new-api/logs/`
- Docker 日志: `docker-compose logs`

---

## 📝 更新日志

- 2026-05-19: 初始版本，支持自动部署
