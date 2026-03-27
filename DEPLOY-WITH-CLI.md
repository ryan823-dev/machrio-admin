# Railway CLI 部署指南

## 问题

Railway CLI 需要交互式登录，无法在自动化脚本中使用。

## 解决方案

### 方法 1：使用 GitHub Actions（推荐）

1. 获取 Railway Token：https://railway.app/account/tokens
2. 在 GitHub 配置 Secret：https://github.com/ryan823-dev/machrio-admin/settings/secrets/actions
   - Name: `RAILWAY_TOKEN`
   - Value: 你的 Token
3. 推送代码会自动触发部署
4. 或手动触发：https://github.com/ryan823-dev/machrio-admin/actions/workflows/force-deploy-railway.yml

### 方法 2：手动登录 CLI 后部署

```bash
# 1. 登录（会打开浏览器）
cd d:\qoder\machrio-admin
railway login

# 2. 链接项目
railway link

# 3. 部署
railway up --detach

# 4. 查看日志
railway logs

# 5. 查看状态
railway status
```

### 方法 3：使用 PowerShell 脚本

```powershell
# 1. 允许执行脚本
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 2. 运行部署脚本
.\railway-api-deploy.ps1 -Token "your-railway-token" -ProjectId "your-project-id"
```

### 方法 4：使用批处理文件

```batch
railway-deploy.bat <your-railway-token> [project-id]
```

## 获取 Railway Token

1. 访问：https://railway.app/account/tokens
2. 点击 "Create New Token"
3. 复制 Token

## 获取 Project ID

1. 访问 Railway Dashboard：https://railway.app/dashboard
2. 选择你的项目
3. URL 中的项目 ID：`https://railway.app/project/PROJECT_ID`

## 验证部署

部署后访问：
- Railway Dashboard: https://railway.app/dashboard
- 查看日志：`railway logs`
- 健康检查：`https://your-app.railway.app/api/health`
