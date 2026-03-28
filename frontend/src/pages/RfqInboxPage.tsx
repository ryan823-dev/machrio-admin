import { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Segmented, Typography, Card, Drawer, Descriptions, Select, Button, message, Badge, Divider, Input } from 'antd';
import { getRfqSubmissions, updateRfqStatus } from '../services/api';
import type { RfqSubmission } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusColors: Record<string, string> = { new: 'red', contacted: 'blue', quoted: 'cyan', converted: 'green', lost: 'default' };

export default function RfqInboxPage() {
  const [data, setData] = useState<RfqSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<RfqSubmission | null>(null);
  const [notes, setNotes] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, pageSize: 20 };
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await getRfqSubmissions(params as Parameters<typeof getRfqSubmissions>[0]);
      setData(res.data?.items || []);
      setTotal(res.total || res.data?.totalItems || 0);
    } catch { message.error('Failed to load RFQs'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateRfqStatus(id, newStatus, notes || undefined);
      message.success('RFQ status updated');
      fetchData();
      if (selected?.id === id) setSelected({ ...selected, status: newStatus });
    } catch { message.error('Failed to update'); }
  };

  const columns = [
    {
      title: 'Customer', key: 'customer',
      render: (_: unknown, r: RfqSubmission) => (
        <a onClick={() => { setSelected(r); setNotes(r.notes || ''); }} style={{ fontWeight: 500 }}>
          <div>{r.customer?.company || r.customer?.name}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.customer?.name} - {r.customer?.email}</Text>
        </a>
      ),
    },
    {
      title: 'Message', key: 'message', ellipsis: true, width: 300,
      render: (_: unknown, r: RfqSubmission) => <Text type="secondary" ellipsis>{r.inquiry?.message || '—'}</Text>,
    },
    {
      title: 'Qty', key: 'qty', width: 60,
      render: (_: unknown, r: RfqSubmission) => r.inquiry?.quantity || '—',
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 110,
      render: (v: string) => <Badge color={statusColors[v] === 'red' ? 'red' : undefined} dot={v === 'new'}><Tag color={statusColors[v] || 'default'}>{v}</Tag></Badge>,
    },
    {
      title: 'Submitted', dataIndex: 'submittedAt', key: 'submittedAt', width: 110,
      render: (v: string) => v ? new Date(v).toLocaleDateString() : '-',
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>RFQ Inbox</Title>
        <Text type="secondary">Quote requests from customers</Text>
      </div>
      <Card style={{ borderRadius: 12 }}>
        <Segmented style={{ marginBottom: 16 }}
          options={['all', 'new', 'contacted', 'quoted', 'converted', 'lost'].map(v => ({ label: v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1), value: v }))}
          value={statusFilter} onChange={(v) => { setStatusFilter(v as string); setPage(1); }} />
        <Table dataSource={data} columns={columns} rowKey="id" loading={loading}
          onRow={(r) => ({ onClick: () => { setSelected(r); setNotes(r.notes || ''); }, style: { cursor: 'pointer' } })}
          pagination={{ current: page, onChange: setPage, total, pageSize: 20, showSizeChanger: false, showTotal: (t) => `${t} RFQs` }} size="middle" />
      </Card>
      <Drawer title="RFQ Details" open={!!selected} onClose={() => setSelected(null)} width={560}>
        {selected && (
          <>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Company" span={2}>{selected.customer?.company}</Descriptions.Item>
              <Descriptions.Item label="Name">{selected.customer?.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{selected.customer?.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{selected.customer?.phone || '—'}</Descriptions.Item>
              <Descriptions.Item label="Title">{selected.customer?.title || '—'}</Descriptions.Item>
            </Descriptions>
            <Divider>Inquiry</Divider>
            <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <Text>{selected.inquiry?.message}</Text>
              {selected.inquiry?.quantity && <div style={{ marginTop: 8 }}><Text strong>Quantity: </Text><Text>{selected.inquiry.quantity}</Text></div>}
            </div>
            <Divider>Status & Notes</Divider>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <Select value={selected.status} style={{ width: 160 }}
                onChange={(v) => handleStatusChange(selected.id, v)}
                options={['new','contacted','quoted','converted','lost'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))} />
            </div>
            <TextArea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes..." />
            <Button type="primary" style={{ marginTop: 12 }} onClick={() => handleStatusChange(selected.id, selected.status)}>Save Notes</Button>
          </>
        )}
      </Drawer>
    </div>
  );
}