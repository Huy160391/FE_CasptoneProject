import { useState } from 'react';
import { Card, Tabs, Form, Input, Button, Upload, message, Row, Col, List, Tag, Rate } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, UploadOutlined, HistoryOutlined, ShoppingOutlined, CommentOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import type { UploadFile } from 'antd/es/upload/interface';
import axiosInstance from '@/config/axios';
import { authService } from '@/services/authService';
import './Profile.scss';

const { TabPane } = Tabs;

const Profile = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const { user, updateUser } = useAuthStore();
    const [loading, setLoading] = useState(false);

    // Mock data - sẽ được thay thế bằng API call thực tế
    const bookingHistory = [
        {
            id: 1,
            tourName: 'Tour Tây Ninh 1 ngày',
            date: '2024-03-15',
            status: 'completed',
            price: '1,500,000 ₫',
        },
        {
            id: 2,
            tourName: 'Tour Núi Bà Đen',
            date: '2024-03-20',
            status: 'upcoming',
            price: '2,000,000 ₫',
        },
    ];

    const transactionHistory = [
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
    ];

    const commentHistory = [
        {
            id: 1,
            tourName: 'Tour Tây Ninh 1 ngày',
            rating: 5,
            comment: 'Tour rất tuyệt vời, hướng dẫn viên nhiệt tình!',
            date: '2024-03-16',
        },
        {
            id: 2,
            tourName: 'Tour Núi Bà Đen',
            rating: 4,
            comment: 'Cảnh đẹp, giá cả hợp lý.',
            date: '2024-03-21',
        },
    ];

    const handleProfileUpdate = async (values: any) => {
        if (!user) return;
        try {
            setLoading(true);
            const updatedData = {
                name: values.name,
                phoneNumber: values.phone,
                avatar: fileList.length > 0 ? fileList[0].url || fileList[0].thumbUrl : user.avatar || 'string'
            };

            const response = await axiosInstance.put('/Account/edit-profile', updatedData);

            if (response.data) {
                updateUser({
                    ...user,
                    name: updatedData.name,
                    phone: updatedData.phoneNumber,
                    avatar: updatedData.avatar
                });
                message.success(t('profile.updateSuccess'));
            }
        } catch (error: any) {
            console.error('Update profile error:', error);
            message.error(error.response?.data?.message || t('profile.updateFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (values: any) => {
        try {
            setLoading(true);
            await authService.changePassword({
                oldPassword: values.currentPassword,
                newPassword: values.newPassword
            });
            message.success(t('profile.passwordChangeSuccess'));
            form.resetFields();
        } catch (error: any) {
            console.error('Change password error:', error);
            message.error(error.response?.data?.message || t('profile.passwordChangeFailed'));
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="profile-page">
            <div className="container">
                <Card className="profile-card">
                    <Tabs defaultActiveKey="personal">
                        <TabPane
                            tab={
                                <span>
                                    <UserOutlined />
                                    {t('profile.personalInfo')}
                                </span>
                            }
                            key="personal"
                        >
                            <Row gutter={[32, 32]}>
                                <Col xs={24} md={8}>
                                    <div className="avatar-section">
                                        <div className="user-avatar">
                                            <img
                                                src={user.avatar || 'https://i.imgur.com/4AiXzf8.jpg'}
                                                alt="avatar"
                                            />
                                        </div>
                                        <Upload
                                            listType="picture"
                                            maxCount={1}
                                            fileList={fileList}
                                            onChange={({ fileList }) => setFileList(fileList)}
                                            beforeUpload={() => false}
                                            className="avatar-upload"
                                        >
                                            <Button icon={<UploadOutlined />}>{t('profile.changeAvatar')}</Button>
                                        </Upload>
                                    </div>
                                </Col>
                                <Col xs={24} md={16}>
                                    <Form
                                        form={form}
                                        layout="vertical"
                                        initialValues={{
                                            name: user.name,
                                            email: user.email,
                                            phone: user.phone
                                        }}
                                        onFinish={handleProfileUpdate}
                                    >
                                        <Form.Item
                                            name="name"
                                            label={t('profile.name')}
                                            rules={[
                                                { required: true, message: t('profile.nameRequired') },
                                                { pattern: /^[a-zA-Z\s]*$/, message: t('profile.nameInvalid') }
                                            ]}
                                        >
                                            <Input prefix={<UserOutlined />} />
                                        </Form.Item>
                                        <Form.Item
                                            name="email"
                                            label={t('profile.email')}
                                        >
                                            <Input prefix={<MailOutlined />} disabled />
                                        </Form.Item>
                                        <Form.Item
                                            name="phone"
                                            label={t('profile.phone')}
                                            rules={[{ required: true, message: t('profile.phoneRequired') }]}
                                        >
                                            <Input prefix={<PhoneOutlined />} />
                                        </Form.Item>
                                        <Form.Item>
                                            <Button type="primary" htmlType="submit" loading={loading}>
                                                {t('profile.saveChanges')}
                                            </Button>
                                        </Form.Item>
                                    </Form>

                                    <div className="password-section">
                                        <h3>{t('profile.changePassword')}</h3>
                                        <Form layout="vertical" onFinish={handlePasswordChange}>
                                            <Form.Item
                                                name="currentPassword"
                                                label={t('profile.currentPassword')}
                                                rules={[{ required: true, message: t('profile.currentPasswordRequired') }]}
                                            >
                                                <Input.Password prefix={<LockOutlined />} />
                                            </Form.Item>
                                            <Form.Item
                                                name="newPassword"
                                                label={t('profile.newPassword')}
                                                rules={[{ required: true, message: t('profile.newPasswordRequired') }]}
                                            >
                                                <Input.Password prefix={<LockOutlined />} />
                                            </Form.Item>
                                            <Form.Item
                                                name="confirmPassword"
                                                label={t('profile.confirmPassword')}
                                                rules={[
                                                    { required: true, message: t('profile.confirmPasswordRequired') },
                                                    ({ getFieldValue }) => ({
                                                        validator(_, value) {
                                                            if (!value || getFieldValue('newPassword') === value) {
                                                                return Promise.resolve();
                                                            }
                                                            return Promise.reject(new Error(t('profile.passwordMismatch')));
                                                        },
                                                    }),
                                                ]}
                                            >
                                                <Input.Password prefix={<LockOutlined />} />
                                            </Form.Item>
                                            <Form.Item>
                                                <Button type="primary" htmlType="submit">
                                                    {t('profile.changePassword')}
                                                </Button>
                                            </Form.Item>
                                        </Form>
                                    </div>
                                </Col>
                            </Row>
                        </TabPane>

                        <TabPane
                            tab={
                                <span>
                                    <HistoryOutlined />
                                    {t('profile.bookingHistory')}
                                </span>
                            }
                            key="bookings"
                        >
                            <List
                                itemLayout="horizontal"
                                dataSource={bookingHistory}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={item.tourName}
                                            description={
                                                <>
                                                    <div>{t('profile.bookingDate')}: {item.date}</div>
                                                    <div>{t('profile.price')}: {item.price}</div>
                                                    <Tag color={item.status === 'completed' ? 'green' : 'blue'}>
                                                        {item.status === 'completed' ? t('profile.completed') : t('profile.upcoming')}
                                                    </Tag>
                                                </>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </TabPane>

                        <TabPane
                            tab={
                                <span>
                                    <ShoppingOutlined />
                                    {t('profile.transactionHistory')}
                                </span>
                            }
                            key="transactions"
                        >
                            <List
                                itemLayout="horizontal"
                                dataSource={transactionHistory}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={item.type}
                                            description={
                                                <>
                                                    <div>{t('profile.transactionDate')}: {item.date}</div>
                                                    <div>{t('profile.amount')}: {item.amount}</div>
                                                    <Tag color="green">{t('profile.completed')}</Tag>
                                                </>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </TabPane>

                        <TabPane
                            tab={
                                <span>
                                    <CommentOutlined />
                                    {t('profile.commentHistory')}
                                </span>
                            }
                            key="comments"
                        >
                            <List
                                itemLayout="horizontal"
                                dataSource={commentHistory}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={item.tourName}
                                            description={
                                                <>
                                                    <Rate disabled defaultValue={item.rating} />
                                                    <div>{item.comment}</div>
                                                    <div className="comment-date">{item.date}</div>
                                                </>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </TabPane>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
};

export default Profile; 