import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Drawer, Form, InputNumber, Select, Switch, Space, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiClient } from '../services/api';

interface ShippingRate {
  id: string;
  shippingMethodId: string;
  shippingMethodName: string;
  countryCode: string;
  baseWeight: number;
  baseRate: number;
  additionalRate: number;
  handlingFee: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  code: string;
}

const ShippingRatesPage: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null);
  const [form] = Form.useForm();
  const [data, setData] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'JP', name: 'Japan' },
    { code: 'CN', name: 'China' },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<ShippingRate[]>('/api/shipping-rates', { page: '0', pageSize: '100' });
      setData(res || []);
    } catch {
      message.error('Failed to load shipping rates');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchShippingMethods = useCallback(async () => {
    try {
      const res = await apiClient.get<ShippingMethod[]>('/api/shipping-methods', { page: '0', pageSize: '100' });
      setShippingMethods(res);
    } catch {
      message.error('Failed to load shipping methods');
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchShippingMethods();
  }, [fetchData, fetchShippingMethods]);

  useEffect(() => {
    if (editingRate) {
      form.setFieldsValue({
        ...editingRate,
        shippingMethodId: editingRate.shippingMethodId,
      });
    }
  }, [editingRate, form]);

  const handleOpenDrawer = (rate?: ShippingRate) => {
    if (rate) {
      setEditingRate(rate);
    } else {
      setEditingRate(null);
      form.resetFields();
    }
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingRate(null);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        baseWeight: parseFloat(values.baseWeight),
        baseRate: parseFloat(values.baseRate),
        additionalRate: parseFloat(values.additionalRate),
        handlingFee: parseFloat(values.handlingFee),
      };

      if (editingRate) {
        await apiClient.put(`/api/shipping-rates/${editingRate.id}`, payload);
        message.success('Shipping rate updated successfully');
      } else {
        await apiClient.post('/api/shipping-rates', payload);
        message.success('Shipping rate created successfully');
      }

      handleCloseDrawer();
      fetchData();
    } catch (error: any) {
      message.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.del(`/api/shipping-rates/${id}`);
      message.success('Shipping rate deleted successfully');
      fetchData();
    } catch (error: any) {
      message.error(error.message || 'Delete failed');
    }
  };

  const columns: ColumnsType<ShippingRate> = [
    {
      title: 'Shipping Method',
      dataIndex: 'shippingMethodName',
      key: 'shippingMethodName',
      width: 180,
    },
    {
      title: 'Country',
      dataIndex: 'countryCode',
      key: 'countryCode',
      width: 120,
      render: (code: string) => {
        const country = countries.find(c => c.code === code);
        return country ? `${country.name}` : code;
      },
    },
    {
      title: 'Base Weight',
      dataIndex: 'baseWeight',
      key: 'baseWeight',
      width: 100,
      render: (weight: number) => `${weight} kg`,
    },
    {
      title: 'Base Rate',
      dataIndex: 'baseRate',
      key: 'baseRate',
      width: 100,
      render: (rate: number) => `$${rate.toFixed(2)}`,
    },
    {
      title: 'Additional Rate',
      dataIndex: 'additionalRate',
      key: 'additionalRate',
      width: 120,
      render: (rate: number) => `$${rate.toFixed(2)}/kg`,
    },
    {
      title: 'Handling Fee',
      dataIndex: 'handlingFee',
      key: 'handlingFee',
      width: 110,
      render: (fee: number) => `$${fee.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      width: 80,
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: ShippingRate) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenDrawer(record)}
          />
          <Popconfirm
            title="Delete Shipping Rate"
            description="Are you sure to delete this shipping rate?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Shipping Rates</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenDrawer()}>
          Add Shipping Rate
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} rates`,
        }}
      />

      <Drawer
        title={editingRate ? 'Edit Shipping Rate' : 'Add Shipping Rate'}
        placement="right"
        width={500}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        extra={
          <Space>
            <Button onClick={handleCloseDrawer}>Cancel</Button>
            <Button type="primary" onClick={handleSave}>
              Save
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Shipping Method"
            name="shippingMethodId"
            rules={[{ required: true, message: 'Please select a shipping method' }]}
          >
            <Select
              placeholder="Select shipping method"
              options={shippingMethods.map(m => ({
                label: m.name,
                value: m.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Country"
            name="countryCode"
            rules={[{ required: true, message: 'Please select a country' }]}
          >
            <Select
              placeholder="Select country"
              options={countries.map(c => ({
                label: c.name,
                value: c.code,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Base Weight (kg)"
            name="baseWeight"
            rules={[{ required: true, message: 'Please enter base weight' }]}
          >
            <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Base Rate ($)"
            name="baseRate"
            rules={[{ required: true, message: 'Please enter base rate' }]}
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Additional Rate ($/kg)"
            name="additionalRate"
            rules={[{ required: true, message: 'Please enter additional rate' }]}
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Handling Fee ($)"
            name="handlingFee"
            rules={[{ required: true, message: 'Please enter handling fee' }]}
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Active"
            name="active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default ShippingRatesPage;
