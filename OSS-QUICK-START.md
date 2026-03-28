# =============================================
# OSS 快速启用指南
# =============================================

## 立即执行的步骤（10 分钟完成）

### 第 1 步：更换 AccessKey（2 分钟）⚠️

**立即执行！当前 Key 已泄露！**

1. 登录 https://ram.console.aliyun.com
2. 左侧菜单：**身份管理** → **用户**
3. 找到当前用户 → **AccessKey** 标签
4. 禁用已泄露的 Key
5. 创建新 Key，保存：
   - AccessKey ID
   - AccessKey Secret

---

### 第 2 步：Railway 环境变量（1 分钟）

在 Railway 项目控制台：

1. 进入项目 → **Variables**
2. 添加以下变量：

```
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
OSS_ACCESS_KEY_ID=你的新 Key ID
OSS_ACCESS_KEY_SECRET=你的新 Key 密钥
OSS_BUCKET=vertax
```

3. 点击 **Redeploy** 重新部署

---

### 第 3 步：绑定域名（5 分钟）

#### A. 阿里云 OSS 控制台

1. 访问 https://oss.console.aliyun.com
2. 点击 **vertax** Bucket
3. 左侧：**域名管理** → **绑定域名**
4. 输入：`cdn.machrio.com`
5. 确定

#### B. DNS 配置

在你的域名服务商添加：

```
类型：CNAME
主机记录：cdn
记录值：vertax.oss-cn-hangzhou.aliyuncs.com
TTL：10 分钟
```

#### C. 验证

```bash
# 等待 1-10 分钟后测试
ping cdn.machrio.com
# 应该显示阿里云 OSS 的 IP
```

---

### 第 4 步：配置 CORS（2 分钟）

1. OSS 控制台 → vertax → **数据安全**
2. **跨域设置** → **创建跨域规则**

```
规则名称：AllowAll
来源：*
允许 Methods：GET, POST, PUT, DELETE
允许 Headers：*
暴露 Headers：ETag
缓存时间：3600
```

---

## 测试上传

### 方式 1：使用 API 测试

```bash
# 上传图片
curl -X POST http://localhost:8080/api/upload/image \
  -F "file=@/path/to/image.jpg" \
  -F "folder=products"

# 返回示例
{
  "success": true,
  "data": {
    "url": "https://cdn.machrio.com/products/2024/01/01/abc123.jpg"
  }
}
```

### 方式 2：前端测试

1. 启动前端：`npm run dev`
2. 访问产品页面
3. 上传图片
4. 检查 OSS 控制台

---

## 完成！

现在你的图片会自动上传到 OSS，并通过自定义域名访问。

---

## 下一步优化（可选）

1. **开启 CDN 加速** - 在阿里云 CDN 控制台
2. **配置 HTTPS** - 使用免费 SSL 证书
3. **图片压缩** - 前端上传前压缩
4. **WebP 格式** - 自动转换节省流量

---

## 费用监控

1. 访问 https://usercenter2.aliyun.com
2. 查看 **费用中心** → **账单详情**
3. 设置费用预警

**预估月费用：¥200-300**（20-30 万 SKU）
