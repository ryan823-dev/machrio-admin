# GitHub Secrets 配置指南

## 获取 Railway Token

1. 访问：https://railway.app/account/tokens
2. 点击 **"Create New Token"**
3. 复制生成的 Token（格式如：`abc123xyz...`）

## 配置 GitHub Secrets

1. 访问：https://github.com/ryan823-dev/machrio-admin/settings/secrets/actions
2. 点击 **"New repository secret"**
3. 添加以下 Secrets：

### 必需的 Secrets：

| Name | Value | 说明 |
|------|-------|------|
| `RAILWAY_TOKEN` | 从 railway.app/account/tokens 复制 | Railway API 认证 Token |

### 可选的 Secrets（如果有多个项目）：

| Name | Value | 说明 |
|------|-------|------|
| `RAILWAY_PROJECT_ID` | （可选） | Railway 项目 ID |

## 获取 RAILWAY_PROJECT_ID（可选）

如果您知道 Railway 项目 ID，可以添加它。如果不知道，GitHub Actions 会自动处理。

获取方法：
1. 访问 Railway Dashboard
2. 进入您的项目
3. URL 中的 `project/xxx` 部分就是项目 ID
   - 例如：`https://railway.app/project/abc123`

## 触发部署

配置完成后：

1. **自动触发** - 推送代码到 main 分支会自动部署
   ```bash
   git push origin main
   ```

2. **手动触发** - 访问 GitHub Actions
   - 访问：https://github.com/ryan823-dev/machrio-admin/actions/workflows/force-deploy-railway.yml
   - 点击 **"Run workflow"**
   - 选择 main 分支
   - 点击 **"Run workflow"**

## 查看部署状态

1. 访问：https://github.com/ryan823-dev/machrio-admin/actions
2. 点击最新的 workflow run
3. 查看 `deploy` job 的输出

## 故障排查

### 错误：Unauthorized

- 检查 `RAILWAY_TOKEN` 是否正确
- 确认 Token 未过期
- 重新生成 Token 并更新 secret

### 错误：Project not found

- 检查 `RAILWAY_PROJECT_ID` 是否正确（如果配置了）
- 或者移除 `RAILWAY_PROJECT_ID`，让 Actions 自动查找

### 错误：Deployment failed

- 查看 GitHub Actions 日志
- 查看 Railway Dashboard 中的部署日志
- 检查环境变量配置

## 完成！

配置完成后，每次推送代码到 main 分支都会自动部署到 Railway！
