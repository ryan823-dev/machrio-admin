# 🔧 部署故障排查

## 常见失败原因

### 1. 构建超时（最常见）

**现象**: 构建进行到一半就停止，显示 "Build timeout"

**原因**: 
- Gradle 下载依赖太慢
- Railway 构建超时（15 分钟限制）

**解决方案**:

#### 方案 A: 等待更长时间
首次构建可能需要 10-15 分钟，请耐心等待

#### 方案 B: 使用预构建的 JAR
如果多次失败，可以：
1. 本地构建 JAR 文件
2. 使用 Docker 镜像部署
3. 或者使用更简单的部署方式

### 2. 数据库连接失败

**错误信息**:
```
Cannot determine embedded database driver class
```

**解决方案**:
1. 确保已添加 PostgreSQL 插件
2. 检查 `DATABASE_URL` 环境变量是否存在
3. 重启部署

### 3. 环境变量未生效

**现象**: 启动后报错或行为异常

**解决方案**:
1. 在 Railway 添加环境变量
2. **必须重启部署**才能生效
3. 点击 "Deployments" → "..." → "Restart Deployment"

### 4. Flyway 迁移失败

**错误信息**:
```
Flyway migration error
```

**解决方案**:
1. 在 Railway Console 中查看数据库
2. 检查 `flyway_schema_history` 表
3. 如果是新数据库，可以删除所有表重新迁移

---

## 🎯 推荐的部署步骤（避免失败）

### 步骤 1: 在 Railway 创建项目
1. 访问 https://railway.app
2. 用 GitHub 登录
3. New Project → Deploy from GitHub repo
4. 选择 `machrio-admin`

### 步骤 2: 等待首次部署完成
- **不要添加任何配置**
- 让 Railway 自动部署
- 这可能需要 10-15 分钟
- 等待状态变为 "SUCCESS"

### 步骤 3: 添加 PostgreSQL
1. 点击 "New"
2. 选择 "PostgreSQL"
3. 等待数据库创建

### 步骤 4: 添加环境变量
在 Variables 标签页添加：
```
SPRING_PROFILES_ACTIVE = production
JWT_SECRET = 随机 32 字符密钥
LOG_LEVEL_ROOT = INFO
LOG_LEVEL_COM_MACHRIO = DEBUG
```

### 步骤 5: 重启部署
1. 点击 "Deployments"
2. 点击右上角 "..."
3. 选择 "Restart Deployment"

### 步骤 6: 生成域名
1. 点击 "Settings"
2. 找到 "Domains"
3. 点击 "Generate Domain"

---

## 📊 构建进度检查

### 正常构建过程
```
1. 下载 Gradle (30 秒)
2. 下载依赖 (3-5 分钟)
3. 编译代码 (2-3 分钟)
4. 打包 JAR (1 分钟)
5. 启动应用 (30 秒)
```

**总时间**: 7-10 分钟

### 如何查看进度
1. Railway 项目页面
2. 点击你的服务
3. 点击 "Deployments"
4. 查看最新部署的日志

---

## 🆘 如果一直失败

### 选项 1: 使用 Railway 模板
Railway 有 Spring Boot 模板，可能更稳定：
1. New Project
2. Deploy from Railway template
3. 选择 Spring Boot
4. 连接 GitHub 仓库

### 选项 2: 使用 Docker 镜像
如果有 Docker 镜像，可以直接部署：
```yaml
# railway.toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"
```

### 选项 3: 使用其他平台
- **Render**: 支持 Spring Boot，部署简单
- **Fly.io**: 支持 Docker 部署
- **Heroku**: 有 Java 支持

---

## 💡 提示

1. **首次部署最慢**: 后续部署会使用缓存，快很多
2. **不要频繁重启**: 每次重启都要重新构建
3. **检查日志**: 90% 的问题可以从日志中找到原因
4. **使用变量**: Railway 会自动注入 PostgreSQL 的 `DATABASE_URL`

---

## 🔍 日志关键词

**正常日志**:
```
✓ Build successful
✓ Deployment successful
✓ Started AdminApplication
```

**错误日志**:
```
✗ Build failed
✗ Exit code 1
✗ Connection refused
✗ BeanCreationException
```

看到错误日志，复制最后一行，通常能找到原因。

---

**需要帮助？** 
把完整的错误日志发给我，我会帮你解决！
