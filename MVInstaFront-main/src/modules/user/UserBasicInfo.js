import React, { useState } from 'react';
import { Modal, Form, Input, Button, Progress, Row, Col, Dropdown, Menu } from 'antd';
import { LeftOutlined, RightOutlined, DownOutlined } from '@ant-design/icons';

const StepFormModal = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [skipStatus, setSkipStatus] = useState(false);
  const [form] = Form.useForm();

  const formFields = [
    { label: 'Contact Person', name: 'contactPerson', required: true },
    { label: 'Contact Phone Number', name: 'contactPhoneNumber', required: true },
    { label: 'Organization Name', name: 'organizationName', required: true },
    { label: 'Special Instructions', name: 'specialInstructions', required: false },
    { label: 'Shipping Policy', name: 'shippingPolicy', required: false },
    { label: 'Return Policy', name: 'returnPolicy', required: false },
    { label: 'Payment Type', name: 'paymentType', required: false },
  ];

  const calculateProgress = () => {
    const progress1 = completedSteps >= 3 ? 100 : (completedSteps / 3) * 100;
    const progress2 = completedSteps >= 5 ? 100 : completedSteps > 3 ? ((completedSteps - 3) / 2) * 100 : 0;
    const progress3 = completedSteps >= 7 ? 100 : completedSteps > 5 ? ((completedSteps - 5) / 2) * 100 : 0;

    return [progress1, progress2, progress3];
  };

  const next = () => {
    form.validateFields([formFields[currentStep].name])
      .then(() => {
        setCurrentStep((prevStep) => prevStep + 1);
        setCompletedSteps((prev) => (prev < currentStep + 1 ? prev + 1 : prev));
      })
      .catch((error) => {
        console.error('Validation Failed:', error);
      });
  };

  const prev = () => {
    setCurrentStep((prevStep) => {
      const newStep = prevStep - 1;
      setCompletedSteps((prevCompletedSteps) => (newStep < prevCompletedSteps ? newStep : prevCompletedSteps));
      return newStep;
    });
  };

  const handleOk = () => {
    form.validateFields().then(() => {
      console.log('Form Submitted:', form.getFieldsValue());
      setVisible(false);
    }).catch((errorInfo) => {
      console.error('Failed:', errorInfo);
    });
  };

  const handleSkip = ({ key }) => {
    if (key === 'skip') {
      setSkipStatus(true);
      setCurrentStep((prevStep) => prevStep + 1);
      setCompletedSteps((prev) => (prev < currentStep + 1 ? prev + 1 : prev));
    } else if (key === 'skipAll') {
      Modal.confirm({
        title: 'Confirm Skip All',
        content: <div>
          <p>You can complete skipped fields in RT</p>
          <p>Are you sure to skip all?</p>
        </div>,
        onOk: () => {
          setCurrentStep(formFields.length - 1);
          setCompletedSteps(formFields.length);
          setVisible(false);
        },
      });
    }
  };

  const progressValues = calculateProgress();

  const skipMenu = (
    <Menu onClick={handleSkip}>
      <Menu.Item key="skip">Skip</Menu.Item>
      <Menu.Item key="skipAll">Skip All</Menu.Item>
    </Menu>
  );

  const handleCancel = () => {
    form.resetFields();
    setCompletedSteps(0);
    setCurrentStep(0);
    setSkipStatus(false);
    setVisible(false);
  }

  return (
    <>
      {/* <Button type="primary" onClick={() => setVisible(true)}>
        Open Form Modal
      </Button> */}
      <Modal
        title={
          <>
            User Info Details
            {completedSteps >= 3 && (
              <Dropdown overlay={skipMenu} trigger={['click']}>
                <Button type="link" style={{ float: 'right' }}>
                  Skip <DownOutlined />
                </Button>
              </Dropdown>
            )}

            <Row gutter={16} style={{ margin: '20px 0px' }}>
              <Col span={8}>
                <Progress percent={progressValues[0]} showInfo={false} status={progressValues[0] === 100 ? 'success' : (skipStatus ? 'exception' : 'normal')} />
              </Col>
              <Col span={8}>
                <Progress percent={progressValues[1]} showInfo={false}
                  status={progressValues[1] === 100 ? (skipStatus ? 'exception' : 'success') : (skipStatus ? 'exception' : 'normal')}
                />
              </Col>
              <Col span={8}>
                <Progress percent={progressValues[2]} showInfo={false} status={progressValues[2] === 100 ? (skipStatus ? 'exception' : 'success') : (skipStatus ? 'exception' : 'normal')} />
              </Col>
            </Row>
          </>
        }
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        bodyStyle={{
          height: '50vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
        }}
        closable={false}
      >
        <Form
          layout="vertical"
          form={form}
          name="stepForm"
          style={{ width: '100%', textAlign: 'center' }}
        >
          <Form.Item
            label={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>{formFields[currentStep].label}</span>}
            name={formFields[currentStep].name}
            rules={[{ required: formFields[currentStep].required, message: `Please input ${formFields[currentStep].label}!` }]}
            style={{ width: '100%' }}
          >
            {formFields[currentStep].name === 'specialInstructions' ? <Input.TextArea /> : <Input />}
          </Form.Item>
        </Form>

        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {currentStep > 0 && (
            <Button type="text" icon={<LeftOutlined />} onClick={prev} />
          )}
          {currentStep < formFields.length - 1 ? (
            <Button type="text" icon={<RightOutlined />} onClick={next} style={{ marginLeft: 'auto' }} />
          ) : (
            !skipStatus && (
              <Button type="primary" onClick={handleOk}>
                Submit
              </Button>
            )
          )}
        </div>
      </Modal>
    </>
  );
};

export default StepFormModal;










