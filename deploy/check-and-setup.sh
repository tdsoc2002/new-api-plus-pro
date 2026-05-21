#!/bin/bash
# 服务器环境一键检查和配置脚本
# 使用方法：
#   1. SSH 登录服务器：ssh root@43.167.205.250
#   2. 复制此脚本内容并执行：bash
#   3. 粘贴脚本内容，按 Ctrl+D 执行

set -e

echo "=========================================="
echo "  服务器环境检查"
echo "=========================================="
echo ""

# 检查函数
check_installed() {
    if command -v $1 &> /dev/null; then
        echo "✓ $2 已安装"
        return 0
    else
        echo "✗ $2 未安装"
        return 1
    fi
}

# 1. 检查 Docker
echo "【1. Docker】"
if check_installed docker "Docker"; then
    docker --version
    systemctl is-active docker
else
    NEED_INSTALL=true
fi

echo ""

# 2. 检查 docker-compose
echo "【2. docker-compose】"
if check_installed docker-compose "docker-compose"; then
    docker-compose --version
else
    NEED_INSTALL=true
fi

echo ""

# 3. 检查部署目录
echo "【3. 部署目录】"
if [ -d /opt/new-api ]; then
    echo "✓ /opt/new-api 存在"
    ls -la /opt/new-api/
    if [ -f /opt/new-api/.env ]; then
        echo "✓ .env 配置文件存在"
    else
        echo "✗ .env 配置文件不存在"
        NEED_INSTALL=true
    fi
else
    echo "✗ /opt/new-api 不存在"
    NEED_INSTALL=true
fi

echo ""

# 4. 检查 Swap
echo "【4. Swap】"
if [ -f /swapfile ]; then
    echo "✓ Swap 文件存在"
    free -h | grep Swap
else
    echo "✗ Swap 未配置"
    NEED_INSTALL=true
fi

echo ""

# 5. 检查防火墙
echo "【5. 防火墙】"
if command -v ufw &> /dev/null; then
    ufw status | head -10
else
    echo "✗ UFW 未安装"
fi

echo ""

# 6. 检查 SSH 密钥
echo "【6. SSH 密钥】"
if [ -f ~/.ssh/authorized_keys ]; then
    echo "✓ authorized_keys 存在"
    echo "密钥数量: $(wc -l < ~/.ssh/authorized_keys)"
else
    echo "✗ authorized_keys 不存在"
    NEED_INSTALL=true
fi

echo ""
echo "=========================================="

# 询问是否安装
if [ "$NEED_INSTALL" = true ]; then
    echo ""
    echo "检测到环境未完全配置。"
    read -p "是否立即执行自动配置？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "=========================================="
        echo "  开始自动配置"
        echo "=========================================="
        echo ""

        # 执行初始化
        bash << 'INIT_SCRIPT'
#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. 配置 SSH 密钥
echo -e "${GREEN}[1/8] 配置 SSH 密钥...${NC}"
mkdir -p ~/.ssh
chmod 700 ~/.ssh
if ! grep -q "AAAAC3NzaC1lZDI1NTE5AAAAILGF2roybYCD6wyPzuF0v/Aa+9n3/nYG3vFkWYZhpY3P" ~/.ssh/authorized_keys 2>/dev/null; then
    cat >> ~/.ssh/authorized_keys << 'EOF'
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILGF2roybYCD6wyPzuF0v/Aa+9n3/nYG3vFkWYZhpY3P 2776483968@qq.com
EOF
    chmod 600 ~/.ssh/authorized_keys
    echo -e "${GREEN}✓ SSH 密钥已配置${NC}"
else
    echo -e "${YELLOW}SSH 密钥已存在，跳过${NC}"
fi

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

# 5. 配置 swap
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
    echo -e "${GREEN}  配置完成！${NC}"
    echo "=========================================="
    echo ""
    echo "重要信息（请保存）："
    echo "  SESSION_SECRET: $SESSION_SECRET"
    echo "  REDIS_PASSWORD: $REDIS_PASSWORD"
    echo ""
else
    echo -e "${YELLOW}.env 文件已存在，跳过${NC}"
fi

echo ""
echo "系统信息："
echo "  - Docker: $(docker --version)"
echo "  - docker-compose: $(docker-compose --version)"
echo "  - 内存: $(free -h | awk '/^Mem:/ {print $2}')"
echo "  - Swap: $(free -h | awk '/^Swap:/ {print $2}')"
echo ""
INIT_SCRIPT

        echo ""
        echo "=========================================="
        echo "  配置完成！"
        echo "=========================================="
    fi
else
    echo ""
    echo "✓ 环境已完全配置，可以开始部署！"
fi
