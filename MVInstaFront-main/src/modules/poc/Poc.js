import React, { useState } from 'react';
import { Modal, Input, Button, message } from 'antd';
import CharArea from '../../components/poc/ChatArea';

const Poc = () => {
    const [open, setOpen] = useState(true);
    const [showCodeModal, setShowCodeModal] = useState(true);
    const [code, setCode] = useState('');
    const [isCodeVerified, setIsCodeVerified] = useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const handleCodeChange = (e) => {
        setCode(e.target.value);
    };

    const handleVerifyCode = () => {
        if (code === process.env.REACT_APP_POC_CODE) {
            setIsCodeVerified(true);
            setShowCodeModal(false);
        } else {
            message.error('Invalid code! Please try again.');
        }
    };

    return (
        <div>
            <Modal
                title="Enter Code"
                open={showCodeModal}
                onCancel={() => setShowCodeModal(false)}
                footer={[
                    <Button key="cancel" onClick={() => setShowCodeModal(false)}>
                        Cancel
                    </Button>,
                    <Button key="ok" type="primary" onClick={handleVerifyCode}>
                        OK
                    </Button>,
                ]}
            >
                <Input
                    type="text"
                    placeholder="Enter code"
                    value={code}
                    onChange={handleCodeChange}
                />
            </Modal>

            {isCodeVerified && (
                <CharArea
                    visible={open}
                    onClose={handleClose}
                    isResolved={false}
                />
            )}
        </div>
    );
};

export default Poc;
