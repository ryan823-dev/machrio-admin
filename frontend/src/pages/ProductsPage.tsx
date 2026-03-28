import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Tag, Input, Space, Popconfirm, message, Segmented, Typography, Card, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct } from '../services/api';
import type { Product } from '../types';
import EmptyState from '../components/EmptyState';

const { Title, Text } = Typography;

export default function ProductsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Product[]>([]);
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
      const res = await getProducts(params as Parameters<typeof getProducts>[0]);
      setData(res.data?.items || []);
      setTotal(res.total || res.data?.totalItems || 0);
    } catch {
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      message.success('Product deleted');
      fetchData();
    } catch {
      message.error('Failed to delete product');
    }
  };

  const columns = [
    {
      title: '',
      key: 'image',
      width: 50,
      render: (_: unknown, r: Product) => (
        <Avatar
          shape="square"
          size={40}
          src={r.externalImageUrl}
          icon={!r.externalImageUrl ? <ShoppingOutlined /> : undefined}
          style={{ borderRadius: 6, background: r.externalImageUrl ? undefined : '#f0f0f0', color: '#999' }}
        />
      ),
    },
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (v: string, r: Product) => (
        <div>
          <a onClick={() => navigate(`/products/${r.id}/edit`)} style={{ fontWeight: 500 }}>{v}</a>
          {r.shortDescription && (
            <div><Text type="secondary" style={{ fontSize: 12 }} ellipsis>{r.shortDescription}</Text></div>
          )}
        </div>
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 140,
      render: (v: string) => <Text code>{v}</Text>,
    },
    {
      title: 'Category',
      dataIndex: 'primaryCategoryId',
      key: 'category',
      width: 150,
      render: (v: string) => v || <Text type="secondary">—</Text>,
    },
    {
      title: 'Price',
      key: 'price',
      width: 100,
      render: (_: unknown, r: Product) => {
        const price = r.pricing?.basePrice;
        return price != null ? (
          <Text strong>${Number(price).toFixed(2)}</Text>
        ) : (
          <Text type="secondary">—</Text>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (v: string) => {
        const colorMap: Record<string, string> = {
          published: 'green',
          draft: 'gold',
          discontinued: 'red',
        };
        return <Tag color={colorMap[v] || 'default'}>{v || 'draft'}</Tag>;
      },
    },
    {
      title: 'Availability',
      dataIndex: 'availability',
      key: 'availability',
      width: 120,
      render: (v: string) => {
        if (!v) return <Text type="secondary">—</Text>;
        const map: Record<string, { color: string; label: string }> = {
          'in-stock': { color: 'green', label: 'In Stock' },
          'made-to-order': { color: 'blue', label: 'Made to Order' },
          'contact': { color: 'default', label: 'Contact' },
        };
        const info = map[v];
        return info ? <Tag color={info.color}>{info.label}</Tag> : <Tag>{v}</Tag>;
      },
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
      render: (_: unknown, r: Product) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/${r.id}/edit`)}
          />
          <Popconfirm
            title="Delete this product?"
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
          <Title level={3} style={{ margin: 0 }}>商品管理</Title>
          <Text type="secondary">管理您的产品目录</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => navigate('/products/new')}
        >
          添加商品
        </Button>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <Segmented
            options={[
              { label: '全部', value: 'all' },
              { label: '已发布', value: 'published' },
              { label: '草稿', value: 'draft' },
              { label: '已停产', value: 'discontinued' },
            ]}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v as string); setPage(1); }}
          />
          <Input
            placeholder="搜索商品名称或 SKU..."
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 280 }}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {data.length === 0 && !loading ? (
          <EmptyState
            type="products"
            onPrimaryAction={() => navigate('/products/new')}
            primaryActionText="添加第一个商品"
            showRefresh
          />
        ) : (
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
              showTotal: (t) => `共 ${t} 个商品`,
            }}
            size="middle"
          />
        )}
      </Card>
    </div>
  );
}