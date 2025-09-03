import React, { useState } from "react";
import {
  Card,
  Input,
  Button,
  Modal,
  message,
  Typography,
  Space,
  Descriptions,
  Tag,
  Alert,
  Row,
  Col,
  Divider,
} from "antd";
import {
  SearchOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  RocketOutlined,
  FlagOutlined,
  StopOutlined,
  InfoCircleOutlined,
  ToolOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { adminService } from "../../services/adminService";
import dayjs from "dayjs";

const { Title, Paragraph } = Typography;
const { confirm } = Modal;

// Updated interface to match the new API response
interface TourSlotInfo {
  tourSlot: {
    id: string;
    tourTitle: string;
    tourDate: string;
    status: string;
    maxGuests: number;
    currentBookings: number;
  };
  timeInfo: {
    daysUntilTour: number;
    isTourStarted: boolean;
  };
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    totalGuests: number;
    totalRevenue: number;
  };
  testingActions: {
    canSkipToTourStart: boolean;
    canCompleteTour: boolean;
    canTriggerRevenueTransfer: boolean;
  };
}

const TourStatusManagement: React.FC = () => {
  const [actionLoading, setActionLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [tourSlotId, setTourSlotId] = useState("");
  const [tourSlotInfo, setTourSlotInfo] = useState<TourSlotInfo | null>(null);

  const handleSearch = async () => {
    if (!tourSlotId.trim()) {
      message.warning("Vui lòng nhập Tour Slot ID");
      return;
    }

    try {
      setSearchLoading(true);
      const response = await adminService.getTourSlotInfoForTesting(tourSlotId);

      if (response.success && response.data) {
        setTourSlotInfo(response.data);
        message.success("Tải thông tin tour slot thành công");
      } else {
        setTourSlotInfo(null);
        message.error(
          response.message || "Không tìm thấy tour slot với ID này"
        );
      }
    } catch (error) {
      console.error("Error searching tour slot:", error);
      message.error("Có lỗi xảy ra khi tìm kiếm tour slot");
      setTourSlotInfo(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const executeTestAction = (
    title: string,
    action: () => Promise<any>,
    successMessage: string
  ) => {
    confirm({
      title: `Xác nhận: ${title}`,
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn thực hiện hành động này không? Hành động này được thiết kế cho mục đích kiểm thử.`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setActionLoading(true);
          const response = await action();
          if (response.success) {
            message.success(response.data?.message || successMessage);
            // Refresh data after action
            handleSearch();
          } else {
            message.error(response.message || "Hành động thất bại");
          }
        } catch (error) {
          console.error(`Error during '${title}':`, error);
          message.error("Có lỗi xảy ra");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleSkipToStart = () => {
    if (!tourSlotInfo) return;
    executeTestAction(
      "Bắt đầu Tour (Skip Time)",
      () => adminService.skipToTourStart(tourSlotInfo.tourSlot.id),
      "Tour đã được chuyển sang trạng thái 'Đang diễn ra'"
    );
  };

  const handleCompleteTour = () => {
    if (!tourSlotInfo) return;
    executeTestAction(
      "Hoàn thành Tour",
      () => adminService.completeTour(tourSlotInfo.tourSlot.id),
      "Tour đã được hoàn thành thành công"
    );
  };

  const handleAutoCancel = () => {
    if (!tourSlotInfo) return;
    executeTestAction(
      "Hủy Tour (Auto-Cancel)",
      () => adminService.triggerAutoCancel(tourSlotInfo.tourSlot.id),
      "Tour đã được hủy thành công"
    );
  };

  const handleSkipToRevenueTransfer = () => {
    if (!tourSlotInfo) return;
    executeTestAction(
      "Skip to Revenue Transfer",
      () => adminService.skipToRevenueTransfer(tourSlotInfo.tourSlot.id),
      "Revenue đã được chuyển thành công cho tour company"
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "green";
      case "fullybooked":
        return "blue";
      case "inprogress":
        return "orange";
      case "completed":
        return "purple";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "Có sẵn";
      case "fullybooked":
        return "Đã đầy";
      case "inprogress":
        return "Đang diễn ra";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return <CheckCircleOutlined />;
      case "fullybooked":
        return <ExclamationCircleOutlined />;
      case "inprogress":
        return <SyncOutlined spin />;
      case "completed":
        return <CheckCircleOutlined />;
      case "cancelled":
        return <CloseCircleOutlined />;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card style={{ marginBottom: "24px" }}>
        <Title level={2}>
          <ToolOutlined style={{ marginRight: "8px" }} />
          Công Cụ Kiểm Thử Trạng Thái Tour
        </Title>
        <Paragraph type="secondary">
          Sử dụng công cụ này để mô phỏng các giai đoạn của một tour, giúp cho
          việc kiểm thử và demo trên UI dễ dàng hơn.
        </Paragraph>
        <Space.Compact style={{ width: "100%", maxWidth: "600px" }}>
          <Input
            placeholder="Nhập Tour Slot ID (GUID)"
            value={tourSlotId}
            onChange={(e) => setTourSlotId(e.target.value)}
            onPressEnter={handleSearch}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={searchLoading}>
            Kiểm Tra
          </Button>
        </Space.Compact>
      </Card>

      {tourSlotInfo && (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title="Thông Tin Tour Slot">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Tên Tour">
                  {tourSlotInfo.tourSlot.tourTitle}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày Tour">
                  {dayjs(tourSlotInfo.tourSlot.tourDate).format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng Thái">
                  <Tag
                    color={getStatusColor(tourSlotInfo.tourSlot.status)}
                    icon={getStatusIcon(tourSlotInfo.tourSlot.status)}>
                    {getStatusText(tourSlotInfo.tourSlot.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Số khách">
                  {`${tourSlotInfo.bookings.totalGuests} / ${tourSlotInfo.tourSlot.maxGuests}`}
                </Descriptions.Item>
                <Descriptions.Item label="Bookings">
                  {`Đã xác nhận: ${tourSlotInfo.bookings.confirmed}, Chờ xử lý: ${tourSlotInfo.bookings.pending}`}
                </Descriptions.Item>
                <Descriptions.Item label="Doanh thu (Đã xác nhận)">{`${tourSlotInfo.bookings.totalRevenue.toLocaleString()} VNĐ`}
                  {`${tourSlotInfo.bookings.totalRevenue.toLocaleString()} VNĐ`}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Hành Động Kiểm Thử (Testing Actions)">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  icon={<RocketOutlined />}
                  type="primary"
                  onClick={handleSkipToStart}
                  disabled={
                    !tourSlotInfo.testingActions.canSkipToTourStart ||
                    actionLoading
                  }
                  loading={actionLoading}
                  block>
                  Bắt đầu Tour (Skip Time)
                </Button>
                <Paragraph type="secondary" style={{ textAlign: "center" }}>
                  Chuyển trạng thái tour thành "Đang diễn ra".
                </Paragraph>

                <Divider />

                <Button
                  icon={<FlagOutlined />}
                  type="primary"
                  onClick={handleCompleteTour}
                  disabled={
                    !tourSlotInfo.testingActions.canCompleteTour ||
                    actionLoading
                  }
                  loading={actionLoading}
                  block>
                  Hoàn thành Tour
                </Button>
                <Paragraph type="secondary" style={{ textAlign: "center" }}>
                  Chuyển trạng thái tour thành "Hoàn thành".
                </Paragraph>

                <Divider />

                <Button
                  icon={<StopOutlined />}
                  danger
                  type="primary"
                  onClick={handleAutoCancel}
                  disabled={actionLoading}
                  loading={actionLoading}
                  block>
                  Hủy Tour (Auto-Cancel)
                </Button>
                <Paragraph type="secondary" style={{ textAlign: "center" }}>
                  Mô phỏng việc tour bị hủy do không đủ khách.
                </Paragraph>

                <Divider />

                <Button
                  icon={<DollarOutlined />}
                  type="primary"
                  style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                  onClick={handleSkipToRevenueTransfer}
                  disabled={
                    !tourSlotInfo.testingActions.canTriggerRevenueTransfer ||
                    actionLoading
                  }
                  loading={actionLoading}
                  block>
                  Skip to Revenue Transfer
                </Button>
                <Paragraph type="secondary" style={{ textAlign: "center" }}>
                  Chuyển tiền từ revenue hold vào ví tour company (sau 3 ngày).
                </Paragraph>
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      {!tourSlotInfo && !searchLoading && (
        <Card>
          <Alert
            message="Chưa có dữ liệu"
            description="Vui lòng nhập một Tour Slot ID và nhấn 'Kiểm Tra' để xem thông tin và các hành động kiểm thử có sẵn."
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
          />
        </Card>
      )}
    </div>
  );
};

export default TourStatusManagement;
