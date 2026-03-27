@echo off
REM 检查 Railway 部署状态

echo.
echo ============================================
echo   Railway 部署状态检查
echo ============================================
echo.

REM 检查 Railway CLI
where railway >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Railway CLI 未安装或未登录
    echo.
    echo 请手动检查部署状态:
    echo 1. 访问：https://railway.app/dashboard
    echo 2. 选择项目：machrio-admin
    echo 3. 查看 Deployments 标签
    echo.
    
    REM 尝试打开 Railway Dashboard
    start https://railway.app/dashboard/project/machrio-admin
    
    pause
    exit /b 0
)

REM 尝试登录
echo 正在登录 Railway...
railway login
if %errorlevel% neq 0 (
    echo [ERROR] 登录失败
    pause
    exit /b 1
)

echo.
echo [OK] 登录成功
echo.

REM 获取项目状态
echo 正在获取项目状态...
echo.

railway status
if %errorlevel% neq 0 (
    echo [WARNING] 无法获取项目状态
    echo.
)

echo.
echo ============================================
echo   查看部署日志
echo ============================================
echo.

set /p SHOW_LOGS="是否查看后端服务日志？(Y/N): "
if /i "%SHOW_LOGS%"=="Y" (
    railway logs --service machrio-backend --lines 50
)

echo.
echo ============================================
echo   下一步
echo ============================================
echo.
echo 如果部署成功:
echo 1. 添加 PostgreSQL 数据库
echo 2. 配置环境变量
echo 3. 测试 API 端点
echo.

pause
