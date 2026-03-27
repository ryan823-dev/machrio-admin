# 📱 Railway Dashboard 操作指南

## 步骤 1: 登录 Railway

1. 打开浏览器访问：**https://railway.app/dashboard**
2. 使用您的账号登录（GitHub/Google/Email）

## 步骤 2: 找到项目

登录后，您会看到所有项目的列表：

```
┌─────────────────────────────────────┐
│  Your Projects                      │
├─────────────────────────────────────┤
│  📦 machrio-admin                   │  ← 点击这里
│     Last deployed: 2 hours ago      │
├─────────────────────────────────────┤
│  📦 other-project                   │
│     Last deployed: 1 day ago        │
└─────────────────────────────────────┘
```

**点击 `machrio-admin` 项目卡片** 进入项目详情

## 步骤 3: 查看项目中的服务

进入项目后，您会看到所有服务：

```
┌──────────────────────────────────────────────────┐
│  machrio-admin                                   │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────────┐    ┌─────────────────┐     │
│  │  machrio-       │    │  PostgreSQL     │     │
│  │  backend        │    │  Database       │     │
│  │                 │    │                 │     │
│  │  ⚙️ Settings    │    │  ⚙️ Settings    │     │
│  │  📊 Metrics     │    │  📊 Metrics     │     │
│  │  📜 Logs        │    │  📜 Logs        │     │
│  └─────────────────┘    └─────────────────┘     │
│                                                  │
│  ┌─────────────────┐                             │
│  │  machrio-       │                             │
│  │  frontend       │                             │
│  │                 │                             │
│  │  ⚙️ Settings    │                             │
│  │  📊 Metrics     │                             │
│  │  📜 Logs        │                             │
│  └─────────────────┘                             │
│                                                  │
└──────────────────────────────────────────────────┘
```

**点击 `machrio-backend` 服务卡片** 进入后端服务详情

## 步骤 4: 修改 Dockerfile 路径设置

进入后端服务后：

1. **点击顶部的 "Settings" 标签**

```
┌──────────────────────────────────────────────────┐
│  machrio-backend                                 │
├──────────────────────────────────────────────────┤
│  [Overview] [Settings] [Logs] [Metrics] [Deploy] │  ← 点击 Settings
└──────────────────────────────────────────────────┘
```

2. **向下滚动找到 "Dockerfile Path" 设置**

```
┌──────────────────────────────────────────────────┐
│  Build Settings                                  │
├──────────────────────────────────────────────────┤
│  Builder                                         │
│  ○ Railpack                                      │
│  ● Dockerfile        ← 已选择 Dockerfile         │
│                                                  │
│  Dockerfile Path                                 │
│  ┌────────────────────────────────────────────┐ │
│  │ Dockerfile                        ✓        │ │  ← 正确！
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Root Directory                                  │
│  ┌────────────────────────────────────────────┐ │
│  │                                            │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

3. **确认 Dockerfile Path 为 `Dockerfile`**
   - 如果显示 `backend/machrio-api/Dockerfile`，请修改为 `Dockerfile`
   - 修改后会自动保存

## 步骤 5: 触发部署

### 方法 A: 自动部署（推荐）

如果您已连接 GitHub：
1. 推送代码到 GitHub
2. Railway 会自动检测并部署

```bash
git add .
git commit -m "Update backend"
git push origin main
```

### 方法 B: 手动部署

1. **点击顶部的 "Deploy" 标签**
2. **点击 "Deploy" 按钮**

```
┌──────────────────────────────────────────────────┐
│  Deployments                                     │
├──────────────────────────────────────────────────┤
│                                                  │
│  Current Deployment:                             │
│  ┌────────────────────────────────────────────┐ │
│  │  ● Deploying...                            │ │
│  │  Building with Dockerfile...               │ │
│  │                                            │ │
│  │  [View Logs]                               │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  Previous Deployments:                           │
│  ○ Deployment #123 - Success                     │
│  ○ Deployment #122 - Success                     │
└──────────────────────────────────────────────────┘
```

## 步骤 6: 查看部署日志

1. **点击顶部的 "Logs" 标签**
2. 查看实时日志输出

```
┌──────────────────────────────────────────────────┐
│  Logs                                            │
├──────────────────────────────────────────────────┤
│  [14:30:01] Starting build...                    │
│  [14:30:05] Pulling Docker image...              │
│  [14:30:10] Building with Dockerfile...          │
│  [14:31:00] Build successful!                    │
│  [14:31:01] Deploying...                         │
│  [14:31:05] Health check passed ✓                │
│  [14:31:06] Deployment complete!                 │
└──────────────────────────────────────────────────┘
```

## 步骤 7: 获取服务域名

1. **回到 "Settings" 标签**
2. **向下滚动找到 "Domains" 部分**
3. **点击 "Generate Domain"**（如果还没有域名）

```
┌──────────────────────────────────────────────────┐
│  Domains                                         │
├──────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────┐ │
│  │ machrio-backend-production.up.railway.app │ │
│  │                                    [Copy]  │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  [+ Generate Domain]                             │
└──────────────────────────────────────────────────┘
```

复制这个域名，这就是您的后端 API 地址！

## 常见问题

### Q: 找不到 machrio-admin 项目？

**A:** 可能是还没有创建项目，请点击 "New Project" 创建：
1. 点击 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 选择 `ryan823-dev/machrio-admin` 仓库

### Q: 看不到 machrio-backend 服务？

**A:** 需要手动创建服务：
1. 点击项目中的 **"New"** 按钮
2. 选择 **"Empty Service"**
3. 命名为 `machrio-backend`
4. 在 Settings 中配置：
   - Root Directory: 留空（因为使用根目录 Dockerfile）
   - Dockerfile Path: `Dockerfile`

### Q: 部署失败怎么办？

**A:** 查看 Logs 标签的错误信息：
1. 点击 **"Logs"**
2. 查看红色错误信息
3. 常见错误：
   - Java 版本错误 → 确认使用 Java 21
   - 构建失败 → 检查 gradle 配置
   - 健康检查失败 → 检查健康检查路径 `/api/health`

---

## 快速导航链接

- **Dashboard**: https://railway.app/dashboard
- **项目**: https://railway.app/project/YOUR_PROJECT_ID
- **后端服务**: https://railway.app/service/YOUR_BACKEND_SERVICE_ID
- **前端服务**: https://railway.app/service/YOUR_FRONTEND_SERVICE_ID

---

**需要帮助？** 查看 `DEPLOY-NOW.md` 获取完整部署指南！
