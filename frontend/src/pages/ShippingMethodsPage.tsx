import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Drawer, Form, Input, InputNumber, Switch, Space, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiClient } from '../services/api';

interface ShippingMethod {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  transitDays?: number;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const ShippingMethodsPage: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  const [form] = Form.useForm();
  const [data, setData] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<ShippingMethod[]>('/api/shipping-methods', { page: '0', pageSize: '100' });
      setData(res || []);
    } catch {
      message.error('Failed to load shipping methods');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (editingMethod) {
      form.setFieldsValue(editingMethod);
    }
  }, [editingMethod, form]);

  const handleOpenDrawer = (method?: ShippingMethod) => {
    if (method) {
      setEditingMethod(method);
    } else {
      setEditingMethod(null);
      form.resetFields();
    }
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingMethod(null);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingMethod) {
        await apiClient.put(`/api/shipping-methods/${editingMethod.id}`, values);
        message.success('Shipping method updated successfully');
      } else {
        await apiClient.post('/api/shipping-methods', values);
        message.success('Shipping method created successfully');
      }

      handleCloseDrawer();
      fetchData();
    } catch (error: any) {
      message.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.del(`/api/shipping-methods/${id}`);
      message.success('Shipping method deleted successfully');
      fetchData();
    } catch (error: any) {
      message.error(error.message || 'Delete failed');
    }
  };

  const columns: ColumnsType<ShippingMethod> = [
    {
      title: 'Icon',
      dataIndex: 'icon',
      key: 'icon',
      width: 80,
      render: (icon?: string) => (
        <span style={{ fontSize: 24 }}>{icon || '📦'}</span>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Transit Days',
      dataIndex: 'transitDays',
      key: 'transitDays',
      width: 100,
      render: (days?: number) => (days ? `${days} days` : '-'),
    },
    {
      title: 'Sort Order',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      sorter: (a, b) => a.sortOrder - b.sortOrder,
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
      render: (_: any, record: ShippingMethod) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenDrawer(record)}
          />
          <Popconfirm
            title="Delete Shipping Method"
            description="Are you sure to delete this shipping method?"
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
        <h1 style={{ margin: 0 }}>Shipping Methods</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenDrawer()}>
          Add Shipping Method
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
          showTotal: (total) => `Total ${total} methods`,
        }}
      />

      <Drawer
        title={editingMethod ? 'Edit Shipping Method' : 'Add Shipping Method'}
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
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter shipping method name' }]}
          >
            <Input placeholder="e.g., Express Shipping" />
          </Form.Item>

          <Form.Item
            label="Code"
            name="code"
            rules={[{ required: true, message: 'Please enter shipping method code' }]}
          >
            <Input placeholder="e.g., EXPRESS" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="Describe this shipping method" />
          </Form.Item>

          <Form.Item label="Icon" name="icon">
            <Input placeholder="e.g., 🚀 (emoji or icon)" />
          </Form.Item>

          <Form.Item label="Transit Days" name="transitDays">
            <InputNumber min={1} style={{ width: '100%' }} placeholder="Estimated delivery days" />
          </Form.Item>

          <Form.Item label="Sort Order" name="sortOrder" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
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

export default ShippingMethodsPage;
