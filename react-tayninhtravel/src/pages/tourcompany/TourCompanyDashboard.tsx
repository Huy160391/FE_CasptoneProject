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
  message,
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
import { getDashboardStatistics } from "@/services/tourcompanyService";
import { useAuthStore } from "@/store/useAuthStore";
import { TourCompanyDashboardStatistics } from "@/types/dashboard";
import "./TourCompanyDashboard.scss";

const { Title } = Typography;
const { RangePicker } = DatePicker;

// Interfaces removed - using types from dashboard.ts

const TourCompanyDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] =
    useState<TourCompanyDashboardStatistics | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(
    undefined
  );

  // Remove mock data - will use real data from API
  const bookingColumns = [
    {
      title: "Mã booking",
      dataIndex: "id",
      key: "id",
    },
    {
      title: t("tourCompany.transactions.columns.tourName"),
      dataIndex: "tourName",
      key: "tourName",
    },
    {
      title: t("tourCompany.transactions.columns.customerName"),
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: t("tourCompany.transactions.columns.date"),
      dataIndex: "bookingDate",
      key: "bookingDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: t("tourCompany.transactions.columns.amount"),
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `${amount.toLocaleString("vi-VN")} ₫`,
    },
    {
      title: t("tourCompany.transactions.columns.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusConfig = {
          confirmed: {
            color: "success",
            text: t("tourCompany.transactions.status.completed"),
          },
          pending: {
            color: "warning",
            text: t("tourCompany.transactions.status.pending"),
          },
          cancelled: {
            color: "error",
            text: t("tourCompany.transactions.status.cancelled"),
          },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await getDashboardStatistics(
        {
          year: selectedYear,
          month: selectedMonth,
          compareWithPrevious: true,
        },
        token
      );

      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        message.error(response.message || "Không thể tải dữ liệu dashboard");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error("Có lỗi xảy ra khi tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchDashboardData();
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
          <Button
            type="default"
            icon={<BarChartOutlined />}
            onClick={() => navigate("/tour-company/analytics")}>
            Phân tích chi tiết
          </Button>
        </Space>
      </div>
      <Row gutter={[16, 16]} className="stats-cards">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t("tourCompany.dashboard.stats.totalRevenue")}
              value={dashboardData?.revenueMetrics?.totalRevenue || 0}
              prefix={<DollarOutlined />}
              suffix="₫"
              formatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M`}
            />
            <div className="growth-indicator">
              <RiseOutlined style={{ color: "#52c41a" }} />
              <span style={{ color: "#52c41a" }}>
                +{dashboardData?.revenueMetrics?.revenueGrowth?.toFixed(1) || 0}
                %
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t("tourCompany.dashboard.stats.totalTours")}
              value={dashboardData?.tourMetrics?.activeTours || 0}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t("tourCompany.dashboard.stats.totalBookings")}
              value={dashboardData?.bookingMetrics?.totalBookings || 0}
              prefix={<UserOutlined />}
            />
            <div className="growth-indicator">
              <RiseOutlined style={{ color: "#52c41a" }} />
              <span style={{ color: "#52c41a" }}>
                +{dashboardData?.bookingMetrics?.bookingGrowth?.toFixed(1) || 0}
                %
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t("tourCompany.dashboard.stats.avgRating")}
              value={dashboardData?.tourMetrics?.averageRating || 0}
              prefix={<StarOutlined />}
              precision={1}
            />
            <Progress
              percent={
                ((dashboardData?.tourMetrics?.averageRating || 0) / 5) * 100
              }
              showInfo={false}
              strokeColor="#faad14"
            />
          </Card>
        </Col>
      </Row>
      {/* Additional Tour Statistics */}
      <Row
        gutter={[16, 16]}
        className="tour-stats"
        style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Tour Details"
              value={dashboardData?.tourMetrics?.totalToursCreated || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tours Bị Hủy"
              value={dashboardData?.tourMetrics?.cancelledTours || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tours Đang Chờ"
              value={dashboardData?.tourMetrics?.pendingTours || 0}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tỷ Lệ Lấp Đầy"
              value={dashboardData?.tourMetrics?.averageOccupancyRate || 0}
              prefix={<BarChartOutlined />}
              suffix="%"
              precision={1}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {" "}
        <Col xs={24} lg={14}>
          <Card
            title={t("tourCompany.dashboard.charts.revenueTitle")}
            className="revenue-chart">
            <div className="revenue-chart-placeholder">
              {dashboardData?.trends?.weeklyRevenue &&
              dashboardData.trends.weeklyRevenue.length > 0 ? (
                dashboardData.trends.weeklyRevenue.map((item, index) => (
                  <div key={index} className="revenue-bar">
                    <span>{item.week}</span>
                    <Progress
                      percent={
                        item.revenue > 0
                          ? Math.min(
                              (item.revenue /
                                Math.max(
                                  ...dashboardData.trends.weeklyRevenue.map(
                                    (w) => w.revenue
                                  )
                                )) *
                                100,
                              100
                            )
                          : 0
                      }
                      format={() => `${(item.revenue / 1000000).toFixed(1)}M ₫`}
                    />
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#999",
                  }}>
                  <p>Chưa có dữ liệu doanh thu</p>
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={t("tourCompany.dashboard.charts.popularToursTitle")}
            className="popular-tours">
            {dashboardData?.tourMetrics ? (
              <div className="tour-item">
                <div className="tour-info">
                  <span className="tour-name">
                    {dashboardData.tourMetrics.mostPopularTourName ||
                      "Chưa có tour phổ biến"}
                  </span>
                  <span className="booking-count">
                    {dashboardData.bookingMetrics?.totalBookings || 0} bookings
                  </span>
                </div>
                <Progress
                  percent={dashboardData.tourMetrics.averageOccupancyRate || 0}
                  showInfo={false}
                />
              </div>
            ) : (
              <div
                style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                <p>Chưa có dữ liệu tours</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>{" "}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title={t("tourCompany.dashboard.recentActivities.title")}
            className="recent-bookings">
            {dashboardData?.trends?.dailyBookings &&
            dashboardData.trends.dailyBookings.length > 0 ? (
              <Table
                dataSource={dashboardData.trends.dailyBookings.map(
                  (booking, index) => ({
                    id: `DB${index + 1}`,
                    tourName: "Tour booking",
                    customerName: "Khách hàng",
                    bookingDate: booking.date,
                    amount: booking.revenue,
                    status: "confirmed",
                  })
                )}
                columns={bookingColumns}
                rowKey="id"
                pagination={{ pageSize: 5 }}
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
