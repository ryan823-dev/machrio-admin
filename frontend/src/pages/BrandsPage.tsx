import { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Input, Typography, Card, Button, Space, Popconfirm, message, Drawer, Form, Switch, Divider } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getBrands, createBrand, updateBrand, deleteBrand } from '../services/api';
import type { Brand } from '../types';
import EmptyState from '../components/EmptyState';

const { Title, Text } = Typography;
const { TextArea } = Input;

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function BrandsPage() {
  const [data, setData] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBrands({ page, pageSize: 20, search: search || undefined });
      setData(res.data?.items || []);
      setTotal(res.total || res.data?.totalItems || 0);
    } catch { message.error('Failed to load brands'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDrawer = (brand?: Brand) => {
    setEditingBrand(brand || null);
    setSlugEdited(!!brand);
    form.resetFields();
    if (brand) form.setFieldsValue(brand);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingBrand) { await updateBrand(editingBrand.id, values); message.success('Brand updated'); }
      else { await createBrand(values); message.success('Brand created'); }
      setDrawerOpen(false); fetchData();
    } catch (err) { if (err instanceof Error) message.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteBrand(id); message.success('Brand deleted'); fetchData(); }
    catch { message.error('Failed to delete'); }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (v: string, r: Brand) => <a onClick={() => openDrawer(r)} style={{ fontWeight: 500 }}>{v}</a> },
    { title: 'Slug', dataIndex: 'slug', key: 'slug', render: (v: string) => <Text code>{v}</Text> },
    { title: 'Website', dataIndex: 'website', key: 'website', ellipsis: true, render: (v: string) => v ? <a href={v} target="_blank" rel="noopener noreferrer">{v}</a> : '—' },
    { title: 'Featured', dataIndex: 'featured', key: 'featured', width: 80, render: (v: boolean) => v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag> },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', width: 110, render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    {
      title: '', key: 'actions', width: 80,
      render: (_: unknown, r: Brand) => (
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
        <div><Title level={3} style={{ margin: 0 }}>品牌管理</Title><Text type="secondary">管理产品品牌</Text></div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => openDrawer()}>添加品牌</Button>
      </div>
      <Card style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <Input placeholder="搜索品牌..." prefix={<SearchOutlined />} allowClear style={{ width: 280 }}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        {data.length === 0 && !loading ? (
          <EmptyState
            type="brands"
            onPrimaryAction={() => openDrawer()}
            primaryActionText="添加第一个品牌"
            showRefresh
          />
        ) : (
          <Table dataSource={data} columns={columns} rowKey="id" loading={loading}
            pagination={{ current: page, onChange: setPage, total, pageSize: 20, showSizeChanger: false, showTotal: (t) => `共 ${t} 个品牌` }} size="middle" />
        )}
      </Card>
      <Drawer title={editingBrand ? 'Edit Brand' : 'New Brand'} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={520}
        extra={<Button type="primary" loading={saving} onClick={handleSave}>{editingBrand ? 'Save' : 'Create'}</Button>}>
        <Form form={form} layout="vertical" initialValues={{ featured: false }}>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input onChange={(e) => { if (!slugEdited) form.setFieldValue('slug', slugify(e.target.value)); }} />
          </Form.Item>
          <Form.Item label="Slug" name="slug" rules={[{ required: true }]}>
            <Input addonBefore="/" onChange={() => setSlugEdited(true)} />
          </Form.Item>
          <Form.Item label="Logo URL" name="logo"><Input placeholder="https://..." /></Form.Item>
          <Form.Item label="Website" name="website"><Input placeholder="https://..." /></Form.Item>
          <Form.Item label="Featured" name="featured" valuePropName="checked"><Switch /></Form.Item>
          <Divider />
          <Form.Item label="Description" name="description"><TextArea rows={4} /></Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}