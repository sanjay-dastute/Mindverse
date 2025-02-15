import React, { memo, useCallback, useMemo, useState } from 'react';
import { List, Avatar, Button, Collapse, Typography, Input } from 'antd';
import { EllipsisOutlined, UpCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { useSelector } from 'react-redux';
import './listView.css';
import '../../reducers/dashboardReducer';

const ListView = memo(({ dataSource, title, description, extraButtonDesc, fromPage, handleEdit, mainTitle, searchArea }) => {

    const { Title, Text, Link } = Typography;
    const [searchValue, setSearchValue] = useState('');

    const { darkMode } = useSelector(({ dashboardReducer }) => dashboardReducer);

    const ListProp = ({ title, name, extraButton, item }) => {

        const [key, setKey] = useState('');

        const items = useMemo(() => [
            {
                key: 1,
                label: (
                    <div className='listView-moreBtn'>
                        <Button
                            type="primary"
                            size="medium"
                            icon={key?.length > 0 ? <UpCircleOutlined /> : <EllipsisOutlined />}
                            style={{ padding: 0 }}
                        />
                    </div>
                ),
                children: fromPage === 'product' ? (
                    <div>
                        {Object.entries(item).map(([key, value]) => {
                            if (key !== "name" && key !== "price" && key !== "imageUrl" && key !== "id") {
                                return (
                                    <div key={key} >
                                        <Title
                                            level={5}
                                            className='listView-itemTitle'
                                        >
                                            {key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').toUpperCase()}
                                        </Title>
                                        <Text>
                                            {key.includes('link') ? (
                                                value
                                            ) : key.includes('imageUrl') ? (
                                                <img src={value} alt="product" style={{ maxWidth: '100px' }} />
                                            ) : key.includes('Date') ? (
                                                new Date(value).toLocaleDateString()
                                            ) : (
                                                value
                                            )}
                                        </Text>
                                    </div>
                                );
                            }
                            return null; // Ensure to return null for excluded keys
                        })}
                    </div>
                ) : fromPage === 'conversation' ? (
                    <div>
                        {Object.entries(item).map(([key, value]) => {
                            if (key !== "user" && key !== "feeling" && (key === "originalQuery" || key === "date" || key === "ai")) {
                                return (
                                    <div key={key}> {/* Adds spacing between key-value pairs */}
                                        <Title
                                            level={5}
                                            className='listView-itemTitle'
                                        >
                                            {key.replace(/_/g, ' ').toUpperCase()}
                                        </Title>
                                        <Text>
                                            {key.includes('link') ? (
                                                <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
                                            ) : key.includes('imageUrl') ? (
                                                <img src={value} alt="conversation" style={{ maxWidth: '100px' }} />
                                            ) : key.includes('date') ? (
                                                new Date(value).toLocaleDateString()
                                            ) : (
                                                value
                                            )}
                                        </Text>
                                    </div>
                                );
                            }
                            return null; // Ensure to return null for excluded keys
                        })}
                    </div>
                ) : (fromPage === "support" ? (
                    <div>
                        {Object.entries(item).map(([key, value]) => {
                            if (key !== "id" && key !== "status" && (key === "type" || key === "query" || key === "createdAt")) {
                                return (
                                    <div key={key}> {/* Adds spacing between key-value pairs */}
                                        <Title
                                            level={5}
                                            className='listView-itemTitle'
                                        >
                                            {key === "createdAt" ? "CREATED DATE" : key.replace(/_/g, ' ').toUpperCase()}
                                        </Title>
                                        <Text>
                                            {key.includes('link') ? (
                                                <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
                                            ) : key.includes('imageUrl') ? (
                                                <img src={value} alt="support" style={{ maxWidth: '100px' }} />
                                            ) : key.includes('createdAt') ? (
                                                new Date(value).toLocaleDateString()
                                            ) : (
                                                value
                                            )}
                                        </Text>
                                    </div>
                                );
                            }
                            return null; // Ensure to return null for excluded keys
                        })}
                    </div>
                ) : fromPage === "mvadminSupport" ? (
                    <div>
                        {Object.entries(item).map(([key, value]) => {
                            if (key !== "instagramUserName" && key !== "type" && (key === "query" || key === "createdAt" || key === "status")) {
                                return (
                                    <div key={key}> {/* Adds spacing between key-value pairs */}
                                        <Title
                                            level={5}
                                            className='listView-itemTitle'
                                        >
                                            {key === "createdAt" ? "CREATED DATE" : key.replace(/_/g, ' ').toUpperCase()}
                                        </Title>
                                        <Text>
                                            {key.includes('link') ? (
                                                <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
                                            ) : key.includes('imageUrl') ? (
                                                <img src={value} alt="mvadminSupport" style={{ maxWidth: '100px' }} />
                                            ) : key.includes('createdAt') ? (
                                                new Date(value).toLocaleDateString()
                                            ) : (
                                                value
                                            )}
                                        </Text>
                                    </div>
                                );
                            }
                            return null; // Ensure to return null for excluded keys
                        })}
                    </div>
                ) : (
                    <div>
                        {Object.entries(item).map(([key, value]) => {
                            if (key !== "instagramUserName" && key !== "contactPerson" && (key === "contactPhoneNumber" || key === "prompt")) {
                                return (
                                    <div key={key}>
                                        <Title
                                            level={5}
                                            className='listView-itemTitle'
                                        >
                                            {key.replace(/_/g, ' ').toUpperCase()}
                                        </Title>
                                        <Text>
                                            {key.includes('link') ? (
                                                <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
                                            ) : key.includes('imageUrl') ? (
                                                <img src={value} alt="listUsers" style={{ maxWidth: '100px' }} />
                                            ) : key.includes('Date') ? (
                                                value
                                            ) : (
                                                value
                                            )}
                                        </Text>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                ))
            }
        ]);

        const handleCollapse = (key) => {
            setKey(key);
        }

        return (
            <div style={{ textAlign: 'left' }}>
                {/* Title Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Title
                        level={5}
                        style={{
                            color: darkMode ? "white" : 'black',
                            margin: '3px 0px'
                        }}
                    >
                        {title}
                    </Title>
                </div>

                {/* Name Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {handleEdit && title === "Product Name" ? (
                        <Link onClick={() => handleEdit(item)} >
                            {name}
                        </Link>
                    ) : title === "Request Id" ? (
                        <Link onClick={() => handleEdit(item.requestId)} >
                            {name}
                        </Link>
                    ) : title === 'User Id' ? (
                        fromPage === "userList" ? (
                            <Link onClick={() => handleEdit(item.organizationId)} >
                                {name}
                            </Link>
                        ) : fromPage === 'mvadminSupport' ? (
                            <Link onClick={() => handleEdit(item.requestId, item.organizationId)} >
                                {name}
                            </Link>
                        ) : (
                            <Text >
                                {name}
                            </Text>
                        )
                    ) : (
                        <Text >
                            {name}
                        </Text>
                    )}
                </div>

                {/* Collapse Section */}
                <div>
                    {extraButton ? (
                        <Collapse ghost items={items} expandIcon={() => null} onChange={handleCollapse} />
                    ) : null}
                </div>
            </div>
        );

    };

    const handleSearchValue = useCallback((event) => {
        setSearchValue(event.target.value);
    }, []);

    const filteredData = useMemo(() => {
        return dataSource.filter(item => {
            const name = fromPage === "product" ? item.name : fromPage === "support" ? item.id : fromPage === "conversation" ? item.user : fromPage === "mvadminSupport" ? item.instagramUserName : item.instagramUserName;
            return name && name.toLowerCase().includes(searchValue.toLowerCase());
        });
    }, [searchValue, dataSource, fromPage]);

    return (
        <>
            {mainTitle ? <Title level={3} className='listView-mainTitle'>
                {mainTitle}
            </Title> : ''}
            {searchArea ? <Input className='listView-mainSearch' size='middle' value={searchValue} onChange={handleSearchValue} placeholder='Search...' prefix={<SearchOutlined />} /> : ''}
            <List
                itemLayout="horizontal"
                dataSource={filteredData}
                renderItem={item => (
                    <List.Item
                    // actions={actions}
                    >
                        <List.Item.Meta
                            avatar={
                                <div className='listView-avatarDiv'>
                                    <Avatar size={60} src={item?.imageUrl ? item.imageUrl : item.profilePictureUrl ? item.profilePictureUrl : fromPage === 'product' ? "https://ninja-application.s3.ap-southeast-2.amazonaws.com/1723153121006.png" : ''} style={{ border: '2px solid white' }} />
                                </div>
                            }
                            title={<ListProp title={title} name={fromPage === "product" ? item.name : fromPage === "support" ? item.id : fromPage === "conversation" ? item.user : fromPage === "mvadminSupport" ? item.instagramUserName : item.instagramUserName} item={item} />}
                            description={<ListProp title={description} name={fromPage === "product" ? item.price : fromPage === "support" ? item.status : fromPage === "conversation" ? item.feeling : fromPage === "mvadminSupport" ? item.type : item.contactPerson} item={item} extraButton={extraButtonDesc} />}
                        />
                    </List.Item>
                )}
                bordered
            />
        </>
    )
});

export default ListView;