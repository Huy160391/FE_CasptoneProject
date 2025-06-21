import React, { useState } from 'react';
import {
    Row,
    Col,
    Card,
    Statistic,
    Progress,
    Table,
    Tag,
    Space,
    DatePicker,
    Button,
    Typography
} from 'antd';
import {
    DollarOutlined,
    ShoppingOutlined,
    UserOutlined,
    StarOutlined,
    RiseOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import './TourCompanyDashboard.scss';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface DashboardStats {
    totalRevenue: number;
    totalTours: number;
    totalBookings: number;
    averageRating: number;
    revenueGrowth: number;
    bookingGrowth: number;
}

interface RecentBooking {
    id: string;
    tourName: string;
    customerName: string;
    bookingDate: string;
    amount: number;
    status: 'confirmed' | 'pending' | 'cancelled';
}

interface RevenueData {
    month: string;
    revenue: number;
}

const TourCompanyDashboard: React.FC = () => {
    const { t } = useTranslation();
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(30, 'day'),
        dayjs()
    ]);
    const [loading, setLoading] = useState(false);

    // Mock data - sẽ được thay thế bằng API calls thực tế
    const [stats] = useState<DashboardStats>({
        totalRevenue: 125000000,
        totalTours: 24,
        totalBookings: 156,
        averageRating: 4.7,
        revenueGrowth: 15.2,
        bookingGrowth: 8.5
    });

    const [recentBookings] = useState<RecentBooking[]>([
        {
            id: 'BK001',
            tourName: 'Tour Núi Bà Đen 1 ngày',
            customerName: 'Nguyễn Văn A',
            bookingDate: '2024-03-15',
            amount: 1500000,
            status: 'confirmed'
        },
        {
            id: 'BK002',
            tourName: 'Tour Tòa Thánh Cao Đài',
            customerName: 'Trần Thị B',
            bookingDate: '2024-03-14',
            amount: 800000,
            status: 'pending'
        },
        {
            id: 'BK003',
            tourName: 'Tour Suối Đá',
            customerName: 'Lê Văn C',
            bookingDate: '2024-03-13',
            amount: 1200000,
            status: 'confirmed'
        },
        {
            id: 'BK004',
            tourName: 'Tour Hồ Dầu Tiếng',
            customerName: 'Phạm Thị D',
            bookingDate: '2024-03-12',
            amount: 900000,
            status: 'cancelled'
        }
    ]);

    const [revenueData] = useState<RevenueData[]>([
        { month: 'T1', revenue: 8500000 },
        { month: 'T2', revenue: 9200000 },
        { month: 'T3', revenue: 11800000 },
        { month: 'T4', revenue: 13500000 },
        { month: 'T5', revenue: 15200000 },
        { month: 'T6', revenue: 14800000 }
    ]); const bookingColumns = [
        {
            title: 'Mã booking',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: t('tourCompany.transactions.columns.tourName'),
            dataIndex: 'tourName',
            key: 'tourName',
        },
        {
            title: t('tourCompany.transactions.columns.customerName'),
            dataIndex: 'customerName',
            key: 'customerName',
        },
        {
            title: t('tourCompany.transactions.columns.date'),
            dataIndex: 'bookingDate',
            key: 'bookingDate',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: t('tourCompany.transactions.columns.amount'),
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => `${amount.toLocaleString('vi-VN')} ₫`
        },
        {
            title: t('tourCompany.transactions.columns.status'),
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const statusConfig = {
                    confirmed: { color: 'success', text: t('tourCompany.transactions.status.completed') },
                    pending: { color: 'warning', text: t('tourCompany.transactions.status.pending') },
                    cancelled: { color: 'error', text: t('tourCompany.transactions.status.cancelled') }
                };
                const config = statusConfig[status as keyof typeof statusConfig];
                return <Tag color={config.color}>{config.text}</Tag>;
            }
        }];

    const handleDateRangeChange = (dates: any) => {
        if (dates) {
            setDateRange([dates[0], dates[1]]);
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }; return (
        <div className="tour-company-dashboard">
            <div className="dashboard-header">
                <Title level={2}>{t('tourCompany.dashboard.title')}</Title>
                <Space>
                    <RangePicker
                        value={dateRange}
                        onChange={handleDateRangeChange}
                        format="DD/MM/YYYY"
                    />
                    <Button
                        type="primary"
                        icon={<CalendarOutlined />}
                        onClick={handleRefresh}
                        loading={loading}
                    >
                        {t('tourCompany.common.actions.search')}
                    </Button>
                </Space>
            </div>

            <Row gutter={[16, 16]} className="stats-cards">
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={t('tourCompany.dashboard.stats.totalRevenue')}
                            value={stats.totalRevenue}
                            prefix={<DollarOutlined />}
                            suffix="₫"
                            formatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M`}
                        />                        <div className="growth-indicator">
                            <RiseOutlined style={{ color: '#52c41a' }} />
                            <span style={{ color: '#52c41a' }}>+{stats.revenueGrowth}%</span>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={t('tourCompany.dashboard.stats.totalTours')}
                            value={stats.totalTours}
                            prefix={<ShoppingOutlined />}
                        />
                    </Card>
                </Col>                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={t('tourCompany.dashboard.stats.totalBookings')}
                            value={stats.totalBookings}
                            prefix={<UserOutlined />}
                        />                        <div className="growth-indicator">
                            <RiseOutlined style={{ color: '#52c41a' }} />
                            <span style={{ color: '#52c41a' }}>+{stats.bookingGrowth}%</span>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title={t('tourCompany.dashboard.stats.avgRating')}
                            value={stats.averageRating}
                            prefix={<StarOutlined />}
                            precision={1}
                        />
                        <Progress
                            percent={(stats.averageRating / 5) * 100}
                            showInfo={false}
                            strokeColor="#faad14"
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>                <Col xs={24} lg={14}>
                <Card title={t('tourCompany.dashboard.charts.revenueTitle')} className="revenue-chart">
                    <div className="revenue-chart-placeholder">
                        <p>Biểu đồ doanh thu sẽ được hiển thị ở đây</p>
                        {revenueData.map((item, index) => (
                            <div key={index} className="revenue-bar">
                                <span>{item.month}</span>
                                <Progress
                                    percent={(item.revenue / 16000000) * 100}
                                    format={() => `${(item.revenue / 1000000).toFixed(1)}M ₫`}
                                />
                            </div>
                        ))}
                    </div>
                </Card>
            </Col>
                <Col xs={24} lg={10}>
                    <Card title={t('tourCompany.dashboard.charts.popularToursTitle')} className="popular-tours">
                        <div className="tour-item">
                            <div className="tour-info">
                                <span className="tour-name">Tour Núi Bà Đen</span>
                                <span className="booking-count">45 bookings</span>
                            </div>
                            <Progress percent={85} showInfo={false} />
                        </div>
                        <div className="tour-item">
                            <div className="tour-info">
                                <span className="tour-name">Tour Tòa Thánh Cao Đài</span>
                                <span className="booking-count">32 bookings</span>
                            </div>
                            <Progress percent={62} showInfo={false} />
                        </div>
                        <div className="tour-item">
                            <div className="tour-info">
                                <span className="tour-name">Tour Suối Đá</span>
                                <span className="booking-count">28 bookings</span>
                            </div>
                            <Progress percent={51} showInfo={false} />
                        </div>
                        <div className="tour-item">
                            <div className="tour-info">
                                <span className="tour-name">Tour Hồ Dầu Tiếng</span>
                                <span className="booking-count">21 bookings</span>
                            </div>
                            <Progress percent={38} showInfo={false} />
                        </div>
                    </Card>
                </Col>
            </Row>            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col span={24}>
                    <Card title={t('tourCompany.dashboard.recentActivities.title')} className="recent-bookings">
                        <Table
                            dataSource={recentBookings}
                            columns={bookingColumns}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                            scroll={{ x: 800 }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default TourCompanyDashboard;
