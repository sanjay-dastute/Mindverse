// UserLayout.js
import React, { useState, useEffect, useCallback, memo } from "react";
import {
  Popover,
  Layout,
  Menu,
  // Typography,
  // Badge,
  // Dropdown,
  // Avatar,
  // Spin,
  // message,
  theme,
  Drawer,
  List,
  Avatar,
  // Switch
} from "antd";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  BellOutlined,
  SettingFilled,
  FormOutlined,
  PictureFilled,
  ShoppingFilled,
  // ProductOutlined,
  // WechatFilled,
  // BarsOutlined,
  MessageOutlined,
  MenuOutlined,
  ContainerOutlined,
  SolutionOutlined,
  DashboardOutlined,
  // UserSwitchOutlined,
  // BulbOutlined
} from "@ant-design/icons";
import Cookies from "js-cookie";
import moment from "moment";
import UserInfo from "../components/user/UserInfo";
import { roles, menuPermissions } from "../services/roleService";
import {
  notificationList,
  // markNotificationAsRead,
} from "../services/conversationService";
// import { useNavigate } from "react-router-dom";
// import moment from "moment";
import "./UserLayout.css";
import "./UserLayoutDark.css";
import PopoverContent from "./PopOverContent";
import { setCollapsed, setScreenSize } from '../reducers/dashboardReducer';
import { useDispatch, useSelector } from "react-redux";


const { Content, Sider } = Layout;
// const { Title } = Typography;
const { SubMenu } = Menu;

const UserLayout = memo(({ children, selectedMenuKey, onMenuSelect, userRole }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);//for notification want to be changed
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [morePopup, setMorePopup] = useState(false);
  const [menuOpenKeys, setMenuOpenKeys] = useState([userRole === roles.MVADMIN ? '' : '10']);

  // const navigate = useNavigate();
  const dispatch = useDispatch();
  const { collapsed } = useSelector(({ dashboardReducer }) => dashboardReducer);


  const handleResize = () => {
    setScreenWidth(window.innerWidth);
  };

  useEffect(() => {
    // Add event listener to track window resize
    window.addEventListener('resize', handleResize);

    // Collapse sider when screen width is less than 768px (md breakpoint)
    if (screenWidth < 768) dispatch(setCollapsed(true));
    else dispatch(setCollapsed(false));
    dispatch(setScreenSize(screenWidth));

    // Clean up the event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [screenWidth]);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const menuIconStyle = {
    fontSize: collapsed ? '' : '2vw'
  }

  const menuIconBottomStyle = {
    fontSize: '4.5vw'
  }

  const menuItemsArr = [
    { key: "16", icon: <DashboardOutlined style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />, label: "Dashboard" },
    { key: "1", icon: <UserOutlined style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />, label: "Profile" },
    { key: "2", icon: <PictureFilled style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />, label: "Response Template" },
    { key: "3", icon: <ShoppingFilled style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />, label: "Products" },
    { key: "4", icon: <LogoutOutlined style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />, label: "Mv Admin" },
    { key: "5", icon: <QuestionCircleOutlined style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />, label: "Support" },

    // {
    //   key: "10",
    //   icon: <SettingOutlined />,
    //   label: "Default",
    //   children: [
    //     { key: "11", icon: <SettingOutlined />, label: "AI Admin" },
    //     { key: "12", icon: <SettingOutlined />, label: "Universal Context" },
    //   ],
    // },
    {
      key: "6",
      icon: <SettingFilled style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />,
      label: "Settings",
      children: [
        { key: "8", icon: <FormOutlined />, label: "Integration" },
        { key: "10", icon: <SolutionOutlined />, label: "Account Settings" },
      ],
    },
    { key: "9", icon: <QuestionCircleOutlined style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />, label: "Conversation" },
    { key: "11", icon: <MessageOutlined style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />, label: "Conversation" },
    { key: "14", icon: <BellOutlined style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />, label: "Notifications" },
    { key: "15", icon: <MenuOutlined style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />, label: "More" },

  ];

  const menuItemsMVArr = [
    { key: "16", icon: <DashboardOutlined style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />, label: "Dashboard" },
    { key: "1", icon: <UserOutlined style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />, label: "Profile" },
    { key: "2", icon: <PictureFilled style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />, label: "Response Template" },
    { key: "3", icon: <ShoppingFilled style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />, label: "Products" },
    { key: "4", icon: <LogoutOutlined style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />, label: "Mv Admin" },
    { key: "5", icon: <QuestionCircleOutlined style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />, label: "Support" },
    {
      key: "6",
      icon: <SettingFilled style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />,
      label: "Settings",
      children: [
        { key: "7", icon: <ContainerOutlined />, label: "Context Settings" },
        { key: "8", icon: <FormOutlined />, label: "Integration" },
        { key: "10", icon: <SolutionOutlined />, label: "Account Settings" },
        { key: "11", icon: <SettingOutlined />, label: "AIAdmin" },
      ],
    },
    { key: "9", icon: <MessageOutlined style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />, label: "Conversations" },
    {
      key: "10",
      icon: <SettingOutlined style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />,
      label: "Default",
      children: [
        { key: "11", icon: <SettingOutlined />, label: "AI Admin" },
        { key: "12", icon: <ContainerOutlined />, label: "Universal Context" },
      ],
    },
    { key: "14", icon: <BellOutlined style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />, label: "Notifications" },
    { key: "15", icon: <MenuOutlined style={screenWidth < 576 ? menuIconBottomStyle : menuIconStyle} />, label: "More" },
  ];

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationList();
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const mappedNotifications = sortedData.map(item => ({
        id: item._id,
        avatar: 'https://via.placeholder.com/40', // Replace this with the actual avatar URL if available
        title: item.message,
        description: moment(item.createdAt).fromNow(), // Formatting date like "5 minutes ago"
      }));
      setNotifications(mappedNotifications);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onCollapse = () => {
    if (collapsed) dispatch(setCollapsed(false));
    else dispatch(setCollapsed(true));
  };

  const handleMenuOpenChange = (keys) => {
    setMenuOpenKeys(keys);
  }



  // const handleNotificationMouseOver = async (notificationId) => {
  //   try {
  //     await markNotificationAsRead(notificationId);
  //     fetchNotifications();
  //   } catch (error) {
  //     message.error("Failed to mark notification as read.");
  //   }
  // };

  const renderMenuItems = useCallback(() => {
    const permittedKeys = menuPermissions[userRole];
    if (!permittedKeys.includes("15")) permittedKeys.push("15");
    if (!permittedKeys.includes("14")) permittedKeys.push("14");
    if (!permittedKeys.includes("16")) permittedKeys.push("16");
    console.log('PERMIT ', permittedKeys);
    const menuItems = Cookies.get('otherUserId') ? menuItemsMVArr : menuItemsArr;

    const calculateMarginTop = () => {
      const totalMenuHeight = menuItems.filter(item => permittedKeys.includes(item.key)).length * 64 + (permittedKeys.includes('10') ? (menuOpenKeys?.includes('10') ? 64 * 2 : 0) : 0); // Estimate height of all menu items (48px per item)
      const availableHeight = window.innerHeight; // Get the current viewport height
      const spaceLeft = availableHeight - totalMenuHeight - 40; // 40px buffer space

      return spaceLeft > 0 ? `${spaceLeft}px` : 'auto'; // If there's enough space, apply it; otherwise, auto
    };

    return menuItems
      .filter((item) => permittedKeys.includes(item.key))
      .map((item) => {
        if (item.children) {
          return <SubMenu key={item.key} icon={item.icon} title={screenWidth < 576 ? "" : item.label} style={{ width: screenWidth < 576 ? '12%' : '' }}>
            {item.children.map((child) => (
              <Menu.Item key={child.key} icon={child.icon}>
                {child.label}
              </Menu.Item>
            ))}
          </SubMenu>
        }
        else {
          if (item.key === "15") {
            return (
              <Popover
                content={PopoverContent}
                trigger="click"
                open={morePopup}
                placement="top"
                overlayStyle={{ width: '240px' }}
                getPopupContainer={() => document.body}

              >
                <Menu.Item key={item.key} icon={item.icon} onClick={() => setMorePopup(prev => !prev)} style={{ width: screenWidth < 576 ? '12%' : '', paddingLeft: '30px', }}>
                  {screenWidth < 576 ? "" : item.label}
                </Menu.Item>
              </Popover>
            );
          }
          else {
            return <Menu.Item key={item.key} icon={item.icon} style={{ width: screenWidth < 576 ? '12%' : '', marginTop: item.key === '14' ? screenWidth < 576 ? '' : calculateMarginTop() : '' }} >
              {screenWidth < 576 ? "" : item.label}
            </Menu.Item>
          }
        }
      }
      );


  }, [collapsed, userRole, morePopup]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout>
        {screenWidth > 576 ? <Sider className="sidebar"
          width={collapsed ? '6%' : '18%'}
          collapsible
          collapsed={collapsed}
          onCollapse={onCollapse}
          style={{
            height: '100vh',
            position: 'fixed',
            background: colorBgContainer,
          }}
          trigger={null}
        >
          <Menu
            className="menu-vertical"
            mode="inline"
            // theme="light"
            openKeys={menuOpenKeys}
            onOpenChange={handleMenuOpenChange}
            selectedKeys={[selectedMenuKey]}
            // defaultOpenKeys={userRole === roles.MVADMIN ? [] : ['10']}
            onClick={(e) => {
              if (!e.key) {
                // onMenuSelect("15");
                // onCollapse();
                // setMorePopup(prev => !prev);
              }
              else {
                if (e.key === "14") setVisible(true)
                else {
                  setVisible(false);
                  onMenuSelect(e.key);
                }
              }
            }}
            style={{
              borderRight: 0,
              paddingTop: "20px",
              height: '100%'

            }}>
            {renderMenuItems()}
          </Menu>
          <Drawer
            closable
            // destroyOnClose
            title={"Notifications"}
            placement="left"
            open={visible}
            // loading={loading}
            onClose={() => setVisible(false)}
          >
            <List
              itemLayout="horizontal"
              dataSource={notifications}
              renderItem={item => (
                <List.Item
                  // actions={[
                  //   <Button type="link" key="view">View</Button>, // Optional action buttons
                  // ]}
                  style={{
                    padding: '10px 16px',
                    borderBottom: '1px solid #f0f0f0', // Adds a separator between notifications
                  }}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} />}
                    title={<a href="#!">{item.title}</a>}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Drawer>
        </Sider> :
          <Sider
            width={'100%'}
            // collapsible
            collapsed={false}
            // onCollapse={onCollapse}
            // collapsedWidth={0}
            style={{
              position: 'fixed',
              bottom: 0,
              background: colorBgContainer,
              height: '60px', // Adjust the height for the bottom navigation
              zIndex: 999,
              margin: 0,
              padding: 0
            }}
          // trigger={null}
          >
            <Menu
              // className="menu-vertical"
              mode="horizontal"
              // theme="light"
              selectedKeys={[selectedMenuKey]}
              // defaultOpenKeys={userRole === roles.MVADMIN ? [] : ['10']}
              onClick={(e) => {
                if (!e.key) {
                  // onMenuSelect("15");
                  // onCollapse();
                  // setMorePopup(prev => !prev);
                }
                else {
                  if (e.key === "14") setVisible(true)
                  else {
                    setVisible(false);
                    onMenuSelect(e.key);
                  }
                }
              }}
              style={{
                // lineHeight: '60px',
                // display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                height: '100%',
                // margin: 0,
                // padding: 0
              }}>
              {renderMenuItems()}
            </Menu>
            <Drawer
              closable
              // destroyOnClose
              title={"Notifications"}
              placement="left"
              open={visible}
              // loading={loading}
              onClose={() => {
                setVisible(false);
                // onMenuSelect(selectedMenuKey)
              }}
            >
              <List
                itemLayout="horizontal"
                dataSource={notifications}
                renderItem={item => (
                  <List.Item
                    // actions={[
                    //   <Button type="link" key="view">View</Button>, // Optional action buttons
                    // ]}
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid #f0f0f0', // Adds a separator between notifications
                    }}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={item.avatar} />}
                      title={<a href="#!">{item.title}</a>}
                      description={item.description}
                    />
                  </List.Item>
                )}
              />
            </Drawer>
          </Sider>}



        <Layout style={{ marginLeft: collapsed ? (screenWidth < 576 ? "" : '6%') : '18%' }}>
          {userRole === roles.ADMIN && selectedMenuKey === '1' && <UserInfo />}
          <Content className="text-center" style={{ marginLeft: collapsed ? (screenWidth < 576 ? "" : '4%') : '', paddingBottom: '60px' }}>
            {typeof children === "function"
              ? children({ refreshNotifications: fetchNotifications })
              : children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
});

export default UserLayout;