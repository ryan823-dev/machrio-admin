@echo off
REM ============================================
REM   Railway 部署助手 - 自动打开浏览器
REM ============================================

echo.
echo ============================================
echo   Machrio Admin Railway 部署助手
echo ============================================
echo.
echo 正在准备部署...
echo.

REM 检查项目文件
if not exist "backend\machrio-api\build.gradle" (
    echo [错误] 未找到后端项目文件
    echo 请确保在正确的目录运行此脚本
    pause
    exit /b 1
)

if not exist "frontend\package.json" (
    echo [错误] 未找到前端项目文件
    pause
    exit /b 1
)

echo [OK] 项目文件检查通过
echo.

echo ============================================
echo   部署步骤
echo ============================================
echo.
echo 第一步：登录 Railway
echo.
echo 正在打开 Railway 登录页面...
start https://railway.app/login
echo.
echo 请在打开的网页中登录你的 Railway 账号
echo.
pause

echo.
echo ============================================
echo 第二步：创建新项目
echo ============================================
echo.
echo 正在打开 Railway Dashboard...
start https://railway.app/dashboard
echo.
echo 操作步骤:
echo 1. 点击 "New Project"
echo 2. 选择 "Deploy from GitHub repo"
echo 3. 授权 Railway 访问 GitHub
echo 4. 选择 "ryan823-dev/machrio-admin" 仓库
echo.
echo 完成后按回车继续...
pause

echo.
echo ============================================
echo 第三步：部署后端服务
echo ============================================
echo.
echo 详细步骤:
echo.
echo 1. 在项目中点击 "New" ^> "Empty Service"
echo 2. 命名服务为：machrio-backend
echo.
echo 3. 进入 Settings 标签，配置:
echo    - Root Directory: backend/machrio-api
echo    - Build Command: ./gradlew build -x test
echo    - Start Command: java -jar build/libs/*.jar
echo.
echo 4. 点击 "New" ^> "Database" ^> "PostgreSQL"
echo    (这会自动添加数据库并注入环境变量)
echo.
echo 5. 在 Variables 标签添加环境变量:
echo    - SERVER_PORT=8080
echo    - APP_CORS_ALLOWED_ORIGINS=http://localhost:5173,https://*.railway.app
echo    - APP_STORAGE_BLOB_ENDPOINT=https://blob.vercel-blob.com
echo.
echo 6. 等待自动部署完成（约 2-3 分钟）
echo.
echo 按回车打开 Railway Dashboard...
start https://railway.app/dashboard
pause

echo.
echo ============================================
echo 第四步：获取后端域名
echo ============================================
echo.
echo 部署完成后:
echo 1. 选择后端服务
echo 2. 进入 Settings ^> Domains
echo 3. 点击 "Generate Domain"
echo 4. 复制生成的域名（例如：xxx.up.railway.app）
echo.
set /p BACKEND_URL="请输入后端域名: "
echo.
echo 已保存后端域名：%BACKEND_URL%
echo.

echo ============================================
echo 第五步：部署前端服务
echo ============================================
echo.
echo 1. 返回项目，点击 "New" ^> "Empty Service"
echo 2. 命名服务为：machrio-frontend
echo.
echo 3. 进入 Settings 标签，配置:
echo    - Root Directory: frontend
echo    - Build Command: npm run build
echo    - Start Command: npx serve dist
echo.
echo 4. 在 Variables 标签添加环境变量:
echo    - VITE_API_URL=https://%BACKEND_URL%/api
echo.
echo 5. 等待自动部署完成（约 1-2 分钟）
echo.
echo 按回车继续...
pause

echo.
echo ============================================
echo 第六步：获取前端域名并测试
echo ============================================
echo.
echo 1. 选择前端服务
echo 2. Settings ^> Domains ^> Generate Domain
echo 3. 复制前端域名
echo.
echo ============================================
echo   部署完成！
echo ============================================
echo.
echo 后端 API: https://%BACKEND_URL%
echo 前端应用：待部署完成后获取
echo.
echo 测试:
echo 1. 后端健康检查：https://%BACKEND_URL%/api/health
echo 2. 前端访问：待部署完成后测试
echo.
echo 查看日志: Railway Dashboard ^> 选择服务 ^> Logs
echo.
pause
