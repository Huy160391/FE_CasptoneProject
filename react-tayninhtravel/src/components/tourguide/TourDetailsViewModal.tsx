import React, { useState, useEffect } from 'react';
import {
    Modal,
    Descriptions,
    Tag,
    Card,
    Row,
    Col,
    Divider,
    Alert,
    Spin,
    Tabs,
    Image,
    Space,
    Timeline as AntTimeline,
    Table,
    Button
} from 'antd';
import {
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import {
    getTourDetailsById,
    getTourOperationByDetailsId,
    handleApiError
} from '../../services/tourcompanyService';
import { tourSlotService, TourSlotDto } from '../../services/tourSlotService';
import {
    TourDetails,
    TourOperation,
    TimelineItem
} from '../../types/tour';
import {
    getTourDetailsStatusLabel,
    getStatusColor,
    getScheduleDayLabelFromString
} from '../../constants/tourTemplate';
import BookingsModal from '../tourcompany/BookingsModal';

const { TabPane } = Tabs;

interface TourDetailsViewModalProps {
    visible: boolean;
    tourDetailsId: string | null;
    onClose: () => void;
}

const TourDetailsViewModal: React.FC<TourDetailsViewModalProps> = ({
    visible,
    tourDetailsId,
    onClose
}) => {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [tourDetails, setTourDetails] = useState<TourDetails | null>(null);
    const [tourOperation, setTourOperation] = useState<TourOperation | null>(null);
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);
    const [activeTab, setActiveTab] = useState('details');
    const [tourSlots, setTourSlots] = useState<TourSlotDto[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [bookingsModalVisible, setBookingsModalVisible] = useState(false);
    const [selectedSlotForBookings, setSelectedSlotForBookings] = useState<TourSlotDto | null>(null);

    useEffect(() => {
        if (visible && tourDetailsId && token) {
            loadTourDetailsData();
        }
    }, [visible, tourDetailsId, token]);

    const loadTourDetailsData = async () => {
        if (!tourDetailsId || !token) return;

        setLoading(true);
        try {
            console.log('🔄 Loading tour details for ID:', tourDetailsId);

            // Load tour details
            const detailsResponse = await getTourDetailsById(tourDetailsId, token);
            console.log('📡 Tour details response:', detailsResponse);

            if (detailsResponse.success && detailsResponse.data) {
                setTourDetails(detailsResponse.data);
                // Timeline is in data.timeline array
                const timelineData = detailsResponse.data.timeline || [];
                console.log('📅 Timeline data:', timelineData);
                setTimeline(timelineData);
            }

            // Load tour operation
            const operationResponse = await getTourOperationByDetailsId(tourDetailsId, token);
            console.log('🚀 Tour operation response:', operationResponse);

            if (operationResponse.success && operationResponse.data) {
                setTourOperation(operationResponse.data);
            }

            // Load tour slots
            await loadTourSlots();
        } catch (error) {
            console.error('❌ Error loading tour details:', error);
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const loadTourSlots = async () => {
        if (!tourDetailsId || !token) {
            console.log('🚫 Cannot load tour slots - missing tourDetailsId or token:', { tourDetailsId, token: !!token });
            return;
        }

        console.log('🎯 Loading tour slots for tourDetailsId:', tourDetailsId);
        setSlotsLoading(true);
        try {
            const response = await tourSlotService.getSlotsByTourDetails(tourDetailsId, token);
            console.log('📊 Tour slots response:', response);
            if (response.success && response.data) {
                console.log('✅ Setting tour slots data:', response.data);
                setTourSlots(response.data);
            } else {
                console.log('❌ Tour slots response not successful or no data:', response);
            }
        } catch (error) {
            console.error('❌ Error loading tour slots:', error);
        } finally {
            setSlotsLoading(false);
        }
    };

    const renderDetailsTab = () => (
        <div>
            {tourDetails && (
                <>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card title="Thông tin cơ bản" size="small">
                                <Descriptions column={2} size="small">
                                    <Descriptions.Item label="Tên tour">
                                        {tourDetails.title}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Trạng thái">
                                        <Tag color={getStatusColor(tourDetails.status)}>
                                            {getTourDetailsStatusLabel(tourDetails.status)}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Template">
                                        {tourDetails.tourTemplateName}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Công ty">
                                        {(tourDetails as any).tourCompanyName || 'N/A'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Điểm khởi hành">
                                        {tourDetails.startLocation}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Điểm kết thúc">
                                        {tourDetails.endLocation}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày trong tuần">
                                        {getScheduleDayLabelFromString(tourDetails.scheduleDays || '')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Kỹ năng yêu cầu">
                                        {tourDetails.skillsRequired}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Giá">
                                        {tourOperation?.price?.toLocaleString('vi-VN')} VNĐ
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số lượng tối đa">
                                        {tourOperation?.maxSeats} khách
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>
                    </Row>

                    <Divider />

                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card title="Mô tả" size="small">
                                <p>{tourDetails.description}</p>
                            </Card>
                        </Col>
                    </Row>

                    {tourDetails.imageUrls && tourDetails.imageUrls.length > 0 && (
                        <>
                            <Divider />
                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <Card title="Hình ảnh" size="small">
                                        <Space wrap>
                                            {tourDetails.imageUrls.map((image, index) => (
                                                <Image
                                                    key={index}
                                                    width={200}
                                                    src={image}
                                                    alt={`Tour image ${index + 1}`}
                                                />
                                            ))}
                                        </Space>
                                    </Card>
                                </Col>
                            </Row>
                        </>
                    )}
                </>
            )}
        </div>
    );

    const renderTimelineTab = () => (
        <div>
            {timeline.length > 0 ? (
                <AntTimeline mode="left">
                    {timeline
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((item, index) => (
                            <AntTimeline.Item
                                key={item.id || index}
                                label={item.checkInTime}
                                color="blue"
                            >
                                <Card size="small" style={{ marginBottom: 8 }}>
                                    <h4>{item.activity}</h4>
                                    {item.specialtyShop && (
                                        <div>
                                            <p><strong>Cửa hàng:</strong> {item.specialtyShop.shopName}</p>
                                            <p><strong>Địa chỉ:</strong> {item.specialtyShop.location}</p>
                                            <p><strong>Mô tả:</strong> {(item.specialtyShop as any).description || 'N/A'}</p>
                                        </div>
                                    )}
                                </Card>
                            </AntTimeline.Item>
                        ))}
                </AntTimeline>
            ) : (
                <Alert
                    message="Chưa có timeline"
                    description="TourDetails này chưa có timeline items nào."
                    type="info"
                    showIcon
                />
            )}
        </div>
    );

    const renderSlotsTab = () => {
        const slotsColumns = [
            {
                title: 'Ngày tour',
                dataIndex: 'tourDate',
                key: 'tourDate',
                render: (date: string) => {
                    if (!date) return 'N/A';
                    return new Date(date).toLocaleDateString('vi-VN');
                },
            },
            {
                title: 'Thứ',
                dataIndex: 'scheduleDayName',
                key: 'scheduleDayName',
                render: (dayName: string) => dayName || 'N/A',
            },
            {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                render: (status: number) => {
                    const statusMap = {
                        0: { text: 'Chưa kích hoạt', color: 'default' },
                        1: { text: 'Đang hoạt động', color: 'green' },
                        2: { text: 'Đã hủy', color: 'red' },
                        3: { text: 'Đã hoàn thành', color: 'blue' }
                    };
                    const statusInfo = statusMap[status as keyof typeof statusMap] || { text: 'Không xác định', color: 'default' };
                    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
                },
            },
            {
                title: 'Số lượng đã đặt',
                key: 'bookings',
                render: (_: any, record: TourSlotDto) => {
                    const currentBookings = record.currentBookings || 0;
                    // Use maxSeats from tourOperation (correct field name)
                    const maxGuests = record.maxGuests ||
                                    record.tourOperation?.maxGuests ||
                                    (tourOperation as any)?.maxSeats ||
                                    0;
                    return `${currentBookings}/${maxGuests}`;
                },
            },
            {
                title: 'Thao tác',
                key: 'actions',
                render: (_: any, record: TourSlotDto) => (
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedSlotForBookings(record);
                            setBookingsModalVisible(true);
                        }}
                    >
                        Xem booking
                    </Button>
                ),
            },
        ];

        return (
            <div>
                <Spin spinning={slotsLoading}>
                    {tourSlots.length > 0 ? (
                        <Table
                            columns={slotsColumns}
                            dataSource={tourSlots}
                            rowKey="id"
                            pagination={false}
                            size="small"
                        />
                    ) : (
                        <Alert
                            message="Chưa có tour slots"
                            description="TourDetails này chưa có tour slots nào."
                            type="info"
                            showIcon
                        />
                    )}
                </Spin>
            </div>
        );
    };

    return (
        <>
            <Modal
                title={`Chi tiết TourDetails - ${tourDetails?.title || ''}`}
                open={visible}
                onCancel={onClose}
                width={1200}
                footer={[
                    <Button key="close" onClick={onClose}>
                        Đóng
                    </Button>
                ]}
            >
                <Spin spinning={loading}>
                    <Tabs activeKey={activeTab} onChange={setActiveTab}>
                        <TabPane
                            tab={
                                <span>
                                    <ExclamationCircleOutlined />
                                    Chi tiết
                                </span>
                            }
                            key="details"
                        >
                            {renderDetailsTab()}
                        </TabPane>

                        <TabPane
                            tab={
                                <span>
                                    <ClockCircleOutlined />
                                    Timeline ({timeline.length})
                                </span>
                            }
                            key="timeline"
                        >
                            {renderTimelineTab()}
                        </TabPane>

                        <TabPane
                            tab={
                                <span>
                                    <CalendarOutlined />
                                    Tour Slots ({tourSlots.length})
                                    {tourSlots.filter(slot => slot.status === 1).length > 0 &&
                                        <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 4 }} />}
                                </span>
                            }
                            key="slots"
                        >
                            {renderSlotsTab()}
                        </TabPane>
                    </Tabs>
                </Spin>
            </Modal>

            {/* Bookings Modal - Read Only */}
            <BookingsModal
                visible={bookingsModalVisible}
                onCancel={() => {
                    setBookingsModalVisible(false);
                    setSelectedSlotForBookings(null);
                }}
                slotId={selectedSlotForBookings?.id || null}
                slotInfo={selectedSlotForBookings ? {
                    tourDate: selectedSlotForBookings.tourDate,
                    formattedDateWithDay: `${new Date(selectedSlotForBookings.tourDate).toLocaleDateString('vi-VN')} - ${selectedSlotForBookings.scheduleDayName}`,
                    statusName: selectedSlotForBookings.status === 1 ? 'Đang hoạt động' : 'Không hoạt động'
                } : undefined}
            />
        </>
    );
};

export default TourDetailsViewModal;
