// src/components/UserInfo.js
import React, { memo, useEffect, useState } from "react";
import { Card, Col, Row, Avatar, Statistic, Spin } from "antd";
import Cookies from "js-cookie";
import { getUserProfile } from "../../services/userService";
import ToggleSubscription from "./ToggleSubscription";
import '../../reducers/dashboardReducer';
import "./user.css";
import "./userDark.css";
import { useSelector } from "react-redux";

const UserInfo = memo(() => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { collapsed, screenSize } = useSelector(({ dashboardReducer }) => dashboardReducer);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // const organizationId = sessionStorage.getItem("organizationId");
        const organizationId = Cookies.get('organizationId');
        const data = await getUserProfile(organizationId);
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <Spin size="large" />;
  }

  if (!userData) {
    return <div>Error loading user data</div>;
  }

  return (
    <Card size="small" className="user" style={{ marginLeft: collapsed ? (screenSize < 576 ? "" : '4%') : '' }}>
      <Row gutter={[9, 9]} align="right" className="userInfoMainRow">
        <Col xl={5} lg={6} md={8} sm={10} xs={9} style={{ textAlign: 'left', marginLeft: screenSize > 1200 ? '5%' : '' }} className="user-profile-col">
          <div className="user-profile">
            <Avatar src={userData.avatar} className="profile-image" />
          </div>
        </Col>
        <Col xl={15} lg={12} md={14} sm={12} xs={24}>
          <h2 className="profile-name">{userData.name}
          </h2>
          <Row className="profile-detail-row" style={{ columnGap: screenSize < 576 ? "" : '12px' }} gutter={[3, 3]}>
            <Col xs={6} sm={5} md={7} lg={4} xl={4}>
              <Statistic title={userData.mediaCount} value="Media" className="text-left profile-detail" style={{ fontSize: screenSize < 576 ? '12px' : '16px' }} />
            </Col>
            <Col xs={6} sm={9} md={7} lg={4} xl={4}>
              <Statistic title={userData?.followers ? userData.followers : 0} value="Followers" className="text-left profile-detail" />
            </Col>
            <Col xs={6} sm={7} md={7} lg={4} xl={4}>
              <Statistic title={userData.productCount} value="Products" className="text-left profile-detail" />
            </Col>
            <Col span={24}>
              <div className="profile-desc">
                {/* <p className="profile-title">{userData.title}</p> */}
                <p className="profile-about">{userData.biography}</p>
                {/* <p className="profile-follower text-xs"><span className="text-gray">Followed by</span> <span className="font-semibold text-black">kurzgesagt</span></p> */}
              </div>
            </Col>
          </Row>
        </Col>
        <Col span={24} style={{ marginLeft: screenSize > 1200 ? '6%' : '' }}>
          <ToggleSubscription />
        </Col>
      </Row>
    </Card>
  );
});

export default UserInfo;
