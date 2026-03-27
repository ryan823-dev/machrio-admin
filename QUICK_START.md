# 🚀 Railway 部署 - 3 步快速开始

由于 CLI 限制，请使用以下最简单的方式部署：

## 步骤 1️⃣: 获取 Railway Token (1 分钟)

1. 访问：**https://railway.app/account/tokens**
2. 点击 **"Create New Token"**
3. 复制 Token（保存好，只显示一次）

## 步骤 2️⃣: 在 Railway Dashboard 部署 (5 分钟)

### 方法 A: 一键部署（最简单）

1. 访问：**https://railway.app/dashboard**
2. 点击 **"New Project"**
3. 选择 **"Deploy from GitHub repo"**
4. 授权并选择：**ryan823-dev/machrio-admin**
5. Railway 会自动检测并部署！

### 方法 B: 手动部署后端

1. **创建后端服务**:
   - New > Empty Service
   - 名称：`machrio-backend`
   
2. **配置后端**:
   - Settings > Root Directory: `backend/machrio-api`
   - Settings > Build Command: `./gradlew build -x test`
   - Settings > Start Command: `java -jar build/libs/*.jar`
   
3. **添加数据库**:
   - New > Database > PostgreSQL
   
4. **设置环境变量** (Variables 标签):
   ```
   SERVER_PORT=8080
   APP_CORS_ALLOWED_ORIGINS=http://localhost:5173,https://*.railway.app
   APP_STORAGE_BLOB_ENDPOINT=https://blob.vercel-blob.com
   ```

5. **部署**: 等待自动构建完成

### 方法 C: 手动部署前端

1. **创建前端服务**:
   - New > Empty Service
   - 名称：`machrio-frontend`
   
2. **配置前端**:
   - Settings > Root Directory: `frontend`
   - Settings > Build Command: `npm run build`
   - Settings > Start Command: `npx serve dist`
   
3. **设置环境变量**:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
   （将 `your-backend.railway.app` 替换为后端实际域名）

4. **部署**: 等待自动构建完成

## 步骤 3️⃣: 获取域名并测试

### 后端域名
1. 选择后端服务
2. Settings > Domains > Generate Domain
3. 复制域名（如：`machrio-backend-production.up.railway.app`）

### 前端域名
1. 选择前端服务
2. Settings > Domains > Generate Domain
3. 复制域名

### 测试
- 后端健康检查：`https://后端域名/api/health`
- 前端访问：`https://前端域名`

---

## 🎯 完成！

部署成功后你应该看到：
- ✅ 后端 API 正常运行
- ✅ 前端页面可以访问
- ✅ 数据库连接成功

---

## 📱 需要帮助？

运行以下命令获取交互式指导：
```bash
d:\qoder\machrio-admin\quick-deploy.bat
```

或查看详细指南：
```
d:\qoder\machrio-admin\DEPLOYMENT_GUIDE.md
```

---

## 💡 自动部署（可选）

部署成功后，配置 GitHub Actions 实现自动部署：

1. 在 Railway Dashboard 获取：
   - Project ID
   - Backend Service ID
   - Frontend Service ID

2. 在 GitHub 仓库配置 Secrets：
   - Settings > Secrets and variables > Actions
   - 添加：
     ```
     RAILWAY_TOKEN=你的 Token
     RAILWAY_PROJECT_ID=项目 ID
     RAILWAY_BACKEND_SERVICE_ID=后端服务 ID
     RAILWAY_FRONTEND_SERVICE_ID=前端服务 ID
     VITE_API_URL=后端 API 地址
     ```

3. 推送代码自动部署！

---

**预计时间**: 5-10 分钟
**难度**: ⭐⭐☆☆☆（简单）
