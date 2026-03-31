import { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Card, Typography, Button, Segmented, Input, Drawer, Descriptions, Divider, message, Space, Statistic, Row, Col, Badge, Popconfirm } from 'antd';
import { SearchOutlined, MessageOutlined, PhoneOutlined, SyncOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getSmsMessages, getSmsNumbers, syncSmsMessages, syncSmsNumbers, deleteSmsMessage, markSmsAsRead, getSmsStats, getSmsBalance } from '../services/api';
import type { SmsMessage, SmsNumber } from '../services/api';
import EmptyState from '../components/EmptyState';

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
  unread: 'red',
  read: 'green',
};

export default function SmsInboxPage() {
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [numbers, setNumbers] = useState<SmsNumber[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [phoneFilter, setPhoneFilter] = useState<string>('');
  const [selected, setSelected] = useState<SmsMessage | null>(null);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });
  const [balance, setBalance] = useState<string>('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: page - 1, size: 20 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.keyword = search;
      if (phoneFilter) params.phoneNumber = phoneFilter;

      const res = await getSmsMessages(params as Parameters<typeof getSmsMessages>[0]);
      const pageData = res.data;
      setMessages(pageData?.items || []);
      setTotal(pageData?.totalItems || 0);
    } catch {
      message.error('加载短信失败');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, phoneFilter]);

  const fetchNumbers = useCallback(async () => {
    try {
      const res = await getSmsNumbers();
      setNumbers(res.data || []);
      if (res.data && res.data.length > 0 && !phoneFilter) {
        setPhoneFilter(res.data[0].phoneNumber);
      }
    } catch {
      console.error('Failed to load numbers');
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [statsRes, balanceRes] = await Promise.all([
        getSmsStats(),
        getSmsBalance()
      ]);
      const statsData = statsRes.data;
      setStats({
        total: statsData?.total ?? 0,
        unread: statsData?.unread ?? 0,
        read: statsData?.read ?? 0,
      });
      setBalance(balanceRes.data || 'N/A');
    } catch {
      console.error('Failed to load stats');
    }
  }, []);

  useEffect(() => {
    fetchNumbers();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await Promise.all([syncSmsMessages(), syncSmsNumbers()]);
      message.success('同步完成');
      fetchData();
      fetchNumbers();
      fetchStats();
    } catch {
      message.error('同步失败');
    } finally {
      setSyncing(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markSmsAsRead(id);
      message.success('已标记为已读');
      fetchData();
      fetchStats();
      if (selected?.id === id) {
        setSelected({ ...selected, status: 'read' });
      }
    } catch {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSmsMessage(id);
      message.success('已删除');
      fetchData();
      fetchStats();
      if (selected?.id === id) {
        setSelected(null);
      }
    } catch {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '发件人',
      key: 'sender',
      width: 140,
      render: (_: unknown, r: SmsMessage) => (
        <a onClick={() => setSelected(r)} style={{ fontWeight: 500 }}>
          {r.senderNumber || '未知'}
        </a>
      ),
    },
    {
      title: '内容',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (v: string) => <Text type="secondary" ellipsis style={{ maxWidth: 400 }}>{v}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (v: string) => (
        <Tag color={statusColors[v] || 'default'}>
          {v === 'unread' ? '未读' : '已读'}
        </Tag>
      ),
    },
    {
      title: '接收时间',
      dataIndex: 'receivedAt',
      key: 'receivedAt',
      width: 150,
      render: (v: string) => v ? new Date(v).toLocaleString() : '-',
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, r: SmsMessage) => (
        <Space size="small">
          {r.status === 'unread' && (
            <Button
              type="text"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={(e) => { e.stopPropagation(); handleMarkAsRead(r.id); }}
            />
          )}
          <Popconfirm
            title="确定删除此短信？"
            onConfirm={(e) => { e?.stopPropagation(); handleDelete(r.id); }}
            onCancel={(e) => e?.stopPropagation()}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>短信收件箱</Title>
        <Text type="secondary">管理租用号码收到的短信</Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="总消息"
              value={stats.total}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="未读消息"
              value={stats.unread}
              valueStyle={{ color: '#cf1322' }}
              prefix={<Badge status="error" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="已读消息"
              value={stats.read}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: 12 }}>
            <Statistic
              title="账户余额"
              value={balance || 'N/A'}
              prefix="$"
            />
          </Card>
        </Col>
      </Row>

      {/* Numbers Info */}
      {numbers.length > 0 && (
        <Card size="small" style={{ marginBottom: 16, borderRadius: 12 }}>
          <Space wrap>
            <PhoneOutlined />
            <Text strong>租用号码：</Text>
            {numbers.map((num) => (
              <Tag
                key={num.id}
                color={phoneFilter === num.phoneNumber ? 'blue' : 'default'}
                style={{ cursor: 'pointer' }}
                onClick={() => { setPhoneFilter(num.phoneNumber); setPage(1); }}
              >
                {num.phoneNumber}
                {num.messageCount !== undefined && ` (${num.messageCount})`}
              </Tag>
            ))}
          </Space>
        </Card>
      )}

      {/* Messages Table */}
      <Card style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <Segmented
            options={[
              { label: '全部', value: 'all' },
              { label: '未读', value: 'unread' },
              { label: '已读', value: 'read' },
            ]}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v as string); setPage(1); }}
          />
          <Space>
            <Input
              placeholder="搜索短信内容..."
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: 220 }}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <Button
              icon={<SyncOutlined spin={syncing} />}
              onClick={handleSync}
              loading={syncing}
            >
              同步
            </Button>
          </Space>
        </div>

        {messages.length === 0 && !loading ? (
          <EmptyState
            type="messages"
            onPrimaryAction={handleSync}
            primaryActionText="同步短信"
            showRefresh
          />
        ) : (
          <Table
            dataSource={messages}
            columns={columns}
            rowKey="id"
            loading={loading}
            onRow={(r) => ({
              onClick: () => setSelected(r),
              style: { cursor: 'pointer' },
            })}
            pagination={{
              current: page,
              onChange: setPage,
              total,
              pageSize: 20,
              showSizeChanger: false,
              showTotal: (t) => `共 ${t} 条短信`,
            }}
            size="middle"
          />
        )}
      </Card>

      {/* Message Detail Drawer */}
      <Drawer
        title="短信详情"
        open={!!selected}
        onClose={() => setSelected(null)}
        width={480}
      >
        {selected && (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="发件人">
                <Text copyable>{selected.senderNumber || '未知'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="收件号码">
                {selected.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="接收时间">
                {selected.receivedAt ? new Date(selected.receivedAt).toLocaleString() : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusColors[selected.status] || 'default'}>
                  {selected.status === 'unread' ? '未读' : '已读'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider>短信内容</Divider>
            <div style={{
              background: '#fafafa',
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              <Text>{selected.message}</Text>
            </div>

            <Space>
              {selected.status === 'unread' && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleMarkAsRead(selected.id)}
                >
                  标记已读
                </Button>
              )}
              <Popconfirm
                title="确定删除此短信？"
                onConfirm={() => handleDelete(selected.id)}
              >
                <Button danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
            </Space>
          </>
        )}
      </Drawer>
    </div>
  );
}