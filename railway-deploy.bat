@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Railway Direct Deployment
echo ========================================
echo.

set RAILWAY_TOKEN=%1
set PROJECT_ID=%2

if "%RAILWAY_TOKEN%"=="" (
    echo Error: Railway Token is required
    echo Usage: railway-deploy.bat ^<token^> [^<project_id^>]
    echo.
    echo Get your token from: https://railway.app/account/tokens
    pause
    exit /b 1
)

echo Token: %RAILWAY_TOKEN:~0,10%...
echo Project ID: %PROJECT_ID%
echo.

REM Create temporary JSON file for API request
echo {>"%TEMP%\railway-deploy.json"
echo   "query": "mutation DeploymentDeploy($projectId: String!, $environment: String!) { deploymentDeploy(projectId: $projectId, environment: $environment) { id status } }",>>"%TEMP%\railway-deploy.json"
echo   "variables": {>>"%TEMP%\railway-deploy.json"
echo     "projectId": "%PROJECT_ID%",>>"%TEMP%\railway-deploy.json"
echo     "environment": "production">>"%TEMP%\railway-deploy.json"
echo   }>>"%TEMP%\railway-deploy.json"
echo }>>"%TEMP%\railway-deploy.json"

echo Triggering deployment...
curl -X POST "https://backboard.railway.app/graphql" ^
    -H "Content-Type: application/json" ^
    -H "Authorization: Bearer %RAILWAY_TOKEN%" ^
    -d @"%TEMP%\railway-deploy.json"

del "%TEMP%\railway-deploy.json"

echo.
echo ========================================
echo Deployment triggered!
echo Check Railway Dashboard for status:
echo https://railway.app/dashboard
echo ========================================
pause
