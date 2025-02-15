import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { Form, Input, Button, message, Row, Col, Typography } from 'antd';
import { getAccountDetails, updateAccountDetails } from '../../services/userService';
import "../../reducers/dashboardReducer";

const AccountDetails = () => {
  const { Title } = Typography;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { screenSize } = useSelector(({dashboardReducer}) => dashboardReducer);

  const fetchAccountDetails = async () => {
    try {
      setLoading(true);
      const data = await getAccountDetails();
      form.setFieldsValue(data);
    } catch (error) {
      message.error('Failed to load account details');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await updateAccountDetails(values);
      message.success('Account details updated successfully');
      fetchAccountDetails(); // Refresh the data
    } catch (error) {
      message.error('Failed to update account details');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAccountDetails();
  }, []);
  
  return (
    <div>
      <Title level={screenSize < 576 ? 3 : 2} style={{ textAlign: "center", marginBottom: "20px" }}>
        Account Settings
      </Title>
      <Row style={{ justifyContent: 'center' }}>
        <Col md={15} xs={24}>
          <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item
              name="contactPerson"
              label="Contact Person"
              rules={[{ required: true, message: 'Please input the contact person!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="contactPhoneNumber"
              label="Contact Phone Number"
              rules={[{ required: true, message: 'Please input the contact phone number!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="organizationName"
              label="Organization Name"
              rules={[{ required: true, message: 'Please input the organization name!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Account Details
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default AccountDetails;