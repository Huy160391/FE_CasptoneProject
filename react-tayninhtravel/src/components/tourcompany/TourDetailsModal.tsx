import React, { useState, useEffect } from 'react';
import {
    Modal,
    Descriptions,
    Tag,
    Timeline,
    Card,
    Row,
    Col,
    Button,
    Divider,
    Alert,
    Spin,
    message,
    Tabs,
    Statistic,
    Image,
    Space,
    Tooltip
} from 'antd';
import {
    ClockCircleOutlined,
    UserOutlined,
    ShopOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    DollarOutlined,
    TeamOutlined,
    CalendarOutlined,
    EditOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import {
    getTourDetailsById,
    getTourOperationByDetailsId,
    getTourGuideInvitations,
    handleApiError
} from '../../services/tourcompanyService';
import { tourSlotService, TourSlotDto } from '../../services/tourSlotService';
import {
    TourDetails,
    TourOperation,
    TimelineItem,
    TourDetailsStatus,
    TourGuideInvitationsResponse
} from '../../types/tour';
import {
    getTourDetailsStatusLabel,
    getStatusColor,
    getScheduleDayLabelFromString
} from '../../constants/tourTemplate';
import TourOperationManagement from './TourOperationManagement';
import TourDetailsUpdateForm from './TourDetailsUpdateForm';
import TimelineEditor from './TimelineEditor';

const { TabPane } = Tabs;

interface TourDetailsModalProps {
    visible: boolean;
    tourDetailsId: string | null;
    onClose: () => void;
    onUpdate?: () => void;
    initialTab?: string;
}

const TourDetailsModal: React.FC<TourDetailsModalProps> = ({
    visible,
    tourDetailsId,
    onClose,
    onUpdate,
    initialTab = 'details'
}) => {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [tourDetails, setTourDetails] = useState<TourDetails | null>(null);
    const [tourOperation, setTourOperation] = useState<TourOperation | null>(null);
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [invitations, setInvitations] = useState<TourGuideInvitationsResponse | null>(null);
    const [tourSlots, setTourSlots] = useState<TourSlotDto[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [showUpdateForm, setShowUpdateForm] = useState(false);

    useEffect(() => {
        if (visible && tourDetailsId && token) {
            loadTourDetailsData();
        }
    }, [visible, tourDetailsId, token]);

    const loadTourDetailsData = async () => {
        if (!tourDetailsId || !token) return;

        try {
            setLoading(true);

            // Load tour details (includes timeline)
            const detailsResponse = await getTourDetailsById(tourDetailsId, token);
            if (detailsResponse.success && detailsResponse.data) {
                setTourDetails(detailsResponse.data);
                // Set timeline from tour details data
                if (detailsResponse.data.timeline) {
                    setTimeline(detailsResponse.data.timeline);
                }
            }

            // Load tour operation (if exists)
            try {
                const operationResponse = await getTourOperationByDetailsId(tourDetailsId, token);
                if (operationResponse.success && operationResponse.data) {
                    setTourOperation(operationResponse.data);
                }
            } catch (error) {
                // Operation might not exist yet, that's ok
                setTourOperation(null);
            }

            // Load tour guide invitations
            try {
                const invitationsResponse = await getTourGuideInvitations(tourDetailsId, token);
                if (invitationsResponse.success) {
                    setInvitations(invitationsResponse as unknown as TourGuideInvitationsResponse);
                }
            } catch (error) {
                console.log('No invitations found or error loading invitations:', error);
                setInvitations(null);
            }

            // Load tour slots
            loadTourSlots(tourDetailsId);

        } catch (error) {
            message.error(handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const loadTourSlots = async (tourDetailsId: string) => {
        try {
            setSlotsLoading(true);
            const response = await tourSlotService.getSlotsByTourDetails(tourDetailsId, token ?? undefined);
            if (response.success && response.data) {
                setTourSlots(response.data);
            }
        } catch (error) {
            console.error('Error loading tour slots:', error);
            setTourSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleOperationUpdate = (updatedOperation: TourOperation) => {
        setTourOperation(updatedOperation);
        if (onUpdate) {
            onUpdate();
        }
    };

    const handleOperationCreate = (newOperation: TourOperation) => {
        setTourOperation(newOperation);
        if (onUpdate) {
            onUpdate();
        }
    };

    const handleTimelineUpdate = (updatedTimeline: TimelineItem[]) => {
        setTimeline(updatedTimeline);
        if (onUpdate) {
            onUpdate();
        }
    };

    const renderDetailsTab = () => (
        <div>
            {tourDetails && (
                <>
                    {/* Update Button */}
                    <div style={{ marginBottom: 16, textAlign: 'right' }}>
                        {tourOperation?.guideId ? (
                            <Tooltip title="Đã có hướng dẫn viên tham gia tour, không thể edit nữa">
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    disabled
                                >
                                    Cập nhật Tour Details
                                </Button>
                            </Tooltip>
                        ) : (
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => setShowUpdateForm(true)}
                            >
                                Cập nhật Tour Details
                            </Button>
                        )}
                    </div>

                    <Descriptions title="Thông tin cơ bản" bordered column={2}>
                        <Descriptions.Item label="Tiêu đề" span={2}>
                            {tourDetails.title}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mô tả" span={2}>
                            {tourDetails.description || 'Chưa có mô tả'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={getStatusColor(tourDetails.status)}>
                                {getTourDetailsStatusLabel(tourDetails.status)}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Template">
                            {tourDetails.tourTemplateName || 'N/A'}
                        </Descriptions.Item>
                        {tourDetails.startLocation && (
                            <Descriptions.Item label="Điểm khởi hành">
                                {tourDetails.startLocation}
                            </Descriptions.Item>
                        )}
                        {tourDetails.endLocation && (
                            <Descriptions.Item label="Điểm đến">
                                {tourDetails.endLocation}
                            </Descriptions.Item>
                        )}
                        {tourDetails.scheduleDays && (
                            <Descriptions.Item label="Lịch trình">
                                <Tag color="blue">
                                    {getScheduleDayLabelFromString(tourDetails.scheduleDays)}
                                </Tag>
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label="Kỹ năng yêu cầu" span={2}>
                            {tourDetails.skillsRequired ? (
                                tourDetails.skillsRequired.split(',').map(skill => (
                                    <Tag key={skill} color="blue">{skill.trim()}</Tag>
                                ))
                            ) : (
                                <span style={{ color: '#999' }}>Chưa có yêu cầu kỹ năng</span>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {new Date(tourDetails.createdAt).toLocaleString('vi-VN')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cập nhật lần cuối">
                            {tourDetails.updatedAt ? 
                                new Date(tourDetails.updatedAt).toLocaleString('vi-VN') : 
                                'Chưa cập nhật'
                            }
                        </Descriptions.Item>
                        {tourDetails.commentApproved && (
                            <Descriptions.Item label="Nhận xét admin" span={2}>
                                <Alert
                                    message={tourDetails.commentApproved}
                                    type={tourDetails.status === TourDetailsStatus.Approved ? 'success' : 'warning'}
                                    showIcon
                                />
                            </Descriptions.Item>
                        )}
                    </Descriptions>

                    {/* Images Gallery */}
                    {tourDetails.imageUrls && tourDetails.imageUrls.length > 0 && (
                        <>
                            <Divider>Hình ảnh ({tourDetails.imageUrls.length})</Divider>
                            <Card title="Thư viện ảnh" size="small" style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                    {tourDetails.imageUrls.map((imageUrl, index) => (
                                        <div key={index}>
                                            <Image
                                                width={150}
                                                height={120}
                                                src={imageUrl}
                                                style={{ objectFit: 'cover', borderRadius: 8 }}
                                                preview={{
                                                    mask: 'Xem ảnh'
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </>
                    )}

                    <Divider />

                    <Card title="Thống kê" size="small">
                        <Row gutter={16}>
                            <Col span={8}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', color: '#1890ff' }}>
                                        {tourDetails.timeline?.length || 0}
                                    </div>
                                    <div style={{ color: '#666' }}>Timeline Items</div>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', color: '#52c41a' }}>
                                        {tourSlots.length}
                                    </div>
                                    <div style={{ color: '#666' }}>Tour Slots</div>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', color: '#fa8c16' }}>
                                        {tourDetails.timeline?.filter(item => item.specialtyShop).length || 0}
                                    </div>
                                    <div style={{ color: '#666' }}>Shops in Timeline</div>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </>
            )}
        </div>
    );

    const renderTimelineTab = () => (
        <div>
            {timeline.length > 0 ? (
                <TimelineEditor
                    tourDetailsId={tourDetailsId!}
                    timeline={timeline}
                    onUpdate={handleTimelineUpdate}
                />
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

    const renderOperationTab = () => (
        <div>
            {tourOperation ? (
                <TourOperationManagement
                    tourDetails={tourDetails!}
                    onOperationUpdate={handleOperationUpdate}
                    onOperationCreate={handleOperationCreate}
                />
            ) : (
                <Alert
                    message="Chưa có TourOperation"
                    description="TourDetails này chưa có TourOperation. TourOperation thường được tạo tự động trong quá trình tạo TourDetails."
                    type="info"
                    showIcon
                />
            )}
        </div>
    );

    const renderSlotsTab = () => (
        <div>
            <Spin spinning={slotsLoading}>
                {tourSlots.length > 0 ? (
                    <div>
                        <Alert
                            message="Thông tin Tour Slots"
                            description="Danh sách các ngày tour cụ thể được tạo từ template. Mỗi slot đại diện cho một ngày tour có thể được booking."
                            type="info"
                            showIcon
                            style={{ marginBottom: 16 }}
                        />

                        <Row gutter={[16, 16]}>
                            {tourSlots.map((slot) => (
                                <Col xs={24} sm={12} md={8} lg={6} key={slot.id}>
                                    <Card
                                        size="small"
                                        title={
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                                    {slot.formattedDateWithDay}
                                                </div>
                                            </div>
                                        }
                                        extra={
                                            <Tag color={slot.status === 1 ? 'green' : slot.status === 2 ? 'red' : 'orange'}>
                                                {slot.statusName}
                                            </Tag>
                                        }
                                        style={{
                                            borderColor: slot.status === 1 ? '#52c41a' : slot.status === 2 ? '#ff4d4f' : '#fa8c16'
                                        }}
                                    >
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ marginBottom: 8 }}>
                                                <Tag color="blue">{slot.scheduleDayName}</Tag>
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                Trạng thái: {slot.statusName}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                Hoạt động: {slot.isActive ? 'Có' : 'Không'}
                                            </div>
                                            {slot.tourOperation && (
                                                <div style={{ marginTop: 8 }}>
                                                    <Tag color="purple">
                                                        Có Operation
                                                    </Tag>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        <Divider />

                        <Card title="Thống kê Slots" size="small">
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Statistic
                                        title="Tổng Slots"
                                        value={tourSlots.length}
                                        valueStyle={{ color: '#1890ff' }}
                                    />
                                </Col>
                                <Col span={6}>
                                    <Statistic
                                        title="Có sẵn"
                                        value={tourSlots.filter(slot => slot.status === 1).length}
                                        valueStyle={{ color: '#52c41a' }}
                                    />
                                </Col>
                                <Col span={6}>
                                    <Statistic
                                        title="Đã đặt"
                                        value={tourSlots.filter(slot => slot.status === 2).length}
                                        valueStyle={{ color: '#ff4d4f' }}
                                    />
                                </Col>
                                <Col span={6}>
                                    <Statistic
                                        title="Có Operation"
                                        value={tourSlots.filter(slot => slot.tourOperation).length}
                                        valueStyle={{ color: '#722ed1' }}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </div>
                ) : (
                    <Alert
                        message="Chưa có Tour Slots"
                        description="TourDetails này chưa có slots nào. Slots thường được tạo tự động từ TourTemplate hoặc có thể được tạo thủ công."
                        type="info"
                        showIcon
                    />
                )}
            </Spin>
        </div>
    );

    const renderInvitationsTab = () => (
        <div>
            {invitations ? (
                <div>
                    {/* Statistics Cards */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Tổng lời mời"
                                    value={invitations.statistics.totalInvitations}
                                    prefix={<TeamOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Đang chờ"
                                    value={invitations.statistics.pendingCount}
                                    valueStyle={{ color: '#faad14' }}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Đã chấp nhận"
                                    value={invitations.statistics.acceptedCount}
                                    valueStyle={{ color: '#52c41a' }}
                                    prefix={<CheckCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Tỷ lệ chấp nhận"
                                    value={invitations.statistics.acceptanceRate}
                                    precision={1}
                                    suffix="%"
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Invitations List */}
                    {invitations.invitations.length > 0 ? (
                        <Card title="Danh sách lời mời hướng dẫn viên">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {invitations.invitations.map((invitation) => (
                                    <Card key={invitation.id} size="small" style={{ border: '1px solid #f0f0f0' }}>
                                        <Row gutter={16} align="middle">
                                            <Col span={6}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold' }}>{invitation.guide.name}</div>
                                                    <div style={{ color: '#666', fontSize: '12px' }}>{invitation.guide.email}</div>
                                                </div>
                                            </Col>
                                            <Col span={3}>
                                                <Tag color={invitation.invitationType === 'Automatic' ? 'blue' : 'green'}>
                                                    {invitation.invitationType === 'Automatic' ? 'Tự động' : 'Thủ công'}
                                                </Tag>
                                            </Col>
                                            <Col span={3}>
                                                <Tag color={
                                                    invitation.status === 'Pending' ? 'orange' :
                                                    invitation.status === 'Accepted' ? 'green' :
                                                    invitation.status === 'Rejected' ? 'red' : 'gray'
                                                }>
                                                    {invitation.status === 'Pending' ? 'Chờ phản hồi' :
                                                     invitation.status === 'Accepted' ? 'Đã chấp nhận' :
                                                     invitation.status === 'Rejected' ? 'Đã từ chối' : 'Hết hạn'}
                                                </Tag>
                                            </Col>
                                            <Col span={4}>
                                                <div style={{ fontSize: '12px', color: '#666' }}>
                                                    <div>Mời: {new Date(invitation.invitedAt).toLocaleDateString('vi-VN')}</div>
                                                    <div>Hết hạn: {new Date(invitation.expiresAt).toLocaleDateString('vi-VN')}</div>
                                                </div>
                                            </Col>
                                            <Col span={4}>
                                                {invitation.respondedAt && (
                                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                                        Phản hồi: {new Date(invitation.respondedAt).toLocaleDateString('vi-VN')}
                                                    </div>
                                                )}
                                            </Col>
                                            <Col span={4}>
                                                {invitation.rejectionReason && (
                                                    <div style={{ fontSize: '12px', color: '#ff4d4f' }}>
                                                        Lý do từ chối: {invitation.rejectionReason}
                                                    </div>
                                                )}
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}
                            </div>
                        </Card>
                    ) : (
                        <Alert
                            message="Chưa có lời mời nào"
                            description="Chưa có hướng dẫn viên nào được mời cho tour này."
                            type="info"
                            showIcon
                        />
                    )}
                </div>
            ) : (
                <Alert
                    message="Không thể tải thông tin lời mời"
                    description="Có lỗi xảy ra khi tải thông tin lời mời hướng dẫn viên."
                    type="warning"
                    showIcon
                />
            )}
        </div>
    );

    return (
        <Modal
            title={`Chi tiết TourDetails${tourDetails ? ` - ${tourDetails.title}` : ''}`}
            open={visible}
            onCancel={onClose}
            width={1000}
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
                                <DollarOutlined />
                                Vận hành
                                {tourOperation && <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 4 }} />}
                            </span>
                        }
                        key="operation"
                    >
                        {renderOperationTab()}
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

                    <TabPane
                        tab={
                            <span>
                                <UserOutlined />
                                Hướng dẫn viên ({invitations?.statistics.totalInvitations || 0})
                                {(invitations?.statistics?.acceptedCount || 0) > 0 &&
                                    <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 4 }} />}
                            </span>
                        }
                        key="invitations"
                    >
                        {renderInvitationsTab()}
                    </TabPane>
                </Tabs>
            </Spin>

            {/* Update Form Modal */}
            <TourDetailsUpdateForm
                visible={showUpdateForm}
                tourDetails={tourDetails}
                onCancel={() => setShowUpdateForm(false)}
                onSuccess={() => {
                    setShowUpdateForm(false);
                    loadTourDetailsData(); // Reload data after update
                    if (onUpdate) {
                        onUpdate();
                    }
                }}
            />
        </Modal>
    );
};

export default TourDetailsModal;
