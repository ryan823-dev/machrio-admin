import { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, InputNumber, Switch, Button, Card, Row, Col, Tabs, Typography, Space, Divider, message, Spin, Checkbox, Image } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, MinusCircleOutlined, PictureOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategory, createCategory, updateCategory, getTopLevelCategories } from '../services/api';
import type { Category } from '../types';
import RichTextEditor from '../components/RichTextEditor';

const { Title, Text } = Typography;
const { TextArea } = Input;

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function CategoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState<string>('');
  const [descriptionHtml, setDescriptionHtml] = useState<string>('');
  const [buyingGuideHtml, setBuyingGuideHtml] = useState<string>('');
  const [seoContentHtml, setSeoContentHtml] = useState<string>('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const parentRes = await getTopLevelCategories();
      setParentCategories(parentRes.data || []);
      if (id) {
        const res = await getCategory(id);
        const data = res.data;
        // Extract plain text from jsonb fields for textarea editing
        const formData: Record<string, unknown> = { ...data };
        if (data.buyingGuide && typeof data.buyingGuide === 'object') {
          formData.buyingGuideText = (data.buyingGuide as Record<string, string>).text || JSON.stringify(data.buyingGuide);
        }
        if (data.seoContent && typeof data.seoContent === 'object') {
          formData.seoContentText = (data.seoContent as Record<string, string>).text || JSON.stringify(data.seoContent);
        }
        if (data.heroImageUrl) {
          setHeroImageUrl(data.heroImageUrl);
        }
        form.setFieldsValue(formData);
        setSlugManuallyEdited(true);
      }
    } catch { message.error('Failed to load data'); }
    finally { setLoading(false); }
  }, [id, form]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      // Convert HTML fields to jsonb format
      const payload = { ...values };
      if (descriptionHtml) {
        payload.description = { html: descriptionHtml };
      }
      if (buyingGuideHtml) {
        payload.buyingGuide = { html: buyingGuideHtml };
      }
      if (seoContentHtml) {
        payload.seoContent = { html: seoContentHtml };
      }
      payload.heroImageUrl = heroImageUrl;
      if (isEdit && id) {
        await updateCategory(id, payload);
        message.success('Category updated successfully');
      } else {
        await createCategory(payload);
        message.success('Category created successfully');
      }
      navigate('/categories');
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
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/categories')}>Back</Button>
          <div>
            <Title level={3} style={{ margin: 0 }}>{isEdit ? 'Edit Category' : 'New Category'}</Title>
            <Text type="secondary">{isEdit ? 'Update category details' : 'Create a new product category'}</Text>
          </div>
        </Space>
        <Button type="primary" icon={<SaveOutlined />} size="large" loading={saving} onClick={handleSave}>
          {isEdit ? 'Save Changes' : 'Create Category'}
        </Button>
      </div>

      <Form form={form} layout="vertical" initialValues={{ status: 'published', featured: false, level: 1, displayOrder: 0 }}>
        <Tabs items={[
          { key: 'basic', label: 'Basic Info', children: (
            <Row gutter={24}>
              <Col xs={24} lg={16}>
                <Card title="General" style={{ borderRadius: 12, marginBottom: 24 }}>
                  <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Name is required' }]}>
                    <Input placeholder="Category name" size="large" onChange={handleNameChange} />
                  </Form.Item>
                  <Form.Item label="Slug" name="slug" rules={[{ required: true }]}>
                    <Input addonBefore="/" onChange={() => setSlugManuallyEdited(true)} />
                  </Form.Item>
                  <Form.Item label="Short Description" name="shortDescription">
                    <TextArea rows={2} placeholder="Brief description for listings (max 160 chars)" showCount maxLength={160} />
                  </Form.Item>
                  <Form.Item label="Description" name="description">
                    <TextArea rows={4} placeholder="Detailed SEO description (150+ words recommended)" />
                  </Form.Item>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Settings" style={{ borderRadius: 12, marginBottom: 24 }}>
                  <Form.Item label="Status" name="status">
                    <Select options={[{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }]} />
                  </Form.Item>
                  <Form.Item label="Parent Category" name="parentId">
                    <Select allowClear placeholder="None (top-level)" showSearch optionFilterProp="label"
                      options={parentCategories.filter(c => c.id !== id).map(c => ({ value: c.id, label: c.name }))} />
                  </Form.Item>
                  <Form.Item label="Level" name="level"><InputNumber min={1} max={5} style={{ width: '100%' }} /></Form.Item>
                  <Form.Item label="Display Order" name="displayOrder"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
                  <Divider />
                  <Form.Item label="Featured" name="featured" valuePropName="checked"><Switch /></Form.Item>
                </Card>
                <Card title="Appearance" style={{ borderRadius: 12 }}>
                  <Form.Item label="Icon Emoji" name="iconEmoji"><Input placeholder="e.g. ⚙️" /></Form.Item>
                  <Form.Item label="Image URL" name="image"><Input placeholder="https://..." /></Form.Item>
                  <Divider />
                  <Form.Item label="Hero Image URL" extra="Large banner image for category header">
                    <Input 
                      placeholder="https://example.com/hero-image.jpg" 
                      value={heroImageUrl}
                      onChange={(e) => setHeroImageUrl(e.target.value)}
                      allowClear
                    />
                  </Form.Item>
                  {heroImageUrl && (
                    <div style={{ marginTop: 12, textAlign: 'center' }}>
                      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <PictureOutlined style={{ color: '#1890ff' }} />
                        <Text type="secondary">Hero Image Preview</Text>
                      </div>
                      <Image 
                        src={heroImageUrl} 
                        alt="Hero preview" 
                        style={{ 
                          maxWidth: '100%', 
                          borderRadius: 8, 
                          border: '1px solid #d9d9d9',
                          maxHeight: 300,
                          objectFit: 'cover'
                        }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                      />
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          )},
          { key: 'content', label: 'Content', children: (
            <Card title="Page Content" style={{ borderRadius: 12 }}>
              <Form.Item label="Intro Content" name="introContent" extra="SEO intro paragraph shown at top (expandable, 150-200 words)">
                <TextArea rows={6} placeholder="Introduction content for the category page" />
              </Form.Item>
              <Divider />
              <Form.Item label="Description (Rich Text)" name="description" extra="Category description with rich formatting">
                <RichTextEditor
                  value={descriptionHtml}
                  onChange={setDescriptionHtml}
                  placeholder="Enter category description..."
                  height={300}
                />
              </Form.Item>
              <Divider />
              <Form.Item label="Buying Guide (Rich Text)" name="buyingGuide" extra="How-to-choose guide shown before FAQ (200-300 words)">
                <RichTextEditor
                  value={buyingGuideHtml}
                  onChange={setBuyingGuideHtml}
                  placeholder="Help customers choose the right products in this category..."
                  height={400}
                />
              </Form.Item>
              <Divider />
              <Form.Item label="SEO Content (Rich Text)" name="seoContent" extra="Additional SEO content shown at bottom of page">
                <RichTextEditor
                  value={seoContentHtml}
                  onChange={setSeoContentHtml}
                  placeholder="Additional SEO-optimized content..."
                  height={300}
                />
              </Form.Item>
            </Card>
          )},
          { key: 'faq', label: 'FAQ', children: (
            <Card title="Frequently Asked Questions (4-6 recommended for SEO)" style={{ borderRadius: 12 }}>
              <Form.List name="faq">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card key={key} size="small" style={{ marginBottom: 12, background: '#fafafa' }}
                        extra={<Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} />}>
                        <Form.Item {...restField} name={[name, 'question']} label="Question" rules={[{ required: true }]}>
                          <Input placeholder='e.g. "What certifications should I look for?"' />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, 'answer']} label="Answer" rules={[{ required: true }]}>
                          <TextArea rows={3} placeholder="2-4 sentences, include relevant keywords" />
                        </Form.Item>
                      </Card>
                    ))}
                    {fields.length < 10 && <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>Add FAQ Item</Button>}
                  </>
                )}
              </Form.List>
            </Card>
          )},
          { key: 'filters', label: 'Filters', children: (
            <Row gutter={24}>
              <Col xs={24} lg={12}>
                <Card title="Facet Groups" style={{ borderRadius: 12, marginBottom: 24 }} extra={<Text type="secondary">Filter dimensions shown on category page</Text>}>
                  <Form.List name="facetGroups">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Row key={key} gutter={12} align="middle" style={{ marginBottom: 8 }}>
                            <Col span={14}>
                              <Form.Item {...restField} name={[name, 'facetName']} rules={[{ required: true }]}>
                                <Select placeholder="Select facet" options={[
                                  { value: 'material', label: 'Material' }, { value: 'size', label: 'Size' },
                                  { value: 'color', label: 'Color' }, { value: 'brand', label: 'Brand' },
                                  { value: 'certification', label: 'Certification' }, { value: 'priceRange', label: 'Price Range' },
                                  { value: 'availability', label: 'Availability' },
                                ]} />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item {...restField} name={[name, 'expanded']} valuePropName="checked">
                                <Checkbox>Expanded</Checkbox>
                              </Form.Item>
                            </Col>
                            <Col span={4}><Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} /></Col>
                          </Row>
                        ))}
                        <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>Add Facet</Button>
                      </>
                    )}
                  </Form.List>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Custom Filter Attributes" style={{ borderRadius: 12 }} extra={<Text type="secondary">Max 9 custom attributes</Text>}>
                  <Form.List name="customFilterAttributes">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Row key={key} gutter={12} align="middle" style={{ marginBottom: 8 }}>
                            <Col span={8}><Form.Item {...restField} name={[name, 'name']} rules={[{ required: true }]}><Input placeholder="Attribute name" /></Form.Item></Col>
                            <Col span={8}><Form.Item {...restField} name={[name, 'key']} rules={[{ required: true }]}><Input placeholder="URL key" /></Form.Item></Col>
                            <Col span={5}><Form.Item {...restField} name={[name, 'displayOrder']}><InputNumber style={{ width: '100%' }} placeholder="Order" /></Form.Item></Col>
                            <Col span={3}><Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} /></Col>
                          </Row>
                        ))}
                        {fields.length < 9 && <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>Add Attribute</Button>}
                      </>
                    )}
                  </Form.List>
                </Card>
              </Col>
            </Row>
          )},
          { key: 'seo', label: 'SEO', children: (
            <Card title="Search Engine Optimization" style={{ borderRadius: 12 }}>
              <Form.Item label="Meta Title" name="metaTitle"><Input showCount maxLength={60} placeholder="Override default title (max 60 chars)" /></Form.Item>
              <Form.Item label="Meta Description" name="metaDescription"><TextArea rows={3} showCount maxLength={160} placeholder="Override default description (max 160 chars)" /></Form.Item>
            </Card>
          )},
        ]} />
      </Form>
    </div>
  );
}