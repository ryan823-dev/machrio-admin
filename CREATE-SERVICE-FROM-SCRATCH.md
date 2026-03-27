# 在 Railway 中从零创建服务

## 问题
当前 Railway 项目中没有 `machrio-backend` 服务，需要从头创建。

## 步骤

### 1. 访问 Railway Dashboard
打开：https://railway.app/dashboard

### 2. 创建新项目（如果没有）
1. 点击 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 授权并选择：`ryan823-dev/machrio-admin`
4. 选择 **production** 环境

### 3. 创建后端服务
1. 在项目页面，点击 **"New"**
2. 选择 **"Empty Service"** 或 **"GitHub Repo"**
3. 命名为：`machrio-backend`（或任何你喜欢的名字）

### 4. 配置服务
进入服务页面后：

#### Settings 标签：
- **Root Directory**: 留空（因为 Dockerfile 在根目录）
- **DockerfilePath**: 留空（自动检测）
- **Start Command**: 留空（使用 Dockerfile 中的 ENTRYPOINT）

#### Variables 标签：
添加以下环境变量：
```
SERVER_PORT=8080
APP_CORS_ALLOWED_ORIGINS=*
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_MACHRIO=DEBUG
```

#### Database（如果需要）：
1. 点击 **"New"** > **"Database"** > **"PostgreSQL"**
2. Railway 会自动注入 `DATABASE_URL` 环境变量
3. 但我们的应用需要以下格式：
   ```
   SPRING_DATASOURCE_URL=jdbc:postgresql://<从 DATABASE_URL 复制 host 和 port>/postgres
   SPRING_DATASOURCE_USERNAME=<从 DATABASE_URL 复制 username>
   SPRING_DATASOURCE_PASSWORD=<从 DATABASE_URL 复制 password>
   ```

### 5. 部署
1. 确保所有配置已保存
2. 点击右上角 **"Deploy"** 或 **"Redeploy"**
3. 等待 2-5 分钟

### 6. 检查部署状态
1. 查看 **Deployments** 标签页
2. 查看 **Logs** 标签页
3. 检查健康检查是否通过

## 重要提示

### Dockerfile 配置
我们的 Dockerfile 在仓库根目录，Railway 应该自动检测到。

如果没有，请在 Settings 中设置：
- **DockerfilePath**: `Dockerfile`

### 环境变量格式
Railway 的 `DATABASE_URL` 格式是：
```
postgresql://user:password@host:port/database
```

我们的应用需要转换为：
```
SPRING_DATASOURCE_URL=jdbc:postgresql://host:port/database
SPRING_DATASOURCE_USERNAME=user
SPRING_DATASOURCE_PASSWORD=password
```

## 故障排查

### 健康检查失败
1. 查看 Logs 标签页，看应用是否启动
2. 检查是否有数据库连接错误
3. 确认环境变量配置正确

### 应用无法启动
1. 查看 Logs 中的错误信息
2. 检查 Java 版本是否正确（需要 Java 21）
3. 确认端口配置（SERVER_PORT=8080）

### 数据库连接失败
1. 确认已添加 PostgreSQL 服务
2. 检查 DATABASE_URL 是否正确
3. 转换为 Spring Boot 格式的环境变量

## 完成标志

部署成功后：
- ✅ Build 成功（约 5-10 秒）
- ✅ Deploy 成功（约 30-60 秒）
- ✅ Healthcheck 通过（约 30-60 秒）
- ✅ 可以访问 `https://your-app.railway.app/api/health`
