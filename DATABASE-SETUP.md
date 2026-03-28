# Railway PostgreSQL 数据库配置指南

## 📋 概述

本文档说明如何在 Railway 平台配置 PostgreSQL 数据库连接，让 Spring Boot 后端能够正确连接数据库。

---

## 🚀 Railway 自动配置

### 1. 添加 PostgreSQL 到 Railway 项目

1. 访问 https://railway.app/dashboard
2. 进入您的 `machrio-admin` 项目
3. 点击 "New" → "Database" → "PostgreSQL"
4. Railway 会自动创建 PostgreSQL 实例

### 2. Railway 自动注入的环境变量

Railway 会自动将以下环境变量注入到您的应用中：

```bash
# Railway 自动提供的数据库连接信息
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
POSTGRES_HOST=your-db.railway.app
POSTGRES_PORT=5432
POSTGRES_DB=machrio
POSTGRES_USER=postgres
POSTGRES_PASSWORD=auto-generated-password
```

**无需手动配置！** Railway 会自动处理。

---

## ⚙️ Spring Boot 配置

### 应用自动使用 Railway 的数据库

Spring Boot 应用已配置为自动使用 Railway 提供的环境变量。

**代码位置**: `backend/machrio-api/src/main/resources/application.properties`

```properties
# Railway 会自动设置 DATABASE_URL
# Spring Boot 会自动检测并使用
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${POSTGRES_USER}
spring.datasource.password=${POSTGRES_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# Hibernate 自动创建和更新表
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true
```

---

## 🗄️ 数据库表结构

### 自动创建表

当应用首次启动时，Hibernate 会自动创建以下表：

1. **ai_conversations** - AI 对话记录
2. **conversation_messages** - 对话消息
3. **customer_requirements** - 客户需求
4. **conversation_analytics** - 对话分析

### 手动运行迁移脚本（可选）

如果想手动运行 SQL 迁移脚本：

```bash
# 1. 连接到 Railway PostgreSQL
# 在 Railway 控制台的 PostgreSQL 插件中点击 "Connect"

# 2. 复制并运行 SQL 文件内容
# 文件位置：backend/migrations/V005__create_ai_conversations_tables.sql
```

---

## 🔍 验证数据库连接

### 方法 1: Railway 控制台

1. 进入 Railway 项目
2. 点击 PostgreSQL 插件
3. 查看 "Connection Details"
4. 点击 "Open Client" 使用 Web 客户端

### 方法 2: 应用日志

查看 Spring Boot 启动日志：

```
INFO  com.zaxxer.hikari.HikariDataSource - HikariPool-1 - Starting...
INFO  com.zaxxer.hikari.HikariDataSource - HikariPool-1 - Start completed.
INFO  o.h.t.s.i.SchemaDropperImpl$DelayedDropActionImpl - HHH000477: Starting delayed evictData of schema as part of SessionFactory shut-down'
INFO  o.h.t.s.i.SchemaCreatorImpl - HHH000476: Executing import script 'org.hibernate.tool.schema.internal.exec.ScriptSourceInputNonExistentImpl@...'
```

### 方法 3: API 测试

```bash
# 测试数据库连接
curl https://your-project.railway.app/api/health

# 返回示例：
# {"status":"UP","database":"PostgreSQL","version":"15.0"}
```

---

## 📊 数据库管理工具

### Railway 内置客户端

Railway 提供 Web 界面的数据库客户端：
1. 进入 PostgreSQL 插件
2. 点击 "Open Client"
3. 可以直接执行 SQL 查询

### 本地客户端连接

使用 DBeaver、pgAdmin 等工具连接：

```
Host: [Railway 提供的 HOST]
Port: 5432
Database: [Railway 提供的 DB]
Username: postgres
Password: [Railway 提供的 PASSWORD]
```

**获取连接信息**：
- 在 Railway PostgreSQL 插件的 "Connection Details" 中查看

---

## 🔧 常见问题排查

### 问题 1: 数据库连接失败

**症状**: 应用启动时报数据库连接错误

**解决方案**:
1. 检查 Railway 是否已添加 PostgreSQL 插件
2. 检查环境变量是否正确注入
3. 查看 Railway 日志中的 DATABASE_URL 值

### 问题 2: 表未自动创建

**症状**: 应用启动成功但访问 API 时报表不存在错误

**解决方案**:
1. 检查 `spring.jpa.hibernate.ddl-auto` 是否为 `update`
2. 手动运行迁移脚本 `V005__create_ai_conversations_tables.sql`
3. 查看应用日志确认 Hibernate 是否执行了 DDL

### 问题 3: 权限不足

**症状**: 无法创建表或插入数据

**解决方案**:
1. Railway 的 PostgreSQL 默认使用 `postgres` 超级用户
2. 检查 DATABASE_URL 中的用户名
3. 在 Railway 控制台重置数据库密码

---

## 📈 数据库监控

### Railway 控制台

查看数据库使用情况：
- **Connections**: 当前连接数
- **Storage**: 存储空间使用
- **CPU**: 数据库 CPU 使用率
- **Memory**: 内存使用

### 慢查询日志

在 Railway 控制台的 "Logs" 中查看 SQL 性能。

---

## 🔐 安全建议

1. **不要在代码中硬编码密码**
   - ✅ 使用环境变量
   - ❌ 不要提交 `.env` 文件到 Git

2. **定期备份数据库**
   - Railway 自动备份（付费计划）
   - 或手动导出 SQL 备份

3. **限制数据库访问**
   - Railway 默认只允许项目内服务访问
   - 不要公开数据库端口

---

## 📝 环境变量清单

### Railway 自动提供（无需手动设置）

```bash
DATABASE_URL          # 完整数据库连接 URL
POSTGRES_HOST         # 数据库主机
POSTGRES_PORT         # 数据库端口（5432）
POSTGRES_DB           # 数据库名称
POSTGRES_USER         # 数据库用户名
POSTGRES_PASSWORD     # 数据库密码
```

### 需要手动添加（在 Railway 控制台）

```bash
APP_JWT_SECRET=your-production-secret-key
APP_CORS_ALLOWED_ORIGINS=https://your-domain.com
```

---

## 🚀 下一步

1. ✅ Railway 自动创建 PostgreSQL
2. ✅ 自动注入环境变量
3. ✅ Spring Boot 自动连接数据库
4. ✅ Hibernate 自动创建表结构
5. ⏳ 测试 API 端点
6. ⏳ 验证数据存取

---

**文档版本**: 1.0  
**最后更新**: 2026-03-28  
**适用平台**: Railway + PostgreSQL + Spring Boot
