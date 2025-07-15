import React, { useEffect, useState } from 'react';
import {
    Card,
    List,
    Tag,
    Button,
    Space,
    Typography,
    Spin,
    Alert,
    Empty,
    Pagination,
    Input,
    Select,
    Row,
    Col,
    Descriptions,
    Modal,
    message
} from 'antd';
import {
    CalendarOutlined,
    DollarOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    EyeOutlined,
    ReloadOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import {
    getMyBookings,
    TourBooking,
    BookingStatus,
    getBookingStatusText,
    getBookingStatusColor
} from '../services/tourBookingService';
import { formatCurrency } from '../services/paymentService';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface BookingHistoryProps {
    data?: Array<any>; // Keep for backward compatibility
}

const BookingHistory: React.FC<BookingHistoryProps> = ({ data }) => {
    const { t } = useTranslation();
    const { token, isAuthenticated } = useAuthStore();

    const [bookings, setBookings] = useState<TourBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Filters
    const [searchKeyword, setSearchKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>(undefined);

    // Modal
    const [selectedBooking, setSelectedBooking] = useState<TourBooking | null>(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

    // Load bookings
    const loadBookings = async (page = 1, keyword = '', status?: BookingStatus) => {
        if (!token || !isAuthenticated) {
            setError('Vui lòng đăng nhập để xem lịch sử đặt tour');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await getMyBookings(token, {
                pageIndex: page - 1, // API uses 0-based indexing
                pageSize,
                searchKeyword: keyword || undefined,
                status
            });

            if (response.success && response.data) {
                setBookings(response.data.items);
                setTotalCount(response.data.totalCount);
                setCurrentPage(page);
            } else {
                setError(response.message || 'Không thể tải lịch sử đặt tour');
            }
        } catch (error: any) {
            console.error('Error loading bookings:', error);
            setError(error.message || 'Có lỗi xảy ra khi tải lịch sử đặt tour');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, [token, isAuthenticated]);

    const handleSearch = (value: string) => {
        setSearchKeyword(value);
        setCurrentPage(1);
        loadBookings(1, value, statusFilter);
    };

    const handleStatusFilter = (status: BookingStatus | undefined) => {
        setStatusFilter(status);
        setCurrentPage(1);
        loadBookings(1, searchKeyword, status);
    };

    const handlePageChange = (page: number, size?: number) => {
        if (size && size !== pageSize) {
            setPageSize(size);
        }
        loadBookings(page, searchKeyword, statusFilter);
    };

    const handleViewDetail = (booking: TourBooking) => {
        setSelectedBooking(booking);
        setIsDetailModalVisible(true);
    };

    const handleRefresh = () => {
        loadBookings(currentPage, searchKeyword, statusFilter);
    };

    // If using legacy data prop
    if (data) {
        return (
            <List
                itemLayout="horizontal"
                dataSource={data}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            title={item.tourName}
                            description={
                                <>
                                    <div>{t('profile.bookingDate')}: {item.date}</div>
                                    <div>{t('profile.price')}: {item.price}</div>
                                    <Tag color={item.status === 'completed' ? 'green' : 'blue'}>
                                        {item.status === 'completed' ? t('profile.completed') : t('profile.upcoming')}
                                    </Tag>
                                </>
                            }
                        />
                    </List.Item>
                )}
            />
        );
    }

    if (!isAuthenticated) {
        return (
            <Alert
                message="Vui lòng đăng nhập"
                description="Bạn cần đăng nhập để xem lịch sử đặt tour"
                type="warning"
                showIcon
            />
        );
    }

    return (
        <div>
            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Row gutter={16} align="middle">
                        <Col xs={24} sm={12} md={8}>
                            <Search
                                placeholder="Tìm kiếm theo tên tour, mã đặt tour..."
                                allowClear
                                onSearch={handleSearch}
                                style={{ width: '100%' }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder="Lọc theo trạng thái"
                                allowClear
                                style={{ width: '100%' }}
                                onChange={handleStatusFilter}
                                value={statusFilter}
                            >
                                <Option value={BookingStatus.Pending}>Chờ thanh toán</Option>
                                <Option value={BookingStatus.Confirmed}>Đã xác nhận</Option>
                                <Option value={BookingStatus.Completed}>Đã hoàn thành</Option>
                                <Option value={BookingStatus.CancelledByCustomer}>Đã hủy</Option>
                                <Option value={BookingStatus.Refunded}>Đã hoàn tiền</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={24} md={10} style={{ textAlign: 'right' }}>
                            <Space>
                                <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                                    Làm mới
                                </Button>
                                <Text type="secondary">
                                    Tổng: {totalCount} đặt tour
                                </Text>
                            </Space>
                        </Col>
                    </Row>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Spin size="large" />
                    </div>
                ) : error ? (
                    <Alert
                        message="Có lỗi xảy ra"
                        description={error}
                        type="error"
                        showIcon
                        action={
                            <Button size="small" onClick={handleRefresh}>
                                Thử lại
                            </Button>
                        }
                    />
                ) : bookings.length === 0 ? (
                    <Empty
                        description="Bạn chưa có đặt tour nào"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <>
                        <List
                            itemLayout="vertical"
                            dataSource={bookings}
                            renderItem={(booking) => (
                                <List.Item
                                    key={booking.id}
                                    actions={[
                                        <Button
                                            key="view"
                                            type="link"
                                            icon={<EyeOutlined />}
                                            onClick={() => handleViewDetail(booking)}
                                        >
                                            Xem chi tiết
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={
                                            <Space>
                                                <Text strong>{booking.tourOperation?.tourTitle || 'Tour'}</Text>
                                                <Tag color={getBookingStatusColor(booking.status)}>
                                                    {getBookingStatusText(booking.status)}
                                                </Tag>
                                            </Space>
                                        }
                                        description={
                                            <Space direction="vertical" size="small">
                                                <Text>
                                                    <CalendarOutlined /> Ngày đặt: {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                                                </Text>
                                                <Text>
                                                    <UserOutlined /> Số khách: {booking.numberOfGuests} người
                                                </Text>
                                                <Text>
                                                    <DollarOutlined /> Tổng tiền: <Text strong style={{ color: '#f5222d' }}>
                                                        {formatCurrency(booking.totalPrice)}
                                                    </Text>
                                                </Text>
                                                <Text type="secondary">
                                                    Mã đặt tour: {booking.bookingCode}
                                                </Text>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />

                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <Pagination
                                current={currentPage}
                                total={totalCount}
                                pageSize={pageSize}
                                showSizeChanger
                                showQuickJumper
                                showTotal={(total, range) =>
                                    `${range[0]}-${range[1]} của ${total} đặt tour`
                                }
                                onChange={handlePageChange}
                                onShowSizeChange={handlePageChange}
                            />
                        </div>
                    </>
                )}
            </Card>

            {/* Booking Detail Modal */}
            <Modal
                title="Chi tiết đặt tour"
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={800}
            >
                {selectedBooking && (
                    <div>
                        <Descriptions title="Thông tin đặt tour" column={1} bordered>
                            <Descriptions.Item label="Mã đặt tour">
                                <Text strong>{selectedBooking.bookingCode}</Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Tên tour">
                                {selectedBooking.tourOperation?.tourTitle || 'N/A'}
                            </Descriptions.Item>

                            <Descriptions.Item label="Trạng thái">
                                <Tag color={getBookingStatusColor(selectedBooking.status)}>
                                    {getBookingStatusText(selectedBooking.status)}
                                </Tag>
                            </Descriptions.Item>

                            <Descriptions.Item label="Số lượng khách">
                                {selectedBooking.numberOfGuests} người
                                ({selectedBooking.adultCount} người lớn, {selectedBooking.childCount} trẻ em)
                            </Descriptions.Item>

                            <Descriptions.Item label="Giá gốc">
                                {formatCurrency(selectedBooking.originalPrice)}
                            </Descriptions.Item>

                            {selectedBooking.discountPercent > 0 && (
                                <Descriptions.Item label="Giảm giá">
                                    {selectedBooking.discountPercent}%
                                </Descriptions.Item>
                            )}

                            <Descriptions.Item label="Tổng tiền">
                                <Text strong style={{ color: '#f5222d', fontSize: '16px' }}>
                                    {formatCurrency(selectedBooking.totalPrice)}
                                </Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Ngày đặt">
                                {new Date(selectedBooking.bookingDate).toLocaleString('vi-VN')}
                            </Descriptions.Item>

                            {selectedBooking.confirmedDate && (
                                <Descriptions.Item label="Ngày xác nhận">
                                    {new Date(selectedBooking.confirmedDate).toLocaleString('vi-VN')}
                                </Descriptions.Item>
                            )}

                            {selectedBooking.cancelledDate && (
                                <Descriptions.Item label="Ngày hủy">
                                    {new Date(selectedBooking.cancelledDate).toLocaleString('vi-VN')}
                                </Descriptions.Item>
                            )}

                            {selectedBooking.cancellationReason && (
                                <Descriptions.Item label="Lý do hủy">
                                    {selectedBooking.cancellationReason}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        <Descriptions title="Thông tin liên hệ" column={1} bordered style={{ marginTop: 16 }}>
                            <Descriptions.Item label="Tên người liên hệ">
                                {selectedBooking.contactName || 'N/A'}
                            </Descriptions.Item>

                            <Descriptions.Item label="Số điện thoại">
                                {selectedBooking.contactPhone || 'N/A'}
                            </Descriptions.Item>

                            <Descriptions.Item label="Email">
                                {selectedBooking.contactEmail || 'N/A'}
                            </Descriptions.Item>

                            {selectedBooking.customerNotes && (
                                <Descriptions.Item label="Ghi chú khách hàng">
                                    {selectedBooking.customerNotes}
                                </Descriptions.Item>
                            )}

                            {selectedBooking.specialRequests && (
                                <Descriptions.Item label="Yêu cầu đặc biệt">
                                    {selectedBooking.specialRequests}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        {selectedBooking.payOsOrderCode && (
                            <Descriptions title="Thông tin thanh toán" column={1} bordered style={{ marginTop: 16 }}>
                                <Descriptions.Item label="Mã giao dịch PayOS">
                                    <Text code>{selectedBooking.payOsOrderCode}</Text>
                                </Descriptions.Item>
                            </Descriptions>
                        )}

                        {selectedBooking.qrCodeData && (
                            <div style={{ marginTop: 16, textAlign: 'center' }}>
                                <Title level={5}>QR Code check-in</Title>
                                <div style={{ padding: 16, border: '1px dashed #d9d9d9', borderRadius: 8 }}>
                                    <Text type="secondary">QR Code sẽ được hiển thị khi tour được xác nhận</Text>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default BookingHistory;
