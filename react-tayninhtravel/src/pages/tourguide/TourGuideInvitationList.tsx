import React, { useState, useEffect, useCallback } from 'react';
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
    Spin,
    Descriptions,
    Divider,
    Alert,
    Select,
    DatePicker,
    Dropdown,
    Menu,
    Progress
} from 'antd';
import {
    CheckOutlined,
    CloseOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    ReloadOutlined,
    SearchOutlined,
    SortAscendingOutlined,
    DownOutlined,
    CalendarOutlined,
    FireOutlined
} from '@ant-design/icons';
import { TourGuideInvitation } from '@/types/tour';
import {
    getMyInvitations,
    acceptInvitation,
    rejectInvitation,
    formatTimeUntilExpiry,
    canRespondToInvitation,
    validateInvitationAcceptance,
    getInvitationDetails
} from '@/services/tourguideService';
import type { Dayjs } from 'dayjs';
import './TourGuideInvitations.scss';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const TourGuideInvitationList: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [invitations, setInvitations] = useState<TourGuideInvitation[]>([]);
    const [filteredInvitations, setFilteredInvitations] = useState<TourGuideInvitation[]>([]);
    const [statistics, setStatistics] = useState<any>({});
    const [activeTab, setActiveTab] = useState<string>('all');
    const [selectedInvitation, setSelectedInvitation] = useState<TourGuideInvitation | null>(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [acceptModalVisible, setAcceptModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [acceptanceMessage, setAcceptanceMessage] = useState('');

    // Enhanced filtering states
    const [searchText, setSearchText] = useState('');
    const [sortBy, setSortBy] = useState<string>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
    const [companyFilter, setCompanyFilter] = useState<string>('');
    const [actionLoading, setActionLoading] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [invitationDetails, setInvitationDetails] = useState<any>(null);
    const [validationResult, setValidationResult] = useState<any>(null);
    const [validationLoading, setValidationLoading] = useState(false);

    // Load invitations
    const loadInvitations = useCallback(async (status?: string) => {
        setLoading(true);
        try {
            const response = await getMyInvitations(status);
            console.log('📡 API Response:', response);
            console.log('📡 Response structure:', {
                hasSuccess: 'success' in response,
                hasData: 'data' in response,
                hasInvitations: 'invitations' in response,
                responseKeys: Object.keys(response)
            });

            // Check if response has invitations directly (backend structure)
            if (response.success && (response as any).invitations) {
                const invitationsData = (response as any).invitations || [];
                console.log('📋 Setting invitations (direct):', invitationsData.length, 'items');
                setInvitations(invitationsData);
                setStatistics((response as any).statistics || {});
            }
            // Check if response has data wrapper (frontend structure)
            else if (response.success && response.data) {
                const invitationsData = response.data.invitations || [];
                console.log('📋 Setting invitations (wrapped):', invitationsData.length, 'items');
                setInvitations(invitationsData);
                setStatistics(response.data.statistics || {});
            } else {
                console.log('❌ Response structure not recognized:', response);
                message.error(response.message || 'Không thể tải danh sách lời mời');
            }
        } catch (error: any) {
            console.error('❌ Error loading invitations:', error);
            message.error('Có lỗi xảy ra khi tải danh sách lời mời');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInvitations();
    }, [loadInvitations]);

    // Debug log for render
    useEffect(() => {
        console.log('🎨 Render state:', {
            invitations: invitations.length,
            filteredInvitations: filteredInvitations.length,
            loading,
            activeTab
        });
    }, [invitations, filteredInvitations, loading, activeTab]);

    // Enhanced filtering and sorting
    const applyFilters = useCallback(() => {
        console.log('🔍 applyFilters called with:', {
            invitationsLength: invitations.length,
            searchText,
            companyFilter,
            dateRange,
            sortBy,
            sortOrder
        });

        let filtered = [...invitations];

        // Text search
        if (searchText) {
            filtered = filtered.filter(invitation =>
                invitation.tourDetails.title.toLowerCase().includes(searchText.toLowerCase()) ||
                invitation.createdBy.name.toLowerCase().includes(searchText.toLowerCase())
            );
            console.log('📝 After text search:', filtered.length);
        }

        // Company filter
        if (companyFilter) {
            filtered = filtered.filter(invitation =>
                invitation.createdBy.name === companyFilter
            );
            console.log('🏢 After company filter:', filtered.length);
        }

        // Date range filter
        if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
            filtered = filtered.filter(invitation => {
                const inviteDate = new Date(invitation.invitedAt);
                return inviteDate >= dateRange[0]!.toDate() && inviteDate <= dateRange[1]!.toDate();
            });
            console.log('📅 After date filter:', filtered.length);
        }

        // Sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'title':
                    aValue = a.tourDetails.title;
                    bValue = b.tourDetails.title;
                    break;
                case 'company':
                    aValue = a.createdBy.name;
                    bValue = b.createdBy.name;
                    break;
                case 'expiresAt':
                    aValue = new Date(a.expiresAt);
                    bValue = new Date(b.expiresAt);
                    break;
                default:
                    aValue = new Date(a.invitedAt);
                    bValue = new Date(b.invitedAt);
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        console.log('✅ Final filtered invitations:', filtered.length);
        setFilteredInvitations(filtered);
    }, [invitations, searchText, companyFilter, dateRange, sortBy, sortOrder]);

    // Apply filters when dependencies change
    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

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

    // Load invitation details
    const loadInvitationDetails = async (invitationId: string) => {
        setDetailsLoading(true);
        try {
            const response = await getInvitationDetails(invitationId);
            if (response.success) {
                setInvitationDetails(response.data);
            } else {
                message.error(response.message || 'Không thể tải chi tiết lời mời');
            }
        } catch (error: any) {
            console.error('Error loading invitation details:', error);
            message.error('Có lỗi xảy ra khi tải chi tiết lời mời');
        } finally {
            setDetailsLoading(false);
        }
    };

    // Validate invitation acceptance
    const validateAcceptance = async (invitationId: string) => {
        setValidationLoading(true);
        try {
            const response = await validateInvitationAcceptance(invitationId);
            setValidationResult(response);
            return response.success;
        } catch (error: any) {
            console.error('Error validating invitation:', error);
            message.error('Có lỗi xảy ra khi kiểm tra lời mời');
            return false;
        } finally {
            setValidationLoading(false);
        }
    };

    // Handle view details
    const handleViewDetails = async (invitation: TourGuideInvitation) => {
        setSelectedInvitation(invitation);
        setDetailsModalVisible(true);
        await loadInvitationDetails(invitation.id);
    };

    // Handle accept invitation
    const handleAccept = async () => {
        if (!selectedInvitation) return;
        
        // Validate first
        const isValid = await validateAcceptance(selectedInvitation.id);
        if (!isValid) return;
        
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
                message.error(response.message || 'Không thể chấp nhận lời mời');
            }
        } catch (error: any) {
            console.error('Error accepting invitation:', error);
            message.error('Có lỗi xảy ra khi chấp nhận lời mời');
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
                const isExpiringSoon = new Date(record.expiresAt).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000;
                
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
                                onClick={() => handleViewDetails(record)}
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

            {/* Enhanced Filtering Controls */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Tìm kiếm theo tên tour hoặc công ty..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Select
                            placeholder="Công ty"
                            value={companyFilter}
                            onChange={setCompanyFilter}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {Array.from(new Set(invitations.map(inv => inv.createdBy.name))).map(company => (
                                <Option key={company} value={company}>{company}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <RangePicker
                            placeholder={['Từ ngày', 'Đến ngày']}
                            value={dateRange}
                            onChange={setDateRange}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Space>
                            <Dropdown
                                overlay={
                                    <Menu onClick={({ key }) => setSortBy(key)}>
                                        <Menu.Item key="invitedAt">Ngày mời</Menu.Item>
                                        <Menu.Item key="title">Tên tour</Menu.Item>
                                        <Menu.Item key="company">Công ty</Menu.Item>
                                        <Menu.Item key="expiresAt">Hạn phản hồi</Menu.Item>
                                    </Menu>
                                }
                            >
                                <Button>
                                    <SortAscendingOutlined /> Sắp xếp <DownOutlined />
                                </Button>
                            </Dropdown>
                            <Button
                                type={sortOrder === 'desc' ? 'primary' : 'default'}
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            >
                                {sortOrder === 'desc' ? '↓' : '↑'}
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Enhanced Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card hoverable className="stat-card">
                        <Statistic
                            title="Tổng lời mời"
                            value={statistics.totalInvitations || 0}
                            prefix={<CalendarOutlined style={{ color: '#722ed1' }} />}
                        />
                        <Progress
                            percent={100}
                            showInfo={false}
                            strokeColor="#722ed1"
                            size="small"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card hoverable className="stat-card urgent">
                        <Statistic
                            title="Chờ phản hồi"
                            value={statistics.pendingCount || 0}
                            prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
                        />
                        <Progress
                            percent={((statistics.pendingCount || 0) / (statistics.totalInvitations || 1)) * 100}
                            showInfo={false}
                            strokeColor="#1890ff"
                            size="small"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card hoverable className="stat-card">
                        <Statistic
                            title="Đã chấp nhận"
                            value={statistics.acceptedCount || 0}
                            prefix={<CheckOutlined style={{ color: '#52c41a' }} />}
                        />
                        <Progress
                            percent={((statistics.acceptedCount || 0) / (statistics.totalInvitations || 1)) * 100}
                            showInfo={false}
                            strokeColor="#52c41a"
                            size="small"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card hoverable className="stat-card">
                        <Statistic
                            title="Tỷ lệ chấp nhận"
                            value={statistics.acceptanceRate || 0}
                            suffix="%"
                            prefix={<FireOutlined style={{ color: '#faad14' }} />}
                        />
                        <Progress
                            percent={statistics.acceptanceRate || 0}
                            showInfo={false}
                            strokeColor="#faad14"
                            size="small"
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
                            <Badge count={statistics.pendingCount || 0} size="small">
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
                    dataSource={filteredInvitations}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} lời mời`,
                        pageSizeOptions: ['5', '10', '20', '50'],
                    }}
                    locale={{
                        emptyText: (
                            <Empty
                                description={
                                    searchText || companyFilter || (dateRange && dateRange.length > 0)
                                        ? "Không tìm thấy lời mời nào phù hợp với bộ lọc"
                                        : "Không có lời mời nào"
                                }
                            />
                        )
                    }}
                    scroll={{ x: 800 }}
                    size="middle"
                />
            </Card>

            {/* Details Modal */}
            <Modal
                title="Chi tiết lời mời"
                open={detailsModalVisible}
                onCancel={() => {
                    setDetailsModalVisible(false);
                    setSelectedInvitation(null);
                    setInvitationDetails(null);
                }}
                footer={[
                    <Button key="close" onClick={() => {
                        setDetailsModalVisible(false);
                        setSelectedInvitation(null);
                        setInvitationDetails(null);
                    }}>
                        Đóng
                    </Button>
                ]}
                width={700}
            >
                {detailsLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Spin size="large" />
                        <div style={{ marginTop: '10px' }}>Đang tải thông tin...</div>
                    </div>
                ) : invitationDetails ? (
                    <div className="invitation-details">
                        <Descriptions title="Thông tin Tour" bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                            <Descriptions.Item label="Tên Tour">{invitationDetails.tourDetails.title}</Descriptions.Item>
                            <Descriptions.Item label="Công ty">{invitationDetails.createdBy.name}</Descriptions.Item>
                            <Descriptions.Item label="Ngày bắt đầu">{new Date(invitationDetails.tourDetails.startDate).toLocaleDateString('vi-VN')}</Descriptions.Item>
                            <Descriptions.Item label="Ngày kết thúc">{new Date(invitationDetails.tourDetails.endDate).toLocaleDateString('vi-VN')}</Descriptions.Item>
                            <Descriptions.Item label="Địa điểm">{invitationDetails.tourDetails.location}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={getStatusColor(invitationDetails.status)}>
                                    {getStatusText(invitationDetails.status)}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                        
                        <Divider />
                        
                        <Paragraph>
                            <Text strong>Mô tả Tour:</Text>
                            <div className="tour-description">
                                {invitationDetails.tourDetails.description || 'Không có mô tả'}
                            </div>
                        </Paragraph>
                        
                        {invitationDetails.status === 'Pending' && (
                            <div className="invitation-actions" style={{ marginTop: '20px' }}>
                                <Space>
                                    <Button 
                                        type="primary" 
                                        icon={<CheckOutlined />}
                                        onClick={() => {
                                            setDetailsModalVisible(false);
                                            setAcceptModalVisible(true);
                                        }}
                                    >
                                        Chấp nhận lời mời
                                    </Button>
                                    <Button 
                                        danger 
                                        icon={<CloseOutlined />}
                                        onClick={() => {
                                            setDetailsModalVisible(false);
                                            setRejectModalVisible(true);
                                        }}
                                    >
                                        Từ chối lời mời
                                    </Button>
                                </Space>
                            </div>
                        )}
                    </div>
                ) : (
                    <Empty description="Không có thông tin chi tiết" />
                )}
            </Modal>

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
            >
                {validationLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Spin />
                        <div>Đang kiểm tra...</div>
                    </div>
                ) : validationResult && !validationResult.success ? (
                    <Alert
                        message="Không thể chấp nhận lời mời"
                        description={validationResult.message || "Có lỗi xảy ra khi kiểm tra lời mời"}
                        type="error"
                        showIcon
                    />
                ) : (
                    <>
                        <p>
                            Bạn có chắc chắn muốn chấp nhận lời mời tham gia tour{' '}
                            <strong>{selectedInvitation?.tourDetails.title}</strong>?
                        </p>
                        <TextArea
                            placeholder="Tin nhắn chấp nhận (tùy chọn)"
                            value={acceptanceMessage}
                            onChange={(e) => setAcceptanceMessage(e.target.value)}
                            rows={3}
                            maxLength={500}
                        />
                    </>
                )}
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
        </div>
    );
};

export default TourGuideInvitationList;
