# Railway 部署指南

## 项目结构

- **Backend**: Spring Boot 3.5.0 (Java 21) + PostgreSQL
- **Frontend**: React + TypeScript + Vite + Refine + Ant Design

## 部署步骤

### 1️⃣ 准备工作

确保你已经有：
- Railway 账号 (https://railway.app)
- GitHub 账号
- 项目已推送到 GitHub: https://github.com/ryan823-dev/machrio-admin

### 2️⃣ 部署后端 (Spring Boot API)

#### 方法 A: 使用 Railway Dashboard（推荐）

1. 登录 Railway Dashboard: https://railway.app/dashboard
2. 点击 **"New Project"**
3. 选择 **"Deploy from GitHub repo"**
4. 选择 `ryan823-dev/machrio-admin` 仓库
5. 选择 **"backend/machrio-api"** 作为 Root Directory
6. Railway 会自动检测 Java 项目并配置构建

#### 方法 B: 使用 Railway CLI

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录 Railway
railway login

# 初始化项目（在 backend/machrio-api 目录）
cd backend/machrio-api
railway init

# 创建新服务
railway up
```

### 3️⃣ 配置后端环境变量

在 Railway Dashboard 中为后端服务添加以下环境变量：

```bash
# 数据库配置（Railway 会自动提供 PostgreSQL）
DATABASE_URL=${{Postgres.DATABASE_URL}}
SPRING_DATASOURCE_URL=jdbc:postgresql://${{Postgres.HOST}}:${{Postgres.PORT}}/${{Postgres.DATABASE}}
SPRING_DATASOURCE_USERNAME=${{Postgres.USER}}
SPRING_DATASOURCE_PASSWORD=${{Postgres.PASSWORD}}

# 服务器配置
SERVER_PORT=8080

# CORS 配置（替换为你的前端域名）
APP_CORS_ALLOWED_ORIGINS=https://your-frontend.railway.app,http://localhost:5173

# 存储配置
APP_STORAGE_BLOB_ENDPOINT=https://blob.vercel-blob.com
```

### 4️⃣ 添加 PostgreSQL 数据库

1. 在 Railway Dashboard 中选择后端服务
2. 点击 **"New"** > **"Database"** > **"PostgreSQL"**
3. Railway 会自动创建数据库并注入环境变量
4. 等待数据库部署完成（约 1-2 分钟）

### 5️⃣ 部署前端 (React + Vite)

#### 方法 A: 使用 Railway Dashboard

1. 在同一个 Railway Project 中，点击 **"New"**
2. 选择 **"Deploy from GitHub repo"**
3. 选择 `ryan823-dev/machrio-admin` 仓库
4. 选择 **"frontend"** 作为 Root Directory
5. Railway 会自动检测 Node.js 项目

#### 方法 B: 使用 Railway CLI

```bash
# 在 frontend 目录
cd frontend
railway init

# 创建新服务
railway up
```

### 6️⃣ 配置前端环境变量

在 Railway Dashboard 中为前端服务添加环境变量：

```bash
# API 地址（替换为你的后端域名）
VITE_API_URL=https://your-backend.railway.app/api
```

### 7️⃣ 配置自动部署

Railway 会自动监听 GitHub 仓库变化：

1. 在 Railway Dashboard 中进入项目设置
2. 确保 **"Auto Deploy"** 已启用
3. 设置部署分支为 `main`
4. 每次 push 到 main 分支会自动触发部署

### 8️⃣ 配置自定义域名（可选）

1. 在 Railway Dashboard 中进入项目设置
2. 点击 **"Domains"**
3. 添加你的自定义域名
4. 按照提示配置 DNS 记录

## 健康检查端点

- **Backend**: `https://your-backend.railway.app/api/health`
- **Frontend**: `https://your-frontend.railway.app/`

## 常见问题

### Q: 构建失败，提示 Java 版本错误
**A**: 确保 Railway 使用 Java 21。检查 `build.gradle` 中的 `languageVersion = JavaLanguageVersion.of(21)`

### Q: 前端无法连接后端 API
**A**: 检查前端的 `VITE_API_URL` 环境变量是否正确指向后端地址

### Q: 数据库连接失败
**A**: 确保已添加 PostgreSQL 服务并正确配置环境变量

### Q: CORS 错误
**A**: 在后端环境变量中添加前端域名到 `APP_CORS_ALLOWED_ORIGINS`

## 监控和日志

- **Logs**: Railway Dashboard > 选择服务 > **Logs** 标签
- **Metrics**: Railway Dashboard > 选择服务 > **Metrics** 标签
- **Deployments**: Railway Dashboard > 选择服务 > **Deployments** 标签

## 费用估算

Railway 免费套餐：
- $5 免费额度/月
- 后端（Java）：约 $3-5/月
- 前端（Node.js）：约 $1-2/月
- PostgreSQL：约 $2-3/月

总计：约 $6-10/月（在免费额度内）

## 下一步

部署完成后：
1. 测试后端 API: `GET https://your-backend.railway.app/api/health`
2. 访问前端: `https://your-frontend.railway.app`
3. 检查数据库连接和 API 功能

## 技术支持

- Railway 文档: https://docs.railway.app
- Spring Boot 文档: https://spring.io/projects/spring-boot
- 项目问题: 查看 GitHub Issues
