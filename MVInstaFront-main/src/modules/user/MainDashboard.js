import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import { Row, Col, Typography, Card, Select, DatePicker, Button, message } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Area, AreaChart } from 'recharts';
import { getOrganizationInsights } from "../../services/userService";
import { getAllOrganizationsInsights } from "../../services/adminService";
import "../../reducers/dashboardReducer";

const { Title, Text } = Typography;
const { Option } = Select;

const MainDashboard = ({ dashboard }) => {

    // const formatCurrentDate = () => moment();
    // const formatPreviousDate = () => moment().subtract(1, 'days');

    const [data, setData] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [startError, setStartError] = useState(false);
    const [endError, setEndError] = useState(false);

    const fromMV = dashboard === "MV" ? true : false;

    const { darkMode } = useSelector(({ dashboardReducer }) => dashboardReducer);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            let data = [];
            let start = startDate ? startDate.format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
            let end = endDate ? endDate.format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
            if (fromMV) data = await getAllOrganizationsInsights(start, end);
            else data = await getOrganizationInsights(start, end);
            setData(data);
        }
        catch (error) {
            console.log(error, 'errrr')
        }
    }

    const circleStyle = (color) => ({
        border: `2px solid ${color}`,
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        fontSize: '18px',
        color: color,
    });

    const barData = [
        { name: 'Jan', value: 30 },
        { name: 'Feb', value: 45 },
        { name: 'Mar', value: 20 },
        { name: 'Apr', value: 50 },
        { name: 'May', value: 80 },
        { name: 'Jun', value: 65 },
    ];

    const pieData = [
        { name: 'Group A', value: 400 },
        { name: 'Group B', value: 300 },
        { name: 'Group C', value: 300 },
        { name: 'Group D', value: 200 },
    ];

    const composedData = [
        { name: 'Jan', barValue: 30, areaValue: 20 },
        { name: 'Feb', barValue: 45, areaValue: 25 },
        { name: 'Mar', barValue: 20, areaValue: 30 },
        { name: 'Apr', barValue: 50, areaValue: 45 },
        { name: 'May', barValue: 80, areaValue: 50 },
        { name: 'Jun', barValue: 65, areaValue: 60 },
    ];

    const areaData = [
        { month: 'Jan', value: 40 },
        { month: 'Feb', value: 60 },
        { month: 'Mar', value: 35 },
        { month: 'Apr', value: 80 },
        { month: 'May', value: 70 },
        { month: 'Jun', value: 50 },
    ];

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

    const handleTimeViewChange = () => {

    }

    const handleStartDateChange = (date) => {
        // const formattedDate = moment(date).format('YYYY-MM-DD');
        setStartDate(date);
        if (date) {
            setStartError(false);
        }
    };

    const handleEndDateChange = (date) => {
        // const formattedDate = moment(date).format('YYYY-MM-DD');
        setEndDate(date);
        if (date) {
            setEndError(false);
        }
    };

    const disabledStartDate = (current) => {
        return current && current > new Date();
    };

    const disabledEndDate = (current) => {
        if (!startDate) return current && current > new Date();
        return current && (current < startDate || current > new Date());
    };

    const validateDates = () => {
        let hasError = false;

        if (!startDate) {
            setStartError(true);
            hasError = true;
        }

        if (!endDate) {
            setEndError(true);
            hasError = true;
        }
        if (!hasError) {
            fetchDashboardData();
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* First Row */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={fromMV ? 8 : 6} style={{ textAlign: 'center' }}>
                    <div style={circleStyle('#1890ff')}>
                        <Title level={4} style={{ margin: 0, }}>{fromMV ? data.messageData?.totalUserCount : data?.postCount}</Title>
                    </div>
                    <Text type="primary">{fromMV ? "Users" : "Posts"}</Text>
                </Col>
                <Col span={fromMV ? 8 : 6} style={{ textAlign: 'center' }}>
                    <div style={circleStyle('#52c41a')}>
                        <Title level={4} style={{ margin: 0, }}>{fromMV ? data?.organizationCount : data?.messageCount}</Title>
                    </div>
                    <Text type="primary">{fromMV ? "Organizations" : "Messages"}</Text>
                </Col>
                <Col span={fromMV ? 8 : 6} style={{ textAlign: 'center' }}>
                    <div style={circleStyle('#fa541c')}>
                        <Title level={4} style={{ margin: 0, }}>{fromMV ? data?.messageData?.totalMessageCount : data?.productCount}</Title>
                    </div>
                    <Text type="primary">{fromMV ? "Messages" : "Products"}</Text>
                </Col>
                {dashboard !== "MV" && (
                    <Col span={6} style={{ textAlign: 'center' }}>
                        <div style={circleStyle('#b19cd9')}>
                            <Title level={4} style={{ margin: 0, }}>{data?.userDetails?.userCount}</Title>
                        </div>
                        <Text type="primary">Users</Text>
                    </Col>
                )}
            </Row>

            {/* Second Row - Positioned between items in the first row */}
            {fromMV && <Row gutter={16} style={{ marginBottom: 50, position: 'relative', top: '-40px' }}>
                <Col span={8} style={{ textAlign: 'center', position: 'absolute', left: '25%' }}>
                    <div style={circleStyle('#b19cd9')}>
                        <Title level={4} style={{ margin: 0, }}>{fromMV ? data?.activeUserCount : data?.postCount}</Title>
                    </div>
                    <Text type="primary">Active</Text>
                </Col>
                <Col span={8} style={{ textAlign: 'center', position: 'absolute', right: '25%' }}>
                    <div style={circleStyle('#d500f9')}>
                        <Title level={4} style={{ margin: 0, }}>{fromMV ? data?.openSupportRequests : data?.postCount}</Title>
                    </div>
                    <Text type="primary">Open tickets</Text>
                </Col>
            </Row>}

            {/* 1st row charts */}
            <div style={{ textAlign: 'right', marginBottom: '12px' }}>
                <div style={{ display: 'inline-block', textAlign: 'left' }}>
                    <DatePicker
                        value={startDate}
                        placeholder="Start Date"
                        onChange={handleStartDateChange}
                        disabledDate={disabledStartDate}
                        style={{
                            borderColor: startError ? 'red' : '',
                            marginRight: '6px',
                        }}
                    />
                    {startError && (
                        <span style={{ color: 'red', fontSize: '12px', display: 'block' }}>
                            ! Start Date is required
                        </span>
                    )}
                </div>
                <div style={{ display: 'inline-block', textAlign: 'left', marginLeft: '6px' }}>
                    <DatePicker
                        value={endDate}
                        placeholder="End Date"
                        onChange={handleEndDateChange}
                        disabledDate={disabledEndDate}
                        style={{
                            borderColor: endError ? 'red' : '',
                            marginRight: '6px',
                        }}
                    />
                    {endError && (
                        <span style={{ color: 'red', fontSize: '12px', display: 'block' }}>
                            ! End Date is required
                        </span>
                    )}
                </div>
                <Button onClick={validateDates} style={{ marginLeft: '12px' }}>
                    Filter
                </Button>
            </div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={12}>
                    <Card title={<span style={{ color: darkMode ? 'black' : '' }} >{fromMV ? "Users Overview" : "Posts Insights"}</span>} bordered={false}>
                        <div style={{ marginBottom: 16, textAlign: 'right' }}>
                            <Select defaultValue="month" style={{ width: 120 }} onChange={handleTimeViewChange}>
                                <Option value="day">Day</Option>
                                <Option value="week">Week</Option>
                                <Option value="month">Month</Option>
                                <Option value="year">Year</Option>
                            </Select>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#1890ff" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title={<span style={{ color: darkMode ? 'black' : '' }} >{fromMV ? "Organizations Overview" : "Messages Overview"}</span>} bordered={false}>
                        <div style={{ marginBottom: 16, textAlign: 'right' }}>
                            <Select defaultValue="month" style={{ width: 120 }} onChange={handleTimeViewChange}>
                                <Option value="day">Day</Option>
                                <Option value="week">Week</Option>
                                <Option value="month">Month</Option>
                                <Option value="year">Year</Option>
                            </Select>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#82ca9d"
                                    label
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>


            {/* second row charts */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={12}>
                    <Card title={<span style={{ color: darkMode ? 'black' : '' }} >{fromMV ? "Messages Overview" : "Products Insights"}</span>} bordered={false}>
                        <div style={{ marginBottom: 16, textAlign: 'right' }}>
                            <Select defaultValue="month" style={{ width: 120 }} onChange={handleTimeViewChange}>
                                <Option value="day">Day</Option>
                                <Option value="week">Week</Option>
                                <Option value="month">Month</Option>
                                <Option value="year">Year</Option>
                            </Select>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={composedData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="areaValue" fill="#82ca9d" stroke="#82ca9d" />
                                <Bar dataKey="barValue" barSize={20} fill="#8884d8" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title={<span style={{ color: darkMode ? 'black' : '' }} >{fromMV ? "Active Users Overview" : "Users Overview"}</span>} bordered={false}>
                        <div style={{ marginBottom: 16, textAlign: 'right' }}>
                            <Select defaultValue="month" style={{ width: 120 }} onChange={handleTimeViewChange}>
                                <Option value="day">Day</Option>
                                <Option value="week">Week</Option>
                                <Option value="month">Month</Option>
                                <Option value="year">Year</Option>
                            </Select>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={areaData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="value" stroke="#82ca9d" fill="#82ca9d" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default MainDashboard;