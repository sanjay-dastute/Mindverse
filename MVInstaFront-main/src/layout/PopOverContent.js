import React, { useState, useCallback } from 'react';
import { List, Switch } from 'antd';
import { BulbOutlined, LogoutOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router';
import { setDarkMode } from '../reducers/dashboardReducer';
import { useDispatch, useSelector } from 'react-redux';

const PopoverContent = () => {

    const dispatch = useDispatch();
    const { darkMode } = useSelector(({ dashboardReducer }) => dashboardReducer);
    const [selectedKey, setSelectedKey] = useState(null);
    const navigate = useNavigate();

    const handleClick = (key, action) => {
        setSelectedKey(key);
        // if (action) {
            // action(); // Trigger the specific action related to the item
        // }
        if (key === "2") handleLogout();
    };

    const handleChange = (checked) => {
        dispatch(setDarkMode(checked));
        // if(!checked) window.location.reload();
    }

    const dataSource = [
        { key: "1", icon: <BulbOutlined />, text: 'Dark Mode', action: <Switch checked={darkMode} onChange={handleChange} /> },
        { key: "2", icon: <LogoutOutlined />, text: 'Logout' },
    ];

    const handleLogout = useCallback(() => {
        Cookies.remove('organizationId');
        Cookies.remove('token');
        Cookies.remove('otherUserId');
    
        navigate("/");
      }, [navigate]);

                                                    // overflow: 'visible !important', zIndex: 1050
    return (
        <div style={{ width: '220px', zIndex: 1050 }}> 
            <List
                size="small"
                bordered
                dataSource={dataSource}
                renderItem={item => (
                    <List.Item
                        key={item.key}
                        onClick={() => handleClick(item.key, item.action)}
                        style={{
                            cursor: 'pointer',
                            backgroundColor: selectedKey === item.key ? '#f0f0f0' : 'transparent',
                            color: selectedKey === item.key ? '#1890ff' : 'inherit', // Change color on selection
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {item.icon}
                            <span style={{ marginLeft: 8 }}>{item.text}</span>
                        </div>
                        {item.key === "1" && item.action} {/* Only render the switch for Dark Mode */}
                    </List.Item>
                )}
            />
        </div>
    );
};

export default PopoverContent;
