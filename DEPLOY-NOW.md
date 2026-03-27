# 🚀 立即部署到 Railway

## ⚠️ 重要更新 - 数据库配置已修复

**最新修复（2026-03-27）：**
- ✅ 创建了 `DatabaseConfig.java` 自动转换 Railway 的 `postgresql://` 到 `jdbc:postgresql://`
- ✅ 修改了 `application.yml` 移除了冗余配置
- ✅ 更新了环境变量配置
- ✅ 修复了健康检查失败问题

**现在可以直接部署，无需手动配置数据库连接！**

---

## 方法 1: 使用 Railway Dashboard（最快，推荐）

### 步骤：

1. **访问 Railway Dashboard**
   - 打开：https://railway.app/dashboard
   - 登录您的账号

2. **创建新项目**
   - 点击 **"New Project"**
   - 选择 **"Deploy from GitHub repo"**
   - 授权并选择：`ryan823-dev/machrio-admin`

3. **部署后端**
   - 点击 **"New"** > **"Empty Service"**
   - 命名为：`machrio-backend`
   - 进入 **Settings** 标签，设置：
     - **Root Directory**: `backend/machrio-api`
     - **Build Command**: `./gradlew build -x test`
     - **Start Command**: `java -jar build/libs/*.jar`
   - 点击 **"New"** > **"Database"** > **"PostgreSQL"** 添加数据库
   - 在 **Variables** 标签添加环境变量：
     ```
     SERVER_PORT=8080
     APP_CORS_ALLOWED_ORIGINS=https://*.railway.app
     APP_STORAGE_BLOB_ENDPOINT=https://blob.vercel-blob.com
     ```
   - 点击 **"Deploy"**

4. **部署前端**
   - 点击 **"New"** > **"Empty Service"**
   - 命名为：`machrio-frontend`
   - 进入 **Settings** 标签，设置：
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Start Command**: `npx serve dist`
   - 在 **Variables** 标签添加环境变量：
     ```
     VITE_API_URL=https://your-backend.railway.app/api
     ```
     （将 `your-backend.railway.app` 替换为后端实际域名）
   - 点击 **"Deploy"**

5. **获取域名**
   - 在每个服务的 **Settings** > **Domains** 中点击 **"Generate Domain"**
   - 复制域名并更新前端的 `VITE_API_URL` 环境变量

---

## 方法 2: 使用部署脚本（需要手动登录）

### Windows:

```bash
cd d:\qoder\machrio-admin
quick-deploy.bat
```

### Linux/Mac:

```bash
cd /path/to/machrio-admin
chmod +x deploy-railway.sh
./deploy-railway.sh
```

**脚本会指导您完成：**
1. Railway 登录
2. 创建项目和服务
3. 添加数据库
4. 配置环境变量
5. 自动部署

---

## 方法 3: GitHub Actions 自动部署（适合持续集成）

### 第一步：获取 Railway Token

1. 访问：https://railway.app/account/tokens
2. 点击 **"Create New Token"**
3. 复制 Token（格式如：`abc123...`）

### 第二步：配置 GitHub Secrets

1. 打开：https://github.com/ryan823-dev/machrio-admin/settings/secrets/actions
2. 点击 **"New repository secret"**
3. 添加以下 Secrets：

| Name | Value | 说明 |
|------|-------|------|
| `RAILWAY_TOKEN` | 第一步的 Token | Railway API 认证 |
| `RAILWAY_PROJECT_ID` | （首次部署后获取）| 项目 ID |
| `RAILWAY_BACKEND_SERVICE_ID` | （首次部署后获取）| 后端服务 ID |
| `RAILWAY_FRONTEND_SERVICE_ID` | （首次部署后获取）| 前端服务 ID |
| `VITE_API_URL` | （部署后配置）| 后端 API 地址 |

### 第三步：首次手动部署获取 Service ID

运行以下命令获取 Project ID 和 Service ID：

```bash
# 登录 Railway
railway login

# 创建项目
railway init --name machrio-admin

# 部署后端
cd backend/machrio-api
railway init --name machrio-backend
railway add postgresql
railway variables set SERVER_PORT=8080
railway variables set APP_CORS_ALLOWED_ORIGINS=https://*.railway.app
railway up --detach

# 获取项目和服务 ID
railway project --id
railway service --id

# 部署前端
cd ../../frontend
railway init --name machrio-frontend
railway variables set VITE_API_URL=https://your-backend.railway.app/api
railway up --detach

# 获取前端服务 ID
railway service --id
```

### 第四步：推送代码自动部署

```bash
git add .
git commit -m "Deploy to Railway"
git push origin main
```

GitHub Actions 会自动部署到 Railway！

---

## 验证部署

### 1. 检查后端健康状态

```bash
curl https://your-backend.railway.app/api/health
```

期望响应：`{"status":"UP"}`

### 2. 访问前端

打开浏览器：`https://your-frontend.railway.app`

### 3. 查看日志

在 Railway Dashboard 中：
- 选择服务
- 点击 **"Logs"** 标签
- 查看实时日志

---

## 重要提示

### Railway Dashboard Dockerfile 路径设置

如果您使用 Dockerfile 部署，请确保在 Railway Dashboard 中设置正确的路径：

- **服务**: machrio-backend
- **Settings** > **Dockerfile Path**: `Dockerfile`（不是 `backend/machrio-api/Dockerfile`）

或者留空此设置，让 Railway 自动检测根目录的 Dockerfile。

---

## 故障排查

### 问题：构建失败 - Java 版本错误

**解决方案**：
确认 `backend/machrio-api/build.gradle` 中配置了 Java 21：

```groovy
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}
```

### 问题：前端无法连接后端

**解决方案**：
1. 检查前端环境变量 `VITE_API_URL` 是否正确
2. 更新后端 CORS 配置：
   ```bash
   railway variables set APP_CORS_ALLOWED_ORIGINS="https://your-frontend.railway.app"
   ```
3. 重新部署前端

### 问题：数据库连接失败

**解决方案**：
1. 确认已添加 PostgreSQL 服务
2. 检查 Railway Dashboard 中的数据库连接信息
3. 确认环境变量已正确注入

---

## 费用估算

| 服务 | 月费用 |
|------|--------|
| Railway 免费额度 | $5（每月赠送）|
| 后端 (Java) | $3-5 |
| 前端 (Node.js) | $1-2 |
| PostgreSQL | $2-3 |
| **总计** | **$6-10**（在免费额度内）|

---

## 获取帮助

- 查看 `DEPLOYMENT_GUIDE.md` 获取详细指南
- 查看 `README.RAILWAY.md` 了解项目结构
- Railway 官方文档：https://docs.railway.app

---

**祝您部署成功！** 🎉
