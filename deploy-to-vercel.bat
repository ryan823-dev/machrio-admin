@echo off
echo ========================================
echo Machrio Admin Frontend - Vercel 部署脚本
echo ========================================
echo.

REM 检查是否安装 Vercel CLI
echo [检查] 检查 Vercel CLI...
where vercel >nul 2>&1
if errorlevel 1 (
    echo Vercel CLI 未安装，正在安装...
    npm install -g vercel
    if errorlevel 1 (
        echo Vercel CLI 安装失败
        pause
        exit /b 1
    )
)
echo Vercel CLI 已安装
echo.

REM 步骤 1: 登录 Vercel
echo [步骤 1/5] 登录 Vercel...
echo.
vercel login
if errorlevel 1 (
    echo 登录失败
    pause
    exit /b 1
)
echo 登录成功!
echo.

REM 步骤 2: 获取后端 URL
echo [步骤 2/5] 配置后端 API 地址...
echo.
set /p BACKEND_URL="请输入 Railway 后端 URL (例如：https://xxx.up.railway.app): "
if "%BACKEND_URL%"=="" (
    echo 错误：后端 URL 不能为空
    pause
    exit /b 1
)

REM 步骤 3: 进入前端目录
echo [步骤 3/5] 进入前端目录...
cd frontend
if errorlevel 1 (
    echo 无法进入前端目录
    pause
    exit /b 1
)
echo.

REM 步骤 4: 安装依赖
echo [步骤 4/5] 安装依赖...
echo.
call npm install
if errorlevel 1 (
    echo 依赖安装失败
    pause
    exit /b 1
)
echo.

REM 步骤 5: 部署
echo [步骤 5/5] 开始部署到 Vercel...
echo.
echo 设置环境变量...
set VITE_API_URL=%BACKEND_URL%/api

echo.
echo 开始部署...
echo 注意：在生产环境中部署时会设置 VITE_API_URL
echo.
vercel --prod
if errorlevel 1 (
    echo 部署失败
    cd ..
    pause
    exit /b 1
)

echo.
echo ========================================
echo 前端部署完成!
echo ========================================
echo.
echo 后端 URL: %BACKEND_URL%
echo 前端 URL: 请查看上面的部署输出
echo.
echo 下一步:
echo 1. 在 Railway 配置 CORS_ALLOWED_ORIGINS 为前端 URL
echo 2. 测试前后端连接
echo 3. 验证所有功能
echo.
echo 返回项目根目录...
cd ..
echo.
pause
