import React, { useState } from "react";
import { Modal, Form, Input, Button, Card } from "antd";

const PaymentModal = ({
    isVisible,
    onClose,
    onSubmit,
    plans = [
        { key: "free", title: "Free", price: "$0/month", description: "Basic features for individuals.", bgColor: "#f0f8ff" },
        { key: "startup", title: "Startup", price: "$10/month", description: "Essential tools for small teams.", bgColor: "#fff7e6" },
        { key: "pro", title: "Pro", price: "$30/month", description: "Advanced features for growing businesses.", bgColor: "#f0fff0" },
    ],
}) => {
    const [form] = Form.useForm();
    const [selectedPlan, setSelectedPlan] = useState(null);

    const handleFormSubmit = (values) => {
        if (!selectedPlan) {
            return alert("Please select a subscription plan.");
        }
        onSubmit({ ...values, plan: selectedPlan });
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title="Enter Payment Details"
            open={isVisible}
            onCancel={() => {
                onClose();
                form.resetFields();
                setSelectedPlan(null);
            }}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFormSubmit}
                initialValues={{
                    // amount: "",
                    name: "",
                    mobile: "",
                }}
            >
                {/* <Form.Item
                    label="Amount"
                    name="amount"
                    rules={[
                        { required: true, message: "Please enter the amount" },
                        { pattern: /^\d+$/, message: "Amount must be a valid number" },
                    ]}
                >
                    <Input placeholder="Enter amount" />
                </Form.Item> */}

                <Form.Item
                    label="Name"
                    name="name"
                    rules={[
                        { required: true, message: "Please enter your name" },
                        { max: 50, message: "Name cannot exceed 50 characters" },
                    ]}
                >
                    <Input placeholder="Enter your name" />
                </Form.Item>

                <Form.Item
                    label="Mobile"
                    name="mobile"
                    rules={[
                        { required: true, message: "Please enter your mobile number" },
                        {
                            pattern: /^[6-9]\d{9}$/,
                            message: "Enter a valid 10-digit mobile number",
                        },
                    ]}
                >
                    <Input placeholder="Enter your mobile number" />
                </Form.Item>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "8px",
                        marginBottom: "16px",
                    }}
                >
                    {plans.map((plan) => (
                        <Card
                            key={plan.key}
                            title={plan.title}
                            bordered={false}
                            hoverable
                            style={{
                                width: "33%",
                                textAlign: "center",
                                cursor: "pointer",
                                backgroundColor: plan.bgColor,
                                boxShadow: selectedPlan === plan.key ? "0 4px 8px rgba(0, 0, 0, 0.2)" : "0 2px 4px rgba(0, 0, 0, 0.1)",
                                border: selectedPlan === plan.key ? "2px solid #1890ff" : "1px solid #f0f0f0",
                                borderRadius: "8px",
                                transition: "transform 0.2s, box-shadow 0.2s",
                                transform: selectedPlan === plan.key ? "scale(1.05)" : "scale(1)",
                            }}
                            onClick={() => setSelectedPlan(plan.key)}
                        >
                            <div>
                                <strong style={{ fontSize: "16px", color: "#333" }}>{plan.price}</strong>
                                <p style={{ margin: "8px 0", color: "#666" }}>{plan.description}</p>
                            </div>
                        </Card>
                    ))}
                </div>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PaymentModal;
