-- =====================================================
-- AI 对话记录和客户需求管理表
-- =====================================================
-- 创建时间：2026-03-28
-- 说明：存储网站前台 AI 助手对话记录和提取的客户需求
-- =====================================================

-- =====================================================
-- 1. AI 对话记录表
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100),
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    user_phone VARCHAR(50),
    user_company VARCHAR(255),
    user_job_title VARCHAR(100),
    
    -- 对话来源
    source_page VARCHAR(255),
    source_url TEXT,
    conversation_type VARCHAR(50), -- 'product_inquiry', 'support', 'sales', 'rfq', 'other'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived', 'converted'
    
    -- AI 分析结果
    intent_score INTEGER DEFAULT 0, -- 0-100
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    extracted_needs JSONB,
    product_interests TEXT[],
    budget_range VARCHAR(100),
    purchase_timeline VARCHAR(100),
    
    -- 对话统计
    message_count INTEGER DEFAULT 0,
    first_message_at TIMESTAMP WITH TIME ZONE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    
    -- 跟进管理
    assigned_to VARCHAR(100),
    follow_up_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'converted'
    follow_up_notes TEXT,
    follow_up_deadline TIMESTAMP WITH TIME ZONE,
    converted_to_customer BOOLEAN DEFAULT FALSE,
    customer_id UUID,
    
    -- 元数据
    metadata JSONB,
    tags TEXT[],
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 索引优化
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'archived', 'converted'))
);

-- 创建索引
CREATE INDEX idx_ai_conversations_session_id ON ai_conversations(session_id);
CREATE INDEX idx_ai_conversations_user_email ON ai_conversations(user_email);
CREATE INDEX idx_ai_conversations_status ON ai_conversations(status);
CREATE INDEX idx_ai_conversations_priority ON ai_conversations(priority);
CREATE INDEX idx_ai_conversations_intent_score ON ai_conversations(intent_score DESC);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at DESC);
CREATE INDEX idx_ai_conversations_follow_up ON ai_conversations(follow_up_status, follow_up_deadline);
CREATE INDEX idx_ai_conversations_product_interests ON ai_conversations USING GIN(product_interests);
CREATE INDEX idx_ai_conversations_extracted_needs ON ai_conversations USING GIN(extracted_needs);

-- =====================================================
-- 2. 对话消息表
-- =====================================================
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    
    -- 消息内容
    message_type VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'text', -- 'text', 'structured', 'image', 'file'
    
    -- AI 相关信息
    ai_model VARCHAR(100),
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    confidence_score DECIMAL(5,2),
    
    -- 上下文和附件
    context_data JSONB,
    attachments JSONB,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 索引
    CONSTRAINT valid_message_type CHECK (message_type IN ('user', 'assistant', 'system'))
);

-- 创建索引
CREATE INDEX idx_conversation_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX idx_conversation_messages_message_type ON conversation_messages(message_type);
CREATE INDEX idx_conversation_messages_created_at ON conversation_messages(created_at DESC);
CREATE INDEX idx_conversation_messages_context ON conversation_messages USING GIN(context_data);

-- =====================================================
-- 3. 客户需求表
-- =====================================================
CREATE TABLE IF NOT EXISTS customer_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    
    -- 客户基本信息
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    company_name VARCHAR(255),
    job_title VARCHAR(100),
    
    -- 需求分类
    requirement_type VARCHAR(50), -- 'product_purchase', 'customization', 'oem', 'distribution'
    product_category VARCHAR(100),
    product_names TEXT[],
    product_ids TEXT[],
    
    -- 数量和价格
    quantity INTEGER,
    quantity_unit VARCHAR(20), -- 'pieces', 'sets', 'tons', etc.
    unit_price_range VARCHAR(100),
    total_budget VARCHAR(100),
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- 时间要求
    required_date DATE,
    purchase_timeline VARCHAR(100),
    urgency VARCHAR(20), -- 'immediate', 'this_week', 'this_month', 'flexible'
    
    -- 技术规格
    specifications JSONB,
    quality_requirements TEXT,
    certification_requirements TEXT[],
    custom_requirements TEXT,
    
    -- 物流信息
    shipping_address TEXT,
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_country VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    shipping_method VARCHAR(100),
    incoterms VARCHAR(50),
    
    -- 付款信息
    payment_terms VARCHAR(100),
    payment_method VARCHAR(100),
    
    -- 优先级和状态
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'quoted', 'negotiating', 'won', 'lost'
    confidence_score INTEGER DEFAULT 0, -- 0-100
    lead_score INTEGER DEFAULT 0, -- 0-100
    
    -- 跟进管理
    assigned_to VARCHAR(100),
    assigned_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    next_follow_up_date TIMESTAMP WITH TIME ZONE,
    
    -- 转化信息
    converted_to_order BOOLEAN DEFAULT FALSE,
    order_id UUID,
    order_value DECIMAL(15,2),
    converted_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 约束
    CONSTRAINT valid_requirement_type CHECK (requirement_type IN ('product_purchase', 'customization', 'oem', 'distribution', 'other')),
    CONSTRAINT valid_urgency CHECK (urgency IN ('immediate', 'this_week', 'this_month', 'flexible')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT valid_status CHECK (status IN ('new', 'contacted', 'qualified', 'quoted', 'negotiating', 'won', 'lost'))
);

-- 创建索引
CREATE INDEX idx_customer_requirements_conversation_id ON customer_requirements(conversation_id);
CREATE INDEX idx_customer_requirements_email ON customer_requirements(customer_email);
CREATE INDEX idx_customer_requirements_status ON customer_requirements(status);
CREATE INDEX idx_customer_requirements_priority ON customer_requirements(priority);
CREATE INDEX idx_customer_requirements_lead_score ON customer_requirements(lead_score DESC);
CREATE INDEX idx_customer_requirements_assigned_to ON customer_requirements(assigned_to);
CREATE INDEX idx_customer_requirements_product_names ON customer_requirements USING GIN(product_names);
CREATE INDEX idx_customer_requirements_specifications ON customer_requirements USING GIN(specifications);

-- =====================================================
-- 4. 对话分析日志表（用于优化 AI）
-- =====================================================
CREATE TABLE IF NOT EXISTS conversation_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE SET NULL,
    
    -- 分析指标
    total_messages INTEGER,
    conversation_duration_seconds INTEGER,
    user_satisfaction_score INTEGER, -- 1-5
    ai_confidence_avg DECIMAL(5,2),
    
    -- 提取效果
    info_extraction_rate DECIMAL(5,2), -- 0-100
    intent_detection_accuracy DECIMAL(5,2),
    
    -- 转化追踪
    converted_to_requirement BOOLEAN DEFAULT FALSE,
    converted_to_customer BOOLEAN DEFAULT FALSE,
    conversion_time_hours INTEGER,
    
    -- AI 性能
    avg_response_time_ms INTEGER,
    total_tokens_used INTEGER,
    model_version VARCHAR(50),
    
    -- 标签
    auto_tags TEXT[],
    manual_tags TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 约束
    CONSTRAINT valid_satisfaction_score CHECK (user_satisfaction_score >= 1 AND user_satisfaction_score <= 5)
);

-- 创建索引
CREATE INDEX idx_conversation_analytics_conversation_id ON conversation_analytics(conversation_id);
CREATE INDEX idx_conversation_analytics_created_at ON conversation_analytics(created_at DESC);

-- =====================================================
-- 5. 视图：高意向客户列表
-- =====================================================
CREATE OR REPLACE VIEW high_intent_conversations AS
SELECT 
    c.id,
    c.session_id,
    c.user_name,
    c.user_email,
    c.user_company,
    c.intent_score,
    c.priority,
    c.product_interests,
    c.budget_range,
    c.purchase_timeline,
    c.follow_up_status,
    c.assigned_to,
    c.first_message_at,
    c.last_message_at,
    c.message_count,
    CASE 
        WHEN c.intent_score >= 80 THEN '🔥 极高'
        WHEN c.intent_score >= 60 THEN '🔥 高'
        WHEN c.intent_score >= 40 THEN '⚡ 中等'
        ELSE '💤 低'
    END as intent_level
FROM ai_conversations c
WHERE c.status = 'active'
  AND c.intent_score >= 40
ORDER BY c.intent_score DESC, c.last_message_at DESC;

-- =====================================================
-- 6. 视图：待跟进对话
-- =====================================================
CREATE OR REPLACE VIEW pending_follow_ups AS
SELECT 
    c.id,
    c.user_name,
    c.user_email,
    c.user_company,
    c.priority,
    c.follow_up_status,
    c.follow_up_deadline,
    c.assigned_to,
    CASE 
        WHEN c.follow_up_deadline < NOW() THEN '⚠️ 已逾期'
        WHEN c.follow_up_deadline < NOW() + INTERVAL '1 day' THEN '⏰ 即将到期'
        ELSE '✅ 正常'
    END as deadline_status,
    AGE(c.follow_up_deadline, NOW()) as time_remaining
FROM ai_conversations c
WHERE c.status = 'active'
  AND c.follow_up_status IN ('pending', 'in_progress')
  AND c.follow_up_deadline IS NOT NULL
ORDER BY c.follow_up_deadline ASC;

-- =====================================================
-- 7. 触发器：自动更新时间
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为各表添加触发器
CREATE TRIGGER update_ai_conversations_updated_at
    BEFORE UPDATE ON ai_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_requirements_updated_at
    BEFORE UPDATE ON customer_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. 初始测试数据
-- =====================================================

-- 示例对话
INSERT INTO ai_conversations (
    session_id, user_name, user_email, user_company,
    source_page, conversation_type,
    intent_score, priority,
    product_interests, budget_range, purchase_timeline,
    message_count, follow_up_status, tags
) VALUES (
    'session_001',
    'John Smith',
    'john@example.com',
    'ABC Trading Co.',
    '/products/industrial-valves',
    'product_inquiry',
    75,
    'high',
    ARRAY['Industrial Valves', 'Stainless Steel Valves'],
    '$5000-$10000',
    'This month',
    12,
    'pending',
    ARRAY['hot_lead', 'bulk_order', 'repeat_customer']
);

-- 示例需求
INSERT INTO customer_requirements (
    conversation_id,
    customer_name, customer_email, company_name,
    requirement_type, product_category, product_names,
    quantity, quantity_unit, total_budget,
    urgency, priority, status,
    shipping_country, payment_terms,
    confidence_score, lead_score
) SELECT 
    c.id,
    'John Smith',
    'john@example.com',
    'ABC Trading Co.',
    'product_purchase',
    'Industrial Valves',
    ARRAY['Stainless Steel Ball Valve', 'Butterfly Valve'],
    500,
    'pieces',
    '$8000',
    'this_month',
    'high',
    'qualified',
    'United States',
    'T/T 30% deposit',
    85,
    78
FROM ai_conversations c
WHERE c.session_id = 'session_001';

-- =====================================================
-- 9. 统计查询示例
-- =====================================================

-- 对话统计
COMMENT ON TABLE ai_conversations IS 'AI 对话记录表 - 存储网站前台 AI 助手与用户的完整对话历史和分析结果';
COMMENT ON TABLE conversation_messages IS '对话消息表 - 存储对话中的每条消息内容';
COMMENT ON TABLE customer_requirements IS '客户需求表 - 从对话中提取的结构化客户需求信息';
COMMENT ON TABLE conversation_analytics IS '对话分析表 - 用于追踪 AI 性能和转化效果';
COMMENT ON VIEW high_intent_conversations IS '高意向客户视图 - 自动筛选出意向分数>=40 的活跃对话';
COMMENT ON VIEW pending_follow_ups IS '待跟进对话视图 - 显示需要跟进的对话和截止日期状态';
