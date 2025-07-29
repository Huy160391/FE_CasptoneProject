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
    notification
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
    EyeOutlined,
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
    canRespondToInvitation
} from '@/services/tourguideService';
import TourInvitationDetails from '@/components/tourguide/TourInvitationDetails';
import TourDetailsViewModal from '@/components/tourguide/TourDetailsViewModal';
import ProfileSection from '@/components/tourguide/ProfileSection';
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

    // Toggle invitation expansion
    const toggleInvitationExpansion = (invitationId: string) => {
        const newExpanded = new Set(expandedInvitations);
        if (newExpanded.has(invitationId)) {
            newExpanded.delete(invitationId);
        } else {
            newExpanded.add(invitationId);
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

    // Quick accept invitation
    const handleQuickAccept = async (invitationId: string) => {
        setActionLoading(invitationId);
        try {
            const response = await acceptInvitation(invitationId, '');
            if (response.success) {
                notification.success({
                    message: 'Chấp nhận thành công',
                    description: 'Bạn đã chấp nhận lời mời thành công!',
                });
                loadDashboardData(false); // Refresh data without loading spinner
            } else {
                notification.error({
                    message: 'Lỗi chấp nhận',
                    description: response.message || 'Không thể chấp nhận lời mời',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi hệ thống',
                description: 'Có lỗi xảy ra khi chấp nhận lời mời',
            });
        } finally {
            setActionLoading(null);
        }
    };

    // Auto refresh every 30 seconds
    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(() => {
            loadDashboardData(false);
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

            <Spin spinning={loading}>
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
                                        
                                        // Debug log for invitation data
                                        console.log('🔍 Dashboard invitation item:', {
                                            id: invitation.id,
                                            title: invitation.tourDetails?.title,
                                            invitationMessage: invitation.invitationMessage,
                                            tourDetails: invitation.tourDetails,
                                            createdBy: invitation.createdBy
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
                                                                onClick={() => toggleInvitationExpansion(invitation.id)}
                                                            />
                                                        </Tooltip>
                                                        <Tooltip title="Xem chi tiết lời mời">
                                                            <Button
                                                                size="small"
                                                                icon={<EyeOutlined />}
                                                                onClick={() => {
                                                                    setSelectedInvitationId(invitation.id);
                                                                    setDetailsModalVisible(true);
                                                                }}
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
                                                                <Tooltip title={invitation.invitationMessage ? "Có tin nhắn đặc biệt - Vui lòng xem chi tiết" : "Chấp nhận nhanh"}>
                                                                    <Button
                                                                        type="primary"
                                                                        size="small"
                                                                        icon={<CheckOutlined />}
                                                                        loading={actionLoading === invitation.id}
                                                                        disabled={!!invitation.invitationMessage}
                                                                        onClick={() => handleQuickAccept(invitation.id)}
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
                                                                <Badge status="processing" text="Có tin nhắn" />
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
                                                                        <Text strong style={{ color: '#1890ff' }}>
                                                                            💬 Có tin nhắn đặc biệt từ công ty
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
                                                                                text={invitation.invitationType === 'Automatic' ? 'Tự động' : 'Thủ công'}
                                                                            />
                                                                        </div>
                                                                        <div className="detail-item">
                                                                            <span className="detail-label">Thời gian tour:</span>
                                                                            <span className="detail-value">
                                                                                {invitation.tourDetails?.startDate ? 
                                                                                    new Date(invitation.tourDetails.startDate).toLocaleDateString('vi-VN') : 
                                                                                    'Chưa xác định'
                                                                                }
                                                                                {invitation.tourDetails?.endDate && 
                                                                                    ` - ${new Date(invitation.tourDetails.endDate).toLocaleDateString('vi-VN')}`
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        {invitation.tourDetails?.location && (
                                                                            <div className="detail-item">
                                                                                <span className="detail-label">Địa điểm:</span>
                                                                                <span className="detail-value">{invitation.tourDetails.location}</span>
                                                                            </div>
                                                                        )}
                                                                        {invitation.tourDetails?.price && (
                                                                            <div className="detail-item">
                                                                                <span className="detail-label">Giá tour:</span>
                                                                                <span className="detail-value price">
                                                                                    {invitation.tourDetails.price.toLocaleString('vi-VN')} VNĐ
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        {invitation.tourDetails?.maxParticipants && (
                                                                            <div className="detail-item">
                                                                                <span className="detail-label">Số khách tối đa:</span>
                                                                                <span className="detail-value">{invitation.tourDetails.maxParticipants} người</span>
                                                                            </div>
                                                                        )}
                                                                        {invitation.tourDetails?.duration && (
                                                                            <div className="detail-item">
                                                                                <span className="detail-label">Thời lượng:</span>
                                                                                <span className="detail-value">{invitation.tourDetails.duration}</span>
                                                                            </div>
                                                                        )}
                                                                        {invitation.tourDetails?.description && (
                                                                            <div className="detail-item">
                                                                                <span className="detail-label">Mô tả:</span>
                                                                                <span className="detail-value" style={{ 
                                                                                    display: 'block', 
                                                                                    marginTop: '4px',
                                                                                    fontSize: '12px',
                                                                                    color: '#666',
                                                                                    maxHeight: '60px',
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis'
                                                                                }}>
                                                                                    {invitation.tourDetails.description.length > 100 
                                                                                        ? `${invitation.tourDetails.description.substring(0, 100)}...`
                                                                                        : invitation.tourDetails.description
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        {invitation.tourDetails?.category && (
                                                                            <div className="detail-item">
                                                                                <span className="detail-label">Danh mục:</span>
                                                                                <span className="detail-value">{invitation.tourDetails.category}</span>
                                                                            </div>
                                                                        )}
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
                                                                        {invitation.invitationMessage && (
                                                                            <div className="detail-item" style={{ marginTop: 12 }}>
                                                                                <div style={{ width: '100%' }}>
                                                                                    <div className="detail-section-title" style={{ fontSize: '14px', marginBottom: 8 }}>
                                                                                        💬 Tin nhắn từ công ty
                                                                                    </div>
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
                                                                                </div>
                                                                            </div>
                                                                        )}
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
        </div>
    );
};

export default TourGuideDashboard;
