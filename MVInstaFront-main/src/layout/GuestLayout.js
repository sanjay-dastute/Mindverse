import React from "react";
import { Layout, Typography } from "antd";
const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const GuestLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header>
        <Title level={3} style={{ color: "#fff", marginBottom: 0 }}>
        GROAA
        </Title>
      </Header>

      <Content style={{ padding: "50px", textAlign: "center", flexGrow: 1 }}>
        {children}
      </Content>
      <Footer style={{ textAlign: "center" }}>©2024 GROAA App</Footer>
    </Layout>
  );
};

export default GuestLayout;
