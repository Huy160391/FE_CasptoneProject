import { Row, Col, Card, Statistic, Table, Progress } from 'antd';
import {
    ShopOutlined,
    ShoppingCartOutlined,
    DollarOutlined,
    StarOutlined
} from '@ant-design/icons';
import './Dashboard.scss';

const Dashboard = () => {

    // Mock data for statistics
    const stats = [
        {
            title: 'Tổng sản phẩm',
            value: 45,
            icon: <ShopOutlined />,
            color: '#1677ff',
        },
        {
            title: 'Đơn hàng mới',
            value: 12,
            icon: <ShoppingCartOutlined />,
            color: '#52c41a',
        },
        {
            title: 'Doanh thu tháng',
            value: 8500000,
            prefix: '₫',
            icon: <DollarOutlined />,
            color: '#faad14',
        },
        {
            title: 'Đánh giá trung bình',
            value: 4.5,
            suffix: '/5',
            icon: <StarOutlined />,
            color: '#f5222d',
        },
    ];

    // Mock data for recent orders
    const recentOrders = [
        {
            key: '1',
            id: 'ORD-001',
            customer: 'Nguyễn Văn A',
            product: 'Bánh tráng Tây Ninh',
            date: '2025-06-28',
            amount: '250,000 ₫',
            status: 'Hoàn thành',
        },
        {
            key: '2',
            id: 'ORD-002',
            customer: 'Trần Thị B',
            product: 'Nước mắm Phú Quốc',
            date: '2025-06-27',
            amount: '180,000 ₫',
            status: 'Đang xử lý',
        },
        {
            key: '3',
            id: 'ORD-003',
            customer: 'Lê Văn C',
            product: 'Kẹo dừa Bến Tre',
            date: '2025-06-26',
            amount: '320,000 ₫',
            status: 'Đã giao',
        },
        {
            key: '4',
            id: 'ORD-004',
            customer: 'Phạm Thị D',
            product: 'Chà bông Hà Nội',
            date: '2025-06-25',
            amount: '150,000 ₫',
            status: 'Đã hủy',
        },
        {
            key: '5',
            id: 'ORD-005',
            customer: 'Hoàng Văn E',
            product: 'Bánh phồng tôm',
            date: '2025-06-24',
            amount: '280,000 ₫',
            status: 'Hoàn thành',
        },
    ];

    const orderColumns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customer',
            key: 'customer',
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'product',
            key: 'product',
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = '';
                if (status === 'Hoàn thành' || status === 'Đã giao') color = 'success';
                else if (status === 'Đang xử lý') color = 'processing';
                else if (status === 'Đã hủy') color = 'error';

                return <span className={`status-tag ${color}`}>{status}</span>;
            },
        },
    ];

    // Mock data for top products
    const topProducts = [
        {
            name: 'Bánh tráng Tây Ninh',
            sold: 45,
            percent: 85,
        },
        {
            name: 'Nước mắm Phú Quốc',
            sold: 38,
            percent: 72,
        },
        {
            name: 'Kẹo dừa Bến Tre',
            sold: 29,
            percent: 55,
        },
        {
            name: 'Chà bông Hà Nội',
            sold: 24,
            percent: 45,
        },
        {
            name: 'Bánh phồng tôm',
            sold: 18,
            percent: 34,
        },
    ];

    return (
        <div className="specialityshop-dashboard-page">
            <h1 className="page-title">Dashboard</h1>

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
                            dataSource={recentOrders}
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
                                    <span className="product-sold">{product.sold} đã bán</span>
                                </div>
                                <Progress percent={product.percent} size="small" />
                            </div>
                        ))}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
