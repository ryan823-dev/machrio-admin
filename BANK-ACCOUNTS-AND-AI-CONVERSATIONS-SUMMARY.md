# 海外银行账户和 AI 对话管理系统实施总结

## 概述

本文档总结了两个核心需求的实施方案：
1. **海外银行账户管理** - 将 machrio.com 网站的海外银行账户信息存储到后台
2. **AI 对话记录管理** - 存档和展示网站前台 AI 助手的对话记录和客户需求

---

## 第一部分：海外银行账户管理

### ✅ 已完成的工作

#### 1. 数据库支持
- **文件**: `backend/migrations/V004__create_bank_accounts_table.sql`
- **状态**: ✅ 已存在
- **功能**: 支持 10 个国家的银行账户存储

#### 2. 后端 API
- **Controller**: `BankAccountController.java`
- **Service**: `BankAccountService.java`
- **Repository**: `BankAccountRepository.java`
- **状态**: ✅ 已实现

#### 3. 前端管理界面
- **文件**: `frontend/src/pages/BankAccountsPage.tsx`
- **状态**: ✅ 已实现
- **功能**:
  - 银行账户列表展示
  - 按国家筛选
  - 创建/编辑/删除账户
  - 支持不同国家的特定字段（Routing Number, Sort Code, IBAN 等）

#### 4. 数据导入工具
- **文档**: `BANK-ACCOUNTS-IMPORT.md`
- **SQL 脚本**: `import-bank-accounts.sql`
- **功能**:
  - 三种导入方法（手动、SQL 批量、API 脚本）
  - 支持 10 个国家
  - 数据验证规则
  - 安全提示

### 📊 支持的国家和银行字段

| 国家 | 必需字段 | 可选字段 |
|------|----------|----------|
| 🇺🇸 美国 | Routing Number (9 位) | SWIFT |
| 🇬🇧 英国 | Sort Code (6 位) | SWIFT, IBAN |
| 🇩🇪 德国 | IBAN | Local Bank Code, SWIFT |
| 🇫🇷 法国 | IBAN | Local Bank Code, SWIFT |
| 🇮🇹 意大利 | IBAN | Local Bank Code, SWIFT |
| 🇪🇸 西班牙 | IBAN | Local Bank Code, SWIFT |
| 🇨🇦 加拿大 | Local Bank Code | SWIFT |
| 🇦🇺 澳大利亚 | BSB Number | SWIFT |
| 🇯🇵 日本 | Local Bank Code | SWIFT |
| 🇨🇳 中国 | Local Bank Code | SWIFT |

### 🚀 使用方法

#### 方法一：通过后台界面添加
1. 登录后台 → 系统设置 → 银行账户
2. 点击"添加银行账户"
3. 选择国家，填写银行信息
4. 保存

#### 方法二：使用 SQL 脚本导入
```bash
# 编辑 SQL 脚本，填入实际的银行账户信息
vim import-bank-accounts.sql

# 执行导入
psql -h <host> -U <user> -d <database> -f import-bank-accounts.sql
```

#### 方法三：通过 API 批量导入
```bash
# 准备 JSON 数据
cat > bank-accounts-data.json <<EOF
{
  "accounts": [
    {
      "country": "US",
      "bankName": "JPMorgan Chase Bank",
      "accountName": "Machrio Inc.",
      "accountNumber": "123456789012",
      "currency": "USD",
      "swiftCode": "CHASUS33",
      "routingNumber": "021000021"
    }
  ]
}
EOF

# 使用 curl 导入
curl -X POST https://admin-api.machrio.com/api/bank-accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d @bank-accounts-data.json
```

---

## 第二部分：AI 对话记录管理系统

### ✅ 已完成的工作

#### 1. 数据库设计
- **文件**: `backend/migrations/V005__create_ai_conversations_tables.sql`
- **表结构**:
  - `ai_conversations` - 对话记录主表
  - `conversation_messages` - 对话消息表
  - `customer_requirements` - 客户需求表
  - `conversation_analytics` - 对话分析表
  - `high_intent_conversations` - 高意向客户视图
  - `pending_follow_ups` - 待跟进对话视图

#### 2. 核心功能

##### AI 对话记录 (ai_conversations)
- 会话 ID 和用户信息
- 对话来源和类型
- AI 分析结果（意向分数、优先级、提取的需求）
- 产品兴趣和预算范围
- 跟进管理和转化追踪

##### 对话消息 (conversation_messages)
- 完整的对话时间线
- 用户/AI 消息内容
- AI 模型和 token 使用统计
- 上下文和附件

##### 客户需求 (customer_requirements)
- 客户基本信息
- 需求类型和产品
- 数量、预算、时间要求
- 技术规格和物流信息
- 优先级和状态追踪
- 转化管理

#### 3. 前端管理界面

##### AI 对话列表页
- **文件**: `frontend/src/pages/AIConversationsPage.tsx`
- **功能**:
  - 对话列表展示
  - 意向度评分可视化（🔥极高、🔥高、⚡中等、💤低）
  - 优先级标签
  - 统计卡片（总对话数、高意向客户、待跟进、已转化）
  - 筛选器（状态、优先级、搜索）
  - 对话详情抽屉（用户信息、AI 分析、对话记录时间线）

##### 客户需求管理页
- **文件**: `frontend/src/pages/CustomerRequirementsPage.tsx`
- **功能**:
  - 需求卡片展示
  - 客户信息、需求详情、评估分数
  - 状态管理（新需求→已联系→已确认→已报价→谈判中→成交/丢失）
  - 紧急度标识（🔥立即、⏰本周、📅本月、✓灵活）
  - 统计卡片（总需求、新需求、高意向、已成交）

### 📊 数据模型

#### 对话记录字段
```typescript
interface AIConversation {
  id: string;
  sessionId: string;
  userName?: string;
  userEmail?: string;
  userCompany?: string;
  intentScore: number;        // 0-100
  priority: 'low'|'medium'|'high'|'urgent';
  productInterests?: string[];
  budgetRange?: string;
  purchaseTimeline?: string;
  messageCount: number;
  followUpStatus: string;
  status: 'active'|'archived'|'converted';
}
```

#### 客户需求字段
```typescript
interface CustomerRequirement {
  id: string;
  customerName?: string;
  customerEmail?: string;
  companyName?: string;
  requirementType: string;
  productNames?: string[];
  quantity?: number;
  totalBudget?: string;
  urgency: 'immediate'|'this_week'|'this_month'|'flexible';
  priority: string;
  status: 'new'|'contacted'|'qualified'|'quoted'|'negotiating'|'won'|'lost';
  confidenceScore: number;    // 0-100
  leadScore: number;          // 0-100
}
```

### 🎯 AI 需求提取规则

#### 意向度评分算法
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

### 🚀 集成方案

#### 网站前台集成
```javascript
// 在 AI 助手组件中
async function saveConversation(messages, user) {
  const response = await fetch('https://admin-api.machrio.com/api/ai-conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: generateSessionId(),
      messages: messages,
      user: user,
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

#### 后端 API
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
    
    @GetMapping("/{id}")
    public ResponseEntity<AIConversation> getConversation(
        @PathVariable String id) {
        return ResponseEntity.ok(conversationService.getById(id));
    }
    
    @PostMapping("/{id}/analyze")
    public ResponseEntity<AnalysisResult> analyzeConversation(
        @PathVariable String id) {
        AnalysisResult result = aiService.analyze(id);
        return ResponseEntity.ok(result);
    }
}
```

### 📈 数据分析功能

#### 统计查询
```sql
-- 高意向客户列表
SELECT * FROM high_intent_conversations;

-- 待跟进对话
SELECT * FROM pending_follow_ups;

-- 对话趋势
SELECT 
    DATE(created_at) as date,
    COUNT(*) as conversation_count,
    AVG(intent_score) as avg_intent_score
FROM ai_conversations
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 转化统计
SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM ai_conversations
GROUP BY status;
```

---

## 第三部分：下一步实施计划

### Phase 1: 数据库迁移（1-2 天）
- [ ] 运行 V005 迁移脚本创建 AI 对话表
- [ ] 测试数据库连接
- [ ] 验证视图和触发器

### Phase 2: 后端 API 开发（3-5 天）
- [ ] 创建 Entity 类
- [ ] 创建 Repository 接口
- [ ] 创建 DTO 类
- [ ] 实现 Controller
- [ ] 实现 Service 业务逻辑
- [ ] AI 需求提取服务
- [ ] 单元测试

### Phase 3: 前端集成（2-3 天）
- [ ] 更新路由配置
- [ ] 添加菜单项
- [ ] API 服务调用
- [ ] 页面测试和优化

### Phase 4: 网站前台集成（2-3 天）
- [ ] AI 助手组件修改
- [ ] 对话保存逻辑
- [ ] 实时同步
- [ ] 测试和调试

### Phase 5: 测试和部署（1-2 天）
- [ ] 功能测试
- [ ] 性能测试
- [ ] 安全测试
- [ ] 部署上线

---

## 安全考虑

### 银行账户信息
- ⚠️ **不要在代码仓库存储真实账号**
- 使用环境变量存储敏感信息
- 数据库加密存储
- 访问权限控制
- 操作审计日志

### AI 对话数据
- 用户隐私保护
- 敏感信息脱敏
- GDPR 合规
- 数据保留策略（建议保留 6-12 个月）
- 访问权限分级

---

## 文件清单

### 已创建文件

1. ✅ `BANK-ACCOUNTS-IMPORT.md` - 银行账户导入指南
2. ✅ `import-bank-accounts.sql` - SQL 导入脚本模板
3. ✅ `AI-CONVERSATION-MANAGEMENT.md` - AI 对话管理设计文档
4. ✅ `backend/migrations/V005__create_ai_conversations_tables.sql` - 数据库迁移
5. ✅ `frontend/src/pages/AIConversationsPage.tsx` - AI 对话列表页
6. ✅ `frontend/src/pages/CustomerRequirementsPage.tsx` - 客户需求管理页
7. ✅ `BANK-ACCOUNTS-AND-AI-CONVERSATIONS-SUMMARY.md` - 总结文档（本文件）

### 待创建文件

1. ⏳ `backend/.../entity/AIConversation.java`
2. ⏳ `backend/.../entity/ConversationMessage.java`
3. ⏳ `backend/.../entity/CustomerRequirement.java`
4. ⏳ `backend/.../repository/AIConversationRepository.java`
5. ⏳ `backend/.../service/AIConversationService.java`
6. ⏳ `backend/.../controller/AIConversationController.java`
7. ⏳ `backend/.../dto/` 相关 DTO 类

---

## 总结

### 海外银行账户管理
- ✅ 数据库表已存在
- ✅ 后端 API 已实现
- ✅ 前端界面已完成
- ✅ 导入工具已准备
- **下一步**: 收集实际的银行账户信息并导入

### AI 对话记录管理
- ✅ 数据库设计完成
- ✅ 前端界面完成
- ⏳ 后端 API 待开发
- ⏳ 网站前台集成待实施
- **下一步**: 开发后端 API 和 Service

### 预期效果

#### 银行账户管理
- 运营人员可以在后台轻松管理所有海外银行账户
- 支持 10 个国家的不同银行字段要求
- 批量导入功能节省时间

#### AI 对话管理
- 完整保存所有 AI 对话记录
- 自动提取客户需求和意向
- 智能评分和优先级排序
- 销售团队可以高效跟进高意向客户
- 数据分析和转化追踪
- 持续优化 AI 助手表现

---

## 联系和支持

如有问题或需要进一步的技术支持，请参考相关文档或联系开发团队。
