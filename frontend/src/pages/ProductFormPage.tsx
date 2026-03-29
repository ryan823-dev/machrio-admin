import { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, InputNumber, Button, Card, Row, Col, Tabs, Typography, Space, Divider, message, Spin, Image, Tag } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getProduct, createProduct, updateProduct, getTopLevelCategories, getAllBrands, getAllProducts } from '../services/api';
import type { Category, Brand, Product } from '../types';
import RichTextEditor from '../components/RichTextEditor';

const { Title, Text } = Typography;
const { TextArea } = Input;

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [fullDescriptionHtml, setFullDescriptionHtml] = useState<string>('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, brandRes, prodRes] = await Promise.all([
        getTopLevelCategories(),
        getAllBrands().catch(() => ({ data: [] as Brand[] })),
        getAllProducts().catch(() => ({ data: [] as Product[] })),
      ]);
      setCategories(catRes.data || []);
      setBrands((brandRes as { data: Brand[] }).data || []);
      setAllProducts((prodRes as { data: Product[] }).data || []);
      if (id) {
        const res = await getProduct(id);
        const data = res.data;
        const formData: Record<string, unknown> = {
          ...data,
          'pricing.basePrice': data.pricing?.basePrice,
          'pricing.compareAtPrice': data.pricing?.compareAtPrice,
          'pricing.costPrice': data.pricing?.costPrice,
          'pricing.currency': data.pricing?.currency || 'USD',
          'pricing.priceUnit': data.pricing?.priceUnit,
          'pricing.tieredPricing': data.pricing?.tieredPricing || [],
        };
        form.setFieldsValue(formData);
        setSlugManuallyEdited(true);
        if (data.externalImageUrl) setImageUrl(data.externalImageUrl);
        if (data.additionalImageUrls) setAdditionalImages(data.additionalImageUrls);
        if (data.fullDescription && typeof data.fullDescription === 'object') {
          setFullDescriptionHtml((data.fullDescription as { html?: string }).html || '');
        }
      }
    } catch {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [id, form]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const pricing = {
        basePrice: values['pricing.basePrice'],
        compareAtPrice: values['pricing.compareAtPrice'],
        costPrice: values['pricing.costPrice'],
        currency: values['pricing.currency'] || 'USD',
        priceUnit: values['pricing.priceUnit'],
        tieredPricing: values['pricing.tieredPricing'] || [],
      };
      const payload: Record<string, unknown> = { ...values, pricing };
      delete payload['pricing.basePrice'];
      delete payload['pricing.compareAtPrice'];
      delete payload['pricing.costPrice'];
      delete payload['pricing.currency'];
      delete payload['pricing.priceUnit'];
      delete payload['pricing.tieredPricing'];
      
      // Add fullDescription as HTML
      payload.fullDescription = { html: fullDescriptionHtml };

      if (isEdit && id) {
        await updateProduct(id, payload);
        message.success('Product updated successfully');
      } else {
        await createProduct(payload);
        message.success('Product created successfully');
      }
      navigate('/products');
    } catch (err) { if (err instanceof Error) message.error(err.message); }
    finally { setSaving(false); }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!slugManuallyEdited) form.setFieldValue('slug', slugify(e.target.value));
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><Spin size="large" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')}>Back</Button>
          <div>
            <Title level={3} style={{ margin: 0 }}>{isEdit ? 'Edit Product' : 'New Product'}</Title>
            <Text type="secondary">{isEdit ? 'Update product details' : 'Add a new product'}</Text>
          </div>
        </Space>
        <Button type="primary" icon={<SaveOutlined />} size="large" loading={saving} onClick={handleSave}>
          {isEdit ? 'Save Changes' : 'Create Product'}
        </Button>
      </div>

      <Form form={form} layout="vertical" initialValues={{ status: 'draft', purchaseMode: 'both', availability: 'contact', minOrderQuantity: 1, 'pricing.currency': 'USD' }}>
        <Tabs items={[
          { key: 'basic', label: 'Basic Info', children: (
            <Row gutter={24}>
              <Col xs={24} lg={16}>
                <Card title="General" style={{ borderRadius: 12, marginBottom: 24 }}>
                  <Form.Item label="Product Name" name="name" rules={[{ required: true, message: 'Name is required' }]}>
                    <Input placeholder="Enter product name" size="large" onChange={handleNameChange} />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col span={12}><Form.Item label="Slug" name="slug" rules={[{ required: true }]}><Input addonBefore="/" onChange={() => setSlugManuallyEdited(true)} /></Form.Item></Col>
                    <Col span={12}><Form.Item label="SKU" name="sku" rules={[{ required: true }]}><Input placeholder="e.g. PRD-001" /></Form.Item></Col>
                  </Row>
                  <Form.Item label="Short Description" name="shortDescription">
                    <TextArea rows={3} placeholder="Brief product description (50+ words for SEO)" showCount maxLength={500} />
                  </Form.Item>
                </Card>
                <Card title="Images" style={{ borderRadius: 12, marginBottom: 24 }}>
                  <Form.Item label="Primary Image URL" name="externalImageUrl">
                    <Input placeholder="https://example.com/image.jpg" onChange={(e) => setImageUrl(e.target.value)} />
                  </Form.Item>
                  {imageUrl && <Image src={imageUrl} alt="Preview" width={200} style={{ borderRadius: 8, marginBottom: 16 }}
                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=" />}
                  <Divider style={{ margin: '12px 0' }}>Additional Images</Divider>
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    {additionalImages.map((url, idx) => (
                      <Space key={idx} style={{ width: '100%' }}>
                        <Input value={url} onChange={(e) => {
                          const newImages = [...additionalImages];
                          newImages[idx] = e.target.value;
                          setAdditionalImages(newImages);
                        }} placeholder="Image URL" style={{ flex: 1 }} />
                        <Button danger type="text" onClick={() => setAdditionalImages(additionalImages.filter((_, i) => i !== idx))}>Remove</Button>
                      </Space>
                    ))}
                    <Button type="dashed" onClick={() => setAdditionalImages([...additionalImages, ''])} icon={<PlusOutlined />} block>
                      Add Image URL
                    </Button>
                    {additionalImages.length > 0 && (
                      <Space wrap>
                        {additionalImages.filter(url => url).map((url, idx) => (
                          <Image key={idx} src={url} alt={`Additional ${idx}`} width={80} height={80} style={{ borderRadius: 4, objectFit: 'cover' }}
                            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtc2l6ZT0iMTIiPkVycm9yPC90ZXh0Pjwvc3ZnPg==" />
                        ))}
                      </Space>
                    )}
                  </Space>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Status" style={{ borderRadius: 12, marginBottom: 24 }}>
                  <Form.Item label="Status" name="status"><Select options={[{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'discontinued', label: 'Discontinued' }]} /></Form.Item>
                  <Form.Item label="Purchase Mode" name="purchaseMode"><Select options={[{ value: 'both', label: 'Online + RFQ' }, { value: 'buy-online', label: 'Online Only' }, { value: 'rfq-only', label: 'RFQ Only' }]} /></Form.Item>
                  <Form.Item label="Availability" name="availability"><Select options={[{ value: 'in-stock', label: 'In Stock' }, { value: 'made-to-order', label: 'Made to Order' }, { value: 'contact', label: 'Contact' }]} /></Form.Item>
                </Card>
                <Card title="Organization" style={{ borderRadius: 12 }}>
                  <Form.Item label="Primary Category" name="primaryCategoryId">
                    <Select allowClear placeholder="Select category" showSearch optionFilterProp="label"
                      options={categories.map(c => ({ value: c.id, label: c.name }))} />
                  </Form.Item>
                  <Form.Item label="Brand" name="brand">
                    <Select allowClear placeholder="Select brand" showSearch optionFilterProp="label"
                      options={brands.map(b => ({ value: b.id, label: b.name }))} />
                  </Form.Item>
                  <Form.Item label="Tags" name="tags"><Select mode="tags" placeholder="Add tags..." /></Form.Item>
                  <Form.Item label="Source URL" name="sourceUrl"><Input placeholder="https://..." /></Form.Item>
                  <Form.Item label="Related Products" name="relatedProducts">
                    <Select
                      mode="multiple"
                      allowClear
                      placeholder="Select related products"
                      showSearch
                      optionFilterProp="label"
                      options={allProducts.filter((p: Product) => p.id !== id).map((p: Product) => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
                      tagRender={({ value, label, closable, onClose }) => {
                        const product = allProducts.find(p => p.id === value);
                        return (
                          <Tag closable={closable} onClose={onClose} style={{ margin: '2px' }}>
                            {product?.name || label}
                          </Tag>
                        );
                      }}
                    />
                  </Form.Item>
                </Card>
              </Col>
            </Row>
          )},
          { key: 'pricing', label: 'Pricing & Inventory', children: (
            <Row gutter={24}>
              <Col xs={24} lg={16}>
                <Card title="Pricing" style={{ borderRadius: 12, marginBottom: 24 }}>
                  <Row gutter={16}>
                    <Col span={6}><Form.Item label="Base Price" name="pricing.basePrice"><InputNumber prefix="$" style={{ width: '100%' }} min={0} precision={2} /></Form.Item></Col>
                    <Col span={6}><Form.Item label="Compare at" name="pricing.compareAtPrice"><InputNumber prefix="$" style={{ width: '100%' }} min={0} precision={2} /></Form.Item></Col>
                    <Col span={6}><Form.Item label="Cost Price" name="pricing.costPrice"><InputNumber prefix="$" style={{ width: '100%' }} min={0} precision={2} /></Form.Item></Col>
                    <Col span={6}><Form.Item label="Currency" name="pricing.currency"><Select options={[{ value: 'USD', label: 'USD' }, { value: 'CAD', label: 'CAD' }]} /></Form.Item></Col>
                  </Row>
                  <Form.Item label="Price Unit" name="pricing.priceUnit"><Input placeholder="e.g. per piece, per box, per 100" /></Form.Item>
                  <Divider>Volume Discount Tiers</Divider>
                  <Form.List name="pricing.tieredPricing">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Row key={key} gutter={12} align="middle" style={{ marginBottom: 8 }}>
                            <Col span={7}><Form.Item {...restField} name={[name, 'minQty']} label={key === fields[0]?.key ? 'Min Qty' : undefined} rules={[{ required: true, message: 'Required' }]}><InputNumber style={{ width: '100%' }} min={1} placeholder="Min" /></Form.Item></Col>
                            <Col span={7}><Form.Item {...restField} name={[name, 'maxQty']} label={key === fields[0]?.key ? 'Max Qty' : undefined}><InputNumber style={{ width: '100%' }} placeholder="Max" /></Form.Item></Col>
                            <Col span={7}><Form.Item {...restField} name={[name, 'unitPrice']} label={key === fields[0]?.key ? 'Unit Price' : undefined} rules={[{ required: true, message: 'Required' }]}><InputNumber prefix="$" style={{ width: '100%' }} min={0} precision={2} /></Form.Item></Col>
                            <Col span={3}><Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} /></Col>
                          </Row>
                        ))}
                        <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>Add Tier</Button>
                      </>
                    )}
                  </Form.List>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Inventory & Shipping" style={{ borderRadius: 12 }}>
                  <Form.Item label="Min Order Qty" name="minOrderQuantity"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
                  <Form.Item label="Package Qty" name="packageQty"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
                  <Form.Item label="Package Unit" name="packageUnit"><Input placeholder="box, case, roll" /></Form.Item>
                  <Form.Item label="Weight (kg)" name="weight"><InputNumber style={{ width: '100%' }} min={0} precision={2} /></Form.Item>
                  <Form.Item label="Lead Time" name="leadTime"><Input placeholder="e.g. 2-3 weeks" /></Form.Item>
                </Card>
              </Col>
            </Row>
          )},
          { key: 'specs', label: 'Specifications', children: (
            <Card title="Technical Specifications" style={{ borderRadius: 12 }}>
              <Form.List name="specifications">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={12} align="middle" style={{ marginBottom: 8 }}>
                        <Col span={8}><Form.Item {...restField} name={[name, 'label']} label={key === fields[0]?.key ? 'Label' : undefined} rules={[{ required: true }]}><Input placeholder="e.g. Material" /></Form.Item></Col>
                        <Col span={8}><Form.Item {...restField} name={[name, 'value']} label={key === fields[0]?.key ? 'Value' : undefined} rules={[{ required: true }]}><Input placeholder="e.g. Carbon Steel" /></Form.Item></Col>
                        <Col span={5}><Form.Item {...restField} name={[name, 'unit']} label={key === fields[0]?.key ? 'Unit' : undefined}><Input placeholder="mm, kg" /></Form.Item></Col>
                        <Col span={3}><Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} /></Col>
                      </Row>
                    ))}
                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>Add Specification</Button>
                  </>
                )}
              </Form.List>
            </Card>
          )},
          { key: 'seo', label: 'SEO & Content', children: (
            <Row gutter={24}>
              <Col xs={24} lg={16}>
                <Card title="Full Description (Rich Text)" style={{ borderRadius: 12, marginBottom: 24 }}>
                  <RichTextEditor
                    value={fullDescriptionHtml}
                    onChange={setFullDescriptionHtml}
                    placeholder="Enter detailed product description with formatting, images, and tables..."
                    height={500}
                  />
                  <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                    Use the editor to add formatted text, images, tables, and links. Content will be saved as HTML.
                  </Text>
                </Card>
                <Card title="SEO" style={{ borderRadius: 12, marginBottom: 24 }}>
                  <Form.List name="faq">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Card key={key} size="small" style={{ marginBottom: 12, background: '#fafafa' }}
                            extra={<Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} />}>
                            <Form.Item {...restField} name={[name, 'question']} label="Question" rules={[{ required: true }]}><Input /></Form.Item>
                            <Form.Item {...restField} name={[name, 'answer']} label="Answer" rules={[{ required: true }]}><TextArea rows={2} /></Form.Item>
                          </Card>
                        ))}
                        {fields.length < 3 && <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>Add FAQ</Button>}
                      </>
                    )}
                  </Form.List>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Tips" style={{ borderRadius: 12 }}>
                  <Text type="secondary">
                    <ul style={{ paddingLeft: 16, margin: 0 }}>
                      <li>Meta title: under 60 chars</li>
                      <li>Meta description: 120-160 chars</li>
                      <li>Include focus keyword in both</li>
                      <li>FAQ improves search snippets</li>
                    </ul>
                  </Text>
                </Card>
              </Col>
            </Row>
          )},
        ]} />
      </Form>
    </div>
  );
}