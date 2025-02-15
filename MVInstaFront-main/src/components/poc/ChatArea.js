import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, Button, message, Spin } from 'antd';
import { SendOutlined, LoadingOutlined } from '@ant-design/icons';
import { getMessageResponse } from '../../services/authService';

const CharArea = ({ visible, onClose, isResolved }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [id, setId] = useState({});
    const chatContainerRef = useRef(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() && !isResolved) {
            const userMessage = { text: newMessage, sender: 'user' };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            setNewMessage('');

            const loadingMessage = { text: '', sender: 'ai', isLoading: true };
            setMessages((prevMessages) => [...prevMessages, loadingMessage]);

            try {
                const response = await getMessageResponse(newMessage, id?.assistantId || '', id?.threadId || '');
                const formatResponse = (text) => {
                    return text
                        .replace(/### /g, "")
                        .replace(/- \*\*/g, "- ")
                        .replace(/\*\*/g, "")
                        .replace(/---/g, "")
                        .trim();
                };

                const formattedText = formatResponse(response.msg);
                if (!id?.assistantId || !id?.threadId) {
                    setId({
                        assistantId: response?.assistant_id,
                        threadId: response?.thread_id
                    })
                }
                const aiMessage = { text: formattedText, sender: 'ai', isLoading: false };

                setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    updatedMessages[updatedMessages.length - 1] = aiMessage;
                    return updatedMessages;
                });
            } catch (error) {
                console.error('Error sending message to AI assistant:', error);
                message.error('Failed to send message');

                setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    updatedMessages.pop();
                    return updatedMessages;
                });
            }
        }
    };

    const handleClose = () => {
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <Modal
            open={visible}
            title={<div style={{ marginBottom: '12px' }}>POC</div>}
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
                                onKeyDown={handleKeyDown}
                                style={{ flex: 1 }}
                            />
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleSendMessage}
                            />
                        </div>
                    </div>
                )
            }
        >
            <div
                style={{
                    maxHeight: '50vh',
                    minHeight: '50vh',
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
                            {message.isLoading ? (
                                <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
                            ) : (
                                <div
                                    style={{
                                        whiteSpace: 'pre-line',
                                    }}
                                    dangerouslySetInnerHTML={{ __html: message.text }}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    );
};

export default CharArea;
