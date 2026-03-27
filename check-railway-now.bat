@echo off
REM 立即检查 Railway 部署状态

powershell -NoProfile -ExecutionPolicy Bypass -File "d:\qoder\machrio-admin\verify-deployment.ps1"
