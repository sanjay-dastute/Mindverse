import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import { getMessages, sendMessage, resolveSupportRequest } from '../../services/supportService';

const ChatModal = ({ visible, onClose, requestId, isResolved }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      fetchMessages();
      scrollToBottom();
    }
  }, [visible]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const fetchMessages = async () => {
    try {
      const organizationId = Cookies.get('organizationId');
      const messagesData = await getMessages(organizationId, requestId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching messages:', error);
      message.error('Failed to fetch messages');
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && !isResolved) {
      try {
        const organizationId = Cookies.get('organizationId');
        await sendMessage(organizationId, requestId, newMessage, 'user');
        setMessages([...messages, { text: newMessage, sender: 'user' }]);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        message.error('Failed to send message');
      }
    }
  };

  // const handleResolveRequest = async () => {
  //   if (!isResolved) {
  //     try {
  //       const organizationId = Cookies.get('organizationId');
  //       await resolveSupportRequest(organizationId, requestId);
  //       message.success('Request resolved successfully');
  //       onClose(true); // Pass true to indicate the request was resolved
  //     } catch (error) {
  //       console.error('Error resolving request:', error);
  //       message.error('Failed to resolve request');
  //     }
  //   }
  // };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      open={visible}
      title={<div style={{ marginBottom: '12px' }}>Chat</div>}
      onCancel={handleClose}
      destroyOnClose
      style={{ maxHeight: '80vh' }}
      footer={
        !isResolved && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                style={{ flex: 1 }} // Make input take up available space
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
              />
            </div>
            {/* <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <Button
                  type="primary"
                  onClick={handleResolveRequest}
                  style={{ width: '50%' }}
                >
                  Resolve
                </Button>
              </div> */}
          </div>
        )
      }
    >
      <div
        style={{
          maxHeight: '50vh',
          minHeight: '50vh', // Ensure consistent height
          overflowY: 'auto',
        }}
        ref={chatContainerRef}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                backgroundColor: message.sender === 'user' ? '#e6f7ff' : '#f0f0f0',
                padding: '10px',
                borderRadius: '5px',
                maxWidth: '70%',
              }}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default ChatModal;
