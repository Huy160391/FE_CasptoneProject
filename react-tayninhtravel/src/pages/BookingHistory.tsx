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
    Switch,
    Table,
    Tooltip
} from 'antd';
import {
    EyeOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import {
    getMyBookings
} from '../services/tourBookingService';
import { formatCurrency } from '../services/paymentService';
import { hasIndividualQRs, TourBookingDto, BookingStatus } from '../types/individualQR';
import IndividualQRDisplay from '../components/common/IndividualQRDisplay';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface BookingHistoryProps {
    data?: Array<any>; // Keep for backward compatibility
}

const getStatusText = (status: BookingStatus): string => {
    switch (status) {
        case BookingStatus.Pending:
            return 'Chờ thanh toán';
        case BookingStatus.Confirmed:
            return 'Đã xác nhận';
        case BookingStatus.Cancelled:
            return 'Đã hủy';
        case BookingStatus.Completed:
            return 'Hoàn thành';
        case BookingStatus.Refunded:
            return 'Đã hoàn tiền';
        default:
            return 'Không xác định';
    }
};

const getStatusColor = (status: BookingStatus): string => {
    switch (status) {
        case BookingStatus.Pending:
            return 'orange';
        case BookingStatus.Confirmed:
            return 'green';
        case BookingStatus.Cancelled:
            return 'red';
        case BookingStatus.Completed:
            return 'blue';
        case BookingStatus.Refunded:
            return 'purple';
        default:
            return 'default';
    }
};

const BookingHistory: React.FC<BookingHistoryProps> = ({ data }) => {
    const { t } = useTranslation();
    const { token, isAuthenticated } = useAuthStore();

    const [bookings, setBookings] = useState<TourBookingDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Filters
    const [searchKeyword, setSearchKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState<BookingStatus | undefined>(undefined);
    const [includeInactive, setIncludeInactive] = useState(true);

    // Modal
    const [selectedBooking, setSelectedBooking] = useState<TourBookingDto | null>(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

    // Load bookings
    const loadBookings = async (page = 1, keyword = '', status?: BookingStatus, includeInactiveBookings = includeInactive) => {
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
                status,
                includeInactive: includeInactiveBookings
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
    }, [token, isAuthenticated, includeInactive]);

    const handleSearch = (value: string) => {
        setSearchKeyword(value);
        setCurrentPage(1);
        loadBookings(1, value, statusFilter, includeInactive);
    };

    const handleStatusFilter = (status: BookingStatus | undefined) => {
        setStatusFilter(status);
        setCurrentPage(1);
        loadBookings(1, searchKeyword, status, includeInactive);
    };

    const handlePageChange = (page: number, size?: number) => {
        if (size && size !== pageSize) {
            setPageSize(size);
        }
        loadBookings(page, searchKeyword, statusFilter, includeInactive);
    };

    const handleIncludeInactiveChange = (checked: boolean) => {
        setIncludeInactive(checked);
        setCurrentPage(1);
        loadBookings(1, searchKeyword, statusFilter, checked);
    };

    const handleViewDetail = (booking: TourBookingDto) => {
        setSelectedBooking(booking);
        setIsDetailModalVisible(true);
    };

    const handleRefresh = () => {
        loadBookings(currentPage, searchKeyword, statusFilter, includeInactive);
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
                    <Title level={4}>
                        📅 {t('bookingHistory.title', 'Lịch sử đặt tour')}
                    </Title>
                    <Text type="secondary">
                        {t('bookingHistory.description', 'Quản lý và theo dõi các tour du lịch bạn đã đặt')}
                    </Text>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <Row gutter={16} align="middle">
                        <Col xs={24} sm={12} md={8}>
                            <Search
                                placeholder={t('bookingHistory.searchPlaceholder', 'Tìm kiếm theo tên tour, mã đặt tour...')}
                                allowClear
                                onSearch={handleSearch}
                                style={{ width: '100%' }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                placeholder={t('bookingHistory.filterByStatus', 'Lọc theo trạng thái')}
                                allowClear
                                style={{ width: '100%' }}
                                onChange={handleStatusFilter}
                                value={statusFilter}
                            >
                                <Option value={BookingStatus.Pending}>{t('bookingHistory.statuses.pending', 'Chờ thanh toán')}</Option>
                                <Option value={BookingStatus.Confirmed}>{t('bookingHistory.statuses.confirmed', 'Đã xác nhận')}</Option>
                                <Option value={BookingStatus.Completed}>{t('bookingHistory.statuses.completed', 'Đã hoàn thành')}</Option>
                                <Option value={BookingStatus.CancelledByCustomer}>{t('bookingHistory.statuses.cancelled', 'Đã hủy')}</Option>
                                <Option value={BookingStatus.Refunded}>{t('bookingHistory.statuses.refunded', 'Đã hoàn tiền')}</Option>

                            </Select>
                        </Col>
                        <Col xs={24} sm={24} md={10} style={{ textAlign: 'right' }}>
                            <Space wrap>
                                <Space>
                                    <Text>{t('bookingHistory.showCancelled', 'Hiển thị đã hủy')}:</Text>
                                    <Switch
                                        checked={includeInactive}
                                        onChange={handleIncludeInactiveChange}
                                        size="small"
                                    />
                                </Space>
                                <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                                    {t('common.refresh', 'Làm mới')}
                                </Button>
                                <Text type="secondary">
                                    {t('bookingHistory.total', 'Tổng')}: {totalCount} {t('bookingHistory.bookings', 'đặt tour')}
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
                ) : (
                    <>
                        <Table
                            dataSource={bookings}
                            rowKey="id"
                            pagination={false}
                            scroll={{ x: 1200 }}
                            locale={{
                                emptyText: bookings.length === 0 ? (
                                    <Empty
                                        description="Bạn chưa có đặt tour nào"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                ) : undefined
                            }}
                            columns={[
                                {
                                    title: t('bookingHistory.columns.bookingCode', 'Mã đặt tour'),
                                    dataIndex: 'bookingCode',
                                    key: 'bookingCode',
                                    width: 150,
                                    render: (text) => <Text strong>{text}</Text>
                                },
                                {
                                    title: t('bookingHistory.columns.tourName', 'Tên tour'),
                                    dataIndex: ['tourOperation', 'tourTitle'],
                                    key: 'tourTitle',
                                    width: 200,
                                    render: (text, record) => (
                                        <div>
                                            <Text strong>{text || 'Tour'}</Text>
                                            {record.tourOperation?.guideName && (
                                                <div>
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        {t('bookingHistory.guide', 'HDV')}: {record.tourOperation.guideName}
                                                    </Text>
                                                </div>
                                            )}
                                        </div>
                                    )
                                },
                                {
                                    title: t('bookingHistory.columns.tourDate', 'Ngày tour'),
                                    dataIndex: ['tourOperation', 'tourDate'],
                                    key: 'tourDate',
                                    width: 110,
                                    render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'
                                },
                                {
                                    title: t('bookingHistory.columns.guestCount', 'Số khách'),
                                    dataIndex: 'numberOfGuests',
                                    key: 'numberOfGuests',
                                    width: 80,
                                    align: 'center',
                                    render: (guests, record) => (
                                        <div>
                                            <Text strong>{guests}</Text>
                                            <div style={{ fontSize: '11px', color: '#666' }}>
                                                {record.adultCount}NL, {record.childCount}TE
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    title: t('bookingHistory.columns.totalAmount', 'Tổng tiền'),
                                    dataIndex: 'totalPrice',
                                    key: 'totalPrice',
                                    width: 120,
                                    align: 'right',
                                    render: (price) => (
                                        <Text strong style={{ color: '#f5222d' }}>
                                            {formatCurrency(price)}
                                        </Text>
                                    )
                                },
                                {
                                    title: t('bookingHistory.columns.status', 'Trạng thái'),
                                    dataIndex: 'statusName',
                                    key: 'status',
                                    width: 150,
                                    render: (statusName, record) => {
                                        const color = getBookingStatusColor(record.status);
                                        const displayText = statusName || getBookingStatusText(record.status);

                                        if (displayText && displayText.length > 15) {
                                            return (
                                                <Tooltip title={displayText}>
                                                    <Tag color={color}>
                                                        {displayText.substring(0, 15)}...
                                                    </Tag>
                                                </Tooltip>
                                            );
                                        }

                                        return (
                                            <Tag color={color}>
                                                {displayText}
                                            </Tag>
                                        );
                                    }
                                },
                                {
                                    title: t('bookingHistory.columns.bookingDate', 'Ngày đặt'),
                                    dataIndex: 'bookingDate',
                                    key: 'bookingDate',
                                    width: 110,
                                    render: (date) => new Date(date).toLocaleDateString('vi-VN')
                                },
                                {
                                    title: t('bookingHistory.columns.actions', 'Thao tác'),
                                    key: 'actions',
                                    width: 100,
                                    fixed: 'right',
                                    render: (_, record) => (
                                        <Button
                                            type="link"
                                            icon={<EyeOutlined />}
                                            onClick={() => handleViewDetail(record)}
                                            size="small"
                                        >
                                            {t('bookingHistory.viewDetails', 'Chi tiết')}
                                        </Button>
                                    )
                                }
                            ]}
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

                            {selectedBooking.tourOperation?.tourTitle && (
                                <Descriptions.Item label="Mô tả tour">
                                    {selectedBooking.tourOperation.tourTitle}
                                </Descriptions.Item>
                            )}

                            {selectedBooking.tourOperation?.tourSlotDate && (
                                <Descriptions.Item label="Ngày tour">
                                    {new Date(selectedBooking.tourOperation.tourSlotDate).toLocaleDateString('vi-VN')}
                                </Descriptions.Item>
                            )}

                            {selectedBooking.tourOperation?.guideName && (
                                <Descriptions.Item label="Hướng dẫn viên">
                                    {selectedBooking.tourOperation.guideName}
                                    {selectedBooking.tourOperation.guidePhone && (
                                        <Text type="secondary"> - {selectedBooking.tourOperation.guidePhone}</Text>
                                    )}
                                </Descriptions.Item>
                            )}

                            <Descriptions.Item label="Trạng thái">

                                <Tag color={getBookingStatusColor(selectedBooking.status)}>
                                    {selectedBooking.statusName || getBookingStatusText(selectedBooking.status)}

                                </Tag>
                            </Descriptions.Item>

                            <Descriptions.Item label="Số lượng khách">
                                {selectedBooking.numberOfGuests} người
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

                        {/* ✅ NEW: Individual QR System Display */}
                        {hasIndividualQRs(selectedBooking) ? (
                            <div style={{ marginTop: 24 }}>
                                <IndividualQRDisplay
                                    guests={selectedBooking.guests || []}
                                    bookingCode={selectedBooking.bookingCode}
                                    tourTitle={selectedBooking.tourOperation?.tourTitle}
                                    totalPrice={selectedBooking.totalPrice}
                                    tourDate={selectedBooking.tourOperation?.tourSlotDate}
                                />
                            </div>
                        ) : selectedBooking.qrCodeData ? (
                            /* 🔄 LEGACY: Old QR System (backward compatibility) */
                            <div style={{ marginTop: 16, textAlign: 'center' }}>
                                <Title level={5}>QR Code check-in (Legacy)</Title>
                                <div style={{ padding: 16, border: '1px dashed #d9d9d9', borderRadius: 8 }}>
                                    <Text type="secondary">QR Code sẽ được hiển thị khi tour được xác nhận</Text>
                                </div>
                            </div>
                        ) : (
                            /* No QR codes available */
                            <div style={{ marginTop: 16, textAlign: 'center' }}>
                                <div style={{ padding: 16, border: '1px dashed #d9d9d9', borderRadius: 8 }}>
                                    <Text type="secondary">QR Code sẽ được tạo sau khi thanh toán thành công</Text>
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
