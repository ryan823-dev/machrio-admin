# 🚀 Railway 快速部署（正确步骤）

## 第一步：部署后端到 Railway

### 1. 访问 Railway
打开：https://railway.app/

### 2. 登录
- 点击 "Login"
- 选择 "Login with GitHub"
- 授权 Railway

### 3. 创建项目
- 点击 "New Project"
- 选择 "Deploy from GitHub repo"
- **重要**: 此时会看到所有 GitHub 仓库列表

### 4. 选择仓库
- 找到并点击 `machrio-admin` 仓库
- ** Railway 会自动开始部署**（不需要额外点击）

### 5. 等待首次部署完成
- Railway 会开始构建（约 2-3 分钟）
- 点击服务卡片查看详情
- 等待状态变为 "SUCCESS" 或至少开始运行

### 6. 添加 PostgreSQL 数据库
- 回到项目主页
- 点击 "New"
- 选择 "Database" → "PostgreSQL"
- 等待数据库创建（会自动连接到你的服务）

### 7. 配置环境变量
- 点击你的服务（machrio-admin）
- 点击 "Variables" 标签
- 逐个添加以下变量：

```
SPRING_PROFILES_ACTIVE = production
JWT_SECRET = 你的随机 32 字符密钥（例如：x8K9mP2nQ5vR7wL3jH6tY4uI0oA1sD8f
LOG_LEVEL_ROOT = INFO
LOG_LEVEL_COM_MACHRIO = DEBUG
```

**添加方法**:
- 点击 "Add Variable"
- 输入变量名和值
- 按 Enter 保存
- 重复添加下一个

### 8. 重启服务
- 点击 "Deployments" 标签
- 点击右上角 "..." → "Restart Deployment"
- 等待重启完成（约 1-2 分钟）

### 9. 生成域名
- 点击 "Settings" 标签
- 找到 "Networking" → "Domains"
- 点击 "Generate Domain"
- **记录域名**: `https://xxx.up.railway.app`

### 10. 验证后端
访问：`https://你的域名.up.railway.app/api/health`

应该返回：`{"status": "UP"}`

---

## 第二步：部署前端到 Vercel

### 1. 访问 Vercel
打开：https://vercel.com/

### 2. 登录
- 用 GitHub 账号登录

### 3. 导入项目
- 点击 "Add New..." → "Project"
- 找到 `machrio-admin` 仓库
- 点击 "Import"

### 4. 配置构建设置
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 5. 添加环境变量
点击 "Environment Variables" → "Add New":

```
VITE_API_URL = https://你的 railway 域名.up.railway.app/api
```

### 6. 部署
- 点击 "Deploy"
- 等待 2-3 分钟
- **记录域名**: `https://xxx.vercel.app`

---

## 第三步：配置 CORS

### 在 Railway 添加 CORS 变量
- 回到 Railway 项目
- 点击服务 → "Variables"
- 添加：

```
CORS_ALLOWED_ORIGINS = https://你的 vercel 域名.vercel.app
```

- 重启服务（Deployments → ... → Restart）

---

## 🎯 关键提示

### ⚠️ 重要顺序
1. **先部署**（Railway 会自动开始）
2. **等部署完成**（看到 SUCCESS）
3. **添加数据库**
4. **添加环境变量**
5. **重启服务**

### 💡 环境变量添加时机
- **首次部署前不需要**环境变量
- Railway 会用默认配置完成首次部署
- **部署完成后**再添加环境变量
- 添加后**必须重启**才能生效

### 🔍 如何知道部署成功？
- 状态显示 "SUCCESS"
- 日志显示 "Started com.machrio.admin.AdminApplication"
- 访问 `/api/health` 返回 `{"status": "UP"}`

---

## 📝 完整环境变量列表

### Railway 后端（部署后添加）
```
SPRING_PROFILES_ACTIVE = production
JWT_SECRET = 随机 32+ 字符密钥
LOG_LEVEL_ROOT = INFO
LOG_LEVEL_COM_MACHRIO = DEBUG
CORS_ALLOWED_ORIGINS = https://你的前端.vercel.app
```

### Vercel 前端（部署前添加）
```
VITE_API_URL = https://你的后端.up.railway.app/api
```

---

## 🐛 故障排查

### 部署失败
1. 点击 "Deployments" 查看日志
2. 常见错误：
   - 数据库未连接 → 添加 PostgreSQL
   - 环境变量缺失 → 添加后重启
   - 构建超时 → 等待或重试

### 数据库错误
```
Cannot determine embedded database driver class
```
**解决**: 确保已添加 PostgreSQL 插件

### 健康检查失败
访问 `/api/health` 返回错误：
1. 检查日志
2. 确认环境变量已添加
3. 重启服务

---

## ✅ 验证清单

- [ ] Railway 项目创建成功
- [ ] 首次部署完成（SUCCESS）
- [ ] PostgreSQL 已添加
- [ ] 环境变量已配置
- [ ] 服务已重启
- [ ] 域名已生成
- [ ] 健康检查通过
- [ ] Vercel 前端已部署
- [ ] CORS 已配置
- [ ] 前后端连接正常

---

**预计时间**: 15-20 分钟

*按照这个顺序，保证部署成功！* 🎉
