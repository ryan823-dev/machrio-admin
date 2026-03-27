@echo off
echo ========================================
echo 直接使用 Railway API 部署
echo ========================================
echo.
echo 注意：此脚本需要您的 Railway Token
echo 获取 Token: https://railway.app/account/tokens
echo.

set /p RAILWAY_TOKEN=请输入您的 Railway Token: 

if "%RAILWAY_TOKEN%"=="" (
    echo 错误：Token 不能为空
    pause
    exit /b 1
)

cd /d %~dp0

echo.
echo 正在部署到 Railway...
echo.

REM 使用 Railway CLI 部署（如果已登录）
railway login --browserless 2>nul
if %errorlevel% equ 0 (
    railway up --detach
    if %errorlevel% equ 0 (
        echo.
        echo 部署成功！
        echo.
        pause
        exit /b 0
    )
)

echo.
echo ========================================
echo CLI 部署失败，请手动操作
echo ========================================
echo.
echo 1. 访问：https://railway.app/dashboard
echo 2. 选择 machrio-admin 项目
echo 3. 点击 machrio-backend 服务
echo 4. 点击 Redeploy 按钮
echo.
echo 或者使用 GitHub Actions（需要配置 RAILWAY_TOKEN secret）
echo.
pause
