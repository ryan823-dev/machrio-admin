import { useState } from 'react';
import { Layout as AntLayout, Menu, Breadcrumb, Avatar, Dropdown, theme, Typography } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  TagOutlined,
  FileTextOutlined,
  MailOutlined,
  BankOutlined,
  CarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Sider, Content, Header } = AntLayout;
const { Text } = Typography;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  { type: 'divider' as const },
  { 
    key: 'catalog', 
    icon: <ShoppingOutlined />, 
    label: '商品管理', 
    children: [
      { key: '/products', icon: <ShoppingOutlined />, label: '商品列表' },
      { key: '/products/bulk-upload', icon: <UploadOutlined />, label: '批量上传' },
      { key: '/categories', icon: <AppstoreOutlined />, label: '类目管理' },
      { key: '/brands', icon: <TagOutlined />, label: '品牌管理' },
    ]
  },
  { 
    key: 'sales', 
    icon: <ShoppingCartOutlined />, 
    label: '订单管理', 
    children: [
      { key: '/orders', icon: <ShoppingCartOutlined />, label: '订单列表' },
      { key: '/customers', icon: <TeamOutlined />, label: '客户管理' },
    ]
  },
  { 
    key: 'inbox', 
    icon: <MailOutlined />, 
    label: '消息中心', 
    children: [
      { key: '/rfq-inbox', icon: <FileTextOutlined />, label: '询价请求' },
      { key: '/contact-inbox', icon: <MailOutlined />, label: '联系表单' },
      { key: '/sms-inbox', icon: <MessageOutlined />, label: '短信收件箱' },
    ]
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: '系统设置',
    children: [
      { key: '/bank-accounts', icon: <BankOutlined />, label: '银行账户' },
      { key: '/shipping-methods', icon: <CarOutlined />, label: '配送方式' },
      { key: '/shipping-rates', icon: <DollarOutlined />, label: '运费模板' },
      { key: '/free-shipping-rules', icon: <CheckCircleOutlined />, label: '包邮规则' },
    ]
  },
];

const breadcrumbMap: Record<string, string> = {
  '/': '仪表盘',
  '/categories': '类目管理',
  '/categories/new': '新建分类',
  '/categories/edit': '编辑分类',
  '/products': '商品列表',
  '/products/new': '新建商品',
  '/products/edit': '编辑商品',
  '/brands': '品牌管理',
  '/brands/new': '新建品牌',
  '/brands/edit': '编辑品牌',
  '/orders': '订单列表',
  '/orders/new': '新建订单',
  '/customers': '客户管理',
  '/customers/new': '新建客户',
  '/customers/edit': '编辑客户',
  '/rfq-inbox': '询价请求',
  '/contact-inbox': '联系表单',
  '/sms-inbox': '短信收件箱',
  '/bank-accounts': '银行账户',
  '/shipping-methods': '配送方式',
  '/shipping-rates': '运费模板',
  '/free-shipping-rules': '包邮规则',
};

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const pathSnippets = location.pathname.split('/').filter(Boolean);
  const selectedKey = '/' + (pathSnippets[0] || '');

  const breadcrumbItems = [
    { title: '首页', onClick: () => navigate('/'), className: 'breadcrumb-link' },
    ...pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      const title = breadcrumbMap[url] || pathSnippets[index];
      const isLast = index === pathSnippets.length - 1;
      return isLast
        ? { title }
        : { title, onClick: () => navigate(url), className: 'breadcrumb-link' };
    }),
  ];

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人设置' },
    { type: 'divider' as const },
    { key: 'logout', icon: <SettingOutlined />, label: '退出登录' },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 24px',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            gap: 12,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            M
          </div>
          {!collapsed && (
            <Text strong style={{ fontSize: 16, whiteSpace: 'nowrap' }}>
              Machrio
            </Text>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => navigate(key)}
          items={menuItems}
          style={{
            border: 'none',
            padding: '8px',
          }}
        />
      </Sider>

      <AntLayout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            height: 64,
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18, cursor: 'pointer', color: token.colorTextSecondary }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
            <Breadcrumb items={breadcrumbItems} />
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar
              icon={<UserOutlined />}
              style={{ cursor: 'pointer', backgroundColor: token.colorPrimary }}
            />
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: 24,
            minHeight: 'calc(100vh - 64px - 48px)',
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}