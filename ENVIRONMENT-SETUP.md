# 🔐 环境变量配置指南

## 📋 文件结构

```
machrio-admin/
├── .env.production              # 生产环境配置（Railway 部署）
├── backend/
│   └── machrio-api/
│       ├── .env.example         # 后端环境变量模板
│       └── .env.local           # 本地开发配置
└── frontend/
    ├── .env.example             # 前端环境变量模板
    └── .env.local               # 本地开发配置
```

---

## 🚀 Railway 部署配置

### 后端环境变量（在 Railway Dashboard 中设置）

访问 Railway Dashboard，选择 `machrio-backend` 服务，在 **Variables** 标签中添加：

#### 必需的环境变量：

```bash
# 服务器配置
SERVER_PORT=8080

# CORS 配置（部署后更新为实际域名）
APP_CORS_ALLOWED_ORIGINS=https://*.railway.app

# 存储配置
APP_STORAGE_BLOB_ENDPOINT=https://blob.vercel-blob.com

# JWT 配置（生成一个强随机密钥）
APP_JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
APP_JWT_EXPIRATION_MS=86400000

# 日志配置
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_MACHRIO=INFO
```

#### 数据库环境变量（Railway 自动注入）：

当您添加 PostgreSQL 服务后，Railway 会自动注入以下变量：

```bash
DATABASE_URL=postgresql://...
POSTGRES_USER=postgres
POSTGRES_PASSWORD=...
POSTGRES_DB=...
```

Spring Boot 会自动使用这些变量，无需手动配置。

---

### 前端环境变量（在 Railway Dashboard 中设置）

选择 `machrio-frontend` 服务，在 **Variables** 标签中添加：

```bash
# 后端 API 地址（部署后更新）
VITE_API_URL=https://your-backend.railway.app/api

# 应用模式
VITE_APP_MODE=production

# 功能开关
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

---

## 🖥️ 本地开发配置

### 后端本地配置

1. 复制模板文件：
```bash
cd backend/machrio-api
copy .env.example .env.local
```

2. 编辑 `.env.local`：
```properties
# 服务器端口
SERVER_PORT=8080

# 本地数据库连接
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/machrio_dev
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres

# CORS 允许本地开发服务器
APP_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# JWT 密钥（仅开发用）
APP_JWT_SECRET=dev-secret-key-change-in-production-12345678

# 日志级别
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_MACHRIO=DEBUG
```

### 前端本地配置

1. 编辑 `frontend/.env.local`：
```properties
# 本地后端 API 地址
VITE_API_URL=http://localhost:8080/api

# 开发模式
VITE_APP_MODE=development

# 启用调试
VITE_ENABLE_DEBUG=true
```

---

## 📝 环境变量说明

### 后端环境变量

| 变量名 | 说明 | 默认值 | 必需 |
|--------|------|--------|------|
| `SERVER_PORT` | 服务端口 | `8080` | ✅ |
| `SPRING_DATASOURCE_URL` | 数据库连接 URL | (Railway 自动注入) | ✅ |
| `SPRING_DATASOURCE_USERNAME` | 数据库用户名 | `postgres` | ✅ |
| `SPRING_DATASOURCE_PASSWORD` | 数据库密码 | (Railway 自动注入) | ✅ |
| `APP_CORS_ALLOWED_ORIGINS` | 允许的 CORS 源 | `http://localhost:5173` | ✅ |
| `APP_STORAGE_BLOB_ENDPOINT` | 存储端点 | `https://blob.vercel-blob.com` | ✅ |
| `APP_JWT_SECRET` | JWT 密钥 | (需生成) | ✅ |
| `APP_JWT_EXPIRATION_MS` | JWT 过期时间 | `86400000` (24 小时) | ✅ |
| `LOGGING_LEVEL_ROOT` | 根日志级别 | `INFO` | ❌ |
| `LOGGING_LEVEL_COM_MACHRIO` | 应用日志级别 | `DEBUG` | ❌ |

### 前端环境变量

| 变量名 | 说明 | 默认值 | 必需 |
|--------|------|--------|------|
| `VITE_API_URL` | 后端 API 地址 | `http://localhost:8080/api` | ✅ |
| `VITE_APP_MODE` | 应用模式 | `development` | ❌ |
| `VITE_ENABLE_ANALYTICS` | 启用分析 | `true` | ❌ |
| `VITE_ENABLE_DEBUG` | 启用调试 | `false` | ❌ |

---

## 🔑 生成 JWT 密钥

### 使用 OpenSSL：
```bash
openssl rand -hex 32
```

### 使用 PowerShell：
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### 使用在线工具：
访问：https://generate-secret.vercel.app/32

---

## ✅ Railway 部署检查清单

### 后端配置：

- [ ] 已添加 PostgreSQL 数据库
- [ ] 已设置 `SERVER_PORT=8080`
- [ ] 已设置 `APP_CORS_ALLOWED_ORIGINS`（包含前端域名）
- [ ] 已设置 `APP_STORAGE_BLOB_ENDPOINT`
- [ ] 已生成并设置 `APP_JWT_SECRET`
- [ ] 已设置 `APP_JWT_EXPIRATION_MS=86400000`
- [ ] 数据库环境变量已自动注入（检查 Logs 确认）

### 前端配置：

- [ ] 已设置 `VITE_API_URL`（后端部署后的域名）
- [ ] 已设置 `VITE_APP_MODE=production`
- [ ] 已根据需要配置功能开关

---

## 🔄 更新环境变量

### Railway Dashboard:

1. 选择服务
2. 点击 **Variables** 标签
3. 点击 **Add Variable**
4. 输入键值对
5. 点击 **Save**
6. 重新部署服务

### 使用 Railway CLI:

```bash
# 设置单个变量
railway variables set VARIABLE_NAME=value

# 设置多个变量
railway variables set VAR1=value1 VAR2=value2

# 查看所有变量
railway variables

# 删除变量
railway variables unset VARIABLE_NAME
```

---

## 🛠️ 故障排查

### 问题 1: 数据库连接失败

**症状：**
```
Cannot load driver class: org.postgresql.Driver
Connection refused
```

**解决方案：**
1. 确认已添加 PostgreSQL 服务
2. 检查 Railway Dashboard 中的数据库连接信息
3. 确认环境变量已正确注入

### 问题 2: CORS 错误

**症状：**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**解决方案：**
1. 更新后端的 `APP_CORS_ALLOWED_ORIGINS`
2. 确保包含前端域名（如：`https://your-frontend.railway.app`）
3. 重新部署后端服务

### 问题 3: 前端无法连接后端

**症状：**
```
Network Error
ERR_CONNECTION_REFUSED
```

**解决方案：**
1. 检查 `VITE_API_URL` 是否正确
2. 确认后端服务已部署并运行
3. 检查后端域名是否正确

---

## 📚 相关文档

- [Railway 环境变量文档](https://docs.railway.app/develop/variables)
- [Spring Boot 配置文档](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- [Vite 环境变量文档](https://vitejs.dev/guide/env-and-mode.html)

---

**配置完成后，请继续部署流程！**
