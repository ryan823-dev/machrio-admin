# Machrio Admin 功能实施清单

基于前端代码分析的完整功能对照表

---

## ✅ 已完成功能

### 1. Product 管理
- [x] 基础字段（name, slug, sku, shortDescription）
- [x] 富文本编辑器（fullDescription - TinyMCE）
- [x] 价格管理（basePrice, compareAtPrice, costPrice）
- [x] 货币和价格单位（currency, priceUnit）
- [x] 阶梯价格（tieredPricing）
- [x] 库存状态（availability）
- [x] 购买模式（purchaseMode）
- [x] MOQ/包装（minOrderQuantity, packageQty, packageUnit）
- [x] 交货期（leadTime）
- [x] 重量（weight）
- [x] 主图上传（externalImageUrl）
- [x] 附图管理（additionalImageUrls）
- [x] 类目选择（primaryCategoryId）
- [x] 品牌选择（brandId）
- [x] SEO（metaTitle, metaDescription）
- [x] 相关产品（relatedProducts）

### 2. Category 管理
- [x] 基础字段（name, slug, description, shortDescription）
- [x] 层级管理（parentId, level）
- [x] 排序（displayOrder）
- [x] 图标（iconEmoji）
- [x] 图片（image, heroImageUrl）
- [x] 精选标记（featured）
- [x] 状态（status）
- [x] 介绍内容（introContent）
- [x] FAQ 管理
- [x] Facet 分组
- [x] 自定义过滤器
- [x] SEO 字段

### 3. Brand 管理
- [x] CRUD 操作
- [x] Logo 上传
- [x] 网站链接
- [x] 精选标记

### 4. Order 管理
- [x] 订单列表
- [x] 订单详情
- [x] 状态更新
- [x] 客户信息
- [x] 订单项
- [x] 支付信息

### 5. Customer 管理
- [x] 客户列表
- [x] 客户详情
- [x] 公司信息
- [x] 联系方式

### 6. RFQ/Contact Inbox
- [x] RFQ 列表
- [x] RFQ 详情
- [x] 状态管理
- [x] 备注功能
- [x] Contact 表单管理

### 7. Industries 管理
- [x] CRUD 操作
- [x] Hero 图片
- [x] 特性管理
- [x] 应用场景
- [x] SEO 字段

### 8. Articles 管理
- [x] CRUD 操作
- [x] 富文本内容
- [x] 封面图片
- [x] 作者和标签
- [x] 分类管理
- [x] 发布控制

### 9. Glossary Terms 管理
- [x] CRUD 操作
- [x] 定义和同义词
- [x] 相关术语
- [x] 分类管理

### 10. Redirects 管理
- [x] CRUD 操作
- [x] 301/302 类型
- [x] 激活状态

### 11. OSS 集成
- [x] 后端服务
- [x] 上传控制器
- [x] 前端组件
- [x] 环境变量配置

---

## ⚠️ 需要补充的功能

### Product 管理 - 缺失字段

#### 1. Specifications 编辑器
**状态：** ❌ 未实现
**前端需求：**
```typescript
specifications: Array<{
  label: string
  value: string
  unit?: string
}>
```

**需要实现：**
- [ ] Specifications 数组字段
- [ ] 动态添加/删除行
- [ ] 预定义标签下拉
- [ ] 单位输入

**预计工作量：** 2 小时

---

#### 2. Product FAQ 编辑器
**状态：** ❌ 未实现
**前端需求：**
```typescript
faq: Array<{
  question: string
  answer: string
}>
```

**需要实现：**
- [ ] FAQ 数组字段
- [ ] 问答编辑器
- [ ] 排序功能

**预计工作量：** 1.5 小时

---

#### 3. Industry Tags
**状态：** ❌ 未实现
**前端需求：**
```typescript
industries: string[] // 枚举值
// manufacturing | construction | automotive | healthcare | 
// food-beverage | warehouse | oil-gas | mining
```

**需要实现：**
- [ ] Industry Tags 多选组件
- [ ] 预定义选项

**预计工作量：** 1 小时

---

#### 4. Shipping Info
**状态：** ❌ 未实现
**前端需求：**
```typescript
shippingInfo: {
  weight?: number
  processingTime?: number // days
}
```

**需要实现：**
- [ ] processingTime 字段
- [ ] 与 weight 整合

**预计工作量：** 0.5 小时

---

#### 5. Tags 管理
**状态：** ❌ 未实现
**前端需求：**
```typescript
tags: string[]
```

**需要实现：**
- [ ] Tags 多选输入
- [ ] 自动补全

**预计工作量：** 1 小时

---

#### 6. Focus Keyword
**状态：** ❌ 未实现
**前端需求：**
```typescript
focusKeyword: string
```

**需要实现：**
- [ ] SEO 部分添加字段

**预计工作量：** 0.5 小时

---

#### 7. Source URL
**状态：** ❌ 未实现
**前端需求：**
```typescript
sourceUrl: string
```

**需要实现：**
- [ ] 高级设置部分

**预计工作量：** 0.5 小时

---

### Category 管理 - 缺失字段

#### 1. Buying Guide 富文本
**状态：** ❌ 未实现（只有纯文本）
**前端需求：**
```typescript
buyingGuide: LexicalContent | string
```

**需要实现：**
- [ ] 富文本编辑器
- [ ] 内容标签页

**预计工作量：** 1 小时

---

#### 2. SEO Content 富文本
**状态：** ❌ 未实现（只有纯文本）
**前端需求：**
```typescript
seoContent: LexicalContent | string
```

**需要实现：**
- [ ] 富文本编辑器

**预计工作量：** 1 小时

---

#### 3. Description 富文本
**状态：** ⚠️ 当前为纯文本
**前端需求：**
```typescript
description: LexicalContent | string
```

**需要实现：**
- [ ] 改为富文本编辑器

**预计工作量：** 0.5 小时

---

### 缺失的模块

#### 1. Shipping Configuration
**状态：** ❌ 完全缺失
**需要管理：**
- [ ] Shipping Methods CRUD
- [ ] Shipping Rates CRUD
- [ ] Free Shipping Rules CRUD

**预计工作量：** 8 小时

---

#### 2. Bank Accounts
**状态：** ❌ 完全缺失
**需要管理：**
- [ ] 银行账户 CRUD
- [ ] 国家特定字段

**预计工作量：** 4 小时

---

#### 3. Bulk Import/Export
**状态：** ❌ 完全缺失
**需要功能：**
- [ ] CSV/Excel 导入
- [ ] 字段映射
- [ ] 批量导出

**预计工作量：** 12 小时

---

#### 4. Media Library
**状态：** ⚠️ 部分实现（只有上传）
**需要功能：**
- [ ] 媒体库浏览界面
- [ ] 文件夹管理
- [ ] 批量操作
- [ ] 使用统计

**预计工作量：** 8 小时

---

#### 5. Site Settings
**状态：** ❌ 完全缺失
**需要管理：**
- [ ] 站点基本信息
- [ ] Logo/Favicon
- [ ] 联系方式
- [ ] 社交媒体链接
- [ ] SEO 默认设置

**预计工作量：** 4 小时

---

#### 6. Navigation Management
**状态：** ❌ 完全缺失
**需要管理：**
- [ ] 菜单项编辑
- [ ] 拖拽排序
- [ ] 嵌套菜单

**预计工作量：** 6 小时

---

#### 7. Homepage Management
**状态：** ❌ 完全缺失
**需要管理：**
- [ ] Hero 区块配置
- [ ] Featured 选择
- [ ] 内容模块

**预计工作量：** 8 小时

---

#### 8. Static Pages
**状态：** ❌ 完全缺失
**需要管理：**
- [ ] 页面 CRUD
- [ ] 富文本内容
- [ ] SEO 字段

**预计工作量：** 4 小时

---

## 📋 实施计划

### Phase 1 - Product 完善（6 小时）
**优先级：P0 - 立即执行**

1. **Specifications 编辑器** (2h)
   - 创建 SpecificationsEditor 组件
   - 集成到 ProductFormPage
   - 测试保存和加载

2. **Product FAQ 编辑器** (1.5h)
   - 创建 FAQRepeater 组件
   - 集成到 ProductFormPage

3. **Industry Tags** (1h)
   - 添加多选组件
   - 预定义选项

4. **Shipping Info + Tags + FocusKeyword** (2h)
   - 添加缺失字段
   - 表单验证

5. **测试和调试** (1.5h)
   - 完整流程测试
   - 修复 bug

---

### Phase 2 - Category 富文本（3 小时）
**优先级：P0 - 立即执行**

1. **Buying Guide 富文本** (1h)
2. **SEO Content 富文本** (1h)
3. **Description 富文本** (0.5h)
4. **测试** (0.5h)

---

### Phase 3 - 核心配置模块（12 小时）
**优先级：P1 - 本周完成**

1. **Shipping Configuration** (8h)
   - Shipping Methods
   - Shipping Rates
   - Free Shipping Rules

2. **Bank Accounts** (4h)

---

### Phase 4 - 批量操作和媒体（20 小时）
**优先级：P1 - 下周完成**

1. **Bulk Import/Export** (12h)
2. **Media Library** (8h)

---

### Phase 5 - 站点管理（18 小时）
**优先级：P2 - 可选**

1. **Site Settings** (4h)
2. **Navigation Management** (6h)
3. **Homepage Management** (8h)

---

## 🎯 当前 Sprint 目标（本周）

### 必须完成：
- [ ] Product Specifications 编辑器
- [ ] Product FAQ 编辑器
- [ ] Industry Tags
- [ ] Category Buying Guide 富文本
- [ ] Category SEO Content 富文本

### 争取完成：
- [ ] Shipping Configuration 基础框架
- [ ] Bank Accounts

---

## 📊 完成度追踪

| 类别 | 已实现 | 总计 | 完成度 |
|------|--------|------|--------|
| Product 字段 | 17/24 | 24 | 71% |
| Category 字段 | 13/16 | 16 | 81% |
| 核心模块 | 7/10 | 10 | 70% |
| 内容模块 | 4/4 | 4 | 100% |
| 配置模块 | 0/3 | 3 | 0% |
| **总体** | **41/57** | **57** | **72%** |

---

## 🔧 技术债务

### 需要确认的问题：

1. **富文本格式对齐**
   - 前端使用 Lexical
   - 当前使用 TinyMCE (HTML)
   - 需要确认是否需要转换

2. **图片上传流程**
   - OSS 已集成但未配置
   - 需要测试完整流程

3. **数据验证**
   - 前端验证规则
   - 后端验证规则
   - 需要保持一致

---

**最后更新：** 2024-01-XX
**下次审查：** 完成 Phase 1 后
