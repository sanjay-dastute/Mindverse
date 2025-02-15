// CreateRequestModal.js
import React from "react";
import { Modal, Form, Select, Input, Button, message } from "antd";
import Cookies from "js-cookie";
import { createNewRequest } from "../../services/supportService";
import { createNotification } from "../../services/conversationService";

const { Option } = Select;
const { TextArea } = Input;

const CreateRequestModal = ({ visible, onClose, refreshNotifications }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      // const organizationId = sessionStorage.getItem("organizationId");
      const organizationId = Cookies.get('organizationId');
      // const token = sessionStorage.getItem("token");
      const token = Cookies.get('token');
      await createNewRequest(values, organizationId, token);
      form.resetFields();
      message.success("Request submitted successfully");
      try {
        const notificationMessage = "Request submitted successfully";
        await createNotification(notificationMessage);
        refreshNotifications();
      } catch (notificationError) {
        console.error("Notification Error:", notificationError);
      }
      onClose(true);
    } catch (error) {
      console.error("Error creating new request:", error);
      message.error("Failed to submit the request");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose(false);
  };

  return (
    <Modal
      open={visible}
      title="Create New Request"
      onCancel={handleCancel}
      footer={null}
      destroyOnClose>
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item name="type" label="Type" rules={[{ required: true }]}>
          <Select placeholder="Select a type" id="type" name="type">
            <Option value="Profile">Profile</Option>
            <Option value="Product">Product</Option>
            <Option value="Response">Response</Option>
            <Option value="Other">Other</Option>
          </Select>
        </Form.Item>
        <Form.Item name="query" label="Query" rules={[{ required: true }]}>
          <TextArea
            rows={4}
            placeholder="Enter your query"
            id="query"
            name="query"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button style={{ marginLeft: "10px" }} onClick={handleCancel}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateRequestModal;
