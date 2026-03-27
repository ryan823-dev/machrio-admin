# 🚀 Machrio Admin - Railway 部署配置

本项目已配置好一键部署到 Railway，包含完整的 CI/CD 工作流。

## 📦 项目结构

```
machrio-admin/
├── backend/              # Spring Boot 后端 (Java 21)
│   └── machrio-api/
│       ├── build.gradle
│       ├── Dockerfile.railway
│       └── railway.toml
├── frontend/             # React + Vite 前端
│   ├── package.json
│   ├── Dockerfile.railway
│   └── railway.toml
├── .github/workflows/    # GitHub Actions 工作流
│   ├── deploy-backend.yml
│   └── deploy-frontend.yml
├── quick-deploy.bat      # 快速部署助手（Windows）
├── deploy-railway.sh     # 快速部署脚本（Linux/Mac）
└── DEPLOYMENT_GUIDE.md   # 详细部署指南
```

## ⚡ 快速开始（3 分钟部署）

### 方式 1: 运行快速部署助手（推荐）

```bash
# Windows
cd d:\qoder\machrio-admin
quick-deploy.bat

# Linux/Mac
chmod +x deploy-railway.sh
./deploy-railway.sh
```

### 方式 2: GitHub Actions 自动部署

1. **获取 Railway Token**: https://railway.app/account/tokens

2. **配置 GitHub Secrets**:
   - 进入仓库 Settings > Secrets and variables > Actions
   - 添加以下 Secrets：
     ```
     RAILWAY_TOKEN=your_token_here
     RAILWAY_PROJECT_ID=your_project_id
     RAILWAY_BACKEND_SERVICE_ID=your_backend_service_id
     RAILWAY_FRONTEND_SERVICE_ID=your_frontend_service_id
     VITE_API_URL=https://your-backend.railway.app/api
     ```

3. **推送代码**:
   ```bash
   git add .
   git commit -m "Setup Railway deployment"
   git push origin main
   ```

4. **查看部署状态**: https://github.com/ryan823-dev/machrio-admin/actions

### 方式 3: Railway Dashboard 手动部署

1. 访问 https://railway.app/dashboard
2. New Project > Deploy from GitHub repo
3. 选择 `ryan823-dev/machrio-admin` 仓库
4. 按照 `DEPLOYMENT_GUIDE.md` 中的步骤部署

## 🌐 技术栈

### 后端
- **框架**: Spring Boot 3.5.0
- **语言**: Java 21
- **数据库**: PostgreSQL
- **构建工具**: Gradle

### 前端
- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **UI 库**: Ant Design 5 + Refine
- **包管理**: npm

## 🔧 环境变量配置

### 后端环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `SERVER_PORT` | 服务端口 | `8080` |
| `SPRING_DATASOURCE_URL` | 数据库连接 URL | `jdbc:postgresql://...` |
| `SPRING_DATASOURCE_USERNAME` | 数据库用户名 | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | 数据库密码 | `your_password` |
| `APP_CORS_ALLOWED_ORIGINS` | 允许的 CORS 源 | `https://*.railway.app` |
| `APP_STORAGE_BLOB_ENDPOINT` | 存储端点 | `https://blob.vercel-blob.com` |

### 前端环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_API_URL` | 后端 API 地址 | `https://your-backend.railway.app/api` |

## 📊 部署架构

```
┌─────────────────────────────────────────────┐
│           Railway Platform                  │
│                                             │
│  ┌──────────────────┐  ┌────────────────┐  │
│  │   Frontend       │  │   Backend      │  │
│  │   React + Vite   │─▶│   Spring Boot  │  │
│  │   Port: 80       │  │   Port: 8080   │  │
│  └──────────────────┘  └───────┬────────┘  │
│                                │           │
│                         ┌──────▼────────┐  │
│                         │  PostgreSQL   │  │
│                         │  Database     │  │
│                         └───────────────┘  │
└─────────────────────────────────────────────┘
         ▲
         │
    GitHub Actions
    (Auto Deploy)
```

## 🎯 部署检查清单

- [ ] Railway 账号已创建
- [ ] GitHub 账号已连接
- [ ] Railway Token 已获取
- [ ] GitHub Secrets 已配置
- [ ] 后端服务已部署
- [ ] PostgreSQL 数据库已添加
- [ ] 前端服务已部署
- [ ] 环境变量已配置
- [ ] 健康检查通过
- [ ] 前端能正常访问后端 API

## 🔍 验证部署

### 1. 检查后端健康状态

```bash
curl https://your-backend.railway.app/api/health
```

### 2. 访问前端应用

```
https://your-frontend.railway.app
```

### 3. 查看部署日志

Railway Dashboard > 选择服务 > Logs 标签

### 4. 测试数据库连接

Railway Dashboard > PostgreSQL > Connect > Copy connection string

## 💰 费用估算

| 服务 | 月费用 | 说明 |
|------|--------|------|
| Railway 免费额度 | $5 | 每月赠送 |
| 后端 (Java) | $3-5 | 500 小时运行时间 |
| 前端 (Node.js) | $1-2 | 静态资源托管 |
| PostgreSQL | $2-3 | 基础数据库 |
| **总计** | **$6-10** | 在免费额度内 |

## 🛠️ 故障排查

### 构建失败

**问题**: Java 版本错误
```
错误：不支持的 Java 版本
```

**解决**: 确认 `build.gradle` 中配置 Java 21
```groovy
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}
```

### 前端无法连接后端

**问题**: CORS 错误或网络错误

**解决**:
1. 检查 `VITE_API_URL` 环境变量
2. 更新后端 CORS 配置：
   ```bash
   railway variables set APP_CORS_ALLOWED_ORIGINS="https://your-frontend.railway.app"
   ```
3. 重新部署前端服务

### 数据库连接失败

**问题**: 无法连接到 PostgreSQL

**解决**:
1. 确认已添加 PostgreSQL 服务
2. 检查数据库环境变量是否正确注入
3. 在 Railway Dashboard 中查看连接信息

## 📚 相关文档

- [详细部署指南](DEPLOYMENT_GUIDE.md)
- [Railway 官方文档](https://docs.railway.app)
- [Spring Boot 部署指南](https://spring.io/guides)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

## 🤝 获取帮助

1. 查看 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) 获取详细步骤
2. 运行 `quick-deploy.bat` 获取交互式指导
3. 查看 Railway Dashboard 中的日志和监控

## 📝 部署记录

| 日期 | 操作 | 状态 | 备注 |
|------|------|------|------|
| 2026-03-27 | 创建部署配置 | ✅ 完成 | 包含 CI/CD 工作流 |
| 2026-03-27 | 配置环境变量模板 | ✅ 完成 | 支持多环境 |
| 2026-03-27 | 创建部署脚本 | ✅ 完成 | Windows/Linux/Mac |

---

**最后更新**: 2026-03-27
**维护者**: Machrio Team
