# 快速开始指南

## 海外银行账户管理

### ✅ 立即可用

银行账户管理功能已经完整实现，可以立即使用。

#### 使用步骤

1. **登录后台管理系统**
   - 访问：http://localhost:5174（开发环境）
   - 或：https://your-admin-domain.com（生产环境）

2. **导航到银行账户页面**
   - 点击左侧菜单：**系统设置** → **银行账户**
   - 或直接访问：http://localhost:5174/bank-accounts

3. **添加银行账户**
   - 点击 **"添加银行账户"** 按钮
   - 选择国家（美国、英国、德国等）
   - 填写银行信息：
     - 银行名称
     - 账户名称
     - 账号
     - 币种
     - SWIFT 代码
     - 国家特定字段（Routing Number、Sort Code、IBAN 等）
   - 点击 **"保存"**

4. **批量导入（可选）**
   ```bash
   # 编辑 SQL 脚本，填入实际的银行账户信息
   vim import-bank-accounts.sql
   
   # 连接到数据库并执行
   psql -h <host> -U <user> -d <database> -f import-bank-accounts.sql
   ```

---

## AI 对话记录管理

### 📋 实施步骤

#### 第一步：运行数据库迁移

```bash
# 1. 连接到 Railway PostgreSQL 数据库
# 可以通过 Railway CLI 或数据库客户端

# 2. 运行迁移脚本
psql -h <host> -U <user> -d <database> -f backend/migrations/V005__create_ai_conversations_tables.sql

# 3. 验证表创建成功
psql -h <host> -U <user> -d <database> -c "\dt ai_conversations"
psql -h <host> -U <user> -d <database> -c "\dt conversation_messages"
psql -h <host> -U <user> -d <database> -c "\dt customer_requirements"
```

#### 第二步：开发后端 API

需要创建以下 Java 类：

1. **Entity 类**
   ```bash
   # 创建位置
   backend/machrio-api/src/main/java/com/machrio/admin/entity/
   
   # 需要创建的类
   - AIConversation.java
   - ConversationMessage.java
   - CustomerRequirement.java
   - ConversationAnalytics.java
   ```

2. **DTO 类**
   ```bash
   # 创建位置
   backend/machrio-api/src/main/java/com/machrio/admin/dto/
   
   # 需要创建的类
   - AIConversationDTO.java
   - CreateConversationRequest.java
   - ConversationMessageDTO.java
   - CustomerRequirementDTO.java
   - AnalysisResult.java
   ```

3. **Repository 接口**
   ```bash
   # 创建位置
   backend/machrio-api/src/main/java/com/machrio/admin/repository/
   
   # 需要创建的接口
   - AIConversationRepository.java
   - ConversationMessageRepository.java
   - CustomerRequirementRepository.java
   ```

4. **Service 类**
   ```bash
   # 创建位置
   backend/machrio-api/src/main/java/com/machrio/admin/service/
   
   # 需要创建的类
   - AIConversationService.java
   - CustomerRequirementService.java
   - AIAnalysisService.java
   ```

5. **Controller 类**
   ```bash
   # 创建位置
   backend/machrio-api/src/main/java/com/machrio/admin/controller/
   
   # 需要创建的类
   - AIConversationController.java
   - CustomerRequirementController.java
   ```

#### 第三步：测试后端 API

```bash
# 1. 启动后端服务
cd backend
./gradlew :machrio-api:bootRun

# 2. 测试 API（使用 curl 或 Postman）
# 创建对话
curl -X POST http://localhost:8080/api/ai-conversations \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test_001",
    "userName": "Test User",
    "userEmail": "test@example.com",
    "conversationType": "product_inquiry",
    "messages": []
  }'

# 获取对话列表
curl http://localhost:8080/api/ai-conversations

# 获取对话详情
curl http://localhost:8080/api/ai-conversations/{id}

# 获取对话消息
curl http://localhost:8080/api/ai-conversations/{id}/messages
```

#### 第四步：前端配置

1. **更新菜单**
   
   编辑 `frontend/src/components/Layout.tsx`，添加菜单项：
   
   ```typescript
   {
     key: 'ai-analytics',
     label: 'AI 分析',
     icon: <RobotOutlined />,
     children: [
       { key: '/ai-conversations', label: '对话记录' },
       { key: '/customer-requirements', label: '客户需求' },
     ],
   }
   ```

2. **测试前端页面**
   ```bash
   # 启动前端服务
   cd frontend
   npm run dev
   
   # 访问页面
   # AI 对话列表：http://localhost:5174/ai-conversations
   # 客户需求管理：http://localhost:5174/customer-requirements
   ```

#### 第五步：网站前台集成

在网站前台的 AI 助手组件中添加对话保存功能：

```javascript
// machrio.com 网站的 AI 助手组件
import { useEffect } from 'react';

function AIChatWidget() {
  const [messages, setMessages] = useState([]);
  
  // 保存对话到后台
  const saveConversation = async () => {
    try {
      const response = await fetch('https://admin-api.machrio.com/api/ai-conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: generateSessionId(),
          messages: messages,
          user: getCurrentUser(),
          source: window.location.href,
          metadata: {
            userAgent: navigator.userAgent,
            referrer: document.referrer,
          }
        })
      });
      
      const result = await response.json();
      console.log('Conversation saved:', result);
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };
  
  // 在对话结束时自动保存
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messages.length > 0) {
        saveConversation();
      }
    }, 30000); // 30 秒后保存
    
    return () => clearTimeout(timer);
  }, [messages]);
  
  return (
    // AI 助手 UI 组件
  );
}
```

---

## 验证和测试

### 银行账户管理

```bash
# 验证数据库表
psql -h <host> -U <user> -d <database> -c "SELECT * FROM bank_accounts LIMIT 5;"

# 验证 API
curl http://localhost:8080/api/bank-accounts
```

### AI 对话管理

```bash
# 验证数据库表
psql -h <host> -U <user> -d <database> -c "SELECT * FROM ai_conversations LIMIT 5;"
psql -h <host> -U <user> -d <database> -c "SELECT * FROM high_intent_conversations;"

# 验证 API（后端开发完成后）
curl http://localhost:8080/api/ai-conversations
curl http://localhost:8080/api/customer-requirements
```

---

## 常见问题

### Q1: 数据库迁移失败怎么办？

```bash
# 检查数据库连接
psql -h <host> -U <user> -d <database> -c "\dt"

# 查看已执行的迁移
psql -h <host> -U <user> -d <database> -c "SELECT * FROM schema_version ORDER BY installed_on DESC;"

# 手动执行迁移脚本
psql -h <host> -U <user> -d <database> -f backend/migrations/V005__create_ai_conversations_tables.sql
```

### Q2: 前端页面显示 404？

确保路由已正确配置：
1. 检查 `App.tsx` 中是否添加了对应的 Route
2. 检查组件文件路径是否正确
3. 重启开发服务器

### Q3: 如何测试 AI 对话功能？

可以使用测试数据：
```sql
-- 插入测试对话
INSERT INTO ai_conversations (
    session_id, user_name, user_email,
    conversation_type, intent_score, priority,
    message_count
) VALUES (
    'test_session_001',
    'Test User',
    'test@example.com',
    'product_inquiry',
    75,
    'high',
    5
);
```

---

## 相关文档

- [银行账户导入指南](./BANK-ACCOUNTS-IMPORT.md)
- [AI 对话管理设计](./AI-CONVERSATION-MANAGEMENT.md)
- [实施总结](./BANK-ACCOUNTS-AND-AI-CONVERSATIONS-SUMMARY.md)
- [数据库迁移脚本](./backend/migrations/)

---

## 下一步

### 银行账户管理
- [ ] 收集实际的海外银行账户信息
- [ ] 使用 SQL 脚本或后台界面导入数据
- [ ] 验证数据准确性

### AI 对话管理
- [ ] 运行数据库迁移
- [ ] 开发后端 API（Entity、Repository、Service、Controller）
- [ ] 测试后端 API
- [ ] 更新前端菜单配置
- [ ] 网站前台集成
- [ ] 测试和优化

---

## 技术支持

如有问题，请参考详细文档或联系开发团队。
