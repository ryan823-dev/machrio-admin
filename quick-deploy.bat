@echo off
REM ============================================
REM   Railway 快速部署助手
REM ============================================
REM 此脚本会指导你完成 Railway 部署

setlocal enabledelayedexpansion

echo.
echo ============================================
echo   Machrio Admin Railway 部署助手
echo ============================================
echo.
echo 请选择部署方式:
echo.
echo [1] GitHub Actions 自动部署（推荐）
echo [2] Railway Dashboard 手动部署
echo [3] Railway CLI 命令行部署
echo.

set /p CHOICE="请输入选项 (1-3): "

if "%CHOICE%"=="1" goto GITHUB_ACTIONS
if "%CHOICE%"=="2" goto DASHBOARD
if "%CHOICE%"=="3" goto CLI
goto END

:GITHUB_ACTIONS
echo.
echo ============================================
echo   GitHub Actions 自动部署
echo ============================================
echo.
echo 步骤 1: 获取 Railway Token
echo   访问：https://railway.app/account/tokens
echo   点击 "Create New Token" 并复制 Token
echo.
echo 步骤 2: 配置 GitHub Secrets
echo   访问：https://github.com/ryan823-dev/machrio-admin/settings/secrets/actions
echo   添加以下 Secrets:
echo   - RAILWAY_TOKEN: (步骤 1 中的 Token)
echo   - RAILWAY_PROJECT_ID: (首次部署后获取)
echo   - RAILWAY_BACKEND_SERVICE_ID: (首次部署后获取)
echo   - RAILWAY_FRONTEND_SERVICE_ID: (首次部署后获取)
echo   - VITE_API_URL: (后端 API 地址)
echo.
echo 步骤 3: 首次手动部署以获取 Service ID
echo   请运行：deploy-railway.bat
echo.
echo 步骤 4: 推送到 GitHub 自动部署
echo   git add .
echo   git commit -m "Deploy to Railway"
echo   git push
echo.
pause
goto END

:DASHBOARD
echo.
echo ============================================
echo   Railway Dashboard 手动部署
echo ============================================
echo.
echo 步骤 1: 登录 Railway
echo   访问：https://railway.app/dashboard
echo.
echo 步骤 2: 创建新项目
echo   点击 "New Project" ^> "Deploy from GitHub repo"
echo   选择：ryan823-dev/machrio-admin
echo.
echo 步骤 3: 部署后端
echo   1. New ^> Empty Service
echo   2. 设置 Root Directory: backend/machrio-api
echo   3. Build Command: ./gradlew build -x test
echo   4. Start Command: java -jar build/libs/*.jar
echo   5. New ^> Database ^> PostgreSQL
echo   6. 添加环境变量:
echo      - SERVER_PORT=8080
echo      - APP_CORS_ALLOWED_ORIGINS=http://localhost:5173
echo.
echo 步骤 4: 部署前端
echo   1. New ^> Empty Service
echo   2. 设置 Root Directory: frontend
echo   3. Build Command: npm run build
echo   4. Start Command: npx serve dist
echo   5. 添加环境变量:
echo      - VITE_API_URL=https://your-backend.railway.app/api
echo.
echo 步骤 5: 配置域名
echo   在 Settings ^> Domains 中生成域名
echo   并更新前端 VITE_API_URL 环境变量
echo.
pause
goto END

:CLI
echo.
echo ============================================
echo   Railway CLI 命令行部署
echo ============================================
echo.
echo 正在检查 Railway CLI...
where railway >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] Railway CLI 未安装
    echo 请先运行：npm install -g @railway/cli
    pause
    goto END
)

echo [OK] Railway CLI 已安装
echo.
echo 正在登录 Railway...
railway login
if %errorlevel% neq 0 (
    echo [错误] Railway 登录失败
    pause
    goto END
)

echo.
echo 正在创建项目...
set /p PROJECT_NAME="请输入项目名称 (默认：machrio-admin): "
if "%PROJECT_NAME%"=="" set PROJECT_NAME=machrio-admin

railway init --name %PROJECT_NAME%

echo.
echo 正在部署后端...
cd backend\machrio-api
railway init --name machrio-backend
railway add postgresql

echo.
echo 配置后端环境变量...
railway variables set SERVER_PORT=8080
railway variables set APP_CORS_ALLOWED_ORIGINS=http://localhost:5173
railway variables set APP_STORAGE_BLOB_ENDPOINT=https://blob.vercel-blob.com

echo.
echo 部署后端...
railway up --detach

echo.
echo 获取后端域名...
for /f "tokens=*" %%i in ('railway domain 2^>nul ^| findstr /r "railway.app"') do set BACKEND_URL=%%i
echo [OK] 后端已部署：%BACKEND_URL%

echo.
echo 返回根目录...
cd ..\..

echo.
echo 正在部署前端...
cd frontend
railway init --name machrio-frontend

echo.
echo 配置前端环境变量...
set /p CUSTOM_API_URL="请输入后端 API 地址 (直接回车使用：%BACKEND_URL%): "
if "%CUSTOM_API_URL%"=="" (
    set API_URL=%BACKEND_URL%
) else (
    set API_URL=%CUSTOM_API_URL%
)
railway variables set VITE_API_URL=%API_URL%

echo.
echo 部署前端...
railway up --detach

echo.
echo 获取前端域名...
for /f "tokens=*" %%i in ('railway domain 2^>nul ^| findstr /r "railway.app"') do set FRONTEND_URL=%%i
echo [OK] 前端已部署：%FRONTEND_URL%

cd ..

echo.
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
echo 3. 在 Railway Dashboard 中配置自定义域名
echo.
pause
goto END

:END
echo.
echo 如需更多帮助，请查看：DEPLOYMENT_GUIDE.md
echo.
