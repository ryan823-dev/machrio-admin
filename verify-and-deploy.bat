@echo off
REM ============================================
REM   验证配置并重新部署
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ============================================
echo   Railway 配置验证和部署工具
echo ============================================
echo.

REM 检查 Railway CLI
where railway >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Railway CLI 未安装
    echo.
    echo 请手动在 Railway Dashboard 中重新部署:
    echo 1. 访问：https://railway.app/dashboard
    echo 2. 选择 machrio-admin 项目
    echo 3. 选择 machrio-backend 服务
    echo 4. 点击 Deployments 标签
    echo 5. 点击 Redeploy 按钮
    echo.
    pause
    exit /b 0
)

echo 正在登录 Railway...
railway login
if %errorlevel% neq 0 (
    echo [WARNING] Railway 登录失败
    echo.
    echo 请手动在 Railway Dashboard 中重新部署
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Railway 登录成功
echo.

REM 查看环境变量
echo ============================================
echo   当前环境变量
echo ============================================
echo.

railway variables
if %errorlevel% neq 0 (
    echo [WARNING] 无法获取环境变量
    echo 请在 Railway Dashboard 中确认 DATABASE_URL 已设置
    echo.
)

echo.
echo ============================================
echo   重新部署
echo ============================================
echo.

set /p DEPLOY="是否现在重新部署？(Y/N): "
if /i "%DEPLOY%"=="Y" (
    echo.
    echo 正在触发重新部署...
    railway up
    if %errorlevel% neq 0 (
        echo [ERROR] 部署失败
        pause
        exit /b 1
    )
    echo.
    echo [OK] 部署已触发！
    echo.
    echo 请等待 2-5 分钟，然后:
    echo 1. 查看部署日志：railway logs
    echo 2. 检查健康状态：curl https://your-backend.railway.app/api/health
    echo.
) else (
    echo.
    echo [INFO] 跳过部署
    echo 请手动在 Railway Dashboard 中点击 Redeploy
    echo.
)

echo ============================================
echo   下一步
echo ============================================
echo.
echo 1. 等待部署完成（2-5 分钟）
echo 2. 查看日志确认数据库连接成功
echo 3. 测试健康检查端点
echo.

pause
