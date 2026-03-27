import { Layout as AntdLayout, Menu, theme } from "antd";
import { DashboardOutlined, AppstoreOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useState } from "react";

const { Header, Content, Sider } = AntdLayout;

export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/categories",
      icon: <AppstoreOutlined />,
      label: "Categories",
    },
    {
      key: "/products",
      icon: <ShoppingOutlined />,
      label: "Products",
    },
  ];

  return (
    <AntdLayout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center", padding: "0 24px", background: "#001529" }}>
        <div style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
          Machrio Admin
        </div>
      </Header>
      <AntdLayout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          style={{ background: colorBgContainer }}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={({ key }) => navigate(key)}
            items={menuItems}
            style={{ height: "100%", borderRight: 0 }}
          />
        </Sider>
        <AntdLayout style={{ padding: "0 24px 24px" }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              marginTop: 24,
            }}
          >
            <Outlet />
          </Content>
        </AntdLayout>
      </AntdLayout>
    </AntdLayout>
  );
};
