# 🔗 连接 PostgreSQL 数据库到 Railway 服务

## 当前情况

- ✅ 已创建 `machrio-admin` 项目
- ✅ 已创建 `machrio-backend` 服务
- ✅ 已创建新的 PostgreSQL 项目
- ❌ 数据库未连接到后端服务

---

## 解决方案

### 方法 1: 在 Railway Dashboard 中连接数据库

#### 步骤 1: 进入后端服务

1. 访问：https://railway.app/dashboard
2. 选择 **`machrio-admin`** 项目（不是 PostgreSQL 项目）
3. 选择 **`machrio-backend`** 服务

#### 步骤 2: 添加数据库连接

1. 在后端服务页面中，查找以下选项：
   - **"Add"** 按钮
   - **"+"** 图标
   - **"Connect"** 按钮
   - **"Variables"** 标签

2. 如果找不到上述选项，尝试：
   - 在服务页面中查找 **"Plugins"** 或 **"Connections"** 部分
   - 或者查找 **"Resources"** 标签

#### 步骤 3: 选择已创建的 PostgreSQL

1. 在添加资源的界面中
2. 选择 **"Existing Project"** 或 **"Link Existing"**
3. 选择您刚才创建的 PostgreSQL 项目
4. Railway 会自动注入数据库环境变量

#### 步骤 4: 手动添加环境变量（如果自动注入失败）

如果 Railway 没有自动注入环境变量，请手动添加：

1. 在 `machrio-backend` 服务中，点击 **Variables** 标签
2. 添加以下变量（从 PostgreSQL 项目中获取）：

```bash
DATABASE_URL=postgresql://user:password@host:port/database
SPRING_DATASOURCE_URL=${DATABASE_URL}
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_password
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=database_name
PGHOST=your_database_host
PGPORT=5432
```

**获取这些值的方法：**
- 访问您的 PostgreSQL 项目
- 查看 **Variables** 或 **Connection** 标签
- 复制数据库连接信息

---

### 方法 2: 使用 Railway CLI 连接

```bash
cd d:\qoder\machrio-admin

# 1. 登录 Railway
railway login

# 2. 选择项目
railway project --id machrio-admin

# 3. 选择后端服务
railway service --id machrio-backend

# 4. 添加 PostgreSQL（如果还没有）
railway add postgresql

# 5. 查看环境变量
railway variables

# 6. 重新部署
railway up
```

---

### 方法 3: 删除并重新创建（如果以上都失败）

如果连接太复杂，可以：

#### 步骤 1: 删除当前设置

1. 在 Railway Dashboard 中删除 `machrio-admin` 项目
2. 删除 PostgreSQL 项目（如果需要重新开始）

#### 步骤 2: 重新创建（正确顺序）

1. **创建 PostgreSQL 数据库**
   - 在 Railway Dashboard 中点击 **New**
   - 选择 **Database** > **PostgreSQL**
   - 这会自动在当前项目中创建数据库

2. **创建后端服务**
   - 在项目中点击 **New** 或 **Add**
   - 选择 **Empty Service** 或 **Deploy from GitHub**
   - 命名为 `machrio-backend`

3. **配置 Dockerfile**
   - 进入服务 Settings
   - 设置：
     - Builder: Dockerfile
     - Dockerfile Path: Dockerfile
     - Root Directory: （留空）

4. **Railway 会自动连接数据库**
   - 因为数据库是在同一个项目中创建的
   - 环境变量会自动注入到所有服务

---

## 🔍 验证数据库连接

### 在 Railway Dashboard 中:

1. 选择 `machrio-backend` 服务
2. 点击 **Variables** 标签
3. 确认有以下变量：
   - ✅ `DATABASE_URL`
   - ✅ `POSTGRES_USER`
   - ✅ `POSTGRES_PASSWORD`
   - ✅ `POSTGRES_DB`

### 查看部署日志:

1. 选择 `machrio-backend` 服务
2. 点击 **Deployments** 标签
3. 查看最新部署的日志
4. 寻找：
   ```
   HikariPool-1 - Start completed.
   ```

### 测试健康检查:

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

---

## 📋 完整配置检查清单

- [ ] PostgreSQL 数据库已创建
- [ ] 数据库与后端服务在同一项目中（或已正确连接）
- [ ] 环境变量已注入：
  - [ ] `DATABASE_URL`
  - [ ] `POSTGRES_USER`
  - [ ] `POSTGRES_PASSWORD`
  - [ ] `POSTGRES_DB`
- [ ] 其他环境变量已配置：
  - [ ] `SERVER_PORT=8080`
  - [ ] `APP_CORS_ALLOWED_ORIGINS=https://*.railway.app`
  - [ ] `APP_JWT_SECRET=your-secret-key`
- [ ] 服务已重新部署
- [ ] 健康检查通过

---

## 🆘 常见问题

### Q: 找不到 "Add" 或 "Connect" 按钮？

**A:** Railway 界面可能已更新。尝试：
1. 在服务页面中查找任何可以添加资源的选项
2. 查看是否有 "Plugins"、"Resources" 或 "Connections" 标签
3. 或者直接手动添加环境变量

### Q: PostgreSQL 项目和后端服务在不同的项目中？

**A:** 需要将它们移到同一项目：
1. 在 Railway Dashboard 中，数据库和服务需要在同一项目下
2. 如果不在同一项目，环境变量不会自动注入
3. 解决方法：删除并重新创建，确保在同一项目中

### Q: 手动添加环境变量后仍然失败？

**A:** 检查：
1. `DATABASE_URL` 格式是否正确
2. 数据库主机名是否可以访问
3. 用户名密码是否正确
4. 数据库是否已完全初始化（可能需要 1-2 分钟）

---

## 🎯 最简单的解决方案

**如果您刚刚创建了 PostgreSQL 项目但无法连接：**

1. **删除当前的 PostgreSQL 项目**（如果还没用）
2. **在 `machrio-admin` 项目中重新创建数据库**：
   - 进入 `machrio-admin` 项目
   - 查找 **"New"**、**"Add"** 或 **"+"** 按钮
   - 选择 **Database** > **PostgreSQL**
   - 这会自动在同一项目中创建数据库并连接

3. **等待 Railway 自动注入环境变量**
4. **重新部署后端服务**

---

**请尝试上述方法，然后告诉我结果！** 🚀

如果仍然无法连接，请提供：
1. Railway Dashboard 的截图
2. 您在项目中看到的选项
3. 任何错误信息

这样我可以提供更具体的指导！
