import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Select,
  DatePicker,
  Typography,
  Row,
  Col,
  Statistic,
  message,
  Modal,
} from "antd";
import {
  ExclamationCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../../store/useAuthStore";
import {
  getTourCompanyIncidents,
  handleApiError,
} from "../../services/tourcompanyService";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  createdAt: string;
  tourName: string;
  tourDate: string;
  guideName: string;
  guidePhone: string;
}

const IncidentManagement: React.FC = () => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedSeverity, setSelectedSeverity] = useState<
    string | undefined
  >();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null
  );
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await getTourCompanyIncidents(
        {
          pageIndex,
          pageSize,
          severity: selectedSeverity,
          status: selectedStatus,
          fromDate: dateRange?.[0]?.toDate(),
          toDate: dateRange?.[1]?.toDate(),
        },
        token || undefined
      );

      if (response.success && response.data) {
        setIncidents(response.data.items || []);
        setTotalCount(response.data.totalCount || 0);
      } else {
        setIncidents([]);
        setTotalCount(0);
        message.warning(response.message || "Không có dữ liệu sự cố");
      }
    } catch (error) {
      console.error("Error fetching incidents:", error);
      handleApiError(error);
      setIncidents([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [pageIndex, pageSize, selectedSeverity, selectedStatus, dateRange]);

  const handleRefresh = () => {
    fetchIncidents();
  };

  const handleViewDetail = (incident: Incident) => {
    setSelectedIncident(incident);
    setDetailModalVisible(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "red";
      case "high":
        return "orange";
      case "medium":
        return "yellow";
      case "low":
        return "green";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "green";
      case "in progress":
        return "blue";
      case "pending":
        return "orange";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Tiêu Đề",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: Incident) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {dayjs(record.createdAt).format("DD/MM/YYYY HH:mm")}
          </Text>
        </div>
      ),
    },
    {
      title: "Tour",
      dataIndex: "tourName",
      key: "tourName",
      render: (text: string, record: Incident) => (
        <div>
          <div>{text}</div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {dayjs(record.tourDate).format("DD/MM/YYYY")}
          </Text>
        </div>
      ),
    },
    {
      title: "Hướng Dẫn Viên",
      key: "guide",
      render: (_: any, record: Incident) => (
        <div>
          <div>{record.guideName}</div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.guidePhone}
          </Text>
        </div>
      ),
    },
    {
      title: "Mức Độ",
      dataIndex: "severity",
      key: "severity",
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>{severity}</Tag>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "Thao Tác",
      key: "actions",
      render: (_: any, record: Incident) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  const severityStats = {
    critical: incidents.filter((i) => i.severity.toLowerCase() === "critical")
      .length,
    high: incidents.filter((i) => i.severity.toLowerCase() === "high").length,
    medium: incidents.filter((i) => i.severity.toLowerCase() === "medium")
      .length,
    low: incidents.filter((i) => i.severity.toLowerCase() === "low").length,
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>
          <ExclamationCircleOutlined style={{ marginRight: "8px" }} />
          Quản Lý Sự Cố
        </Title>
        <Text type="secondary">
          Theo dõi và quản lý các sự cố được báo cáo trong tours
        </Text>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng Sự Cố"
              value={totalCount}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Nghiêm Trọng"
              value={severityStats.critical}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Cao"
              value={severityStats.high}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đã Giải Quyết"
              value={
                incidents.filter((i) => i.status.toLowerCase() === "resolved")
                  .length
              }
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Mức độ nghiêm trọng"
              value={selectedSeverity}
              onChange={setSelectedSeverity}
              style={{ width: "100%" }}
              allowClear>
              <Option value="Critical">Nghiêm trọng</Option>
              <Option value="High">Cao</Option>
              <Option value="Medium">Trung bình</Option>
              <Option value="Low">Thấp</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Trạng thái"
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: "100%" }}
              allowClear>
              <Option value="Pending">Chờ xử lý</Option>
              <Option value="In Progress">Đang xử lý</Option>
              <Option value="Resolved">Đã giải quyết</Option>
              <Option value="Cancelled">Đã hủy</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={8}>
            <RangePicker
              value={dateRange}
              onChange={(dates) =>
                setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)
              }
              style={{ width: "100%" }}
              placeholder={["Từ ngày", "Đến ngày"]}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col xs={24} sm={24} md={4}>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
              style={{ width: "100%" }}>
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Incidents Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={incidents}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pageIndex + 1,
            pageSize,
            total: totalCount,
            onChange: (page, size) => {
              setPageIndex(page - 1);
              setPageSize(size || 10);
            },
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} sự cố`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi Tiết Sự Cố"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}>
        {selectedIncident && (
          <div>
            <Row gutter={16} style={{ marginBottom: "16px" }}>
              <Col span={12}>
                <Text strong>Tiêu đề:</Text>
                <div>{selectedIncident.title}</div>
              </Col>
              <Col span={12}>
                <Text strong>Mức độ:</Text>
                <div>
                  <Tag color={getSeverityColor(selectedIncident.severity)}>
                    {selectedIncident.severity}
                  </Tag>
                </div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: "16px" }}>
              <Col span={12}>
                <Text strong>Trạng thái:</Text>
                <div>
                  <Tag color={getStatusColor(selectedIncident.status)}>
                    {selectedIncident.status}
                  </Tag>
                </div>
              </Col>
              <Col span={12}>
                <Text strong>Thời gian:</Text>
                <div>
                  {dayjs(selectedIncident.createdAt).format("DD/MM/YYYY HH:mm")}
                </div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: "16px" }}>
              <Col span={12}>
                <Text strong>Tour:</Text>
                <div>{selectedIncident.tourName}</div>
              </Col>
              <Col span={12}>
                <Text strong>Ngày tour:</Text>
                <div>
                  {dayjs(selectedIncident.tourDate).format("DD/MM/YYYY")}
                </div>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: "16px" }}>
              <Col span={12}>
                <Text strong>Hướng dẫn viên:</Text>
                <div>{selectedIncident.guideName}</div>
              </Col>
              <Col span={12}>
                <Text strong>Số điện thoại:</Text>
                <div>{selectedIncident.guidePhone}</div>
              </Col>
            </Row>
            <div style={{ marginBottom: "16px" }}>
              <Text strong>Mô tả:</Text>
              <div
                style={{
                  marginTop: "8px",
                  padding: "12px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "6px",
                }}>
                {selectedIncident.description}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IncidentManagement;
