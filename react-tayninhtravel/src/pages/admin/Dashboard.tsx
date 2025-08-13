import { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, DatePicker, Spin, Alert } from 'antd'
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  FileTextOutlined,
  TeamOutlined,
  ShopOutlined,
  BookOutlined,
  ArrowUpOutlined
} from '@ant-design/icons'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { adminService } from '@/services/adminService'
import { userService } from '@/services/userService'
import dayjs, { Dayjs } from 'dayjs'
import './Dashboard.scss'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [revenueByShopData, setRevenueByShopData] = useState<any[]>([])
  const [shopDataLoading, setShopDataLoading] = useState(false)

  // Fetch shop information for revenue data
  const fetchShopRevenueData = async (revenueByShop: any[]) => {
    if (!revenueByShop || revenueByShop.length === 0) {
      setRevenueByShopData([])
      return
    }

    try {
      setShopDataLoading(true)

      // Fetch shop info for each shop in parallel
      const shopRevenuePromises = revenueByShop.map(async (item) => {
        try {
          const shopInfo = await userService.getShopInfo(item.shopId)
          return {
            shopId: item.shopId,
            shopName: shopInfo.shopName || 'Unknown Shop',
            shopType: shopInfo.shopType || '',
            location: shopInfo.location || '',
            revenue: item.totalRevenue,
            totalRevenue: item.totalRevenue // Keep original field name for compatibility
          }
        } catch (error) {
          console.error(`Failed to fetch shop info for ${item.shopId}:`, error)
          return {
            shopId: item.shopId,
            shopName: `Shop ${item.shopId.slice(0, 8)}...`,
            shopType: '',
            location: '',
            revenue: item.totalRevenue,
            totalRevenue: item.totalRevenue
          }
        }
      })

      const enrichedData = await Promise.all(shopRevenuePromises)

      // Sort by revenue descending
      enrichedData.sort((a, b) => b.revenue - a.revenue)

      setRevenueByShopData(enrichedData)
    } catch (error) {
      console.error('Error fetching shop revenue data:', error)
      setRevenueByShopData([])
    } finally {
      setShopDataLoading(false)
    }
  }

  // Fetch dashboard data
  const fetchDashboardData = async (year: number, month: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getDashboardStats(year, month)
      setDashboardData(data)

      // Fetch shop information after getting dashboard data
      if (data?.revenueByShop) {
        await fetchShopRevenueData(data.revenueByShop)
      }
    } catch (err) {
      setError('Không thể tải dữ liệu dashboard')
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const year = selectedDate.year()
    const month = selectedDate.month() + 1 // dayjs month is 0-indexed
    fetchDashboardData(year, month)
  }, [selectedDate])

  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date)
    }
  }

  // Prepare data for withdraw requests doughnut chart
  const withdrawChartData = dashboardData ? [
    { name: 'Đã duyệt', value: dashboardData.withdrawRequestsApprove, color: '#52c41a' },
    { name: 'Chờ duyệt', value: dashboardData.withdrawRequestsTotal - dashboardData.withdrawRequestsApprove, color: '#faad14' }
  ] : []

  // Calculate percentage for withdraw requests
  const withdrawApprovalRate = dashboardData ?
    dashboardData.withdrawRequestsTotal > 0 ?
      Math.round((dashboardData.withdrawRequestsApprove / dashboardData.withdrawRequestsTotal) * 100) : 0
    : 0

  if (loading) {
    return (
      <div className="dashboard-page">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px' }}>Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ margin: '20px' }}
        />
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">Dashboard</h1>
        <DatePicker
          picker="month"
          value={selectedDate}
          onChange={handleDateChange}
          format="MM/YYYY"
          placeholder="Chọn tháng/năm"
        />
      </div>

      {/* Main Statistics Cards - All in one row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {/* Total Accounts */}
        <Col xs={24} sm={12} lg={5}>
          <Card className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#1677ff' }}>
              <UserOutlined />
            </div>
            <Statistic
              title="Tổng tài khoản"
              value={dashboardData?.totalAccounts || 0}
              formatter={(value) => value?.toLocaleString()}
            />
          </Card>
        </Col>

        {/* New Accounts This Month */}
        <Col xs={24} sm={12} lg={5}>
          <Card className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#52c41a' }}>
              <TeamOutlined />
            </div>
            <Statistic
              title="Tài khoản mới"
              value={dashboardData?.newAccountsThisMonth || 0}
              formatter={(value) => value?.toLocaleString()}
              prefix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>

        {/* Orders This Month */}
        <Col xs={24} sm={12} lg={5}>
          <Card className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#faad14' }}>
              <ShoppingOutlined />
            </div>
            <Statistic
              title="Đơn hàng"
              value={dashboardData?.ordersThisMonth || 0}
              formatter={(value) => value?.toLocaleString()}
            />
          </Card>
        </Col>

        {/* Bookings This Month */}
        <Col xs={24} sm={12} lg={5}>
          <Card className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#722ed1' }}>
              <FileTextOutlined />
            </div>
            <Statistic
              title="Booking"
              value={dashboardData?.bookingsThisMonth || 0}
              formatter={(value) => value?.toLocaleString()}
            />
          </Card>
        </Col>

        {/* Revenue Card - Same height as others */}
        <Col xs={24} sm={24} lg={4}>
          <Card className="revenue-card-compact">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <DollarOutlined style={{ color: 'white' }} />
            </div>
            <Statistic
              title="Tổng doanh thu"
              value={dashboardData?.totalRevenue || 0}
              formatter={(value) => `${value?.toLocaleString()} ₫`}
              valueStyle={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {/* New Entities This Month */}
        <Col xs={24} md={8}>
          <Card title="Thống kê mới tháng này" className="new-entities-card">
            <div style={{ marginBottom: '16px' }}>
              <Statistic
                title="Hướng dẫn viên mới"
                value={dashboardData?.newTourGuidesThisMonth || 0}
                prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Statistic
                title="Cửa hàng mới"
                value={dashboardData?.newShopsThisMonth || 0}
                prefix={<ShopOutlined style={{ color: '#52c41a' }} />}
              />
            </div>
            <div>
              <Statistic
                title="Bài viết mới"
                value={dashboardData?.newPostsThisMonth || 0}
                prefix={<BookOutlined style={{ color: '#faad14' }} />}
              />
            </div>
          </Card>
        </Col>

        {/* Withdraw Requests Doughnut Chart */}
        <Col xs={24} md={8}>
          <Card title="Yêu cầu rút tiền" className="withdraw-chart-card">
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={withdrawChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {withdrawChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Statistic
                title="Tỷ lệ duyệt"
                value={withdrawApprovalRate}
                suffix="%"
                valueStyle={{ color: withdrawApprovalRate > 70 ? '#52c41a' : '#faad14' }}
              />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                {dashboardData?.withdrawRequestsApprove || 0} / {dashboardData?.withdrawRequestsTotal || 0} yêu cầu
              </div>
            </div>
          </Card>
        </Col>

        {/* Revenue by Shop Chart/Table */}
        <Col xs={24} md={8}>
          <Card title="Doanh thu theo cửa hàng" className="revenue-shop-card">
            {shopDataLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin />
                <p style={{ marginTop: '16px', color: '#666' }}>Đang tải thông tin cửa hàng...</p>
              </div>
            ) : revenueByShopData.length > 0 ? (
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {revenueByShopData.slice(0, 8).map((shop, index) => (
                  <div key={shop.shopId} style={{
                    padding: '12px 0',
                    borderBottom: index < revenueByShopData.slice(0, 8).length - 1 ? '1px solid #f0f0f0' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: 'bold',
                        color: '#1677ff',
                        fontSize: '14px',
                        marginBottom: '4px'
                      }}>
                        #{index + 1} {shop.shopName.length > 25 ? shop.shopName.substring(0, 25) + '...' : shop.shopName}
                      </div>
                      {shop.shopType && (
                        <div style={{
                          color: '#666',
                          fontSize: '12px',
                          marginBottom: '2px'
                        }}>
                          {shop.shopType}
                        </div>
                      )}
                      {shop.location && (
                        <div style={{
                          color: '#999',
                          fontSize: '11px'
                        }}>
                          📍 {shop.location.length > 30 ? shop.location.substring(0, 30) + '...' : shop.location}
                        </div>
                      )}
                    </div>
                    <div style={{
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: '#52c41a',
                      fontSize: '14px'
                    }}>
                      {Number(shop.revenue).toLocaleString()} ₫
                    </div>
                  </div>
                ))}
                {revenueByShopData.length > 8 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '8px 0',
                    color: '#666',
                    fontSize: '12px',
                    fontStyle: 'italic'
                  }}>
                    +{revenueByShopData.length - 8} cửa hàng khác
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                Chưa có dữ liệu doanh thu
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
