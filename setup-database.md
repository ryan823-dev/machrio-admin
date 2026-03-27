# 🗄️ 添加 PostgreSQL 数据库到 Railway

## 问题诊断

部署成功但健康检查失败，原因是：
- ✅ 应用构建成功
- ✅ 应用部署成功
- ❌ **健康检查失败** - 缺少数据库连接

## 解决方案

### 方法 1: 使用 Railway CLI（推荐）

运行提供的脚本：
```bash
cd d:\qoder\machrio-admin
add-database.bat
```

或者手动执行：
```bash
# 1. 登录 Railway
railway login

# 2. 添加 PostgreSQL
railway add postgresql

# 3. 查看注入的环境变量
railway variables

# 4. 重新部署
railway up
```

### 方法 2: Railway Dashboard 手动添加

1. **访问**: https://railway.app/dashboard
2. **选择项目**: `machrio-admin`
3. **点击**: `New` 按钮
4. **选择**: `Database` > `PostgreSQL`
5. Railway 会自动创建数据库并注入环境变量

### 方法 3: 使用环境变量（临时方案）

如果无法使用 CLI 或 Dashboard，可以创建 `.env` 文件：

```bash
# 在 Railway Dashboard 的 Variables 标签中添加:
DATABASE_URL=postgresql://user:password@host:5432/dbname
SPRING_DATASOURCE_URL=${DATABASE_URL}
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_password
```

## 自动注入的环境变量

添加 PostgreSQL 后，Railway 会自动注入以下变量：

```bash
DATABASE_URL=postgresql://...
POSTGRES_USER=postgres
POSTGRES_PASSWORD=...
POSTGRES_DB=...
PGHOST=...
PGPORT=5432
```

Spring Boot 会自动使用这些变量连接数据库。

## 配置其他环境变量

添加数据库后，还需要配置：

```bash
# 服务器配置
SERVER_PORT=8080

# CORS 配置
APP_CORS_ALLOWED_ORIGINS=https://*.railway.app

# 存储配置
APP_STORAGE_BLOB_ENDPOINT=https://blob.vercel-blob.com

# JWT 配置
APP_JWT_SECRET=your-production-jwt-secret-key-change-this
APP_JWT_EXPIRATION_MS=86400000
```

## 验证数据库连接

### 在 Railway Dashboard 中:

1. 选择 `machrio-backend` 服务
2. 点击 **Variables** 标签
3. 确认有以下变量：
   - `DATABASE_URL`
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DB`

### 查看部署日志:

```bash
railway logs --service machrio-backend --lines 50
```

寻找：
```
HikariPool-1 - Start completed.
```

这表示数据库连接成功。

## 重新部署

添加数据库后，Railway 通常会自动重新部署。

如果没有，手动触发：
```bash
railway up
```

或在 Dashboard 中点击 **Redeploy**。

## 验证健康检查

部署完成后，测试健康检查端点：

```bash
curl https://your-backend.railway.app/api/health
```

期望响应：
```json
{
  "status": "UP",
  "database": "connected",
  "databaseUrl": "jdbc:postgresql://...",
  "timestamp": 1234567890
}
```

## 故障排查

### 问题 1: 仍然健康检查失败

**解决方案**:
1. 检查日志中的数据库连接错误
2. 确认环境变量已正确注入
3. 检查数据库服务是否运行

### 问题 2: 无法添加数据库

**解决方案**:
1. 确认项目已正确创建
2. 检查 Railway 账户权限
3. 尝试在 Dashboard 中手动添加

### 问题 3: 数据库连接超时

**解决方案**:
1. 等待数据库完全初始化（可能需要 1-2 分钟）
2. 检查数据库连接字符串格式
3. 确认防火墙设置

## 下一步

数据库添加成功并健康检查通过后：

1. ✅ 配置前端服务
2. ✅ 设置自定义域名（可选）
3. ✅ 配置监控和告警
4. ✅ 设置自动备份

---

**现在请运行 `add-database.bat` 或在 Railway Dashboard 中添加 PostgreSQL 数据库！** 🚀
