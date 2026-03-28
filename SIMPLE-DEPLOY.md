# 🚀 最简单部署方案（不用 Dockerfile）

## 问题原因
Dockerfile 构建失败可能是因为路径或配置问题。我们换用 Railway 的自动构建功能。

---

## 方案：使用 Railway Nixpacks（推荐）

### 步骤 1: 删除当前失败的项目
1. 在 Railway 项目页面
2. 点击 "..." → "Delete Project"

### 步骤 2: 创建新项目
1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 选择 `machrio-admin`

### 步骤 3: 配置构建（关键！）
**不要使用 Dockerfile**，让 Railway 自动检测：

1. 在项目页面，点击你的服务
2. 点击 "Settings"
3. 找到 "Build" 部分
4. **删除或忽略 railway.toml**
5. Railway 会自动使用 Nixpacks 构建 Java 项目

### 步骤 4: 添加 PostgreSQL
1. 点击 "New"
2. 选择 "PostgreSQL"
3. Railway 会自动连接数据库

### 步骤 5: 添加环境变量
在 Variables 标签页添加：
```
SPRING_PROFILES_ACTIVE = production
JWT_SECRET = 你的 32 字符随机密钥
LOG_LEVEL_ROOT = INFO
LOG_LEVEL_COM_MACHRIO = DEBUG
```

### 步骤 6: 等待部署
- Railway 会自动检测 Java 项目
- 使用 Nixpacks 构建（比 Docker 快）
- 等待 5-10 分钟

### 步骤 7: 生成域名
1. Settings → Networking → Domains
2. Generate Domain
3. 记录 URL

---

## 备用方案：使用 Railway CLI

如果网页版还是失败，用 CLI 部署：

```bash
# 1. 登录 Railway
railway login

# 2. 初始化项目
railway init

# 3. 添加数据库
railway add postgresql

# 4. 设置环境变量
railway variables set SPRING_PROFILES_ACTIVE=production
railway variables set JWT_SECRET=你的密钥

# 5. 部署（不使用 Dockerfile）
railway up
```

---

## 如果还是失败...

### 尝试 Render.com（备选方案）

1. 访问 https://render.com
2. 用 GitHub 登录
3. New → Web Service
4. 选择 `machrio-admin`
5. 配置：
   - **Name**: machrio-admin
   - **Environment**: Docker
   - **Build Command**: `cd backend/machrio-api && ./gradlew build`
   - **Start Command**: `java -jar backend/machrio-api/build/libs/*.jar`
6. 添加 PostgreSQL 数据库
7. Deploy

---

## 为什么 Dockerfile 会失败？

可能原因：
1. **路径问题**: Railway 的工作目录不是项目根目录
2. **权限问题**: gradlew 没有执行权限
3. **超时问题**: 构建超过 15 分钟

Nixpacks 优势：
- 自动检测 Java 项目
- 优化的缓存机制
- 更快的构建速度
- Railway 官方支持

---

## 验证部署

部署成功后访问：
```
https://你的域名.up.railway.app/api/health
```

应该返回：
```json
{"status": "UP"}
```

---

**现在试试不用 Dockerfile，让 Railway 自动构建！**
