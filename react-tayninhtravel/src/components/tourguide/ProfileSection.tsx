import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Avatar,
    Upload,
    message,
    Row,
    Col,
    Typography,
    Divider,
    Tag,
    Space,
    Progress,
    Tooltip,
    Tabs,
    Badge
} from 'antd';
import {
    UserOutlined,
    UploadOutlined,
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    TrophyOutlined,
    HistoryOutlined,
    ShoppingOutlined,
    CommentOutlined,
    QuestionCircleOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useAuthStore } from '@/store/useAuthStore';
import { getMyProfile, updateMyProfile } from '@/services/tourguideService';
import BookingHistory from '@/pages/BookingHistory';
import TransactionHistory from '@/pages/TransactionHistory';
import CommentHistory from '@/pages/CommentHistory';
import SupportTicketHistory from '@/pages/SupportTicketHistory';
import RegisterHistory from '@/pages/RegisterHistory';
import './ProfileSection.scss';

const { Text } = Typography;
const { TextArea } = Input;

interface ProfileSectionProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ collapsed = true, onToggle }) => {
    const { user } = useAuthStore();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [profileData, setProfileData] = useState<any>({});
    const [activeTab, setActiveTab] = useState('personal');

    // BookingHistory component now uses real API calls instead of mock data

    const [transactionHistory] = useState([
        {
            id: 1,
            type: 'Tour booking',
            amount: '1,500,000 ₫',
            date: '2024-03-15',
            status: 'completed',
        },
        {
            id: 2,
            type: 'Product purchase',
            amount: '850,000 ₫',
            date: '2024-03-18',
            status: 'completed',
        },
    ]);

    const [commentHistory] = useState([
        {
            id: 1,
            tourName: 'Tour Tây Ninh',
            rating: 5,
            comment: 'Tour rất tuyệt vời!',
            date: '2024-03-16',
        },
    ]);

    const [supportTickets] = useState([]);
    const [ticketsLoading] = useState(false);

    // Load profile data
    const loadProfile = async () => {
        setLoading(true);
        try {
            const response = await getMyProfile();
            if (response.success) {
                setProfileData(response.data);
                form.setFieldsValue(response.data);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            message.error('Không thể tải thông tin hồ sơ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    // Handle form submission
    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const response = await updateMyProfile(values);
            if (response.success) {
                message.success('Cập nhật hồ sơ thành công!');
                setProfileData(values);
                setEditing(false);
            } else {
                message.error(response.message || 'Không thể cập nhật hồ sơ');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            message.error('Có lỗi xảy ra khi cập nhật hồ sơ');
        } finally {
            setLoading(false);
        }
    };

    // Handle avatar upload
    const handleAvatarUpload = (info: any) => {
        if (info.file.status === 'done') {
            message.success('Cập nhật ảnh đại diện thành công!');
            // Handle avatar update logic here
        } else if (info.file.status === 'error') {
            message.error('Không thể cập nhật ảnh đại diện');
        }
    };

    // Profile completion percentage
    const getProfileCompletion = () => {
        const fields = ['fullName', 'phoneNumber', 'address', 'bio', 'skills', 'experience', 'languages'];
        const completed = fields.filter(field => profileData[field] && profileData[field].toString().trim()).length;
        return Math.round((completed / fields.length) * 100);
    };

    const profileCompletion = getProfileCompletion();

    if (collapsed) {
        return (
            <Card 
                className="profile-section collapsed"
                hoverable
                onClick={onToggle}
            >
                <div className="profile-summary">
                    <Avatar
                        size={48}
                        src={user?.avatar || profileData.avatar}
                        icon={<UserOutlined />}
                    />
                    <div className="profile-info">
                        <Text strong>{user?.name || profileData.fullName || 'Tour Guide'}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Hồ sơ hoàn thành {profileCompletion}%
                        </Text>
                        <Progress 
                            percent={profileCompletion} 
                            size="small" 
                            showInfo={false}
                            strokeColor={profileCompletion >= 80 ? '#52c41a' : '#faad14'}
                        />
                    </div>
                    <div className="profile-actions">
                        <Tooltip title="Xem/Chỉnh sửa hồ sơ">
                            <Button type="text" icon={<EditOutlined />} />
                        </Tooltip>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card
            className="profile-section expanded"
            title={
                <Space>
                    <UserOutlined />
                    Hồ sơ cá nhân
                    <Tag color={profileCompletion >= 80 ? 'green' : 'orange'}>
                        {profileCompletion}% hoàn thành
                    </Tag>
                </Space>
            }
            extra={
                <Space>
                    <Button type="text" icon={<CloseOutlined />} onClick={onToggle} />
                </Space>
            }
        >
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: 'personal',
                        label: (
                            <Space>
                                <UserOutlined />
                                Thông tin cá nhân
                            </Space>
                        ),
                        children: (
                            <div className="personal-info-tab">
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    {!editing && (
                                        <Button
                                            type="primary"
                                            icon={<EditOutlined />}
                                            onClick={() => setEditing(true)}
                                        >
                                            Chỉnh sửa thông tin
                                        </Button>
                                    )}

                                    <Row gutter={[24, 24]}>
                                        {/* Profile Avatar & Basic Info */}
                                        <Col xs={24} lg={8}>
                                            <div className="profile-avatar-section">
                                                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                                    <Avatar
                                                        size={120}
                                                        src={user?.avatar || profileData.avatar}
                                                        icon={<UserOutlined />}
                                                        style={{ marginBottom: 16 }}
                                                    />
                                                    <br />
                                                    <Upload
                                                        showUploadList={false}
                                                        onChange={handleAvatarUpload}
                                                        accept="image/*"
                                                        disabled={!editing}
                                                    >
                                                        <Button
                                                            icon={<UploadOutlined />}
                                                            size="small"
                                                            disabled={!editing}
                                                        >
                                                            Đổi ảnh đại diện
                                                        </Button>
                                                    </Upload>
                                                </div>

                                                <Divider />

                                                <div className="profile-quick-info">
                                                    <div className="info-item">
                                                        <UserOutlined />
                                                        <span>{user?.name || profileData.fullName || 'Chưa cập nhật'}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <MailOutlined />
                                                        <span>{user?.email || 'Chưa cập nhật'}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <PhoneOutlined />
                                                        <span>{profileData.phoneNumber || 'Chưa cập nhật'}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <EnvironmentOutlined />
                                                        <span>{profileData.address || 'Chưa cập nhật'}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <TrophyOutlined />
                                                        <span>{profileData.experience ? `${profileData.experience} năm kinh nghiệm` : 'Chưa cập nhật'}</span>
                                                    </div>
                                                </div>

                                                <Divider />

                                                <div>
                                                    <Text strong>Trạng thái:</Text>
                                                    <br />
                                                    <Tag color="green">Đang hoạt động</Tag>
                                                </div>
                                            </div>
                                        </Col>

                                        {/* Profile Form */}
                                        <Col xs={24} lg={16}>
                                            <Form
                                                form={form}
                                                layout="vertical"
                                                onFinish={handleSubmit}
                                                disabled={!editing}
                                            >
                                                <Row gutter={[16, 16]}>
                                                    <Col xs={24} sm={12}>
                                                        <Form.Item
                                                            name="fullName"
                                                            label="Họ và tên"
                                                            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                                                        >
                                                            <Input placeholder="Nhập họ và tên" />
                                                        </Form.Item>
                                                    </Col>

                                                    <Col xs={24} sm={12}>
                                                        <Form.Item
                                                            name="phoneNumber"
                                                            label="Số điện thoại"
                                                            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                                                        >
                                                            <Input placeholder="Nhập số điện thoại" />
                                                        </Form.Item>
                                                    </Col>

                                                    <Col xs={24}>
                                                        <Form.Item
                                                            name="address"
                                                            label="Địa chỉ"
                                                        >
                                                            <Input placeholder="Nhập địa chỉ" />
                                                        </Form.Item>
                                                    </Col>

                                                    <Col xs={24}>
                                                        <Form.Item
                                                            name="bio"
                                                            label="Giới thiệu bản thân"
                                                        >
                                                            <TextArea
                                                                rows={4}
                                                                placeholder="Viết một đoạn giới thiệu ngắn về bản thân..."
                                                                maxLength={500}
                                                                showCount
                                                            />
                                                        </Form.Item>
                                                    </Col>

                                                    <Col xs={24}>
                                                        <Form.Item
                                                            name="skills"
                                                            label="Kỹ năng và chuyên môn"
                                                        >
                                                            <TextArea
                                                                rows={3}
                                                                placeholder="Mô tả các kỹ năng và chuyên môn của bạn..."
                                                                maxLength={300}
                                                                showCount
                                                            />
                                                        </Form.Item>
                                                    </Col>

                                                    <Col xs={24} sm={12}>
                                                        <Form.Item
                                                            name="experience"
                                                            label="Kinh nghiệm (năm)"
                                                        >
                                                            <Input type="number" placeholder="Số năm kinh nghiệm" />
                                                        </Form.Item>
                                                    </Col>

                                                    <Col xs={24} sm={12}>
                                                        <Form.Item
                                                            name="languages"
                                                            label="Ngôn ngữ"
                                                        >
                                                            <Input placeholder="VD: Tiếng Việt, Tiếng Anh, Tiếng Pháp" />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                {editing && (
                                                    <Row>
                                                        <Col span={24} style={{ textAlign: 'right' }}>
                                                            <Space>
                                                                <Button
                                                                    onClick={() => {
                                                                        setEditing(false);
                                                                        form.setFieldsValue(profileData);
                                                                    }}
                                                                >
                                                                    Hủy
                                                                </Button>
                                                                <Button
                                                                    type="primary"
                                                                    icon={<SaveOutlined />}
                                                                    onClick={() => form.submit()}
                                                                    loading={loading}
                                                                >
                                                                    Lưu thay đổi
                                                                </Button>
                                                            </Space>
                                                        </Col>
                                                    </Row>
                                                )}
                                            </Form>
                                        </Col>
                                    </Row>
                                </Space>
                            </div>
                        )
                    },
                    {
                        key: 'bookings',
                        label: (
                            <Space>
                                <HistoryOutlined />
                                Lịch sử đặt tour
                            </Space>
                        ),
                        children: <BookingHistory />
                    },
                    {
                        key: 'transactions',
                        label: (
                            <Space>
                                <ShoppingOutlined />
                                Lịch sử giao dịch
                                <Badge count={transactionHistory.length} showZero />
                            </Space>
                        ),
                        children: <TransactionHistory data={transactionHistory} />
                    },
                    {
                        key: 'comments',
                        label: (
                            <Space>
                                <CommentOutlined />
                                Lịch sử đánh giá
                                <Badge count={commentHistory.length} showZero />
                            </Space>
                        ),
                        children: <CommentHistory data={commentHistory} />
                    },
                    {
                        key: 'support-tickets',
                        label: (
                            <Space>
                                <QuestionCircleOutlined />
                                Yêu cầu hỗ trợ
                                <Badge count={supportTickets.length} showZero />
                            </Space>
                        ),
                        children: <SupportTicketHistory data={supportTickets} loading={ticketsLoading} />
                    },
                    {
                        key: 'register-history',
                        label: (
                            <Space>
                                <CalendarOutlined />
                                Lịch sử đăng ký
                            </Space>
                        ),
                        children: <RegisterHistory />
                    }
                ]}
            />
        </Card>
    );
};

export default ProfileSection;
