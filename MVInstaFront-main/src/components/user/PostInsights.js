import { Modal, Row, Col, Typography, Divider, Button, Popover, Spin } from 'antd';
import { EllipsisOutlined } from "@ant-design/icons";
import React, { memo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
// import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getPostInsights } from '../../services/userService';
import productImage from '../../assets/1*Tas8ZBOVE-CNP0i2BvFOxg.webp'
import { getProductName } from '../../services/productService';
import '../../reducers/dashboardReducer';

const { Title, Text } = Typography;

const PostInsights = memo(({ visible, onClose, postId, productId }) => {

    const [insightsData, setInsightsData] = useState([]);
    const [productInfo, setProductInfo] = useState('');
    const [loading, setLoading] = useState(true);

    const { screenSize } = useSelector(({ dashboardReducer }) => dashboardReducer);

    // Sample graph data; replace this with actual data fetched from your API
    // const graphData = [
    //     { name: 'Week 1', likes: insightsData.likes, comments: insightsData.comments, views: insightsData.views },
    //     { name: 'Week 2', likes: insightsData.likes + 10, comments: insightsData.comments + 5, views: insightsData.views + 100 },
    //     { name: 'Week 3', likes: insightsData.likes + 20, comments: insightsData.comments + 10, views: insightsData.views + 200 },
    //     { name: 'Week 4', likes: insightsData.likes + 30, comments: insightsData.comments + 15, views: insightsData.views + 300 },
    // ];

    useEffect(() => {
        fetchInsights();
    }, [])

    const fetchInsights = async () => {
        setLoading(true); // Start loading
        try {
            const response = await getPostInsights(postId);
            setInsightsData(response);

            const productDetails = await getProductName(productId);
            setProductInfo(productDetails);
        } catch (error) {
            console.error("Error fetching insights:", error);
        } finally {
            setLoading(false); // End loading
        }
    };

    const content = (
        <div>
            <p>
                <Text strong>Price:</Text> {productInfo?.price}
            </p>
            <p>
                <Text strong>Description:</Text> {productInfo?.productDescription}
            </p>
            <p>
                <Text strong>Buying Link:</Text> {productInfo?.buyingLink}
            </p>
        </div>

    );

    return (
        <Modal
            title="Post Insights"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
            height={'80vh'}
        >
            <div style={{ minHeight: '60vh' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <>
                        <Row gutter={16} style={{ marginBottom: 24 }}>
                            <Col span={8} style={{ textAlign: 'center' }}>
                                <div style={{
                                    border: '2px solid #1890ff',
                                    borderRadius: '50%',
                                    width: '60px',
                                    height: '60px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                    fontSize: '18px',
                                    color: '#1890ff',
                                }}>
                                    <Title level={4} style={{ margin: 0, color: 'black' }}>{insightsData?.like_count}</Title>
                                </div>
                                <Text type="secondary">Likes</Text>
                            </Col>
                            <Col span={8} style={{ textAlign: 'center' }}>
                                <div style={{
                                    border: '2px solid #52c41a',
                                    borderRadius: '50%',
                                    width: '60px',
                                    height: '60px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                    fontSize: '18px',
                                    color: '#52c41a',
                                }}>
                                    <Title level={4} style={{ margin: 0, color: 'black' }}>{"56"}</Title>
                                </div>
                                <Text type="secondary">Messages</Text>
                            </Col>
                            <Col span={8} style={{ textAlign: 'center' }}>
                                <div style={{
                                    border: '2px solid #fa541c',
                                    borderRadius: '50%',
                                    width: '60px',
                                    height: '60px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                    fontSize: '18px',
                                    color: '#fa541c',
                                }}>
                                    <Title level={4} style={{ margin: 0, color: 'black' }}>{insightsData?.comments_count}</Title>
                                </div>
                                <Text type="secondary">Comments</Text>
                            </Col>
                        </Row>



                        <Divider />
                        <Title style={{ color: 'black' }} level={5}>Tagged Product</Title>

                        <Row gutter={16}>
                            <Col span={5}>
                                <img
                                    src={productInfo?.imageUrl ? productInfo.imageUrl : productImage}
                                    style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '8px' }}
                                    alt="Product"
                                />
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: screenSize < 576 ? 'flex-end' : 'space-between', marginTop: '8px' }}>
                                    {screenSize >= 576 && <Text>{productInfo?.productName}</Text>}
                                    <Popover
                                        content={
                                            <div style={{ width: '250px' }}>
                                                {content}
                                            </div>
                                        }
                                        title={<Title level={4} style={{ color: 'black' }}>{screenSize < 576 ? productInfo?.productName : ''}</Title>} trigger="click" placement='right'>
                                        <Button shape="circle" icon={<EllipsisOutlined />} />
                                    </Popover>
                                </div>
                            </Col>
                        </Row>
                    </>
                )}



                {/* Second Row: Graphs */}
                {/* <Title level={5}>Engagement Trends</Title>
            <LineChart
                width={700}
                height={300}
                data={graphData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" />
                <Line type="monotone" dataKey="likes" stroke="#8884d8" />
                <Line type="monotone" dataKey="comments" stroke="#82ca9d" />
                <Line type="monotone" dataKey="views" stroke="#ffc658" />
            </LineChart> */}
            </div>
        </Modal>
    );
});

export default PostInsights;
