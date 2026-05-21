#!/bin/bash
# New API 服务器一键配置脚本
# 使用方法：
#   1. ssh root@43.167.205.250
#   2. 复制此脚本全部内容
#   3. 在服务器上执行：cat > setup.sh
#   4. 粘贴脚本内容，按 Ctrl+D
#   5. 执行：bash setup.sh

set -e

echo "=========================================="
echo "  New API 服务器环境配置"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. 配置 SSH 密钥
echo -e "${GREEN}[1/8] 配置 SSH 密钥...${NC}"
mkdir -p ~/.ssh
chmod 700 ~/.ssh
if ! grep -q "AAAAC3NzaC1lZDI1NTE5AAAAILGF2roybYCD6wyPzuF0v/Aa+9n3/nYG3vFkWYZhpY3P" ~/.ssh/authorized_keys 2>/dev/null; then
    echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILGF2roybYCD6wyPzuF0v/Aa+9n3/nYG3vFkWYZhpY3P 2776483968@qq.com" >> ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
    echo -e "${GREEN}✓ SSH 密钥已添加${NC}"
else
    echo -e "${YELLOW}✓ SSH 密钥已存在${NC}"
fi

# 2. 更新系统
echo ""
echo -e "${GREEN}[2/8] 更新系统...${NC}"
apt update -qq
apt upgrade -y -qq
echo -e "${GREEN}✓ 系统更新完成${NC}"

# 3. 安装 Docker
echo ""
echo -e "${GREEN}[3/8] 安装 Docker...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${YELLOW}✓ Docker 已安装: $(docker --version)${NC}"
else
    echo "正在安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}✓ Docker 安装完成: $(docker --version)${NC}"
fi

# 4. 安装 docker-compose
echo ""
echo -e "${GREEN}[4/8] 安装 docker-compose...${NC}"
if command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}✓ docker-compose 已安装: $(docker-compose --version)${NC}"
else
    echo "正在安装 docker-compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ docker-compose 安装完成: $(docker-compose --version)${NC}"
fi

# 5. 配置 Swap
echo ""
echo -e "${GREEN}[5/8] 配置 Swap (2GB)...${NC}"
if [ -f /swapfile ]; then
    echo -e "${YELLOW}✓ Swap 已存在${NC}"
else
    echo "正在配置 Swap..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    echo -e "${GREEN}✓ Swap 配置完成${NC}"
fi

# 6. 创建部署目录
echo ""
echo -e "${GREEN}[6/8] 创建部署目录...${NC}"
mkdir -p /opt/new-api/{data,logs}
echo -e "${GREEN}✓ 目录已创建: /opt/new-api${NC}"

# 7. 配置防火墙
echo ""
echo -e "${GREEN}[7/8] 配置防火墙...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw --force enable
echo -e "${GREEN}✓ 防火墙已配置${NC}"

# 8. 生成配置文件
echo ""
echo -e "${GREEN}[8/8] 生成配置文件...${NC}"
if [ ! -f /opt/new-api/.env ]; then
    SESSION_SECRET=$(openssl rand -hex 32)
    REDIS_PASSWORD=$(openssl rand -base64 32)
    cat > /opt/new-api/.env << EOF
VERSION=latest
SESSION_SECRET=$SESSION_SECRET
REDIS_PASSWORD=$REDIS_PASSWORD
EOF
    echo -e "${GREEN}✓ 配置文件已生成${NC}"

    echo ""
    echo "=========================================="
    echo -e "${GREEN}  重要信息（请保存到本地）${NC}"
    echo "=========================================="
    echo ""
    echo "SESSION_SECRET: $SESSION_SECRET"
    echo "REDIS_PASSWORD: $REDIS_PASSWORD"
    echo ""
    echo "这些密钥已保存到: /opt/new-api/.env"
else
    echo -e "${YELLOW}✓ 配置文件已存在${NC}"
    echo "当前配置："
    cat /opt/new-api/.env
fi

# 显示系统信息
echo ""
echo "=========================================="
echo -e "${GREEN}  配置完成！系统信息：${NC}"
echo "=========================================="
echo ""
echo "操作系统: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "Docker: $(docker --version)"
echo "docker-compose: $(docker-compose --version)"
echo "内存: $(free -h | awk '/^Mem:/ {print $2}')"
echo "Swap: $(free -h | awk '/^Swap:/ {print $2}')"
echo "磁盘: $(df -h / | awk 'NR==2 {print $2" (已用 "$3", 可用 "$4")"}')"
echo ""
echo "=========================================="
echo -e "${YELLOW}  下一步操作：${NC}"
echo "=========================================="
echo ""
echo "1. 退出服务器: exit"
echo "2. 测试 SSH 密钥登录: ssh root@43.167.205.250"
echo "3. 推送代码触发自动部署"
echo ""
