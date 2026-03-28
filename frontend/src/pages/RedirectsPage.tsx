import { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Input, Typography, Card, Button, Space, Popconfirm, message, Drawer, Form, Switch, Select } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { getRedirects, createRedirect, updateRedirect, deleteRedirect } from '../services/api';
import type { Redirect } from '../types';

const { Title, Text } = Typography;

export default function RedirectsPage() {
  const [data, setData] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRedirects({ page, pageSize: 20, search: search || undefined });
      setData(res.data?.items || []);
      setTotal(res.total || res.data?.totalItems || 0);
    } catch { message.error('Failed to load redirects'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDrawer = (redirect?: Redirect) => {
    setEditingRedirect(redirect || null);
    form.resetFields();
    if (redirect) form.setFieldsValue(redirect);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingRedirect) { await updateRedirect(editingRedirect.id, values); message.success('Redirect updated'); }
      else { await createRedirect(values); message.success('Redirect created'); }
      setDrawerOpen(false); fetchData();
    } catch (err) { if (err instanceof Error) message.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteRedirect(id); message.success('Redirect deleted'); fetchData(); }
    catch { message.error('Failed to delete'); }
  };

  const columns = [
    { title: 'Source URL', dataIndex: 'sourceUrl', key: 'sourceUrl', render: (v: string) => <Text code>{v}</Text> },
    { title: 'Destination URL', dataIndex: 'destinationUrl', key: 'destinationUrl', render: (v: string) => <a href={v} target="_blank" rel="noopener noreferrer">{v}</a> },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 100, render: (v: string) => {
        const colors: Record<string, string> = { Permanent: 'green', Temporary: 'orange' };
        const labels: Record<string, string> = { Permanent: '301', Temporary: '302' };
        return <Tag color={colors[v] || 'default'}>{labels[v] || v}</Tag>;
      }
    },
    { title: 'Active', dataIndex: 'active', key: 'active', width: 80, render: (v: boolean) => v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag> },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', width: 110, render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    {
      title: '', key: 'actions', width: 80,
      render: (_: unknown, r: Redirect) => (
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
        <div><Title level={3} style={{ margin: 0 }}>Redirects</Title><Text type="secondary">Manage SEO URL redirects (301/302)</Text></div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => openDrawer()}>Add Redirect</Button>
      </div>
      <Card style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <Input placeholder="Search redirects..." prefix={<SearchOutlined />} allowClear style={{ width: 280 }}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Table dataSource={data} columns={columns} rowKey="id" loading={loading}
          pagination={{ current: page, onChange: setPage, total, pageSize: 20, showSizeChanger: false, showTotal: (t) => `${t} redirects` }} size="middle" />
      </Card>
      <Drawer title={editingRedirect ? 'Edit Redirect' : 'New Redirect'} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={560}
        extra={<Button type="primary" loading={saving} onClick={handleSave}>{editingRedirect ? 'Save' : 'Create'}</Button>}>
        <Form form={form} layout="vertical" initialValues={{ type: 'Permanent', active: true }}>
          <Form.Item label="Source URL" name="sourceUrl" rules={[{ required: true, message: 'Source URL is required' }]} extra="The old URL path (e.g., /old-page)">
            <Input addonBefore="/" placeholder="old-page" />
          </Form.Item>
          <Form.Item label="Destination URL" name="destinationUrl" rules={[{ required: true, message: 'Destination URL is required' }]} extra="The new URL (full URL or path)">
            <Input placeholder="https://example.com/new-page or /new-page" />
          </Form.Item>
          <Form.Item label="Redirect Type" name="type">
            <Select options={[
              { value: 'Permanent', label: '301 - Permanent' },
              { value: 'Temporary', label: '302 - Temporary' }
            ]} />
          </Form.Item>
          <Form.Item label="Active" name="active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Card size="small" style={{ marginTop: 16, background: '#f5f5f5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LinkOutlined style={{ color: '#1890ff' }} />
              <Text strong>Preview:</Text>
              <Text code style={{ marginLeft: 8 }}>
                {form.getFieldValue('sourceUrl') ? `/${form.getFieldValue('sourceUrl')}` : '/source'} → {form.getFieldValue('destinationUrl') || 'destination'}
              </Text>
            </div>
          </Card>
        </Form>
      </Drawer>
    </div>
  );
}
