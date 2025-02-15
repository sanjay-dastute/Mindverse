// src/components/mvadmin/UniversalContext.js

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Form, Button, message, Radio, Typography, Space, Input, Spin } from "antd";
import { getAllUniversalContexts, updateUniversalContext } from "../../services/universalContextService";
import "../../reducers/dashboardReducer";

const { Title } = Typography;

const UniversalContext = ({ refreshNotifications }) => {
  const [form] = Form.useForm();
  const [contexts, setContexts] = useState([]);
  const [selectedContextId, setSelectedContextId] = useState(null);
  const [loading, setLoading] = useState(false);

  const { screenSize } = useSelector(({dashboardReducer}) => dashboardReducer);

  useEffect(() => {
    fetchContexts();
  }, []);

  const fetchContexts = async () => {
    setLoading(true);
    try {
      const data = await getAllUniversalContexts();
      setContexts(data);
      const activeContext = data.find(context => context.isActive);
      if (activeContext) {
        setSelectedContextId(activeContext.contextId);
        form.setFieldsValue({ contentOption: activeContext.contextId });
      }
    } catch (error) {
      console.error("Error fetching universal contexts:", error);
      message.error("Failed to fetch universal contexts");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async () => {
    if (!selectedContextId) {
      message.error("Please select a context");
      return;
    }

    setLoading(true);
    try {
      const selectedContext = contexts.find(context => context.contextId === selectedContextId);
      await updateUniversalContext(selectedContextId, {
        isActive: true,
        prompt: selectedContext.prompt
      });
      message.success("Universal Context updated successfully");
      await fetchContexts();
    } catch (error) {
      console.error("Error updating universal context:", error);
      message.error("Failed to update universal context");
    } finally {
      setLoading(false);
    }
  };

  const handleRadioChange = (e) => {
    setSelectedContextId(e.target.value);
  };

  const handlePromptChange = (contextId, value) => {
    setContexts(prevContexts =>
      prevContexts.map(context =>
        context.contextId === contextId ? { ...context, prompt: value } : context
      )
    );
  };

  return (
    <Spin spinning={loading}>
      <div>
        <Title level={screenSize < 576 ? 3 : 2} style={{ textAlign: "center", marginBottom: "20px" }}>
          Universal Context Setting
        </Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="contentOption">
            <Radio.Group onChange={handleRadioChange} value={selectedContextId}>
              <Space direction="vertical">
                {contexts.map(context => (
                  <Radio key={context.contextId} value={context.contextId}>
                    <Input.TextArea
                      value={context.prompt}
                      placeholder="Enter your custom universal prompt here"
                      autoSize={{ minRows: 3 }}
                      style={{ width: screenSize < 576 ? "350px" : "450px" }}
                      onChange={(e) => handlePromptChange(context.contextId, e.target.value)}
                    />
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
              <Button htmlType="button" onClick={fetchContexts}>
                Refresh
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Spin>
  );
};

export default UniversalContext;