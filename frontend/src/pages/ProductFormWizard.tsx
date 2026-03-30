import { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, InputNumber, Button, Card, Row, Col, Typography, Space, Divider, message, Spin, Image, Steps } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, MinusCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getProduct, createProduct, updateProduct, getTopLevelCategories, getAllBrands, getProducts } from '../services/api';
import type { Category, Brand, Product } from '../types';
import RichTextEditor from '../components/RichTextEditor';

const { Title, Text } = Typography;
const { TextArea } = Input;

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const steps = [
  { title: '基本信息', subtitle: '商品核心信息' },
  { title: '价格与库存', subtitle: '定价和库存配置' },
  { title: '详细描述', subtitle: '商品详情与规格' },
  { title: 'SEO 设置', subtitle: '搜索引擎优化' },
];

export default function ProductFormWizard() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [relatedProductOptions, setRelatedProductOptions] = useState<{ value: string; label: string }[]>([]);
  const [relatedProductsLoading, setRelatedProductsLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [fullDescriptionHtml, setFullDescriptionHtml] = useState<string>('');
  const [industries, setIndustries] = useState<string[]>([]);

  // Search for related products
  const searchProducts = useCallback(async (searchText: string) => {
    if (!searchText || searchText.length < 2) {
      setRelatedProductOptions([]);
      return;
    }
    setRelatedProductsLoading(true);
    try {
      const res = await getProducts({ page: 1, pageSize: 20, search: searchText });
      const items = res.data?.items || [];
      const options = items
        .filter((p: Product) => p.id !== id)
        .map((p: Product) => ({ value: p.id, label: `${p.name} (${p.sku})` }));
      setRelatedProductOptions(options);
    } catch {
      // ignore
    } finally {
      setRelatedProductsLoading(false);
    }
  }, [id]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, brandRes] = await Promise.all([
        getTopLevelCategories(),
        getAllBrands().catch(() => ({ data: [] as Brand[] })),
      ]);
      setCategories(catRes.data || []);
      setBrands((brandRes as { data: Brand[] }).data || []);
      if (id) {
        const res = await getProduct(id);
        const data = res.data;

        // Helper to parse JSON strings
        const parseJson = (val: unknown, fallback: unknown = null) => {
          if (!val) return fallback;
          try {
            return typeof val === 'string' ? JSON.parse(val) : val;
          } catch { return fallback; }
        };

        // Parse pricing, specifications, faq, tags from JSON strings
        const pricing = parseJson(data.pricing, {});
        const specifications = parseJson(data.specifications, []);
        const faq = parseJson(data.faq, []);
        const tags = parseJson(data.tags, []);

        const formData: Record<string, unknown> = {
          ...data,
          specifications,
          faq,
          tags,
          'pricing.basePrice': pricing?.basePrice,
          'pricing.compareAtPrice': pricing?.compareAtPrice,
          'pricing.costPrice': pricing?.costPrice,
          'pricing.currency': pricing?.currency || 'USD',
          'pricing.priceUnit': pricing?.priceUnit,
          'pricing.tieredPricing': pricing?.tieredPricing || [],
        };
        form.setFieldsValue(formData);
        setSlugManuallyEdited(true);
        if (data.externalImageUrl) setImageUrl(data.externalImageUrl);
        // Parse additionalImageUrls if it's a JSON string
        if (data.additionalImageUrls) {
          try {
            const imgs = typeof data.additionalImageUrls === 'string'
              ? JSON.parse(data.additionalImageUrls)
              : data.additionalImageUrls;
            setAdditionalImages(Array.isArray(imgs) ? imgs : []);
          } catch { setAdditionalImages([]); }
        }
        // Parse fullDescription if it's a JSON string
        if (data.fullDescription) {
          try {
            const desc = typeof data.fullDescription === 'string'
              ? JSON.parse(data.fullDescription)
              : data.fullDescription;
            setFullDescriptionHtml((desc as { html?: string }).html || '');
          } catch { setFullDescriptionHtml(''); }
        }
        // Parse industries if it's a JSON string
        if (data.industries) {
          try {
            const ind = typeof data.industries === 'string'
              ? JSON.parse(data.industries)
              : data.industries;
            setIndustries(Array.isArray(ind) ? ind : []);
          } catch { setIndustries([]); }
        }
      }
    } catch {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [id, form]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const validateStep = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(['name', 'sku', 'primaryCategoryId', 'purchaseMode', 'availability']);
      } else if (currentStep === 1) {
        await form.validateFields(['pricing.basePrice']);
      }
      return true;
    } catch {
      message.error('请填写必填项');
      return false;
    }
  };

  const handleNext = async () => {
    const valid = await validateStep();
    if (valid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

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
      
      payload.fullDescription = { html: fullDescriptionHtml };
      payload.industries = industries;

      if (isEdit && id) {
        await updateProduct(id, payload);
        message.success('商品已更新');
      } else {
        await createProduct(payload);
        message.success('商品已创建');
      }
      navigate('/products');
    } catch (err) { if (err instanceof Error) message.error(err.message); }
    finally { setSaving(false); }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!slugManuallyEdited) form.setFieldValue('slug', slugify(e.target.value));
  };

  const renderStep1Basic = () => (
    <Row gutter={24}>
      <Col xs={24} lg={16}>
        <Card title="商品基本信息" style={{ borderRadius: 12, marginBottom: 24 }}>
          <Form.Item label="商品名称" name="name" rules={[{ required: true, message: '请输入商品名称' }]}>
            <Input placeholder="例如：工业级不锈钢法兰 DN50" size="large" onChange={handleNameChange} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="商品别名" name="slug" rules={[{ required: true, message: '请输入商品别名' }]}>
                <Input addonBefore="/" placeholder="product-slug" onChange={() => setSlugManuallyEdited(true)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="商品编码" name="sku" rules={[{ required: true, message: '请输入 SKU' }]}>
                <Input placeholder="例如：PRD-001" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="简短描述" name="shortDescription" rules={[{ required: true, message: '请输入简短描述' }]}>
            <TextArea rows={3} placeholder="简要描述商品特点和用途（建议 50-100 字，有利于 SEO）" showCount maxLength={500} />
          </Form.Item>
        </Card>

        <Card title="商品图片" style={{ borderRadius: 12, marginBottom: 24 }}>
          <Form.Item label="主图 URL" name="externalImageUrl">
            <Input placeholder="https://example.com/image.jpg" onChange={(e) => setImageUrl(e.target.value)} />
          </Form.Item>
          {imageUrl && (
            <Image 
              src={imageUrl} 
              alt="主图预览" 
              width={200} 
              style={{ borderRadius: 8, marginBottom: 16 }}
              fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=" 
            />
          )}
          <Divider style={{ margin: '12px 0' }}>附加图片</Divider>
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {additionalImages.map((url, idx) => (
              <Space key={idx} style={{ width: '100%' }}>
                <Input 
                  value={url} 
                  onChange={(e) => {
                    const newImages = [...additionalImages];
                    newImages[idx] = e.target.value;
                    setAdditionalImages(newImages);
                  }} 
                  placeholder="图片 URL" 
                  style={{ flex: 1 }} 
                />
                <Button danger type="text" onClick={() => setAdditionalImages(additionalImages.filter((_, i) => i !== idx))}>移除</Button>
              </Space>
            ))}
            <Button type="dashed" onClick={() => setAdditionalImages([...additionalImages, ''])} icon={<PlusOutlined />} block>
              添加图片 URL
            </Button>
            {additionalImages.length > 0 && (
              <Space wrap>
                {additionalImages.filter(url => url).map((url, idx) => (
                  <Image 
                    key={idx} 
                    src={url} 
                    alt={`附加图片${idx + 1}`} 
                    width={80} 
                    height={80} 
                    style={{ borderRadius: 4, objectFit: 'cover' }}
                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtc2l6ZT0iMTIiPkVycm9yPC90ZXh0Pjwvc3ZnPg==" 
                  />
                ))}
              </Space>
            )}
          </Space>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card title="销售设置" style={{ borderRadius: 12, marginBottom: 24 }}>
          <Form.Item label="销售状态" name="status" rules={[{ required: true }]}>
            <Select options={[
              { value: 'draft', label: '草稿' }, 
              { value: 'published', label: '已上架' }, 
              { value: 'discontinued', label: '已停产' }
            ]} />
          </Form.Item>
          <Form.Item label="购买方式" name="purchaseMode" rules={[{ required: true }]}>
            <Select options={[
              { value: 'both', label: '在线购买 + 询价' }, 
              { value: 'buy-online', label: '仅在线购买' }, 
              { value: 'rfq-only', label: '仅询价' }
            ]} />
          </Form.Item>
          <Form.Item label="库存状态" name="availability" rules={[{ required: true }]}>
            <Select options={[
              { value: 'in-stock', label: '现货' }, 
              { value: 'made-to-order', label: '按订单生产' }, 
              { value: 'contact', label: '联系确认' }
            ]} />
          </Form.Item>
        </Card>

        <Card title="商品分类" style={{ borderRadius: 12 }}>
          <Form.Item label="主分类" name="primaryCategoryId" rules={[{ required: true, message: '请选择商品分类' }]}>
            <Select 
              allowClear 
              placeholder="选择商品分类" 
              showSearch 
              optionFilterProp="label"
              options={categories.map(c => ({ value: c.id, label: c.name }))} 
            />
          </Form.Item>
          <Form.Item label="品牌" name="brand">
            <Select 
              allowClear 
              placeholder="选择品牌" 
              showSearch 
              optionFilterProp="label"
              options={brands.map(b => ({ value: b.id, label: b.name }))} 
            />
          </Form.Item>
          <Form.Item label="商品标签" name="tags">
            <Select mode="tags" placeholder="添加标签，按回车确认" />
          </Form.Item>
          <Form.Item label="行业应用" name="industries">
            <Select 
              mode="multiple"
              placeholder="选择适用行业"
              value={industries}
              onChange={setIndustries}
              options={[
                { value: 'manufacturing', label: '🏭 制造业' },
                { value: 'construction', label: '🏗️ 建筑业' },
                { value: 'automotive', label: '🚗 汽车行业' },
                { value: 'healthcare', label: '🏥 医疗健康' },
                { value: 'food-beverage', label: '🍔 食品饮料' },
                { value: 'warehouse', label: '📦 仓储物流' },
                { value: 'oil-gas', label: '⛽ 石油天然气' },
                { value: 'mining', label: '⛏️ 矿业' },
              ]}
            />
          </Form.Item>
          <Form.Item label="来源网址" name="sourceUrl">
            <Input placeholder="https://..." />
          </Form.Item>
        </Card>
      </Col>
    </Row>
  );

  const renderStep2Pricing = () => (
    <Row gutter={24}>
      <Col xs={24} lg={16}>
        <Card title="商品定价" style={{ borderRadius: 12, marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="基础价格" name="pricing.basePrice" rules={[{ required: true, message: '请输入价格' }]}>
                <InputNumber prefix="¥" style={{ width: '100%' }} min={0} precision={2} placeholder="0.00" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="市场参考价" name="pricing.compareAtPrice">
                <InputNumber prefix="¥" style={{ width: '100%' }} min={0} precision={2} placeholder="0.00" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="成本价" name="pricing.costPrice">
                <InputNumber prefix="¥" style={{ width: '100%' }} min={0} precision={2} placeholder="0.00" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="币种" name="pricing.currency">
                <Select options={[
                  { value: 'USD', label: 'USD 美元' }, 
                  { value: 'CAD', label: 'CAD 加元' },
                  { value: 'CNY', label: 'CNY 人民币' }
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="价格单位" name="pricing.priceUnit">
            <Input placeholder="例如：元/件，元/箱，元/100 件" />
          </Form.Item>
          
          <Divider>阶梯价格（批量优惠）</Divider>
          <Form.List name="pricing.tieredPricing">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={12} align="middle" style={{ marginBottom: 8 }}>
                    <Col span={7}>
                      <Form.Item 
                        {...restField} 
                        name={[name, 'minQty']} 
                        label={key === fields[0]?.key ? '最小数量' : undefined} 
                        rules={[{ required: true, message: '必填' }]}
                      >
                        <InputNumber style={{ width: '100%' }} min={1} placeholder="最小" />
                      </Form.Item>
                    </Col>
                    <Col span={7}>
                      <Form.Item 
                        {...restField} 
                        name={[name, 'maxQty']} 
                        label={key === fields[0]?.key ? '最大数量' : undefined}
                      >
                        <InputNumber style={{ width: '100%' }} placeholder="最大" />
                      </Form.Item>
                    </Col>
                    <Col span={7}>
                      <Form.Item 
                        {...restField} 
                        name={[name, 'unitPrice']} 
                        label={key === fields[0]?.key ? '单价' : undefined} 
                        rules={[{ required: true, message: '必填' }]}
                      >
                        <InputNumber prefix="¥" style={{ width: '100%' }} min={0} precision={2} />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} />
                    </Col>
                  </Row>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>添加阶梯价格</Button>
              </>
            )}
          </Form.List>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card title="库存与发货" style={{ borderRadius: 12 }}>
          <Form.Item label="最小起订量" name="minOrderQuantity">
            <InputNumber min={1} style={{ width: '100%' }} placeholder="1" />
          </Form.Item>
          <Form.Item label="包装数量" name="packageQty">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="包装单位" name="packageUnit">
            <Input placeholder="箱，盒，卷，件" />
          </Form.Item>
          <Form.Item label="商品重量 (kg)" name="weight">
            <InputNumber style={{ width: '100%' }} min={0} precision={2} placeholder="0.00" />
          </Form.Item>
          <Form.Item label="发货周期" name="leadTime">
            <Input placeholder="例如：2-3 周，现货 24 小时发货" />
          </Form.Item>
          <Form.Item label="处理时间 (天)" name="shippingInfo.processingTime">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="1-3" />
          </Form.Item>
        </Card>
      </Col>
    </Row>
  );

  const renderStep3Description = () => (
    <Row gutter={24}>
      <Col xs={24} lg={16}>
        <Card title="商品详细描述" style={{ borderRadius: 12, marginBottom: 24 }}>
          <RichTextEditor
            value={fullDescriptionHtml}
            onChange={setFullDescriptionHtml}
            placeholder="输入详细的商品介绍，包括产品特点、用途、材质、规格等。支持富文本格式、图片、表格..."
            height={500}
          />
          <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
            💡 提示：使用编辑器添加格式化文本、图片、表格等，内容将以 HTML 格式保存
          </Text>
        </Card>

        <Card title="技术规格参数" style={{ borderRadius: 12, marginBottom: 24 }}>
          <Form.List name="specifications">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={12} align="middle" style={{ marginBottom: 8 }}>
                    <Col span={8}>
                      <Form.Item 
                        {...restField} 
                        name={[name, 'label']} 
                        label={key === fields[0]?.key ? '参数名称' : undefined} 
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="例如：材质" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item 
                        {...restField} 
                        name={[name, 'value']} 
                        label={key === fields[0]?.key ? '参数值' : undefined} 
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="例如：304 不锈钢" />
                      </Form.Item>
                    </Col>
                    <Col span={5}>
                      <Form.Item 
                        {...restField} 
                        name={[name, 'unit']} 
                        label={key === fields[0]?.key ? '单位' : undefined}
                      >
                        <Input placeholder="mm, kg, cm" />
                      </Form.Item>
                    </Col>
                    <Col span={3}>
                      <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} />
                    </Col>
                  </Row>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>添加规格参数</Button>
              </>
            )}
          </Form.List>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card title="常见问题 (FAQ)" style={{ borderRadius: 12 }}>
          <Form.List name="faq">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card 
                    key={key} 
                    size="small" 
                    style={{ marginBottom: 12, background: '#fafafa' }}
                    extra={<Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} />}
                  >
                    <Form.Item 
                      {...restField} 
                      name={[name, 'question']} 
                      label="问题" 
                      rules={[{ required: true }]}
                    >
                      <Input placeholder="客户可能会问什么？" />
                    </Form.Item>
                    <Form.Item 
                      {...restField} 
                      name={[name, 'answer']} 
                      label="回答" 
                      rules={[{ required: true }]}
                    >
                      <TextArea rows={2} placeholder="详细解答..." />
                    </Form.Item>
                  </Card>
                ))}
                {fields.length < 5 && (
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                    添加 FAQ
                  </Button>
                )}
              </>
            )}
          </Form.List>
        </Card>

        <Card title="💡 SEO 优化建议" style={{ borderRadius: 12, marginTop: 24 }}>
          <Text type="secondary">
            <ul style={{ paddingLeft: 16, margin: 0 }}>
              <li>详细描述至少 200 字以上</li>
              <li>添加 3-5 张高质量图片</li>
              <li>填写完整的规格参数</li>
              <li>添加 2-5 个常见问题解答</li>
              <li>使用行业关键词和长尾词</li>
            </ul>
          </Text>
        </Card>
      </Col>
    </Row>
  );

  const renderStep4SEO = () => (
    <Row gutter={24}>
      <Col xs={24} lg={16}>
        <Card title="搜索引擎优化 (SEO)" style={{ borderRadius: 12, marginBottom: 24 }}>
          <Form.Item label="核心关键词" name="focusKeyword">
            <Input placeholder="用户搜索什么词时能找到这个商品？" />
          </Form.Item>
          
          <Divider>Meta 标签</Divider>
          
          <Form.Item label="Meta 标题" name="seoTitle">
            <Input 
              placeholder="搜索引擎显示的标题（建议 60 字符以内）" 
              showCount 
              maxLength={60} 
            />
          </Form.Item>
          
          <Form.Item label="Meta 描述" name="seoDescription">
            <TextArea 
              rows={3} 
              placeholder="搜索引擎显示的描述（建议 120-160 字符）" 
              showCount 
              maxLength={160} 
            />
          </Form.Item>
          
          <Form.Item label="Meta 关键词" name="seoKeywords">
            <Input placeholder="keyword1, keyword2, keyword3" />
          </Form.Item>
        </Card>

        <Card title="关联商品" style={{ borderRadius: 12 }}>
          <Form.Item label="相关商品" name="relatedProducts">
            <Select
              mode="multiple"
              allowClear
              placeholder="输入关键词搜索相关商品..."
              showSearch
              onSearch={searchProducts}
              loading={relatedProductsLoading}
              filterOption={false}
              options={relatedProductOptions}
            />
          </Form.Item>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card title="💡 SEO 最佳实践" style={{ borderRadius: 12 }}>
          <Text type="secondary">
            <ul style={{ paddingLeft: 16, margin: 0 }}>
              <li><strong>Meta 标题：</strong>50-60 字符，包含核心关键词</li>
              <li><strong>Meta 描述：</strong>120-160 字符，吸引点击</li>
              <li><strong>核心关键词：</strong>在标题、描述、详情中自然出现</li>
              <li><strong>FAQ：</strong>提高搜索结果展示几率</li>
              <li><strong>图片优化：</strong>使用描述性文件名和 alt 标签</li>
              <li><strong>内部链接：</strong>关联相关商品提高浏览深度</li>
            </ul>
          </Text>
        </Card>

        <Card title="发布前检查" style={{ borderRadius: 12, marginTop: 24 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />商品名称和 SKU 已填写</div>
            <div><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />主分类已选择</div>
            <div><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />价格已设置</div>
            <div><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />至少有一张图片</div>
            <div><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />详细描述已完善</div>
          </Space>
        </Card>
      </Col>
    </Row>
  );

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><Spin size="large" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')}>返回列表</Button>
          <div>
            <Title level={3} style={{ margin: 0 }}>{isEdit ? '编辑商品' : '新建商品'}</Title>
            <Text type="secondary">{isEdit ? '更新商品信息' : '添加新商品到店铺'}</Text>
          </div>
        </Space>
        <Space>
          <Button onClick={() => navigate('/products')}>取消</Button>
          <Button type="primary" icon={<SaveOutlined />} size="large" loading={saving} onClick={handleSave}>
            {isEdit ? '保存修改' : '创建商品'}
          </Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Steps 
          current={currentStep} 
          items={steps} 
          size="small"
          style={{ maxWidth: 800, margin: '0 auto' }}
        />
      </Card>

      <Form form={form} layout="vertical" initialValues={{ 
        status: 'draft', 
        purchaseMode: 'both', 
        availability: 'contact', 
        minOrderQuantity: 1, 
        'pricing.currency': 'USD' 
      }}>
        {currentStep === 0 && renderStep1Basic()}
        {currentStep === 1 && renderStep2Pricing()}
        {currentStep === 2 && renderStep3Description()}
        {currentStep === 3 && renderStep4SEO()}
      </Form>

      <Card style={{ marginTop: 24, textAlign: 'center' }}>
        <Space>
          {currentStep > 0 && (
            <Button size="large" onClick={handlePrev}>上一步</Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button type="primary" size="large" onClick={handleNext}>下一步</Button>
          ) : (
            <Button type="primary" icon={<CheckCircleOutlined />} size="large" onClick={handleSave}>
              完成创建
            </Button>
          )}
          <Button onClick={() => {
            if (currentStep === 0) handleSave();
            else setCurrentStep(0);
          }}>
            保存草稿
          </Button>
        </Space>
      </Card>
    </div>
  );
}
