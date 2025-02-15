import React, { useState } from 'react';
import { Modal, Dropdown, Menu, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const ChatPopUp = ({ visible, onClose, data, handleFeeling }) => {
  //   const chatContainerRef = useRef(null);

  //   useEffect(() => {
  //     scrollToBottom();
  //   }, [visible]);

  //   const scrollToBottom = () => {
  //     if (chatContainerRef.current) {
  //       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  //     }
  //   };

  const [selectedItem, setSelectedItem] = useState('Feeling');
  const [showOkButton, setShowOkButton] = useState(false);

  // Handle menu item selection
  const handleMenuClick = (e) => {
    const itemText = e.domEvent.target.innerText;
    setSelectedItem(itemText);
    setShowOkButton(true);
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">Payment</Menu.Item>
      <Menu.Item key="2">Shipped</Menu.Item>
      <Menu.Item key="3">Delivered</Menu.Item>
    </Menu>
  );

  const handleClose = () => {
    setSelectedItem('Feeling');
    setShowOkButton(false);
    onClose();
  };

  const handleOk = async () => {
    handleFeeling(selectedItem, data._id, data.user)
    // const options = {
    //   feeling: selectedItem,
    //   id: data._id
    // }
    // const resp = await updateUserFeeling(options);
  }

  return (
    <Modal
      open={visible}
      title={<div style={{ marginBottom: '12px' }}>Chat</div>}
      onCancel={handleClose}
      destroyOnClose
      style={{ maxHeight: '80vh' }}
      footer={null} // No need for footer buttons
    >
      <div
        style={{
          maxHeight: '50vh',
          minHeight: '50vh',
          overflowY: 'auto',
          marginBottom: '24px'
        }}
      >
        {data && data?.chat?.map((item, index) => (
          <React.Fragment key={index}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  backgroundColor: '#e6f7ff', 
                  padding: '10px',
                  borderRadius: '5px',
                  maxWidth: '70%',
                  textAlign: 'right',
                }}
              >
                <b>Query:</b> {item.query}
              </div>
            </div>

            {/* AI Response from "other side" */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  backgroundColor: '#f0f0f0',
                  padding: '10px',
                  borderRadius: '5px',
                  maxWidth: '70%',
                  textAlign: 'left',
                }}
              >
                <b>AI:</b> {item.resp}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '8px' }}>
        <Dropdown overlay={menu} trigger={['click']} >
          <Button>{selectedItem} <DownOutlined /></Button>
        </Dropdown>
        
        {showOkButton && <Button onClick={() => handleOk()} type="primary">OK</Button>}
      </div>
    </Modal>
  );

};

export default ChatPopUp;
