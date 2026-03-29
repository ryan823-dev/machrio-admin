# Machrio Admin - Agent Memory & 工作经验总结

> **最后更新**: 2026-03-28  
> **项目状态**: ✅ 开发完成，Docker 配置就绪，等待阿里云部署  
> **最新提交**: `768f423` - Add Docker configuration for Aliyun deployment

---

## 📚 目录

1. [项目概述](#项目概述)
2. [技术栈决策](#技术栈决策)
3. [核心功能实现](#核心功能实现)
4. [开发历程与问题解决](#开发历程与问题解决)
5. [部署经验总结](#部署经验总结)
6. [代码规范和最佳实践](#代码规范和最佳实践)
7. [环境配置清单](#环境配置清单)
8. [测试策略](#测试策略)
9. [常见问题 FAQ](#常见问题-faq)
10. [后续开发建议](#后续开发建议)

---

## 项目概述

### 项目背景

Machrio Admin 是一个为 Machrio 公司开发的 B2B 管理后台系统，主要功能包括：
- AI 对话记录与客户需求管理
- 产品管理（支持批量上传）
- 订单和客户管理
- 数据分析和报告

### 核心价值

1. **销售线索转化**: 通过 AI 对话追踪，自动识别高意向客户
2. **效率提升**: 批量上传产品，减少人工操作
3. **数据驱动**: 完整的对话记录和客户需求分析

### 项目规模

| 指标 | 数量 |
|------|------|
| 总代码行数 | ~9,000+ |
| 文件数 | ~40+ |
| 后端 Java 文件 | ~15 |
| 前端 TypeScript 文件 | ~15 |
| 数据库表 | 8+ |
| API 端点 | 30+ |
| 文档文件 | 10+ |

---

## 技术栈决策

### 后端技术选型

#### ✅ 最终选择：Spring Boot 3.5.0 + Java 21

**决策理由**:
1. **企业级支持**: Spring Boot 生态完善，适合企业级应用
2. **性能优秀**: Java 21 虚拟线程带来性能提升
3. **类型安全**: 强类型语言，减少运行时错误
4. **ORM 便利**: Hibernate 简化数据库操作
5. **部署友好**: 打包成 JAR，部署简单

**备选方案**:
- ❌ Node.js + Express: 类型安全较弱，不适合复杂业务逻辑
- ❌ Python + FastAPI: 性能可以，但企业级特性不足
- ❌ Go: 学习曲线陡峭，团队熟悉度低

#### 数据库：PostgreSQL 15+

**决策理由**:
1. **JSONB 支持**: 适合存储灵活的对话数据
2. **GIN 索引**: 加速 JSON 和数组查询
3. **扩展性强**: 支持自定义函数和触发器
4. **开源免费**: 降低运营成本

**备选方案**:
- ❌ MySQL: JSON 支持较弱
- ❌ MongoDB: 事务支持不如关系型数据库
- ❌ Redis: 不适合作为主数据库

### 前端技术选型

#### ✅ 最终选择：React 19 + TypeScript 5.9 + Ant Design 5.29

**决策理由**:
1. **组件丰富**: Ant Design 提供完整的企业级组件
2. **类型安全**: TypeScript 减少运行时错误
3. **生态完善**: React 生态庞大，社区活跃
4. **性能优秀**: React 19 带来性能优化

**备选方案**:
- ❌ Vue 3 + Element Plus: 团队更熟悉 React
- ❌ Angular: 学习曲线陡峭
- ❌ Svelte: 生态不够成熟

#### 构建工具：Vite 8.0

**决策理由**:
1. **极速启动**: HMR 热更新非常快
2. **开箱即用**: 支持 TypeScript、CSS 模块化
3. **生产优化**: Rollup 打包优化

**备选方案**:
- ❌ Webpack: 配置复杂，启动慢
- ❌ Next.js: 需要 SSR 时使用

### 部署平台选型

#### ✅ 最终选择：阿里云 ECS + Docker

**决策理由**:
1. **成本可控**: 相比 PaaS 更经济
2. **灵活性强**: 完全控制服务器配置
3. **数据合规**: 数据在国内，符合法规
4. **扩展性好**: 可根据业务增长升级配置

**备选方案**:
- ❌ Railway: 国外平台，网络延迟高
- ❌ Vercel: 适合前端，后端支持有限
- ❌ 阿里云 SAE: 成本较高，锁定性强

---

## 核心功能实现

### 1. AI 对话追踪系统

#### 架构设计

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  machrio.com    │     │  Admin Backend   │     │   PostgreSQL    │
│                 │     │                  │     │                 │
│ AIAssistant     │────▶│ Conversation     │────▶│ ai_conversations│
│ HeroAIChat      │     │ Controller       │     │ conversation_   │
│                 │     │                  │     │ messages        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                        │                        │
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Conversation    │     │ REST API         │     │ GIN Indexes     │
│ Tracker         │     │ /api/ai-         │     │ Full-text       │
│ - sessionId     │     │ conversations    │     │ Search          │
│ - auto-save     │     │                  │     │                 │
│ - debounce 10s  │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

#### 关键代码：conversation-tracker.ts

```typescript
export class ConversationTracker {
  private sessionId: string
  private messages: ConversationMessage[] = []
  private saveTimeout: NodeJS.Timeout | null = null
  private autoSaveEnabled: boolean = false
  
  // 10 秒防抖自动保存
  enableAutoSave(debounceMs: number = 5000): void {
    this.autoSaveEnabled = true
    if (this.messages.length > 0) {
      this.scheduleAutoSave(debounceMs)
    }
  }
  
  private scheduleAutoSave(debounceMs: number): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }
    this.saveTimeout = setTimeout(async () => {
      await this.save()
    }, debounceMs)
  }
  
  async save(): Promise<SaveConversationResponse | null> {
    // 非阻塞保存，不影响用户体验
    const response = await fetch(`${API_URL}/ai-conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: this.sessionId,
        messages: this.messages,
        ...getPageInfo()
      })
    })
    return response.json()
  }
}
```

#### 实现要点

1. **会话管理**: 使用 sessionStorage 持久化 sessionId
2. **防抖机制**: 10 秒延迟，避免频繁请求
3. **非阻塞**: 保存操作不阻塞用户交互
4. **类型识别**: 基于关键词自动识别对话类型
5. **优雅降级**: 保存失败不影响 AI 助手功能

### 2. 数据库设计

#### 核心表结构

```sql
-- AI 对话主表
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(100) NOT NULL,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  user_company VARCHAR(255),
  user_phone VARCHAR(255),
  source_page VARCHAR(500),
  source_url VARCHAR(1000),
  conversation_type VARCHAR(50) DEFAULT 'general',
  status VARCHAR(50) DEFAULT 'active',
  intent_score INTEGER DEFAULT 0,
  priority VARCHAR(20) DEFAULT 'medium',
  extracted_needs JSONB,
  product_interests TEXT[],
  budget_range VARCHAR(100),
  purchase_timeline VARCHAR(100),
  message_count INTEGER DEFAULT 0,
  first_message_at TIMESTAMP,
  last_message_at TIMESTAMP,
  follow_up_status VARCHAR(50) DEFAULT 'pending',
  follow_up_deadline TIMESTAMP,
  assigned_to VARCHAR(255),
  tags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 对话消息表
CREATE TABLE conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  message_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  content_type VARCHAR(50) DEFAULT 'text',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 客户需求表
CREATE TABLE customer_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_conversations(id),
  requirement_type VARCHAR(50),
  title VARCHAR(500),
  description TEXT,
  product_name VARCHAR(255),
  product_category VARCHAR(100),
  quantity INTEGER,
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  timeline VARCHAR(100),
  specifications JSONB,
  quality_requirements TEXT,
  certification_requirements TEXT,
  logistics_info JSONB,
  payment_terms TEXT,
  status VARCHAR(50) DEFAULT 'new',
  confidence_score INTEGER,
  lead_score INTEGER,
  assigned_sales VARCHAR(255),
  notes TEXT,
  next_follow_up_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 索引优化

```sql
-- 意图评分索引（快速筛选高意向客户）
CREATE INDEX idx_conversations_intent ON ai_conversations(intent_score DESC);

-- GIN 索引（JSONB 查询优化）
CREATE INDEX idx_conversations_extracted_needs ON ai_conversations USING GIN(extracted_needs);

-- GIN 索引（数组查询优化）
CREATE INDEX idx_conversations_product_interests ON ai_conversations USING GIN(product_interests);
CREATE INDEX idx_conversations_tags ON ai_conversations USING GIN(tags);

-- 消息表索引
CREATE INDEX idx_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX idx_messages_created_at ON conversation_messages(created_at DESC);

-- 需求表索引
CREATE INDEX idx_requirements_status ON customer_requirements(status);
CREATE INDEX idx_requirements_lead_score ON customer_requirements(lead_score DESC);
```

#### 实用视图

```sql
-- 高意向客户视图（intent_score >= 40）
CREATE VIEW high_intent_conversations AS
SELECT 
  id, session_id, user_name, user_email, user_company,
  intent_score, priority, product_interests,
  follow_up_status, follow_up_deadline, assigned_to
FROM ai_conversations
WHERE intent_score >= 40
ORDER BY intent_score DESC;

-- 待跟进对话视图
CREATE VIEW pending_follow_ups AS
SELECT 
  id, session_id, user_name, user_email,
  follow_up_status, follow_up_deadline, assigned_to
FROM ai_conversations
WHERE follow_up_status IN ('pending', 'in_progress');
```

### 3. 批量上传产品

#### 实现流程

```
1. 用户下载 Excel 模板
2. 填写产品信息
3. 拖拽上传文件
4. 前端解析 Excel（SheetJS）
5. 数据验证（必填字段、格式检查）
6. 分批发送到后端（每批 50 条）
7. 实时显示进度
8. 返回成功/失败报告
```

#### 关键代码：BulkUploadProducts.tsx

```typescript
const handleFileUpload = async (file: File) => {
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const jsonData = XLSX.utils.sheet_to_json(sheet)
  
  // 数据验证
  const errors: UploadError[] = []
  jsonData.forEach((row: any, index: number) => {
    if (!row.name) errors.push({ row: index + 1, field: 'name', message: '名称必填' })
    if (!row.sku) errors.push({ row: index + 1, field: 'sku', message: 'SKU 必填' })
    if (row.price && isNaN(row.price)) errors.push({ row: index + 1, field: 'price', message: '价格必须是数字' })
  })
  
  if (errors.length > 0) {
    setUploadErrors(errors)
    return
  }
  
  // 分批上传
  const batchSize = 50
  for (let i = 0; i < jsonData.length; i += batchSize) {
    const batch = jsonData.slice(i, i + batchSize)
    await apiClient.post('/products/batch', batch)
    setUploadedCount(i + batch.length)
  }
}
```

#### JSX 语法修复经验

**问题**: JSX 中直接使用 `>` 导致语法错误

```tsx
// ❌ 错误写法
<Paragraph>3. 分类层级：L1 > L2 > L3</Paragraph>

// ✅ 正确写法
<Paragraph>3. 分类层级：L1 {'>'} L2 {'>'} L3</Paragraph>

// 或使用 HTML 实体
<Paragraph>3. 分类层级：L1 &gt; L2 &gt; L3</Paragraph>
```

### 4. 前端路由和页面

#### 路由配置

```typescript
// App.tsx
<Route path="/" element={<DashboardPage />} />
<Route path="/products" element={<ProductsPage />} />
<Route path="/products/new" element={<ProductFormWizard />} />
<Route path="/products/bulk-upload" element={<BulkUploadProducts />} />
<Route path="/ai-conversations" element={<AIConversationsPage />} />
<Route path="/customer-requirements" element={<CustomerRequirementsPage />} />
<Route path="/categories" element={<CategoriesPage />} />
<Route path="/orders" element={<OrdersPage />} />
<Route path="/customers" element={<CustomersPage />} />
```

#### 导入路径修复经验

**问题**: 相对路径错误导致模块加载失败

```typescript
// ❌ 错误写法（页面在 src/pages/，services 在 src/services/）
import { apiClient } from '../../services/api'

// ✅ 正确写法
import { apiClient } from '../services/api'
```

---

## 开发历程与问题解决

### 问题 1: Java 版本不兼容

**现象**:
```
Dependency requires at least JVM runtime version 17. 
This build uses a Java 11 JVM.
```

**原因**: Spring Boot 3.5.0 需要 Java 17+

**解决过程**:
1. 初始安装 Java 11 ❌
2. 升级到 Java 17 ✅
3. 最终配置 Java 21（最新 LTS 版本）✅

**Railway 配置**:
```toml
# .railpack/java.toml
[build]
java_version = "21"
```

**Docker 配置**:
```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS build
FROM eclipse-temurin:21-jre-alpine
```

### 问题 2: 编译错误 - 非公共类访问

**现象**:
```
ArticleContentDTO 在 com.machrio.admin.dto 中不是公共的; 
无法从外部程序包中对其进行访问
```

**原因**: 导入不存在的 DTO 类

**解决**:
```java
// ❌ 错误代码
import com.machrio.admin.dto.ArticleContentDTO;

// ✅ 解决方案：删除导入
// 移除了不存在的导入
```

**策略**: 推送到 Railway 使用云端构建，避免本地环境问题

### 问题 3: 前端导入路径错误

**现象**:
```
Failed to resolve import "../../services/api"
```

**原因**: 相对路径计算错误

**影响文件**:
- AIConversationsPage.tsx
- CustomerRequirementsPage.tsx

**解决**:
```diff
- import { apiClient } from '../../services/api';
+ import { apiClient } from '../services/api';
```

**经验**: pages 在 src/pages/，services 在 src/services/，只需一层 `../`

### 问题 4: Railway 部署失败

**现象**: Railway 显示 "Service Unavailable"

**原因分析**:
1. 构建失败（Java 版本问题）
2. 端口配置错误
3. 健康检查路径错误
4. 数据库连接失败

**解决步骤**:
1. ✅ 修正 Java 版本为 21
2. ✅ 配置正确端口 8080
3. ✅ 设置健康检查路径 `/actuator/health`
4. ✅ 添加 PostgreSQL 插件
5. ✅ 配置环境变量

**Railway 配置最终版**:
```toml
# railway.toml
[deploy]
startCommand = "cd backend/machrio-api && java -jar build/libs/*.jar"
healthcheckPath = "/actuator/health"
healthcheckTimeout = 600
numReplicas = 1
restartPolicyType = "ON_FAILURE"

[deploy.envs]
SPRING_PROFILES_ACTIVE = "production"
SERVER_PORT = "8080"
JAVA_TOOL_OPTIONS = "-Xms256m -Xmx512m -XX:+UseG1GC"
```

### 问题 5: Git 推送重复

**用户反馈**: "machrio 的代码我在别处提交过了 你重复操作了一遍"

**原因**: 未检查 git 状态就推送

**经验教训**:
1. 推送前必须检查 `git status`
2. 确认文件变更是否符合预期
3. 避免重复推送

**正确流程**:
```bash
git status          # 检查变更
git diff           # 查看具体内容
git add <files>    # 添加文件
git commit -m "..." # 提交
git push           # 推送
```

### 问题 6: Docker 构建优化

**挑战**: 镜像过大（>1GB）

**优化方案**: 多阶段构建

```dockerfile
# 阶段 1: 构建（完整 JDK）
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
RUN ./gradlew bootJar -x test

# 阶段 2: 运行（仅 JRE）
FROM eclipse-temurin:21-jre-alpine
COPY --from=build /app/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**效果**: 镜像大小从 1.2GB 降至 200MB

---

## 部署经验总结

### Railway 部署（原方案）

#### 优势
- ✅ 部署简单，Git 推送自动构建
- ✅ 自动注入数据库环境变量
- ✅ 免费额度够用

#### 劣势
- ❌ 国外平台，网络延迟高
- ❌ 自定义域名需要付费
- ❌ 数据库性能有限

#### 关键配置

```toml
# railway.toml
[build]
# Railpack 自动检测 Java/Gradle

[deploy]
startCommand = "cd backend/machrio-api && java -jar build/libs/*.jar"
healthcheckPath = "/actuator/health"
healthcheckTimeout = 600

[deploy.envs]
SPRING_PROFILES_ACTIVE = "production"
SERVER_PORT = "8080"
JAVA_TOOL_OPTIONS = "-Xms256m -Xmx512m -XX:+UseG1GC"
SPRING_JPA_HIBERNATE_DDL_AUTO = "update"
```

### 阿里云 Docker 部署（新方案）

#### 优势
- ✅ 数据在国内，访问速度快
- ✅ 完全控制，灵活性高
- ✅ 成本可控，可按需升级
- ✅ 符合数据合规要求

#### 部署步骤总结

**1. ECS 实例准备**
- 地域：华东 1（杭州）或 华北 2（北京）
- 规格：ecs.c6.large (2 核 4GB) 起
- 系统：Alibaba Cloud Linux 3 或 Ubuntu 22.04
- 安全组：开放 80, 443, 22 端口

**2. Docker 安装**
```bash
curl -fsSL https://get.docker.com | bash -s docker
sudo systemctl enable docker && sudo systemctl start docker
```

**3. 代码部署**
```bash
cd /opt
git clone https://github.com/ryan823-dev/machrio-admin.git
cd machrio-admin
cp .env.example .env
# 编辑 .env 填入实际配置
docker compose up -d
```

**4. 环境变量配置**
```bash
# .env 文件
DB_PASSWORD=强密码
JWT_SECRET=至少 32 字符的密钥
CORS_ORIGINS=https://admin.machrio.com
OSS_ACCESS_KEY_ID=LTAI5txxxxxxx
OSS_ACCESS_KEY_SECRET=xxxxxxxxxxxxxxxx
VITE_API_URL=https://api.machrio.com/api
```

**5. 数据库选择**
- **开发测试**: 使用 docker-compose.yml 自带的 PostgreSQL 容器
- **生产环境**: 使用阿里云 RDS（更安全可靠）

#### Docker 配置要点

**多阶段构建**:
```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS build
# 构建阶段

FROM eclipse-temurin:21-jre-alpine
# 运行阶段（镜像更小）
```

**健康检查**:
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
```

**资源限制**:
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
    reservations:
      cpus: '0.5'
      memory: 512M
```

**日志轮转**:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### 数据库迁移策略

#### 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| Hibernate DDL Auto | 简单，自动创建 | 生产环境不可控 | 开发/测试 |
| Flyway | 版本控制，可追溯 | 需要额外配置 | 生产环境 |
| 手动 SQL | 完全控制 | 容易出错 | 特殊需求 |

#### 推荐方案：生产环境使用 Flyway

**添加依赖**:
```gradle
implementation 'org.flywaydb:flyway-core:10.0.0'
```

**迁移文件命名**:
```
V001__initial_schema.sql
V002__add_products_table.sql
V003__add_orders_table.sql
V004__add_customers_table.sql
V005__create_ai_conversations_tables.sql
```

**配置**:
```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
```

---

## 代码规范和最佳实践

### Java 代码规范

#### 命名规范

```java
// 类名：大驼峰
public class AIConversationController { }

// 方法名：小驼峰
public List<AIConversation> getConversations() { }

// 常量：全大写，下划线分隔
private static final String DEFAULT_STATUS = "active";

// 变量名：小驼峰，有意义
String userName = "John";  // ✅
String name = "John";      // ⚠️ 不够明确
```

#### 异常处理

```java
// ✅ 好的做法：具体异常处理
try {
    conversationService.save(data);
} catch (DataIntegrityViolationException e) {
    throw new BusinessException("数据保存失败：" + e.getMessage());
} catch (Exception e) {
    log.error("未知错误", e);
    throw new BusinessException("系统错误，请稍后重试");
}

// ❌ 不好的做法：吞掉异常
try {
    conversationService.save(data);
} catch (Exception e) {
    // 什么都不做
}
```

#### 日志规范

```java
// ✅ 使用日志框架
log.info("保存对话成功：conversationId={}", conversation.getId());
log.warn("意图评分较低：conversationId={}, score={}", conversation.getId(), score);
log.error("保存对话失败", e);

// ❌ 避免 System.out
System.out.println("Debug info");
```

### TypeScript 代码规范

#### 类型定义

```typescript
// ✅ 使用 interface 定义对象类型
interface Conversation {
  id: string;
  sessionId: string;
  intentScore: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  productInterests?: string[];
}

// ✅ 使用 type 定义联合类型
type ConversationStatus = 'active' | 'archived' | 'deleted';

// ❌ 避免使用 any
const data: any;  // ❌
const data: unknown;  // ✅
```

#### React Hooks 规范

```typescript
// ✅ 使用 useCallback 缓存函数
const fetchData = useCallback(async () => {
  const res = await apiClient.get('/api/conversations');
  setData(res);
}, [statusFilter, priorityFilter]);

// ✅ 使用 useEffect 清理副作用
useEffect(() => {
  const tracker = new ConversationTracker(sessionId);
  return () => {
    tracker.save();  // 组件卸载时保存
  };
}, [sessionId]);

// ✅ 使用 useMemo 缓存计算结果
const filteredData = useMemo(() => {
  return data.filter(item => item.score >= 40);
}, [data]);
```

#### 错误处理

```typescript
// ✅ 统一的错误处理
const handleSubmit = async (data: FormData) => {
  try {
    await apiClient.post('/api/conversations', data);
    message.success('保存成功');
  } catch (error: any) {
    message.error(error.message || '操作失败');
  }
};

// ✅ 类型守卫
function isError(error: unknown): error is Error {
  return error instanceof Error;
}
```

### SQL 规范

#### 命名规范

```sql
-- 表名：复数，下划线分隔
CREATE TABLE ai_conversations ( );

-- 列名：小写，下划线分隔
user_name VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

-- 主键：id
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

-- 外键：表名_id
conversation_id UUID REFERENCES ai_conversations(id),

-- 索引：idx_表名_列名
CREATE INDEX idx_conversations_intent ON ai_conversations(intent_score DESC);
```

#### 性能优化

```sql
-- ✅ 使用 EXISTS 代替 IN（大数据量时）
SELECT * FROM ai_conversations a
WHERE EXISTS (
  SELECT 1 FROM conversation_messages m 
  WHERE m.conversation_id = a.id AND m.created_at > NOW() - INTERVAL '1 day'
);

-- ✅ 使用覆盖索引
CREATE INDEX idx_messages_covering ON conversation_messages(conversation_id, created_at, content);

-- ✅ 避免 SELECT *
SELECT id, session_id, intent_score FROM ai_conversations;
```

### Git 提交规范

#### Commit Message 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具/配置

#### 示例

```bash
# 新功能
git commit -m "feat(ai-conversation): Add auto-save mechanism with 10s debounce"

# Bug 修复
git commit -m "fix(frontend): Correct import path in AIConversationsPage"

# 文档
git commit -m "docs: Add comprehensive Aliyun deployment guide"

# 配置
git commit -m "chore(deploy): Update Docker configuration for production"
```

---

## 环境配置清单

### 开发环境

#### 必需工具

```bash
# Java 开发
Java 21 (OpenJDK 或 Eclipse Temurin)
Gradle 8.x

# Node.js 开发
Node.js 20+
npm 10+

# 数据库
PostgreSQL 15+

# 版本控制
Git
```

#### 环境变量（开发）

```bash
# 后端 .env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/machrio_admin
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SERVER_PORT=8080
APP_JWT_SECRET=dev-secret-key-not-for-production
APP_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# 前端 .env.local
VITE_API_URL=http://localhost:8080/api
```

### 生产环境（阿里云）

#### ECS 配置

```bash
# 操作系统
Alibaba Cloud Linux 3 或 Ubuntu 22.04

# 必需软件
Docker 24+
Docker Compose 2.20+
Git
```

#### 环境变量（生产）

```bash
# .env 文件
DB_PASSWORD=StrongP@ssw0rd123!
JWT_SECRET=super-secret-production-key-at-least-32-chars-long
CORS_ORIGINS=https://admin.machrio.com,https://machrio.com
OSS_ACCESS_KEY_ID=LTAI5txxxxxxx
OSS_ACCESS_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
OSS_BUCKET=machrio-admin
VITE_API_URL=https://api.machrio.com/api
```

#### 安全组规则

| 端口 | 协议 | 授权对象 | 说明 |
|------|------|----------|------|
| 22 | TCP | 0.0.0.0/0 | SSH（建议限制 IP） |
| 80 | TCP | 0.0.0.0/0 | HTTP（用于 HTTPS 重定向） |
| 443 | TCP | 0.0.0.0/0 | HTTPS |

**不建议开放**:
- ❌ 8080（API 内部访问）
- ❌ 5432（数据库内部访问）

---

## 测试策略

### 单元测试（后端）

```java
@SpringBootTest
class AIConversationServiceTest {
    
    @Autowired
    private AIConversationService service;
    
    @Test
    void testSaveConversation() {
        // 准备数据
        ConversationData data = new ConversationData();
        data.setSessionId("sess_test_123");
        data.setMessages(List.of(
            new Message("user", "我想了解你们的产品"),
            new Message("assistant", "好的，我们提供...")
        ));
        
        // 执行
        AIConversation saved = service.saveConversation(data);
        
        // 验证
        assertNotNull(saved.getId());
        assertEquals("sess_test_123", saved.getSessionId());
        assertEquals(2, saved.getMessageCount());
    }
    
    @Test
    void testDetectIntentScore() {
        String content = "我想批量采购，预算 10 万，尽快发货";
        int score = service.calculateIntentScore(content);
        assertTrue(score >= 60);  // 高意向
    }
}
```

### 集成测试（前端）

```typescript
describe('AIConversationsPage', () => {
  it('should load conversations', async () => {
    render(<AIConversationsPage />);
    
    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByText('AI 对话管理')).toBeInTheDocument();
    });
    
    // 验证表格显示
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
  
  it('should filter by priority', async () => {
    render(<AIConversationsPage />);
    
    // 选择高优先级
    fireEvent.change(screen.getByPlaceholderText('优先级'), {
      target: { value: 'high' }
    });
    
    // 验证筛选结果
    await waitFor(() => {
      expect(screen.getByText('高')).toBeInTheDocument();
    });
  });
});
```

### E2E 测试

```typescript
describe('Conversation Flow', () => {
  it('should complete conversation flow', () => {
    // 1. 访问首页
    cy.visit('/');
    
    // 2. 打开 AI 助手
    cy.get('[data-testid="ai-assistant-button"]').click();
    
    // 3. 发送消息
    cy.get('[data-testid="chat-input"]')
      .type('我想了解产品价格{enter}');
    
    // 4. 等待回复
    cy.get('[data-testid="message-list"]')
      .should('contain', '价格');
    
    // 5. 验证保存到后台
    cy.request('/api/ai-conversations')
      .its('body')
      .should('have.length.greaterThan', 0);
  });
});
```

---

## 常见问题 FAQ

### Q1: 前端页面空白，控制台报错 "Failed to fetch"

**原因**: 后端服务未启动或 API URL 配置错误

**解决方案**:
```bash
# 检查后端服务
docker compose ps

# 查看后端日志
docker compose logs api

# 验证 API 可访问
curl http://localhost:8080/actuator/health

# 检查前端配置
cat frontend/.env.local | grep VITE_API_URL
```

### Q2: 数据库连接失败

**原因**: 数据库未启动或连接信息错误

**解决方案**:
```bash
# 检查数据库容器
docker compose ps db

# 查看数据库日志
docker compose logs db

# 测试数据库连接
docker exec -it machrio-admin-db psql -U postgres -d machrio_admin

# 检查环境变量
docker compose config | grep DATASOURCE
```

### Q3: CORS 错误（跨域请求被拦截）

**原因**: 后端 CORS 配置不包含前端域名

**解决方案**:
```bash
# 修改 .env
CORS_ORIGINS=https://admin.machrio.com,http://localhost:5173

# 重启服务
docker compose restart api

# 验证配置
curl -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS --verbose \
  http://localhost:8080/api/products
```

### Q4: 内存不足（OOM）

**原因**: JVM 堆内存配置过大或过小

**解决方案**:
```yaml
# docker-compose.yml
environment:
  - JAVA_TOOL_OPTIONS=-Xms256m -Xmx512m  # 根据服务器配置调整
  
# 监控内存使用
docker stats machrio-admin-api

# 查看 GC 日志
docker compose logs api | grep GC
```

### Q5: 文件上传失败

**原因**: OSS 配置错误或权限不足

**解决方案**:
```bash
# 检查 OSS 配置
docker compose exec api env | grep OSS

# 测试 OSS 连接
docker compose exec api curl -I https://oss-cn-hangzhou.aliyuncs.com

# 验证 AccessKey 权限
# 访问 RAM 控制台检查 AccessKey 是否有 OSS 权限
```

### Q6: Docker 构建慢

**原因**: 依赖下载慢或缓存未利用

**解决方案**:
```dockerfile
# 优化 Dockerfile
# 1. 先复制依赖文件
COPY build.gradle settings.gradle ./
COPY gradle ./gradle

# 2. 下载依赖（利用缓存）
RUN ./gradlew dependencies --no-daemon || true

# 3. 复制源代码
COPY src ./src

# 4. 构建
RUN ./gradlew bootJar -x test
```

### Q7: Git 推送冲突

**原因**: 多人同时推送代码

**解决方案**:
```bash
# 拉取最新代码
git pull origin main

# 解决冲突（如果有）
git mergetool

# 重新提交
git add .
git commit -m "Merge remote-tracking branch 'origin/main'"
git push
```

---

## 后续开发建议

### Phase 2: 功能增强

#### 1. 数据分析仪表板

**功能**:
- 对话趋势图（按日/周/月）
- 意向客户分布（按行业/地区）
- 转化率统计
- 销售绩效排名

**技术实现**:
```typescript
// 使用 ECharts 或 Recharts
import { LineChart, BarChart, PieChart } from 'recharts';

// API 端点
GET /api/analytics/conversations/trend?period=30d
GET /api/analytics/customers/distribution
GET /api/analytics/conversion/rate
```

#### 2. 智能推荐

**功能**:
- 相似产品推荐
- 话术建议
- 最佳跟进时间预测

**技术实现**:
```python
# 使用 Python ML 服务
from sklearn.ensemble import RandomForestClassifier

# 训练模型
model = RandomForestClassifier()
model.fit(X_train, y_train)

# 预测最佳跟进时间
best_time = model.predict(conversation_features)
```

#### 3. 自动化营销

**功能**:
- 邮件模板
- 定时发送
- A/B 测试
- 打开率追踪

### Phase 3: 架构优化

#### 1. 微服务拆分

**当前**: 单体应用
**目标**: 微服务架构

```
┌─────────────────┐
│  API Gateway    │
│  (Kong/Nginx)   │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    │         │          │          │
┌───▼───┐ ┌──▼────┐ ┌──▼────┐ ┌──▼────┐
│Conversation│ │Product│ │ Order │ │ User  │
│  Service  │ │Service│ │Service│ │Service│
└─────────┘ └───────┘ └───────┘ └───────┘
```

#### 2. 消息队列

**场景**:
- 异步保存对话
- 批量发送邮件
- 数据同步

**技术选型**:
- RabbitMQ（简单易用）
- Kafka（高吞吐）
- RocketMQ（阿里系）

#### 3. 缓存层

**场景**:
- 热点数据（产品列表、分类）
- 会话缓存
- 统计结果

**技术选型**:
- Redis（推荐）
- Memcached

### 监控和告警

#### 1. 应用监控

**工具**:
- Prometheus + Grafana
- 阿里云 ARMS

**监控指标**:
- QPS（每秒请求数）
- 响应时间（P95, P99）
- 错误率
- JVM 内存使用
- 数据库连接池

#### 2. 日志聚合

**工具**:
- ELK Stack（Elasticsearch, Logstash, Kibana）
- 阿里云 SLS

**日志级别**:
```yaml
logging:
  level:
    root: INFO
    com.machrio.admin: DEBUG  # 开发环境
    com.machrio.admin: INFO   # 生产环境
    org.hibernate.SQL: WARN   # 生产环境关闭 SQL 日志
```

#### 3. 告警规则

```yaml
# Prometheus 告警规则
groups:
  - name: machrio_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        annotations:
          summary: "错误率过高"
          
      - alert: HighMemoryUsage
        expr: jvm_memory_used_bytes / jvm_memory_max_bytes > 0.9
        for: 10m
        annotations:
          summary: "内存使用过高"
```

### 安全加固

#### 1. 认证和授权

**当前**: JWT（预留）
**建议**: 
- 实现完整的 JWT 认证
- 添加 RBAC（基于角色的访问控制）
- 实现 OAuth2（可选）

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

#### 2. 数据加密

**敏感字段加密**:
```java
// 使用 Jasypt 加密
@ColumnTransformer(
    read = "pgp_sym_decrypt(user_phone, '${ENCRYPTION_KEY}')",
    write = "pgp_sym_encrypt(?, '${ENCRYPTION_KEY}')"
)
private String userPhone;
```

**HTTPS 强制**:
```nginx
server {
    listen 80;
    server_name admin.machrio.com;
    return 301 https://$server_name$request_uri;
}
```

#### 3. 审计日志

```java
@EntityListeners(AuditingEntityListener.class)
public class AIConversation {
    
    @CreatedBy
    private String createdBy;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedBy
    private String lastModifiedBy;
    
    @LastModifiedDate
    private LocalDateTime lastModifiedDate;
}
```

---

## 资源链接

### 项目仓库
- GitHub: https://github.com/ryan823-dev/machrio-admin.git
- 最新提交：`768f423`

### 文档索引
- [AI 对话管理系统设计](AI-CONVERSATION-MANAGEMENT.md)
- [部署后配置指南](POST-DEPLOY-CONFIG.md)
- [数据库设置指南](DATABASE-SETUP.md)
- [测试指南](TESTING-GUIDE.md)
- [实施总结](AI-CONVERSATION-FINAL-SUMMARY.md)
- [测试结果](TESTING-RESULTS.md)
- [阿里云部署指南](ALIYUN-DEPLOYMENT.md)

### 技术文档
- [Spring Boot 官方文档](https://spring.io/projects/spring-boot)
- [React 官方文档](https://react.dev/)
- [Ant Design 文档](https://ant.design/)
- [Docker 官方文档](https://docs.docker.com/)
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)

### 阿里云文档
- [ECS 快速入门](https://help.aliyun.com/product/25365.html)
- [RDS PostgreSQL 使用指南](https://help.aliyun.com/product/41797.html)
- [OSS 开发指南](https://help.aliyun.com/product/31815.html)
- [Docker 部署最佳实践](https://help.aliyun.com/document_detail/207297.html)

---

## 联系和支持

### 团队联系方式
- 技术支持：tech@machrio.com
- 产品反馈：product@machrio.com

### 问题反馈
如遇到问题，请提供以下信息：
1. 问题描述（详细步骤）
2. 环境信息（开发/生产）
3. 错误日志（完整堆栈）
4. 截图或录屏（如适用）

---

**文档版本**: 1.0  
**创建日期**: 2026-03-28  
**维护者**: Machrio Development Team  
**最后更新**: 2026-03-28

---

## 附录：快速参考卡片

### 常用命令

```bash
# 本地开发
cd frontend && npm run dev
cd backend/machrio-api && ./gradlew bootRun

# Docker 部署
docker compose up -d
docker compose logs -f
docker compose down

# 数据库操作
docker exec -it machrio-admin-db psql -U postgres -d machrio_admin
pg_dump -U postgres machrio_admin > backup.sql

# Git 操作
git status
git log --oneline
git pull origin main
git push
```

### 端口速查

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端开发 | 5173 | Vite 开发服务器 |
| 后端 API | 8080 | Spring Boot |
| PostgreSQL | 5432 | 数据库 |
| Nginx | 80/443 | 生产环境前端 |

### 环境变量速查

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SERVER_PORT` | 后端端口 | 8080 |
| `VITE_API_URL` | 前端 API 地址 | http://localhost:8080/api |
| `SPRING_DATASOURCE_URL` | 数据库连接 | jdbc:postgresql://localhost:5432/machrio_admin |
| `APP_CORS_ALLOWED_ORIGINS` | CORS 域名 | http://localhost:5173 |
| `APP_JWT_SECRET` | JWT 密钥 | dev-secret-key |

---

**END OF AGENT MEMORY**
