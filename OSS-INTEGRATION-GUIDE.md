# OSS 集成使用示例

## 1. 环境变量配置

### 后端 `.env` 或 Railway 环境变量：
```bash
# 阿里云 OSS 配置
# 请替换为你自己的 AccessKey
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
OSS_ACCESS_KEY_ID=你的 AccessKeyID
OSS_ACCESS_KEY_SECRET=你的 AccessKeySecret
OSS_BUCKET=vertax
```

### 前端 `.env`：
```bash
VITE_API_URL=http://localhost:8080/api
```

---

## 2. 在表单中使用 ImageUploader

### 示例 1：ProductFormPage 集成 OSS

```tsx
import ImageUploader from '../components/ImageUploader';

// 在 ProductFormPage 中
export default function ProductFormPage() {
  const [externalImageUrl, setExternalImageUrl] = useState<string>('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  const handleSave = async () => {
    const values = await form.validateFields();
    const payload = {
      ...values,
      externalImageUrl,  // OSS 图片 URL
      additionalImageUrls: additionalImages,  // OSS 图片 URLs
    };
    // ... 保存逻辑
  };

  return (
    <Form form={form} layout="vertical">
      {/* 主图上传 - 使用 OSS */}
      <Form.Item label="Product Image">
        <ImageUploader
          value={externalImageUrl}
          onChange={setExternalImageUrl}
          folder="products"
          placeholder="上传产品主图"
          previewWidth={300}
          previewHeight={300}
        />
      </Form.Item>

      {/* 附图上传 - 使用 OSS */}
      <Form.Item label="Additional Images">
        {additionalImages.map((url, index) => (
          <div key={index} style={{ display: 'inline-block', marginRight: 12, marginBottom: 12 }}>
            <ImageUploader
              value={url}
              onChange={(newUrl) => {
                const newImages = [...additionalImages];
                newImages[index] = newUrl;
                setAdditionalImages(newImages);
              }}
              folder="products/additional"
              previewWidth={150}
              previewHeight={150}
            />
          </div>
        ))}
        <Button
          onClick={() => setAdditionalImages([...additionalImages, ''])}
          icon={<PlusOutlined />}
        >
          添加附图
        </Button>
      </Form.Item>
    </Form>
  );
}
```

### 示例 2：CategoryFormPage 集成 OSS

```tsx
import ImageUploader from '../components/ImageUploader';

// 在 CategoryFormPage 中
export default function CategoryFormPage() {
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');
  const [image, setImage] = useState<string>('');

  return (
    <Form form={form} layout="vertical">
      {/* 类目图标 */}
      <Form.Item label="Category Icon">
        <ImageUploader
          value={image}
          onChange={setImage}
          folder="categories/icons"
          previewWidth={100}
          previewHeight={100}
        />
      </Form.Item>

      {/* Hero 图片 */}
      <Form.Item label="Hero Image">
        <ImageUploader
          value={heroImageUrl}
          onChange={setHeroImageUrl}
          folder="categories/hero"
          placeholder="上传类目 Hero 图片"
          previewWidth={400}
          previewHeight={200}
        />
      </Form.Item>
    </Form>
  );
}
```

### 示例 3：IndustriesPage 集成 OSS

```tsx
import ImageUploader from '../components/ImageUploader';

// 在 IndustriesPage Drawer 表单中
<Drawer title={editingIndustry ? 'Edit Industry' : 'New Industry'} open={drawerOpen}>
  <Form form={form} layout="vertical">
    <Form.Item label="Hero Image">
      <ImageUploader
        value={form.getFieldValue('heroImageUrl')}
        onChange={(url) => form.setFieldValue('heroImageUrl', url)}
        folder="industries"
        previewWidth={400}
        previewHeight={250}
      />
    </Form.Item>
  </Form>
</Drawer>
```

---

## 3. 直接调用 OSS Service（高级用法）

如果需要在 Service 层直接处理图片：

```java
@Service
public class ProductService {
    
    private final OssService ossService;
    
    public ProductDTO createProduct(CreateProductRequest request, MultipartFile imageFile) {
        // 上传图片到 OSS
        String imageUrl = ossService.uploadImage(imageFile, "products");
        
        // 保存产品数据
        Product product = new Product();
        product.setExternalImageUrl(imageUrl);
        // ... 其他字段
        
        productRepository.save(product);
        return toDTO(product);
    }
}
```

---

## 4. 图片处理（阿里云 OSS 功能）

阿里云 OSS 支持 URL 参数进行图片处理：

```typescript
// 原始 URL
const originalUrl = "https://vertax.oss-cn-hangzhou.aliyuncs.com/products/2024/01/01/abc123.jpg";

// 缩放至 300x300
const resizedUrl = `${originalUrl}?x-oss-process=image/resize,w_300,h_300`;

// 裁剪为中心 200x200
const croppedUrl = `${originalUrl}?x-oss-process=image/crop,w_200,h_200,x_50,y_50`;

// 添加水印
const watermarkedUrl = `${originalUrl}?x-oss-process=image/watermark,image_dGVzdC5wbmc`;

// 格式转换为 WebP
const webpUrl = `${originalUrl}?x-oss-process=image/format,webp`;

// 组合多个操作
const processedUrl = `${originalUrl}?x-oss-process=image/resize,w_800/format,webp/quality,q_85`;
```

---

## 5. 最佳实践

### 文件夹结构建议：
```
oss-bucket/
├── products/
│   ├── 2024/01/01/xxx.jpg
│   └── additional/
├── categories/
│   ├── icons/
│   └── hero/
├── industries/
├── brands/
├── articles/
└── uploads/  # 默认文件夹
```

### 安全建议：
1. **不要将 AccessKey 提交到代码库** - 使用环境变量
2. **设置 OSS 跨域规则** - 允许前端域名访问
3. **使用签名 URL** - 对于私有 bucket
4. **图片类型验证** - 后端已实现，前端也应验证
5. **文件大小限制** - 默认 10MB，可调整

### 性能优化：
1. **CDN 加速** - 绑定自定义域名并开启 CDN
2. **图片压缩** - 上传前在前端压缩
3. **懒加载** - 列表页使用缩略图
4. **缓存策略** - OSS 已设置 1 年缓存

---

## 6. 成本估算（20-30 万 SKU）

| 项目 | 用量 | 单价 | 月费用 |
|------|------|------|--------|
| 存储 | 120GB | ¥0.12/GB | ¥14.4 |
| 流量 | 500GB/月 | ¥0.5/GB | ¥250 |
| 请求 | 100 万次 | ¥0.01/万次 | ¥10 |
| **总计** | | | **~¥275/月** |

相比自建存储节省：
- 服务器磁盘扩容成本
- 带宽成本（图片流量占 80%+）
- 运维人力成本
- 备份和 CDN 成本
