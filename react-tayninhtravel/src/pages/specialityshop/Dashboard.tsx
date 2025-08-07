import { Row, Col, Card, Statistic, Table, Progress, Button, Space, Spin, message, DatePicker } from 'antd';
import {
    ShopOutlined,
    ShoppingCartOutlined,
    DollarOutlined,
    StarOutlined,
    WalletOutlined,
    BankOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
    getDashboardData,
    getRecentOrders,
    getTopSellingProducts,
    type DashboardData,
    type ShopOrder
} from '@/services/specialtyShopService';
import dayjs from 'dayjs';
import './Dashboard.scss';

const Dashboard = () => {
    const navigate = useNavigate();
    const { token } = useAuthStore();

    // State management
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [recentOrders, setRecentOrders] = useState<ShopOrder[]>([]);
    const [topProducts, setTopProducts] = useState<Array<{
        id: string;
        name: string;
        soldQuantity: number;
        revenue: number;
        imageUrl?: string;
    }>>([]);

    // Date state for filtering
    const [selectedDate, setSelectedDate] = useState(dayjs());

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Get year and month from selected date
                const year = selectedDate.year();
                const month = selectedDate.month() + 1; // dayjs month is 0-based, so add 1

                // Fetch all data in parallel
                const [dashboard, orders, products] = await Promise.all([
                    getDashboardData(year, month, token || undefined),
                    getRecentOrders(5, token || undefined),
                    getTopSellingProducts(5, token || undefined)
                ]);

                setDashboardData(dashboard);
                setRecentOrders(orders);
                setTopProducts(products);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                message.error('Không thể tải dữ liệu dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token, selectedDate]); // Add selectedDate to dependency array

    // Type for statistics item
    type StatItem = {
        title: string;
        value: number;
        icon: React.ReactNode;
        color: string;
        prefix?: string;
        suffix?: string;
    };

    // Dynamic stats based on API data
    const getStats = (): StatItem[] => {
        if (!dashboardData) return [];

        return [
            {
                title: 'Tổng sản phẩm',
                value: dashboardData.totalProducts,
                icon: <ShopOutlined />,
                color: '#1677ff',
            },
            {
                title: 'Tổng đơn hàng',
                value: dashboardData.totalOrders,
                icon: <ShoppingCartOutlined />,
                color: '#52c41a',
            },
            {
                title: 'Tổng doanh thu',
                value: dashboardData.totalRevenue,
                prefix: '₫',
                icon: <DollarOutlined />,
                color: '#faad14',
            },
            {
                title: 'Số dư ví',
                value: dashboardData.wallet,
                prefix: '₫',
                icon: <WalletOutlined />,
                color: '#722ed1',
            },
        ];
    };

    // Additional stats for second row
    const getAdditionalStats = (): StatItem[] => {
        if (!dashboardData) return [];

        return [
            {
                title: 'Đánh giá shop',
                value: dashboardData.shopAverageRating,
                suffix: '/5',
                icon: <StarOutlined />,
                color: '#f5222d',
            },
        ];
    };

    // Table columns for orders
    const orderColumns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customerName',
            key: 'customerName',
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Số tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount: number) => `${amount.toLocaleString()} ₫`,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = '';
                if (status === 'Completed' || status === 'Delivered') color = 'success';
                else if (status === 'Processing' || status === 'Pending') color = 'processing';
                else if (status === 'Cancelled') color = 'error';

                return <span className={`status-tag ${color}`}>{status}</span>;
            },
        },
    ];

    if (loading) {
        return (
            <div className="specialityshop-dashboard-page">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    const stats = getStats();
    const additionalStats = getAdditionalStats();

    return (
        <div className="specialityshop-dashboard-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 className="page-title">Dashboard</h1>
                <DatePicker
                    picker="month"
                    value={selectedDate}
                    onChange={(date) => setSelectedDate(date || dayjs())}
                    format="MM/YYYY"
                    placeholder="Chọn tháng/năm"
                    allowClear={false}
                />
            </div>

            <Row gutter={[16, 16]}>
                {stats.map((stat, index) => (
                    <Col xs={24} sm={12} md={6} key={index}>
                        <Card className="stat-card">
                            <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                                {stat.icon}
                            </div>
                            <Statistic
                                title={stat.title}
                                value={stat.value}
                                prefix={stat.prefix}
                                suffix={stat.suffix}
                                formatter={value =>
                                    typeof value === 'number' && !stat.prefix && !stat.suffix
                                        ? value.toLocaleString()
                                        : value
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]} className="dashboard-row">
                <Col xs={24} lg={16}>
                    <Card title="Đơn hàng gần đây" className="recent-orders-card">
                        <Table
                            dataSource={recentOrders.map((order, index) => ({ ...order, key: order.id || index }))}
                            columns={orderColumns}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Sản phẩm bán chạy" className="top-products-card">
                        {topProducts.map((product, index) => (
                            <div className="product-item" key={index}>
                                <div className="product-info">
                                    <span className="product-name">{product.name}</span>
                                    <span className="product-sold">{product.soldQuantity} đã bán</span>
                                </div>
                                <Progress
                                    percent={Math.min(100, (product.soldQuantity / Math.max(...topProducts.map(p => p.soldQuantity))) * 100)}
                                    size="small"
                                />
                            </div>
                        ))}
                    </Card>
                </Col>
            </Row>

            {/* Additional Stats Row */}
            <Row gutter={[16, 16]} className="dashboard-row">
                {additionalStats.map((stat, index) => (
                    <Col xs={24} sm={12} md={6} key={index}>
                        <Card className="stat-card">
                            <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                                {stat.icon}
                            </div>
                            <Statistic
                                title={stat.title}
                                value={stat.value}
                                prefix={stat.prefix}
                                suffix={stat.suffix}
                                formatter={value =>
                                    typeof value === 'number' && !stat.prefix && !stat.suffix
                                        ? value.toLocaleString()
                                        : value
                                }
                            />
                        </Card>
                    </Col>
                ))}

                {/* Quick Actions Card */}
                <Col xs={24} sm={12} md={18}>
                    <Card title="Thao tác nhanh" className="quick-actions-card">
                        <Space direction="horizontal" size="middle" wrap>
                            <Button
                                type="primary"
                                icon={<WalletOutlined />}
                                onClick={() => navigate('/speciality-shop/wallet')}
                            >
                                Quản lý ví
                            </Button>
                            <Button
                                type="default"
                                icon={<BankOutlined />}
                                onClick={() => navigate('/speciality-shop/wallet')}
                            >
                                Rút tiền
                            </Button>
                            <Button
                                type="default"
                                icon={<ShopOutlined />}
                                onClick={() => navigate('/speciality-shop/products')}
                            >
                                Thêm sản phẩm
                            </Button>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
