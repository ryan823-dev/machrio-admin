# 🚀 快速部署步骤

## 准备工作

确保你已经有以下账号：
- ✅ [Railway](https://railway.app/) 账号（可用 GitHub 登录）
- ✅ [Vercel](https://vercel.com/) 账号（可用 GitHub 登录）
- ✅ 代码已推送到 GitHub 仓库

---

## 第一步：部署后端到 Railway

### 方法一：使用部署脚本（推荐）

1. **双击运行** `deploy-to-railway.bat`
   
2. **按提示操作**：
   - 浏览器会自动打开 Railway 登录页面
   - 完成登录后返回命令行
   - 输入 JWT 密钥（或使用默认值）
   - 选择是否配置 OSS

3. **等待部署完成**（约 3-5 分钟）

4. **记录后端 URL**，例如：
   ```
   https://machrio-backend-production.up.railway.app
   ```

### 方法二：手动部署

```bash
# 1. 登录 Railway
railway login

# 2. 初始化项目
railway init

# 3. 添加数据库
railway add postgresql

# 4. 设置环境变量
railway variables set SPRING_PROFILES_ACTIVE=production
railway variables set JWT_SECRET=your-secret-key-here-32-chars
railway variables set LOG_LEVEL_ROOT=INFO
railway variables set LOG_LEVEL_COM_MACHRIO=DEBUG

# 5. 部署
railway up --detach

# 6. 生成域名
railway domain
```

---

## 第二步：部署前端到 Vercel

### 方法一：使用部署脚本

1. **双击运行** `deploy-to-vercel.bat`

2. **按提示操作**：
   - 登录 Vercel
   - 输入 Railway 后端 URL
   - 等待部署完成

3. **记录前端 URL**，例如：
   ```
   https://machrio-admin.vercel.app
   ```

### 方法二：通过 Vercel 网站部署

1. 访问 [vercel.com/new](https://vercel.com/new)

2. 选择 `machrio-admin` 仓库

3. **配置构建设置**：
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **添加环境变量**：
   ```
   VITE_API_URL=https://你的 railway 后端地址.up.railway.app/api
   ```

5. 点击 **Deploy**

---

## 第三步：配置 CORS

### 使用脚本（推荐）

1. **双击运行** `configure-cors.bat`

2. **输入前端 URL**：
   ```
   https://machrio-admin.vercel.app
   ```

3. 等待配置完成并自动重启

### 手动配置

1. 在 Railway 项目页面，点击 **Variables**

2. 添加环境变量：
   ```
   CORS_ALLOWED_ORIGINS=https://machrio-admin.vercel.app
   ```

3. 点击 **Restart** 重启项目

---

## 第四步：验证部署

### 1. 测试后端健康检查

访问：
```
https://你的 railway 后端地址.up.railway.app/api/health
```

应该返回：
```json
{
  "status": "UP"
}
```

### 2. 测试 API 端点

```bash
# 获取运输方法列表
curl https://你的 railway 后端地址.up.railway.app/api/shipping-methods

# 获取银行账户列表
curl https://你的 railway 后端地址.up.railway.app/api/bank-accounts
```

### 3. 测试前端

访问前端 URL：
```
https://machrio-admin.vercel.app
```

测试以下功能：
- ✅ 登录页面
- ✅ 产品管理 `/products`
- ✅ 分类管理 `/categories`
- ✅ 运输配置 `/shipping-methods`
- ✅ 银行账户 `/bank-accounts`

---

## 📝 环境变量参考

### Railway 后端环境变量

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `SPRING_PROFILES_ACTIVE` | ✅ | `production` |
| `JWT_SECRET` | ✅ | 至少 32 个字符的密钥 |
| `LOG_LEVEL_ROOT` | ❌ | `INFO` |
| `LOG_LEVEL_COM_MACHRIO` | ❌ | `DEBUG` |
| `OSS_ENDPOINT` | ❌ | OSS 端点 |
| `OSS_ACCESS_KEY_ID` | ❌ | OSS 访问密钥 ID |
| `OSS_ACCESS_KEY_SECRET` | ❌ | OSS 访问密钥 |
| `OSS_BUCKET` | ❌ | OSS 桶名称 |
| `CORS_ALLOWED_ORIGINS` | ✅ | 前端 URL |

### Vercel 前端环境变量

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `VITE_API_URL` | ✅ | Railway 后端 URL + `/api` |

---

## 🐛 常见问题

### 1. Railway 部署失败

**错误**: `Build failed`

**解决**:
```bash
# 查看详细日志
railway logs --limit 100

# 清理并重新部署
railway up --detach
```

### 2. 数据库连接失败

**错误**: `Cannot determine embedded database driver class`

**解决**:
- 确保已添加 PostgreSQL 插件
- 检查 `DATABASE_URL` 环境变量是否存在

### 3. 前端无法连接后端

**错误**: `Network Error` 或 CORS 错误

**解决**:
- 检查 `VITE_API_URL` 是否正确
- 在 Railway 配置 `CORS_ALLOWED_ORIGINS`
- 确保后端 URL 是 HTTPS

### 4. Flyway 迁移失败

**解决**:
```bash
# 在 Railway Console 中执行
SELECT * FROM flyway_schema_history;

# 如果需要重置（会删除所有数据！）
DROP TABLE IF EXISTS flyway_schema_history CASCADE;
DROP TABLE IF EXISTS shipping_methods CASCADE;
DROP TABLE IF EXISTS shipping_rates CASCADE;
DROP TABLE IF EXISTS free_shipping_rules CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
```

---

## 💰 成本说明

### Railway
- **Hobby Plan**: $5/月（包含$5 credit）
- **后端实例**: 约$5/月
- **PostgreSQL**: 约$5/月
- **总计**: 约$10/月

### Vercel
- **Hobby Plan**: 免费 ✅
- **Pro Plan**: $20/月（可选）

**总计**: $10-30/月

---

## 📊 部署检查清单

部署前确认：
- [ ] Railway 账号已注册
- [ ] Vercel 账号已注册
- [ ] 代码已推送到 GitHub
- [ ] 准备好 JWT 密钥

部署后验证：
- [ ] 后端健康检查通过
- [ ] 数据库迁移成功
- [ ] 前端可以访问
- [ ] API 调用正常
- [ ] 所有页面功能正常

---

## 🎯 快速命令参考

```bash
# Railway 命令
railway login          # 登录
railway init           # 初始化项目
railway add postgresql # 添加数据库
railway up             # 部署
railway logs           # 查看日志
railway status         # 查看状态
railway domain         # 生成域名
railway restart        # 重启

# Vercel 命令
vercel login           # 登录
vercel                 # 部署
vercel --prod          # 生产环境部署
```

---

## 📚 相关文档

- [RAILWAY-DEPLOYMENT-GUIDE.md](./RAILWAY-DEPLOYMENT-GUIDE.md) - 详细部署指南
- [PHASE1-3-FINAL-SUMMARY.md](./PHASE1-3-FINAL-SUMMARY.md) - 功能总结
- [GAP-ANALYSIS-FINAL.md](./GAP-ANALYSIS-FINAL.md) - GAP 分析

---

## 🆘 需要帮助？

如果部署过程中遇到问题：

1. 查看日志：
   ```bash
   railway logs --limit 100
   ```

2. 检查状态：
   ```bash
   railway status
   ```

3. 查看部署指南：
   ```
   RAILWAY-DEPLOYMENT-GUIDE.md
   ```

---

**祝部署顺利！** 🎉

*最后更新：2026-03-28*
