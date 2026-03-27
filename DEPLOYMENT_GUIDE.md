# 🚀 Railway 一键部署指南

## 方法 1: GitHub Actions 自动部署（推荐）

### 第一步：获取 Railway Token

1. 访问 https://railway.app/account/tokens
2. 点击 **"Create New Token"**
3. 复制生成的 Token（格式如：`1234567890abcdef...`）

### 第二步：在 GitHub 中配置 Secrets

1. 打开 GitHub 仓库：https://github.com/ryan823-dev/machrio-admin
2. 进入 **Settings** > **Secrets and variables** > **Actions**
3. 点击 **"New repository secret"**
4. 添加以下 Secrets：

| Name | Value | 说明 |
|------|-------|------|
| `RAILWAY_TOKEN` | 第一步中创建的 Token | Railway API 认证 Token |
| `RAILWAY_PROJECT_ID` | （首次部署后获取） | Railway 项目 ID |
| `RAILWAY_BACKEND_SERVICE_ID` | （首次部署后获取） | 后端服务 ID |
| `RAILWAY_FRONTEND_SERVICE_ID` | （首次部署后获取） | 前端服务 ID |
| `VITE_API_URL` | （部署后配置） | 后端 API 地址 |

### 第三步：首次手动部署（获取 Service ID）

由于需要获取 Project ID 和 Service ID，首次部署需要手动操作：

#### 3.1 部署后端

```bash
# 1. 登录 Railway
railway login

# 2. 创建项目
railway init --name machrio-admin

# 3. 进入后端目录
cd backend/machrio-api

# 4. 创建后端服务
railway init --name machrio-backend

# 5. 添加 PostgreSQL 数据库
railway add postgresql

# 6. 设置环境变量
railway variables set SERVER_PORT=8080
railway variables set APP_CORS_ALLOWED_ORIGINS="http://localhost:5173"
railway variables set APP_STORAGE_BLOB_ENDPOINT="https://blob.vercel-blob.com"

# 7. 部署
railway up

# 8. 获取项目和服务 ID
railway project --id
# 输出格式：Project ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

railway service --id
# 输出格式：Service ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

#### 3.2 部署前端

```bash
# 1. 返回根目录并进入前端
cd ../../frontend

# 2. 创建前端服务
railway init --name machrio-frontend

# 3. 设置环境变量（先留空，等后端部署后更新）
railway variables set VITE_API_URL="https://your-backend.railway.app/api"

# 4. 部署
railway up

# 5. 获取前端服务 ID
railway service --id
```

### 第四步：配置 GitHub Secrets

将第三步获取的 ID 添加到 GitHub Secrets：

1. `RAILWAY_PROJECT_ID` - 项目 ID
2. `RAILWAY_BACKEND_SERVICE_ID` - 后端服务 ID
3. `RAILWAY_FRONTEND_SERVICE_ID` - 前端服务 ID
4. `VITE_API_URL` - 后端 API 地址（从 Railway Dashboard 获取）

### 第五步：启用自动部署

现在，每次推送到 `main` 分支时，GitHub Actions 会自动部署：

- 修改后端代码 → 自动部署后端
- 修改前端代码 → 自动部署前端

---

## 方法 2: 使用 Railway Dashboard（最简单）

### 步骤 1: 连接 GitHub

1. 访问 https://railway.app/dashboard
2. 点击 **"New Project"**
3. 选择 **"Deploy from GitHub repo"**
4. 授权 Railway 访问你的 GitHub
5. 选择 `ryan823-dev/machrio-admin` 仓库

### 步骤 2: 部署后端

1. 点击 **"New"** > **"Empty Service"**
2. 设置服务名称：`machrio-backend`
3. 在 **Settings** 中设置：
   - **Root Directory**: `backend/machrio-api`
   - **Start Command**: `java -jar build/libs/*.jar`
   - **Build Command**: `./gradlew build -x test`

4. 添加 PostgreSQL：
   - 点击 **"New"** > **"Database"** > **"PostgreSQL"**
   - Railway 会自动注入数据库环境变量

5. 设置环境变量（Variables 标签）：
   ```
   SERVER_PORT=8080
   APP_CORS_ALLOWED_ORIGINS=http://localhost:5173
   APP_STORAGE_BLOB_ENDPOINT=https://blob.vercel-blob.com
   ```

6. 点击 **"Deploy"**

### 步骤 3: 部署前端

1. 点击 **"New"** > **"Empty Service"**
2. 设置服务名称：`machrio-frontend`
3. 在 **Settings** 中设置：
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npx serve dist`

4. 设置环境变量：
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```

5. 点击 **"Deploy"**

### 步骤 4: 配置域名

1. 在 Railway Dashboard 中选择服务
2. 进入 **Settings** > **Domains**
3. 点击 **"Generate Domain"**
4. 复制生成的域名（如：`machrio-backend-production.up.railway.app`）
5. 更新前端的 `VITE_API_URL` 环境变量为后端域名

---

## 方法 3: 使用部署脚本

### Windows

```bash
cd d:\qoder\machrio-admin
deploy-railway.bat
```

### Linux/Mac

```bash
cd /path/to/machrio-admin
chmod +x deploy-railway.sh
./deploy-railway.sh
```

---

## 验证部署

### 1. 检查后端健康状态

```bash
curl https://your-backend.railway.app/api/health
```

期望响应：`{"status":"UP"}` 或类似内容

### 2. 访问前端

打开浏览器访问：`https://your-frontend.railway.app`

### 3. 查看日志

在 Railway Dashboard 中：
- 选择服务
- 点击 **"Logs"** 标签
- 查看实时日志

---

## 常见问题

### Q1: 构建失败 - Java 版本错误

**解决方案：**
确保 Railway 使用 Java 21。检查 `backend/machrio-api/build.gradle`：
```groovy
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}
```

### Q2: 前端无法连接后端

**解决方案：**
1. 检查前端环境变量 `VITE_API_URL` 是否正确
2. 确保后端 CORS 配置包含前端域名
3. 在 Railway Dashboard 中重新部署前端服务

### Q3: 数据库连接失败

**解决方案：**
1. 确认已添加 PostgreSQL 服务
2. 检查环境变量 `SPRING_DATASOURCE_*` 是否正确
3. 在 Railway Dashboard 中查看数据库连接信息

### Q4: GitHub Actions 部署失败

**解决方案：**
1. 检查 Secrets 是否正确配置
2. 确认 `RAILWAY_TOKEN` 未过期
3. 查看 GitHub Actions 日志获取详细错误信息

---

## 费用估算

Railway 免费套餐：
- **免费额度**: $5/月
- **后端 (Java)**: ~$3-5/月
- **前端 (Node.js)**: ~$1-2/月
- **PostgreSQL**: ~$2-3/月
- **总计**: ~$6-10/月（在免费额度内）

---

## 下一步

部署成功后：

1. ✅ 测试所有 API 端点
2. ✅ 配置自定义域名（可选）
3. ✅ 设置监控和告警
4. ✅ 配置自动备份数据库
5. ✅ 更新 CORS 白名单为生产域名

---

## 支持资源

- Railway 文档：https://docs.railway.app
- GitHub Actions 文档：https://docs.github.com/en/actions
- Spring Boot 部署指南：https://spring.io/guides
