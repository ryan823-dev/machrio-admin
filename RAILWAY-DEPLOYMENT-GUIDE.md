# Railway Deployment Guide

## 项目架构

machrio-admin 项目分为两个独立的部分：

### 1. 后端 (Backend)
- **技术栈**: Spring Boot 3.5.0 + Java 21
- **位置**: `backend/machrio-api/`
- **端口**: 8080
- **数据库**: PostgreSQL (Railway 提供)

### 2. 前端 (Frontend)
- **技术栈**: React 19 + TypeScript + Vite + Ant Design 5
- **位置**: `frontend/`
- **端口**: 3000 (开发), 静态文件 (生产)
- **部署**: Vercel (推荐) 或 Railway

---

## 🚀 方案一：后端部署到 Railway + 前端部署到 Vercel (推荐)

### 第一部分：部署后端到 Railway

#### 步骤 1: 准备 Railway 项目

1. 访问 [Railway](https://railway.app/)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择 `machrio-admin` 仓库

#### 步骤 2: 配置 PostgreSQL 数据库

1. 在 Railway 项目中点击 "New" → "Database" → "PostgreSQL"
2. 等待数据库创建完成
3. 记录以下环境变量（自动生成）：
   - `DATABASE_URL`
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`

#### 步骤 3: 配置后端环境变量

在 Railway 项目设置中添加以下环境变量：

```bash
# 数据库配置 (Railway 会自动提供)
DATABASE_URL=postgresql://...

# Spring 配置
SPRING_PROFILES_ACTIVE=production
SERVER_PORT=8080

# JWT 配置
JWT_SECRET=your-secret-key-here-32-chars-min
JWT_EXPIRATION=86400000

# OSS 配置 (如果使用)
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
OSS_ACCESS_KEY_ID=your-access-key
OSS_ACCESS_KEY_SECRET=your-secret-key
OSS_BUCKET=vertax

# 前端 URL (部署后更新)
FRONTEND_URL=https://your-app.vercel.app
```

#### 步骤 4: 配置 Railway 构建

创建或更新 `railway.json` (已存在):

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "java -jar app.jar",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 180,
    "restartPolicyType": "ON_FAILURE",
    "numReplicas": 1
  }
}
```

#### 步骤 5: 部署后端

1. 在 Railway 项目页面，点击 "Deploy"
2. Railway 会自动使用 Dockerfile 构建
3. 等待部署完成（约 3-5 分钟）
4. 点击 "Generate Domain" 获取公共 URL
5. 记录后端 URL，例如：`https://machrio-backend-production.up.railway.app`

#### 步骤 6: 运行数据库迁移

Railway 会自动运行 Flyway 迁移（通过 `application.yml` 配置）

手动验证迁移：
```bash
# 在 Railway 中打开 Console
# 运行以下 SQL 检查表是否创建
\dt
```

应该看到以下表：
- categories
- products
- shipping_methods
- shipping_rates
- free_shipping_rules
- bank_accounts
- flyway_schema_history

---

### 第二部分：部署前端到 Vercel

#### 步骤 1: 准备 Vercel 项目

1. 访问 [Vercel](https://vercel.com/)
2. 使用 GitHub 账号登录
3. 点击 "Add New..." → "Project"
4. 选择 `machrio-admin` 仓库
5. 点击 "Import"

#### 步骤 2: 配置前端环境变量

在 Vercel 项目设置中添加：

```bash
# 后端 API URL (使用 Railway 后端地址)
VITE_API_URL=https://machrio-backend-production.up.railway.app/api

# OSS 配置 (如果需要)
VITE_OSS_ENABLED=true
```

#### 步骤 3: 配置构建设置

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### 步骤 4: 部署前端

1. 点击 "Deploy"
2. 等待构建完成（约 2-3 分钟）
3. 获取前端 URL，例如：`https://machrio-admin.vercel.app`

#### 步骤 5: 更新后端 CORS 配置

在 Railway 后端环境变量中添加：

```bash
# 允许前端访问
CORS_ALLOWED_ORIGINS=https://machrio-admin.vercel.app,https://machrio-admin-*.vercel.app
```

---

## 🚀 方案二：全部部署到 Railway (单体部署)

### 修改 Dockerfile 同时构建前后端

创建新的 `Dockerfile.fullstack`:

```dockerfile
# 构建前端
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 构建后端
FROM eclipse-temurin:21-jdk-alpine AS backend-build
WORKDIR /app
COPY backend/machrio-api/gradlew ./
COPY backend/machrio-api/gradlew.bat ./
COPY backend/machrio-api/settings.gradle ./
COPY backend/machrio-api/build.gradle ./
COPY backend/machrio-api/gradle ./gradle
RUN chmod +x ./gradlew
RUN ./gradlew dependencies --no-daemon || true
COPY backend/machrio-api/src ./src
RUN ./gradlew clean build -x test --no-daemon

# 运行阶段
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# 复制后端 jar
COPY --from=backend-build /app/build/libs/*.jar app.jar

# 复制前端静态文件
COPY --from=frontend-build /app/frontend/dist ./static

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=production
ENV JAVA_TOOL_OPTIONS="-Xms128m -Xmx512m -XX:+UseG1GC"

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 配置 Spring Boot 提供静态文件

在 `backend/machrio-api/src/main/resources/application.yml` 中添加：

```yaml
spring:
  web:
    resources:
      static-locations: classpath:/static/
  mvc:
    static-path-pattern: /**
```

---

## 🔧 环境变量完整列表

### 后端环境变量 (Railway)

```bash
# 必需
DATABASE_URL=postgresql://...
SPRING_PROFILES_ACTIVE=production
JWT_SECRET=your-32-char-secret-key-here

# OSS (可选)
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
OSS_ACCESS_KEY_ID=LTAI5t...
OSS_ACCESS_KEY_SECRET=...
OSS_BUCKET=vertax

# CORS
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app

# 日志
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_MACHRIO=DEBUG
```

### 前端环境变量 (Vercel)

```bash
# 必需
VITE_API_URL=https://your-railway-app.up.railway.app/api

# OSS (可选)
VITE_OSS_ENABLED=true
```

---

## ✅ 验证部署

### 1. 检查后端健康

访问：`https://your-railway-app.up.railway.app/api/health`

应该返回：
```json
{
  "status": "UP",
  "timestamp": "2026-03-28T..."
}
```

### 2. 测试 API 端点

```bash
# 获取分类列表
curl https://your-railway-app.up.railway.app/api/categories

# 获取运输方法
curl https://your-railway-app.up.railway.app/api/shipping-methods

# 获取银行账户列表
curl https://your-railway-app.up.railway.app/api/bank-accounts
```

### 3. 测试前端

访问：`https://your-app.vercel.app`

测试以下页面：
- 登录页面
- 产品管理 `/products`
- 分类管理 `/categories`
- 运输配置 `/shipping-methods`
- 银行账户 `/bank-accounts`

---

## 🐛 常见问题排查

### 1. 后端启动失败

**问题**: 数据库连接错误
```
Cannot determine embedded database driver class
```

**解决**: 确保 Railway 已添加 PostgreSQL 插件，并正确设置 `DATABASE_URL`

### 2. 前端无法连接后端

**问题**: CORS 错误或网络错误

**解决**:
1. 检查 `VITE_API_URL` 是否正确
2. 在后端添加 CORS 配置
3. 确保后端 CORS_ALLOWED_ORIGINS 包含前端域名

### 3. 数据库迁移失败

**问题**: Flyway 迁移错误

**解决**:
```bash
# 在 Railway Console 中检查
SELECT * FROM flyway_schema_history;

# 如果需要重置
DROP TABLE IF EXISTS flyway_schema_history CASCADE;
```

### 4. 构建超时

**问题**: Railway 构建超过 15 分钟

**解决**:
- 优化 Dockerfile 使用缓存层
- 减少不必要的依赖
- 考虑使用 Railway 的 Build Cache

---

## 📊 部署架构

```
┌─────────────────┐
│   Vercel        │
│   (Frontend)    │
│   Port: 443     │
└────────┬────────┘
         │
         │ HTTPS
         │ API Calls
         │
┌────────▼────────┐
│   Railway       │
│   (Backend)     │
│   Port: 8080    │
└────────┬────────┘
         │
         │ JDBC
         │
┌────────▼────────┐
│   Railway       │
│   PostgreSQL    │
│   Port: 5432    │
└─────────────────┘
```

---

## 💰 成本估算

### Railway (后端 + 数据库)
- **Hobby Plan**: $5/月 (包含 $5 credit)
- **后端实例**: ~$5/月
- **PostgreSQL**: ~$5/月 (基本套餐)
- **总计**: ~$10/月

### Vercel (前端)
- **Hobby Plan**: 免费
- **Pro Plan**: $20/月 (如需更多功能)
- **总计**: $0-20/月

**总计**: $10-30/月

---

## 🔄 CI/CD 自动部署

### GitHub Actions 配置

项目已包含自动部署工作流：

1. **后端部署**: `.github/workflows/deploy-railway.yml`
2. **前端部署**: `.github/workflows/deploy-frontend.yml`

### 配置 Railway Token

1. 在 Railway 设置 → Developer Settings → Generate Token
2. 在 GitHub 仓库设置 → Secrets → New repository secret
3. 添加：`RAILWAY_TOKEN=your-token-here`

### 自动部署流程

```
代码推送 → GitHub Actions → Railway API → 自动部署
   ↓
 main 分支
   ↓
触发部署
```

---

## 📝 部署检查清单

### 部署前
- [ ] 确认所有代码已提交到 main 分支
- [ ] 测试本地构建：`npm run build` (前端) 和 `./gradlew build` (后端)
- [ ] 准备环境变量
- [ ] 备份数据库（如果已有数据）

### 部署中
- [ ] 部署后端到 Railway
- [ ] 添加 PostgreSQL 数据库
- [ ] 配置环境变量
- [ ] 等待健康检查通过
- [ ] 部署前端到 Vercel
- [ ] 配置前端环境变量

### 部署后
- [ ] 测试所有 API 端点
- [ ] 测试前端所有页面
- [ ] 验证数据库迁移
- [ ] 检查日志无错误
- [ ] 配置自定义域名（可选）

---

## 🎯 快速部署命令

```bash
# 1. 登录 Railway
railway login

# 2. 初始化项目
railway init

# 3. 添加数据库
railway add postgresql

# 4. 设置环境变量
railway variables set SPRING_PROFILES_ACTIVE=production
railway variables set JWT_SECRET=your-secret-key

# 5. 部署
railway up

# 6. 查看日志
railway logs

# 7. 生成域名
railway domain
```

---

## 📚 相关文档

- [Railway 文档](https://docs.railway.app/)
- [Vercel 文档](https://vercel.com/docs)
- [Spring Boot 部署指南](https://docs.spring.io/spring-boot/docs/current/reference/html/cloud-deployment.html)
- [Flyway 迁移文档](https://flywaydb.org/documentation/)

---

*最后更新：2026-03-28*
*项目：machrio-admin*
