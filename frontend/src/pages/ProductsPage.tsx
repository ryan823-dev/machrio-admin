import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Tag, Input, Space, Popconfirm, message, Segmented, Typography, Card, Avatar, Select, DatePicker, Row, Col, Form, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ShoppingOutlined, ReloadOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct, getTopLevelCategories, getAllBrands } from '../services/api';
import type { Product, Category, Brand } from '../types';
import EmptyState from '../components/EmptyState';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function ProductsPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // 筛选状态
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [skuSearch, setSkuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>();
  const [selectedAvailability, setSelectedAvailability] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // 下拉选项数据
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // 加载分类和品牌
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          getTopLevelCategories(),
          getAllBrands().catch(() => ({ data: [] as Brand[] })),
        ]);
        setCategories(catRes.data || []);
        setBrands((brandRes as { data: Brand[] }).data || []);
      } catch {
        // ignore
      }
    };
    loadOptions();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = { page, pageSize: 20 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;
      if (skuSearch) params.sku = skuSearch;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedBrand) params.brandId = selectedBrand;
      if (selectedAvailability) params.availability = selectedAvailability;
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      const res = await getProducts(params as Parameters<typeof getProducts>[0]);
      setData(res.data?.items || []);
      setTotal(res.total || res.data?.totalItems || 0);
    } catch {
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, skuSearch, selectedCategory, selectedBrand, selectedAvailability, dateRange]);

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

  const handleReset = () => {
    setSearch('');
    setSkuSearch('');
    setStatusFilter('all');
    setSelectedCategory(undefined);
    setSelectedBrand(undefined);
    setSelectedAvailability(undefined);
    setDateRange(null);
    setPage(1);
    form.resetFields();
  };

  const handleSearch = () => {
    setPage(1);
    fetchData();
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
        <Tooltip title={v} placement="topLeft">
          <div>
            <a onClick={() => navigate(`/products/${r.id}/edit`)} style={{ fontWeight: 500 }}>{v}</a>
            {r.shortDescription && (
              <Tooltip title={r.shortDescription} placement="topLeft">
                <div><Text type="secondary" style={{ fontSize: 12 }} ellipsis>{r.shortDescription}</Text></div>
              </Tooltip>
            )}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 140,
      render: (v: string) => (
        <Tooltip title={v} placement="topLeft">
          <Text code>{v}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Category',
      key: 'category',
      width: 180,
      ellipsis: true,
      render: (_: unknown, r: Product) => {
        // 解析 categories 字段
        let categoryPath = '';
        if (r.categories && Array.isArray(r.categories)) {
          // 按 level 排序后拼接名称
          const sortedCategories = [...r.categories]
            .filter(c => c && c.name)
            .sort((a, b) => ((a.level as number) || 1) - ((b.level as number) || 1));
          categoryPath = sortedCategories.map(c => c.name).join(' > ');
        }
        
        if (!categoryPath) {
          return <Text type="secondary">—</Text>;
        }
        
        return (
          <Tooltip title={categoryPath} placement="topLeft">
            <Text ellipsis style={{ maxWidth: 170 }}>{categoryPath}</Text>
          </Tooltip>
        );
      },
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
          'out-of-stock': { color: 'red', label: 'Out of Stock' },
          'made-to-order': { color: 'blue', label: 'Made to Order' },
          'preorder': { color: 'purple', label: 'Preorder' },
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
        {/* 筛选区域 */}
        <div style={{ marginBottom: 16 }}>
          {/* 基础筛选：状态tabs + 搜索 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
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
            <Space>
              <Input
                placeholder="搜索商品名称..."
                prefix={<SearchOutlined />}
                allowClear
                style={{ width: 220 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={handleSearch}
              />
              <Button type="primary" onClick={handleSearch}>查询</Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>重置</Button>
              <Button type="link" onClick={() => setFiltersExpanded(!filtersExpanded)}>
                {filtersExpanded ? <>收起 <UpOutlined /></> : <>展开筛选 <DownOutlined /></>}
              </Button>
            </Space>
          </div>

          {/* 高级筛选 */}
          {filtersExpanded && (
            <Card size="small" style={{ background: '#fafafa', borderRadius: 8 }}>
              <Row gutter={[16, 12]}>
                <Col xs={24} sm={12} md={6}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>SKU 精确搜索</Text>
                    <Input
                      placeholder="输入 SKU..."
                      allowClear
                      value={skuSearch}
                      onChange={(e) => setSkuSearch(e.target.value)}
                      onPressEnter={handleSearch}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>商品分类</Text>
                    <Select
                      placeholder="选择分类"
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      style={{ width: '100%' }}
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                      options={categories.map(c => ({ value: c.id, label: c.name }))}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>品牌</Text>
                    <Select
                      placeholder="选择品牌"
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      style={{ width: '100%' }}
                      value={selectedBrand}
                      onChange={setSelectedBrand}
                      options={brands.map(b => ({ value: b.id, label: b.name }))}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>库存状态</Text>
                    <Select
                      placeholder="选择库存状态"
                      allowClear
                      style={{ width: '100%' }}
                      value={selectedAvailability}
                      onChange={setSelectedAvailability}
                      options={[
                        { value: 'in-stock', label: '有货 (In Stock)' },
                        { value: 'out-of-stock', label: '缺货 (Out of Stock)' },
                        { value: 'preorder', label: '预售 (Preorder)' },
                        { value: 'made-to-order', label: '按单生产 (Made to Order)' },
                        { value: 'contact', label: '联系确认 (Contact)' },
                      ]}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={24} md={12}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>创建时间</Text>
                    <RangePicker
                      style={{ width: '100%' }}
                      value={dateRange as [dayjs.Dayjs, dayjs.Dayjs] | null}
                      onChange={(dates) => setDateRange(dates)}
                      presets={[
                        { label: '今天', value: [dayjs(), dayjs()] },
                        { label: '最近7天', value: [dayjs().subtract(7, 'day'), dayjs()] },
                        { label: '最近30天', value: [dayjs().subtract(30, 'day'), dayjs()] },
                        { label: '本月', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
                        { label: '上月', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] },
                      ]}
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          )}
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