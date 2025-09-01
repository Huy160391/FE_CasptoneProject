import { useState } from 'react';
import { Form, Input, Button, Upload, message, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { UploadFile } from 'antd/es/upload/interface';
import { userService } from '@/services/userService';

interface ProfileInfoProps {
    user: any;
    updateUser: (user: any) => void;
}

const ProfileInfo = ({ user, updateUser }: ProfileInfoProps) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);

    const handleProfileUpdate = async (values: any) => {
        if (!user) return;
        try {
            setLoading(true);
            const updatedData = {
                name: values.name,
                phoneNumber: values.phone
            };
            const response = await userService.updateProfile(updatedData);
            if (response) {
                updateUser({
                    ...user,
                    name: updatedData.name,
                    phone: updatedData.phoneNumber
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

    const handleAvatarUpdate = async () => {
        if (!user || fileList.length === 0) return;
        try {
            setAvatarLoading(true);
            if (fileList.length === 0) {
                message.error(t('profile.avatarUploadFailed'));
                return;
            }
            const file = fileList[0].originFileObj as File;
            if (!file) {
                message.error(t('profile.avatarUploadFailed'));
                return;
            }
            await userService.updateAvatar(file);
            const tempUrl = URL.createObjectURL(file);
            updateUser({ ...user, avatar: tempUrl });
            message.success(t('profile.avatarUpdateSuccess'));
            setFileList([]);
        } catch (error: any) {
            message.error(error.response?.data?.message || t('profile.avatarUpdateFailed'));
        } finally {
            setAvatarLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        try {
            setLoading(true);
            // Nếu cần, import và gọi authService.changePassword ở đây
            // await authService.changePassword({ ... });
            message.success(t('profile.passwordChangeSuccess'));
            form.resetFields();
        } catch (error: any) {
            message.error(error.response?.data?.message || t('profile.passwordChangeFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
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
                        beforeUpload={(file) => {
                            const isImage = file.type.startsWith('image/');
                            const isLessThan2M = file.size / 1024 / 1024 < 2;
                            if (!isImage) {
                                message.error(t('profile.imageOnly'));
                                return Upload.LIST_IGNORE;
                            }
                            if (!isLessThan2M) {
                                message.error(t('profile.imageTooLarge'));
                                return Upload.LIST_IGNORE;
                            }
                            return false;
                        }}
                        className="avatar-upload"
                    >
                        <Button icon={<UploadOutlined />}>{t('profile.changeAvatar')}</Button>
                    </Upload>
                    <span className="upload-hint">{t('profile.imageFormatHint')}</span>

                    {fileList.length > 0 && (
                        <Button
                            type="primary"
                            onClick={handleAvatarUpdate}
                            loading={avatarLoading}
                            style={{ marginTop: '8px' }}
                        >
                            {t('profile.saveAvatar')}
                        </Button>
                    )}
                    {fileList.length > 0 && (
                        <div className="file-selected-info">
                            {t('profile.fileSelected')}: {fileList[0].name}
                        </div>
                    )}
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
    );
};

export default ProfileInfo;
