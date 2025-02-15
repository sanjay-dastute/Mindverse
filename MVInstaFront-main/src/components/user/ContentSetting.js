import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Form, Button, message, Radio, Typography, Space, Input, Spin, Row, Col } from "antd";
import {
  getContextSetting,
  updateContextSetting,
} from "../../services/userService";
import { createNotification } from "../../services/conversationService";
import '../../reducers/dashboardReducer';

const { Title } = Typography;

const ContentSettingForm = ({ refreshNotifications }) => {
  const [form] = Form.useForm();
  const [prompts, setPrompts] = useState([]);
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const [loading, setLoading] = useState(false);

  const { screenSize } = useSelector(({ dashboardReducer }) => dashboardReducer);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const data = await getContextSetting();
      setPrompts(data);
      const activePrompt = data.find(p => p.isActive);
      if (activePrompt) {
        setSelectedPromptId(activePrompt.promptId);
        form.setFieldsValue({ contentOption: activePrompt.promptId });
      }
    } catch (error) {
      console.error("Error fetching prompts:", error);
      message.error("Failed to fetch prompts");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async () => {
    if (!selectedPromptId) {
      message.error("Please select a prompt");
      return;
    }

    setLoading(true);
    try {
      const selectedPrompt = prompts.find(p => p.promptId === selectedPromptId);
      await updateContextSetting(selectedPromptId, {
        prompt: selectedPrompt.prompt,
        isActive: true  // Set the selected prompt as active
      });

      const notificationMessage = `Context Setting Updated to: ${selectedPrompt.prompt}`;
      await createNotification(notificationMessage);

      message.success("Context Setting Updated successfully");
      await fetchPrompts(); // Reload prompts after update
    } catch (error) {
      console.error("Error updating prompt:", error);
      message.error("Failed to update prompt");
    } finally {
      setLoading(false);
    }
  };

  const handleRadioChange = (e) => {
    setSelectedPromptId(e.target.value);
  };

  const handlePromptChange = (promptId, value) => {
    setPrompts(prevPrompts =>
      prevPrompts.map(p =>
        p.promptId === promptId ? { ...p, prompt: value } : p
      )
    );
  };

  return (
    <Spin spinning={loading}>
      <div>
        <Title level={screenSize < 576 ? 3 : 2} style={{ textAlign: "center", marginBottom: "20px" }}>
          Context Setting Form
        </Title>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="contentOption">
            <Radio.Group onChange={handleRadioChange} value={selectedPromptId}>
              <Space direction="vertical">
                {prompts.map(prompt => (
                  <Radio key={prompt.promptId} value={prompt.promptId}>
                      <Input.TextArea
                        value={prompt.prompt}
                        placeholder="Enter your custom prompt here"
                      autoSize={{ minRows: 3 }}
                      style={{ width: '450px' }}
                        onChange={(e) => handlePromptChange(prompt.promptId, e.target.value)}
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
              <Button htmlType="button" onClick={fetchPrompts}>
                Refresh
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Spin>
  );
};

export default ContentSettingForm;



// {/* <Form.Item name="contentOption">
//             <Radio.Group onChange={handleRadioChange} value={selectedPromptId}>
//               <Row gutter={[16, 16]}> {/* Add Row with spacing between columns */}
//                 {prompts.map(prompt => (
//                   <Col span={12} key={prompt.promptId}> {/* Each Col takes half the row (12/24) */}
//                     <Radio value={prompt.promptId}>
//                       <Input.TextArea
//                         value={prompt.prompt}
//                         placeholder="Enter your custom prompt here"
//                         autoSize={false}  // Disable auto size
//                         style={{
//                           width: '520px', //mobile screen **************************
//                           height: '120px',  // Set fixed height
//                           overflow: 'hidden',  // Hide overflow content
//                           textOverflow: 'ellipsis',  // Add ellipsis for long text
//                           whiteSpace: 'nowrap',  // Prevent text wrapping
//                           fontSize: '9px',  // Set the font size (adjust as needed)
//                           lineHeight: '1.5',
//                         }}
//                         onChange={(e) => handlePromptChange(prompt.promptId, e.target.value)}
//                       />
//                     </Radio>
//                   </Col>
//                 ))}
//               </Row>
//             </Radio.Group>
//           </Form.Item> */}