import { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Segmented, Typography, Card, Drawer, Descriptions, Select, Button, message, Divider, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getContactSubmissions, updateContactStatus } from '../services/api';
import type { ContactSubmission } from '../types';
import EmptyState from '../components/EmptyState';

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusColors: Record<string, string> = { new: 'red', replied: 'blue', resolved: 'green' };
const subjectLabels: Record<string, string> = {
  general: 'General Inquiry', support: 'Support', order: 'Order Status',
  return: 'Returns', partnership: 'Partnership', other: 'Other',
};

export default function ContactInboxPage() {
  const [data, setData] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<ContactSubmission | null>(null);
  const [notes, setNotes] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, pageSize: 20 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;
      const res = await getContactSubmissions(params as Parameters<typeof getContactSubmissions>[0]);
      setData(res.data?.items || []);
      setTotal(res.total || res.data?.totalItems || 0);
    } catch { message.error('Failed to load contacts'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateContactStatus(id, newStatus, notes || undefined);
      message.success('Status updated');
      fetchData();
      if (selected?.id === id) setSelected({ ...selected, status: newStatus });
    } catch { message.error('Failed to update'); }
  };

  const columns = [
    {
      title: 'From', key: 'from',
      render: (_: unknown, r: ContactSubmission) => (
        <a onClick={() => { setSelected(r); setNotes(r.notes || ''); }} style={{ fontWeight: 500 }}>
          <div>{r.company ? `${r.company} - ${r.name}` : r.name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.email}</Text>
        </a>
      ),
    },
    {
      title: 'Subject', dataIndex: 'subject', key: 'subject', width: 150,
      render: (v: string) => <Tag>{subjectLabels[v] || v}</Tag>,
    },
    { title: 'Message', dataIndex: 'message', key: 'message', ellipsis: true, width: 300, render: (v: string) => <Text type="secondary" ellipsis>{v}</Text> },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100, render: (v: string) => <Tag color={statusColors[v] || 'default'}>{v}</Tag> },
    { title: 'Submitted', dataIndex: 'submittedAt', key: 'submittedAt', width: 110, render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>联系 inbox</Title>
        <Text type="secondary">客户咨询和支持请求</Text>
      </div>
      <Card style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <Segmented options={['all','new','replied','resolved'].map(v => {
            const labels: Record<string, string> = {
              all: '全部',
              new: '新消息',
              replied: '已回复',
              resolved: '已解决',
            };
            return { label: labels[v] || v, value: v };
          })}
            value={statusFilter} onChange={(v) => { setStatusFilter(v as string); setPage(1); }} />
          <Input placeholder="搜索..." prefix={<SearchOutlined />} allowClear style={{ width: 260 }}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        {data.length === 0 && !loading ? (
          <EmptyState
            type="messages"
            onPrimaryAction={() => {}}
            primaryActionText="暂无操作"
            showRefresh
          />
        ) : (
          <Table dataSource={data} columns={columns} rowKey="id" loading={loading}
            onRow={(r) => ({ onClick: () => { setSelected(r); setNotes(r.notes || ''); }, style: { cursor: 'pointer' } })}
            pagination={{ current: page, onChange: setPage, total, pageSize: 20, showSizeChanger: false, showTotal: (t) => `共 ${t} 条消息` }} size="middle" />
        )}
      </Card>
      <Drawer title="Contact Details" open={!!selected} onClose={() => setSelected(null)} width={520}>
        {selected && (
          <>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Name">{selected.name}</Descriptions.Item>
              <Descriptions.Item label="Email"><Text copyable>{selected.email}</Text></Descriptions.Item>
              <Descriptions.Item label="Phone">{selected.phone || '—'}</Descriptions.Item>
              <Descriptions.Item label="Company">{selected.company || '—'}</Descriptions.Item>
              <Descriptions.Item label="Subject" span={2}><Tag>{subjectLabels[selected.subject] || selected.subject}</Tag></Descriptions.Item>
            </Descriptions>
            <Divider>Message</Divider>
            <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 16, whiteSpace: 'pre-wrap' }}>
              <Text>{selected.message}</Text>
            </div>
            <Divider>Status & Notes</Divider>
            <Select value={selected.status} style={{ width: 160, marginBottom: 12 }}
              onChange={(v) => handleStatusChange(selected.id, v)}
              options={['new','replied','resolved'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))} />
            <TextArea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes..." />
            <Button type="primary" style={{ marginTop: 12 }} onClick={() => handleStatusChange(selected.id, selected.status)}>Save Notes</Button>
          </>
        )}
      </Drawer>
    </div>
  );
}