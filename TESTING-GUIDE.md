# 完整功能测试指南

## 📋 测试环境

### 本地测试
- **前端**: http://localhost:5175
- **后端**: 等待 Railway 部署
- **数据库**: Railway PostgreSQL

### 生产测试（Railway 部署后）
- **后端 API**: https://your-project.railway.app
- **前端**: 配置 API URL 后访问

---

## 🧪 测试清单

### ✅ 1. 前端页面测试

#### Dashboard 页面
- [ ] 访问 http://localhost:5175
- [ ] 检查统计卡片显示
- [ ] 点击"批量上传"按钮（应该是第一个快捷操作）
- [ ] 检查最近订单列表
- [ ] 检查最近商品列表

#### 产品管理页面
- [ ] 访问 http://localhost:5175/products
- [ ] 产品列表显示
- [ ] 分页功能
- [ ] 搜索功能
- [ ] 点击"新产品"按钮

#### 批量上传页面
- [ ] 访问 http://localhost:5175/products/bulk-upload
- [ ] 下载 Excel 模板
- [ ] 上传测试文件
- [ ] 检查上传进度
- [ ] 查看上传结果

#### AI 对话管理页面
- [ ] 访问 http://localhost:5175/ai-conversations
- [ ] 对话列表显示（等待后端部署后有数据）
- [ ] 筛选功能
- [ ] 搜索功能
- [ ] 查看对话详情

#### 客户需求页面
- [ ] 访问 http://localhost:5175/customer-requirements
- [ ] 需求列表显示
- [ ] 优先级标识
- [ ] 状态管理
- [ ] 分配功能

---

### ✅ 2. API 端点测试（需要后端部署）

#### 健康检查
```bash
curl https://your-project.railway.app/actuator/health
# 预期：{"status":"UP"}
```

#### 产品 API
```bash
# 获取产品列表
curl https://your-project.railway.app/api/products

# 获取单个产品
curl https://your-project.railway.app/api/products/{id}

# 创建产品
curl -X POST https://your-project.railway.app/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "sku": "TEST-001",
    "price": 99.99
  }'
```

#### AI 对话 API
```bash
# 获取对话列表
curl https://your-project.railway.app/api/ai-conversations

# 创建对话
curl -X POST https://your-project.railway.app/api/ai-conversations \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-001",
    "messages": [
      {"role": "user", "content": "I need industrial valves"},
      {"role": "assistant", "content": "I can help you find valves"}
    ],
    "user": {
      "userName": "Test User",
      "userEmail": "test@example.com"
    }
  }'

# 获取对话详情
curl https://your-project.railway.app/api/ai-conversations/{id}

# 获取对话消息
curl https://your-project.railway.app/api/ai-conversations/{id}/messages
```

#### 客户需求 API
```bash
# 获取需求列表
curl https://your-project.railway.app/api/customer-requirements

# 创建需求
curl -X POST https://your-project.railway.app/api/customer-requirements \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "{conversation-id}",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "requirementType": "product_purchase",
    "productNames": ["Valve A", "Valve B"],
    "quantity": 100,
    "totalBudget": "$5000"
  }'

# 更新需求状态
curl -X PUT https://your-project.railway.app/api/customer-requirements/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "qualified",
    "priority": "high"
  }'
```

---

### ✅ 3. 数据库测试

#### 连接测试
```bash
# 在 Railway 控制台 PostgreSQL 插件中
# 点击 "Open Client" 执行以下 SQL

-- 检查表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 检查 AI 对话表
SELECT * FROM ai_conversations LIMIT 5;

-- 检查对话消息表
SELECT * FROM conversation_messages LIMIT 5;

-- 检查客户需求表
SELECT * FROM customer_requirements LIMIT 5;

-- 查看高意向客户视图
SELECT * FROM high_intent_conversations LIMIT 5;
```

#### 数据完整性测试
```sql
-- 检查外键关系
SELECT 
    c.id as conversation_id,
    c.user_name,
    COUNT(m.id) as message_count,
    COUNT(r.id) as requirement_count
FROM ai_conversations c
LEFT JOIN conversation_messages m ON c.id = m.conversation_id
LEFT JOIN customer_requirements r ON c.id = r.conversation_id
GROUP BY c.id, c.user_name
ORDER BY c.created_at DESC;
```

---

### ✅ 4. 前端 - 后端集成测试

#### 测试场景 1: 完整对话流程

1. **前台网站对话**（machrio.com）
   - 用户与 AI 助手对话
   - 对话自动保存到 admin 后台

2. **后台查看对话**
   - 访问 /ai-conversations
   - 查看新对话
   - 检查对话内容

3. **需求提取**
   - 系统自动提取客户需求
   - 在 /customer-requirements 查看

#### 测试场景 2: 批量上传产品

1. **准备 Excel 文件**
   - 下载模板
   - 填写测试数据（10-20 个产品）

2. **上传文件**
   - 访问 /products/bulk-upload
   - 上传 Excel 文件
   - 查看上传进度

3. **验证结果**
   - 检查成功上传数量
   - 查看错误信息（如有）
   - 在产品列表中确认

#### 测试场景 3: 客户需求跟进

1. **查看新需求**
   - 访问 /customer-requirements
   - 筛选状态为"new"的需求

2. **分配销售**
   - 选择需求
   - 分配给销售人员
   - 添加跟进备注

3. **更新状态**
   - 更新为"contacted"
   - 设置下次跟进日期
   - 添加联系记录

---

### ✅ 5. 性能测试

#### 并发测试
```bash
# 使用 Apache Bench 测试
# 安装：brew install apache-benchmark (Mac) 或 apt-get install apache2-utils (Linux)

# 测试产品列表 API
ab -n 100 -c 10 https://your-project.railway.app/api/products

# 预期结果：
# Requests per second: > 50
# Time per request: < 200ms
```

#### 大数据量测试
```sql
-- 插入测试数据（在 Railway PostgreSQL 中）
-- 生成 1000 条测试对话

INSERT INTO ai_conversations (session_id, user_name, user_email, intent_score, priority, message_count)
SELECT 
    'session_' || i,
    'User ' || i,
    'user' || i || '@example.com',
    floor(random() * 100)::int,
    (ARRAY['low', 'medium', 'high', 'urgent'])[floor(random() * 4 + 1)::int],
    floor(random() * 50 + 1)::int
FROM generate_series(1, 1000) AS i;

-- 检查性能
EXPLAIN ANALYZE
SELECT * FROM high_intent_conversations
WHERE intent_score >= 60
ORDER BY intent_score DESC
LIMIT 20;
```

---

### ✅ 6. 移动端响应式测试

#### 设备测试
- [ ] iPhone (375x667)
- [ ] iPad (768x1024)
- [ ] Desktop (1920x1080)

#### 页面测试
- [ ] Dashboard 响应式
- [ ] 产品列表响应式
- [ ] 表格在小屏幕上的显示
- [ ] 表单在移动端的输入

---

### ✅ 7. 浏览器兼容性测试

#### 浏览器矩阵
- [ ] Chrome (最新)
- [ ] Firefox (最新)
- [ ] Safari (最新)
- [ ] Edge (最新)

#### 功能测试
- [ ] 页面加载正常
- [ ] 表格排序功能
- [ ] 表单提交功能
- [ ] 文件上传功能

---

### ✅ 8. 错误处理测试

#### 常见错误场景

1. **网络错误**
   - [ ] 断网后重试
   - [ ] 显示友好错误提示

2. **API 错误**
   - [ ] 404 Not Found
   - [ ] 500 Internal Server Error
   - [ ] 401 Unauthorized

3. **表单验证**
   - [ ] 必填字段为空
   - [ ] 邮箱格式错误
   - [ ] 数字格式错误

---

## 📊 测试结果记录

### 测试报告模板

```markdown
## 测试报告

**测试日期**: 2026-03-28
**测试人员**: [姓名]
**环境**: [本地/生产]

### 通过的测试
- [ ] Dashboard 页面
- [ ] 产品管理
- [ ] 批量上传
- [ ] AI 对话管理
- [ ] 客户需求管理

### 发现的问题
1. [问题描述]
   - 严重程度：[高/中/低]
   - 重现步骤：[...]
   - 预期结果：[...]

### 性能指标
- API 响应时间：___ ms
- 页面加载时间：___ s
- 并发用户数：___

### 建议改进
1. [改进建议]
```

---

## 🚀 自动化测试（可选）

### 使用 Postman 测试 API

1. **导入集合**
   - 创建 Postman Collection
   - 添加所有 API 端点

2. **设置环境变量**
   ```
   baseUrl: https://your-project.railway.app
   ```

3. **运行测试**
   - 使用 Collection Runner
   - 批量执行所有测试

### 使用 Playwright 测试前端

```typescript
// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('Dashboard loads correctly', async ({ page }) => {
  await page.goto('http://localhost:5175');
  
  // Check stat cards
  await expect(page.locator('text=商品总数')).toBeVisible();
  await expect(page.locator('text=订单总数')).toBeVisible();
  
  // Check quick actions
  await expect(page.locator('text=批量上传')).toBeVisible();
});

test('Navigate to bulk upload', async ({ page }) => {
  await page.goto('http://localhost:5175');
  await page.click('text=批量上传');
  await expect(page).toHaveURL('/products/bulk-upload');
});
```

---

## 📞 问题反馈

如发现问题，请记录：

1. **问题描述**
2. **重现步骤**
3. **预期结果**
4. **实际结果**
5. **截图/日志**
6. **环境信息**（浏览器、OS 等）

---

**测试版本**: 1.0  
**最后更新**: 2026-03-28  
**项目**: machrio-admin
