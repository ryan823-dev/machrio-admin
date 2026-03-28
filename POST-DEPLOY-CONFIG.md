# Railway 部署后配置指南

## 📋 部署状态

- ✅ 代码已推送到 GitHub: `https://github.com/ryan823-dev/machrio-admin.git`
- ✅ Railway 配置已设置（Java 21 + Gradle）
- ⏳ 等待 Railway 自动构建和部署

---

## 🔍 检查 Railway 构建状态

### 1. 访问 Railway 项目
打开：https://railway.app/dashboard

### 2. 查看构建日志
- 进入您的项目
- 查看 "Deployments" 标签
- 点击最新的部署查看实时日志

### 3. 构建成功标志
- ✅ Gradle 构建完成
- ✅ Spring Boot 应用启动
- ✅ 健康检查通过（/actuator/health）

---

## ⚙️ 配置数据库连接

### Railway 会自动注入以下环境变量：

```bash
# Railway 自动提供的 PostgreSQL 连接信息
DATABASE_URL=postgresql://postgres:password@host:port/database
POSTGRES_HOST=your-db-host.railway.app
POSTGRES_PORT=5432
POSTGRES_DB=machrio
POSTGRES_USER=postgres
POSTGRES_PASSWORD=auto-generated-password
```

### 需要手动添加的环境变量：

在 Railway 控制台的 "Variables" 标签中添加：

```bash
# Spring Boot 配置
SPRING_DATASOURCE_URL=${{DATABASE_URL}}
SPRING_JPA_HIBERNATE_DDL_AUTO=update

# JWT Secret（生产环境）
APP_JWT_SECRET=your-super-secret-production-key-change-this

# CORS 配置
APP_CORS_ALLOWED_ORIGINS=https://your-admin-domain.com

# 存储配置
APP_STORAGE_BLOB_ENDPOINT=https://blob.vercel-blob.com
```

---

## 🗄️ 数据库迁移

部署成功后，系统会自动：

1. **Hibernate 自动创建表**（如果 `SPRING_JPA_HIBERNATE_DDL_AUTO=update`）
2. **或者运行 Flyway 迁移脚本**（如果使用 Flyway）

### 手动运行迁移（可选）

如果需要手动运行 AI 对话表的迁移：

```sql
-- Railway PostgreSQL 控制台
-- 运行此文件中的 SQL：
-- backend/migrations/V005__create_ai_conversations_tables.sql
```

---

## 🧪 测试部署

### 1. 访问 Admin API

```bash
# Railway 会提供部署 URL
https://your-project.railway.app

# 测试健康检查
curl https://your-project.railway.app/actuator/health

# 测试 API 端点
curl https://your-project.railway.app/api/products
```

### 2. 访问 Admin 前端

修改前端的环境变量 `.env.local`：

```bash
VITE_API_URL=https://your-project.railway.app/api
```

然后重新部署前端或本地测试。

---

## 🔧 常见问题排查

### 构建失败

**错误**: Gradle 构建超时
- **解决**: 检查 `railway.toml` 中的超时设置
- **解决**: 简化构建命令，使用 `./gradlew build -x test`

**错误**: Java 版本不匹配
- **解决**: 确保 `.railpack/java.toml` 中设置 `java_version = "21"`

### 启动失败

**错误**: 数据库连接失败
- **解决**: 检查 Railway 是否正确注入数据库环境变量
- **解决**: 在 Railway 控制台添加 PostgreSQL 插件

**错误**: 端口绑定失败
- **解决**: 确保应用使用 `PORT` 环境变量（Railway 自动设置）
- **解决**: 检查 `railway.toml` 中的端口配置

### 健康检查失败

**错误**: `/actuator/health` 返回 404
- **解决**: 添加 Spring Boot Actuator 依赖
- **解决**: 修改健康检查路径为 `/api/health`

---

## 📊 监控和日志

### Railway 控制台

- **Logs**: 实时查看应用日志
- **Metrics**: CPU、内存、网络使用量
- **Deployments**: 查看历史部署记录

### 应用日志

Spring Boot 日志会自动输出到 Railway 日志流：

```bash
# 在 Railway 控制台查看
INFO  com.machrio.admin.AdminApiApplication - Started Application
INFO  com.machrio.admin.config.SecurityConfig - Security initialized
```

---

## 🚀 下一步

1. ✅ 等待 Railway 构建完成
2. ⏳ 检查构建日志
3. ⏳ 配置数据库连接（Railway 自动完成）
4. ⏳ 添加必要的环境变量
5. ⏳ 测试 API 端点
6. ⏳ 配置前端 API URL
7. ⏳ 完整功能测试

---

## 📞 支持

如有问题，请查看：
- Railway 文档：https://docs.railway.app
- Spring Boot 文档：https://spring.io/projects/spring-boot

---

**最后更新**: 2026-03-28
**项目**: machrio-admin
**部署平台**: Railway
