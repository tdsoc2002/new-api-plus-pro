#!/bin/bash
# New-API 一键部署脚本
# 用于首次手动部署或紧急部署

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "  New-API 一键部署脚本"
echo "=========================================="
echo ""

# 检查是否在正确的目录
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}错误: 请在 /opt/new-api 目录下运行此脚本${NC}"
    exit 1
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}警告: .env 文件不存在，正在创建...${NC}"
    SESSION_SECRET=$(openssl rand -hex 32)
    REDIS_PASSWORD=$(openssl rand -base64 32)

    cat > .env << EOF
VERSION=latest
SESSION_SECRET=$SESSION_SECRET
REDIS_PASSWORD=$REDIS_PASSWORD
EOF

    echo -e "${GREEN}✓ .env 文件已创建${NC}"
    echo -e "${YELLOW}请保存以下信息：${NC}"
    echo "SESSION_SECRET: $SESSION_SECRET"
    echo "REDIS_PASSWORD: $REDIS_PASSWORD"
    echo ""
fi

# 询问是否拉取最新代码
read -p "是否从 GitHub 拉取最新代码? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}[1/5] 拉取最新代码...${NC}"
    if [ -d ".git" ]; then
        git pull origin main
    else
        echo -e "${YELLOW}警告: 不是 git 仓库，跳过${NC}"
    fi
else
    echo -e "${YELLOW}跳过代码拉取${NC}"
fi

# 构建镜像
echo -e "${GREEN}[2/5] 构建 Docker 镜像...${NC}"
docker build -t new-api:latest .

# 停止旧容器
echo -e "${GREEN}[3/5] 停止旧容器...${NC}"
docker-compose -f docker-compose.prod.yml down || true

# 启动新容器
echo -e "${GREEN}[4/5] 启动新容器...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# 健康检查
echo -e "${GREEN}[5/5] 健康检查...${NC}"
sleep 10

for i in {1..30}; do
    if curl -f http://localhost:3000/api/status 2>/dev/null | grep -q '"success":true'; then
        echo -e "${GREEN}✓ 服务启动成功！${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ 健康检查失败${NC}"
        echo "查看日志："
        docker-compose -f docker-compose.prod.yml logs --tail=50
        exit 1
    fi
    echo "等待服务启动... ($i/30)"
    sleep 2
done

# 清理旧镜像
echo -e "${GREEN}清理旧镜像...${NC}"
docker image prune -af --filter "until=24h"

# 显示状态
echo ""
echo "=========================================="
echo -e "${GREEN}  部署完成！${NC}"
echo "=========================================="
echo ""
echo "服务状态："
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "访问地址: http://$(curl -s ifconfig.me):3000"
echo ""
echo "常用命令："
echo "  查看日志: docker-compose -f docker-compose.prod.yml logs -f"
echo "  重启服务: docker-compose -f docker-compose.prod.yml restart"
echo "  停止服务: docker-compose -f docker-compose.prod.yml down"
echo ""
