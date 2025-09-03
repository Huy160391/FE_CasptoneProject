import React, { useState, useEffect } from "react";
import RevenueDetailModal from "./RevenueDetailModal"; // Import the new modal
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Select,
  Button,
  Input,
  Tag,
  Typography,
  Space,
  Spin,
  message,
} from "antd";
import {
  DollarOutlined,
  ShopOutlined,
  RiseOutlined,
  FallOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Column } from "@ant-design/plots";
import { adminService } from "../../services/adminService";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

interface RevenueStats {
  totalRevenue: number;
  totalCompanies: number;
  averageRevenue: number;
  revenueGrowth: number;
  companies: CompanyRevenue[];
  totalCount: number;
}

interface CompanyRevenue {
  id: string;
  companyName: string;
  email: string;
  totalRevenue: number;
  revenueBeforeTax: number;
  revenueAfterTax: number;
  totalBookings: number;
  isActive: boolean;
  lastActivityDate: string;
}

const AdminRevenueDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null
  );

  const fetchRevenueStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getRevenueStats({
        year: selectedYear,
        month: selectedMonth,
        pageIndex,
        pageSize,
        searchTerm,
        isActive: isActive || undefined,
      });

      if (response.success && response.data) {
        setRevenueStats(response.data);
      } else {
        setRevenueStats(null);
        message.warning(response.message || "Không có dữ liệu doanh thu");
      }
    } catch (error) {
      console.error("Error fetching revenue stats:", error);
      message.error("Không thể tải dữ liệu doanh thu");
      setRevenueStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueStats();
  }, [selectedYear, selectedMonth, pageIndex, pageSize, searchTerm, isActive]);

  const handleRefresh = () => {
    fetchRevenueStats();
  };

  const handleViewDetail = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setIsDetailModalVisible(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const columns = [
    {
      title: "Tên Công Ty",
      dataIndex: "companyName",
      key: "companyName",
      render: (text: string, record: CompanyRevenue) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.email}
          </Text>
        </div>
      ),
    },
    {
      title: "Doanh Thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (amount: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          {formatCurrency(amount)}
        </Text>
      ),
      sorter: (a: CompanyRevenue, b: CompanyRevenue) =>
        a.totalRevenue - b.totalRevenue,
    },
    {
      title: "Trước Thuế",
      dataIndex: "revenueBeforeTax",
      key: "revenueBeforeTax",
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: "Sau Thuế",
      dataIndex: "revenueAfterTax",
      key: "revenueAfterTax",
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: "Số Booking",
      dataIndex: "totalBookings",
      key: "totalBookings",
      render: (count: number) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: "Trạng Thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Tạm dừng"}
        </Tag>
      ),
    },
    {
      title: "Hoạt Động Cuối",
      dataIndex: "lastActivityDate",
      key: "lastActivityDate",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thao Tác",
      key: "actions",
      render: (_: any, record: CompanyRevenue) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record.id)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  const chartData =
    revenueStats?.companies.map((company) => ({
      company: company.companyName,
      revenue: company.totalRevenue / 1000000, // Convert to millions
    })) || [];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Dashboard Doanh Thu</Title>
        <Text type="secondary">Thống kê doanh thu của các công ty lữ hành</Text>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={16} align="middle">
          <Col>
            <Space>
              <Text>Năm:</Text>
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                style={{ width: 100 }}>
                {[2023, 2024, 2025].map((year) => (
                  <Option key={year} value={year}>
                    {year}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Text>Tháng:</Text>
              <Select
                value={selectedMonth}
                onChange={setSelectedMonth}
                style={{ width: 100 }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <Option key={month} value={month}>
                    {month}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col>
            <Input
              placeholder="Tìm kiếm công ty..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
          </Col>
          <Col>
            <Select
              placeholder="Trạng thái"
              value={isActive}
              onChange={setIsActive}
              style={{ width: 120 }}
              allowClear>
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Tạm dừng</Option>
            </Select>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}>
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        {/* Statistics Cards */}
        <Row gutter={16} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng Doanh Thu"
                value={revenueStats?.totalRevenue || 0}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<DollarOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Số Công Ty"
                value={revenueStats?.totalCompanies || 0}
                prefix={<ShopOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Doanh Thu TB"
                value={revenueStats?.averageRevenue || 0}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tăng Trưởng"
                value={revenueStats?.revenueGrowth || 0}
                precision={1}
                suffix="%"
                prefix={
                  (revenueStats?.revenueGrowth || 0) >= 0 ? (
                    <RiseOutlined />
                  ) : (
                    <FallOutlined />
                  )
                }
                valueStyle={{
                  color:
                    (revenueStats?.revenueGrowth || 0) >= 0
                      ? "#3f8600"
                      : "#cf1322",
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Chart */}
        <Card title="Biểu Đồ Doanh Thu" style={{ marginBottom: "24px" }}>
          <Column
            data={chartData}
            xField="company"
            yField="revenue"
            height={300}
            label={{
              position: "middle",
              style: {
                fill: "#FFFFFF",
                opacity: 0.6,
              },
            }}
            meta={{
              revenue: {
                alias: "Doanh Thu (Triệu VNĐ)",
              },
              company: {
                alias: "Công Ty",
              },
            }}
          />
        </Card>

        {/* Companies Table */}
        <Card title="Danh Sách Công Ty">
          <Table
            columns={columns}
            dataSource={revenueStats?.companies || []}
            rowKey="id"
            pagination={{
              current: pageIndex + 1,
              pageSize,
              total: revenueStats?.totalCount || 0,
              onChange: (page, size) => {
                setPageIndex(page - 1);
                setPageSize(size || 10);
              },
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} công ty`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </Spin>
      <RevenueDetailModal
        visible={isDetailModalVisible}
        onClose={() => setIsDetailModalVisible(false)}
        companyId={selectedCompanyId}
        year={selectedYear}
      />
    </div>
  );
};

export default AdminRevenueDashboard;
