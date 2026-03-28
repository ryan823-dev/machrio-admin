import { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Input, Typography, Card, Button, Space, Popconfirm, message, Drawer, Form, Divider, Row, Col, Select } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getGlossaryTerms, createGlossaryTerm, updateGlossaryTerm, deleteGlossaryTerm } from '../services/api';
import type { GlossaryTerm } from '../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function GlossaryTermsPage() {
  const [data, setData] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getGlossaryTerms({ page, pageSize: 20, search: search || undefined });
      setData(res.data?.items || []);
      setTotal(res.total || res.data?.totalItems || 0);
    } catch { message.error('Failed to load glossary terms'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDrawer = (term?: GlossaryTerm) => {
    setEditingTerm(term || null);
    setSlugEdited(!!term);
    form.resetFields();
    if (term) form.setFieldsValue(term);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingTerm) { await updateGlossaryTerm(editingTerm.id, values); message.success('Glossary term updated'); }
      else { await createGlossaryTerm(values); message.success('Glossary term created'); }
      setDrawerOpen(false); fetchData();
    } catch (err) { if (err instanceof Error) message.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteGlossaryTerm(id); message.success('Glossary term deleted'); fetchData(); }
    catch { message.error('Failed to delete'); }
  };

  const columns = [
    { title: 'Term', dataIndex: 'term', key: 'term', render: (v: string, r: GlossaryTerm) => <a onClick={() => openDrawer(r)} style={{ fontWeight: 500 }}>{v}</a> },
    { title: 'Slug', dataIndex: 'slug', key: 'slug', render: (v: string) => <Text code>{v}</Text> },
    { title: 'Category', dataIndex: 'categorySlug', key: 'categorySlug', width: 150, render: (v: string) => v || '—' },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100, render: (v: string) => {
        const colors: Record<string, string> = { published: 'green', draft: 'orange', archived: 'red' };
        return <Tag color={colors[v] || 'default'}>{v}</Tag>;
      }
    },
    {
      title: '', key: 'actions', width: 80,
      render: (_: unknown, r: GlossaryTerm) => (
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
        <div><Title level={3} style={{ margin: 0 }}>Glossary Terms</Title><Text type="secondary">Manage SEO glossary definitions</Text></div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => openDrawer()}>Add Term</Button>
      </div>
      <Card style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <Input placeholder="Search terms..." prefix={<SearchOutlined />} allowClear style={{ width: 280 }}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Table dataSource={data} columns={columns} rowKey="id" loading={loading}
          pagination={{ current: page, onChange: setPage, total, pageSize: 20, showSizeChanger: false, showTotal: (t) => `${t} terms` }} size="middle" />
      </Card>
      <Drawer title={editingTerm ? 'Edit Glossary Term' : 'New Glossary Term'} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={640}
        extra={<Button type="primary" loading={saving} onClick={handleSave}>{editingTerm ? 'Save' : 'Create'}</Button>}>
        <Form form={form} layout="vertical" initialValues={{ status: 'published', displayOrder: 0 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Term" name="term" rules={[{ required: true, message: 'Term is required' }]}>
                <Input onChange={(e) => { if (!slugEdited) form.setFieldValue('slug', slugify(e.target.value)); }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Slug" name="slug" rules={[{ required: true, message: 'Slug is required' }]}>
                <Input addonBefore="/" onChange={() => setSlugEdited(true)} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Short Definition" name="shortDefinition" rules={[{ required: true, message: 'Definition is required' }]} extra="Brief definition (1-2 sentences)">
            <TextArea rows={2} showCount maxLength={300} />
          </Form.Item>
          <Form.Item label="Full Description" name="fullDescription" extra="Detailed explanation (optional)">
            <TextArea rows={4} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Category" name="categorySlug"><Input placeholder="e.g. technical" /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Display Order" name="displayOrder"><Input type="number" min={0} /></Form.Item>
            </Col>
          </Row>
          <Form.Item label="Synonyms" name="synonyms" extra="Comma-separated alternative terms">
            <Select mode="tags" placeholder="Add synonyms" />
          </Form.Item>
          <Form.Item label="Related Terms" name="relatedTerms"><Input placeholder="Comma-separated related terms" /></Form.Item>
          <Divider />
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Status" name="status">
                <Select options={[
                  { value: 'published', label: 'Published' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'archived', label: 'Archived' }
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Meta Title" name="metaTitle"><Input showCount maxLength={60} /></Form.Item>
            </Col>
          </Row>
          <Form.Item label="Meta Description" name="metaDescription"><TextArea rows={2} showCount maxLength={160} /></Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
