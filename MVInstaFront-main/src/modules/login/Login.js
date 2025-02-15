import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Alert, Row, Col, Typography } from "antd";
import Cookies from "js-cookie";
// import { useDispatch, useSelector } from "react-redux";
import { login } from "../../services/authService";
import GuestLayout from "../../layout/GuestLayout";
import LoginImage from "../../assets/mobile-login.png";
import "./login.css";
// import { setFacebookState } from "../../reducers/facebookReducer";

const { Title } = Typography;

const Login = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  // const dispatch = useDispatch();
  // const { userId } = useSelector(({facebookReducer}) => facebookReducer);

  useEffect(() => {
    if(Cookies.get('otherUserId')) navigate('/mvadmin/dashboard');
  }, [])

  const onFinish = async (values) => {
    try {
      const { token, organizationId, otherUserId } = await login(
        values.username,
        values.password
      );
  
      if (token) {
        // sessionStorage.setItem("token", token);
        Cookies.set('token', token, {expires: 3650});

      }
  
      if (organizationId) {
        // sessionStorage.setItem("organizationId", organizationId);
        Cookies.set('organizationId', organizationId, {expires: 3650});
        navigate("/dashboard");
      }
  
      if (otherUserId) {
        // sessionStorage.setItem("otherUserId", otherUserId);
        Cookies.set('otherUserId', otherUserId, {expires: 3650});
        // dispatch(setFacebookState(otherUserId));
        navigate('/mvadmin/dashboard');
      }

  
      
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  const handleLogin = () => {
    form.validateFields().then((values) => {
      onFinish(values);
    }).catch((errorInfo) => {
      // Handle form validation errors
      console.log("Form validation failed:", errorInfo);
    });
  };

  const [form] = Form.useForm();

  return (
    <GuestLayout>
      <Row justify="center" align="middle" style={{ height: "100%" }}>
      <Col xs={24} lg={8} md={12}>
      <div className="login-image">
        <img src={LoginImage} className="w-full"/>
      </div>
      </Col>
        <Col xs={22} sm={18} md={12} lg={8}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleLogin}
            style={{
              padding: "30px",
              backgroundColor: "#fff",
              borderRadius: "5px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Title level={3} style={{ textAlign: "center", marginBottom: "30px" }}>
              Login
            </Title>
            {error && <Alert message={error} type="error" showIcon />}
            <Form.Item
              name="username"
              rules={[{ required: true, message: "Please input your username!" }]}
            >
              <Input placeholder="Username" size="large" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password placeholder="Password" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" size="large" block htmlType="submit">
                Login
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </GuestLayout>
  );
};

export default Login;