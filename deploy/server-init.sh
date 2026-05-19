#!/bin/bash
set -e

echo "=========================================="
echo "  New API 服务器初始化脚本"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 配置 SSH 密钥（允许 GitHub Actions 自动部署）
echo -e "${GREEN}[1/8] 配置 SSH 密钥...${NC}"
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 添加你本地的公钥
cat >> ~/.ssh/authorized_keys << 'EOF'
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILGF2roybYCD6wyPzuF0v/Aa+9n3/nYG3vFkWYZhpY3P 2776483968@qq.com
EOF

chmod 600 ~/.ssh/authorized_keys
echo -e "${GREEN}✓ SSH 密钥已配置${NC}"

# 2. 更新系统
echo -e "${GREEN}[2/8] 更新系统...${NC}"
apt update && apt upgrade -y

# 3. 安装 Docker
echo -e "${GREEN}[3/8] 安装 Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}✓ Docker 安装完成${NC}"
else
    echo -e "${YELLOW}Docker 已安装，跳过${NC}"
fi

# 4. 安装 docker-compose
echo -e "${GREEN}[4/8] 安装 docker-compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ docker-compose 安装完成${NC}"
else
    echo -e "${YELLOW}docker-compose 已安装，跳过${NC}"
fi

# 5. 配置 swap（2GB）
echo -e "${GREEN}[5/8] 配置 swap...${NC}"
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    echo -e "${GREEN}✓ Swap 配置完成（2GB）${NC}"
else
    echo -e "${YELLOW}Swap 已存在，跳过${NC}"
fi

# 6. 创建部署目录
echo -e "${GREEN}[6/8] 创建部署目录...${NC}"
mkdir -p /opt/new-api/{data,logs}
echo -e "${GREEN}✓ 目录已创建：/opt/new-api${NC}"

# 7. 配置防火墙
echo -e "${GREEN}[7/8] 配置防火墙...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw --force enable
echo -e "${GREEN}✓ 防火墙已配置${NC}"

# 8. 生成配置文件
echo -e "${GREEN}[8/8] 生成配置文件...${NC}"
SESSION_SECRET=$(openssl rand -hex 32)
cat > /opt/new-api/.env << EOF
VERSION=latest
SESSION_SECRET=$SESSION_SECRET
EOF

echo -e "${GREEN}✓ 配置文件已生成${NC}"

# 显示系统信息
echo ""
echo "=========================================="
echo -e "${GREEN}  初始化完成！${NC}"
echo "=========================================="
echo ""
echo "系统信息："
echo "  - 操作系统: $(lsb_release -d | cut -f2)"
echo "  - Docker 版本: $(docker --version)"
echo "  - docker-compose 版本: $(docker-compose --version)"
echo "  - 内存: $(free -h | awk '/^Mem:/ {print $2}')"
echo "  - Swap: $(free -h | awk '/^Swap:/ {print $2}')"
echo "  - 磁盘: $(df -h / | awk 'NR==2 {print $2}')"
echo ""
echo "配置信息："
echo "  - 部署目录: /opt/new-api"
echo "  - SESSION_SECRET: $SESSION_SECRET"
echo ""
echo -e "${YELLOW}重要提示：${NC}"
echo "  1. 请保存上面的 SESSION_SECRET"
echo "  2. 现在可以从本地使用 SSH 密钥登录（无需密码）"
echo "  3. 建议修改 root 密码：passwd"
echo "  4. 建议禁用密码登录（只允许密钥）："
echo "     sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config"
echo "     systemctl restart sshd"
echo ""
