import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Tag,
    Space,
    Modal,
    Input,
    message,
    Tabs,
    Row,
    Col,
    Statistic,
    Typography,
    Tooltip,
    Badge,
    Empty,
    Alert
} from 'antd';
import {
    CheckOutlined,
    CloseOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    ReloadOutlined
} from '@ant-design/icons';

import { TourGuideInvitation } from '@/types/tour';
import {
    getMyInvitations,
    acceptInvitation,
    rejectInvitation,
    formatTimeUntilExpiry,
    canRespondToInvitation
} from '@/services/tourguideService';
import { getVietnamNow, toVietnamTime } from '../../utils/vietnamTimezone';
import TourInvitationDetails from '@/components/tourguide/TourInvitationDetails';
import './TourGuideInvitations.scss';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const TourGuideInvitations: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [invitations, setInvitations] = useState<TourGuideInvitation[]>([]);
    const [statistics, setStatistics] = useState<any>({});
    const [activeTab, setActiveTab] = useState<string>('all');
    const [selectedInvitation, setSelectedInvitation] = useState<TourGuideInvitation | null>(null);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [acceptModalVisible, setAcceptModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [acceptanceMessage, setAcceptanceMessage] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedInvitationId, setSelectedInvitationId] = useState<string>('');
    const [hasViewedInvitationMessage, setHasViewedInvitationMessage] = useState(false);

    // Load invitations
    const loadInvitations = async (status?: string) => {
        setLoading(true);
        try {
            const response = await getMyInvitations(status);
            console.log('API Response:', response);
            if (response.success && response.data) {
                setInvitations(response.data.invitations || []);
                setStatistics(response.data.statistics || {});
            } else {
                message.error(response.message || 'Không thể tải danh sách lời mời');
            }
        } catch (error: any) {
            console.error('Error loading invitations:', error);
            message.error('Có lỗi xảy ra khi tải danh sách lời mời');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInvitations();
    }, []);

    // Handle tab change
    const handleTabChange = (key: string) => {
        setActiveTab(key);
        const statusMap: { [key: string]: string | undefined } = {
            'all': undefined,
            'pending': 'Pending',
            'accepted': 'Accepted',
            'rejected': 'Rejected',
            'expired': 'Expired'
        };
        loadInvitations(statusMap[key]);
    };

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
        if (!selectedInvitation) return;

        setActionLoading(true);
        try {
            const response = await acceptInvitation(
                selectedInvitation.id,
                acceptanceMessage || undefined
            );

            if (response.success) {
                message.success('Đã chấp nhận lời mời thành công!');
                setAcceptModalVisible(false);
                setAcceptanceMessage('');
                setSelectedInvitation(null);
                loadInvitations(activeTab === 'all' ? undefined : activeTab);
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
        if (!selectedInvitation || !rejectionReason.trim()) {
            message.error('Vui lòng nhập lý do từ chối');
            return;
        }
        
        setActionLoading(true);
        try {
            const response = await rejectInvitation(
                selectedInvitation.id,
                rejectionReason.trim()
            );
            
            if (response.success) {
                message.success('Đã từ chối lời mời');
                setRejectModalVisible(false);
                setRejectionReason('');
                setSelectedInvitation(null);
                loadInvitations(activeTab === 'all' ? undefined : activeTab);
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

    // Table columns
    const columns = [
        {
            title: 'Tour',
            dataIndex: ['tourDetails', 'title'],
            key: 'tourTitle',
            render: (title: string, record: TourGuideInvitation) => (
                <div>
                    <Text strong>{title}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        ID: {record.tourDetails.id.substring(0, 8)}...
                    </Text>
                </div>
            ),
        },
        {
            title: 'Công ty',
            dataIndex: ['createdBy', 'name'],
            key: 'companyName',
        },
        {
            title: 'Loại mời',
            dataIndex: 'invitationType',
            key: 'invitationType',
            render: (type: string) => (
                <Tag color={type === 'Automatic' ? 'blue' : 'green'}>
                    {type === 'Automatic' ? 'Tự động' : 'Thủ công'}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
        },
        {
            title: 'Thời gian còn lại',
            key: 'timeRemaining',
            render: (record: TourGuideInvitation) => {
                if (record.status !== 'Pending') {
                    return <Text type="secondary">-</Text>;
                }
                
                const timeRemaining = formatTimeUntilExpiry(record.expiresAt);
                const isExpiringSoon = toVietnamTime(new Date(record.expiresAt)).getTime() - getVietnamNow().getTime() < 24 * 60 * 60 * 1000;
                
                return (
                    <Text style={{ color: isExpiringSoon ? '#faad14' : undefined }}>
                        <ClockCircleOutlined /> {timeRemaining}
                    </Text>
                );
            },
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (record: TourGuideInvitation) => {
                const canRespond = canRespondToInvitation(record);
                
                return (
                    <Space>
                        {canRespond && (
                            <>
                                <Tooltip title="Chấp nhận lời mời">
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<CheckOutlined />}
                                        onClick={() => {
                                            setSelectedInvitation(record);
                                            // Reset viewed state and check if invitation has message
                                            if (record.invitationMessage) {
                                                setHasViewedInvitationMessage(false);
                                            } else {
                                                setHasViewedInvitationMessage(true);
                                            }
                                            setAcceptModalVisible(true);
                                        }}
                                    >
                                        Chấp nhận
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Từ chối lời mời">
                                    <Button
                                        danger
                                        size="small"
                                        icon={<CloseOutlined />}
                                        onClick={() => {
                                            setSelectedInvitation(record);
                                            setRejectModalVisible(true);
                                        }}
                                    >
                                        Từ chối
                                    </Button>
                                </Tooltip>
                            </>
                        )}
                        <Tooltip title="Xem chi tiết">
                            <Button
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => {
                                    setSelectedInvitationId(record.id);
                                    setDetailsModalVisible(true);
                                }}
                            />
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="tour-guide-invitations">
            <div className="page-header">
                <Title level={2}>Lời mời tham gia Tour</Title>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => loadInvitations(activeTab === 'all' ? undefined : activeTab)}
                    loading={loading}
                >
                    Làm mới
                </Button>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng lời mời"
                            value={statistics.totalInvitations || 0}
                            prefix={<Badge status="default" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Chờ phản hồi"
                            value={statistics.pendingInvitations || 0}
                            prefix={<Badge status="processing" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đã chấp nhận"
                            value={statistics.acceptedInvitations || 0}
                            prefix={<Badge status="success" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tỷ lệ chấp nhận"
                            value={statistics.acceptanceRate || 0}
                            suffix="%"
                            prefix={<Badge status="success" />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Invitations Table */}
            <Card>
                <Tabs activeKey={activeTab} onChange={handleTabChange}>
                    <TabPane tab="Tất cả" key="all" />
                    <TabPane 
                        tab={
                            <Badge count={statistics.pendingInvitations || 0} size="small">
                                Chờ phản hồi
                            </Badge>
                        } 
                        key="pending" 
                    />
                    <TabPane tab="Đã chấp nhận" key="accepted" />
                    <TabPane tab="Đã từ chối" key="rejected" />
                    <TabPane tab="Đã hết hạn" key="expired" />
                </Tabs>

                <Table
                    columns={columns}
                    dataSource={invitations}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                            `${range[0]}-${range[1]} của ${total} lời mời`,
                    }}
                    locale={{
                        emptyText: <Empty description="Không có lời mời nào" />
                    }}
                />
            </Card>

            {/* Accept Modal */}
            <Modal
                title="Chấp nhận lời mời"
                open={acceptModalVisible}
                onOk={handleAccept}
                onCancel={() => {
                    setAcceptModalVisible(false);
                    setAcceptanceMessage('');
                    setSelectedInvitation(null);
                }}
                confirmLoading={actionLoading}
                okText="Chấp nhận"
                cancelText="Hủy"
                okButtonProps={{ 
                    disabled: !hasViewedInvitationMessage 
                }}
            >
                <p>
                    Bạn có chắc chắn muốn chấp nhận lời mời tham gia tour{' '}
                    <strong>{selectedInvitation?.tourDetails.title}</strong>?
                </p>
                
                {/* Display invitation message if exists */}
                {selectedInvitation?.invitationMessage && (
                    <div style={{ marginBottom: 16 }}>
                        <Alert
                            message="Tin nhắn đặc biệt từ công ty tour"
                            description={
                                <div>
                                    <p style={{ marginBottom: 12 }}>
                                        {selectedInvitation.invitationMessage}
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
                        />
                    </div>
                )}

                {/* Warning if message not read */}
                {selectedInvitation?.invitationMessage && !hasViewedInvitationMessage && (
                    <Alert
                        message="Vui lòng đọc tin nhắn từ công ty tour trước khi chấp nhận lời mời"
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}
                
                <TextArea
                    placeholder="Tin nhắn chấp nhận (tùy chọn)"
                    value={acceptanceMessage}
                    onChange={(e) => setAcceptanceMessage(e.target.value)}
                    rows={3}
                    maxLength={500}
                />
            </Modal>

            {/* Reject Modal */}
            <Modal
                title="Từ chối lời mời"
                open={rejectModalVisible}
                onOk={handleReject}
                onCancel={() => {
                    setRejectModalVisible(false);
                    setRejectionReason('');
                    setSelectedInvitation(null);
                }}
                confirmLoading={actionLoading}
                okText="Từ chối"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <p>
                    Bạn có chắc chắn muốn từ chối lời mời tham gia tour{' '}
                    <strong>{selectedInvitation?.tourDetails.title}</strong>?
                </p>
                <TextArea
                    placeholder="Lý do từ chối (bắt buộc) *"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    maxLength={500}
                    required
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                    * Lý do từ chối sẽ được gửi đến công ty tour để cải thiện dịch vụ
                </Text>
            </Modal>

            {/* Tour Invitation Details Modal */}
            <TourInvitationDetails
                invitationId={selectedInvitationId}
                visible={detailsModalVisible}
                onClose={() => {
                    setDetailsModalVisible(false);
                    setSelectedInvitationId('');
                }}
                onUpdate={() => {
                    loadInvitations(activeTab === 'all' ? undefined : activeTab);
                }}
            />
        </div>
    );
};

export default TourGuideInvitations;
