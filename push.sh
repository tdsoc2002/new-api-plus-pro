#!/bin/bash
# 推送代码到 GitHub

cd /Users/liwenzhe/project/td/new-api-plus-pro

echo "=========================================="
echo "  推送代码到 GitHub"
echo "=========================================="
echo ""
echo "待推送的提交："
git log origin/main..HEAD --oneline
echo ""
echo "正在推送..."
echo ""

# 推送代码
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "  ✓ 推送成功！"
    echo "=========================================="
    echo ""
    echo "查看部署进度："
    echo "https://github.com/tdsoc2002/new-api-plus-pro/actions"
    echo ""
    echo "部署完成后访问："
    echo "http://43.167.205.250:3000"
else
    echo ""
    echo "=========================================="
    echo "  ✗ 推送失败"
    echo "=========================================="
    echo ""
    echo "请手动创建 Personal Access Token："
    echo "https://github.com/settings/tokens/new?scopes=repo,workflow&description=New-API-Deploy"
    echo ""
    echo "然后重新执行此脚本"
fi
