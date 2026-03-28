import { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Typography, Table, Button, Tag, Skeleton, Space, Badge, theme } from 'antd';
import {
  AppstoreOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  FileTextOutlined,
  MailOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, getProducts, getOrders } from '../services/api';
import type { Product, Order, DashboardStats } from '../types';

const { Title, Text } = Typography;

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  loading: boolean;
  badge?: number;
  onClick?: () => void;
}

function StatCard({ title, value, icon, gradient, loading, badge, onClick }: StatCardProps) {
  const { token } = theme.useToken();
  return (
    <Card
      hoverable
      onClick={onClick}
      style={{ borderRadius: 12, overflow: 'hidden', cursor: onClick ? 'pointer' : 'default' }}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <div
          style={{
            width: 72,
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            color: '#fff',
          }}
        >
          {badge ? <Badge count={badge} size="small" offset={[6, -6]}>{icon}</Badge> : icon}
        </div>
        <div style={{ padding: '16px 20px', flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {title}
          </Text>
          {loading ? (
            <Skeleton.Input active size="small" style={{ width: 60, marginTop: 4 }} />
          ) : (
            <div style={{ fontSize: 28, fontWeight: 700, color: token.colorText, lineHeight: 1.2, marginTop: 2 }}>
              {value.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0, totalCategories: 0, totalOrders: 0,
    totalCustomers: 0, pendingOrders: 0, newRfqs: 0, newContacts: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes, ordersRes] = await Promise.all([
        getDashboardStats(),
        getProducts({ page: 1, pageSize: 5 }),
        getOrders({ page: 1, pageSize: 5 }),
      ]);
      setStats(statsRes.data || stats);
      setRecentProducts(productsRes.data?.items || []);
      setRecentOrders(ordersRes.data?.items || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statCards: StatCardProps[] = [
    { title: 'Products', value: stats.totalProducts, icon: <ShoppingOutlined />, gradient: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)', loading, onClick: () => navigate('/products') },
    { title: 'Orders', value: stats.totalOrders, icon: <ShoppingCartOutlined />, gradient: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)', loading, badge: stats.pendingOrders, onClick: () => navigate('/orders') },
    { title: 'Customers', value: stats.totalCustomers, icon: <TeamOutlined />, gradient: 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)', loading, onClick: () => navigate('/customers') },
    { title: 'Categories', value: stats.totalCategories, icon: <AppstoreOutlined />, gradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)', loading, onClick: () => navigate('/categories') },
  ];

  const alertCards = [
    { label: 'New RFQs', count: stats.newRfqs, color: '#ff4d4f', path: '/rfq-inbox', icon: <FileTextOutlined /> },
    { label: 'New Contacts', count: stats.newContacts, color: '#fa8c16', path: '/contact-inbox', icon: <MailOutlined /> },
    { label: 'Pending Orders', count: stats.pendingOrders, color: '#722ed1', path: '/orders', icon: <ShoppingCartOutlined /> },
  ];

  const statusColors: Record<string, string> = {
    pending: 'gold', confirmed: 'blue', processing: 'cyan', shipped: 'purple', delivered: 'green', cancelled: 'red',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Dashboard</Title>
          <Text type="secondary">Welcome back. Here is your store overview.</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>Refresh</Button>
      </div>

      <Row gutter={[16, 16]}>
        {statCards.map((card, i) => (
          <Col xs={24} sm={12} lg={6} key={i}><StatCard {...card} /></Col>
        ))}
      </Row>

      {!loading && (stats.newRfqs > 0 || stats.newContacts > 0 || stats.pendingOrders > 0) && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {alertCards.filter(a => a.count > 0).map((a, i) => (
            <Col xs={24} sm={8} key={i}>
              <Card hoverable onClick={() => navigate(a.path)} style={{ borderRadius: 12, borderLeft: `4px solid ${a.color}` }} styles={{ body: { padding: '12px 16px' } }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <span style={{ color: a.color, fontSize: 18 }}>{a.icon}</span>
                    <Text strong>{a.label}</Text>
                  </Space>
                  <Badge count={a.count} style={{ backgroundColor: a.color }} />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Recent Orders" extra={<Button type="link" onClick={() => navigate('/orders')} icon={<ArrowRightOutlined />}>View All</Button>} style={{ borderRadius: 12 }}>
            <Table dataSource={recentOrders} rowKey="id" loading={loading} pagination={false} size="small" locale={{ emptyText: 'No orders yet' }}
              columns={[
                { title: 'Order #', dataIndex: 'orderNumber', key: 'orderNumber', render: (v: string) => <Text strong>{v}</Text> },
                { title: 'Customer', key: 'customer', render: (_: unknown, r: Order) => r.customer?.company || r.customer?.name || '—' },
                { title: 'Total', key: 'total', width: 90, render: (_: unknown, r: Order) => `$${Number(r.total || 0).toFixed(2)}` },
                { title: 'Status', dataIndex: 'status', key: 'status', width: 100, render: (v: string) => <Tag color={statusColors[v] || 'default'}>{v}</Tag> },
              ]} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Products" extra={<Button type="link" onClick={() => navigate('/products')} icon={<ArrowRightOutlined />}>View All</Button>} style={{ borderRadius: 12 }}>
            <Table dataSource={recentProducts} rowKey="id" loading={loading} pagination={false} size="small" locale={{ emptyText: 'No products yet' }}
              columns={[
                { title: 'Name', dataIndex: 'name', key: 'name', ellipsis: true, render: (v: string, r: Product) => <a onClick={() => navigate(`/products/${r.id}/edit`)}>{v}</a> },
                { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 120 },
                { title: 'Status', dataIndex: 'status', key: 'status', width: 90, render: (v: string) => <Tag color={v === 'published' ? 'green' : 'gold'}>{v || 'draft'}</Tag> },
              ]} />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24, borderRadius: 12, background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorPrimaryBgHover} 100%)`, border: `1px solid ${token.colorPrimaryBorder}` }}>
        <Space direction="vertical" size={4}>
          <Title level={5} style={{ margin: 0, color: token.colorPrimaryText }}>Quick Actions</Title>
          <Space wrap>
            <Button type="primary" onClick={() => navigate('/products/new')}>Add Product</Button>
            <Button onClick={() => navigate('/categories/new')}>Add Category</Button>
            <Button onClick={() => navigate('/orders')}>View Orders</Button>
            <Button onClick={() => navigate('/rfq-inbox')}>Check RFQ Inbox</Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
}