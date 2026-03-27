@echo off
echo ========================================
echo 推送代码到 GitHub 并触发 Railway 部署
echo ========================================
echo.

cd /d %~dp0

echo [1/3] 推送代码到 GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo 错误：无法连接到 GitHub，请检查网络连接
    pause
    exit /b 1
)

echo.
echo ========================================
echo 推送成功！
echo ========================================
echo.
echo 代码已推送到 GitHub，GitHub Actions 将自动触发部署
echo.
echo 请访问以下链接查看部署状态：
echo https://github.com/ryan823-dev/machrio-admin/actions
echo.
echo 如果您已配置 RAILWAY_TOKEN secret，部署将自动完成
echo.
echo 如果没有配置，请在 Railway Dashboard 中手动触发重新部署：
echo 1. 访问：https://railway.app/dashboard
echo 2. 选择 machrio-admin 项目
echo 3. 点击 machrio-backend 服务
echo 4. 点击 Redeploy 按钮
echo.
pause
