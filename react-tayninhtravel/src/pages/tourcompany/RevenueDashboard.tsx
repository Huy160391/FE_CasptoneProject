import React, { useState } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    DatePicker,
    Select,
    Table,
    Progress,
    Typography,
    Tag
} from 'antd';
import {
    DollarOutlined,
    RiseOutlined,
    ShoppingOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './RevenueDashboard.scss';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface RevenueData {
    month: string;
    revenue: number;
    bookings: number;
    avgPrice: number;
}

interface TourRevenue {
    tourName: string;
    bookings: number;
    revenue: number;
    avgRating: number;
    growth: number;
}

const RevenueDashboard: React.FC = () => {
    const [timeRange, setTimeRange] = useState('6months');
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(6, 'month'),
        dayjs()
    ]);

    // Mock data - sẽ được thay thế bằng API calls thực tế
    const [revenueData] = useState<RevenueData[]>([
        { month: 'T10/2023', revenue: 8500000, bookings: 42, avgPrice: 202381 },
        { month: 'T11/2023', revenue: 9200000, bookings: 48, avgPrice: 191667 },
        { month: 'T12/2023', revenue: 11800000, bookings: 58, avgPrice: 203448 },
        { month: 'T1/2024', revenue: 13500000, bookings: 65, avgPrice: 207692 },
        { month: 'T2/2024', revenue: 15200000, bookings: 72, avgPrice: 211111 },
        { month: 'T3/2024', revenue: 14800000, bookings: 68, avgPrice: 217647 }
    ]);

    const [tourRevenueData] = useState<TourRevenue[]>([
        {
            tourName: 'Tour Núi Bà Đen 1 ngày',
            bookings: 45,
            revenue: 24750000,
            avgRating: 4.7,
            growth: 15.2
        },
        {
            tourName: 'Tour Tòa Thánh Cao Đài',
            bookings: 32,
            revenue: 11200000,
            avgRating: 4.5,
            growth: 8.3
        },
        {
            tourName: 'Tour Suối Đá',
            bookings: 28,
            revenue: 12600000,
            avgRating: 4.3,
            growth: -2.1
        },
        {
            tourName: 'Tour Hồ Dầu Tiếng',
            bookings: 21,
            revenue: 11550000,
            avgRating: 4.6,
            growth: 12.8
        },
        {
            tourName: 'Tour Vườn Quốc Gia Lò Gò',
            bookings: 18,
            revenue: 13500000,
            avgRating: 4.8,
            growth: 25.6
        }
    ]);

    const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
    const totalBookings = revenueData.reduce((sum, item) => sum + item.bookings, 0);
    const avgPrice = totalRevenue / totalBookings;
    const revenueGrowth = revenueData.length >= 2
        ? ((revenueData[revenueData.length - 1].revenue - revenueData[revenueData.length - 2].revenue) / revenueData[revenueData.length - 2].revenue) * 100
        : 0;

    const tourColumns = [
        {
            title: 'Tên tour',
            dataIndex: 'tourName',
            key: 'tourName',
        },
        {
            title: 'Booking',
            dataIndex: 'bookings',
            key: 'bookings',
            sorter: (a: TourRevenue, b: TourRevenue) => a.bookings - b.bookings,
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (revenue: number) => `${revenue.toLocaleString('vi-VN')} ₫`,
            sorter: (a: TourRevenue, b: TourRevenue) => a.revenue - b.revenue,
        },
        {
            title: 'Đánh giá TB',
            dataIndex: 'avgRating',
            key: 'avgRating',
            render: (rating: number) => (
                <span style={{ color: rating >= 4.5 ? '#52c41a' : rating >= 4.0 ? '#faad14' : '#ff4d4f' }}>
                    {rating.toFixed(1)} ⭐
                </span>
            ),
        },
        {
            title: 'Tăng trưởng',
            dataIndex: 'growth',
            key: 'growth',
            render: (growth: number) => (
                <Tag color={growth > 0 ? 'green' : growth < 0 ? 'red' : 'default'}>
                    {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                </Tag>
            ),
            sorter: (a: TourRevenue, b: TourRevenue) => a.growth - b.growth,
        },
    ];

    const handleTimeRangeChange = (value: string) => {
        setTimeRange(value);
        const now = dayjs();
        switch (value) {
            case '3months':
                setDateRange([now.subtract(3, 'month'), now]);
                break;
            case '6months':
                setDateRange([now.subtract(6, 'month'), now]);
                break;
            case '1year':
                setDateRange([now.subtract(1, 'year'), now]);
                break;
            default:
                break;
        }
    };

    const handleDateRangeChange = (dates: any) => {
        if (dates) {
            setDateRange([dates[0], dates[1]]);
            setTimeRange('custom');
        }
    };

    return (
        <div className="revenue-dashboard">
            <div className="page-header">
                <Title level={2}>Dashboard Doanh thu</Title>
                <div className="header-actions">
                    <Select
                        value={timeRange}
                        onChange={handleTimeRangeChange}
                        style={{ width: 150 }}
                    >
                        <Option value="3months">3 tháng</Option>
                        <Option value="6months">6 tháng</Option>
                        <Option value="1year">1 năm</Option>
                        <Option value="custom">Tùy chọn</Option>
                    </Select>
                    {timeRange === 'custom' && (
                        <RangePicker
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            format="DD/MM/YYYY"
                        />
                    )}
                </div>
            </div>

            <Row gutter={[16, 16]} className="stats-cards">
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu"
                            value={totalRevenue}
                            prefix={<DollarOutlined />}
                            suffix="₫"
                            formatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M`}
                        />                        <div className="growth-indicator">
                            <RiseOutlined style={{ color: revenueGrowth > 0 ? '#52c41a' : '#ff4d4f' }} />
                            <span style={{ color: revenueGrowth > 0 ? '#52c41a' : '#ff4d4f' }}>
                                {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                            </span>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng booking"
                            value={totalBookings}
                            prefix={<ShoppingOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Giá tour trung bình"
                            value={avgPrice}
                            prefix={<DollarOutlined />}
                            suffix="₫"
                            formatter={(value) => `${Math.round(Number(value)).toLocaleString('vi-VN')}`}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Doanh thu tháng này"
                            value={revenueData[revenueData.length - 1]?.revenue || 0}
                            prefix={<CalendarOutlined />}
                            suffix="₫"
                            formatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M`}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={14}>
                    <Card title="Xu hướng doanh thu" className="revenue-chart">
                        <div className="chart-placeholder">
                            {revenueData.map((item, index) => (
                                <div key={index} className="revenue-bar">
                                    <span className="month-label">{item.month}</span>
                                    <div className="bar-container">
                                        <Progress
                                            percent={(item.revenue / 16000000) * 100}
                                            format={() => `${(item.revenue / 1000000).toFixed(1)}M ₫`}
                                            strokeColor="#1890ff"
                                        />
                                        <span className="booking-count">{item.bookings} booking</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={10}>
                    <Card title="Phân tích doanh thu theo tháng" className="monthly-analysis">
                        <div className="analysis-item">
                            <h4>Tháng có doanh thu cao nhất</h4>
                            <p>
                                {revenueData.reduce((max, item) => item.revenue > max.revenue ? item : max, revenueData[0])?.month}
                                <span className="amount">
                                    {(revenueData.reduce((max, item) => item.revenue > max.revenue ? item : max, revenueData[0])?.revenue / 1000000).toFixed(1)}M ₫
                                </span>
                            </p>
                        </div>
                        <div className="analysis-item">
                            <h4>Tháng có số booking cao nhất</h4>
                            <p>
                                {revenueData.reduce((max, item) => item.bookings > max.bookings ? item : max, revenueData[0])?.month}
                                <span className="count">
                                    {revenueData.reduce((max, item) => item.bookings > max.bookings ? item : max, revenueData[0])?.bookings} booking
                                </span>
                            </p>
                        </div>
                        <div className="analysis-item">
                            <h4>Giá tour trung bình cao nhất</h4>
                            <p>
                                {revenueData.reduce((max, item) => item.avgPrice > max.avgPrice ? item : max, revenueData[0])?.month}
                                <span className="price">
                                    {Math.round(revenueData.reduce((max, item) => item.avgPrice > max.avgPrice ? item : max, revenueData[0])?.avgPrice).toLocaleString('vi-VN')} ₫
                                </span>
                            </p>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card title="Doanh thu theo tour" className="tour-revenue">
                        <Table
                            dataSource={tourRevenueData}
                            columns={tourColumns}
                            rowKey="tourName"
                            pagination={false}
                            size="middle"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default RevenueDashboard;
