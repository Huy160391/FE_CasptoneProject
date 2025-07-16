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
    Space
} from 'antd';
import {
    UserOutlined,
    UploadOutlined,
    EditOutlined,
    SaveOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { getMyProfile, updateMyProfile } from '@/services/tourguideService';

const { Title, Text } = Typography;
const { TextArea } = Input;

const TourGuideProfile: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [profileData, setProfileData] = useState<any>({});

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

    // Handle form submit
    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const response = await updateMyProfile(values);
            if (response.success) {
                message.success('Cập nhật hồ sơ thành công!');
                setEditing(false);
                setProfileData({ ...profileData, ...values });
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
            // TODO: Update avatar in profile
        } else if (info.file.status === 'error') {
            message.error('Không thể tải lên ảnh đại diện');
        }
    };

    return (
        <div className="tour-guide-profile">
            <Title level={2}>Hồ sơ Tour Guide</Title>
            
            <Row gutter={[24, 24]}>
                {/* Profile Info */}
                <Col xs={24} lg={8}>
                    <Card>
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
                            >
                                <Button icon={<UploadOutlined />} size="small">
                                    Đổi ảnh đại diện
                                </Button>
                            </Upload>
                        </div>
                        
                        <Divider />
                        
                        <div>
                            <Text strong>Tên:</Text>
                            <br />
                            <Text>{user?.name || profileData.fullName}</Text>
                        </div>
                        
                        <Divider />
                        
                        <div>
                            <Text strong>Email:</Text>
                            <br />
                            <Text>{user?.email || profileData.email}</Text>
                        </div>
                        
                        <Divider />
                        
                        <div>
                            <Text strong>Trạng thái:</Text>
                            <br />
                            <Tag color="green">Đang hoạt động</Tag>
                        </div>
                    </Card>
                </Col>

                {/* Profile Form */}
                <Col xs={24} lg={16}>
                    <Card
                        title="Thông tin chi tiết"
                        extra={
                            <Space>
                                {!editing ? (
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        onClick={() => setEditing(true)}
                                    >
                                        Chỉnh sửa
                                    </Button>
                                ) : (
                                    <>
                                        <Button onClick={() => setEditing(false)}>
                                            Hủy
                                        </Button>
                                        <Button
                                            type="primary"
                                            icon={<SaveOutlined />}
                                            onClick={() => form.submit()}
                                            loading={loading}
                                        >
                                            Lưu
                                        </Button>
                                    </>
                                )}
                            </Space>
                        }
                    >
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
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default TourGuideProfile;
