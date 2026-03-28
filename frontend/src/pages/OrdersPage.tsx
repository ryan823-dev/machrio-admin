import { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Input, Space, Segmented, Typography, Card, Drawer, Descriptions, Select, message, Badge, Divider } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getOrders, updateOrder } from '../services/api';
import type { Order } from '../types';
import EmptyState from '../components/EmptyState';

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
  pending: 'gold', confirmed: 'blue', processing: 'cyan', shipped: 'purple',
  delivered: 'green', cancelled: 'red', refunded: 'default',
};
const paymentColors: Record<string, string> = { paid: 'green', unpaid: 'volcano', refunded: 'default' };

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, pageSize: 20 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;
      const res = await getOrders(params as Parameters<typeof getOrders>[0]);
      setData(res.data?.items || []);
      setTotal(res.total || res.data?.totalItems || 0);
    } catch { message.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = async (order: Order, newStatus: string) => {
    try {
      await updateOrder(order.id, { ...order, status: newStatus });
      message.success('Order status updated');
      fetchData();
      if (selectedOrder?.id === order.id) setSelectedOrder({ ...order, status: newStatus });
    } catch { message.error('Failed to update status'); }
  };

  const columns = [
    {
      title: 'Order #', dataIndex: 'orderNumber', key: 'orderNumber', width: 160,
      render: (v: string, r: Order) => <a onClick={() => setSelectedOrder(r)} style={{ fontWeight: 600 }}>{v}</a>,
    },
    {
      title: 'Customer', key: 'customer', ellipsis: true,
      render: (_: unknown, r: Order) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.customer?.company || '—'}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.customer?.name}</Text>
        </div>
      ),
    },
    {
      title: 'Total', key: 'total', width: 110,
      render: (_: unknown, r: Order) => <Text strong>{r.currency || '$'}{Number(r.total || 0).toFixed(2)}</Text>,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status', width: 120,
      render: (v: string) => <Tag color={statusColors[v] || 'default'}>{v}</Tag>,
    },
    {
      title: 'Payment', dataIndex: 'paymentStatus', key: 'paymentStatus', width: 100,
      render: (v: string) => <Tag color={paymentColors[v] || 'default'}>{v}</Tag>,
    },
    {
      title: 'Created', dataIndex: 'createdAt', key: 'createdAt', width: 110,
      render: (v: string) => v ? new Date(v).toLocaleDateString() : '-',
    },
  ];

  const items = selectedOrder?.items || [];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>订单管理</Title>
        <Text type="secondary">管理客户订单和履约</Text>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <Segmented
            options={['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered'].map(v => {
              const labels: Record<string, string> = {
                all: '全部',
                pending: '待处理',
                confirmed: '已确认',
                processing: '处理中',
                shipped: '已发货',
                delivered: '已送达',
              };
              return { label: labels[v] || v, value: v };
            })}
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v as string); setPage(1); }}
          />
          <Input placeholder="搜索订单号..." prefix={<SearchOutlined />} allowClear style={{ width: 260 }}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        {data.length === 0 && !loading ? (
          <EmptyState
            type="orders"
            onPrimaryAction={() => {}}
            primaryActionText="暂无操作"
            showRefresh
          />
        ) : (
          <Table dataSource={data} columns={columns} rowKey="id" loading={loading}
            onRow={(r) => ({ onClick: () => setSelectedOrder(r), style: { cursor: 'pointer' } })}
            pagination={{ current: page, onChange: setPage, total, pageSize: 20, showSizeChanger: false, showTotal: (t) => `共 ${t} 个订单` }}
            size="middle" />
        )}
      </Card>

      <Drawer title={<Space><Badge status={selectedOrder?.status === 'delivered' ? 'success' : 'processing'} />{selectedOrder?.orderNumber}</Space>}
        open={!!selectedOrder} onClose={() => setSelectedOrder(null)} width={640}>
        {selectedOrder && (
          <>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Status">
                <Select value={selectedOrder.status} style={{ width: 140 }}
                  onChange={(v) => handleStatusChange(selectedOrder, v)}
                  options={['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))} />
              </Descriptions.Item>
              <Descriptions.Item label="Payment"><Tag color={paymentColors[selectedOrder.paymentStatus] || 'default'}>{selectedOrder.paymentStatus}</Tag></Descriptions.Item>
              <Descriptions.Item label="Total" span={2}><Text strong style={{ fontSize: 18 }}>{selectedOrder.currency || '$'}{Number(selectedOrder.total || 0).toFixed(2)}</Text></Descriptions.Item>
            </Descriptions>
            <Divider>Customer</Divider>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Company">{selectedOrder.customer?.company}</Descriptions.Item>
              <Descriptions.Item label="Name">{selectedOrder.customer?.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedOrder.customer?.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{selectedOrder.customer?.phone || '—'}</Descriptions.Item>
            </Descriptions>
            {items.length > 0 && (
              <>
                <Divider>Items ({items.length})</Divider>
                <Table dataSource={items} rowKey={(_, i) => String(i)} size="small" pagination={false}
                  columns={[
                    { title: 'Product', dataIndex: 'productName', key: 'productName' },
                    { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 100 },
                    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', width: 60 },
                    { title: 'Price', dataIndex: 'unitPrice', key: 'unitPrice', width: 80, render: (v: number) => `$${Number(v || 0).toFixed(2)}` },
                    { title: 'Total', dataIndex: 'lineTotal', key: 'lineTotal', width: 80, render: (v: number) => `$${Number(v || 0).toFixed(2)}` },
                  ]} />
              </>
            )}
            {selectedOrder.shipping && (
              <>
                <Divider>Shipping</Divider>
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="Address" span={2}>{selectedOrder.shipping.address}</Descriptions.Item>
                  <Descriptions.Item label="City">{selectedOrder.shipping.city}</Descriptions.Item>
                  <Descriptions.Item label="State">{selectedOrder.shipping.state}</Descriptions.Item>
                  <Descriptions.Item label="Country">{selectedOrder.shipping.country}</Descriptions.Item>
                  <Descriptions.Item label="Tracking">{selectedOrder.shipping.trackingNumber || '—'}</Descriptions.Item>
                </Descriptions>
              </>
            )}
            {selectedOrder.customerNotes && (
              <><Divider>Customer Notes</Divider><Text>{selectedOrder.customerNotes}</Text></>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}