# OSS 域名绑定完整指南

## 一、OSS 基础配置（已完成）

### 1. 后端依赖已添加
✅ `build.gradle` 已添加 OSS SDK 依赖

### 2. 环境变量配置

**在 Railway 控制台设置以下环境变量：**

```bash
# 阿里云 OSS 配置
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
OSS_ACCESS_KEY_ID=你的新 AccessKey ID
OSS_ACCESS_KEY_SECRET=你的新 AccessKey 密钥
OSS_BUCKET=vertax
```

**⚠️ 重要安全提醒：**
- 立即禁用已泄露的 AccessKey
- 创建新的 AccessKey
- 不要将密钥提交到代码库

---

## 二、阿里云 OSS 域名绑定步骤

### 步骤 1：登录阿里云 OSS 控制台

1. 访问 https://oss.console.aliyun.com
2. 进入 **Bucket 列表** → 点击 **vertax**

### 步骤 2：绑定自定义域名

1. 在 Bucket 管理页面，左侧菜单选择 **域名管理**
2. 点击 **绑定域名** 按钮
3. 填写域名信息：

```
绑定域名：cdn.machrio.com (或 images.machrio.com)
CNAME 记录：自动填写
```

4. 点击 **确定**

### 步骤 3：配置 CNAME 解析

**在你的域名 DNS 服务商处添加 CNAME 记录：**

| 主机记录 | 记录类型 | 记录值 | TTL |
|---------|---------|--------|-----|
| cdn | CNAME | vertax.oss-cn-hangzhou.aliyuncs.com | 10 分钟 |

**常见 DNS 服务商配置：**

#### 阿里云 DNS（万网）
```
登录阿里云控制台 → 域名与网站 (DNS) → 解析设置
添加记录：
- 主机记录：cdn
- 记录类型：CNAME
- 记录值：vertax.oss-cn-hangzhou.aliyuncs.com
- TTL：10 分钟
```

#### 腾讯云 DNS
```
登录腾讯云控制台 → 域名解析
添加记录：
- 主机记录：cdn
- 记录类型：CNAME
- 记录值：vertax.oss-cn-hangzhou.aliyuncs.com
```

#### Cloudflare
```
登录 Cloudflare → DNS → Records
添加记录：
- Type: CNAME
- Name: cdn
- Target: vertax.oss-cn-hangzhou.aliyuncs.com
- Proxy status: DNS only (关闭代理)
```

### 步骤 4：验证域名绑定

1. 等待 DNS 生效（通常 1-10 分钟）
2. 在浏览器访问：`http://cdn.machrio.com/test.jpg`
3. 或在命令行测试：
```bash
ping cdn.machrio.com
# 应该解析到阿里云 OSS
```

---

## 三、开启 HTTPS（推荐）

### 方式 1：使用阿里云 CDN（推荐）

1. 开通阿里云 CDN 服务
2. 在 CDN 控制台添加域名 `cdn.machrio.com`
3. 源站类型选择 **OSS 域名**
4. 源站地址：`vertax.oss-cn-hangzhou.aliyuncs.com`
5. 开启 **HTTPS 安全加速**
6. 上传或选择免费 SSL 证书

### 方式 2：使用 Cloudflare（免费）

1. 将域名 DNS 托管到 Cloudflare
2. 自动获得免费 HTTPS
3. 享受全球 CDN 加速

---

## 四、配置 OSS CORS（跨域）

**前端访问 OSS 需要配置跨域规则：**

1. 登录 OSS 控制台 → vertax Bucket
2. 左侧菜单选择 **数据安全** → **跨域设置**
3. 点击 **创建跨域规则**

```
规则名称：AllowFrontend
来源：https://machrio.com,https://www.machrio.com,http://localhost:5173
允许 Methods：GET, POST, PUT, DELETE
允许 Headers：*
暴露 Headers：ETag, x-oss-request-id
缓存时间：3600 秒
```

4. 点击 **确定**

---

## 五、代码配置更新

### 1. 后端配置（已完成）

✅ `OssConfig.java` - OSS 配置类
✅ `OssService.java` - OSS 服务类
✅ `UploadController.java` - 上传接口

### 2. 前端配置

**更新 `.env` 文件：**

```bash
# 开发环境
VITE_API_URL=http://localhost:8080/api

# 生产环境（ Railway 会自动设置）
VITE_API_URL=https://your-app.railway.app/api
```

**使用 ImageUploader 组件：**

```tsx
import ImageUploader from '../components/ImageUploader';

// 产品图片上传
<ImageUploader
  value={imageUrl}
  onChange={setImageUrl}
  folder="products"
  previewWidth={300}
  previewHeight={300}
/>

// 类目图标上传
<ImageUploader
  value={iconUrl}
  onChange={setIconUrl}
  folder="categories/icons"
  previewWidth={100}
  previewHeight={100}
/>
```

---

## 六、图片 URL 格式

### 绑定域名前
```
https://vertax.oss-cn-hangzhou.aliyuncs.com/products/2024/01/01/abc123.jpg
```

### 绑定域名后
```
https://cdn.machrio.com/products/2024/01/01/abc123.jpg
```

### 图片处理（可选）
```bash
# 缩放
https://cdn.machrio.com/products/abc.jpg?x-oss-process=image/resize,w_800

# 裁剪
https://cdn.machrio.com/products/abc.jpg?x-oss-process=image/crop,w_400,h_400

# 格式转换
https://cdn.machrio.com/products/abc.jpg?x-oss-process=image/format,webp

# 组合操作
https://cdn.machrio.com/products/abc.jpg?x-oss-process=image/resize,w_800/format,webp/quality,q_85
```

---

## 七、完整部署流程

### 1. Railway 部署

**设置环境变量：**
```bash
# 在 Railway 项目 Settings → Variables 中添加
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
OSS_ACCESS_KEY_ID=你的新 Key
OSS_ACCESS_KEY_SECRET=你的新密钥
OSS_BUCKET=vertax
```

### 2. 前端部署

**更新 API 调用：**
```tsx
// src/components/ImageUploader.tsx
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
```

### 3. 测试上传

1. 启动后端：`cd backend/machrio-api && ./gradlew bootRun`
2. 启动前端：`cd frontend && npm run dev`
3. 访问产品页面，测试图片上传功能
4. 检查 OSS 控制台，确认文件已上传

---

## 八、常见问题排查

### 问题 1：上传失败 "AccessDenied"
**解决：**
- 检查 AccessKey 是否正确
- 检查 Bucket 权限设置
- 确认 RAM 用户有 OSS 写入权限

### 问题 2：前端跨域错误
**解决：**
- 在 OSS 控制台配置 CORS 规则
- 确保来源域名匹配

### 问题 3：域名绑定后无法访问
**解决：**
- 检查 DNS 是否生效：`ping cdn.machrio.com`
- 检查是否配置 HTTPS
- 清除浏览器缓存

### 问题 4：图片加载慢
**解决：**
- 开启 CDN 加速
- 使用图片压缩
- 启用浏览器缓存（已配置 1 年）

---

## 九、成本优化建议

### 1. 图片压缩
```tsx
// 上传前压缩
const compressImage = async (file: File, quality = 0.7) => {
  // 使用 canvas 或第三方库压缩
};
```

### 2. 使用 WebP 格式
```tsx
// 自动转换为 WebP，节省 30-50% 空间
const webpUrl = `${imageUrl}?x-oss-process=image/format,webp`;
```

### 3. 缩略图策略
```tsx
// 列表页使用小图
const thumbnailUrl = `${imageUrl}?x-oss-process=image/resize,w_200`;

// 详情页使用大图
const largeUrl = `${imageUrl}?x-oss-process=image/resize,w_800`;
```

### 4. 生命周期管理
在 OSS 控制台设置：
- 30 天前的图片转低频访问
- 365 天前的图片转归档存储

---

## 十、检查清单

- [ ] 创建新的 AccessKey（禁用已泄露的）
- [ ] 在 Railway 设置环境变量
- [ ] 在阿里云 OSS 绑定自定义域名
- [ ] 配置 DNS CNAME 记录
- [ ] 配置 OSS CORS 规则
- [ ] 开启 CDN（可选但推荐）
- [ ] 配置 HTTPS
- [ ] 测试图片上传功能
- [ ] 测试图片访问
- [ ] 验证图片压缩和处理

---

## 联系支持

遇到问题可联系：
- 阿里云工单：https://workorder.console.aliyun.com
- OSS 文档：https://help.aliyun.com/product/31815.html
