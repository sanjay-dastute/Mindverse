// src/components/mvadmin/AIAdmin.js

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Form, Input, Button, message, Row, Col, Typography } from 'antd';
import { getDefaultParams, updateDefaultParams } from '../../services/aiService';
import "../../reducers/dashboardReducer";

const AIAdmin = () => {
  const { Title } = Typography;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { screenSize } = useSelector(({dashboardReducer}) => dashboardReducer);

  useEffect(() => {
    fetchDefaultParams();
  }, []);

  const fetchDefaultParams = async () => {
    try {
      setLoading(true);
      const data = await getDefaultParams();
      const { id, ...formData } = data;
      form.setFieldsValue(formData);
    } catch (error) {
      message.error('Failed to load default AI parameters');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await updateDefaultParams(values);
      message.success('AI parameters updated successfully');
    } catch (error) {
      message.error('Failed to update AI parameters');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row style={{ justifyContent: 'center' }}>
      <Col span={24}> 
      <Title level={screenSize < 576 ? 3 : 2} style={{ textAlign: "center", marginBottom: "20px" }}>
        AI Admin
      </Title>
      </Col>
      <Col md={15} xs={24}>
        <Form form={form} onFinish={onFinish} layout="vertical">

          <Form.Item
            name="model"
            label="Model"
            rules={[{ required: true, message: 'Please input the model!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="api_key"
            label="API Key"
            rules={[{ required: true, message: 'Please input the API key!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="frequency_panelty"
            label="Frequency Penalty"
            rules={[{ required: true, message: 'Please input the frequency penalty!' }]}
          >
            <Input type="number" step="0.1" />
          </Form.Item>

          <Form.Item
            name="max_tokens"
            label="Max Tokens"
            rules={[{ required: true, message: 'Please input the max tokens!' }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            name="presence_panelty"
            label="Presence Penalty"
            rules={[{ required: true, message: 'Please input the presence penalty!' }]}
          >
            <Input type="number" step="0.1" />
          </Form.Item>

          <Form.Item
            name="temperature"
            label="Temperature"
            rules={[{ required: true, message: 'Please input the temperature!' }]}
          >
            <Input type="number" step="0.1" />
          </Form.Item>

          <Form.Item
            name="top_p"
            label="Top P"
            rules={[{ required: true, message: 'Please input the top p value!' }]}
          >
            <Input type="number" step="0.1" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update AI Parameters
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};

export default AIAdmin;