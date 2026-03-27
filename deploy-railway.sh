#!/bin/bash

# Railway 快速部署脚本
# 使用前请确保已安装 Railway CLI: npm install -g @railway/cli

set -e

echo "🚀 Machrio Admin Railway 部署脚本"
echo "=================================="

# 检查 Railway CLI 是否安装
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI 未安装，请先运行：npm install -g @railway/cli"
    exit 1
fi

# 登录 Railway
echo "📝 登录 Railway..."
railway login

# 创建项目
echo "📦 创建 Railway 项目..."
PROJECT_NAME="machrio-admin"
railway init --name $PROJECT_NAME

# 部署后端
echo "🔧 部署后端服务..."
cd backend/machrio-api

# 初始化后端服务
railway init --name machrio-backend

# 添加 PostgreSQL
echo "🗄️  添加 PostgreSQL 数据库..."
railway add postgresql

# 设置环境变量
echo "⚙️  配置后端环境变量..."
railway variables set SERVER_PORT=8080
railway variables set APP_CORS_ALLOWED_ORIGINS="http://localhost:5173"
railway variables set APP_STORAGE_BLOB_ENDPOINT="https://blob.vercel-blob.com"

# 部署后端
echo "🚀 部署后端..."
railway up --detach

# 获取后端 URL
BACKEND_URL=$(railway domain | grep -oP 'https://\K[^.]+\.railway\.app')
echo "✅ 后端部署完成：https://${BACKEND_URL}"

# 返回根目录
cd ../..

# 部署前端
echo "🎨 部署前端服务..."
cd frontend

# 初始化前端服务
railway init --name machrio-frontend

# 设置环境变量（需要手动替换后端 URL）
echo "⚙️  配置前端环境变量..."
read -p "请输入后端域名（留空使用默认值）: " CUSTOM_BACKEND_URL
if [ -z "$CUSTOM_BACKEND_URL" ]; then
    API_URL="https://${BACKEND_URL}"
else
    API_URL="https://${CUSTOM_BACKEND_URL}"
fi
railway variables set VITE_API_URL="$API_URL"

# 部署前端
echo "🚀 部署前端..."
railway up --detach

# 获取前端 URL
FRONTEND_URL=$(railway domain | grep -oP 'https://\K[^.]+\.railway\.app')
echo "✅ 前端部署完成：https://${FRONTEND_URL}"

# 返回根目录
cd ..

echo ""
echo "🎉 部署完成！"
echo "============="
echo "后端 API: https://${BACKEND_URL}"
echo "前端应用：https://${FRONTEND_URL}"
echo ""
echo "📝 下一步："
echo "1. 在 Railway Dashboard 中检查服务状态"
echo "2. 测试后端健康检查：https://${BACKEND_URL}/api/health"
echo "3. 访问前端应用：https://${FRONTEND_URL}"
echo "4. 配置自定义域名（可选）"
echo ""
