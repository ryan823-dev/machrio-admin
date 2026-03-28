import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Drawer, Form, Input, Select, Switch, InputNumber, Space, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { apiClient } from '../services/api';

interface BankAccount {
  id: string;
  country: string;
  bankName: string;
  accountName: string;
  beneficiaryName?: string;
  accountNumber: string;
  currency: string;
  swiftCode?: string;
  localBankCode?: string;
  routingNumber?: string;
  iban?: string;
  sortCode?: string;
  bankAddress?: string;
  additionalInfo?: string;
  flag?: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const BankAccountsPage: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [form] = Form.useForm();
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [data, setData] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);

  const countries = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
  ];

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' },
    { code: 'CNY', symbol: '¥' },
    { code: 'CAD', symbol: 'C$' },
    { code: 'AUD', symbol: 'A$' },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<BankAccount[]>('/api/bank-accounts', { page: '0', pageSize: '100' });
      setData(res || []);
    } catch {
      message.error('Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (editingAccount) {
      form.setFieldsValue(editingAccount);
      setSelectedCountry(editingAccount.country);
    }
  }, [editingAccount, form]);

  const handleOpenDrawer = (account?: BankAccount) => {
    if (account) {
      setEditingAccount(account);
    } else {
      setEditingAccount(null);
      form.resetFields();
      setSelectedCountry('US');
    }
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingAccount(null);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        country: selectedCountry,
        flag: countries.find(c => c.code === selectedCountry)?.flag,
        active: values.active ?? true,
        sortOrder: values.sortOrder ?? 0,
      };

      if (editingAccount) {
        await apiClient.put(`/api/bank-accounts/${editingAccount.id}`, payload);
        message.success('Bank account updated successfully');
      } else {
        await apiClient.post('/api/bank-accounts', payload);
        message.success('Bank account created successfully');
      }

      handleCloseDrawer();
      fetchData();
    } catch (error: any) {
      message.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.del(`/api/bank-accounts/${id}`);
      message.success('Bank account deleted successfully');
      fetchData();
    } catch (error: any) {
      message.error(error.message || 'Delete failed');
    }
  };

  const getCountryFields = (country: string) => {
    switch (country) {
      case 'US':
        return (
          <Form.Item
            label="Routing Number"
            name="routingNumber"
            rules={[{ pattern: /^\d{9}$/, message: 'US routing number must be 9 digits' }]}
          >
            <Input placeholder="9-digit routing number" />
          </Form.Item>
        );
      case 'GB':
        return (
          <Form.Item
            label="Sort Code"
            name="sortCode"
            rules={[{ pattern: /^\d{6}$/, message: 'UK sort code must be 6 digits' }]}
          >
            <Input placeholder="6-digit sort code" />
          </Form.Item>
        );
      case 'DE':
      case 'FR':
      case 'IT':
      case 'ES':
        return (
          <>
            <Form.Item
              label="IBAN"
              name="iban"
              rules={[{ pattern: /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/, message: 'Invalid IBAN format' }]}
            >
              <Input placeholder="IBAN (e.g., DE89370400440532013000)" />
            </Form.Item>
            <Form.Item label="Local Bank Code" name="localBankCode">
              <Input placeholder="Local bank code" />
            </Form.Item>
          </>
        );
      default:
        return (
          <Form.Item label="Local Bank Code" name="localBankCode">
            <Input placeholder="Local bank code" />
          </Form.Item>
        );
    }
  };

  const columns: ColumnsType<BankAccount> = [
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      width: 120,
      render: (country: string, record: BankAccount) => (
        <Space>
          <span style={{ fontSize: 20 }}>{record.flag || '🏦'}</span>
          <span>{country}</span>
        </Space>
      ),
    },
    {
      title: 'Bank Name',
      dataIndex: 'bankName',
      key: 'bankName',
      width: 200,
    },
    {
      title: 'Account Name',
      dataIndex: 'accountName',
      key: 'accountName',
      width: 180,
    },
    {
      title: 'Account Number',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
      width: 150,
      render: (num: string) => `****${num.slice(-4)}`,
    },
    {
      title: 'Currency',
      dataIndex: 'currency',
      key: 'currency',
      width: 100,
      render: (currency: string) => <Tag color="blue">{currency}</Tag>,
    },
    {
      title: 'SWIFT/BIC',
      dataIndex: 'swiftCode',
      key: 'swiftCode',
      width: 120,
      render: (swift?: string) => swift || '-',
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
      title: 'Sort Order',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      sorter: (a, b) => a.sortOrder - b.sortOrder,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: BankAccount) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenDrawer(record)}
          />
          <Popconfirm
            title="Delete Bank Account"
            description="Are you sure to delete this bank account?"
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
        <h1 style={{ margin: 0 }}>Bank Accounts</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenDrawer()}>
          Add Bank Account
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
          showTotal: (total) => `Total ${total} accounts`,
        }}
      />

      <Drawer
        title={editingAccount ? 'Edit Bank Account' : 'Add Bank Account'}
        placement="right"
        width={600}
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
            label="Country"
            name="country"
            rules={[{ required: true, message: 'Please select a country' }]}
          >
            <Select
              value={selectedCountry}
              onChange={(value) => setSelectedCountry(value)}
              options={countries.map((c) => ({
                label: `${c.flag} ${c.name}`,
                value: c.code,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Bank Name"
            name="bankName"
            rules={[{ required: true, message: 'Please enter bank name' }]}
          >
            <Input placeholder="e.g., JPMorgan Chase Bank" />
          </Form.Item>

          <Form.Item
            label="Account Name"
            name="accountName"
            rules={[{ required: true, message: 'Please enter account name' }]}
          >
            <Input placeholder="e.g., Machrio Inc." />
          </Form.Item>

          <Form.Item label="Beneficiary Name" name="beneficiaryName">
            <Input placeholder="Optional beneficiary name" />
          </Form.Item>

          <Form.Item
            label="Account Number"
            name="accountNumber"
            rules={[{ required: true, message: 'Please enter account number' }]}
          >
            <Input placeholder="Account number" />
          </Form.Item>

          <Form.Item
            label="Currency"
            name="currency"
            rules={[{ required: true, message: 'Please select currency' }]}
          >
            <Select
              options={currencies.map((c) => ({
                label: `${c.code} (${c.symbol})`,
                value: c.code,
              }))}
            />
          </Form.Item>

          <Form.Item label="SWIFT/BIC Code" name="swiftCode">
            <Input placeholder="e.g., CHASUS33" />
          </Form.Item>

          {getCountryFields(selectedCountry)}

          <Form.Item label="Bank Address" name="bankAddress">
            <Input.TextArea rows={2} placeholder="Bank branch address" />
          </Form.Item>

          <Form.Item label="Additional Information" name="additionalInfo">
            <Input.TextArea rows={2} placeholder="Any additional instructions or details" />
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

export default BankAccountsPage;
