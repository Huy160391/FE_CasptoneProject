import { Row, Col, Card, Statistic, Table, Progress } from 'antd'
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import './Dashboard.scss'

const Dashboard = () => {
  // Mock data for statistics
  const stats = [
    {
      title: 'Tổng người dùng',
      value: 1254,
      icon: <UserOutlined />,
      color: '#1677ff',
    },
    {
      title: 'Tổng sản phẩm',
      value: 86,
      icon: <ShoppingOutlined />,
      color: '#52c41a',
    },
    {
      title: 'Tổng đơn hàng',
      value: 324,
      icon: <FileTextOutlined />,
      color: '#faad14',
    },
    {
      title: 'Doanh thu',
      value: 125600000,
      prefix: '₫',
      icon: <DollarOutlined />,
      color: '#f5222d',
    },
  ]

  // Mock data for recent orders
  const recentOrders = [
    {
      key: '1',
      id: 'ORD-001',
      customer: 'Nguyễn Văn A',
      date: '2023-05-15',
      amount: '1,200,000 ₫',
      status: 'Hoàn thành',
    },
    {
      key: '2',
      id: 'ORD-002',
      customer: 'Trần Thị B',
      date: '2023-05-14',
      amount: '850,000 ₫',
      status: 'Đang xử lý',
    },
    {
      key: '3',
      id: 'ORD-003',
      customer: 'Lê Văn C',
      date: '2023-05-14',
      amount: '2,350,000 ₫',
      status: 'Hoàn thành',
    },
    {
      key: '4',
      id: 'ORD-004',
      customer: 'Phạm Thị D',
      date: '2023-05-13',
      amount: '750,000 ₫',
      status: 'Đã hủy',
    },
    {
      key: '5',
      id: 'ORD-005',
      customer: 'Hoàng Văn E',
      date: '2023-05-12',
      amount: '1,500,000 ₫',
      status: 'Hoàn thành',
    },
  ]

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
        let color = ''
        if (status === 'Hoàn thành') color = 'success'
        else if (status === 'Đang xử lý') color = 'processing'
        else if (status === 'Đã hủy') color = 'error'

        return <span className={`status-tag ${color}`}>{status}</span>
      },
    },
  ]

  // Mock data for top products
  const topProducts = [
    {
      name: 'Nón lá Tây Ninh',
      sold: 45,
      percent: 85,
    },
    {
      name: 'Áo thun Núi Bà Đen',
      sold: 38,
      percent: 72,
    },
    {
      name: 'Tranh Tòa Thánh Cao Đài',
      sold: 29,
      percent: 55,
    },
    {
      name: 'Túi xách thổ cẩm',
      sold: 24,
      percent: 45,
    },
    {
      name: 'Trà Tây Ninh',
      sold: 18,
      percent: 34,
    },
  ]

  return (
    <div className="dashboard-page">
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
                formatter={value =>
                  typeof value === 'number' && !stat.prefix
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
  )
}

export default Dashboard
