import { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Input, Segmented, Typography, Card, Button, Space, Popconfirm, message, Drawer, Form, Select, Divider } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/api';
import type { Customer } from '../types';
import EmptyState from '../components/EmptyState';

const { Title, Text } = Typography;
const { TextArea } = Input;

const sourceColors: Record<string, string> = { direct: 'blue', rfq: 'green', contact: 'cyan', manual: 'default' };

export default function CustomersPage() {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, pageSize: 20 };
      if (sourceFilter !== 'all') params.source = sourceFilter;
      if (search) params.search = search;
      const res = await getCustomers(params as Parameters<typeof getCustomers>[0]);
      setData(res.data?.items || []);
      setTotal(res.total || res.data?.totalItems || 0);
    } catch { message.error('Failed to load customers'); }
    finally { setLoading(false); }
  }, [page, search, sourceFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDrawer = (customer?: Customer) => {
    setEditingCustomer(customer || null);
    form.resetFields();
    if (customer) form.setFieldsValue(customer);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, values);
        message.success('Customer updated');
      } else {
        await createCustomer(values);
        message.success('Customer created');
      }
      setDrawerOpen(false);
      fetchData();
    } catch (err) { if (err instanceof Error) message.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteCustomer(id); message.success('Customer deleted'); fetchData(); }
    catch { message.error('Failed to delete'); }
  };

  const columns = [
    { title: 'Company', dataIndex: 'company', key: 'company', render: (v: string, r: Customer) => <a onClick={() => openDrawer(r)} style={{ fontWeight: 500 }}>{v}</a> },
    { title: 'Contact', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (v: string) => <Text copyable>{v}</Text> },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 130, render: (v: string) => v || '—' },
    { title: 'Source', dataIndex: 'source', key: 'source', width: 100, render: (v: string) => <Tag color={sourceColors[v] || 'default'}>{v || 'manual'}</Tag> },
    { title: 'Tags', dataIndex: 'tags', key: 'tags', width: 150, render: (v: string[]) => v?.map((t, i) => <Tag key={i}>{t}</Tag>) || '—' },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', width: 110, render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    {
      title: '', key: 'actions', width: 80,
      render: (_: unknown, r: Customer) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openDrawer(r)} />
          <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)} okButtonProps={{ danger: true }}>
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div><Title level={3} style={{ margin: 0 }}>客户管理</Title><Text type="secondary">管理您的客户数据库</Text></div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => openDrawer()}>添加客户</Button>
      </div>
      <Card style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <Segmented options={[{ label: '全部', value: 'all' }, { label: '直接下单', value: 'direct' }, { label: 'RFQ 询价', value: 'rfq' }, { label: '联系表单', value: 'contact' }]}
            value={sourceFilter} onChange={(v) => { setSourceFilter(v as string); setPage(1); }} />
          <Input placeholder="搜索客户..." prefix={<SearchOutlined />} allowClear style={{ width: 280 }}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        {data.length === 0 && !loading ? (
          <EmptyState
            type="customers"
            onPrimaryAction={() => openDrawer()}
            primaryActionText="添加第一个客户"
            showRefresh
          />
        ) : (
          <Table dataSource={data} columns={columns} rowKey="id" loading={loading}
            pagination={{ current: page, onChange: setPage, total, pageSize: 20, showSizeChanger: false, showTotal: (t) => `共 ${t} 个客户` }} size="middle" />
        )}
      </Card>
      <Drawer title={editingCustomer ? 'Edit Customer' : 'New Customer'} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={520}
        extra={<Button type="primary" loading={saving} onClick={handleSave}>{editingCustomer ? 'Save' : 'Create'}</Button>}>
        <Form form={form} layout="vertical" initialValues={{ source: 'manual' }}>
          <Form.Item label="Company" name="company" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Contact Name" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
          <Form.Item label="Phone" name="phone"><Input /></Form.Item>
          <Form.Item label="Job Title" name="title"><Input /></Form.Item>
          <Form.Item label="Source" name="source">
            <Select options={[{ value: 'direct', label: 'Direct Order' }, { value: 'rfq', label: 'RFQ Inquiry' }, { value: 'contact', label: 'Contact Form' }, { value: 'manual', label: 'Manual' }]} />
          </Form.Item>
          <Form.Item label="Tags" name="tags"><Select mode="tags" placeholder="Add tags..." /></Form.Item>
          <Divider />
          <Form.Item label="Internal Notes" name="notes"><TextArea rows={4} /></Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}