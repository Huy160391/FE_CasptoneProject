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
    Space,
    Divider,
    Alert,
    Spin,
    message,
    Tabs,
    Statistic
} from 'antd';
import {
    ClockCircleOutlined,
    UserOutlined,
    ShopOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    DollarOutlined,
    TeamOutlined,
    EditOutlined
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import {
    getTourDetailsById,
    getTourOperationByDetailsId,
    getTourGuideInvitations,
    handleApiError
} from '../../services/tourcompanyService';
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
    TOUR_DETAILS_STATUS_LABELS
} from '../../constants/tourTemplate';
import TourOperationManagement from './TourOperationManagement';

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
            if (detailsResponse.isSuccess && detailsResponse.data) {
                setTourDetails(detailsResponse.data);
                // Set timeline from tour details data
                if (detailsResponse.data.timeline) {
                    setTimeline(detailsResponse.data.timeline);
                }
            }

            // Load tour operation (if exists)
            try {
                const operationResponse = await getTourOperationByDetailsId(tourDetailsId, token);
                if (operationResponse.isSuccess && operationResponse.data) {
                    setTourOperation(operationResponse.data);
                }
            } catch (error) {
                // Operation might not exist yet, that's ok
                setTourOperation(null);
            }

            // Load tour guide invitations
            try {
                const invitationsResponse = await getTourGuideInvitations(tourDetailsId, token);
                if (invitationsResponse.isSuccess) {
                    setInvitations(invitationsResponse);
                }
            } catch (error) {
                console.log('No invitations found or error loading invitations:', error);
                setInvitations(null);
            }

        } catch (error) {
            message.error(handleApiError(error));
        } finally {
            setLoading(false);
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

    const renderDetailsTab = () => (
        <div>
            {tourDetails && (
                <>
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
                                        {tourDetails.assignedSlots?.length || 0}
                                    </div>
                                    <div style={{ color: '#666' }}>Assigned Slots</div>
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
                <Timeline mode="left">
                    {timeline
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .map((item, index) => (
                            <Timeline.Item
                                key={item.id}
                                dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}
                                label={item.checkInTime}
                            >
                                <Card size="small" style={{ marginBottom: 8 }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                                        {item.activity}
                                    </div>
                                    {item.location && (
                                        <div style={{ color: '#666', fontSize: '12px' }}>
                                            📍 {item.location}
                                        </div>
                                    )}
                                    {item.specialtyShop && (
                                        <Tag icon={<ShopOutlined />} color="green" style={{ marginTop: 4 }}>
                                            {item.specialtyShop.shopName}
                                        </Tag>
                                    )}
                                </Card>
                            </Timeline.Item>
                        ))}
                </Timeline>
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
            {tourDetails?.status === TourDetailsStatus.Approved ? (
                <TourOperationManagement
                    tourDetails={tourDetails}
                    onOperationUpdate={handleOperationUpdate}
                    onOperationCreate={handleOperationCreate}
                />
            ) : (
                <Alert
                    message="TourDetails chưa được duyệt"
                    description="TourOperation chỉ có thể tạo sau khi TourDetails được admin duyệt."
                    type="warning"
                    showIcon
                />
            )}
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
                                    value={invitations.statistics.pendingInvitations}
                                    valueStyle={{ color: '#faad14' }}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Đã chấp nhận"
                                    value={invitations.statistics.acceptedInvitations}
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
                                <UserOutlined />
                                Hướng dẫn viên ({invitations?.statistics.totalInvitations || 0})
                                {invitations?.statistics.acceptedInvitations > 0 &&
                                    <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 4 }} />}
                            </span>
                        }
                        key="invitations"
                    >
                        {renderInvitationsTab()}
                    </TabPane>
                </Tabs>
            </Spin>
        </Modal>
    );
};

export default TourDetailsModal;
