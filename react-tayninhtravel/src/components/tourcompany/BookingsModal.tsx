import React, { useState, useEffect } from 'react';
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
    Tooltip
} from 'antd';
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
    EyeOutlined
} from '@ant-design/icons';
import { tourSlotService, TourSlotWithBookingsDto, BookedUserInfo } from '../../services/tourSlotService';
import { useAuthStore } from '@/store/useAuthStore';
import { formatCurrency } from '../../utils/formatters';

const { Title, Text } = Typography;

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
    slotInfo
}) => {
    const [loading, setLoading] = useState(false);
    const [bookingsData, setBookingsData] = useState<TourSlotWithBookingsDto | null>(null);
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
            const response = await tourSlotService.getSlotWithTourDetailsAndBookings(slotId, token ?? undefined);
            setBookingsData(response.data);
        } catch (error) {
            console.error('Error loading bookings data:', error);
            message.error('Không thể tải danh sách booking');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: number) => {
        switch (status) {
            case 1: return 'green'; // Confirmed
            case 0: return 'orange'; // Pending
            case 2: return 'red'; // Cancelled
            default: return 'default';
        }
    };

    const columns = [
        {
            title: 'Mã booking',
            dataIndex: 'bookingCode',
            key: 'bookingCode',
            render: (code: string) => (
                <Text strong style={{ color: '#1890ff' }}>{code}</Text>
            ),
        },
        {
            title: 'Khách hàng',
            key: 'customer',
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
            title: 'Số khách',
            dataIndex: 'numberOfGuests',
            key: 'numberOfGuests',
            render: (guests: number) => (
                <Space>
                    <TeamOutlined />
                    <Text>{guests} khách</Text>
                </Space>
            ),
        },
        {
            title: 'Giá tiền',
            key: 'price',
            render: (_: any, record: BookedUserInfo) => (
                <Space direction="vertical" size="small">
                    <Text strong style={{ color: '#52c41a' }}>
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
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: number, record: BookedUserInfo) => (
                <Tag color={getStatusColor(status)} icon={
                    status === 1 ? <CheckCircleOutlined /> :
                    status === 0 ? <ClockCircleOutlined /> :
                    <CloseCircleOutlined />
                }>
                    {record.statusName}
                </Tag>
            ),
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'bookingDate',
            key: 'bookingDate',
            render: (date: string) => (
                <Space>
                    <CalendarOutlined />
                    <Text>{new Date(date).toLocaleDateString('vi-VN')}</Text>
                </Space>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_: any, record: BookedUserInfo) => (
                <Tooltip title="Xem chi tiết booking">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            // TODO: Implement view booking detail
                            message.info('Chức năng xem chi tiết booking sẽ được phát triển');
                        }}
                    >
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
                    {slotInfo && (
                        <Tag color="blue">{slotInfo.formattedDateWithDay}</Tag>
                    )}
                </Space>
            }
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={1200}
            style={{ top: 20 }}
        >
            <Spin spinning={loading}>
                {bookingsData ? (
                    <div>
                        {/* Statistics Cards */}
                        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Tổng booking"
                                        value={bookingsData.statistics.totalBookings}
                                        prefix={<TeamOutlined />}
                                        valueStyle={{ color: '#1890ff' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Tổng khách"
                                        value={bookingsData.statistics.totalGuests}
                                        prefix={<UserOutlined />}
                                        valueStyle={{ color: '#52c41a' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Doanh thu"
                                        value={bookingsData.statistics.totalRevenue}
                                        prefix={<DollarOutlined />}
                                        formatter={(value) => formatCurrency(Number(value))}
                                        valueStyle={{ color: '#fa8c16' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Tỷ lệ lấp đầy"
                                        value={bookingsData.statistics.occupancyRate}
                                        suffix="%"
                                        precision={1}
                                        valueStyle={{ color: '#722ed1' }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Tour Details Info */}
                        {bookingsData.tourDetails && (
                            <Card title="Thông tin tour" style={{ marginBottom: 16 }}>
                                <Descriptions column={2} bordered>
                                    <Descriptions.Item label="Tên tour">
                                        {bookingsData.tourDetails.title}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Giá tour">
                                        {formatCurrency(bookingsData.tourDetails.tourOperation.price)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số khách tối đa">
                                        {bookingsData.tourDetails.tourOperation.maxGuests}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Còn trống">
                                        {bookingsData.tourDetails.tourOperation.availableSpots} chỗ
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        )}

                        {/* Bookings Table */}
                        <Card title="Danh sách booking">
                            {bookingsData.bookedUsers.length > 0 ? (
                                <Table
                                    columns={columns}
                                    dataSource={bookingsData.bookedUsers}
                                    rowKey="bookingId"
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
