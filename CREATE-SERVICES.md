#  在 Railway 中创建服务

## 问题

您选择了 `machrio-admin` 项目后，发现没有 `machrio-backend` 服务。

**原因：** 服务还没有创建，需要手动添加。

---

## 📝 创建后端服务（machrio-backend）

### 步骤 1：进入项目

1. 访问：https://railway.app/dashboard
2. 点击 **`machrio-admin`** 项目卡片

### 步骤 2：创建新服务

1. 在项目页面中，点击 **"New"** 按钮（通常在页面顶部或中间）
2. 选择 **"Empty Service"**（空服务）

   或者
   
   选择 **"Deploy from GitHub repo"**（如果已连接 GitHub）

### 步骤 3：配置服务

**如果选择 "Empty Service"：**

1. 输入服务名称：`machrio-backend`
2. 点击 **"Create Service"**

**如果选择 "Deploy from GitHub repo"：**

1. 选择仓库：`ryan823-dev/machrio-admin`
2. Railway 会自动创建服务

### 步骤 4：配置 Dockerfile 部署

1. 点击刚创建的 **`machrio-backend`** 服务
2. 点击顶部的 **Settings** 标签
3. 向下滚动找到 **Build** 部分
4. 设置：
   ```
   Builder: Dockerfile
   Dockerfile Path: Dockerfile
   Root Directory: (留空，不要填写)
   ```

### 步骤 5：添加 PostgreSQL 数据库

1. 点击页面中的 **"New"** 按钮
2. 选择 **"Database"**
3. 选择 **"PostgreSQL"**
4. Railway 会自动创建数据库并注入环境变量

### 步骤 6：配置环境变量

在 **Settings** > **Variables** 中添加：

```bash
SERVER_PORT=8080
APP_CORS_ALLOWED_ORIGINS=https://*.railway.app
APP_STORAGE_BLOB_ENDPOINT=https://blob.vercel-blob.com
APP_JWT_SECRET=your-production-jwt-secret-key-change-this
APP_JWT_EXPIRATION_MS=86400000
```

### 步骤 7：部署

1. 点击 **Deployments** 标签
2. 点击 **"Deploy"** 按钮
3. 等待构建完成

---

##  创建前端服务（machrio-frontend）

等后端部署成功后，再创建前端服务：

### 步骤 1：创建服务

1. 在项目页面点击 **"New"**
2. 选择 **"Empty Service"**
3. 命名为：`machrio-frontend`

### 步骤 2：配置构建

1. 点击 **`machrio-frontend`** 服务
2. 进入 **Settings** 标签
3. 设置：
   ```
   Root Directory: frontend
   Build Command: npm run build
   Start Command: npx serve dist
   ```

### 步骤 3：配置环境变量

在 **Variables** 中添加：

```bash
VITE_API_URL=https://your-backend.railway.app/api
VITE_APP_MODE=production
```

（将 `your-backend.railway.app` 替换为后端的实际域名）

### 步骤 4：部署

1. 点击 **Deployments** 标签
2. 点击 **"Deploy"**

---

## 📊 项目结构示意

创建完成后，您的项目应该包含：

```
machrio-admin (项目)
├── machrio-backend (服务)
│   ├── Settings
│   │   ├── Dockerfile Path: Dockerfile
│   │   ├── Root Directory: (空)
│   │   └── Variables
│   │       ├── SERVER_PORT=8080
│   │       ├── APP_CORS_ALLOWED_ORIGINS=...
│   │       └── ...
│   ├── PostgreSQL (数据库 - 自动创建)
│   └── Deployments
│
└── machrio-frontend (服务)
    ├── Settings
    │   ├── Root Directory: frontend
    │   ├── Build Command: npm run build
    │   └── Variables
    │       └── VITE_API_URL=...
    └── Deployments
```

---

## 🔍 常见问题

### Q1: 找不到 "New" 按钮？

**A:** 
- 确保您已进入项目内部（点击了项目卡片）
- 滚动页面查找
- 可能在页面顶部或底部

### Q2: "Empty Service" 和 "Deploy from GitHub" 选哪个？

**A:** 
- **Empty Service**: 手动配置，适合自定义 Dockerfile
- **Deploy from GitHub**: 自动从 GitHub 部署，适合 CI/CD

**推荐：** 使用 "Empty Service" 然后手动配置 Dockerfile

### Q3: 创建服务后看不到 Dockerfile 选项？

**A:**
- 确保在 **Settings** 标签中查找
- 向下滚动找到 **Build** 部分
- 选择 **Builder: Dockerfile**

### Q4: PostgreSQL 数据库怎么添加？

**A:**
1. 在项目页面点击 **"New"**
2. 选择 **"Database"** > **"PostgreSQL"**
3. Railway 会自动创建并注入环境变量

---

## ✅ 检查清单

创建服务时请确认：

- [ ] 已进入 `machrio-admin` 项目
- [ ] 已点击 "New" 按钮
- [ ] 已选择 "Empty Service" 或 "Deploy from GitHub"
- [ ] 后端服务名称：`machrio-backend`
- [ ] Dockerfile Path: `Dockerfile`
- [ ] Root Directory: 留空
- [ ] 已添加 PostgreSQL 数据库
- [ ] 已配置环境变量

---

## 🎯 现在请执行：

1. **访问 Railway Dashboard**：https://railway.app/dashboard
2. **选择项目**：`machrio-admin`
3. **点击 "New"** 创建新服务
4. **选择 "Empty Service"**
5. **命名为**：`machrio-backend`
6. **配置 Settings**：
   - Dockerfile Path: `Dockerfile`
   - Root Directory: （留空）
7. **添加 PostgreSQL**：New > Database > PostgreSQL
8. **配置环境变量**（参考上面的列表）
9. **点击 Deploy** 开始部署

---

**创建服务后，请告诉我是否成功！** 🚀
