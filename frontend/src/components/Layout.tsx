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
  GlobalOutlined,
  BookOutlined,
  TranslationOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Sider, Content, Header } = AntLayout;
const { Text } = Typography;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { type: 'divider' as const },
  { key: 'catalog', icon: <ShoppingOutlined />, label: 'Catalog', children: [
    { key: '/products', icon: <ShoppingOutlined />, label: 'Products' },
    { key: '/categories', icon: <AppstoreOutlined />, label: 'Categories' },
    { key: '/brands', icon: <TagOutlined />, label: 'Brands' },
  ]},
  { key: 'sales', icon: <ShoppingCartOutlined />, label: 'Sales', children: [
    { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Orders' },
    { key: '/customers', icon: <TeamOutlined />, label: 'Customers' },
  ]},
  { key: 'inbox', icon: <MailOutlined />, label: 'Inbox', children: [
    { key: '/rfq-inbox', icon: <FileTextOutlined />, label: 'RFQ Inquiries' },
    { key: '/contact-inbox', icon: <MailOutlined />, label: 'Contact Forms' },
  ]},
];

const breadcrumbMap: Record<string, string> = {
  '/': 'Dashboard',
  '/categories': 'Categories',
  '/categories/new': 'New Category',
  '/products': 'Products',
  '/products/new': 'New Product',
  '/brands': 'Brands',
  '/orders': 'Orders',
  '/customers': 'Customers',
  '/rfq-inbox': 'RFQ Inbox',
  '/contact-inbox': 'Contact Inbox',
};

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const pathSnippets = location.pathname.split('/').filter(Boolean);
  const selectedKey = '/' + (pathSnippets[0] || '');

  const breadcrumbItems = [
    { title: 'Home', onClick: () => navigate('/'), className: 'breadcrumb-link' },
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
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
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