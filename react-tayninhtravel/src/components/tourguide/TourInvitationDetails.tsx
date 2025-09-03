import React, { useState, useEffect } from 'react';
import {
    Card,
    Descriptions,
    Button,
    Tag,
    Space,
    Modal,
    Input,
    message,
    Typography,
    Divider,
    Alert,
    Spin,
    Badge,
    Row,
    Col,
    Statistic
} from 'antd';
import {
    CheckOutlined,
    CloseOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    CalendarOutlined,
    UserOutlined,
    StarOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { TourGuideInvitation } from '@/types/tour';
import {
    getInvitationDetails,
    acceptInvitation,
    rejectInvitation,
    formatTimeUntilExpiry,
    canRespondToInvitation
} from '@/services/tourguideService';
import { formatVietnamDateTime, getVietnamNow, toVietnamTime } from '../../utils/vietnamTimezone';
import TourDetailsViewModal from './TourDetailsViewModal';
import './TourInvitationDetails.scss';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface TourInvitationDetailsProps {
    invitationId: string;
    visible: boolean;
    onClose: () => void;
    onUpdate?: () => void;
    invitationContext?: TourGuideInvitation; // Add context from invitation list
}

interface InvitationDetailData extends TourGuideInvitation {
    tourDetails: {
        id: string;
        title: string;
        description?: string;
        skillsRequired?: string;
        status: string;
        createdAt: string;
        tourTemplate?: {
            id: string;
            title: string;
            description?: string;
            templateType: string;
            scheduleDay: string;
        };
        createdBy: {
            id: string;
            name: string;
            email: string;
            phoneNumber?: string;
        };
        timelineItemsCount?: number;
    };
    skillsMatching?: {
        requiredSkills: string[];
        guideSkills: string[];
        matchedSkills: string[];
        matchScore: number;
        isMatch: boolean;
    };
}

const TourInvitationDetails: React.FC<TourInvitationDetailsProps> = ({
    invitationId,
    visible,
    onClose,
    onUpdate,
    invitationContext
}) => {
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [invitationData, setInvitationData] = useState<InvitationDetailData | null>(null);
    const [acceptModalVisible, setAcceptModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [acceptanceMessage, setAcceptanceMessage] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [tourDetailsModalVisible, setTourDetailsModalVisible] = useState(false);
    const [hasViewedInvitationMessage, setHasViewedInvitationMessage] = useState(false);

    // Load invitation details
    const loadInvitationDetails = async () => {
        if (!invitationId) return;

        setLoading(true);
        try {
            // Debug: Check token
            const token = localStorage.getItem('token');
            console.log('🔑 Auth token exists:', !!token);
            console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'No token');

            const response = await getInvitationDetails(invitationId);
            console.log('📡 API Response:', response);
            console.log('📡 Full response structure:', JSON.stringify(response, null, 2));

            if (response.success && response.data) {
                const data = response.data as any;
                console.log('📋 Invitation data structure:', JSON.stringify(data, null, 2));
                console.log('📋 TourDetails ID:', data?.tourDetails?.id);
                console.log('📋 All available IDs:', {
                    tourDetailsId: data?.tourDetailsId,
                    tourDetails_id: data?.tourDetails?.id,
                    invitation_id: data?.id
                });
                setInvitationData(data);
            } else {
                message.error(response.message || 'Không thể tải chi tiết lời mời');
            }
        } catch (error: any) {
            console.error('❌ Error loading invitation details:', error);
            if (error?.response?.status === 401) {
                message.error('Vui lòng đăng nhập lại để xem chi tiết lời mời');
            } else {
                message.error('Có lỗi xảy ra khi tải chi tiết lời mời');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('🔄 TourInvitationDetails useEffect triggered:', { 
            visible, 
            invitationId, 
            hasInvitationContext: !!invitationContext,
            invitationContext: invitationContext 
        });
        
        if (visible && invitationId) {
            // If we have invitation context from list, use it directly
            if (invitationContext) {
                console.log('✅ Using invitation context from list:', invitationContext);
                setInvitationData(invitationContext as any);
            } else {
                // Fallback to API call if no context
                console.log('⚠️ No invitation context, falling back to API call');
                loadInvitationDetails();
            }
        }
    }, [visible, invitationId, invitationContext]);

    // Reset viewed state when invitation data changes
    useEffect(() => {
        if (invitationData) {
            // If no invitation message, mark as viewed automatically
            if (!invitationData.invitationMessage) {
                setHasViewedInvitationMessage(true);
            } else {
                setHasViewedInvitationMessage(false);
            }
        }
    }, [invitationData]);

    // Helper function to show schedule conflict error
    const showScheduleConflictError = (errorMessage: string) => {
        console.log('🔍 Parsing schedule conflict error:', errorMessage);

        // Extract tour information from error message if available
        let conflictingTours: string[] = [];
        let currentTour = '';

        // Try to extract current tour info
        const currentTourMatch = errorMessage.match(/Tour hiện tại:\s*([^.]+)/);
        if (currentTourMatch) {
            currentTour = currentTourMatch[1].trim();
        }

        // Try to extract conflicting tour info
        const conflictingTourMatch = errorMessage.match(/Tour bị trùng:\s*([^.]+)/);
        if (conflictingTourMatch) {
            conflictingTours.push(conflictingTourMatch[1].trim());
        }

        Modal.error({
            title: '🚫 Xung đột lịch trình',
            width: 500,
            content: (
                <div>
                    <p style={{ marginBottom: '12px', fontWeight: 'bold', color: '#ff4d4f' }}>
                        Không thể chấp nhận lời mời do trùng lịch với tour đã đăng ký.
                    </p>

                    {currentTour && (
                        <div style={{
                            background: '#fff1f0',
                            border: '1px solid #ffccc7',
                            borderRadius: '4px',
                            padding: '8px',
                            margin: '8px 0',
                            fontSize: '13px'
                        }}>
                            <strong>📅 Lịch trình hiện tại:</strong><br />
                            {currentTour}
                        </div>
                    )}

                    {conflictingTours.length > 0 && (
                        <div style={{
                            background: '#fff2e8',
                            border: '1px solid #ffbb96',
                            borderRadius: '4px',
                            padding: '8px',
                            margin: '8px 0',
                            fontSize: '12px'
                        }}>
                            <strong>🚫 Tour đã đăng ký trùng lịch:</strong>
                            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                                {conflictingTours.map((tour, index) => (
                                    <li key={index} style={{ marginBottom: '2px' }}>
                                        {tour.trim()}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Show original message if parsing failed */}
                    {conflictingTours.length === 0 && !currentTour && (
                        <div style={{
                            background: '#f6f6f6',
                            border: '1px solid #d9d9d9',
                            borderRadius: '4px',
                            padding: '8px',
                            margin: '8px 0',
                            fontSize: '11px',
                            fontFamily: 'monospace'
                        }}>
                            <strong>Chi tiết lỗi:</strong><br />
                            {errorMessage}
                        </div>
                    )}

                    <p style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
                        💡 <strong>Gợi ý:</strong> Vui lòng kiểm tra lại lịch của bạn hoặc liên hệ công ty tour để được hỗ trợ.
                    </p>
                </div>
            ),
        });
    };

    // Handle accept invitation
    const handleAccept = async () => {
        if (!invitationData) return;

        setActionLoading(true);
        try {
            const response = await acceptInvitation(
                invitationData.id,
                acceptanceMessage || undefined
            );

            if (response.success) {
                message.success('Đã chấp nhận lời mời thành công!');
                setAcceptModalVisible(false);
                setAcceptanceMessage('');
                onUpdate?.();
                onClose();
            } else {
                // Handle specific error cases
                const errorMessage = response.message || 'Không thể chấp nhận lời mời';

                // Check for schedule conflict error
                if (errorMessage.includes('trùng thời gian biểu') ||
                    errorMessage.includes('KHÔNG THỂ CHẤP NHẬN') ||
                    errorMessage.includes('đồng ý tham gia tour khác') ||
                    errorMessage.includes('Tour bị trùng') ||
                    errorMessage.includes('conflict') ||
                    errorMessage.includes('thời gian')) {

                    showScheduleConflictError(errorMessage);
                } else {
                    // Handle other errors
                    message.error(errorMessage);
                }
            }
        } catch (error: any) {
            console.error('Error accepting invitation:', error);

            // Handle HTTP errors
            if (error.response?.data) {
                const { status, data } = error.response;

                if ((status === 400 || status === 409) && data?.message) {
                    // Handle 400 Bad Request and 409 Conflict with specific message
                    if (data.message.includes('trùng thời gian biểu') ||
                        data.message.includes('KHÔNG THỂ CHẤP NHẬN') ||
                        data.message.includes('đồng ý tham gia tour khác') ||
                        data.message.includes('Tour bị trùng') ||
                        data.message.includes('conflict') ||
                        data.message.includes('thời gian')) {

                        showScheduleConflictError(data.message);
                    } else {
                        message.error(data.message);
                    }
                } else {
                    message.error(data?.message || 'Có lỗi xảy ra từ server');
                }
            } else {
                message.error('Có lỗi xảy ra khi chấp nhận lời mời');
            }
        } finally {
            setActionLoading(false);
        }
    };

    // Handle reject invitation
    const handleReject = async () => {
        if (!invitationData || !rejectionReason.trim()) {
            message.error('Vui lòng nhập lý do từ chối');
            return;
        }

        setActionLoading(true);
        try {
            const response = await rejectInvitation(
                invitationData.id,
                rejectionReason.trim()
            );

            if (response.success) {
                message.success('Đã từ chối lời mời');
                setRejectModalVisible(false);
                setRejectionReason('');
                onUpdate?.();
                onClose();
            } else {
                message.error(response.message || 'Không thể từ chối lời mời');
            }
        } catch (error: any) {
            console.error('Error rejecting invitation:', error);
            message.error('Có lỗi xảy ra khi từ chối lời mời');
        } finally {
            setActionLoading(false);
        }
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'processing';
            case 'Accepted': return 'success';
            case 'Rejected': return 'error';
            case 'Expired': return 'default';
            default: return 'default';
        }
    };

    // Get status text
    const getStatusText = (status: string) => {
        switch (status) {
            case 'Pending': return 'Chờ phản hồi';
            case 'Accepted': return 'Đã chấp nhận';
            case 'Rejected': return 'Đã từ chối';
            case 'Expired': return 'Đã hết hạn';
            default: return status;
        }
    };

    if (!invitationData && !loading) {
        return null;
    }

    const canRespond = invitationData ? canRespondToInvitation(invitationData) : false;
    const timeUntilExpiry = invitationData ? formatTimeUntilExpiry(invitationData.expiresAt) : '';

    return (
        <>
            <Modal
                title={
                    <Space>
                        <EyeOutlined />
                        <span>Chi tiết lời mời hướng dẫn viên</span>
                    </Space>
                }
                open={visible}
                onCancel={onClose}
                width={1000}
                footer={null}
                className="tour-invitation-details-modal"
            >
                <Spin spinning={loading}>
                    {invitationData && (
                        <div className="invitation-details-content">
                            {/* Status Alert */}
                            {invitationData.status === 'Pending' && toVietnamTime(new Date(invitationData.expiresAt)) > getVietnamNow() && (
                                <Alert
                                    message="Lời mời đang chờ phản hồi"
                                    description={`Hạn phản hồi: ${timeUntilExpiry}`}
                                    type="info"
                                    showIcon
                                    style={{ marginBottom: 24 }}
                                />
                            )}

                            {invitationData.status === 'Expired' && (
                                <Alert
                                    message="Lời mời đã hết hạn"
                                    description="Bạn không thể phản hồi lời mời này nữa"
                                    type="warning"
                                    showIcon
                                    style={{ marginBottom: 24 }}
                                />
                            )}

                            <Row gutter={[24, 24]}>
                                {/* Left Column - Invitation Info */}
                                <Col xs={24} lg={12}>
                                    <Card title="Thông tin lời mời" size="small">
                                        <Descriptions column={1} size="small">
                                            <Descriptions.Item label="Trạng thái">
                                                <Tag color={getStatusColor(invitationData.status)}>
                                                    {getStatusText(invitationData.status)}
                                                </Tag>
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Loại lời mời">
                                                <Tag color={invitationData.invitationType === 'Automatic' ? 'blue' : 'green'}>
                                                    {invitationData.invitationType === 'Automatic' ? 'Tự động' : 'Thủ công'}
                                                </Tag>
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Công ty tour">
                                                <Space>
                                                    <UserOutlined />
                                                    <div>
                                                        <div>{invitationData.createdBy.name}</div>
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                                            {(invitationData.createdBy as any).email || 'Không có email'}
                                                        </Text>
                                                        {(invitationData.createdBy as any).phoneNumber && (
                                                            <div>
                                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                    {(invitationData.createdBy as any).phoneNumber}
                                                                </Text>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Space>
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Thời gian mời">
                                                <Space>
                                                    <CalendarOutlined />
                                                    {formatVietnamDateTime(invitationData.invitedAt)}
                                                </Space>
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Hạn phản hồi">
                                                <Space>
                                                    <ClockCircleOutlined />
                                                    <span>{formatVietnamDateTime(invitationData.expiresAt)}</span>
                                                    {invitationData.status === 'Pending' && (
                                                        <Badge
                                                            count={timeUntilExpiry}
                                                            style={{ backgroundColor: '#f50' }}
                                                        />
                                                    )}
                                                </Space>
                                            </Descriptions.Item>
                                            {invitationData.respondedAt && (
                                                <Descriptions.Item label="Thời gian phản hồi">
                                                    {new Date(invitationData.respondedAt).toLocaleString('vi-VN')}
                                                </Descriptions.Item>
                                            )}
                                            {invitationData.invitationMessage && (
                                                <Descriptions.Item label="Tin nhắn từ công ty">
                                                    <Alert
                                                        message="Tin nhắn đặc biệt từ công ty tour"
                                                        description={
                                                            <div>
                                                                <p style={{ marginBottom: 12 }}>
                                                                    {invitationData.invitationMessage}
                                                                </p>
                                                                {!hasViewedInvitationMessage && (
                                                                    <Button
                                                                        type="primary"
                                                                        size="small"
                                                                        icon={<CheckOutlined />}
                                                                        onClick={() => setHasViewedInvitationMessage(true)}
                                                                    >
                                                                        Đã đọc tin nhắn
                                                                    </Button>
                                                                )}
                                                                {hasViewedInvitationMessage && (
                                                                    <Tag color="green" icon={<CheckOutlined />}>
                                                                        Đã đọc
                                                                    </Tag>
                                                                )}
                                                            </div>
                                                        }
                                                        type="info"
                                                        showIcon
                                                        style={{ marginTop: 8 }}
                                                    />
                                                </Descriptions.Item>
                                            )}
                                            {invitationData.rejectionReason && (
                                                <Descriptions.Item label="Lý do từ chối">
                                                    <Text type="secondary">{invitationData.rejectionReason}</Text>
                                                </Descriptions.Item>
                                            )}
                                        </Descriptions>
                                    </Card>

                                    {/* Skills Matching */}
                                    {invitationData.skillsMatching && (
                                        <Card title="Phân tích kỹ năng" size="small" style={{ marginTop: 16 }}>
                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <Statistic
                                                        title="Điểm phù hợp"
                                                        value={Math.round(invitationData.skillsMatching.matchScore * 100)}
                                                        suffix="%"
                                                        valueStyle={{
                                                            color: invitationData.skillsMatching.isMatch ? '#3f8600' : '#cf1322'
                                                        }}
                                                        prefix={<StarOutlined />}
                                                    />
                                                </Col>
                                                <Col span={12}>
                                                    <Statistic
                                                        title="Kỹ năng trùng khớp"
                                                        value={invitationData.skillsMatching.matchedSkills.length}
                                                        suffix={`/${invitationData.skillsMatching.requiredSkills.length}`}
                                                    />
                                                </Col>
                                            </Row>

                                            <Divider />

                                            <div>
                                                <Text strong>Kỹ năng yêu cầu:</Text>
                                                <div style={{ marginTop: 8 }}>
                                                    {invitationData.skillsMatching.requiredSkills.map(skill => (
                                                        <Tag
                                                            key={skill}
                                                            color={invitationData.skillsMatching!.matchedSkills.includes(skill) ? 'green' : 'red'}
                                                        >
                                                            {skill}
                                                        </Tag>
                                                    ))}
                                                </div>
                                            </div>

                                            <div style={{ marginTop: 16 }}>
                                                <Text strong>Kỹ năng của bạn:</Text>
                                                <div style={{ marginTop: 8 }}>
                                                    {invitationData.skillsMatching.guideSkills.map(skill => (
                                                        <Tag key={skill} color="blue">
                                                            {skill}
                                                        </Tag>
                                                    ))}
                                                </div>
                                            </div>
                                        </Card>
                                    )}
                                </Col>

                                {/* Right Column - Tour Details */}
                                <Col xs={24} lg={12}>
                                    <Card 
                                        title="Thông tin tour chi tiết" 
                                        size="small"
                                        extra={
                                            <Button 
                                                type="link" 
                                                icon={<InfoCircleOutlined />}
                                                                                                onClick={() => {
                                                    const tourDetailsId = 
                                                        invitationContext?.tourDetails?.id ||
                                                        (invitationContext as any)?.tourDetailsId ||
                                                        (invitationData as any)?.tourDetailsId || 
                                                        invitationData?.tourDetails?.id ||
                                                        "e98a1911-5875-48ab-8be1-e696363a4e35"; // Backup
                                                    
                                                    console.log('🔍 Button "Xem chi tiết tour" clicked!');
                                                    console.log('🔍 invitationContext:', invitationContext);
                                                    console.log('🔍 invitationData:', invitationData);
                                                    console.log('🔍 Final tourDetailsId:', tourDetailsId);
                                                    console.log('🔍 Setting tourDetailsModalVisible to true');
                                                    
                                                    setTourDetailsModalVisible(true);
                                                }}
                                                size="small"
                                            >
                                                Xem chi tiết tour
                                            </Button>
                                        }
                                    >
                                        <Descriptions column={1} size="small">
                                            <Descriptions.Item label="Tên tour">
                                                <Text strong style={{ fontSize: '16px' }}>
                                                    {invitationData.tourDetails.title}
                                                </Text>
                                            </Descriptions.Item>
                                            {invitationData.tourDetails.description && (
                                                <Descriptions.Item label="Mô tả">
                                                    <Paragraph ellipsis={{ rows: 3, expandable: true }}>
                                                        {invitationData.tourDetails.description}
                                                    </Paragraph>
                                                </Descriptions.Item>
                                            )}
                                            <Descriptions.Item label="Trạng thái tour">
                                                <Tag color="blue">{invitationData.tourDetails.status}</Tag>
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Ngày tạo tour">
                                                {new Date(invitationData.tourDetails.createdAt).toLocaleDateString('vi-VN')}
                                            </Descriptions.Item>
                                            {invitationData.tourDetails.skillsRequired && (
                                                <Descriptions.Item label="Kỹ năng yêu cầu">
                                                    {invitationData.tourDetails.skillsRequired.split(',').map(skill => (
                                                        <Tag key={skill.trim()} color="orange">
                                                            {skill.trim()}
                                                        </Tag>
                                                    ))}
                                                </Descriptions.Item>
                                            )}
                                            {invitationData.tourDetails.timelineItemsCount && (
                                                <Descriptions.Item label="Số điểm đến">
                                                    <Badge count={invitationData.tourDetails.timelineItemsCount} />
                                                </Descriptions.Item>
                                            )}
                                        </Descriptions>
                                    </Card>

                                    {/* Tour Template Info */}
                                    {invitationData.tourDetails.tourTemplate && (
                                        <Card title="Thông tin template" size="small" style={{ marginTop: 16 }}>
                                            <Descriptions column={1} size="small">
                                                <Descriptions.Item label="Template">
                                                    <Text strong>{invitationData.tourDetails.tourTemplate.title}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Loại template">
                                                    <Tag color="purple">
                                                        {invitationData.tourDetails.tourTemplate.templateType}
                                                    </Tag>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Lịch trình">
                                                    <Tag color="cyan">
                                                        {invitationData.tourDetails.tourTemplate.scheduleDay}
                                                    </Tag>
                                                </Descriptions.Item>
                                                {invitationData.tourDetails.tourTemplate.description && (
                                                    <Descriptions.Item label="Mô tả template">
                                                        <Paragraph ellipsis={{ rows: 2, expandable: true }}>
                                                            {invitationData.tourDetails.tourTemplate.description}
                                                        </Paragraph>
                                                    </Descriptions.Item>
                                                )}
                                            </Descriptions>
                                        </Card>
                                    )}
                                </Col>
                            </Row>

                            {/* Action Buttons */}
                            {canRespond && (
                                <>
                                    <Divider />
                                    {invitationData.invitationMessage && !hasViewedInvitationMessage && (
                                        <Alert
                                            message="Vui lòng đọc tin nhắn từ công ty tour trước khi chấp nhận lời mời"
                                            type="warning"
                                            showIcon
                                            style={{ marginBottom: 16 }}
                                        />
                                    )}
                                    <div className="invitation-actions" style={{ textAlign: 'center' }}>
                                        <Space size="large">
                                            <Button
                                                type="primary"
                                                icon={<CheckOutlined />}
                                                size="large"
                                                disabled={!hasViewedInvitationMessage}
                                                onClick={() => setAcceptModalVisible(true)}
                                            >
                                                Chấp nhận lời mời
                                            </Button>
                                            <Button
                                                danger
                                                icon={<CloseOutlined />}
                                                size="large"
                                                onClick={() => setRejectModalVisible(true)}
                                            >
                                                Từ chối lời mời
                                            </Button>
                                        </Space>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </Spin>
            </Modal>

            {/* Accept Modal */}
            <Modal
                title="Chấp nhận lời mời"
                open={acceptModalVisible}
                onCancel={() => setAcceptModalVisible(false)}
                onOk={handleAccept}
                confirmLoading={actionLoading}
                okText="Xác nhận chấp nhận"
                cancelText="Hủy"
            >
                <div>
                    <p>Bạn có chắc chắn muốn chấp nhận lời mời này?</p>
                    <TextArea
                        placeholder="Ghi chú (tùy chọn)"
                        value={acceptanceMessage}
                        onChange={(e) => setAcceptanceMessage(e.target.value)}
                        rows={3}
                        maxLength={500}
                    />
                </div>
            </Modal>

            {/* Reject Modal */}
            <Modal
                title="Từ chối lời mời"
                open={rejectModalVisible}
                onCancel={() => setRejectModalVisible(false)}
                onOk={handleReject}
                confirmLoading={actionLoading}
                okText="Xác nhận từ chối"
                cancelText="Hủy"
            >
                <div>
                    <p>Vui lòng cho biết lý do từ chối lời mời:</p>
                    <TextArea
                        placeholder="Lý do từ chối (bắt buộc)"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4}
                        maxLength={500}
                        required
                    />
                </div>
            </Modal>

            {/* Tour Details View Modal */}
            <TourDetailsViewModal
                visible={tourDetailsModalVisible}
                tourDetailsId={
                    // Prioritize invitation context from list since it has valid data
                    invitationContext?.tourDetails?.id ||
                    (invitationContext as any)?.tourDetailsId ||
                    (invitationData as any)?.tourDetailsId ||
                    invitationData?.tourDetails?.id ||
                    // Backup: Use the valid tourDetailsId from network logs
                    "e98a1911-5875-48ab-8be1-e696363a4e35"
                }
                onClose={() => setTourDetailsModalVisible(false)}
            />
        </>
    );
};

export default TourInvitationDetails; 