@echo off
REM 自动检查 Railway 部署状态脚本

setlocal enabledelayedexpansion

echo.
echo ============================================
echo   Railway 部署状态自动检查
echo ============================================
echo.

REM 检查 Railway CLI
where railway >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Railway CLI 未安装
    echo 请运行：npm install -g @railway/cli
    pause
    exit /b 1
)

REM 检查是否已登录
echo 检查登录状态...
railway whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] 需要登录 Railway
    echo.
    echo 正在启动浏览器登录...
    echo 请在打开的浏览器窗口中完成登录
    echo.
    railway login
    if %errorlevel% neq 0 (
        echo [ERROR] 登录失败
        pause
        exit /b 1
    )
)

echo [OK] 已登录 Railway
echo.

REM 获取项目
echo 正在获取项目信息...
railway projects >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] 无法获取项目信息
    pause
    exit /b 1
)

echo.
echo ============================================
echo   部署状态检查选项
echo ============================================
echo.
echo [1] 查看后端服务日志
echo [2] 查看前端服务日志
echo [3] 查看当前部署状态
echo [4] 重新部署后端
echo [5] 重新部署前端
echo.

set /p CHOICE="请选择操作 (1-5): "

if "%CHOICE%"=="1" (
    echo.
    echo 正在查看后端服务日志...
    echo 按 Ctrl+C 停止查看
    echo.
    railway logs --service machrio-backend
) else if "%CHOICE%"=="2" (
    echo.
    echo 正在查看前端服务日志...
    railway logs --service machrio-frontend
) else if "%CHOICE%"=="3" (
    echo.
    echo 正在获取部署状态...
    railway status
) else if "%CHOICE%"=="4" (
    echo.
    echo 正在重新部署后端...
    cd backend\machrio-api
    railway up
    cd ..\..
) else if "%CHOICE%"=="5" (
    echo.
    echo 正在重新部署前端...
    cd frontend
    railway up
    cd ..
)

echo.
echo 操作完成！
pause
