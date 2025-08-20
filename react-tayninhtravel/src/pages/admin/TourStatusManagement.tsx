import React, { useState } from "react";
import {
  Card,
  Input,
  Button,
  Select,
  Modal,
  message,
  Typography,
  Space,
  Descriptions,
  Tag,
  Alert,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { adminService } from "../../services/adminService";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

interface TourSlot {
  id: string;
  tourName: string;
  startDate: string;
  endDate: string;
  status: string;
  currentBookings: number;
  maxGuests: number;
  createdAt: string;
  updatedAt: string;
  hasOperations: boolean;
}

const TourStatusManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [tourSlotId, setTourSlotId] = useState("");
  const [tourSlot, setTourSlot] = useState<TourSlot | null>(null);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const handleSearch = async () => {
    if (!tourSlotId.trim()) {
      message.warning("Vui lòng nhập Tour Slot ID");
      return;
    }

    try {
      setSearchLoading(true);
      const response = await adminService.getTourSlotById(tourSlotId);

      if (response.success && response.data) {
        setTourSlot(response.data);
        message.success("Tìm thấy tour slot");
      } else {
        setTourSlot(null);
        message.error(
          response.message || "Không tìm thấy tour slot với ID này"
        );
      }
    } catch (error) {
      console.error("Error searching tour slot:", error);
      message.error("Có lỗi xảy ra khi tìm kiếm tour slot");
      setTourSlot(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleUpdateStatus = () => {
    if (!tourSlot) return;
    setSelectedStatus(tourSlot.status);
    setUpdateModalVisible(true);
  };

  const handleConfirmUpdate = async () => {
    if (!tourSlot || !selectedStatus) return;

    if (selectedStatus === tourSlot.status) {
      message.warning("Trạng thái mới phải khác trạng thái hiện tại");
      return;
    }

    confirm({
      title: "Xác nhận thay đổi trạng thái",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn thay đổi trạng thái tour slot này?</p>
          <p>
            <strong>Từ:</strong>{" "}
            <Tag color={getStatusColor(tourSlot.status)}>
              {getStatusText(tourSlot.status)}
            </Tag>
          </p>
          <p>
            <strong>Thành:</strong>{" "}
            <Tag color={getStatusColor(selectedStatus)}>
              {getStatusText(selectedStatus)}
            </Tag>
          </p>
          <Alert
            message="Lưu ý"
            description="Thay đổi trạng thái có thể ảnh hưởng đến các booking và operations hiện có."
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        </div>
      ),
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true);
          const response = await adminService.updateTourSlotStatus(
            tourSlot.id,
            selectedStatus
          );

          if (response.success) {
            // Update local state
            setTourSlot({
              ...tourSlot,
              status: selectedStatus,
              updatedAt: new Date().toISOString(),
            });

            message.success(
              response.message || "Cập nhật trạng thái thành công"
            );
            setUpdateModalVisible(false);
          } else {
            message.error(
              response.message || "Có lỗi xảy ra khi cập nhật trạng thái"
            );
          }
        } catch (error) {
          console.error("Error updating tour slot status:", error);
          message.error("Có lỗi xảy ra khi cập nhật trạng thái");
        } finally {
          setLoading(false);
        }
      },
    });
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
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>
          <EditOutlined style={{ marginRight: "8px" }} />
          Quản Lý Trạng Thái Tour
        </Title>
        <Text type="secondary">
          Tìm kiếm và thay đổi trạng thái của tour slots để phục vụ kiểm thử
        </Text>
      </div>

      {/* Search Section */}
      <Card title="Tìm Kiếm Tour Slot" style={{ marginBottom: "24px" }}>
        <Space.Compact style={{ width: "100%", maxWidth: "600px" }}>
          <Input
            placeholder="Nhập Tour Slot ID (GUID)"
            value={tourSlotId}
            onChange={(e) => setTourSlotId(e.target.value)}
            onPressEnter={handleSearch}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={searchLoading}>
            Tìm kiếm
          </Button>
        </Space.Compact>
        <div style={{ marginTop: "8px" }}>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Ví dụ: 123e4567-e89b-12d3-a456-426614174000
          </Text>
        </div>
      </Card>

      {/* Tour Slot Details */}
      {tourSlot && (
        <Card
          title="Thông Tin Tour Slot"
          extra={
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleUpdateStatus}
              disabled={loading}>
              Thay Đổi Trạng Thái
            </Button>
          }
          style={{ marginBottom: "24px" }}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Tour Slot ID">
              <Text code>{tourSlot.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tên Tour">
              {tourSlot.tourName}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày Bắt Đầu">
              {dayjs(tourSlot.startDate).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày Kết Thúc">
              {dayjs(tourSlot.endDate).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng Thái">
              <Tag
                color={getStatusColor(tourSlot.status)}
                icon={getStatusIcon(tourSlot.status)}>
                {getStatusText(tourSlot.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Booking">
              <Text>
                {tourSlot.currentBookings} / {tourSlot.maxGuests} khách
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày Tạo">
              {dayjs(tourSlot.createdAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Cập Nhật Cuối">
              {dayjs(tourSlot.updatedAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Có Operations" span={2}>
              <Tag color={tourSlot.hasOperations ? "green" : "red"}>
                {tourSlot.hasOperations ? "Có" : "Không"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Update Status Modal */}
      <Modal
        title="Thay Đổi Trạng Thái Tour Slot"
        open={updateModalVisible}
        onCancel={() => setUpdateModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setUpdateModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="update"
            type="primary"
            onClick={handleConfirmUpdate}
            loading={loading}
            disabled={!selectedStatus || selectedStatus === tourSlot?.status}>
            Cập Nhật
          </Button>,
        ]}>
        <div style={{ marginBottom: "16px" }}>
          <Text strong>Tour hiện tại: </Text>
          <Text>{tourSlot?.tourName}</Text>
        </div>
        <div style={{ marginBottom: "16px" }}>
          <Text strong>Trạng thái hiện tại: </Text>
          <Tag color={getStatusColor(tourSlot?.status || "")}>
            {getStatusText(tourSlot?.status || "")}
          </Tag>
        </div>
        <div style={{ marginBottom: "16px" }}>
          <Text strong>Trạng thái mới:</Text>
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            style={{ width: "100%", marginTop: "8px" }}
            placeholder="Chọn trạng thái mới">
            <Option value="Available">
              <Tag color="green">Có sẵn</Tag>
            </Option>
            <Option value="FullyBooked">
              <Tag color="blue">Đã đầy</Tag>
            </Option>
            <Option value="InProgress">
              <Tag color="orange">Đang diễn ra</Tag>
            </Option>
            <Option value="Completed">
              <Tag color="purple">Hoàn thành</Tag>
            </Option>
            <Option value="Cancelled">
              <Tag color="red">Đã hủy</Tag>
            </Option>
          </Select>
        </div>
        <Alert
          message="Lưu ý quan trọng"
          description="Việc thay đổi trạng thái tour slot có thể ảnh hưởng đến các booking hiện có và quy trình kinh doanh. Vui lòng cân nhắc kỹ trước khi thực hiện."
          type="warning"
          showIcon
        />
      </Modal>
    </div>
  );
};

export default TourStatusManagement;
