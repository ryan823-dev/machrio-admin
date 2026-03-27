# 🤖 自动化 Railway 数据库设置

## 问题

Railway CLI 需要交互式登录，无法自动添加数据库。

## 解决方案：使用 GitHub Actions

### 步骤 1: 获取 Railway Token

1. 访问：https://railway.app/account/tokens
2. 点击 **"Create New Token"**
3. 复制 Token（格式如：`abc123...`）

### 步骤 2: 配置 GitHub Secrets

1. 访问：https://github.com/ryan823-dev/machrio-admin/settings/secrets/actions
2. 点击 **"New repository secret"**
3. 添加 Secret：
   - **Name**: `RAILWAY_TOKEN`
   - **Value**: 第一步中复制的 Token
4. 点击 **"Add secret"**

### 步骤 3: 运行自动化工作流

1. 访问：https://github.com/ryan823-dev/machrio-admin/actions
2. 选择 **"Setup Railway Database"** 工作流
3. 点击 **"Run workflow"**
4. 选择 `main` 分支
5. 点击 **"Run workflow"**

### 步骤 4: 等待完成

工作流会自动：
- ✅ 登录 Railway
- ✅ 添加 PostgreSQL 数据库
- ✅ 配置环境变量
- ✅ 触发重新部署

### 步骤 5: 验证

1. 访问：https://railway.app/dashboard
2. 选择 `machrio-admin` 项目
3. 查看 **Variables** 标签，确认有：
   - `DATABASE_URL`
   - `SERVER_PORT=8080`
   - `APP_CORS_ALLOWED_ORIGINS`
   - 等

---

## 🎯 或者：手动在 Dashboard 中添加

如果 GitHub Actions 太复杂，请手动：

### 在 Railway Dashboard 中：

1. **访问**：https://railway.app/dashboard
2. **选择**：`machrio-admin` 项目
3. **查找以下任一选项**：
   - **"New"** 按钮
   - **"Add"** 按钮
   - **"+"** 图标
   - **"Databases"** 部分
   - **"Plugins"** 标签
   - **"Resources"** 标签

4. **选择**：`Database` > `PostgreSQL`

5. **如果没有上述选项**：
   - 点击顶部的 **"Deployments"** 标签
   - 或者点击 **"Settings"** 标签
   - 查找添加资源的选项

### 手动添加环境变量：

如果无法自动添加数据库，手动在 **Variables** 标签中添加：

```bash
# 数据库配置（使用占位符，后续更新）
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/machrio
SPRING_DATASOURCE_URL=${DATABASE_URL}
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres

# 其他配置
SERVER_PORT=8080
APP_CORS_ALLOWED_ORIGINS=https://*.railway.app
APP_STORAGE_BLOB_ENDPOINT=https://blob.vercel-blob.com
APP_JWT_SECRET=dev-secret-key-change-in-production
APP_JWT_EXPIRATION_MS=86400000
```

---

## 📋 验证数据库连接

添加数据库后，查看部署日志：

1. 在 Railway Dashboard 中
2. 选择 `machrio-backend` 服务
3. 点击 **Deployments** 标签
4. 查看最新部署的日志
5. 寻找：
   ```
   HikariPool-1 - Start completed.
   ```

这表示数据库连接成功！

---

## 🔍 故障排查

### 问题 1: GitHub Actions 失败

**解决方案**：
- 确认 `RAILWAY_TOKEN` 正确
- 检查 Token 是否过期
- 查看 Actions 日志获取详细错误

### 问题 2: Dashboard 中找不到添加数据库的选项

**解决方案**：
- Railway 界面可能已更新
- 尝试在任何地方查找 "Add"、"New"、"+" 等按钮
- 或者手动添加环境变量

### 问题 3: 健康检查仍然失败

**解决方案**：
- 等待 1-2 分钟让数据库完全初始化
- 检查环境变量是否正确
- 查看应用日志中的数据库连接错误

---

**请选择一种方法添加数据库，然后告诉我结果！** 🚀
