import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, message, Upload, ConfigProvider } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { addProduct, updateProduct, deleteProduct } from "../../services/productService";
import { createNotification } from "../../services/conversationService";
import "./product.css";

const AddProductModal = ({
  visible,
  onClose,
  onAddProduct,
  initialValues,
  refreshNotifications,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [isClearEnabled, setIsClearEnabled] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      // If initialValues contains image data, set it in fileList
      if (initialValues.image) {
        setFileList([
          {
            uid: "-1",
            name: "initial_image",
            status: "done",
            url: initialValues.image,
          },
        ]);
      }
    }
  }, [initialValues, form]);

  const handleAddProduct = async (values) => {
    try {
      let imageBase64 = null;

      if (fileList.length > 0) {
        const file = fileList[0].originFileObj;
        imageBase64 = await getBase64(file);
      }

      const productData = {
        ...values,
        image: imageBase64,
      };

      if (initialValues) {
        productData.productId = initialValues.id;
        await updateProduct(productData);
      } else {
        await addProduct(productData);
      }

      // Create notification
      try {
        const notificationMessage = `Product ${initialValues ? "updated" : "added"
          } successfully!`;
        await createNotification(notificationMessage);
        refreshNotifications(); // Refresh notifications here
      } catch (notificationError) {
        console.error("Notification Error:", notificationError);
      }

      message.success(
        `Product ${initialValues ? "updated" : "added"} successfully!`
      );
      form.resetFields();
      setFileList([]);
      onClose();
    } catch (error) {
      message.error(`Failed to ${initialValues ? "update" : "add"} product`);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onClose();
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      message.success("Product deleted successfully");
      onClose();
    } catch (error) {
      message.error("Failed to delete product");
    }
  };

  const handleFormChange = (changedValues, allValues) => {
    const hasValues = Object.values(allValues).some(value => value); // Check if any field has value
    setIsClearEnabled(hasValues);
  };

  const handleClearAll = () => {
    form.resetFields();
    setIsClearEnabled(false); // Disable clear button after clearing
  };

  const handleFileChange = ({ fileList }) => setFileList(fileList);

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (

    <Modal
      title={initialValues ? "Edit Product" : "Add Product"}
      open={visible}
      onCancel={handleCancel}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Button
            key="submit"
            type="primary"
            onClick={() => form.submit()}
            style={{ width: "48%" }}  // Adjust the width as needed
          >
            {initialValues ? "Update Product" : "Add Product"}
          </Button>
          <Button
            key="delete"
            type="primary"
            onClick={() => initialValues ? handleDelete(initialValues?.id) : handleClearAll()}
            style={{ width: "48%" }}  // Adjust the width as needed
            danger
            disabled={initialValues ? false : !isClearEnabled}
          >
            {initialValues ? "Delete" : "Clear All"}
          </Button>
        </div>
      }
      // bodyStyle={{ padding: 0 }} // Reset default padding for better control
      style={{ maxHeight: '80vh' }} // Ensure modal height
    >
      {/* Scrollable content area */}
      <div style={{ maxHeight: "60vh", overflowY: "auto", padding: '16px 24px' }}>
        <div className="upload-prd-img" style={{ textAlign: "right", paddingBottom: "16px" }}>
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={handleFileChange}
            beforeUpload={() => false}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Upload (Max: 1)</Button>
          </Upload>
        </div>
        <Form
          form={form}
          onFinish={handleAddProduct}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          layout="vertical"
          onValuesChange={handleFormChange}
        >
          <Form.Item
            name="productName"
            label="Product Name"
            initialValue={initialValues ? initialValues.name : ""}
            rules={[
              { required: true, message: "Please input the product name!" },
            ]}
          >
            <Input placeholder="Product Name" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            initialValue={initialValues ? initialValues.price : ""}
            rules={[
              { required: true, message: "Please input the product price!" },
              {
                validator: (_, value) => {
                  if (value && isNaN(value)) {
                    return Promise.reject(new Error("Hmm, that doesn’t look right! Please enter numbers only in the price field"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Price" />
          </Form.Item>
          <Form.Item
            name="buyingLink"
            label="Buying Link"
            initialValue={initialValues ? initialValues.buying_link : ""}
          >
            <Input placeholder="Buying Link" />
          </Form.Item>
          <Form.Item
            name="paymentLink"
            label="Payment Link"
            initialValue={initialValues ? initialValues.payment_link : ""}
          >
            <Input placeholder="Payment Link" />
          </Form.Item>
          <Form.Item
            name="shippingPolicy"
            label="Shipping Policy"
            initialValue={initialValues ? initialValues.shipping_policy : ""}
          >
            <Input.TextArea rows={2} placeholder="Shipping Policy" />
          </Form.Item>
          <Form.Item
            name="returnPolicy"
            label="Return Policy"
            initialValue={initialValues ? initialValues.return_policy : ""}
          >
            <Input.TextArea rows={2} placeholder="Return Policy" />
          </Form.Item>
          <Form.Item
            name="productDescription"
            label="Product Description"
            initialValue={initialValues ? initialValues.description : ""}
          >
            <Input.TextArea rows={4} placeholder="Product Description" />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default AddProductModal;
