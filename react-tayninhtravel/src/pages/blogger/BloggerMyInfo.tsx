import { useState } from 'react';
import { Card, Tabs, Form, Input, Button, Upload, Avatar, Row, Col, notification } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, UploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import type { UploadFile } from 'antd/es/upload/interface';
import './BloggerMyInfo.scss';

const BloggerMyInfo = () => {
    const { t } = useTranslation();
    const { user, updateUser } = useAuthStore();
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    // Mock user data if not available in store
    const userData = user || {
        id: 1,
        name: 'Blogger User',
        email: 'blogger@example.com',
        role: 'Blogger',
        avatar: 'https://placehold.co/100x100',
        phone: '0123456789',
        address: '123 Đường ABC, Quận XYZ, TP. Tây Ninh',
        bio: 'Blogger chuyên viết về du lịch Tây Ninh'
    };

    const handleUploadChange = ({ fileList }: { fileList: UploadFile[] }) => {
        setFileList(fileList);
    };

    const handleProfileSubmit = (values: any) => {
        // Update user profile
        updateUser({
            ...values,
            avatar: fileList.length > 0 ? fileList[0].url || fileList[0].thumbUrl : userData.avatar
        });

        notification.success({
            message: t('common.updateSuccess'),
            description: t('profile.personalInfoUpdateSuccess'),
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
        });
    };

    const handlePasswordSubmit = (values: any) => {
        // Handle password change
        console.log('Password change:', values);

        notification.success({
            message: t('common.updateSuccess'),
            description: t('profile.passwordUpdateSuccess'),
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
        });

        passwordForm.resetFields();
    };

    const tabItems = [
        {
            key: 'profile',
            label: (
                <span>
                    <UserOutlined />
                    {t('profile.personalInfo')}
                </span>
            ),
            children: (
                <Card className="profile-card">
                    <Row gutter={[32, 32]}>
                        <Col xs={24} md={8}>
                            <div className="avatar-section">
                                <div className="user-avatar">
                                    <Avatar
                                        size={120}
                                        src={userData.avatar}
                                        icon={<UserOutlined />}
                                        style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: '50%' }}
                                    />
                                </div>

                                <Upload
                                    listType="picture"
                                    maxCount={1}
                                    fileList={fileList}
                                    onChange={handleUploadChange}
                                    beforeUpload={() => false}
                                    className="avatar-upload"
                                >
                                    <Button icon={<UploadOutlined />}>{t('profile.changeAvatar')}</Button>
                                </Upload>

                                <div className="user-role">
                                    <strong>{t('profile.role')}:</strong> {t('blogger.role')}
                                </div>
                            </div>
                        </Col>

                        <Col xs={24} md={16}>
                            <Form
                                form={profileForm}
                                layout="vertical"
                                initialValues={{
                                    name: userData.name,
                                    email: userData.email,
                                    phone: userData.phone,
                                    address: userData.address
                                }}
                                onFinish={handleProfileSubmit}
                            >
                                <Form.Item
                                    name="name"
                                    label={t('profile.name')}
                                    rules={[
                                        { required: true, message: t('profile.nameRequired') },
                                        { pattern: /^[a-zA-Z\s]*$/, message: t('profile.nameInvalid') }
                                    ]}
                                >
                                    <Input prefix={<UserOutlined />} placeholder={t('profile.name')} />
                                </Form.Item>

                                <Form.Item
                                    name="email"
                                    label={t('profile.email')}
                                    rules={[
                                        { required: true, message: t('profile.emailRequired') },
                                        { type: 'email', message: t('profile.emailInvalid') }
                                    ]}
                                >
                                    <Input prefix={<MailOutlined />} placeholder={t('profile.email')} />
                                </Form.Item>

                                <Form.Item
                                    name="phone"
                                    label={t('profile.phone')}
                                    rules={[
                                        { required: true, message: t('profile.phoneRequired') },
                                        { pattern: /^[0-9]{10}$/, message: t('auth.phoneInvalid') }
                                    ]}
                                >
                                    <Input prefix={<PhoneOutlined />} placeholder={t('profile.phone')} />
                                </Form.Item>

                                <Form.Item
                                    name="address"
                                    label={t('profile.address')}
                                >
                                    <Input.TextArea rows={3} placeholder={t('profile.address')} />
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" className="save-button">
                                        {t('profile.saveChanges')}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Col>
                    </Row>
                </Card>
            )
        },
        {
            key: 'password',
            label: (
                <span>
                    <LockOutlined />
                    {t('profile.changePassword')}
                </span>
            ),
            children: (
                <Card className="password-card">
                    <Row justify="center">
                        <Col xs={24} md={12}>
                            <Form
                                form={passwordForm}
                                layout="vertical"
                                onFinish={handlePasswordSubmit}
                                className="password-form"
                            >
                                <Form.Item
                                    name="currentPassword"
                                    label={t('profile.currentPassword')}
                                    rules={[{ required: true, message: t('profile.currentPasswordRequired') }]}
                                >
                                    <Input.Password prefix={<LockOutlined />} placeholder={t('profile.currentPassword')} />
                                </Form.Item>

                                <Form.Item
                                    name="newPassword"
                                    label={t('profile.newPassword')}
                                    rules={[
                                        { required: true, message: t('profile.newPasswordRequired') },
                                        { min: 8, message: t('auth.passwordInvalid') }
                                    ]}
                                >
                                    <Input.Password prefix={<LockOutlined />} placeholder={t('profile.newPassword')} />
                                </Form.Item>

                                <Form.Item
                                    name="confirmPassword"
                                    label={t('profile.confirmPassword')}
                                    dependencies={['newPassword']}
                                    rules={[
                                        { required: true, message: t('profile.confirmPasswordRequired') },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('newPassword') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error(t('auth.passwordMismatch')));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password prefix={<LockOutlined />} placeholder={t('profile.confirmPassword')} />
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit" className="save-button">
                                        {t('profile.changePassword')}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Col>
                    </Row>
                </Card>
            )
        }
    ];

    return (
        <div className="blogger-my-info-page">
            <div className="page-header">
                <h1>{t('blogger.myInfo.title')}</h1>
            </div>

            <Tabs
                defaultActiveKey="profile"
                items={tabItems}
                className="info-tabs"
            />
        </div>
    );
};

export default BloggerMyInfo;
