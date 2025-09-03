import React, { useState, useEffect } from "react";
import {
  Modal,
  Table,
  Tag,
  Space,
  Descriptions,
  Card,
  Statistic,
  Row,
  Col,
  Typography,
  Spin,
  message,
  Empty,
  Button,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  tourSlotService,
  TourSlotWithBookingsDto,
  BookedUserInfo,
} from "../../services/tourSlotService";
import { useAuthStore } from "@/store/useAuthStore";
import { formatCurrency } from "../../utils/formatters";

const { Text } = Typography;

interface BookingsModalProps {
  visible: boolean;
  onCancel: () => void;
  slotId: string | null;
  slotInfo?: {
    tourDate: string;
    formattedDateWithDay: string;
    statusName: string;
  };
}

const BookingsModal: React.FC<BookingsModalProps> = ({
  visible,
  onCancel,
  slotId,
  slotInfo,
}) => {
  const [loading, setLoading] = useState(false);
  const [bookingsData, setBookingsData] =
    useState<TourSlotWithBookingsDto | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    if (visible && slotId) {
      loadBookingsData();
    }
  }, [visible, slotId]);

  const loadBookingsData = async () => {
    if (!slotId) return;

    setLoading(true);
    try {
      const response = await tourSlotService.getSlotWithTourDetailsAndBookings(
        slotId,
        token ?? undefined
      );

      // Map API response to expected format
      const mappedData = {
        ...response.data,
        bookings: response.data.bookings?.map((booking: any) => {
          // Convert string status to number if needed
          let statusNumber = booking.status;
          if (typeof booking.status === 'string') {
            switch (booking.status.toLowerCase()) {
              case 'pending':
                statusNumber = 0;
                break;
              case 'confirmed':
                statusNumber = 1;
                break;
              case 'completed':
                statusNumber = 4;
                break;
              case 'cancelled':
              case 'canceled':
                statusNumber = 2;
                break;
              default:
                statusNumber = booking.status; // Keep original if unknown
            }
          }

          return {
            id: booking.id,
            bookingId: booking.id,
            userId: booking.user?.id || '',
            userName: booking.user?.name || booking.contactName || '',
            userEmail: booking.user?.email || booking.contactEmail,
            contactName: booking.contactName,
            contactPhone: booking.contactPhone,
            contactEmail: booking.contactEmail,
            numberOfGuests: booking.numberOfGuests,
            totalPrice: booking.totalPrice,
            originalPrice: booking.originalPrice || booking.totalPrice,
            discountPercent: booking.discountPercent || 0,
            status: statusNumber, // Use converted number status
            statusName: booking.status, // Keep original string for reference
            bookingDate: booking.createdAt,
            confirmedDate: booking.confirmedDate,
            bookingCode: booking.bookingCode,
            customerNotes: booking.customerNotes
          };
        }) || []
      };

      console.log('Raw API response:', response.data);
      console.log('Mapped bookings data:', mappedData.bookings);

      setBookingsData(mappedData);
    } catch (error) {
      console.error("Error loading bookings data:", error);
      message.error("Không thể tải danh sách booking");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: number | string) => {
    // Handle both number and string status
    if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'completed':
          return "blue"; // Completed tours
        case 'confirmed':
          return "green"; // Confirmed bookings
        case 'pending':
          return "orange"; // Pending bookings
        case 'cancelled':
        case 'canceled':
          return "red";
        default:
          return "default";
      }
    }

    // Handle number status
    switch (status) {
      case 0:
        return "orange"; // Pending - Khách đặt tour
      case 1:
        return "green"; // Confirmed - Thanh toán/xác nhận
      case 4:
        return "blue"; // Completed - Tour hoàn thành
      case 2:
        return "red"; // Cancelled (if exists)
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Mã booking",
      dataIndex: "bookingCode",
      key: "bookingCode",
      render: (code: string) => (
        <Text strong style={{ color: "#1890ff" }}>
          {code}
        </Text>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_: any, record: BookedUserInfo) => (
        <Space direction="vertical" size="small">
          <Space>
            <UserOutlined />
            <Text strong>{record.contactName || record.userName}</Text>
          </Space>
          {record.contactPhone && (
            <Space>
              <PhoneOutlined />
              <Text>{record.contactPhone}</Text>
            </Space>
          )}
          {record.contactEmail && (
            <Space>
              <MailOutlined />
              <Text>{record.contactEmail}</Text>
            </Space>
          )}
        </Space>
      ),
    },
    {
      title: "Số khách",
      dataIndex: "numberOfGuests",
      key: "numberOfGuests",
      render: (guests: number) => (
        <Space>
          <TeamOutlined />
          <Text>{guests} khách</Text>
        </Space>
      ),
    },
    {
      title: "Giá tiền",
      key: "price",
      render: (_: any, record: BookedUserInfo) => (
        <Space direction="vertical" size="small">
          <Text strong style={{ color: "#52c41a" }}>
            {formatCurrency(record.totalPrice)}
          </Text>
          {record.discountPercent > 0 && (
            <Text type="secondary" delete>
              {formatCurrency(record.originalPrice)}
            </Text>
          )}
          {record.discountPercent > 0 && (
            <Tag color="red">-{record.discountPercent}%</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: number | string, record: BookedUserInfo) => {
        // Helper function to get icon based on status
        const getStatusIcon = (status: number | string) => {
          if (typeof status === 'string') {
            switch (status.toLowerCase()) {
              case 'completed':
                return <CheckCircleOutlined />; // Tour completed
              case 'confirmed':
                return <CheckCircleOutlined />; // Payment confirmed
              case 'pending':
                return <ClockCircleOutlined />; // Waiting for payment
              case 'cancelled':
              case 'canceled':
                return <CloseCircleOutlined />;
              default:
                return <ClockCircleOutlined />;
            }
          }

          // Handle number status
          switch (status) {
            case 0:
              return <ClockCircleOutlined />; // Pending - Khách đặt tour
            case 1:
              return <CheckCircleOutlined />; // Confirmed - Thanh toán/xác nhận
            case 4:
              return <CheckCircleOutlined />; // Completed - Tour hoàn thành
            case 2:
              return <CloseCircleOutlined />; // Cancelled (if exists)
            default:
              return <ClockCircleOutlined />;
          }
        };

        // Helper function to get Vietnamese status name
        const getVietnameseStatusName = (status: number | string) => {
          if (typeof status === 'string') {
            switch (status.toLowerCase()) {
              case 'completed':
                return 'Tour hoàn thành';
              case 'confirmed':
                return 'Đã xác nhận';
              case 'pending':
                return 'Chờ thanh toán';
              case 'cancelled':
              case 'canceled':
                return 'Đã hủy';
              default:
                return status;
            }
          }

          // Handle number status
          switch (status) {
            case 0:
              return 'Chờ thanh toán'; // Pending - Khách đặt tour
            case 1:
              return 'Đã xác nhận'; // Confirmed - Thanh toán/xác nhận
            case 4:
              return 'Tour hoàn thành'; // Completed - Tour hoàn thành
            case 2:
              return 'Đã hủy'; // Cancelled (if exists)
            default:
              return 'Không xác định';
          }
        };

        return (
          <Tag
            color={getStatusColor(status)}
            icon={getStatusIcon(status)}>
            {record.statusName || getVietnameseStatusName(status)}
          </Tag>
        );
      },
    },
    {
      title: "Ngày đặt",
      dataIndex: "bookingDate",
      key: "bookingDate",
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          <Text>{new Date(date).toLocaleDateString("vi-VN")}</Text>
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any) => (
        <Tooltip title="Xem chi tiết booking">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              // TODO: Implement view booking detail
              message.info("Chức năng xem chi tiết booking sẽ được phát triển");
            }}>
            Chi tiết
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <TeamOutlined />
          <span>Danh sách người đặt tour</span>
          {slotInfo && <Tag color="blue">{slotInfo.formattedDateWithDay}</Tag>}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1200}
      style={{ top: 20 }}>
      <Spin spinning={loading}>
        {bookingsData ? (
          <div>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Tổng booking"
                    value={bookingsData.statistics?.totalBookings || 0}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Tổng khách"
                    value={bookingsData.statistics?.totalGuests || 0}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Doanh thu"
                    value={bookingsData.statistics?.totalRevenue || 0}
                    prefix={<DollarOutlined />}
                    formatter={(value) => formatCurrency(Number(value))}
                    valueStyle={{ color: "#fa8c16" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Tỷ lệ lấp đầy"
                    value={bookingsData.statistics?.occupancyRate || 0}
                    suffix="%"
                    precision={1}
                    valueStyle={{ color: "#722ed1" }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Tour Details Info */}
            {(bookingsData.tourDetails || bookingsData.tourOperation) && (
              <Card title="Thông tin tour" style={{ marginBottom: 16 }}>
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Tên tour">
                    {bookingsData.tourDetails?.title || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giá tour">
                    {bookingsData.tourOperation?.price
                      ? formatCurrency(bookingsData.tourOperation.price)
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số khách tối đa">
                    {bookingsData.tourOperation?.maxGuests || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Còn trống">
                    {bookingsData.tourOperation?.maxGuests &&
                      bookingsData.tourOperation?.currentBookings !== undefined
                      ? bookingsData.tourOperation.maxGuests -
                      bookingsData.tourOperation.currentBookings
                      : 0}{" "}
                    chỗ
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* Bookings Table */}
            <Card title="Danh sách booking">
              {bookingsData.bookings && bookingsData.bookings.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={bookingsData.bookings}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `Tổng ${total} booking`,
                  }}
                />
              ) : (
                <Empty
                  description="Chưa có booking nào cho slot này"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </div>
        ) : (
          <Empty description="Không có dữ liệu" />
        )}
      </Spin>
    </Modal>
  );
};

export default BookingsModal;
