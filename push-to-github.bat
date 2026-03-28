@echo off
echo ========================================
echo Machrio Admin - 推送到 GitHub
echo ========================================
echo.

echo [步骤 1/4] 检查 Git 状态...
echo.
git status
echo.

echo [步骤 2/4] 添加所有更改...
echo.
git add .
if errorlevel 1 (
    echo 添加文件失败
    pause
    exit /b 1
)
echo 文件添加完成!
echo.

echo [步骤 3/4] 提交更改...
echo.
set /p COMMIT_MSG="输入提交信息 (默认：Deploy Phase 1-3 features): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Deploy Phase 1-3 features: Shipping & Bank Accounts management

git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
    echo 没有更改需要提交或提交失败
    echo 继续执行...
)
echo.

echo [步骤 4/4] 推送到 GitHub...
echo.
echo 这将推送到 main 分支
echo.
git push origin main
if errorlevel 1 (
    echo 推送失败，请检查网络连接和 GitHub 权限
    pause
    exit /b 1
)
echo.

echo ========================================
echo 推送成功!
echo ========================================
echo.
echo 下一步:
echo 1. 访问 GitHub 确认代码已更新
echo 2. 运行 deploy-to-railway.bat 部署后端
echo 3. 运行 deploy-to-vercel.bat 部署前端
echo.
echo GitHub 仓库：https://github.com/ryan823-dev/machrio-admin
echo.
pause
