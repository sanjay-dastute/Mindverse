import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Form, Input, Button, message, Typography, Row, Col } from "antd";
import {
  getUserSettings,
  updateUserSettings,
} from "../../services/userService";
import { createNotification } from "../../services/conversationService";
import "../../reducers/dashboardReducer";

const { Title } = Typography;

const SettingForm = ({ refreshNotifications }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const organizationId = "6660cf50a3e8217c0947f207"; // Example organizationId

  const { screenSize } = useSelector(({dashboardReducer}) => dashboardReducer);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getUserSettings(organizationId);
        form.setFieldsValue(data.setting);
      } catch (error) {
        message.error(error.message);
      }
    };

    fetchSettings();
  }, [form, organizationId]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await updateUserSettings(values);

      // Create notification
      try {
        const notificationMessage = "Settings updated successfully";
        await createNotification(notificationMessage);
        refreshNotifications();
      } catch (notificationError) {
        console.error("Notification Error:", notificationError);
      }

      message.success("Settings updated successfully");
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={screenSize < 576 ? 3 : 2} style={{ textAlign: "center", marginBottom: "20px" }}>
        Shopify Integration
      </Title>
      <Row style={{justifyContent: 'center'}}>
      <Col md={15} xs={24}>
      <Form
        form={form}
        name="settingForm"
        onFinish={onFinish}
        layout="vertical"
        initialValues={{
          shop_domain: "",
          access_token: "",
          webhook_validation_hash: "",
        }}>
        <Form.Item
          name="shop_domain"
          label="Shop Domain"
          rules={[
            { required: true, message: "Please input the shop domain!" },
          ]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="access_token"
          label="Access Token"
          rules={[
            { required: true, message: "Please input the access token!" },
          ]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="webhook_validation_hash"
          label="Webhook Validation Hash"
          rules={[
            {
              required: true,
              message: "Please input the webhook validation hash!",
            },
          ]}>
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save
          </Button>
        </Form.Item>
      </Form>
      </Col>
      </Row>
    </div>
  );
};

export default SettingForm;
