# 🚀 完整部署顺序

## ⚠️ 重要：必须按以下顺序执行！

---

## 第一步：推送到 GitHub ✅

**为什么先推送？**
- Railway 和 Vercel 需要从 GitHub 获取代码
- 自动部署依赖于 GitHub 仓库

**执行步骤:**

1. **双击运行**: `push-to-github.bat`

2. **等待推送完成**

3. **验证推送成功**:
   - 访问：https://github.com/ryan823-dev/machrio-admin
   - 确认代码已更新

---

## 第二步：部署后端到 Railway 🚀

**执行步骤:**

1. **双击运行**: `deploy-to-railway.bat`

2. **按提示操作**:
   - 浏览器登录 Railway
   - 输入 JWT 密钥
   - 选择是否配置 OSS

3. **等待部署完成** (3-5 分钟)

4. **记录后端 URL**:
   ```
   https://xxxxxxxxxxxx.up.railway.app
   ```

5. **验证后端**:
   - 访问：`https://你的 railway 域名.up.railway.app/api/health`
   - 应该返回：`{"status": "UP"}`

---

## 第三步：部署前端到 Vercel 🎨

**执行步骤:**

1. **双击运行**: `deploy-to-vercel.bat`

2. **输入 Railway 后端 URL**

3. **等待部署完成** (2-3 分钟)

4. **记录前端 URL**:
   ```
   https://xxxxxxxxxxxx.vercel.app
   ```

5. **验证前端**:
   - 访问：`https://你的 vercel 域名.vercel.app`
   - 应该能看到登录页面

---

## 第四步：配置 CORS 🔒

**为什么需要配置？**
- 浏览器安全策略阻止跨域请求
- 后端需要知道允许哪些域名访问

**执行步骤:**

1. **双击运行**: `configure-cors.bat`

2. **输入 Vercel 前端 URL**

3. **等待配置完成并重启**

---

## 第五步：全面测试 ✅

### 测试 API 端点

```bash
# 1. 健康检查
curl https://你的 railway 域名.up.railway.app/api/health

# 2. 获取运输方法
curl https://你的 railway 域名.up.railway.app/api/shipping-methods

# 3. 获取银行账户
curl https://你的 railway 域名.up.railway.app/api/bank-accounts
```

### 测试前端页面

访问前端 URL，测试以下功能:

1. ✅ **登录页面** - 能否正常显示
2. ✅ **产品管理** - `/products`
   - 查看产品列表
   - 创建新产品
   - 编辑产品（检查 Specifications、FAQ、Industry Tags）
3. ✅ **分类管理** - `/categories`
   - 查看分类列表
   - 创建分类（检查富文本编辑器）
   - 编辑分类
4. ✅ **运输配置** - `/shipping-methods`
   - 添加运输方法
   - 编辑运输方法
5. ✅ **运输费率** - `/shipping-rates`
   - 添加费率
   - 编辑费率
6. ✅ **免运费规则** - `/free-shipping-rules`
   - 添加规则
   - 编辑规则
7. ✅ **银行账户** - `/bank-accounts`
   - 添加账户
   - 编辑账户（检查国家特定字段）

---

## 📋 快速命令参考

```bash
# 完整部署流程
push-to-github.bat          # 1. 推送代码
deploy-to-railway.bat       # 2. 部署后端
deploy-to-vercel.bat        # 3. 部署前端
configure-cors.bat          # 4. 配置 CORS
```

---

## ⏱️ 预计时间

| 步骤 | 操作 | 时间 |
|------|------|------|
| 1 | 推送到 GitHub | 1-2 分钟 |
| 2 | Railway 部署 | 3-5 分钟 |
| 3 | Vercel 部署 | 2-3 分钟 |
| 4 | CORS 配置 | 30 秒 |
| 5 | 测试验证 | 5-10 分钟 |
| **总计** | | **12-20 分钟** |

---

## 🎯 部署检查清单

部署前确认:
- [ ] Railway 账号已注册
- [ ] Vercel 账号已注册
- [ ] GitHub 仓库已连接
- [ ] 准备好 JWT 密钥

部署完成确认:
- [ ] 代码已推送到 GitHub
- [ ] Railway 后端运行正常
- [ ] Vercel 前端可以访问
- [ ] CORS 配置完成
- [ ] 所有 API 端点正常
- [ ] 所有前端页面功能正常

---

## 🐛 常见问题

### Q1: 推送失败怎么办？

**A:** 检查以下几点:
```bash
# 检查 GitHub 连接
git remote -v

# 检查登录状态
gh auth status

# 重新登录
gh auth login
```

### Q2: Railway 部署失败？

**A:** 查看日志:
```bash
railway logs --limit 100
```

常见原因:
- 数据库未正确添加
- 环境变量配置错误
- 构建超时

### Q3: 前端无法连接后端？

**A:** 检查:
1. `VITE_API_URL` 是否正确
2. CORS 是否配置
3. 后端 URL 是否使用 HTTPS

### Q4: 数据库迁移失败？

**A:** 在 Railway Console 中检查:
```sql
SELECT * FROM flyway_schema_history;
```

---

## 📞 需要帮助？

如果遇到问题:

1. **查看日志**
   - Railway: `railway logs`
   - Vercel: 访问 Dashboard 查看 Build Logs

2. **检查状态**
   - Railway: `railway status`
   - GitHub: 访问 Actions 查看构建状态

3. **参考文档**
   - `RAILWAY-DEPLOYMENT-GUIDE.md` - 详细部署指南
   - `DEPLOYMENT-STEPS.md` - 步骤说明

---

**准备好了吗？开始部署吧！** 🚀

*从 `push-to-github.bat` 开始*

---

*最后更新：2026-03-28*
