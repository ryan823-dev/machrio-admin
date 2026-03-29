import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Tag, Space, Button, Drawer, Descriptions,
  Typography, Badge, Input, Select, Divider, message, Statistic, Row, Col,
  Avatar, Form, Tooltip
} from 'antd';
import {
  SearchOutlined, EyeOutlined, CheckCircleOutlined,
  UserOutlined, DollarOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiClient } from '../services/api';

const { Text } = Typography;
const { Option } = Select;

interface CustomerRequirement {
  id: string;
  conversationId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  companyName?: string;
  jobTitle?: string;
  requirementType: string;
  productCategory?: string;
  productNames?: string[];
  quantity?: number;
  quantityUnit?: string;
  totalBudget?: string;
  currency?: string;
  urgency: string;
  priority: string;
  status: string;
  confidenceScore: number;
  leadScore: number;
  shippingCountry?: string;
  shippingCity?: string;
  paymentTerms?: string;
  assignedTo?: string;
  notes?: string;
  nextFollowUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

const CustomerRequirementsPage: React.FC = () => {
  const [data, setData] = useState<CustomerRequirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<CustomerRequirement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (search) params.search = search;
      
      const res = await apiClient.get<CustomerRequirement[]>('/api/customer-requirements', params);
      setData(res || []);
    } catch (error: any) {
      message.error(error.message || 'Failed to load requirements');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewDetails = (requirement: CustomerRequirement) => {
    setSelectedRequirement(requirement);
    form.setFieldsValue(requirement);
    setDrawerOpen(true);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await apiClient.put(`/api/customer-requirements/${id}`, { status: newStatus });
      message.success('Status updated');
      fetchData();
    } catch (error: any) {
      message.error('Update failed');
    }
  };

  // Reserved for future use
  // const handleAssign = async (id: string, assignee: string) => {
  //   try {
  //     await apiClient.post(`/api/customer-requirements/${id}/assign`, { assignedTo: assignee });
  //     message.success('Assigned successfully');
  //     fetchData();
  //   } catch (error: any) {
  //     message.error('Assign failed');
  //   }
  // };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'blue',
      contacted: 'cyan',
      qualified: 'purple',
      quoted: 'orange',
      negotiating: 'gold',
      won: 'green',
      lost: 'red',
    };
    return colors[status] || 'default';
  };

  const getUrgencyIcon = (urgency: string) => {
    const icons: Record<string, string> = {
      immediate: '🔥',
      this_week: '⏰',
      this_month: '📅',
      flexible: '✓',
    };
    return icons[urgency] || '📋';
  };

  const columns: ColumnsType<CustomerRequirement> = [
    {
      title: '客户',
      key: 'customer',
      width: 180,
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#7265e6' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.customerName || 'Anonymous'}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.customerEmail || '-'}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '公司',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '需求类型',
      dataIndex: 'requirementType',
      key: 'requirementType',
      width: 120,
      render: (type) => {
        const typeMap: Record<string, string> = {
          product_purchase: '产品采购',
          customization: '定制需求',
          oem: 'OEM',
          distribution: '分销',
          other: '其他',
        };
        return <Tag>{typeMap[type] || type}</Tag>;
      },
    },
    {
      title: '产品',
      dataIndex: 'productNames',
      key: 'productNames',
      width: 200,
      render: (names) => (
        <Space wrap>
          {names?.slice(0, 2).map((name: string, idx: number) => (
            <Tag key={idx} color="blue">{name}</Tag>
          ))}
          {names && names.length > 2 && (
            <Tooltip title={names.slice(2).join(', ')}>
              <Tag>+{names.length - 2}</Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '数量/预算',
      key: 'quantity_budget',
      width: 130,
      render: (_, record) => (
        <div>
          {record.quantity && (
            <div><Text>{record.quantity} {record.quantityUnit || 'pcs'}</Text></div>
          )}
          {record.totalBudget && (
            <div><Text type="secondary">{record.totalBudget}</Text></div>
          )}
        </div>
      ),
    },
    {
      title: '紧急度',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 90,
      render: (urgency) => (
        <Tag>
          {getUrgencyIcon(urgency)} {urgency.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority) => (
        <Badge
          status={priority === 'urgent' ? 'error' : priority === 'high' ? 'warning' : 'success'}
          text={priority.toUpperCase()}
        />
      ),
    },
    {
      title: '意向度',
      key: 'scores',
      width: 100,
      render: (_, record) => (
        <div>
          <div>
            <Text type="secondary">信心:</Text> {record.confidenceScore}%
          </div>
          <div>
            <Text type="secondary">线索:</Text> {record.leadScore}
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Badge status={getStatusColor(status) as any} text={status} />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            详情
          </Button>
          <Select
            size="small"
            value={record.status}
            onChange={(value) => handleUpdateStatus(record.id, value)}
            style={{ width: 120 }}
          >
            <Option value="new">新需求</Option>
            <Option value="contacted">已联系</Option>
            <Option value="qualified">已确认</Option>
            <Option value="quoted">已报价</Option>
            <Option value="negotiating">谈判中</Option>
            <Option value="won">成交</Option>
            <Option value="lost">丢失</Option>
          </Select>
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
              title="总需求数"
              value={data.length}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="新需求"
              value={data.filter(r => r.status === 'new').length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="高意向"
              value={data.filter(r => r.leadScore >= 70).length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已成交"
              value={data.filter(r => r.status === 'won').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#7265e6' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 筛选器 */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索客户、公司、产品..."
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
            <Option value="new">新需求</Option>
            <Option value="contacted">已联系</Option>
            <Option value="qualified">已确认</Option>
            <Option value="quoted">已报价</Option>
            <Option value="negotiating">谈判中</Option>
            <Option value="won">成交</Option>
            <Option value="lost">丢失</Option>
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

      {/* 需求列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条需求`,
          }}
        />
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title="客户需求详情"
        placement="right"
        width={700}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedRequirement(null);
        }}
      >
        {selectedRequirement && (
          <>
            {/* 客户信息 */}
            <Card size="small" style={{ marginBottom: 16 }} title="客户信息">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="姓名">
                  {selectedRequirement.customerName || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="邮箱">
                  {selectedRequirement.customerEmail || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="电话">
                  {selectedRequirement.customerPhone || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="公司">
                  {selectedRequirement.companyName || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="职位">
                  {selectedRequirement.jobTitle || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {new Date(selectedRequirement.createdAt).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 需求详情 */}
            <Card size="small" style={{ marginBottom: 16 }} title="需求详情">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="需求类型"
                    value={selectedRequirement.requirementType}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="产品类别"
                    value={selectedRequirement.productCategory || '-'}
                  />
                </Col>
              </Row>
              <Divider style={{ margin: '16px 0' }} />
              <div style={{ marginBottom: 12 }}>
                <Text strong>产品：</Text>
                <Space wrap>
                  {selectedRequirement.productNames?.map((name, idx) => (
                    <Tag key={idx} color="blue">{name}</Tag>
                  ))}
                </Space>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>数量：</Text>
                <Text>{selectedRequirement.quantity} {selectedRequirement.quantityUnit || 'pieces'}</Text>
              </div>
              {selectedRequirement.totalBudget && (
                <div style={{ marginBottom: 12 }}>
                  <Text strong>预算：</Text>
                  <Text>{selectedRequirement.totalBudget}</Text>
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                <Text strong>紧急度：</Text>
                <Tag>{getUrgencyIcon(selectedRequirement.urgency)} {selectedRequirement.urgency}</Tag>
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text strong>付款方式：</Text>
                <Text>{selectedRequirement.paymentTerms || '-'}</Text>
              </div>
              {selectedRequirement.shippingCountry && (
                <div>
                  <Text strong>目的地：</Text>
                  <Space>
                    <EnvironmentOutlined />
                    <Text>{selectedRequirement.shippingCity}, {selectedRequirement.shippingCountry}</Text>
                  </Space>
                </div>
              )}
            </Card>

            {/* 评分和状态 */}
            <Card size="small" style={{ marginBottom: 16 }} title="评估">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="信心指数"
                    value={selectedRequirement.confidenceScore}
                    suffix="%"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="线索评分"
                    value={selectedRequirement.leadScore}
                    suffix="/100"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="优先级"
                    value={selectedRequirement.priority.toUpperCase()}
                  />
                </Col>
              </Row>
            </Card>

            {/* 跟进管理 */}
            <Card size="small" title="跟进管理">
              <Form form={form} layout="vertical">
                <Form.Item label="状态">
                  <Select
                    value={selectedRequirement.status}
                    onChange={(value) => handleUpdateStatus(selectedRequirement.id, value)}
                  >
                    <Option value="new">新需求</Option>
                    <Option value="contacted">已联系</Option>
                    <Option value="qualified">已确认</Option>
                    <Option value="quoted">已报价</Option>
                    <Option value="negotiating">谈判中</Option>
                    <Option value="won">成交</Option>
                    <Option value="lost">丢失</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="备注">
                  <Input.TextArea
                    rows={4}
                    value={selectedRequirement.notes}
                    placeholder="添加跟进备注..."
                  />
                </Form.Item>
              </Form>
            </Card>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default CustomerRequirementsPage;
