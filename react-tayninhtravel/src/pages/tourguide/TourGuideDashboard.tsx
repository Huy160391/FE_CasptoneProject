import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Button,
    List,
    Avatar,
    Badge,
    Progress,
    Alert,
    Spin,
    Tooltip,
    Space,
    notification,
    Modal
} from 'antd';
import {
    MailOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    TrophyOutlined,
    CalendarOutlined,
    UserOutlined,
    RightOutlined,
    BellOutlined,
    CheckOutlined,
    CloseOutlined,
    ReloadOutlined,
    FireOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { TourGuideInvitation } from '@/types/tour';
import {
    getMyInvitations,
    formatTimeUntilExpiry,
    acceptInvitation,
    canRespondToInvitation,
    getMyActiveTours,
    ActiveTour
} from '@/services/tourguideService';
import TourInvitationDetails from '@/components/tourguide/TourInvitationDetails';
import TourDetailsViewModal from '@/components/tourguide/TourDetailsViewModal';
import ProfileSection from '@/components/tourguide/ProfileSection';
import TourActiveList from '@/components/tourguide/TourActiveList';
import './TourGuideDashboard.scss';

const { Title, Text } = Typography;

const TourGuideDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [pendingInvitations, setPendingInvitations] = useState<TourGuideInvitation[]>([]);
    const [statistics, setStatistics] = useState<any>({});
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [profileExpanded, setProfileExpanded] = useState(false);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedInvitationId, setSelectedInvitationId] = useState<string>('');
    const [tourDetailsModalVisible, setTourDetailsModalVisible] = useState(false);
    const [selectedTourDetailsId, setSelectedTourDetailsId] = useState<string>('');
    const [expandedInvitations, setExpandedInvitations] = useState<Set<string>>(new Set());
    const [viewedMessages, setViewedMessages] = useState<Set<string>>(new Set());

    // New states for HDV tour management
    const [activeTours, setActiveTours] = useState<ActiveTour[]>([]);
    const [activeToursLoading, setActiveToursLoading] = useState(false);
    const [refreshTrigger] = useState(0);

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

        // Try to extract conflicting tour info - Updated regex for new format
        const conflictTourMatch = errorMessage.match(/Tour bị trùng:\s*Tour\s*'([^']+)'\s*\(([^)]+)\)/);
        if (conflictTourMatch) {
            const tourName = conflictTourMatch[1];
            const tourTime = conflictTourMatch[2];
            conflictingTours.push(`${tourName} (${tourTime})`);
        }

        // Fallback: try old regex pattern
        if (conflictingTours.length === 0) {
            const tourMatches = errorMessage.match(/Tour.*?(?=Tour|$)/g);
            conflictingTours = tourMatches ? tourMatches.slice(0, 3) : [];
        }

        console.log('🎯 Extracted conflict info:', { currentTour, conflictingTours });

        notification.error({
            message: '⚠️ Xung đột lịch trình',
            description: (
                <div style={{ maxWidth: '450px' }}>
                    <p><strong>Không thể chấp nhận lời mời này!</strong></p>
                    <p>Bạn đã có tour khác trong cùng thời gian biểu.</p>

                    {currentTour && (
                        <div style={{
                            background: '#e6f7ff',
                            border: '1px solid #91d5ff',
                            borderRadius: '4px',
                            padding: '8px',
                            margin: '8px 0',
                            fontSize: '12px'
                        }}>
                            <strong>🕒 Thời gian trùng lịch:</strong><br />
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

                    <div style={{ marginTop: '12px' }}>
                        <strong>💡 Giải pháp:</strong>
                        <ul style={{ marginLeft: '16px', marginTop: '4px', fontSize: '13px' }}>
                            <li>Kiểm tra lịch trình trong trang <strong>"Lời mời đã chấp nhận"</strong></li>
                            <li>Xem xét từ chối tour trùng lịch (nếu có thể)</li>
                            <li>Liên hệ công ty để thay đổi thời gian tour</li>
                            <li>Hoặc từ chối lời mời này nếu không thể sắp xếp</li>
                        </ul>
                    </div>
                </div>
            ),
            duration: 15, // Show longer for important message
        });
    };

    // Toggle invitation expansion
    const toggleInvitationExpansion = (invitationId: string, invitation?: any) => {
        const newExpanded = new Set(expandedInvitations);
        if (newExpanded.has(invitationId)) {
            newExpanded.delete(invitationId);
        } else {
            newExpanded.add(invitationId);
            // Mark message as viewed when expanding (if invitation has message)
            if (invitation?.invitationMessage) {
                const newViewed = new Set(viewedMessages);
                newViewed.add(invitationId);
                setViewedMessages(newViewed);
                console.log('📖 Message viewed for invitation:', invitationId);
            }
        }
        setExpandedInvitations(newExpanded);
    };

    // Load dashboard data
    const loadDashboardData = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            // Load pending invitations
            const pendingResponse = await getMyInvitations('Pending');
            console.log('📊 Dashboard pending response:', pendingResponse);

            if (pendingResponse.success) {
                // Check if response has data wrapper (frontend structure)
                if (pendingResponse.data) {
                    const invitations = pendingResponse.data.invitations?.slice(0, 5) || [];
                    console.log('📊 Dashboard invitations data:', invitations);
                    setPendingInvitations(invitations);
                }
                // Check if response has invitations directly (backend structure)
                else if ((pendingResponse as any).invitations) {
                    const invitations = (pendingResponse as any).invitations?.slice(0, 5) || [];
                    console.log('📊 Dashboard invitations direct:', invitations);
                    setPendingInvitations(invitations);
                }
            }

            // Load all invitations for statistics
            const allResponse = await getMyInvitations();
            console.log('📊 Dashboard all response:', allResponse);

            if (allResponse.success) {
                // Check if response has data wrapper (frontend structure)
                if (allResponse.data) {
                    console.log('📊 Setting statistics (wrapped):', allResponse.data.statistics);
                    setStatistics(allResponse.data.statistics || {});
                }
                // Check if response has statistics directly (backend structure)
                else if ((allResponse as any).statistics) {
                    console.log('📊 Setting statistics (direct):', (allResponse as any).statistics);
                    setStatistics((allResponse as any).statistics || {});
                }
            }

            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            notification.error({
                message: 'Lỗi tải dữ liệu',
                description: 'Không thể tải dữ liệu dashboard. Vui lòng thử lại.',
            });
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Load active tours for HDV
    const loadActiveTours = async () => {
        try {
            setActiveToursLoading(true);
            const response = await getMyActiveTours();

            if (response.success && response.data) {
                setActiveTours(response.data);
            }
        } catch (error) {
            console.error('Error loading active tours:', error);
            notification.error({
                message: 'Lỗi tải tours',
                description: 'Không thể tải danh sách tours đang hoạt động.',
            });
        } finally {
            setActiveToursLoading(false);
        }
    };

    // Show confirmation before accepting invitation
    const showAcceptConfirmation = (invitation: any) => {
        const tourTitle = invitation.tourDetails?.title || 'Tour không xác định';
        const startDate = invitation.tourDetails?.startDate
            ? new Date(invitation.tourDetails.startDate).toLocaleDateString('vi-VN')
            : 'Chưa xác định';
        const endDate = invitation.tourDetails?.endDate
            ? new Date(invitation.tourDetails.endDate).toLocaleDateString('vi-VN')
            : null;
        const timeRange = endDate ? `${startDate} - ${endDate}` : startDate;

        Modal.confirm({
            title: '🤝 Xác nhận chấp nhận lời mời',
            content: (
                <div>
                    <p><strong>Tour:</strong> {tourTitle}</p>
                    <p><strong>Thời gian:</strong> {timeRange}</p>
                    <p><strong>Công ty:</strong> {invitation.createdBy?.name || 'Không xác định'}</p>
                    <div style={{
                        background: '#e6f7ff',
                        border: '1px solid #91d5ff',
                        borderRadius: '4px',
                        padding: '8px',
                        marginTop: '12px'
                    }}>
                        <p style={{ margin: 0, fontSize: '13px' }}>
                            ⚠️ <strong>Lưu ý:</strong> Hệ thống sẽ kiểm tra xung đột lịch trình.
                            Nếu bạn đã có tour khác trong cùng thời gian, lời mời sẽ không được chấp nhận.
                        </p>
                    </div>
                </div>
            ),
            okText: 'Chấp nhận',
            cancelText: 'Hủy',
            okType: 'primary',
            onOk: () => handleQuickAccept(invitation.id),
            width: 480,
        });
    };

    // Quick accept invitation
    const handleQuickAccept = async (invitationId: string) => {
        setActionLoading(invitationId);
        try {
            const response = await acceptInvitation(invitationId, '');
            console.log('🎯 Accept invitation response:', response);

            if (response.success) {
                notification.success({
                    message: 'Chấp nhận thành công',
                    description: 'Bạn đã chấp nhận lời mời thành công!',
                });
                loadDashboardData(false); // Refresh data without loading spinner
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
                    notification.error({
                        message: 'Lỗi chấp nhận',
                        description: errorMessage,
                    });
                }
            }
        } catch (error: any) {
            console.error('❌ Accept invitation error:', error);

            // Handle network/API errors
            if (error.response) {
                const { status, data } = error.response;
                console.log('🔍 Error response:', { status, data });

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
                        notification.error({
                            message: status === 409 ? 'Xung đột dữ liệu' : 'Lỗi chấp nhận',
                            description: data.message,
                        });
                    }
                } else {
                    notification.error({
                        message: `Lỗi ${status}`,
                        description: data?.message || 'Có lỗi xảy ra từ server',
                    });
                }
            } else if (error.request) {
                // Network error
                notification.error({
                    message: 'Lỗi kết nối',
                    description: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
                });
            } else {
                // Other errors
                notification.error({
                    message: 'Lỗi hệ thống',
                    description: 'Có lỗi không xác định xảy ra. Vui lòng thử lại.',
                });
            }
        } finally {
            setActionLoading(null);
        }
    };

    // Auto refresh every 30 seconds
    useEffect(() => {
        loadDashboardData();
        loadActiveTours();
        const interval = setInterval(() => {
            loadDashboardData(false);
            loadActiveTours();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Debug log for statistics
    useEffect(() => {
        console.log('📊 Dashboard statistics state:', statistics);
    }, [statistics]);

    // Quick stats data with enhanced features
    const quickStats = [
        {
            title: 'Lời mời chờ phản hồi',
            value: statistics.pendingCount || 0,
            icon: <MailOutlined />,
            color: '#1890ff',
            action: () => navigate('/tour-guide/invitations?tab=pending'),
            urgent: (statistics.pendingCount || 0) > 0,
            description: 'Cần phản hồi sớm'
        },
        {
            title: 'Đã chấp nhận',
            value: statistics.acceptedCount || 0,
            icon: <CheckCircleOutlined />,
            color: '#52c41a',
            action: () => navigate('/tour-guide/invitations?tab=accepted'),
            urgent: false,
            description: 'Tours đã xác nhận'
        },
        {
            title: 'Tỷ lệ chấp nhận',
            value: `${statistics.acceptanceRate || 0}%`,
            icon: <TrophyOutlined />,
            color: '#faad14',
            action: () => navigate('/tour-guide/invitations'),
            urgent: (statistics.acceptanceRate || 0) < 50,
            description: 'Hiệu suất của bạn'
        },
        {
            title: 'Tổng lời mời',
            value: statistics.totalInvitations || 0,
            icon: <CalendarOutlined />,
            color: '#722ed1',
            action: () => navigate('/tour-guide/invitations'),
            urgent: false,
            description: 'Tất cả lời mời'
        }
    ];

    return (
        <div className="tour-guide-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <div>
                        <Title level={2}>
                            <Space>
                                Dashboard Tour Guide
                                {(statistics.pendingCount || 0) > 0 && (
                                    <Badge count={statistics.pendingCount} offset={[10, 0]}>
                                        <BellOutlined style={{ color: '#1890ff' }} />
                                    </Badge>
                                )}
                            </Space>
                        </Title>
                        <Text type="secondary">
                            Chào mừng bạn trở lại! Đây là tổng quan về các lời mời và hoạt động của bạn.
                        </Text>
                    </div>
                    <div className="header-actions">
                        <Tooltip title="Làm mới dữ liệu">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => loadDashboardData()}
                                loading={loading}
                            />
                        </Tooltip>
                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: 8 }}>
                            Cập nhật: {lastUpdate.toLocaleTimeString()}
                        </Text>
                    </div>
                </div>
            </div>

            <Spin spinning={loading || activeToursLoading}>
                {/* Profile Section */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col span={24}>
                        <ProfileSection
                            collapsed={!profileExpanded}
                            onToggle={() => setProfileExpanded(!profileExpanded)}
                        />
                    </Col>
                </Row>

                {/* Quick Stats */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    {quickStats.map((stat, index) => (
                        <Col xs={24} sm={12} lg={6} key={index}>
                            <Card
                                hoverable
                                className={`stat-card ${stat.urgent ? 'urgent' : ''}`}
                                onClick={stat.action}
                            >
                                <div className="stat-content">
                                    <Statistic
                                        title={
                                            <Space>
                                                {stat.title}
                                                {stat.urgent && <FireOutlined style={{ color: '#ff4d4f' }} />}
                                            </Space>
                                        }
                                        value={stat.value}
                                        prefix={
                                            <div
                                                className="stat-icon"
                                                style={{ color: stat.color }}
                                            >
                                                {stat.icon}
                                            </div>
                                        }
                                        valueStyle={{ color: stat.color }}
                                    />
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {stat.description}
                                    </Text>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Row gutter={[16, 16]}>
                    {/* Tours hôm nay */}
                    <Col xs={24}>
                        <TourActiveList refreshTrigger={refreshTrigger} />
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                    {/* Enhanced Pending Invitations */}
                    <Col xs={24} lg={16}>
                        <Card
                            title={
                                <Space>
                                    <MailOutlined />
                                    Lời mời chờ phản hồi
                                    <Badge count={pendingInvitations.length} showZero />
                                    {pendingInvitations.length > 0 && (
                                        <Tooltip title="Có lời mời cần phản hồi gấp">
                                            <FireOutlined style={{ color: '#ff4d4f' }} />
                                        </Tooltip>
                                    )}
                                </Space>
                            }
                            extra={
                                <Space>
                                    <Button
                                        type="link"
                                        onClick={() => navigate('/tour-guide/invitations?tab=pending')}
                                    >
                                        Xem tất cả <RightOutlined />
                                    </Button>
                                </Space>
                            }
                            className="invitation-card"
                        >
                            {pendingInvitations.length > 0 ? (
                                <List
                                    dataSource={pendingInvitations}
                                    renderItem={(invitation) => {
                                        const canRespond = canRespondToInvitation(invitation);
                                        const isUrgent = new Date(invitation.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000; // Less than 24 hours
                                        const isExpanded = expandedInvitations.has(invitation.id);
                                        const hasViewedMessage = viewedMessages.has(invitation.id);

                                        // Can quick accept if: no message OR message has been viewed
                                        const canQuickAccept = canRespond && (!invitation.invitationMessage || hasViewedMessage);

                                        // Debug log for invitation data
                                        console.log('🔍 Dashboard invitation item:', {
                                            id: invitation.id,
                                            title: invitation.tourDetails?.title,
                                            invitationMessage: invitation.invitationMessage,
                                            hasMessage: !!invitation.invitationMessage,
                                            messageLength: invitation.invitationMessage?.length || 0,
                                            tourDetails: invitation.tourDetails,
                                            createdBy: invitation.createdBy,
                                            fullInvitation: invitation
                                        });

                                        return (
                                            <List.Item
                                                className={`invitation-item ${isUrgent ? 'urgent' : ''}`}
                                                actions={[
                                                    <Space key="actions">
                                                        <Tooltip title={isExpanded ? "Thu gọn thông tin" : "Xem thêm thông tin"}>
                                                            <Button
                                                                size="small"
                                                                icon={isExpanded ? <RightOutlined style={{ transform: 'rotate(90deg)' }} /> : <RightOutlined />}
                                                                onClick={() => toggleInvitationExpansion(invitation.id, invitation)}
                                                            />
                                                        </Tooltip>

                                                        <Tooltip title="Xem chi tiết tour">
                                                            <Button
                                                                size="small"
                                                                type="dashed"
                                                                icon={<CalendarOutlined />}
                                                                onClick={() => {
                                                                    console.log('🎯 Dashboard: Opening tour details modal for:', invitation.tourDetails.id);
                                                                    setSelectedTourDetailsId(invitation.tourDetails.id);
                                                                    setTourDetailsModalVisible(true);
                                                                }}
                                                            />
                                                        </Tooltip>
                                                        {canRespond && (
                                                            <>
                                                                <Tooltip title={
                                                                    !canQuickAccept && invitation.invitationMessage
                                                                        ? "Vui lòng mở rộng để xem tin nhắn trước khi chấp nhận"
                                                                        : "Chấp nhận lời mời"
                                                                }>
                                                                    <Button
                                                                        type="primary"
                                                                        size="small"
                                                                        icon={<CheckOutlined />}
                                                                        loading={actionLoading === invitation.id}
                                                                        disabled={!canQuickAccept}
                                                                        onClick={() => showAcceptConfirmation(invitation)}
                                                                    />
                                                                </Tooltip>
                                                                <Tooltip title="Từ chối">
                                                                    <Button
                                                                        danger
                                                                        size="small"
                                                                        icon={<CloseOutlined />}
                                                                        onClick={() => navigate(`/tour-guide/invitations?tab=pending&action=reject&id=${invitation.id}`)}
                                                                    />
                                                                </Tooltip>
                                                            </>
                                                        )}
                                                    </Space>
                                                ]}
                                            >
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar
                                                            icon={<UserOutlined />}
                                                            style={{
                                                                backgroundColor: isUrgent ? '#ff4d4f' : '#1890ff'
                                                            }}
                                                        />
                                                    }
                                                    title={
                                                        <Space>
                                                            <span>{invitation.tourDetails?.title || 'Tour không xác định'}</span>
                                                            {isUrgent && (
                                                                <Badge status="error" text="Gấp" />
                                                            )}
                                                            {invitation.invitationMessage && (
                                                                <Badge
                                                                    status={hasViewedMessage ? "success" : "processing"}
                                                                    text={hasViewedMessage ? "Đã xem" : "Có tin nhắn"}
                                                                />
                                                            )}
                                                        </Space>
                                                    }
                                                    description={
                                                        <div>
                                                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                                                {/* Always show basic info */}
                                                                <div>
                                                                    <Text strong>Công ty: </Text>
                                                                    <Text type="secondary">{invitation.createdBy?.name || 'Không xác định'}</Text>
                                                                </div>
                                                                <div>
                                                                    <Text strong>Thời gian còn lại: </Text>
                                                                    <Text type={isUrgent ? "danger" : "warning"}>
                                                                        <ClockCircleOutlined /> {formatTimeUntilExpiry(invitation.expiresAt)}
                                                                    </Text>
                                                                </div>
                                                                {invitation.invitationMessage && (
                                                                    <div>
                                                                        <Text strong style={{ color: hasViewedMessage ? '#52c41a' : '#1890ff' }}>
                                                                            {hasViewedMessage ? '✅ Đã xem tin nhắn từ công ty' : '💬 Có tin nhắn đặc biệt từ công ty'}
                                                                        </Text>
                                                                    </div>
                                                                )}

                                                                {/* Show detailed info only when expanded */}
                                                                {isExpanded && (
                                                                    <div className="expanded-details">
                                                                        <div className="detail-section-title">
                                                                            📋 Chi tiết lời mời
                                                                        </div>

                                                                        <div className="detail-item">
                                                                            <span className="detail-label">Loại lời mời:</span>
                                                                            <Badge
                                                                                color={invitation.invitationType === 'Automatic' ? 'blue' : 'green'}
                                                                                text={invitation.invitationType === 'Automatic' ? 'Tự động' :
                                                                                    invitation.invitationType === 'Manual' ? 'Thủ công' :
                                                                                        invitation.invitationType || 'Không xác định'}
                                                                            />
                                                                        </div>
                                                                        <div className="detail-item">
                                                                            <span className="detail-label">Thời gian tour:</span>
                                                                            <span className="detail-value">Chưa xác định</span>
                                                                        </div>
                                                                        <div className="detail-item">
                                                                            <span className="detail-label">Ngày mời:</span>
                                                                            <span className="detail-value" style={{ fontSize: '12px' }}>
                                                                                {new Date(invitation.invitedAt).toLocaleString('vi-VN')}
                                                                            </span>
                                                                        </div>
                                                                        <div className="detail-item">
                                                                            <span className="detail-label">Hết hạn:</span>
                                                                            <span className={`detail-value ${isUrgent ? 'urgent' : 'warning'}`} style={{ fontSize: '12px' }}>
                                                                                {new Date(invitation.expiresAt).toLocaleString('vi-VN')}
                                                                            </span>
                                                                        </div>
                                                                        <div className="detail-item">
                                                                            <span className="detail-label">Trạng thái:</span>
                                                                            <Badge
                                                                                color={invitation.status === 'Pending' ? 'orange' :
                                                                                    invitation.status === 'Accepted' ? 'green' : 'red'}
                                                                                text={invitation.status === 'Pending' ? 'Chờ phản hồi' :
                                                                                    invitation.status === 'Accepted' ? 'Đã chấp nhận' : 'Đã từ chối'}
                                                                            />
                                                                        </div>
                                                                        {/* Always show invitation message section for debugging */}
                                                                        <div className="detail-item" style={{ marginTop: 12 }}>
                                                                            <div style={{ width: '100%' }}>
                                                                                <div className="detail-section-title" style={{ fontSize: '14px', marginBottom: 8 }}>
                                                                                    💬 Tin nhắn từ công ty
                                                                                </div>
                                                                                {invitation.invitationMessage ? (
                                                                                    <div style={{
                                                                                        background: '#e6f7ff',
                                                                                        border: '1px solid #91d5ff',
                                                                                        borderRadius: '6px',
                                                                                        padding: '12px',
                                                                                        fontSize: '13px',
                                                                                        lineHeight: '1.5'
                                                                                    }}>
                                                                                        {invitation.invitationMessage}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div style={{
                                                                                        background: '#f6f6f6',
                                                                                        border: '1px solid #d9d9d9',
                                                                                        borderRadius: '6px',
                                                                                        padding: '12px',
                                                                                        fontSize: '13px',
                                                                                        color: '#999',
                                                                                        fontStyle: 'italic'
                                                                                    }}>
                                                                                        Không có tin nhắn đặc biệt
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                    </div>
                                                                )}
                                                            </Space>
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        );
                                    }}
                                />
                            ) : (
                                <div className="empty-state">
                                    <MailOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                                    <p style={{ color: '#999', marginTop: 16 }}>
                                        Không có lời mời nào chờ phản hồi
                                    </p>
                                    <Button
                                        type="link"
                                        onClick={() => navigate('/tour-guide/invitations')}
                                    >
                                        Xem tất cả lời mời
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </Col>

                    {/* Performance Overview */}
                    <Col xs={24} lg={8}>
                        <Card title="Hiệu suất" className="performance-card">
                            <div style={{ marginBottom: 16 }}>
                                <Text>Tỷ lệ chấp nhận lời mời</Text>
                                <Progress
                                    percent={statistics.acceptanceRate || 0}
                                    strokeColor="#52c41a"
                                    format={(percent) => `${percent}%`}
                                />
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <Text>Tỷ lệ từ chối</Text>
                                <Progress
                                    percent={statistics.rejectionRate || 0}
                                    strokeColor="#ff4d4f"
                                    format={(percent) => `${percent}%`}
                                />
                            </div>

                            <Alert
                                message="Mẹo"
                                description="Tỷ lệ chấp nhận cao sẽ giúp bạn nhận được nhiều lời mời hơn từ các công ty tour."
                                type="info"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Quick Actions */}
                <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                    <Col span={24}>
                        <Card title="Hành động nhanh">
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={8}>
                                    <Button
                                        type="primary"
                                        block
                                        icon={<MailOutlined />}
                                        onClick={() => navigate('/tour-guide/invitations')}
                                    >
                                        Xem tất cả lời mời
                                    </Button>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Button
                                        block
                                        icon={<CalendarOutlined />}
                                        onClick={() => navigate('/tour-guide/schedule')}
                                    >
                                        Xem lịch trình
                                    </Button>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Button
                                        block
                                        icon={<UserOutlined />}
                                        onClick={() => setProfileExpanded(!profileExpanded)}
                                    >
                                        {profileExpanded ? 'Thu gọn hồ sơ' : 'Xem hồ sơ'}
                                    </Button>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Spin>
            {/* Tour Invitation Details Modal */}
            <TourInvitationDetails
                invitationId={selectedInvitationId}
                visible={detailsModalVisible}
                onClose={() => {
                    setDetailsModalVisible(false);
                    setSelectedInvitationId('');
                }}
                onUpdate={() => {
                    loadDashboardData(false);
                }}
            />

            {/* Tour Details View Modal */}
            <TourDetailsViewModal
                visible={tourDetailsModalVisible}
                tourDetailsId={selectedTourDetailsId}
                onClose={() => {
                    setTourDetailsModalVisible(false);
                    setSelectedTourDetailsId('');
                }}
            />

            {/* Floating Incident Report Button */}
            {activeTours.length > 0 && (
                <Button
                    type="primary"
                    danger
                    size="large"
                    shape="circle"
                    icon={<FireOutlined />}
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        width: '56px',
                        height: '56px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        zIndex: 1000
                    }}
                    onClick={() => navigate('/tour-guide/incident-report')}
                    title="Báo cáo sự cố"
                />
            )}
        </div>
    );
};

export default TourGuideDashboard;
