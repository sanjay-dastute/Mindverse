import React, { useState, useEffect, memo } from "react";
import { Button, Table, Typography } from "antd";
import { AppstoreOutlined, TagOutlined } from "@ant-design/icons";
import { conversationList, subscriptionOrderCreation, verifySubscriptionOrder, updateUserFeeling } from "../../services/conversationService";
import '../../reducers/dashboardReducer';
import { useSelector } from "react-redux";
// import Highlighter from 'react-highlight-words';
import useTableColumnSearch from "../../utils/useTableColumnSearch";
import ListView from "../../components/common/ListView";
import ChatPopUp from "../../components/conversation/ChatPopUp";
import TabsCard from "../../components/common/TabsCard";
import { loadRazorpayScript } from "../../utils/loadScripts";
import PaymentModal from "../../components/conversation/PaymentPopUp";

const { Title, Link } = Typography;

const ConversationTable = memo(() => {
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [isChatModalVisible, setIsChatModalVisible] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [payModal, setPayModal] = useState(false);
  const [keyTab, setKeyTab] = useState('1');

  const { screenSize } = useSelector(({ dashboardReducer }) => dashboardReducer);
  const { getColumnSearchProps } = useTableColumnSearch();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const conversationData = await conversationList();

      // Use a Map to track existing chats for quick lookup
      const existingChats = new Map();
      const flattenedData = [];

      for (const conversation of conversationData) {
        const { userId, messages } = conversation;

        for (const message of messages) {
          flattenedData.push({
            ...message,
            user: userId,
            date: message?.repliedTimestamp ? new Date(message.repliedTimestamp) : new Date(message.createdTimestamp),
            userFeeling: message?.userFeeling,
            createdTimestamp: new Date(message.createdTimestamp)
          });
        }
      }
      const unsortData = [...flattenedData];
      flattenedData.sort((a, b) => b.createdTimestamp - a.createdTimestamp);

      const newData = [];
      for (let i = 0; i < unsortData.length; i++) {
        const item = unsortData[i];

        if (existingChats.has(item._id)) continue;

        const chat = [{
          query: item.originalQuery,
          resp: item.ai,
          id: item._id,
          type: item.type
        }];

        let count = i + 1;
        while (count < unsortData.length && unsortData[count].type === 'DM' && unsortData[count].user === item.user) {
          const nextItem = unsortData[count];
          chat.push({
            query: nextItem.originalQuery,
            resp: nextItem.ai,
            id: nextItem._id,
            type: nextItem.type
          });
          existingChats.set(nextItem._id, true);
          count++;
        }

        newData.push({ ...item, chat });
        existingChats.set(item._id, true);
      }

      setData(flattenedData);
      setData2(newData);

    } catch (error) {
      console.error("Error fetching conversation data:", error);
    }
  };

  const handleUserClick = (record) => {
    setSelectedConversation(record);
    setIsChatModalVisible(true);
  };

  const handleModalClose = () => {
    setIsChatModalVisible(false);
    setSelectedConversation(null);
  };

  // const showModal = (messages, userName) => {
  //   setModalContent(messages);
  //   setIsModalVisible(true);
  //   setInstaName(userName);
  // };

  // const handleOk = () => {
  //   setIsModalVisible(false);
  // };

  // const handleCancel = () => {
  //   setIsModalVisible(false);
  // };

  const columnsGrouped = [
    {
      title: "User Name",
      dataIndex: "user",
      key: "user",
      render: (user, record) => (
        <Link
          onClick={() => handleUserClick(record)}
          style={{ color: '#1890ff', cursor: 'pointer' }}
        >
          {user}
        </Link>
      ),
    },
    {
      title: "Feeling",
      dataIndex: "feeling",
      key: "feeling",
      ...getColumnSearchProps('feeling'),
    },
    {
      title: "User Feeling",
      dataIndex: "userFeeling",
      key: "userFeeling",
      ...getColumnSearchProps('userFeeling'),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        });
      }
    },
  ];

  const columns = [
    {
      title: "User Name",
      dataIndex: "user",
      key: "user",
      ...getColumnSearchProps('user'),
    },
    // {
    //   title: "Type",
    //   dataIndex: "type",
    //   key: "type",
    //   render: (type) => (
    //     <Tag key={type} style={{ marginRight: '8px', padding: '2px 8px' }}>
    //       {type}
    //     </Tag>
    //   ),
    // },
    {
      title: "Feeling",
      dataIndex: "feeling",
      key: "feeling",
      ...getColumnSearchProps('feeling'),
    },
    {
      title: "Query",
      dataIndex: "originalQuery",
      key: "originalQuery",
      width: '30%',
      ...getColumnSearchProps('originalQuery'),
    },
    {
      title: "Response",
      dataIndex: "ai",
      key: "ai",
      width: '30%',
      ...getColumnSearchProps('ai'),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: '20%',
      render: (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        });
      }
    },
  ];

  const tabLabelIcons = [
    {
      id: '1',
      name: "Detailed",
      icon: <TagOutlined />,
      component: <Table columns={columns} dataSource={data} rowKey="_id" />
    },
    {
      id: '2',
      name: "Grouped",
      icon: <AppstoreOutlined />,
      component: <Table columns={columnsGrouped} dataSource={data2} rowKey="_id" />
    },
  ];

  const handleTabKey = (key) => {
    setKeyTab(key);
  }

  const handleSubscription = async (values) => {
    try {
      await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');

      const plans = [
        { key: "free", plan_id: "0" },
        { key: "startup", plan_id: "plan_PWa9DV79msx4wp" },
        { key: "pro", plan_id: "plan_PWaA0YYfdH9xkG" },
      ];

      const selectedPlan = plans.find(plan => plan.key === values.plan);

      const subscriptionOptions = {
        plan_id: selectedPlan.plan_id,
        total_count: 12,
        quantity: 1,
        customer_notify: 1,
        notes: {
          name: values.name,
          mobile: values.mobile,
        },
      };

      const subscription = await subscriptionOrderCreation(subscriptionOptions);

      if (!subscription || !subscription.order || !subscription.order.id) {
        throw new Error('Order creation failed. Please try again.');
      }

      const opt = {
        key: process.env.REACT_APP_KEY_ID,
        subscription_id: subscription.order.id,
        name: 'Mindverse',
        description: 'Test Subscription',
        handler: async function (response) {
          try {
            const options = {
              paymentId: response.razorpay_payment_id,
              subscriptionId: response.razorpay_subscription_id,
              signature: response.razorpay_signature,
            };

            const verify = await verifySubscriptionOrder(options);

            if (verify && verify.success === true) {
              console.log("Subscription Payment verified");
            } else {
              throw new Error('Subscription Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Error verifying subscription payment:', error);
            alert('An error occurred during subscription payment verification. Please try again.');
          }
        },
        prefill: {
          name: values.name,
          email: 'sample@gmail.com',
          contact: values.mobile,
        },
        notes: {
          address: 'Test Corporate Office',
        },
      };

      const rzp1 = new window.Razorpay(opt);
      rzp1.on('payment.failed', function (response) {
        console.error('Payment failed:', response);
        alert(`Payment failed: ${response.error.reason}`);
      });
      rzp1.open();
      setPayModal(false);
    } catch (error) {
      console.error('Error in handlePayment:', error);
      alert('An error occurred while processing your payment. Please try again.');
    }
  }

  const handleFeeling = (feeling, id, user) => {
    const updatedData = data2.map(item => {
      if (item._id === id) {
        const ids = item.chat.map(chatItem => chatItem.id);
        userFeelingUpdate(ids, user, feeling);
        return {
          ...item,
          userFeeling: feeling,
          // chat: item.chat.map(chatItem => ({
          //   ...chatItem,
          //   userFeeling: feeling,
          // })),
        };
      }
      return item;
    });
    setData2(updatedData);
    handleModalClose();
  }

  const userFeelingUpdate = async (ids, user, feeling) => {
    try {
      if (ids.length === 0) {
        console.warn("No chat IDs found to update.");
        return;
      }

      const response = await updateUserFeeling(ids, user, feeling);
      console.log("User feelings updated successfully:", response);
    } catch (error) {
      console.error("Error updating user feelings:", error.message || error);
    }
  };

  // const handlePayment = async (values) => {
  //   try {
  //     await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');

  //     const options = {
  //       amount: values.amount,
  //       currency: 'INR',
  //       receipt: 'rct1',
  //       name: values.name,
  //       mobile: values.mobile,
  //     };

  //     const order = await paymentOrderCreation(options);

  //     if (!order || !order.order || !order.order.id) {
  //       throw new Error('Order creation failed. Please try again.');
  //     }

  //     const opt = {
  //       key: process.env.KEY_ID,
  //       amount: order.order.amount,
  //       currency: order.order.currency,
  //       name: 'Mindverse',
  //       description: 'Test Transactions',
  //       order_id: order.order.id,
  //       handler: async function (response) {
  //         try {
  //           const options = {
  //             paymentId: response.razorpay_payment_id,
  //             orderId: response.razorpay_order_id,
  //             signature: response.razorpay_signature,
  //           };

  //           const verify = await verifyPaymentOrder(options);

  //           if (verify && verify.success === true) {
  //             console.log("Payment verified");
  //           } else {
  //             throw new Error('Payment verification failed. Please contact support.');
  //           }
  //         } catch (error) {
  //           console.error('Error verifying payment:', error);
  //           alert('An error occurred during payment verification. Please try again.');
  //         }
  //       },
  //       prefill: {
  //         name: values.name,
  //         email: 'sample@gmail.com',
  //         contact: values.mobile,
  //       },
  //       notes: {
  //         address: 'Test Corporate Office',
  //       },
  //     };

  //     const rzp1 = new window.Razorpay(opt);
  //     rzp1.on('payment.failed', function (response) {
  //       console.error('Payment failed:', response);
  //       alert(`Payment failed: ${response.error.reason}`);
  //     });
  //     rzp1.open();
  //     setPayModal(false);
  //   } catch (error) {
  //     console.error('Error in handlePayment:', error);
  //     alert('An error occurred while processing your payment. Please try again.');
  //   }
  // };

  return (
    <div>
      {screenSize < 576 ? <ListView
        dataSource={data}
        title={"User Id"}
        description={"Feeling"}
        extraButtonDesc={"Know More"}
        fromPage={"conversation"}
        searchArea={true}
        mainTitle={"Conversations"}
      /> : <>
        <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
          Conversations
        </Title>
        <TabsCard
          activeKey={keyTab}
          handleTabKey={handleTabKey}
          tabLabelIcons={tabLabelIcons}
          tabBarExtraContent={{
            right: (
              <div style={{
                // width: '120px',
                // textAlign: 'right'
                // display: "flex",
                // justifyContent: "space-between",
                // marginLeft:  '-10%'
              }}>
                <Button type="primary" onClick={() => setPayModal(true)}>
                  Pay
                </Button>
              </div>
            )
          }}
        />
      </>}

      {selectedConversation && (
        <ChatPopUp
          visible={isChatModalVisible}
          onClose={handleModalClose}
          data={selectedConversation}
          handleFeeling={handleFeeling}
        />
      )}
      {payModal && <PaymentModal
        isVisible={payModal}
        onClose={() => setPayModal(false)}
        onSubmit={handleSubscription}
      />
      }

    </div>
  );
});

export default ConversationTable;