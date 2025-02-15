import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { SendOutlined } from '@ant-design/icons'; // Import the Send icon
import { getMessages, sendMessage, resolveSupportRequest } from '../../services/supportService';

const MVAdminChatModal = ({ visible, onClose, requestId, organizationId, isResolved }) => {
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
        await sendMessage(organizationId, requestId, newMessage, 'support');
        setMessages([...messages, { text: newMessage, sender: 'support' }]);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        message.error('Failed to send message');
      }
    }
  };

  const handleResolveRequest = async () => {
    try {
      await resolveSupportRequest(organizationId, requestId);
      message.success(isResolved ? 'Request reopened successfully' : 'Request resolved successfully');
      onClose(true); // Pass true to indicate the state changed
    } catch (error) {
      console.error('Error resolving/reopening request:', error);
      message.error('Failed to resolve/reopen request');
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      open={visible}
      title={
        <div style={{ textAlign: 'center', fontSize: '24px', color: '#F4B301' }}>
          Chat
        </div>
      }
      onCancel={handleClose}
      destroyOnClose
      style={{ maxHeight: '80vh' }} // Ensure the modal height is similar to ChatModal
      // bodyStyle={{ padding: 0 }} // Adjust body padding to match
      footer={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Chat Input Area */}
          {!isResolved && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                style={{ flex: 1 }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
              />
            </div>
          )}

          {/* Resolve or Reopen Button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <Button
              type="primary"
              onClick={handleResolveRequest}
              style={{ width: '50%' }}
            >
              {isResolved ? 'Reopen' : 'Resolve'}
            </Button>
          </div>
        </div>
      }
    >
      {/* Chat Messages Container */}
      <div
        style={{
          minHeight: '50vh',
          maxHeight: '50vh',
          overflowY: 'auto',
          padding: '10px',
        }}
        ref={chatContainerRef}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: message.sender === 'support' ? 'flex-end' : 'flex-start',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                backgroundColor: message.sender === 'support' ? '#e6f7ff' : '#f0f0f0',
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

export default MVAdminChatModal;
