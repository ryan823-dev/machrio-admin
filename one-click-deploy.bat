@echo off
REM ============================================
REM   Machrio Admin 一键部署脚本
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ============================================
echo   Machrio Admin Railway 一键部署
echo ============================================
echo.

REM 检查 Railway CLI
where railway >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Railway CLI 未安装
    echo.
    echo 请先运行：npm install -g @railway/cli
    echo.
    pause
    exit /b 1
)

echo [OK] Railway CLI 已安装
echo.

REM 登录 Railway
echo ============================================
echo   步骤 1: 登录 Railway
echo ============================================
echo.
echo 即将打开浏览器进行登录...
echo 请在浏览器窗口中完成登录
echo.
pause

railway login
if %errorlevel% neq 0 (
    echo [ERROR] Railway 登录失败
    pause
    exit /b 1
)

echo [OK] Railway 登录成功
echo.

REM 进入后端目录
echo ============================================
echo   步骤 2: 创建后端服务
echo ============================================
echo.

cd backend\machrio-api

echo 正在创建后端服务...
railway init --name machrio-backend
if %errorlevel% neq 0 (
    echo [WARNING] 创建服务可能已存在或失败，继续下一步...
)

echo.
echo 正在添加 PostgreSQL 数据库...
railway add postgresql
if %errorlevel% neq 0 (
    echo [WARNING] 添加数据库失败，继续下一步...
)

echo.
echo 正在配置环境变量...
railway variables set SERVER_PORT=8080
railway variables set APP_CORS_ALLOWED_ORIGINS=https://*.railway.app
railway variables set APP_STORAGE_BLOB_ENDPOINT=https://blob.vercel-blob.com
railway variables set APP_JWT_SECRET=your-production-jwt-secret-key-change-this-in-production
railway variables set APP_JWT_EXPIRATION_MS=86400000

echo.
echo ============================================
echo   步骤 3: 部署后端
echo ============================================
echo.
echo 正在部署后端服务...
echo 这可能需要 5-10 分钟...
echo.

railway up
if %errorlevel% neq 0 (
    echo [ERROR] 部署失败
    echo.
    echo 请查看错误信息并重试
    pause
    exit /b 1
)

echo.
echo [OK] 后端部署完成！
echo.

REM 获取后端域名
for /f "tokens=*" %%i in ('railway domain 2^>nul ^| findstr /r "railway.app"') do set BACKEND_URL=%%i
echo [INFO] 后端域名：%BACKEND_URL%
echo.

REM 返回根目录
cd ..\..

REM 部署前端
echo ============================================
echo   步骤 4: 创建前端服务
echo ============================================
echo.

cd frontend

echo 正在创建前端服务...
railway init --name machrio-frontend
if %errorlevel% neq 0 (
    echo [WARNING] 创建服务可能已存在或失败，继续下一步...
)

echo.
echo 正在配置前端环境变量...
set /p CUSTOM_API_URL="请输入后端 API 地址（直接回车使用默认值）: "
if "!CUSTOM_API_URL!"=="" (
    set API_URL=!BACKEND_URL!
) else (
    set API_URL=!CUSTOM_API_URL!
)

railway variables set VITE_API_URL=!API_URL!
railway variables set VITE_APP_MODE=production

echo.
echo ============================================
echo   步骤 5: 部署前端
echo ============================================
echo.
echo 正在部署前端服务...
echo.

railway up
if %errorlevel% neq 0 (
    echo [ERROR] 部署失败
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] 前端部署完成！
echo.

REM 获取前端域名
for /f "tokens=*" %%i in ('railway domain 2^>nul ^| findstr /r "railway.app"') do set FRONTEND_URL=%%i
echo [INFO] 前端域名：%FRONTEND_URL%
echo.

cd ..

echo ============================================
echo   部署完成！
echo ============================================
echo.
echo 后端 API: %BACKEND_URL%
echo 前端应用：%FRONTEND_URL%
echo.
echo 下一步:
echo 1. 测试后端健康检查：%BACKEND_URL%/api/health
echo 2. 访问前端应用：%FRONTEND_URL%
echo 3. 在 Railway Dashboard 中查看服务状态
echo.

pause
