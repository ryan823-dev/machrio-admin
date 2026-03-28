import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Tag, Input, Space, Popconfirm, message, Segmented, Typography, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getCategories, deleteCategory } from '../services/api';
import type { Category } from '../types';

const { Title, Text } = Typography;

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, pageSize: 20 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;
      const res = await getCategories(params as Parameters<typeof getCategories>[0]);
      setData(res.data?.items || []);
      setTotal(res.total || res.data?.totalItems || 0);
    } catch {
      message.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      message.success('Category deleted');
      fetchData();
    } catch {
      message.error('Failed to delete category');
    }
  };

  const columns = [
    {
      title: '#',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 60,
      render: (v: number) => <Text type="secondary">{v ?? 0}</Text>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (v: string, r: Category) => (
        <Space>
          {r.iconEmoji && <span>{r.iconEmoji}</span>}
          <a onClick={() => navigate(`/categories/${r.id}/edit`)} style={{ fontWeight: 500 }}>{v}</a>
        </Space>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 200,
      render: (v: string) => <Text type="secondary" code>{v}</Text>,
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 70,
      render: (v: number) => <Tag>{`L${v || 1}`}</Tag>,
    },
    {
      title: 'Featured',
      dataIndex: 'featured',
      key: 'featured',
      width: 80,
      render: (v: boolean) => v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: string) => (
        <Tag color={v === 'published' ? 'blue' : v === 'draft' ? 'gold' : 'default'}>
          {v || 'draft'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (v: string) => v ? new Date(v).toLocaleDateString() : '-',
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_: unknown, r: Category) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/categories/${r.id}/edit`)}
          />
          <Popconfirm
            title="Delete this category?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(r.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Categories</Title>
          <Text type="secondary">Manage your product categories and hierarchy</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => navigate('/categories/new')}
        >
          Add Category
        </Button>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Segmented
            options={[
              { label: 'All', value: 'all' },
              { label: 'Published', value: 'published' },
              { label: 'Draft', value: 'draft' },
            ]}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v as string); setPage(1); }}
          />
          <Input
            placeholder="Search categories..."
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 280 }}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            onChange: setPage,
            total,
            pageSize: 20,
            showSizeChanger: false,
            showTotal: (t) => `${t} categories`,
          }}
          size="middle"
        />
      </Card>
    </div>
  );
}