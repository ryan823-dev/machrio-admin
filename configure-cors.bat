@echo off
echo ========================================
echo Machrio Admin - 配置 Railway CORS
echo ========================================
echo.

echo 请输入 Vercel 前端 URL
echo 例如：https://machrio-admin.vercel.app
echo.
set /p FRONTEND_URL="前端 URL: "
if "%FRONTEND_URL%"=="" (
    echo 错误：URL 不能为空
    pause
    exit /b 1
)

echo.
echo 设置 CORS_ALLOWED_ORIGINS...
echo.

railway variables set CORS_ALLOWED_ORIGINS=%FRONTEND_URL%,%FRONTEND_URL:https://=http://localhost:%

if errorlevel 1 (
    echo 设置失败，请检查是否已登录 Railway
    pause
    exit /b 1
)

echo.
echo ========================================
echo CORS 配置完成!
echo ========================================
echo.
echo 允许的源:
echo - %FRONTEND_URL%
echo - 本地开发环境
echo.
echo 重启 Railway 项目以应用配置...
railway restart
echo.
echo 完成！现在可以测试前后端连接了
echo.
pause
