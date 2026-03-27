# 📊 Railway 部署状态检查指南

## 方法 1: Railway Dashboard（推荐）

### 查看部署状态

1. **访问**: https://railway.app/dashboard
2. **选择项目**: `machrio-admin`
3. **选择服务**: `machrio-backend`
4. **查看 Deploy 标签**: 当前部署状态

### 查看实时日志

1. 点击 **Logs** 标签
2. 查看实时输出
3. 搜索错误信息：
   - `BUILD FAILED`
   - `Exception`
   - `Error`
   - `Failed`

### 关键日志阶段

**成功的构建流程：**
```
✓ Pulling Docker image (拉取 Docker 镜像)
✓ Building with Dockerfile (使用 Dockerfile 构建)
  > Downloading Gradle dependencies (下载 Gradle 依赖)
  ✓ Dependencies downloaded (依赖下载完成)
  > Compiling Java code (编译 Java 代码)
  ✓ Compilation successful (编译成功)
  > Building JAR file (构建 JAR 文件)
  ✓ Build successful! (构建成功)
✓ Deploying... (部署中)
✓ Health check passed (健康检查通过)
✓ Deployment complete! (部署完成)
```

**失败的特征：**
```
❌ BUILD FAILED
❌ Exception: ...
❌ Error: ...
❌ Build failed with code X
❌ Health check failed
```

---

## 方法 2: Railway CLI

### 安装和登录

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录 Railway
railway login
```

### 查看部署状态

```bash
# 查看项目状态
cd d:\qoder\machrio-admin
railway status

# 查看后端日志
railway logs --service machrio-backend

# 查看前端日志
railway logs --service machrio-frontend

# 查看部署历史
railway deployments
```

### 使用自动化脚本

```bash
# 运行自动检查脚本
cd d:\qoder\machrio-admin
auto-check-deploy.bat
```

---

## 方法 3: GitHub Actions

如果已配置 GitHub Actions：

1. 访问：https://github.com/ryan823-dev/machrio-admin/actions
2. 查看最新的工作流运行状态
3. 点击运行查看详情

---

## 常见错误及解决方案

### 错误 1: BUILD FAILED - 依赖下载失败

**错误信息：**
```
Could not resolve all dependencies
Could not get resource '...'
```

**解决方案：**
- 检查网络连接
- 等待几分钟后重试
- 检查 `build.gradle` 中的仓库配置

### 错误 2: Java 编译错误

**错误信息：**
```
error: cannot find symbol
error: package ... does not exist
```

**解决方案：**
- 检查 Java 版本是否为 21
- 检查依赖是否正确配置
- 查看完整的编译错误信息

### 错误 3: JAR 文件未找到

**错误信息：**
```
COPY failed: file not found in build context
no such file or directory
```

**解决方案：**
- 已修复：Dockerfile 中的 JAR 路径现在是 `/app/build/libs/*.jar`
- 确认 Root Directory 设置为空

### 错误 4: 健康检查失败

**错误信息：**
```
Health check failed
Connection refused
```

**解决方案：**
- 检查应用是否正确启动
- 确认端口设置为 8080
- 检查 `/api/health` 端点是否存在

### 错误 5: 数据库连接失败

**错误信息：**
```
Cannot load driver class
Connection refused
```

**解决方案：**
- 确认已添加 PostgreSQL 服务
- 检查数据库环境变量是否正确
- 在 Railway Dashboard 中查看数据库连接信息

---

## 验证部署成功

### 1. 检查服务状态

在 Railway Dashboard 中：
- 服务状态显示为 **"Deployed"**（绿色）
- 无错误日志
- 健康检查通过

### 2. 测试 API 端点

```bash
# 测试健康检查
curl https://your-backend.railway.app/api/health

# 期望响应
{"status":"UP"}
```

### 3. 访问前端

打开浏览器访问：
```
https://your-frontend.railway.app
```

### 4. 查看域名

在 Railway Dashboard 中：
- Settings > Domains
- 复制生成的域名

---

## 获取完整错误日志

### Railway Dashboard

1. 点击 **Logs** 标签
2. 滚动到最底部查看最新日志
3. 点击右上角 **"Download"** 下载完整日志
4. 或者使用 **Ctrl+A** 全选，**Ctrl+C** 复制

### Railway CLI

```bash
# 查看最近 100 行日志
railway logs --service machrio-backend --lines 100

# 实时查看日志
railway logs --service machrio-backend --follow
```

---

## 快速诊断流程

```
开始
  ↓
检查构建是否完成？
  ├─ 是 → 检查健康检查
  │       ├─ 通过 → 部署成功 ✓
  │       └─ 失败 → 检查应用启动日志
  │
  └─ 否 → 检查构建日志
          ├─ 依赖下载失败 → 网络问题
          ├─ 编译失败 → 代码错误
          └─ JAR 未找到 → Dockerfile 路径问题
```

---

## 需要帮助？

如果部署失败，请提供以下信息：

1. **完整的错误日志**（最后 50-100 行）
2. **Railway Dashboard 截图**（如果有）
3. **错误出现的时间点**
4. **是否已添加 PostgreSQL 数据库**

---

## 下一步

部署成功后：

1. ✅ 添加 PostgreSQL 数据库
2. ✅ 配置环境变量
3. ✅ 获取服务域名
4. ✅ 测试 API 端点
5. ✅ 部署前端服务

---

**现在请在 Railway Dashboard 中查看部署状态，或运行 `auto-check-deploy.bat` 自动检查！**
