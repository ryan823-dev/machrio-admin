# 🚀 在 Railway 中创建服务的正确方法

## 问题

在 `machrio-admin` 项目页面上找不到 "New" 按钮。

---

## ✅ 方法 1：从 GitHub 部署（推荐）

### 步骤 1：连接 GitHub

1. 访问：https://railway.app/dashboard
2. 点击 **`machrio-admin`** 项目
3. 在项目中查找 **"New Project"** 或 **"Create Service"** 按钮
4. 选择 **"Deploy from GitHub repo"**

### 步骤 2：选择仓库

1. 授权 Railway 访问 GitHub（如果还没有）
2. 选择仓库：`ryan823-dev/machrio-admin`
3. Railway 会自动创建服务

---

## ✅ 方法 2：使用 Railway CLI 创建（最简单）

### 安装 Railway CLI（如果还没有）

```bash
npm install -g @railway/cli
```

### 登录 Railway

```bash
railway login
```

### 创建后端服务

```bash
# 进入项目目录
cd d:\qoder\machrio-admin

# 登录 Railway
railway login

# 创建项目（如果还没有）
railway init --name machrio-admin

# 创建后端服务
cd backend\machrio-api
railway init --name machrio-backend

# 添加 PostgreSQL 数据库
railway add postgresql

# 设置环境变量
railway variables set SERVER_PORT=8080
railway variables set APP_CORS_ALLOWED_ORIGINS=https://*.railway.app
railway variables set APP_STORAGE_BLOB_ENDPOINT=https://blob.vercel-blob.com

# 部署
railway up
```

### 创建前端服务

```bash
# 返回根目录
cd ..\..

# 进入前端目录
cd frontend

# 创建前端服务
railway init --name machrio-frontend

# 设置环境变量（先留空，等后端部署后更新）
railway variables set VITE_API_URL=PLACEHOLDER

# 部署
railway up
```

---

## ✅ 方法 3：在 Railway Dashboard 中直接创建

### 步骤 1：访问项目

1. 打开：https://railway.app/dashboard
2. 找到 **`machrio-admin`** 项目
3. 点击进入项目

### 步骤 2：添加服务

**查找以下按钮或选项：**

- **"Add Service"**
- **"Create Service"**
- **"New Service"**
- **"+"** 图标
- **"Deploy"** 按钮

**或者尝试：**

1. 在项目中查找 **"Services"** 标签
2. 点击 **"Add"** 或 **"+"**

### 步骤 3：选择部署方式

- **GitHub Repo**: 从 GitHub 部署
- **Empty Service**: 手动配置
- **PostgreSQL**: 数据库
- **Redis**: 缓存

选择 **"GitHub Repo"** 或 **"Empty Service"**

---

## ✅ 方法 4：直接从模板创建

### 在 Railway Dashboard:

1. 访问：https://railway.app/dashboard
2. 点击 **"New Project"**
3. 选择 **"Deploy from GitHub repo"**
4. 选择 `ryan823-dev/machrio-admin`
5. Railway 会自动创建所有服务

---

## 🔍 如果还是找不到

### 可能的原因：

1. **项目还未正确创建**
   - 需要先创建项目
   - 使用 "New Project" 按钮

2. **权限问题**
   - 确认您有项目编辑权限
   - 检查是否是项目所有者

3. **界面版本不同**
   - Railway 可能更新了界面
   - 尝试使用 CLI 方式

---

## 🎯 最简单的解决方案

### 使用 Railway CLI（推荐）

```bash
cd d:\qoder\machrio-admin

# 1. 登录
railway login

# 2. 创建/选择项目
railway init --name machrio-admin

# 3. 进入后端目录并创建服务
cd backend\machrio-api
railway init --name machrio-backend

# 4. 添加数据库
railway add postgresql

# 5. 设置环境变量
railway variables set SERVER_PORT=8080
railway variables set APP_CORS_ALLOWED_ORIGINS=https://*.railway.app
railway variables set APP_STORAGE_BLOB_ENDPOINT=https://blob.vercel-blob.com

# 6. 部署
railway up
```

CLI 会自动处理所有配置，包括：
- ✅ 创建项目
- ✅ 创建服务
- ✅ 添加数据库
- ✅ 配置环境变量
- ✅ 开始部署

---

## 📞 现在请尝试：

### 选项 A：使用 Railway CLI（最简单）

```bash
cd d:\qoder\machrio-admin
railway login
cd backend\machrio-api
railway init --name machrio-backend
railway add postgresql
railway up
```

### 选项 B：在 Dashboard 中查找

1. 访问：https://railway.app/dashboard
2. 查找 **"New Project"** 或 **"Create"** 按钮
3. 选择 **"Deploy from GitHub repo"**
4. 选择 `ryan823-dev/machrio-admin`

---

## 🆘 需要帮助？

请告诉我：

1. **您在 Dashboard 中看到了什么按钮？**
   - 截图或描述看到的选项

2. **是否已安装 Railway CLI？**
   - 运行：`railway --version`

3. **项目是如何创建的？**
   - 从 GitHub 导入？
   - 手动创建？

这样我可以提供更具体的指导！
