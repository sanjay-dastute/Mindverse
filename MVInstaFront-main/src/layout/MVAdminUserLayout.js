// UserLayout.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Layout,
  Menu,
  Typography,
  Badge,
  Dropdown,
  Avatar,
  Spin,
  message,
  theme
} from "antd";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  BellOutlined,
  SettingFilled,
  FormOutlined,
  MessageOutlined
} from "@ant-design/icons";
import Cookies from "js-cookie";
import UserInfo from "../components/user/UserInfo";
import { roles, menuPermissions } from "../services/roleService";
import {
  notificationList,
  markNotificationAsRead,
} from "../services/conversationService";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import "./UserLayout.css";
import { useDispatch, useSelector } from "react-redux";
import { setCollapsed } from "../reducers/dashboardReducer";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;
const { SubMenu } = Menu;


const MVAdminUserLayout = ({ children, selectedMenuKey, onMenuSelect, userRole }) => {

  const dispatch = useDispatch();
  const { collapsed } = useSelector(({ dashboardReducer }) => dashboardReducer);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const {
    token: { colorBgContainer, },
  } = theme.useToken();

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationList();
      setNotifications(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onCollapse = (collapsed) => {
    dispatch(setCollapsed(collapsed));
  };

  const handleLogout = () => {
    // sessionStorage.removeItem("organizationId");
    // sessionStorage.removeItem("token");
    // sessionStorage.removeItem("otherUserId");
    Cookies.remove('organizationId');
    Cookies.remove('token');
    Cookies.remove('otherUserId');

    navigate("/");
  };

  const handleNotificationMouseOver = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      message.error("Failed to mark notification as read.");
    }
  };

  const renderMenuItems = () => {
    const permittedKeys = menuPermissions[userRole];
    const menuItems = [
      { key: "1", icon: <UserOutlined />, label: "Profile" },
      { key: "2", icon: <SettingOutlined />, label: "Response Template" },
      { key: "3", icon: <SettingOutlined />, label: "Product List" },
      { key: "4", icon: <LogoutOutlined />, label: "Mv Admin" },
      { key: "5", icon: <QuestionCircleOutlined />, label: "Support" },
      {
        key: "6",
        icon: <SettingFilled />,
        label: "Setting",
        children: [
          { key: "7", icon: <SettingOutlined />, label: "Context Setting" },
          { key: "8", icon: <FormOutlined />, label: "Integration" },
          { key: "10", icon: <SettingOutlined />, label: "Account Settings" },
          { key: "11", icon: <SettingOutlined />, label: "AIAdmin" },
        ],
      },
      { key: "9", icon: <MessageOutlined />, label: "Conversation" },
    ];

    return menuItems
      .filter((item) => permittedKeys.includes(item.key))
      .map((item) =>
        item.children ? (
          <SubMenu key={item.key} icon={item.icon} title={item.label}>
            {item.children.map((child) => (
              <Menu.Item key={child.key} icon={child.icon}>
                {child.label}
              </Menu.Item>
            ))}
          </SubMenu>
        ) : (
          <Menu.Item key={item.key} icon={item.icon}>
            {item.label}
          </Menu.Item>
        )
      );
  };

  const renderNotifications = () => {
    if (loading) {
      return <Spin />;
    }
    if (error) {
      return <Menu.Item key="error">Error fetching notifications</Menu.Item>;
    }
    if (notifications.length === 0) {
      return <Menu.Item key="empty">No notifications</Menu.Item>;
    }
    return notifications.map((notification) => (
      <Menu.Item
        key={notification._id}
        onMouseOver={() => handleNotificationMouseOver(notification._id)}>
        <div>
          {notification.message}
          <div style={{ fontSize: "12px", color: "#888" }}>
            {moment(notification.createdAt).format("MMMM Do YYYY, h:mm:ss a")}
          </div>
        </div>
      </Menu.Item>
    ));
  };

  const notificationMenu = <Menu>{renderNotifications()}</Menu>;

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#001529",
          padding: "0 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#fff",
          zIndex: 1,
        }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Title
            level={3}
            style={{
              color: "#fff",
              marginBottom: "5px",
              marginLeft: "-10px",
              fontSize: "25px",
            }}>
            GROAA
          </Title>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Dropdown menu={notificationMenu} placement="bottomRight">
            <Badge count={notifications.length || 0}>
              <BellOutlined
                style={{
                  fontSize: "20px",
                  color: "#fff",
                  marginRight: "20px",
                }}
              />
            </Badge>
          </Dropdown>
          <Dropdown menu={userMenu} placement="bottomRight">
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: "#87d068", cursor: "pointer" }}
            />
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <Sider
          style={{ background: colorBgContainer }}
          collapsible
          collapsed={collapsed}
          onCollapse={onCollapse}>
          <Menu
            mode="inline"
            selectedKeys={[selectedMenuKey]}
            onClick={onMenuSelect}
            style={{
              borderRight: 0,
              paddingTop: "20px",
            }}>
            {renderMenuItems()}
          </Menu>
        </Sider>
        <Layout>
          {userRole === roles.ADMIN && <UserInfo />}
          <Content
            style={{
              margin: "0",
              padding: "50px",
              textAlign: "center",
            }}>
            {typeof children === "function"
              ? children({ refreshNotifications: fetchNotifications })
              : children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MVAdminUserLayout;
