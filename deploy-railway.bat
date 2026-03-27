@echo off
REM Railway 快速部署脚本 (Windows 版本)
REM 使用前请确保已安装 Railway CLI: npm install -g @railway/cli

setlocal enabledelayedexpansion

echo.
echo ============================================
echo   Machrio Admin Railway 部署脚本
echo ============================================
echo.

REM 检查 Railway CLI 是否安装
where railway >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Railway CLI 未安装，请先运行：npm install -g @railway/cli
    echo.
    pause
    exit /b 1
)

REM 登录 Railway
echo [1/8] 登录 Railway...
railway login
if %errorlevel% neq 0 (
    echo [ERROR] Railway 登录失败
    pause
    exit /b 1
)

REM 创建项目
echo.
echo [2/8] 创建 Railway 项目...
set PROJECT_NAME=machrio-admin
railway init --name %PROJECT_NAME%

REM 部署后端
echo.
echo [3/8] 部署后端服务...
cd backend\machrio-api

REM 初始化后端服务
railway init --name machrio-backend

REM 添加 PostgreSQL
echo.
echo [4/8] 添加 PostgreSQL 数据库...
railway add postgresql

REM 设置环境变量
echo.
echo [5/8] 配置后端环境变量...
railway variables set SERVER_PORT=8080
railway variables set APP_CORS_ALLOWED_ORIGINS=http://localhost:5173
railway variables set APP_STORAGE_BLOB_ENDPOINT=https://blob.vercel-blob.com

REM 部署后端
echo.
echo [6/8] 部署后端...
railway up --detach

REM 获取后端 URL
for /f "tokens=*" %%i in ('railway domain ^| findstr /r "railway.app"') do set BACKEND_URL=%%i
echo [OK] 后端部署完成：%BACKEND_URL%

REM 返回根目录
cd ..\..

REM 部署前端
echo.
echo [7/8] 部署前端服务...
cd frontend

REM 初始化前端服务
railway init --name machrio-frontend

REM 设置环境变量
echo.
echo [8/8] 配置前端环境变量...
set /p CUSTOM_BACKEND_URL="请输入后端域名（直接回车使用默认值）: "
if "%CUSTOM_BACKEND_URL%"=="" (
    set API_URL=!BACKEND_URL!
) else (
    set API_URL=!CUSTOM_BACKEND_URL!
)
railway variables set VITE_API_URL=%API_URL%

REM 部署前端
echo.
echo 部署前端...
railway up --detach

REM 获取前端 URL
for /f "tokens=*" %%i in ('railway domain ^| findstr /r "railway.app"') do set FRONTEND_URL=%%i
echo [OK] 前端部署完成：%FRONTEND_URL%

REM 返回根目录
cd ..

echo.
echo ============================================
echo   部署完成！
echo ============================================
echo.
echo 后端 API: %BACKEND_URL%
echo 前端应用：%FRONTEND_URL%
echo.
echo 下一步:
echo 1. 在 Railway Dashboard 中检查服务状态
echo 2. 测试后端健康检查：%BACKEND_URL%/api/health
echo 3. 访问前端应用：%FRONTEND_URL%
echo 4. 配置自定义域名（可选）
echo.
pause
