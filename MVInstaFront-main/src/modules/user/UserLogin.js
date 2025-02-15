import React, { useEffect } from "react";
import { Row, Col, Typography } from "antd";
import Cookies from "js-cookie";
import FacebookLogin from "../../components/facebook/FacebookLogin";
import GuestLayout from "../../layout/GuestLayout";
import { useNavigate } from "react-router";
import InstagramLogin from "../../components/instagram/InstagramLogin";
const { Title } = Typography;

const LoginPage = () => {

  const navigate = useNavigate();
  // const organizationId = Cookies.get('organizationId');
  const token = Cookies.get('token');

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [])

  return (
    <div>
      {!token ? (
        <GuestLayout>
          <Row justify="center" align="middle" style={{ minHeight: "70vh" }}>
            <Col>
              <Title level={3}>Login to your account</Title>
              <Row justify="space-between" gutter={16}>
                <Col>
                  <FacebookLogin />
                </Col>
                <Col>
                  <InstagramLogin />
                </Col>
              </Row>
            </Col>
          </Row>
        </GuestLayout>
      ) : null}
    </div>
  );
};
export default LoginPage;
