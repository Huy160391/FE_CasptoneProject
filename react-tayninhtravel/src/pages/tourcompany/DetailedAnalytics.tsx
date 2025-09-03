import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Select,
  Space,
  Button,
  Typography,
  message,
  Spin,
  Progress,
  Tag,
  Tabs,
  List,
  Avatar,
} from "antd";
import {
  BarChartOutlined,
  DollarOutlined,
  UserOutlined,
  TrophyOutlined,
  ReloadOutlined,
  LineChartOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getDetailedAnalytics } from "@/services/tourcompanyService";
import { useAuthStore } from "@/store/useAuthStore";
import { TourCompanyDetailedAnalytics } from "@/types/dashboard";
import "./DetailedAnalytics.scss";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const DetailedAnalytics: React.FC = () => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] =
    useState<TourCompanyDetailedAnalytics | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(
    undefined
  );
  const [analyticsType, setAnalyticsType] = useState<string>("overview");
  const [granularity] = useState<string>("daily");

  // Fetch detailed analytics data
  const fetchAnalyticsData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await getDetailedAnalytics(
        {
          year: selectedYear,
          month: selectedMonth,
          analyticsType,
          granularity,
        },
        token
      );

      if (response.success && response.data) {
        setAnalyticsData(response.data);
      } else {
        message.error(response.message || "Không thể tải dữ liệu phân tích");
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      message.error("Có lỗi xảy ra khi tải dữ liệu phân tích");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedYear, selectedMonth, analyticsType, granularity, token]);

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  // Show loading spinner while fetching data
  if (loading && !analyticsData) {
    return (
      <div className="detailed-analytics">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Đang tải dữ liệu phân tích...</p>
        </div>
      </div>
    );
  }

  const renderRevenueAnalytics = () => (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card title="Phân tích doanh thu chi tiết">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Statistic
                title="Tổng doanh thu"
                value={
                  analyticsData?.revenueAnalytics?.profitabilityAnalysis
                    ?.grossRevenue || 0
                }
                prefix={<DollarOutlined />}
                suffix="₫"
                formatter={(value) =>
                  `${(Number(value) / 1000000).toFixed(1)}M`
                }
              />
            </Col>
            <Col xs={24} md={12}>
              <Statistic
                title="Lợi nhuận gộp"
                value={
                  analyticsData?.revenueAnalytics?.profitabilityAnalysis
                    ?.grossProfit || 0
                }
                prefix={<DollarOutlined />}
                suffix="₫"
                formatter={(value) =>
                  `${(Number(value) / 1000000).toFixed(1)}M`
                }
              />
            </Col>
          </Row>

          <div style={{ marginTop: 24 }}>
            <Title level={4}>Top Tours theo doanh thu</Title>
            <Table
              dataSource={
                analyticsData?.revenueAnalytics?.revenueBreakdown
                  ?.tourRevenue || []
              }
              columns={[
                {
                  title: "Tên Tour",
                  dataIndex: "tourName",
                  key: "tourName",
                },
                {
                  title: "Doanh thu",
                  dataIndex: "revenue",
                  key: "revenue",
                  render: (value: number) =>
                    `${(value / 1000000).toFixed(1)}M ₫`,
                },
                {
                  title: "Số booking",
                  dataIndex: "bookings",
                  key: "bookings",
                },
                {
                  title: "Tỷ lệ đóng góp",
                  dataIndex: "revenueShare",
                  key: "revenueShare",
                  render: (value: number) => `${value.toFixed(1)}%`,
                },
              ]}
              pagination={false}
              size="small"
            />
          </div>
        </Card>
      </Col>
    </Row>
  );

  const renderCustomerAnalytics = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="Phân tích khách hàng">
          <div style={{ marginBottom: 16 }}>
            <Text strong>Tỷ lệ khách hàng quay lại: </Text>
            <Text>
              {analyticsData?.customerAnalytics?.loyaltyMetrics?.repeatCustomerRate?.toFixed(
                1
              ) || 0}
              %
            </Text>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Text strong>Giá trị trung bình mỗi khách hàng: </Text>
            <Text>
              {(
                (analyticsData?.customerAnalytics?.loyaltyMetrics
                  ?.averageCustomerLifetimeValue || 0) / 1000000
              ).toFixed(1)}
              M ₫
            </Text>
          </div>

          <Title level={5}>Phân bố độ tuổi</Title>
          {analyticsData?.customerAnalytics?.demographics?.ageGroups?.map(
            (group, index) => (
              <div key={index} style={{ marginBottom: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}>
                  <span>{group.ageRange}</span>
                  <span>{group.percentage.toFixed(1)}%</span>
                </div>
                <Progress percent={group.percentage} showInfo={false} />
              </div>
            )
          )}
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Nguồn khách hàng">
          {analyticsData?.customerAnalytics?.demographics?.customerOrigin?.map(
            (origin, index) => (
              <div key={index} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                  <span>{origin.location}</span>
                  <div>
                    <Tag color="blue">{origin.bookings} bookings</Tag>
                    <span>{origin.percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <Progress
                  percent={origin.percentage}
                  showInfo={false}
                  strokeColor="#1890ff"
                />
              </div>
            )
          )}
        </Card>
      </Col>
    </Row>
  );

  const renderPerformanceAnalytics = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="Hiệu suất vận hành">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic
                title="Tỷ lệ hoàn thành tour"
                value={
                  analyticsData?.performanceAnalytics?.operationalMetrics
                    ?.tourCompletionRate || 0
                }
                suffix="%"
                precision={1}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Tỷ lệ đúng giờ"
                value={
                  analyticsData?.performanceAnalytics?.operationalMetrics
                    ?.onTimeStartRate || 0
                }
                suffix="%"
                precision={1}
              />
            </Col>
          </Row>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Chất lượng dịch vụ">
          <div style={{ marginBottom: 16 }}>
            <Text strong>Đánh giá trung bình: </Text>
            <Text>
              {analyticsData?.performanceAnalytics?.qualityMetrics?.averageRating?.toFixed(
                1
              ) || 0}
              /5
            </Text>
          </div>

          <Title level={5}>Phân bố đánh giá</Title>
          {Object.entries(
            analyticsData?.performanceAnalytics?.qualityMetrics
              ?.ratingDistribution || {}
          ).map(([star, percentage]) => (
            <div key={star} style={{ marginBottom: 8 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}>
                <span>{star.replace("star", " sao")}</span>
                <span>{(percentage as number).toFixed(1)}%</span>
              </div>
              <Progress
                percent={percentage as number}
                showInfo={false}
                strokeColor="#faad14"
              />
            </div>
          ))}
        </Card>
      </Col>
    </Row>
  );

  const renderForecastingAndRecommendations = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="Dự báo tháng tới">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Statistic
                title="Dự kiến booking"
                value={
                  analyticsData?.forecasting?.nextMonthPrediction
                    ?.expectedBookings || 0
                }
                prefix={<UserOutlined />}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Dự kiến doanh thu"
                value={
                  analyticsData?.forecasting?.nextMonthPrediction
                    ?.expectedRevenue || 0
                }
                prefix={<DollarOutlined />}
                suffix="₫"
                formatter={(value) =>
                  `${(Number(value) / 1000000).toFixed(1)}M`
                }
              />
            </Col>
          </Row>
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">
              Độ tin cậy:{" "}
              {analyticsData?.forecasting?.nextMonthPrediction?.confidence?.toFixed(
                1
              ) || 0}
              %
            </Text>
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card title="Khuyến nghị cải thiện">
          <List
            dataSource={analyticsData?.forecasting?.recommendations || []}
            renderItem={(item, index) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<TrophyOutlined />} />}
                  title={`Khuyến nghị ${index + 1}`}
                  description={item}
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );

  return (
    <div className="detailed-analytics">
      <div className="analytics-header">
        <Title level={2}>Phân tích chi tiết</Title>
        <Space>
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            style={{ width: 120 }}>
            {Array.from({ length: 5 }, (_, i) => dayjs().year() - i).map(
              (year) => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              )
            )}
          </Select>

          <Select
            value={selectedMonth}
            onChange={setSelectedMonth}
            placeholder="Chọn tháng"
            style={{ width: 120 }}
            allowClear>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <Option key={month} value={month}>
                Tháng {month}
              </Option>
            ))}
          </Select>

          <Select
            value={analyticsType}
            onChange={setAnalyticsType}
            style={{ width: 150 }}>
            <Option value="overview">Tổng quan</Option>
            <Option value="revenue">Doanh thu</Option>
            <Option value="customers">Khách hàng</Option>
            <Option value="performance">Hiệu suất</Option>
          </Select>

          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}>
            Làm mới
          </Button>
        </Space>
      </div>

      <Tabs defaultActiveKey="revenue" type="card">
        <TabPane
          tab={
            <span>
              <BarChartOutlined />
              Doanh thu
            </span>
          }
          key="revenue">
          {renderRevenueAnalytics()}
        </TabPane>
        <TabPane
          tab={
            <span>
              <UserOutlined />
              Khách hàng
            </span>
          }
          key="customers">
          {renderCustomerAnalytics()}
        </TabPane>
        <TabPane
          tab={
            <span>
              <LineChartOutlined />
              Hiệu suất
            </span>
          }
          key="performance">
          {renderPerformanceAnalytics()}
        </TabPane>
        <TabPane
          tab={
            <span>
              <PieChartOutlined />
              Dự báo
            </span>
          }
          key="forecasting">
          {renderForecastingAndRecommendations()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default DetailedAnalytics;
