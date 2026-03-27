@echo off
REM ============================================
REM   Railway 部署状态自动检查脚本
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ============================================
echo   Railway 部署状态检查
echo ============================================
echo.

REM 检查 Railway CLI
where railway >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Railway CLI 未安装
    echo.
    echo 请使用以下方式检查部署状态:
    echo.
    echo 方法 1: Railway Dashboard
    echo   访问：https://railway.app/dashboard
    echo   选择项目：machrio-admin
    echo   查看 Deployments 标签
    echo.
    echo 方法 2: GitHub Actions
    echo   访问：https://github.com/ryan823-dev/machrio-admin/actions
    echo   查看最新的工作流运行
    echo.
    
    REM 自动打开 Railway Dashboard
    echo 正在打开 Railway Dashboard...
    start https://railway.app/dashboard
    echo.
    
    pause
    exit /b 0
)

echo [OK] Railway CLI 已安装
echo.

REM 检查登录状态
echo 检查 Railway 登录状态...
railway whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] 未登录 Railway
    echo.
    echo 正在启动浏览器登录...
    echo 请在打开的浏览器窗口中完成登录
    echo.
    pause
    railway login
    if %errorlevel% neq 0 (
        echo [ERROR] 登录失败
        pause
        exit /b 1
    )
)

echo [OK] 已登录 Railway
echo.

REM 获取项目状态
echo ============================================
echo   项目状态
echo ============================================
echo.

railway status
if %errorlevel% neq 0 (
    echo [WARNING] 无法获取项目状态
    echo 可能还没有创建服务
    echo.
)

echo.
echo ============================================
echo   部署日志
echo ============================================
echo.

set /p SHOW_LOGS="是否查看后端服务日志？(Y/N): "
if /i "%SHOW_LOGS%"=="Y" (
    echo.
    echo 正在获取日志...
    echo.
    railway logs --service machrio-backend --lines 50
)

echo.
echo ============================================
echo   下一步操作
echo ============================================
echo.
echo 如果部署成功:
echo 1. 添加 PostgreSQL 数据库
echo    railway add postgresql
echo.
echo 2. 配置环境变量
echo    railway variables set SERVER_PORT=8080
echo    railway variables set APP_CORS_ALLOWED_ORIGINS=https://*.railway.app
echo.
echo 3. 获取域名
echo    railway domain
echo.

pause
