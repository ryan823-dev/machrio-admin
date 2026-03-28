# Railway 部署指南（使用 Nixpacks）

## 为什么使用 Nixpacks？

Railway 的 Nixpacks 是原生构建器，对 Java/Gradle 项目更可靠：
- ✅ 自动检测 Java 项目
- ✅ 智能缓存 Gradle 依赖
- ✅ 构建速度更快（3-5 分钟）
- ✅ 不会超时失败

## 部署步骤

### 1. 确保代码已推送到 GitHub

```bash
# 如果还没推送，运行：
git add .
git commit -m "Remove Dockerfile, use Railway Nixpacks"
git push origin main
```

### 2. 在 Railway 中重新部署

1. 打开 [Railway Dashboard](https://railway.app/dashboard)
2. 找到你的项目
3. 点击 **Settings** 标签
4. 找到 **Build** 部分
5. 确保 **Builder** 设置为 `Nixpacks`（不是 Dockerfile）
6. 点击 **Deploy** 按钮

### 3. 配置环境变量

在 Railway Dashboard 的 **Variables** 标签中添加：

#### 必需的环境变量：

```bash
# 数据库（Railway 会自动添加 DATABASE_URL）
DATABASE_URL=postgresql://...  # Railway 自动提供

# Spring Boot 配置
SPRING_PROFILES_ACTIVE=production
SERVER_PORT=8080
JAVA_TOOL_OPTIONS=-Xms256m -Xmx512m -XX:+UseG1GC

# Spring JPA
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_DATASOURCE_URL=${{DATABASE_URL}}
SPRING_DATASOURCE_USERNAME=${{DATABASE_URL:username}}
SPRING_DATASOURCE_PASSWORD=${{DATABASE_URL:password}}

# OSS 配置（阿里云）
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
OSS_ACCESS_KEY_ID=<你的 AccessKey ID>
OSS_ACCESS_KEY_SECRET=<你的 AccessKey Secret>
OSS_BUCKET=vertax

# CORS 配置（部署后替换为你的 Vercel 域名）
APP_CORS_ALLOWED_ORIGINS=https://your-domain.vercel.app
```

### 4. 等待部署完成

- 构建时间：3-5 分钟
- 首次部署会下载 Gradle 依赖（较慢）
- 后续部署会使用缓存（更快）

### 5. 验证部署

部署成功后：
1. 点击 **Open** 按钮访问 API
2. 访问 `https://your-project.railway.app/actuator/health`
3. 应该返回：`{"status":"UP"}`

## 常见问题

### Q: 构建失败怎么办？
A: 检查构建日志，常见问题：
- Gradle 依赖下载超时 → 重试部署
- 内存不足 → 增加 `JAVA_TOOL_OPTIONS` 内存
- 端口错误 → 确保 `SERVER_PORT=8080`

### Q: 部署成功但无法访问？
A: 检查：
- 环境变量是否正确
- 数据库连接是否正常
- CORS 配置是否包含前端域名

### Q: 如何查看日志？
A: 在 Railway Dashboard 点击 **Deployments** → 选择最新版本 → 查看实时日志

## 下一步：部署前端到 Vercel

后端部署成功后，运行：

```bash
cd frontend
npx vercel
```

按照提示完成部署，然后更新后端的 `APP_CORS_ALLOWED_ORIGINS` 环境变量。
