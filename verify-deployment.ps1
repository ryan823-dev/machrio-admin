# Railway 部署验证脚本 (PowerShell 版本)

Write-Host ""
Write-Host "============================================"
Write-Host "  Railway 部署状态验证"
Write-Host "============================================"
Write-Host ""

# 检查 Railway CLI
$railwayPath = Get-Command railway -ErrorAction SilentlyContinue
if (-not $railwayPath) {
    Write-Host "[ERROR] Railway CLI 未安装" -ForegroundColor Red
    Write-Host "请运行：npm install -g @railway/cli"
    Write-Host ""
    Write-Host "或者手动访问：https://railway.app/dashboard" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "[OK] Railway CLI 已安装" -ForegroundColor Green
Write-Host ""

# 检查登录状态
Write-Host "检查 Railway 登录状态..."
$loginResult = railway whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] 未登录 Railway" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "正在启动浏览器登录..."
    Write-Host "请在打开的浏览器窗口中完成登录"
    Write-Host ""
    
    # 尝试登录
    railway login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] 登录失败" -ForegroundColor Red
        pause
        exit 1
    }
} else {
    Write-Host "[OK] 已登录 Railway" -ForegroundColor Green
}

Write-Host ""
Write-Host "正在获取项目信息..." -ForegroundColor Cyan

# 获取项目状态
$status = railway status 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host $status
} else {
    Write-Host "[ERROR] 无法获取项目状态" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================"
Write-Host "  查看日志"
Write-Host "============================================"
Write-Host ""
Write-Host "请选择要查看的服务:"
Write-Host "[1] 后端服务 (machrio-backend)"
Write-Host "[2] 前端服务 (machrio-frontend)"
Write-Host "[3] 查看部署历史"
Write-Host "[4] 重新部署后端"
Write-Host "[5] 退出"
Write-Host ""

$choice = Read-Host "输入选项 (1-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "正在查看后端服务日志..." -ForegroundColor Cyan
        Write-Host "按 Ctrl+C 停止查看"
        Write-Host ""
        railway logs --service machrio-backend --lines 50
    }
    "2" {
        Write-Host ""
        Write-Host "正在查看前端服务日志..." -ForegroundColor Cyan
        railway logs --service machrio-frontend --lines 50
    }
    "3" {
        Write-Host ""
        Write-Host "正在查看部署历史..." -ForegroundColor Cyan
        railway deployments
    }
    "4" {
        Write-Host ""
        Write-Host "正在重新部署后端..." -ForegroundColor Cyan
        Set-Location backend\machrio-api
        railway up
        Set-Location ..\..
    }
    "5" {
        exit 0
    }
    default {
        Write-Host "无效的选项" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "操作完成!" -ForegroundColor Green
pause
