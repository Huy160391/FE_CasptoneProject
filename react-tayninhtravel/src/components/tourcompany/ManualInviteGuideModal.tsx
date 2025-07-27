import React, { useState, useEffect } from 'react';
import {
    Modal,
    Table,
    Button,
    Space,
    Tag,
    Avatar,
    Typography,
    Spin,
    message,
    Alert,
    Input,
    Card,
    Row,
    Col,
    Statistic,
    Empty
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    SendOutlined,
    SearchOutlined,
    StarOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { useAuthStore } from '@/store/useAuthStore';
import { getTourGuides, getAvailableTourGuides, manualInviteGuide } from '../../services/tourcompanyService';

const { Text } = Typography;
const { Search } = Input;

interface TourGuide {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    isActive: boolean;
    isAvailable: boolean;
    experienceYears: number;
    specialization?: string;
    averageRating?: number;
    completedTours: number;
    joinedDate: string;
    currentStatus: string;
}

interface ManualInviteGuideModalProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    tourDetailsId: string | null;
    tourInfo?: {
        title: string;
        startDate: string;
        endDate: string;
    };
}

const ManualInviteGuideModal: React.FC<ManualInviteGuideModalProps> = ({
    visible,
    onCancel,
    onSuccess,
    tourDetailsId,
    tourInfo
}) => {
    const [guides, setGuides] = useState<TourGuide[]>([]);
    const [filteredGuides, setFilteredGuides] = useState<TourGuide[]>([]);
    const [loading, setLoading] = useState(false);
    const [inviting, setInviting] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [showAvailableOnly, setShowAvailableOnly] = useState(false);
    const { token } = useAuthStore();

    useEffect(() => {
        if (visible && tourDetailsId) {
            loadTourGuides();
        }
    }, [visible, tourDetailsId]);

    useEffect(() => {
        filterGuides();
    }, [guides, searchText, showAvailableOnly]);

    const loadTourGuides = async () => {
        if (!token || !tourInfo) return;

        setLoading(true);
        try {
            let response;
            console.log('🔍 Loading tour guides, showAvailableOnly:', showAvailableOnly);

            if (showAvailableOnly && tourInfo.startDate) {
                // Get available guides for tour date
                const tourDate = new Date(tourInfo.startDate).toISOString().split('T')[0];
                console.log('📅 Getting available guides for date:', tourDate);
                response = await getAvailableTourGuides(tourDate, undefined, token);
            } else {
                // Get all guides
                console.log('👥 Getting all guides');
                response = await getTourGuides(false, token);
            }

            console.log('📡 Tour guides API response:', response);

            // Handle both direct array response and ApiResponse wrapper
            if (Array.isArray(response)) {
                // Direct array response from backend
                console.log('✅ Direct array response, guides count:', response.length);
                setGuides(response);
            } else if (response.success) {
                // ApiResponse wrapper
                console.log('✅ ApiResponse wrapper, guides count:', response.data?.length || 0);
                setGuides(response.data || []);
            } else {
                console.log('❌ API error:', response.message);
                message.error(response.message || 'Không thể tải danh sách hướng dẫn viên');
            }
        } catch (error: any) {
            console.error('Error loading tour guides:', error);
            message.error('Có lỗi xảy ra khi tải danh sách hướng dẫn viên');
        } finally {
            setLoading(false);
        }
    };

    const filterGuides = () => {
        let filtered = guides;

        if (searchText) {
            filtered = filtered.filter(guide =>
                guide.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
                guide.email.toLowerCase().includes(searchText.toLowerCase()) ||
                guide.phoneNumber.includes(searchText)
            );
        }

        if (showAvailableOnly) {
            filtered = filtered.filter(guide => guide.isActive && guide.isAvailable);
        }

        setFilteredGuides(filtered);
    };

    const handleInviteGuide = async (guideId: string) => {
        if (!tourDetailsId || !token) {
            message.error('Thiếu thông tin cần thiết để gửi lời mời');
            return;
        }

        setInviting(guideId);
        try {
            const response = await manualInviteGuide(tourDetailsId, guideId, token);

            if (response.success) {
                message.success('Đã gửi lời mời thành công! Hướng dẫn viên sẽ nhận được email thông báo.');
                onSuccess();
            } else {
                message.error(response.message || 'Có lỗi xảy ra khi gửi lời mời');
            }
        } catch (error: any) {
            console.error('Error inviting guide:', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi lời mời');
        } finally {
            setInviting(null);
        }
    };

    const handleCancel = () => {
        setSearchText('');
        setGuides([]);
        setFilteredGuides([]);
        onCancel();
    };

    const columns = [
        {
            title: 'Hướng dẫn viên',
            key: 'guide',
            render: (_: any, record: TourGuide) => (
                <Space>
                    <Avatar size="large" icon={<UserOutlined />} />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{record.fullName}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.experienceYears} năm kinh nghiệm
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Liên hệ',
            key: 'contact',
            render: (_: any, record: TourGuide) => (
                <div>
                    <div style={{ marginBottom: 4 }}>
                        <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                        <Text style={{ fontSize: '12px' }}>{record.email}</Text>
                    </div>
                    <div>
                        <PhoneOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                        <Text style={{ fontSize: '12px' }}>{record.phoneNumber}</Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Thống kê',
            key: 'stats',
            render: (_: any, record: TourGuide) => (
                <div>
                    <div style={{ marginBottom: 4 }}>
                        <StarOutlined style={{ marginRight: 4, color: '#faad14' }} />
                        <Text style={{ fontSize: '12px' }}>
                            {record.averageRating ? `${record.averageRating}/5` : 'Chưa có đánh giá'}
                        </Text>
                    </div>
                    <div>
                        <CheckCircleOutlined style={{ marginRight: 4, color: '#52c41a' }} />
                        <Text style={{ fontSize: '12px' }}>{record.completedTours} tour hoàn thành</Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_: any, record: TourGuide) => (
                <Space direction="vertical" size="small">
                    <Tag color={record.isActive ? 'green' : 'red'}>
                        {record.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </Tag>
                    <Tag color={record.isAvailable ? 'blue' : 'orange'}>
                        {record.isAvailable ? 'Có sẵn' : 'Bận'}
                    </Tag>
                </Space>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_: any, record: TourGuide) => (
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={() => handleInviteGuide(record.id)}
                    loading={inviting === record.id}
                    disabled={!record.isActive || !record.isAvailable}
                    size="small"
                >
                    Mời
                </Button>
            ),
        },
    ];

    return (
        <Modal
            title={
                <Space>
                    <UserOutlined />
                    <span>Mời thủ công hướng dẫn viên</span>
                    {tourInfo && (
                        <Text type="secondary">- {tourInfo.title}</Text>
                    )}
                </Space>
            }
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={1000}
            destroyOnClose
        >
            {tourInfo && (
                <Card size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Statistic
                                title="Tour"
                                value={tourInfo.title}
                                valueStyle={{ fontSize: '14px' }}
                            />
                        </Col>
                        <Col span={8}>
                            <Statistic
                                title="Ngày bắt đầu"
                                value={new Date(tourInfo.startDate).toLocaleDateString('vi-VN')}
                                prefix={<CalendarOutlined />}
                                valueStyle={{ fontSize: '14px' }}
                            />
                        </Col>
                        <Col span={8}>
                            <Statistic
                                title="Ngày kết thúc"
                                value={new Date(tourInfo.endDate).toLocaleDateString('vi-VN')}
                                prefix={<CalendarOutlined />}
                                valueStyle={{ fontSize: '14px' }}
                            />
                        </Col>
                    </Row>
                </Card>
            )}

            <Alert
                message="Lưu ý"
                description="Chức năng này dùng để mời thủ công hướng dẫn viên khi hệ thống không tìm được guide phù hợp hoặc các guide đã từ chối lời mời tự động."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
                <Search
                    placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                    prefix={<SearchOutlined />}
                />
                <Space>
                    <Button
                        type={showAvailableOnly ? 'primary' : 'default'}
                        onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                        icon={showAvailableOnly ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    >
                        {showAvailableOnly ? 'Chỉ hiện có sẵn' : 'Hiện tất cả'}
                    </Button>
                    <Button onClick={loadTourGuides} loading={loading}>
                        Làm mới
                    </Button>
                </Space>
            </Space>

            <Spin spinning={loading}>
                {filteredGuides.length === 0 ? (
                    <Empty
                        description="Không tìm thấy hướng dẫn viên nào"
                        style={{ margin: '40px 0' }}
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredGuides}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: false,
                            showQuickJumper: true,
                            showTotal: (total) => `Tổng ${total} hướng dẫn viên`
                        }}
                        size="small"
                    />
                )}
            </Spin>
        </Modal>
    );
};

export default ManualInviteGuideModal;
