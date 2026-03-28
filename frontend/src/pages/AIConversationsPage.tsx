import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, Tag, Input, Button, Space, Drawer, Descriptions, 
  Typography, Card, Badge, Timeline, Select, Divider, Tabs,
  Empty, Avatar, Tooltip, Popconfirm, message, Rate, Statistic, Row, Col
} from 'antd';
import { 
  SearchOutlined, EyeOutlined, DeleteOutlined, 
  RobotOutlined, UserOutlined, CalendarOutlined,
  ThunderboltOutlined, CheckCircleOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiClient } from '../services/api';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface Conversation {
  id: string;
  sessionId: string;
  userName?: string;
  userEmail?: string;
  userCompany?: string;
  userPhone?: string;
  sourcePage?: string;
  conversationType: string;
  status: string;
  intentScore: number;
  priority: string;
  productInterests?: string[];
  budgetRange?: string;
  purchaseTimeline?: string;
  messageCount: number;
  firstMessageAt: string;
  lastMessageAt: string;
  followUpStatus: string;
  followUpDeadline?: string;
  assignedTo?: string;
  tags?: string[];
}

interface Message {
  id: string;
  messageType: string;
  content: string;
  contentType: string;
  createdAt: string;
}

const AIConversationsPage: React.FC = () => {
  const [data, setData] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (search) params.search = search;
      
      const res = await apiClient.get<Conversation[]>('/api/ai-conversations', params);
      setData(res || []);
    } catch (error: any) {
      message.error(error.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await apiClient.get<Message[]>(`/api/ai-conversations/${conversationId}/messages`);
      setMessages(res || []);
    } catch (error: any) {
      message.error('Failed to load messages');
    }
  };

  const handleViewDetails = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.id);
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.del(`/api/ai-conversations/${id}`);
      message.success('Conversation deleted');
      fetchData();
    } catch (error: any) {
      message.error('Delete failed');
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'red',
      high: 'orange',
      medium: 'blue',
      low: 'green',
    };
    return colors[priority] || 'default';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'green',
      archived: 'gray',
      converted: 'purple',
    };
    return colors[status] || 'default';
  };

  const getIntentLevel = (score: number) => {
    if (score >= 80) return { text: '极高', icon: '🔥', color: 'red' };
    if (score >= 60) return { text: '高', icon: '🔥', color: 'orange' };
    if (score >= 40) return { text: '中等', icon: '⚡', color: 'blue' };
    return { text: '低', icon: '💤', color: 'gray' };
  };

  const columns: ColumnsType<Conversation> = [
    {
      title: '用户',
      key: 'user',
      width: 180,
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.userName || 'Anonymous'}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.userEmail || '-'}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '公司',
      dataIndex: 'userCompany',
      key: 'userCompany',
      width: 150,
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: '意向度',
      key: 'intent',
      width: 100,
      render: (_, record) => {
        const level = getIntentLevel(record.intentScore);
        return (
          <Tooltip title={`得分：${record.intentScore}`}>
            <Tag color={level.color}>
              {level.icon} {level.text}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 90,
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>
      ),
    },
    {
      title: '类型',
      dataIndex: 'conversationType',
      key: 'conversationType',
      width: 120,
      render: (type) => {
        const typeMap: Record<string, string> = {
          product_inquiry: '产品咨询',
          support: '技术支持',
          sales: '销售询价',
          rfq: 'RFQ',
          other: '其他',
        };
        return <Tag>{typeMap[type] || type}</Tag>;
      },
    },
    {
      title: '产品兴趣',
      dataIndex: 'productInterests',
      key: 'productInterests',
      width: 200,
      render: (interests) => (
        <Space wrap>
          {interests?.slice(0, 2).map((item, idx) => (
            <Tag key={idx} style={{ maxWidth: 150 }}>{item}</Tag>
          ))}
          {interests && interests.length > 2 && (
            <Tooltip title={interests.slice(2).join(', ')}>
              <Tag color="blue">+{interests.length - 2}</Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '消息数',
      dataIndex: 'messageCount',
      key: 'messageCount',
      width: 80,
      render: (count) => <Badge count={count} showZero />,
    },
    {
      title: '最后对话',
      dataIndex: 'lastMessageAt',
      key: 'lastMessageAt',
      width: 120,
      render: (time) => time ? new Date(time).toLocaleDateString() : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status) => (
        <Badge 
          status={getStatusColor(status) as any} 
          text={status}
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          />
          <Popconfirm
            title="删除对话记录"
            description="确定要删除这条对话记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="删除"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总对话数"
              value={data.length}
              prefix={<RobotOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="高意向客户"
              value={data.filter(c => c.intentScore >= 60).length}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待跟进"
              value={data.filter(c => c.followUpStatus === 'pending').length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已转化"
              value={data.filter(c => c.status === 'converted').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 筛选器 */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索用户、公司、产品..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
          >
            <Option value="all">全部状态</Option>
            <Option value="active">进行中</Option>
            <Option value="archived">已归档</Option>
            <Option value="converted">已转化</Option>
          </Select>
          <Select
            style={{ width: 150 }}
            value={priorityFilter}
            onChange={setPriorityFilter}
          >
            <Option value="all">全部优先级</Option>
            <Option value="urgent">紧急</Option>
            <Option value="high">高</Option>
            <Option value="medium">中</Option>
            <Option value="low">低</Option>
          </Select>
        </Space>
      </Card>

      {/* 对话列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条对话`,
          }}
        />
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title={
          <Space>
            <RobotOutlined />
            <span>对话详情</span>
          </Space>
        }
        placement="right"
        width={800}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedConversation(null);
          setMessages([]);
        }}
      >
        {selectedConversation && (
          <>
            {/* 用户信息 */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="用户">
                  <Space>
                    <Avatar icon={<UserOutlined />} />
                    <span>{selectedConversation.userName || 'Anonymous'}</span>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="邮箱">
                  {selectedConversation.userEmail || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="公司">
                  {selectedConversation.userCompany || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="电话">
                  {selectedConversation.userPhone || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="来源页面">
                  {selectedConversation.sourcePage || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="对话类型">
                  <Tag>{selectedConversation.conversationType}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* AI 分析 */}
            <Card 
              size="small" 
              style={{ marginBottom: 16 }}
              title={<Space><ThunderboltOutlined />AI 分析结果</Space>}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="意向得分"
                    value={selectedConversation.intentScore}
                    suffix="/ 100"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="优先级"
                    value={selectedConversation.priority.toUpperCase()}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="消息数"
                    value={selectedConversation.messageCount}
                  />
                </Col>
              </Row>
              <Divider style={{ margin: '16px 0' }} />
              <div style={{ marginBottom: 8 }}>
                <Text strong>产品兴趣：</Text>
                <Space wrap>
                  {selectedConversation.productInterests?.map((item, idx) => (
                    <Tag key={idx}>{item}</Tag>
                  ))}
                </Space>
              </div>
              {selectedConversation.budgetRange && (
                <div style={{ marginBottom: 8 }}>
                  <Text strong>预算范围：</Text>
                  <Text>{selectedConversation.budgetRange}</Text>
                </div>
              )}
              {selectedConversation.purchaseTimeline && (
                <div>
                  <Text strong>采购时间：</Text>
                  <Text>{selectedConversation.purchaseTimeline}</Text>
                </div>
              )}
            </Card>

            {/* 对话记录 */}
            <Card 
              size="small"
              title={<Space><RobotOutlined />对话记录</Space>}
            >
              <Timeline
                items={messages.map((msg) => ({
                  key: msg.id,
                  color: msg.messageType === 'user' ? 'blue' : 'green',
                  dot: msg.messageType === 'user' ? <UserOutlined /> : <RobotOutlined />,
                  children: (
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        <Tag color={msg.messageType === 'user' ? 'blue' : 'green'}>
                          {msg.messageType === 'user' ? '用户' : 'AI 助手'}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(msg.createdAt).toLocaleString()}
                        </Text>
                      </div>
                      <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </Paragraph>
                    </div>
                  ),
                }))}
              />
            </Card>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default AIConversationsPage;
