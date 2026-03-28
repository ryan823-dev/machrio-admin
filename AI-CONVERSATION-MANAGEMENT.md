# AI 对话记录管理系统

## 概述

本系统用于存储和展示 machrio.com 网站前台 AI 助手与用户的对话记录，以及从对话中提取的客户需求和意向。

## 功能特性

### 1. 对话记录存储
- 完整的对话历史
- 用户信息关联
- 对话时间线
- 对话来源页面
- 对话类型（产品咨询、技术支持、销售询价等）

### 2. 客户需求提取
- AI 自动提取关键需求
- 产品意向
- 预算范围
- 采购时间
- 联系方式
- 优先级评分

### 3. 数据分析
- 对话统计
- 转化率分析
- 热门产品
- 客户意向分布

## 数据库设计

### AI_Conversations 表

```sql
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100),
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    user_phone VARCHAR(50),
    user_company VARCHAR(255),
    
    -- 对话信息
    source_page VARCHAR(255),
    source_url TEXT,
    conversation_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    
    -- AI 分析结果
    intent_score INTEGER DEFAULT 0,
    priority VARCHAR(20) DEFAULT 'medium',
    extracted_needs JSONB,
    product_interests TEXT[],
    budget_range VARCHAR(100),
    purchase_timeline VARCHAR(100),
    
    -- 对话内容
    message_count INTEGER DEFAULT 0,
    first_message_at TIMESTAMP WITH TIME ZONE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    
    -- 跟进信息
    assigned_to VARCHAR(100),
    follow_up_status VARCHAR(50) DEFAULT 'pending',
    follow_up_notes TEXT,
    converted_to_customer BOOLEAN DEFAULT FALSE,
    customer_id UUID,
    
    -- 元数据
    metadata JSONB,
    tags TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Conversation_Messages 表

```sql
CREATE TABLE conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    
    -- 消息内容
    message_type VARCHAR(20) NOT NULL, -- 'user' | 'assistant' | 'system'
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text', -- 'text' | 'structured'
    
    -- AI 相关
    ai_model VARCHAR(100),
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    
    -- 上下文
    context_data JSONB,
    attachments JSONB,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Customer_Requirements 表

```sql
CREATE TABLE customer_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    
    -- 客户信息
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    company_name VARCHAR(255),
    job_title VARCHAR(100),
    
    -- 需求信息
    requirement_type VARCHAR(50),
    product_category VARCHAR(100),
    product_names TEXT[],
    quantity INTEGER,
    unit_price_range VARCHAR(100),
    total_budget VARCHAR(100),
    
    -- 时间信息
    required_date DATE,
    purchase_timeline VARCHAR(100),
    urgency VARCHAR(20),
    
    -- 技术规格
    specifications JSONB,
    quality_requirements TEXT,
    certification_requirements TEXT[],
    
    -- 物流信息
    shipping_address TEXT,
    shipping_method VARCHAR(100),
    incoterms VARCHAR(50),
    
    -- 付款信息
    payment_terms VARCHAR(100),
    payment_method VARCHAR(100),
    
    -- 优先级和状态
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'new',
    confidence_score INTEGER DEFAULT 0,
    
    -- 跟进
    assigned_to VARCHAR(100),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## API 设计

### 对话管理 API

```
GET    /api/ai-conversations              # 获取对话列表
GET    /api/ai-conversations/:id          # 获取对话详情
POST   /api/ai-conversations              # 创建对话
PUT    /api/ai-conversations/:id          # 更新对话
DELETE /api/ai-conversations/:id          # 删除对话
GET    /api/ai-conversations/:id/messages # 获取对话消息
POST   /api/ai-conversations/:id/messages # 添加消息

# 统计和分析
GET    /api/ai-conversations/stats/summary       # 统计摘要
GET    /api/ai-conversations/stats/trends        # 趋势分析
GET    /api/ai-conversations/stats/conversion    # 转化分析

# 需求管理
GET    /api/customer-requirements         # 获取需求列表
GET    /api/customer-requirements/:id     # 获取需求详情
PUT    /api/customer-requirements/:id     # 更新需求
POST   /api/customer-requirements/:id/assign # 分配需求
```

## 前端页面设计

### 1. AI 对话列表页
- 对话列表（表格形式）
- 筛选器（状态、优先级、时间范围）
- 搜索功能
- 批量操作

### 2. 对话详情页
- 对话时间线视图
- 用户信息卡片
- AI 分析结果
- 提取的需求列表
- 跟进操作

### 3. 客户需求管理页
- 需求卡片展示
- 优先级标识
- 进度跟踪
- 分配和跟进

### 4. 数据分析仪表板
- 对话趋势图
- 转化率统计
- 热门产品
- 意向分布

## AI 需求提取规则

### 关键信息识别

```javascript
const extractionRules = {
  // 联系信息
  contactInfo: {
    name: /我叫 (.+?) [,.]/i,
    email: /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i,
    phone: /(\+?[\d\s-]{10,})/i,
    company: /公司是 (.+?)[,.]/i,
  },
  
  // 需求信息
  requirements: {
    product: /需要 (.+?) 产品/i,
    quantity: /数量 [：:]\s*(\d+)/i,
    budget: /预算 [：:]\s*([\d,]+[万百万千万亿]?)?/i,
    timeline: /期望 [交收货] 时间 [：:]\s*(.+)/i,
  },
  
  // 意向强度
  intent: {
    high: /尽快 | 马上 | 急 | 今天 | 本周/i,
    medium: /最近 | 近期 | 这个月/i,
    low: /先看看 | 了解一下 | 以后/i,
  }
};
```

### 优先级评分算法

```javascript
function calculateIntentScore(conversation) {
  let score = 0;
  
  // 联系信息完整度 (0-30 分)
  if (conversation.user_email) score += 15;
  if (conversation.user_phone) score += 10;
  if (conversation.user_company) score += 5;
  
  // 需求明确度 (0-40 分)
  if (conversation.product_interests?.length > 0) score += 20;
  if (conversation.budget_range) score += 10;
  if (conversation.purchase_timeline) score += 10;
  
  // 时间紧迫性 (0-30 分)
  const timeline = conversation.purchase_timeline;
  if (/尽快 | 马上 | 急/i.test(timeline)) score += 30;
  else if (/最近 | 近期/i.test(timeline)) score += 20;
  else if (/这个月/i.test(timeline)) score += 10;
  
  return score;
}
```

## 集成方案

### 前端集成（网站前台）

```javascript
// 在网站前台 AI 助手组件中
async function saveConversation(data) {
  const response = await fetch('https://admin-api.machrio.com/api/ai-conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: generateSessionId(),
      messages: data.messages,
      user: data.user,
      source: window.location.href,
      metadata: {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      }
    })
  });
  return response.json();
}
```

### 后端集成（后台 API）

```java
// Spring Boot Controller
@RestController
@RequestMapping("/api/ai-conversations")
public class AIConversationController {
    
    @PostMapping
    public ResponseEntity<AIConversation> createConversation(
        @RequestBody CreateConversationRequest request) {
        AIConversation conversation = conversationService.create(request);
        return ResponseEntity.ok(conversation);
    }
    
    @PostMapping("/{id}/analyze")
    public ResponseEntity<AnalysisResult> analyzeConversation(
        @PathVariable String id) {
        AnalysisResult result = aiService.analyze(id);
        return ResponseEntity.ok(result);
    }
}
```

## 实施步骤

### Phase 1: 数据库和 API
1. 创建数据库迁移脚本
2. 实现后端 API
3. 测试 API 功能

### Phase 2: 后台管理界面
1. 创建对话列表页
2. 创建对话详情页
3. 创建需求管理页

### Phase 3: 数据分析
1. 实现统计 API
2. 创建数据分析仪表板
3. 添加导出功能

### Phase 4: 前台集成
1. 网站前台集成对话保存
2. 实现实时同步
3. 测试和优化

## 安全考虑

- 对话数据加密存储
- 敏感信息脱敏
- 访问权限控制
- GDPR 合规
- 数据保留策略
