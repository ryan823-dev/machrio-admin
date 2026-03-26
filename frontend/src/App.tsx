import { useState, useEffect } from "react";
import { Layout, Menu, Table, Card, Tabs, Form, Input, Select, InputNumber, Switch, Button, Space, Tag, message, Row, Col, Modal } from "antd";
import { DashboardOutlined, AppstoreOutlined, ShoppingOutlined, PlusOutlined } from "@ant-design/icons";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";

const { Header, Sider, Content } = Layout;
const { TextArea } = Input;
const { TabPane } = Tabs;

const API_URL = "http://localhost:8080/api";

// ============================================
// Dashboard Page
// ============================================
function DashboardPage() {
  const [stats, setStats] = useState({ categories: 0, products: 0, brands: 0, orders: 0 });

  useEffect(() => {
    fetch(`${API_URL}/categories?page=1&pageSize=1`).then(r => r.json()).then(d => setStats(p => ({ ...p, categories: d.total || 0 })));
    fetch(`${API_URL}/products?page=1&pageSize=1`).then(r => r.json()).then(d => setStats(p => ({ ...p, products: d.total || 0 })));
  }, []);

  const cards = [
    { title: "Categories", value: stats.categories, color: "#3f8600", icon: <AppstoreOutlined /> },
    { title: "Products", value: stats.products, color: "#1890ff", icon: <ShoppingOutlined /> },
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <Row gutter={16}>
        {cards.map((c, i) => (
          <Col span={8} key={i}>
            <Card bordered={false} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, color: "#666" }}>{c.title}</div>
              <div style={{ fontSize: 36, fontWeight: "bold", color: c.color }}>{c.value.toLocaleString()}</div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

// ============================================
// Categories List Page
// ============================================
function CategoriesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editItem, setEditItem] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchData = (pageNum: number) => {
    setLoading(true);
    fetch(`${API_URL}/categories?page=${pageNum}&pageSize=20`)
      .then(res => res.json())
      .then(result => {
        setData(result.data?.items || []);
        setTotal(result.total || 0);
        setLoading(false);
      });
  };

  useEffect(() => { fetchData(page); }, [page]);

  const handleEdit = (record: any) => {
    setEditItem(record);
    form.setFieldsValue(record);
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      const method = editItem?.id ? "PUT" : "POST";
      const url = editItem?.id ? `${API_URL}/categories/${editItem.id}` : `${API_URL}/categories`;
      fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }).then(r => r.json()).then(() => {
        message.success("保存成功");
        setEditItem(null);
        form.resetFields();
        fetchData(page);
      });
    });
  };

  const columns = [
    { title: "排序", dataIndex: "displayOrder", key: "displayOrder", width: 70 },
    { title: "名称", dataIndex: "name", key: "name", render: (v: string, r: any) => <a onClick={() => handleEdit(r)}>{v}</a> },
    { title: "Slug", dataIndex: "slug", key: "slug", width: 200 },
    { title: "Featured", dataIndex: "featured", key: "featured", width: 100, render: (v: boolean) => <Tag color={v ? "green" : "default"}>{v ? "Yes" : "No"}</Tag> },
    { title: "Status", dataIndex: "status", key: "status", width: 100, render: (v: string) => <Tag color={v === "published" ? "blue" : "orange"}>{v || "draft"}</Tag> },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>分类</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditItem({}); form.resetFields(); }}>新建分类</Button>
      </div>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={{ current: page, onChange: setPage, total, pageSize: 20 }} />

      <Modal title={editItem?.id ? "编辑分类" : "新建分类"} open={!!editItem} onCancel={() => setEditItem(null)} onOk={handleSave} width={800} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item label="名称" name="name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="排序" name="displayOrder" initialValue={0}>
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Slug" name="slug" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="简短描述" name="shortDescription">
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <TextArea rows={4} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Featured" name="featured" valuePropName="checked" initialValue={false}>
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Status" name="status" initialValue="published">
                <Select options={[{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }]} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

// ============================================
// Products List Page
// ============================================
function ProductsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [editItem, setEditItem] = useState<any>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("basic");

  const fetchData = (pageNum: number, search?: string) => {
    setLoading(true);
    const params = new URLSearchParams({ page: pageNum.toString(), pageSize: "20" });
    if (search) params.append("search", search);
    fetch(`${API_URL}/products?${params}`)
      .then(res => res.json())
      .then(result => {
        setData(result.data?.items || []);
        setTotal(result.total || 0);
        setLoading(false);
      });
  };

  useEffect(() => { fetchData(page, searchText); }, [page, searchText]);

  const handleEdit = (record: any) => {
    setEditItem(record);
    form.setFieldsValue(record);
    setActiveTab("basic");
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      const method = editItem?.id ? "PUT" : "POST";
      const url = editItem?.id ? `${API_URL}/products/${editItem.id}` : `${API_URL}/products`;
      fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }).then(r => r.json()).then(() => {
        message.success("保存成功");
        setEditItem(null);
        form.resetFields();
        fetchData(page, searchText);
      });
    });
  };

  const columns = [
    { title: "SKU", dataIndex: "sku", key: "sku", width: 150 },
    { title: "产品名称", dataIndex: "name", key: "name", render: (v: string, r: any) => <a onClick={() => handleEdit(r)}>{v}</a> },
    { title: "Status", dataIndex: "status", key: "status", width: 100, render: (v: string) => <Tag color={v === "published" ? "green" : "orange"}>{v || "draft"}</Tag> },
    { title: "创建时间", dataIndex: "createdAt", key: "createdAt", width: 120, render: (v: string) => v ? new Date(v).toLocaleDateString() : "-" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>产品</h1>
        <Space>
          <Input.Search placeholder="搜索名称/SKU" onSearch={setSearchText} style={{ width: 250 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditItem({}); form.resetFields(); }}>新建产品</Button>
        </Space>
      </div>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={{ current: page, onChange: setPage, total, pageSize: 20 }} />

      <Modal title={editItem?.id ? "编辑产品" : "新建产品"} open={!!editItem} onCancel={() => setEditItem(null)} onOk={handleSave} width={900} okText="保存" cancelText="取消">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="基本信息" key="basic">
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item label="产品名称" name="name" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="SKU" name="sku" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="简短描述" name="shortDescription">
                <TextArea rows={3} />
              </Form.Item>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Status" name="status" initialValue="draft">
                    <Select options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "discontinued", label: "Discontinued" }]} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="购买方式" name="purchaseMode" initialValue="both">
                    <Select options={[{ value: "both", label: "Online + RFQ" }, { value: "buy-online", label: "Online Only" }, { value: "rfq-only", label: "RFQ Only" }]} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="库存状态" name="availability" initialValue="contact">
                    <Select options={[{ value: "in-stock", label: "In Stock" }, { value: "made-to-order", label: "Made to Order" }, { value: "contact", label: "Contact" }]} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </TabPane>

          <TabPane tab="定价库存" key="pricing">
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="成本价" name={["pricing", "costPrice"]}>
                    <InputNumber prefix="$" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="销售价" name={["pricing", "basePrice"]}>
                    <InputNumber prefix="$" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="原价(划线)" name={["pricing", "compareAtPrice"]}>
                    <InputNumber prefix="$" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="起订量" name="minOrderQuantity" initialValue={1}>
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="包装数量" name="packageQty">
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="包装单位" name="packageUnit">
                    <Input placeholder="box, case, roll" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="货期" name="leadTime">
                    <Input placeholder="e.g., 2-3 weeks" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </TabPane>

          <TabPane tab="规格参数" key="specs">
            <Form form={form} layout="vertical">
              <Form.Item label="规格列表" name="specifications">
                <TextArea rows={4} placeholder='格式: [{"label": "Material", "value": "Steel"}, {"label": "Weight", "value": "10kg"}]' />
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="SEO内容" key="seo">
            <Form form={form} layout="vertical">
              <Form.Item label="完整描述" name="fullDescription">
                <TextArea rows={6} placeholder='JSON格式富文本内容' />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Meta Title" name="metaTitle">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Focus Keyword" name="focusKeyword">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Meta Description" name="metaDescription">
                <TextArea rows={2} />
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Modal>
    </div>
  );
}

// ============================================
// Layout Component
// ============================================
function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = location.pathname === "/" ? "/" : `/${location.pathname.split("/")[1]}`;

  const menuItems = [
    { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
    { type: "divider" as const },
    { key: "/categories", icon: <AppstoreOutlined />, label: "分类" },
    { key: "/products", icon: <ShoppingOutlined />, label: "产品" },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center", background: "#001529" }}>
        <div style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>Machrio Admin</div>
      </Header>
      <Layout>
        <Sider width={220} style={{ background: "#fff" }}>
          <Menu mode="inline" selectedKeys={[selectedKey]} onClick={({ key }) => navigate(key)} items={menuItems} style={{ height: "100%" }} />
        </Sider>
        <Content style={{ padding: 24 }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/products" element={<ProductsPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
