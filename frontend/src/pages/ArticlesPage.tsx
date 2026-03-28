import { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Input, Typography, Card, Button, Space, Popconfirm, message, Drawer, Form, Switch, Divider, Row, Col, Select } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getArticles, createArticle, updateArticle, deleteArticle } from '../services/api';
import type { Article } from '../types';
import RichTextEditor from '../components/RichTextEditor';

const { Title, Text } = Typography;

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function ArticlesPage() {
  const [data, setData] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [contentHtml, setContentHtml] = useState<string>('');
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getArticles({ page, pageSize: 20, search: search || undefined });
      setData(res.data?.items || []);
      setTotal(res.total || res.data?.totalItems || 0);
    } catch { message.error('Failed to load articles'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openDrawer = (article?: Article) => {
    setEditingArticle(article || null);
    setSlugEdited(!!article);
    setContentHtml(article?.content?.html || '');
    form.resetFields();
    if (article) form.setFieldsValue(article);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = {
        ...values,
        content: { html: contentHtml, text: contentHtml.replace(/<[^>]*>/g, '').substring(0, 500) }
      };
      if (editingArticle) { await updateArticle(editingArticle.id, payload); message.success('Article updated'); }
      else { await createArticle(payload); message.success('Article created'); }
      setDrawerOpen(false); fetchData();
    } catch (err) { if (err instanceof Error) message.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteArticle(id); message.success('Article deleted'); fetchData(); }
    catch { message.error('Failed to delete'); }
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title', render: (v: string, r: Article) => <a onClick={() => openDrawer(r)} style={{ fontWeight: 500 }}>{v}</a> },
    { title: 'Slug', dataIndex: 'slug', key: 'slug', render: (v: string) => <Text code>{v}</Text> },
    { title: 'Author', dataIndex: 'author', key: 'author', width: 120 },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100, render: (v: string) => {
        const colors: Record<string, string> = { published: 'green', draft: 'orange', archived: 'red' };
        return <Tag color={colors[v] || 'default'}>{v}</Tag>;
      }
    },
    { title: 'Featured', dataIndex: 'featured', key: 'featured', width: 80, render: (v: boolean) => v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag> },
    { title: 'Published', dataIndex: 'publishedAt', key: 'publishedAt', width: 110, render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    {
      title: '', key: 'actions', width: 80,
      render: (_: unknown, r: Article) => (
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
        <div><Title level={3} style={{ margin: 0 }}>Articles</Title><Text type="secondary">Manage knowledge center articles</Text></div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => openDrawer()}>Add Article</Button>
      </div>
      <Card style={{ borderRadius: 12 }}>
        <div style={{ marginBottom: 16 }}>
          <Input placeholder="Search articles..." prefix={<SearchOutlined />} allowClear style={{ width: 280 }}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Table dataSource={data} columns={columns} rowKey="id" loading={loading}
          pagination={{ current: page, onChange: setPage, total, pageSize: 20, showSizeChanger: false, showTotal: (t) => `${t} articles` }} size="middle" />
      </Card>
      <Drawer title={editingArticle ? 'Edit Article' : 'New Article'} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={720}
        extra={<Button type="primary" loading={saving} onClick={handleSave}>{editingArticle ? 'Save' : 'Create'}</Button>}>
        <Form form={form} layout="vertical" initialValues={{ featured: false, status: 'draft', displayOrder: 0 }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Title is required' }]}>
                <Input onChange={(e) => { if (!slugEdited) form.setFieldValue('slug', slugify(e.target.value)); }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Slug" name="slug" rules={[{ required: true, message: 'Slug is required' }]}>
                <Input addonBefore="/" onChange={() => setSlugEdited(true)} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Short Description" name="shortDescription" extra="Brief summary for listings (max 200 chars)">
            <TextArea rows={2} showCount maxLength={200} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Author" name="author"><Input placeholder="Author name" /></Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Category Slug" name="categorySlug"><Input placeholder="e.g. buying-guides" /></Form.Item>
            </Col>
          </Row>
          <Form.Item label="Cover Image URL" name="coverImageUrl"><Input placeholder="https://example.com/cover.jpg" /></Form.Item>
          <Form.Item label="Tags" name="tags">
            <Select mode="tags" placeholder="Add tags" />
          </Form.Item>
          <Divider />
          <Form.Item label="Content" name="content" extra="Full article content with rich text formatting">
            <RichTextEditor value={contentHtml} onChange={setContentHtml} height={400} placeholder="Write your article content here..." />
          </Form.Item>
          <Divider />
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Status" name="status">
                <Select options={[
                  { value: 'published', label: 'Published' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'archived', label: 'Archived' }
                ]} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Display Order" name="displayOrder">
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Featured" name="featured" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          <Form.Item label="Meta Title" name="metaTitle"><Input showCount maxLength={60} /></Form.Item>
          <Form.Item label="Meta Description" name="metaDescription"><TextArea rows={2} showCount maxLength={160} /></Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
