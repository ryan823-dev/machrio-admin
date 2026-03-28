import React, { useState, useCallback } from 'react';
import {
  Upload, Button, Card, Typography, Table, Tag, Progress,
  message, Space, Alert, Steps, Row, Col, Statistic, Divider,
  Modal, Form, Input, InputNumber, Select
} from 'antd';
import {
  InboxOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  FileExcelOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { apiClient } from '../services/api';
import * as XLSX from 'xlsx';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

interface ProductData {
  SKU: string;
  Name: string;
  Brand?: string;
  'L1 Category': string;
  'L2 Category'?: string;
  'L3 Category'?: string;
  'Short Description': string;
  'Full Description'?: string;
  'Primary Image URL'?: string;
  'Additional Images'?: string;
  'Cost Price (CNY)'?: number;
  'Selling Price (USD)'?: number;
  'Min Order Qty'?: number;
  'Package Qty'?: number;
  'Package Unit'?: string;
  'Weight (kg)'?: number;
  'Lead Time'?: string;
  Availability?: string;
  Status?: string;
  'Purchase Mode'?: string;
  [key: string]: any;
}

interface UploadResult {
  success: boolean;
  sku?: string;
  message?: string;
  error?: string;
  productId?: string;
}

interface ParsedProduct {
  id: string;
  sku: string;
  name: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  message?: string;
  productId?: string;
  data: ProductData;
}

const BulkUploadProducts: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadMode, setUploadMode] = useState<'create' | 'update'>('create');

  // 下载模板
  const downloadTemplate = () => {
    const template = [
      {
        'SKU': 'HN6514',
        'Name': 'Coarse Grit Aluminum Oxide Scouring Pad Sanding Discs 3.94 in, Pkg Qty 100',
        'Brand': '',
        'L1 Category': 'Abrasives',
        'L2 Category': 'Sanding Abrasives',
        'L3 Category': 'Sanding Discs',
        'Short Description': 'This coarse grit aluminum oxide sanding disc is designed for aggressive material removal...',
        'Full Description': 'Overview\nThis coarse grit aluminum oxide sanding disc is engineered for demanding industrial surface preparation...',
        'Primary Image URL': 'https://cdn.machrio.com/products/images/HN6514_812abdceb.jpg',
        'Additional Images': '',
        'Cost Price (CNY)': 5.29,
        'Selling Price (USD)': 159.99,
        'Min Order Qty': 1,
        'Package Qty': 100,
        'Package Unit': 'Each',
        'Weight (kg)': 2,
        'Lead Time': '2-3 weeks',
        'Availability': 'In Stock',
        'Status': 'Published',
        'Purchase Mode': 'Buy Online + RFQ',
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'machrio_product_upload_template.xlsx');
    message.success('模板文件已下载');
  };

  // 解析 Excel 文件
  const parseExcelFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: ProductData[] = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          message.error('Excel 文件为空或格式不正确');
          return;
        }

        const products: ParsedProduct[] = jsonData.map((row, index) => ({
          id: `row-${index}`,
          sku: row.SKU || `SKU-${index + 1}`,
          name: row.Name || '未命名产品',
          status: 'pending' as const,
          data: row,
        }));

        setParsedProducts(products);
        setCurrentStep(1);
        message.success(`成功解析 ${products.length} 个产品`);
      } catch (error) {
        message.error('文件解析失败，请确保是正确的 Excel 格式');
        console.error('Parse error:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  // 上传配置
  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    showUploadList: false,
    beforeUpload: (file: File) => {
      const isValidType = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                         file.type === 'application/vnd.ms-excel';
      
      if (!isValidType && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        message.error('只能上传 Excel 文件 (.xlsx 或 .xls)');
        return false;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('文件大小不能超过 10MB');
        return false;
      }

      parseExcelFile(file);
      return false; // 阻止自动上传
    },
  };

  // 转换产品数据格式
  const transformProductData = (data: ProductData) => {
    // 提取属性字段
    const attributes: any = {};
    const attributeKeys = [
      'Attribute 1 Name', 'Attribute 1 Value',
      'Attribute 2 Name', 'Attribute 2 Value',
      'Attribute 3 Name', 'Attribute 3 Value',
      'Attribute 4 Name', 'Attribute 4 Value',
      'Attribute 5 Name', 'Attribute 5 Value',
      'Attribute 6 Name', 'Attribute 6 Value',
      'Attribute 7 Name', 'Attribute 7 Value',
      'Attribute 8 Name', 'Attribute 8 Value',
      'Attribute 9 Name', 'Attribute 9 Value',
    ];

    for (let i = 1; i <= 9; i++) {
      const nameKey = `Attribute ${i} Name`;
      const valueKey = `Attribute ${i} Value`;
      if (data[nameKey] && data[valueKey]) {
        attributes[data[nameKey]] = data[valueKey];
      }
    }

    // 提取 FAQ
    const faq: Array<{ question: string; answer: string }> = [];
    for (let i = 1; i <= 3; i++) {
      const qKey = `FAQ Question ${i}` as keyof ProductData;
      const aKey = `FAQ Answer ${i}` as keyof ProductData;
      if (data[qKey] && data[aKey]) {
        faq.push({
          question: data[qKey] as string,
          answer: data[aKey] as string,
        });
      }
    }

    // 提取 SEO 信息
    const meta = {
      metaTitle: data['Meta Title'],
      metaDescription: data['Meta Description'],
      focusKeyword: data['Focus Keyword'],
      sourceUrl: data['Source URL'],
    };

    // 转换价格信息
    const pricing = {
      costPrice: data['Cost Price (CNY)'],
      basePrice: data['Selling Price (USD)'],
      currency: 'USD',
    };

    // 转换分类信息
    const categories: any = [];
    if (data['L1 Category']) {
      categories.push({ name: data['L1 Category'], level: 1 });
    }
    if (data['L2 Category']) {
      categories.push({ name: data['L2 Category'], level: 2 });
    }
    if (data['L3 Category']) {
      categories.push({ name: data['L3 Category'], level: 3 });
    }

    return {
      sku: data.SKU,
      name: data.Name,
      shortDescription: data['Short Description'],
      fullDescription: data['Full Description'] ? { content: data['Full Description'] } : undefined,
      primaryCategoryId: null, // 需要根据分类名称查找或创建
      brand: data.Brand,
      status: data.Status === 'Published' ? 'published' : 'draft',
      availability: data.Availability || 'in-stock',
      purchaseMode: data['Purchase Mode'] || 'buy-online',
      minOrderQuantity: data['Min Order Qty'] || 1,
      packageQty: data['Package Qty'],
      packageUnit: data['Package Unit'],
      weight: data['Weight (kg)'],
      leadTime: data['Lead Time'],
      externalImageUrl: data['Primary Image URL'],
      additionalImageUrls: data['Additional Images'] ? data['Additional Images'].split(',') : [],
      pricing,
      specifications: Object.keys(attributes).length > 0 ? attributes : undefined,
      faq: faq.length > 0 ? faq : undefined,
      meta,
      categories: categories.length > 0 ? categories : undefined,
    };
  };

  // 批量上传产品
  const handleBulkUpload = useCallback(async () => {
    if (parsedProducts.length === 0) {
      message.warning('没有可上传的产品');
      return;
    }

    setUploading(true);
    const results: UploadResult[] = [];
    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < parsedProducts.length; i++) {
        const product = parsedProducts[i];
        
        // 更新当前产品状态
        setParsedProducts(prev => prev.map((p, idx) => 
          idx === i ? { ...p, status: 'uploading' } : p
        ));

        try {
          const transformedData = transformProductData(product.data);
          
          let response;
          if (uploadMode === 'update') {
            // 更新模式：先查找现有产品
            const existingProducts = await apiClient.get('/api/products', {
              sku: product.sku,
            });
            
            if (existingProducts && existingProducts.length > 0) {
              response = await apiClient.put(
                `/api/products/${existingProducts[0].id}`,
                transformedData
              );
            } else {
              response = await apiClient.post('/api/products', transformedData);
            }
          } else {
            // 创建模式
            response = await apiClient.post('/api/products', transformedData);
          }

          setParsedProducts(prev => prev.map((p, idx) => 
            idx === i ? { 
              ...p, 
              status: 'success',
              message: '上传成功',
              productId: response?.id,
            } : p
          ));

          results.push({
            success: true,
            sku: product.sku,
            message: '上传成功',
            productId: response?.id,
          });
          successCount++;
        } catch (error: any) {
          setParsedProducts(prev => prev.map((p, idx) => 
            idx === i ? { 
              ...p, 
              status: 'error',
              message: error.message || '上传失败',
            } : p
          ));

          results.push({
            success: false,
            sku: product.sku,
            error: error.message || '上传失败',
          });
          errorCount++;
        }

        // 更新进度
        const progress = Math.round(((i + 1) / parsedProducts.length) * 100);
        setUploadProgress(progress);
      }

      setUploadResults(results);
      setCurrentStep(2);

      message.success(
        `上传完成！成功：${successCount}, 失败：${errorCount}`,
        successCount > 0 ? 5 : 3
      );
    } catch (error) {
      message.error('批量上传过程中发生错误');
      console.error('Bulk upload error:', error);
    } finally {
      setUploading(false);
    }
  }, [parsedProducts, uploadMode]);

  // 重置上传
  const handleReset = () => {
    setParsedProducts([]);
    setUploadResults([]);
    setUploadProgress(0);
    setCurrentStep(0);
  };

  // 结果表格列定义
  const resultColumns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 150,
    },
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: any = {
          pending: { color: 'default', icon: <SyncOutlined spin /> },
          uploading: { color: 'processing', icon: <SyncOutlined spin /> },
          success: { color: 'success', icon: <CheckCircleOutlined /> },
          error: { color: 'error', icon: <CloseCircleOutlined /> },
        };
        const config = statusMap[status] || statusMap.pending;
        return <Tag icon={config.icon} color={config.color}>{status}</Tag>;
      },
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (msg?: string, record: any) => msg || record.error || '-',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>批量上传产品</Title>
      <Text type="secondary">通过 Excel 表格批量导入产品数据</Text>

      <Divider />

      {/* 步骤指示 */}
      <Steps
        current={currentStep}
        items={[
          {
            title: '上传文件',
            description: '上传 Excel 产品表格',
          },
          {
            title: '数据预览',
            description: '确认产品信息',
          },
          {
            title: '上传结果',
            description: '查看导入结果',
          },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* 步骤 1: 上传文件 */}
      {currentStep === 0 && (
        <Card>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Alert
                message="上传说明"
                description={
                  <div>
                    <Paragraph>1. 下载并填写产品上传模板</Paragraph>
                    <Paragraph>2. 确保 SKU 唯一且必填</Paragraph>
                    <Paragraph>3. 分类层级：L1 {'>'} L2 {'>'} L3</Paragraph>
                    <Paragraph>4. 价格：成本价 (CNY) 和售价 (USD)</Paragraph>
                    <Paragraph>5. 图片 URL 必须是可公开访问的链接</Paragraph>
                  </div>
                }
                type="info"
                showIcon
              />
            </Col>
            <Col span={12}>
              <Card size="small">
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="解析的产品数"
                      value={parsedProducts.length}
                      prefix={<FileExcelOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="上传模式"
                      value={uploadMode === 'create' ? '创建新产品' : '更新现有产品'}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <Dragger {...uploadProps} style={{ padding: '40px 20px' }}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">点击或拖拽 Excel 文件到此处上传</p>
            <p className="ant-upload-hint">
              仅支持 .xlsx 和 .xls 格式，文件大小不超过 10MB
            </p>
          </Dragger>

          <Divider />

          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={downloadTemplate}
            >
              下载模板
            </Button>
            <Select
              value={uploadMode}
              onChange={setUploadMode}
              style={{ width: 200 }}
              options={[
                { label: '创建新产品', value: 'create' },
                { label: '更新现有产品', value: 'update' },
              ]}
            />
          </Space>
        </Card>
      )}

      {/* 步骤 2: 数据预览 */}
      {currentStep === 1 && (
        <Card>
          <Alert
            message={`已解析 ${parsedProducts.length} 个产品`}
            description="请确认数据无误后点击开始上传"
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Table
            columns={resultColumns}
            dataSource={parsedProducts}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
            size="middle"
          />

          <Divider />

          <Space>
            <Button onClick={handleReset}>
              返回重新上传
            </Button>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={handleBulkUpload}
              loading={uploading}
              disabled={parsedProducts.length === 0}
            >
              开始上传 ({parsedProducts.length}个产品)
            </Button>
          </Space>

          {uploading && (
            <div style={{ marginTop: 24 }}>
              <Text>上传进度：</Text>
              <Progress percent={uploadProgress} status="active" />
            </div>
          )}
        </Card>
      )}

      {/* 步骤 3: 上传结果 */}
      {currentStep === 2 && (
        <Card>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Statistic
                title="总计"
                value={parsedProducts.length}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="成功"
                value={uploadResults.filter(r => r.success).length}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="失败"
                value={uploadResults.filter(r => !r.success).length}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
          </Row>

          <Table
            columns={resultColumns}
            dataSource={parsedProducts}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
            size="middle"
          />

          <Divider />

          <Space>
            <Button onClick={handleReset}>
              继续上传更多
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => {
                const ws = XLSX.utils.json_to_sheet(uploadResults);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Results');
                XLSX.writeFile(wb, 'upload_results.xlsx');
              }}
            >
              导出结果
            </Button>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default BulkUploadProducts;
