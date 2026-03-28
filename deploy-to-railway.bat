@echo off
echo ========================================
echo Machrio Admin - Railway 部署脚本
echo ========================================
echo.

REM 步骤 1: 登录 Railway
echo [步骤 1/6] 登录 Railway...
echo 请在打开的浏览器中完成登录
echo.
railway login
if errorlevel 1 (
    echo 登录失败，请重试
    pause
    exit /b 1
)
echo 登录成功!
echo.

REM 步骤 2: 初始化或创建项目
echo [步骤 2/6] 初始化 Railway 项目...
echo.
railway init
if errorlevel 1 (
    echo 项目初始化失败
    pause
    exit /b 1
)
echo.

REM 步骤 3: 添加 PostgreSQL 数据库
echo [步骤 3/6] 添加 PostgreSQL 数据库...
echo.
railway add postgresql
if errorlevel 1 (
    echo 数据库添加失败，可能已经添加
    echo 继续执行...
)
echo.

REM 步骤 4: 设置环境变量
echo [步骤 4/6] 设置环境变量...
echo.
echo 设置 JWT_SECRET...
set /p JWT_SECRET="请输入 JWT 密钥 (至少 32 个字符): "
if "%JWT_SECRET%"=="" set JWT_SECRET=machrio-admin-secret-key-32-chars-min

railway variables set SPRING_PROFILES_ACTIVE=production
railway variables set JWT_SECRET=%JWT_SECRET%
railway variables set LOG_LEVEL_ROOT=INFO
railway variables set LOG_LEVEL_COM_MACHRIO=DEBUG

REM OSS 配置
echo.
echo 是否配置 OSS？(Y/N)
set /p OSS_CONFIG=
if /i "%OSS_CONFIG%"=="Y" (
    set /p OSS_ENDPOINT="OSS Endpoint (默认：https://oss-cn-hangzhou.aliyuncs.com): "
    if "%OSS_ENDPOINT%"=="" set OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
    
    set /p OSS_ACCESS_KEY_ID="OSS Access Key ID: "
    set /p OSS_ACCESS_KEY_SECRET="OSS Access Key Secret: "
    set /p OSS_BUCKET="OSS Bucket (默认：vertax): "
    if "%OSS_BUCKET%"=="" set OSS_BUCKET=vertax
    
    railway variables set OSS_ENDPOINT=%OSS_ENDPOINT%
    railway variables set OSS_ACCESS_KEY_ID=%OSS_ACCESS_KEY_ID%
    railway variables set OSS_ACCESS_KEY_SECRET=%OSS_ACCESS_KEY_SECRET%
    railway variables set OSS_BUCKET=%OSS_BUCKET%
)

echo.
echo 环境变量设置完成!
echo.

REM 步骤 5: 部署
echo [步骤 5/6] 开始部署到 Railway...
echo.
echo 这可能需要 3-5 分钟...
echo.
railway up --detach
if errorlevel 1 (
    echo 部署失败
    pause
    exit /b 1
)

echo.
echo 等待部署完成...
timeout /t 30 /nobreak
echo.

REM 步骤 6: 检查部署状态
echo [步骤 6/6] 检查部署状态...
echo.
railway status
echo.
echo 查看最近的日志...
railway logs --limit 20
echo.

REM 生成域名
echo 生成公共域名...
railway domain
echo.

echo ========================================
echo 部署完成!
echo ========================================
echo.
echo 下一步:
echo 1. 记录 Railway 后端 URL
echo 2. 部署前端到 Vercel
echo 3. 在 Vercel 配置 VITE_API_URL
echo 4. 在 Railway 配置 CORS_ALLOWED_ORIGINS
echo.
echo 查看部署指南：RAILWAY-DEPLOYMENT-GUIDE.md
echo.
pause
