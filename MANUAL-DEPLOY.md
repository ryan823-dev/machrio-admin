# 🚀 手动部署指南（最简单）

## 第一步：部署后端到 Railway（网页版）

### 1. 访问 Railway
打开浏览器访问：https://railway.app/

### 2. 登录
- 点击 "Login"
- 选择 "Login with GitHub"
- 授权 Railway 访问你的 GitHub

### 3. 创建新项目
- 点击 "New Project"
- 选择 "Deploy from GitHub repo"
- 找到并选择 `machrio-admin` 仓库
- 点击 "Deploy"

### 4. 添加 PostgreSQL 数据库
- 在项目页面点击 "New"
- 选择 "Database" → "PostgreSQL"
- 等待数据库创建完成

### 5. 配置环境变量
在 Railway 项目页面：
1. 点击你的服务（machrio-admin）
2. 点击 "Variables" 标签
3. 点击 "Add Variable" 添加以下变量：

```
SPRING_PROFILES_ACTIVE = production
JWT_SECRET = machrio-admin-jwt-secret-key-change-this-to-random-32-chars
LOG_LEVEL_ROOT = INFO
LOG_LEVEL_COM_MACHRIO = DEBUG
```

**重要**: 
- `JWT_SECRET` 必须是至少 32 个字符的随机字符串
- 建议使用密码生成器生成

### 6. 等待自动部署
- Railway 会自动检测 Java 项目并部署
- 点击 "Deployments" 查看部署进度
- 等待状态变为 "SUCCESS"（约 3-5 分钟）

### 7. 生成公共域名
- 点击 "Settings" 标签
- 找到 "Domains" 部分
- 点击 "Generate Domain"
- 记录域名，例如：`https://machrio-admin-production.up.railway.app`

### 8. 验证后端
访问：`https://你的域名.up.railway.app/api/health`

应该返回：
```json
{
  "status": "UP"
}
```

---

## 第二步：部署前端到 Vercel（网页版）

### 1. 访问 Vercel
打开浏览器访问：https://vercel.com/

### 2. 登录
- 点击 "Sign Up" 或 "Login"
- 选择 "Continue with GitHub"

### 3. 导入项目
- 点击 "Add New..." → "Project"
- 找到 `machrio-admin` 仓库
- 点击 "Import"

### 4. 配置项目
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 5. 添加环境变量
点击 "Environment Variables" 添加：

```
VITE_API_URL = https://你的 railway 后端域名.up.railway.app/api
```

**重要**: 使用你在 Railway 部署的后端 URL

### 6. 部署
- 点击 "Deploy"
- 等待构建完成（约 2-3 分钟）
- 记录前端域名，例如：`https://machrio-admin.vercel.app`

### 7. 验证前端
访问：`https://你的前端域名.vercel.app`

应该能看到登录页面

---

## 第三步：配置 CORS

### 在 Railway 配置
1. 回到 Railway 项目页面
2. 点击你的服务
3. 点击 "Variables"
4. 添加变量：

```
CORS_ALLOWED_ORIGINS = https://你的前端域名.vercel.app
```

5. 点击 "Restart" 重启服务

---

## 第四步：全面测试

### 1. 测试 API
访问以下地址：
```
https://你的 railway 域名.up.railway.app/api/shipping-methods
https://你的 railway 域名.up.railway.app/api/bank-accounts
```

### 2. 测试前端
访问前端 URL，测试：
- ✅ 登录
- ✅ 产品管理
- ✅ 分类管理
- ✅ 运输配置 (`/shipping-methods`)
- ✅ 银行账户 (`/bank-accounts`)

---

## 📝 环境变量参考

### Railway 后端
| 变量 | 值 | 必需 |
|------|-----|------|
| `SPRING_PROFILES_ACTIVE` | `production` | ✅ |
| `JWT_SECRET` | 32+ 字符随机密钥 | ✅ |
| `LOG_LEVEL_ROOT` | `INFO` | ❌ |
| `LOG_LEVEL_COM_MACHRIO` | `DEBUG` | ❌ |
| `CORS_ALLOWED_ORIGINS` | 前端 URL | ✅ |

### Vercel 前端
| 变量 | 值 | 必需 |
|------|-----|------|
| `VITE_API_URL` | Railway 后端 URL + `/api` | ✅ |

---

## 🎯 快速检查清单

- [ ] Railway 账号已登录
- [ ] Vercel 账号已登录
- [ ] 后端部署到 Railway
- [ ] PostgreSQL 数据库已添加
- [ ] 环境变量已配置
- [ ] 后端域名已生成
- [ ] 前端部署到 Vercel
- [ ] 前端环境变量已配置
- [ ] CORS 已配置
- [ ] 后端健康检查通过
- [ ] 前端页面可访问
- [ ] API 调用正常

---

## 💡 提示

1. **JWT_SECRET**: 可以使用这个生成器：https://generate-secret.vercel.app/32

2. **查看日志**:
   - Railway: 点击服务 → "Deployments" → 查看最新部署日志
   - Vercel: Dashboard → "Deployments" → 查看构建日志

3. **重启服务**:
   - Railway: Settings → "Restart"
   - Vercel: Deployments → "Redeploy"

---

## 🐛 常见问题

### Q: Railway 部署失败
**A**: 
1. 检查日志查看错误信息
2. 确认 PostgreSQL 已正确添加
3. 检查环境变量是否正确

### Q: 前端无法连接后端
**A**:
1. 检查 `VITE_API_URL` 是否正确
2. 确认 CORS 已配置
3. 确保后端 URL 是 HTTPS

### Q: 数据库迁移失败
**A**:
1. 在 Railway Console 中查看错误
2. 检查 flyway_schema_history 表
3. 必要时重置数据库

---

**部署完成后，你将拥有**:
- ✅ 后端：https://xxx.up.railway.app
- ✅ 前端：https://xxx.vercel.app
- ✅ 数据库：Railway PostgreSQL
- ✅ 完整的功能：Phase 1-3 所有特性

**预计时间**: 15-20 分钟

*祝你部署顺利！* 🎉
