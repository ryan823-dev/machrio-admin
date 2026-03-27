@echo off
REM Railway 部署状态检查脚本

setlocal enabledelayedexpansion

echo.
echo ============================================
echo   Railway 部署状态检查
echo ============================================
echo.

REM 检查 Railway CLI 是否安装
where railway >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Railway CLI 未安装
    echo 请先运行：npm install -g @railway/cli
    echo.
    echo 请使用以下方式手动检查部署状态:
    echo 1. 访问：https://railway.app/dashboard
    echo 2. 选择项目：machrio-admin
    echo 3. 选择服务：machrio-backend
    echo 4. 点击 Logs 标签查看实时日志
    echo.
    pause
    exit /b 1
)

REM 检查是否已登录
echo 检查 Railway 登录状态...
railway whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] 未登录 Railway
    echo.
    echo 请选择:
    echo [1] 登录 Railway
    echo [2] 手动在 Dashboard 查看
    echo.
    set /p CHOICE="输入选项 (1-2): "
    
    if "%CHOICE%"=="1" (
        echo.
        echo 正在登录 Railway...
        railway login
        if %errorlevel% neq 0 (
            echo [ERROR] 登录失败
            pause
            exit /b 1
        )
    ) else (
        echo.
        echo 请在浏览器中访问：https://railway.app/dashboard
        echo 查看部署日志
        echo.
        pause
        exit /b 0
    )
)

REM 获取项目列表
echo.
echo 正在获取项目列表...
railway projects >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] 无法获取项目列表
    pause
    exit /b 1
)

echo [OK] 已连接到 Railway
echo.
echo 请执行以下操作:
echo 1. 在 Railway Dashboard 中查看部署状态
echo 2. 访问：https://railway.app/dashboard
echo.
echo 或者运行以下命令查看日志:
echo railway logs --service machrio-backend
echo.

pause
