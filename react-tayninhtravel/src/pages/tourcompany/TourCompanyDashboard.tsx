import React, { useState, useEffect } from "react";
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
  Typography,
  Spin,
} from "antd";
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  StarOutlined,
  RiseOutlined,
  CalendarOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getDashboardStatistics, getRecentBookings } from "@/services/tourcompanyService";
import { useAuthStore } from "@/store/useAuthStore";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { TourCompanyDashboardStatistics } from "@/types/dashboard";
import "./TourCompanyDashboard.scss";

const { Title } = Typography;
const { RangePicker } = DatePicker;

// Interfaces removed - using types from dashboard.ts

// Helper function to format currency
const formatCurrency = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B ₫`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M ₫`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K ₫`;
  }
  return `${value.toLocaleString('vi-VN')} ₫`;
};

const TourCompanyDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const { handleError } = useErrorHandler();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] =
    useState<TourCompanyDashboardStatistics | null>(null);
  const [overallData, setOverallData] =
    useState<TourCompanyDashboardStatistics | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(
    undefined
  );

  // Helper function to get booking status text
  const getBookingStatusText = (status: string): string => {
    switch (status) {
      case 'Pending':
        return 'Chờ thanh toán';
      case 'Confirmed':
        return 'Đã xác nhận';
      case 'CancelledByCustomer':
        return 'Khách hủy';
      case 'CancelledByCompany':
        return 'Công ty hủy';
      case 'Completed':
        return 'Hoàn thành';
      case 'NoShow':
        return 'Không đến';
      case 'Refunded':
        return 'Đã hoàn tiền';
      default:
        return status || 'Không xác định';
    }
  };

  // Helper function to get booking status color
  const getBookingStatusColor = (status: string): string => {
    switch (status) {
      case 'Pending':
        return 'orange';
      case 'Confirmed':
        return 'green';
      case 'CancelledByCustomer':
      case 'CancelledByCompany':
        return 'red';
      case 'Completed':
        return 'blue';
      case 'NoShow':
        return 'gray';
      case 'Refunded':
        return 'purple';
      default:
        return 'default';
    }
  };

  // Columns for recent bookings table
  const bookingColumns = [
    {
      title: "Mã booking",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (id: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          {id}
        </span>
      ),
    },
    {
      title: "Tên tour",
      dataIndex: "tourName",
      key: "tourName",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Ngày đặt",
      dataIndex: "bookingDate",
      key: "bookingDate",
      width: 100,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày tour",
      dataIndex: "tourDate",
      key: "tourDate",
      width: 100,
      render: (date: string) => date ? dayjs(date).format("DD/MM/YYYY") : "N/A",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount: number) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {formatCurrency(amount || 0)}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={getBookingStatusColor(status)}>
          {getBookingStatusText(status)}
        </Tag>
      ),
    },
  ];

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      // Fetch monthly data for current selection
      const currentDate = dayjs();
      const year = selectedYear || currentDate.year();
      const month = selectedMonth || currentDate.month() + 1; // dayjs month is 0-based

      console.log("Fetching dashboard data with params:", { year, month }); // Debug log

      // Fetch monthly data
      const monthlyResponse = await getDashboardStatistics(
        {
          year: year,
          month: month,
          compareWithPrevious: true,
        },
        token
      );

      if (monthlyResponse.success && monthlyResponse.data) {
        setDashboardData(monthlyResponse.data);
        console.log("Monthly dashboard data loaded successfully:", monthlyResponse.data); // Debug log
      }

      // Fetch overall data (without month parameter to get all-time data)
      const overallResponse = await getDashboardStatistics(
        {
          year: undefined, // No year filter for overall stats
          month: undefined, // No month filter for overall stats
          compareWithPrevious: false,
        },
        token
      );

      if (overallResponse.success && overallResponse.data) {
        setOverallData(overallResponse.data);
        console.log("Overall dashboard data loaded successfully:", overallResponse.data); // Debug log
      }

      if (!monthlyResponse.success || !overallResponse.success) {
        handleError(new Error("API response failed"), "Không thể tải đầy đủ dữ liệu dashboard");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      handleError(error, "Có lỗi xảy ra khi tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent bookings
  const fetchRecentBookings = async () => {
    if (!token) return;

    try {
      const response = await getRecentBookings(10, token);
      if (response.success && response.data) {
        setRecentBookings(response.data);
        console.log("Recent bookings loaded:", response.data); // Debug log
      }
    } catch (error) {
      console.error("Error fetching recent bookings:", error);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchDashboardData();
    fetchRecentBookings();
  }, [selectedYear, selectedMonth, token]);

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setDateRange([dates[0], dates[1]]);
      setSelectedYear(dates[0].year());
      setSelectedMonth(dates[0].month() + 1); // dayjs month is 0-based
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
    fetchRecentBookings();
  };
  // Show loading spinner while fetching data
  if (loading && !dashboardData) {
    return (
      <div className="tour-company-dashboard">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tour-company-dashboard">
      <div className="dashboard-header">
        <Title level={2}>{t("tourCompany.dashboard.title")}</Title>
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
            loading={loading}>
            {t("tourCompany.common.actions.search")}
          </Button>
          {/* Hidden analytics button for now */}
          {false && (
            <Button
              type="default"
              icon={<BarChartOutlined />}
              onClick={() => navigate("/tour-company/analytics")}>
              Phân tích chi tiết
            </Button>
          )}
        </Space>
      </div>
      {/* Main Revenue Cards */}
      <Row gutter={[24, 24]} className="main-revenue-cards">
        <Col xs={24} sm={12} md={8}>
          <Card className="revenue-card revenue-before-tax">
            <div className="card-header">
              <div className="card-icon">
                <DollarOutlined />
              </div>
              <div className="card-info">
                <div className="card-title">Doanh thu trước thuế</div>
                <div className="card-subtitle">Sau trừ phí nền tảng</div>
              </div>
            </div>
            <div className="card-value">
              {formatCurrency(dashboardData?.revenueMetrics?.totalRevenueBeforeTax || 0)}
            </div>
            {dashboardData?.revenueMetrics?.revenueBeforeTaxGrowth !== undefined && (
              <div className="growth-indicator">
                <RiseOutlined
                  style={{
                    color: dashboardData.revenueMetrics.revenueBeforeTaxGrowth >= 0 ? "#52c41a" : "#ff4d4f"
                  }}
                />
                <span style={{
                  color: dashboardData.revenueMetrics.revenueBeforeTaxGrowth >= 0 ? "#52c41a" : "#ff4d4f"
                }}>
                  {dashboardData.revenueMetrics.revenueBeforeTaxGrowth >= 0 ? '+' : ''}
                  {dashboardData.revenueMetrics.revenueBeforeTaxGrowth.toFixed(1)}%
                </span>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="revenue-card revenue-after-tax">
            <div className="card-header">
              <div className="card-icon">
                <DollarOutlined />
              </div>
              <div className="card-info">
                <div className="card-title">Doanh thu sau thuế</div>
                <div className="card-subtitle">Sau trừ VAT & phí nền tảng</div>
              </div>
            </div>
            <div className="card-value">
              {formatCurrency(dashboardData?.revenueMetrics?.totalRevenueAfterTax || 0)}
            </div>
            {dashboardData?.revenueMetrics?.revenueGrowth !== undefined && (
              <div className="growth-indicator">
                <RiseOutlined
                  style={{
                    color: dashboardData.revenueMetrics.revenueGrowth >= 0 ? "#52c41a" : "#ff4d4f"
                  }}
                />
                <span style={{
                  color: dashboardData.revenueMetrics.revenueGrowth >= 0 ? "#52c41a" : "#ff4d4f"
                }}>
                  {dashboardData.revenueMetrics.revenueGrowth >= 0 ? '+' : ''}
                  {dashboardData.revenueMetrics.revenueGrowth.toFixed(1)}%
                </span>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card className="revenue-card average-revenue">
            <div className="card-header">
              <div className="card-icon">
                <BarChartOutlined />
              </div>
              <div className="card-info">
                <div className="card-title">Doanh thu TB/booking</div>
                <div className="card-subtitle">Trung bình mỗi đơn</div>
              </div>
            </div>
            <div className="card-value">
              {formatCurrency(dashboardData?.revenueMetrics?.averageRevenuePerBooking || 0)}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats Cards */}
      <Row gutter={[16, 16]} className="quick-stats-cards" style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Tours đang hoạt động"
              value={dashboardData?.tourMetrics?.activeTours || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 'bold' }}
            />
            <div className="additional-info">
              Tổng: {dashboardData?.tourMetrics?.totalToursCreated || 0} tours
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng bookings"
              value={dashboardData?.bookingMetrics?.totalBookings || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 'bold' }}
            />
            {dashboardData?.bookingMetrics?.bookingGrowth !== undefined && (
              <div className="growth-indicator">
                <RiseOutlined
                  style={{
                    color: dashboardData.bookingMetrics.bookingGrowth >= 0 ? "#52c41a" : "#ff4d4f"
                  }}
                />
                <span style={{
                  color: dashboardData.bookingMetrics.bookingGrowth >= 0 ? "#52c41a" : "#ff4d4f"
                }}>
                  {dashboardData.bookingMetrics.bookingGrowth >= 0 ? '+' : ''}
                  {dashboardData.bookingMetrics.bookingGrowth.toFixed(1)}%
                </span>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đánh giá trung bình"
              value={dashboardData?.tourMetrics?.averageRating || 0}
              prefix={<StarOutlined />}
              precision={1}
              suffix="/5"
              valueStyle={{
                color: (dashboardData?.tourMetrics?.averageRating ?? 0) > 0 ? '#faad14' : '#999'
              }}
            />
            <Progress
              percent={
                ((dashboardData?.tourMetrics?.averageRating || 0) / 5) * 100
              }
              showInfo={false}
              strokeColor="#faad14"
            />
            <div className="additional-info">
              {(dashboardData?.tourMetrics?.averageRating ?? 0) > 0
                ? 'Có đánh giá từ khách hàng'
                : 'Chưa có đánh giá'
              }
            </div>
          </Card>
        </Col>
      </Row>
      {/* Additional Statistics */}
      <div style={{ marginTop: 32, marginBottom: 16 }}>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: 600,
          color: '#262626',
          borderBottom: '1px solid #f0f0f0',
          paddingBottom: '8px'
        }}>
          Thống kê chi tiết
        </h3>
      </div>
      <Row
        gutter={[16, 16]}
        className="additional-stats"
        style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Booking thành công (tổng)"
              value={overallData?.bookingMetrics?.successfulBookings || dashboardData?.bookingMetrics?.successfulBookings || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
            <div className="additional-info">
              Tháng này: {dashboardData?.bookingMetrics?.successfulBookings || 0} |
              Tỷ lệ: {(overallData?.bookingMetrics?.totalBookings ?? 0) > 0
                ? (((overallData?.bookingMetrics?.successfulBookings ?? 0) / (overallData?.bookingMetrics?.totalBookings ?? 1)) * 100).toFixed(1)
                : 0}%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Booking bị hủy (tổng)"
              value={overallData?.bookingMetrics?.cancelledBookings || dashboardData?.bookingMetrics?.cancelledBookings || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
            <div className="additional-info">
              Tháng này: {dashboardData?.bookingMetrics?.cancelledBookings || 0} |
              Tỷ lệ: {overallData?.bookingMetrics?.cancellationRate?.toFixed(1) || dashboardData?.bookingMetrics?.cancellationRate?.toFixed(1) || 0}%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khách hàng"
              value={dashboardData?.customerMetrics?.totalCustomers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
            <div className="additional-info">
              Mới: {dashboardData?.customerMetrics?.newCustomers || 0} |
              Quay lại: {dashboardData?.customerMetrics?.returningCustomers || 0}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu trung bình/booking"
              value={dashboardData?.revenueMetrics?.averageRevenuePerBooking || 0}
              prefix={<DollarOutlined />}
              suffix="₫"
              formatter={(value) => {
                const num = Number(value);
                if (num >= 1000000) {
                  return `${(num / 1000000).toFixed(1)}M`;
                } else if (num >= 1000) {
                  return `${(num / 1000).toFixed(1)}K`;
                }
                return num.toLocaleString();
              }}
              valueStyle={{ color: "#13c2c2" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tax and Commission Information */}
      <div style={{ marginTop: 32, marginBottom: 16 }}>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: 600,
          color: '#262626',
          borderBottom: '1px solid #f0f0f0',
          paddingBottom: '8px'
        }}>
          Thông tin thuế và phí
        </h3>
      </div>
      <Row gutter={[16, 16]} className="tax-commission-cards" style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng VAT phải nộp"
              value={dashboardData?.revenueMetrics?.totalVAT || 0}
              prefix={<DollarOutlined />}
              suffix="₫"
              formatter={(value) => {
                const num = Number(value);
                if (num >= 1000000) {
                  return `${(num / 1000000).toFixed(1)}M`;
                } else if (num >= 1000) {
                  return `${(num / 1000).toFixed(1)}K`;
                }
                return num.toLocaleString();
              }}
              valueStyle={{ color: "#fa8c16" }}
            />
            <div className="additional-info">
              VAT ~9.09% trên doanh thu gốc
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Phí nền tảng"
              value={dashboardData?.revenueMetrics?.totalPlatformCommission || 0}
              prefix={<DollarOutlined />}
              suffix="₫"
              formatter={(value) => {
                const num = Number(value);
                if (num >= 1000000) {
                  return `${(num / 1000000).toFixed(1)}M`;
                } else if (num >= 1000) {
                  return `${(num / 1000).toFixed(1)}K`;
                }
                return num.toLocaleString();
              }}
              valueStyle={{ color: "#f5222d" }}
            />
            <div className="additional-info">
              10% phí nền tảng
            </div>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {" "}
        <Col xs={24} lg={14}>
          <Card
            title="Biểu đồ Bookings theo ngày"
            className="bookings-chart">
            <div className="bookings-chart-placeholder">
              {dashboardData?.trends?.dailyBookings &&
                dashboardData.trends.dailyBookings.length > 0 ? (
                dashboardData.trends.dailyBookings.map((item, index) => {
                  const maxBookings = Math.max(
                    ...dashboardData.trends.dailyBookings.map(d => d.bookings)
                  );
                  return (
                    <div key={index} className="booking-bar">
                      <span style={{ minWidth: '80px', fontSize: '12px' }}>
                        {dayjs(item.date).format("DD/MM")}
                      </span>
                      <Progress
                        percent={maxBookings > 0 ? (item.bookings / maxBookings) * 100 : 0}
                        format={() => `${item.bookings} bookings`}
                        strokeColor="#1890ff"
                      />
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#999",
                  }}>
                  <p>Chưa có dữ liệu bookings theo ngày</p>
                  <p style={{ fontSize: '12px' }}>Dữ liệu sẽ hiển thị khi có bookings mới</p>
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title="Thông tin Tour & Khách hàng"
            className="tour-customer-info">
            {dashboardData?.tourMetrics && dashboardData?.customerMetrics ? (
              <div>
                {/* Most Popular Tour */}
                <div className="info-section" style={{ marginBottom: 20 }}>
                  <h4 style={{ marginBottom: 12, color: '#1890ff' }}>Tour phổ biến nhất</h4>
                  <div className="tour-item">
                    <div className="tour-info">
                      <span className="tour-name" style={{ fontWeight: 500 }}>
                        {dashboardData.tourMetrics.mostPopularTourName ||
                          "Chưa có tour phổ biến"}
                      </span>
                      <span className="booking-count" style={{ color: '#666', fontSize: '12px' }}>
                        {dashboardData.bookingMetrics?.successfulBookings || 0} bookings thành công
                      </span>
                    </div>
                    <Progress
                      percent={dashboardData.tourMetrics.averageOccupancyRate || 0}
                      showInfo={true}
                      format={(percent) => `${percent}% lấp đầy`}
                      strokeColor="#52c41a"
                    />
                  </div>
                </div>

                {/* Customer Stats */}
                <div className="info-section">
                  <h4 style={{ marginBottom: 12, color: '#722ed1' }}>Thống kê khách hàng</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>Tổng khách hàng:</span>
                    <strong>{dashboardData.customerMetrics.totalCustomers}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>Khách hàng mới:</span>
                    <strong style={{ color: '#52c41a' }}>{dashboardData.customerMetrics.newCustomers}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>Khách hàng quay lại:</span>
                    <strong style={{ color: '#1890ff' }}>{dashboardData.customerMetrics.returningCustomers}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tỷ lệ giữ chân:</span>
                    <strong style={{ color: '#faad14' }}>
                      {dashboardData.customerMetrics.customerRetentionRate?.toFixed(1) || 0}%
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                <p>Chưa có dữ liệu tours và khách hàng</p>
                <p style={{ fontSize: '12px' }}>Dữ liệu sẽ hiển thị khi có tours và bookings</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>{" "}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title="Hoạt động gần đây"
            className="recent-bookings">
            {recentBookings && recentBookings.length > 0 ? (
              <Table
                dataSource={recentBookings.map((booking, index) => ({
                  key: booking.id || index,
                  id: booking.bookingCode || booking.id,
                  tourName: booking.tourName || 'N/A',
                  customerName: booking.customerName || 'N/A',
                  bookingDate: booking.bookingDate,
                  tourDate: booking.tourDate,
                  amount: booking.amount || 0,
                  status: booking.status || 'Pending', // Keep original case for proper mapping
                  numberOfGuests: booking.numberOfGuests || 1,
                }))}
                columns={bookingColumns}
                rowKey="key"
                pagination={{
                  pageSize: 5,
                  showSizeChanger: false,
                  showQuickJumper: false,
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} booking`
                }}
                scroll={{ x: 800 }}
              />
            ) : (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                <p>Chưa có dữ liệu booking gần đây</p>
                <p>Dữ liệu sẽ hiển thị khi có bookings mới</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TourCompanyDashboard;

