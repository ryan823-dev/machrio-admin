@echo off
REM ============================================
REM   添加 PostgreSQL 数据库到 Railway
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ============================================
echo   Railway PostgreSQL 数据库添加工具
echo ============================================
echo.

REM 检查 Railway CLI
where railway >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Railway CLI 未安装
    echo.
    echo 请先运行：npm install -g @railway/cli
    echo.
    echo 或者手动在 Railway Dashboard 中添加:
    echo 1. 访问：https://railway.app/dashboard
    echo 2. 选择 machrio-admin 项目
    echo 3. 点击 New ^> Database ^> PostgreSQL
    echo.
    pause
    exit /b 1
)

echo [OK] Railway CLI 已安装
echo.

REM 登录 Railway
echo 正在登录 Railway...
echo 请在打开的浏览器窗口中完成登录
echo.

railway login
if %errorlevel% neq 0 (
    echo [ERROR] Railway 登录失败
    echo.
    echo 请手动在 Railway Dashboard 中添加数据库:
    echo 1. 访问：https://railway.app/dashboard
    echo 2. 选择 machrio-admin 项目
    echo 3. 点击 New ^> Database ^> PostgreSQL
    echo.
    pause
    exit /b 1
)

echo [OK] Railway 登录成功
echo.

REM 添加 PostgreSQL
echo ============================================
echo   添加 PostgreSQL 数据库
echo ============================================
echo.

echo 正在添加 PostgreSQL 数据库...
railway add postgresql
if %errorlevel% neq 0 (
    echo [WARNING] 添加数据库失败
    echo 可能数据库已存在或项目未正确初始化
    echo.
    echo 请手动在 Railway Dashboard 中添加:
    echo 1. 访问：https://railway.app/dashboard
    echo 2. 选择 machrio-admin 项目
    echo 3. 点击 New ^> Database ^> PostgreSQL
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] PostgreSQL 数据库添加成功！
echo.

REM 查看环境变量
echo ============================================
echo   数据库环境变量
echo ============================================
echo.
echo Railway 已自动注入以下环境变量:
echo.

railway variables
if %errorlevel% neq 0 (
    echo [WARNING] 无法获取环境变量
    echo 请在 Railway Dashboard 中查看 Variables 标签
    echo.
)

echo.
echo ============================================
echo   下一步
echo ============================================
echo.
echo 1. 配置其他环境变量
echo    railway variables set SERVER_PORT=8080
echo    railway variables set APP_CORS_ALLOWED_ORIGINS=https://*.railway.app
echo.
echo 2. 重新部署
echo    railway up
echo.
echo 3. 查看部署状态
echo    railway status
echo.

pause
