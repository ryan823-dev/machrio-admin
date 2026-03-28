import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Drawer, Form, InputNumber, Select, Switch, Space, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiClient } from '../services/api';

interface FreeShippingRule {
  id: string;
  shippingMethodId: string;
  shippingMethodName: string;
  countryCode: string;
  minimumAmount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  code: string;
}

const FreeShippingRulesPage: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<FreeShippingRule | null>(null);
  const [form] = Form.useForm();
  const [data, setData] = useState<FreeShippingRule[]>([]);
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
      const res = await apiClient.get<FreeShippingRule[]>('/api/free-shipping-rules', { page: '0', pageSize: '100' });
      setData(res || []);
    } catch {
      message.error('Failed to load free shipping rules');
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
    if (editingRule) {
      form.setFieldsValue({
        ...editingRule,
        shippingMethodId: editingRule.shippingMethodId,
      });
    }
  }, [editingRule, form]);

  const handleOpenDrawer = (rule?: FreeShippingRule) => {
    if (rule) {
      setEditingRule(rule);
    } else {
      setEditingRule(null);
      form.resetFields();
    }
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingRule(null);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        minimumAmount: parseFloat(values.minimumAmount),
      };

      if (editingRule) {
        await apiClient.put(`/api/free-shipping-rules/${editingRule.id}`, payload);
        message.success('Free shipping rule updated successfully');
      } else {
        await apiClient.post('/api/free-shipping-rules', payload);
        message.success('Free shipping rule created successfully');
      }

      handleCloseDrawer();
      fetchData();
    } catch (error: any) {
      message.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.del(`/api/free-shipping-rules/${id}`);
      message.success('Free shipping rule deleted successfully');
      fetchData();
    } catch (error: any) {
      message.error(error.message || 'Delete failed');
    }
  };

  const columns: ColumnsType<FreeShippingRule> = [
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
      width: 150,
      render: (code: string) => {
        const country = countries.find(c => c.code === code);
        return country ? `${country.name}` : code;
      },
    },
    {
      title: 'Minimum Amount',
      dataIndex: 'minimumAmount',
      key: 'minimumAmount',
      width: 130,
      render: (amount: number) => `$${amount.toFixed(2)}`,
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
      render: (_: any, record: FreeShippingRule) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenDrawer(record)}
          />
          <Popconfirm
            title="Delete Free Shipping Rule"
            description="Are you sure to delete this free shipping rule?"
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
        <h1 style={{ margin: 0 }}>Free Shipping Rules</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenDrawer()}>
          Add Free Shipping Rule
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
          showTotal: (total) => `Total ${total} rules`,
        }}
      />

      <Drawer
        title={editingRule ? 'Edit Free Shipping Rule' : 'Add Free Shipping Rule'}
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
            label="Minimum Amount ($)"
            name="minimumAmount"
            rules={[{ required: true, message: 'Please enter minimum amount' }]}
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

export default FreeShippingRulesPage;
