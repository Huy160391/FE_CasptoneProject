import { useState, useEffect } from 'react';
import { Card, Tabs, Form, Input, Button, Upload, message, Row, Col, List, Tag, Rate, Spin, Table, Tooltip, Empty } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, UploadOutlined, HistoryOutlined, ShoppingOutlined, CommentOutlined, QuestionCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import type { UploadFile } from 'antd/es/upload/interface';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import './Profile.scss';

// Removed TabPane import since we'll use items prop

const Profile = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const { user, updateUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);

    // State cho support tickets
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
    const [ticketsLoading, setTicketsLoading] = useState(false);

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
    ];    // Thêm interface cho support tickets
    interface SupportTicket {
        id: string;
        title: string;
        content: string;
        status: string;
        createdAt: string;
        images: {
            id: string;
            url: string;
        }[];
    }

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
    }; const handleAvatarUpdate = async () => {
        if (!user || fileList.length === 0) return;

        try {
            setAvatarLoading(true);

            // Kiểm tra xem có file đã chọn hay không
            if (fileList.length === 0) {
                message.error(t('profile.avatarUploadFailed'));
                return;
            }

            // Lấy file từ originFileObj - đây là cách tiếp cận đúng
            const file = fileList[0].originFileObj as File;

            if (!file) {
                console.error('No originFileObj found in the fileList item');
                message.error(t('profile.avatarUploadFailed'));
                return;
            }

            console.log('File to upload:', file);
            console.log('File type:', file.type);
            console.log('File size:', file.size);

            // Use userService instead of direct axios call
            const response = await userService.updateAvatar(file);

            console.log('API response:', response);

            // Tạo URL tạm thời cho file để hiển thị avatar mới ngay lập tức
            const tempUrl = URL.createObjectURL(file);

            updateUser({
                ...user,
                avatar: tempUrl
            });

            message.success(t('profile.avatarUpdateSuccess'));
            setFileList([]); // Reset file list sau khi tải lên thành công
        } catch (error: any) {
            console.error('Update avatar error:', error);
            message.error(error.response?.data?.message || t('profile.avatarUpdateFailed'));
        } finally {
            setAvatarLoading(false);
        }
    };

    const handlePasswordChange = async (values: any) => {
        try {
            setLoading(true); await authService.changePassword({
                currentPassword: values.currentPassword,
                oldPassword: values.currentPassword,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword
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

    // Fetch support tickets
    useEffect(() => {
        const fetchSupportTickets = async () => {
            if (!user) return;

            try {
                setTicketsLoading(true);
                const tickets = await userService.getUserSupportTickets();
                setSupportTickets(tickets);
            } catch (error: any) {
                console.error('Error fetching support tickets:', error);
                // Removing error message to avoid "No tickets found" notification
            } finally {
                setTicketsLoading(false);
            }
        };

        fetchSupportTickets();
    }, [user, t]);

    if (!user) {
        return null;
    }

    return (
        <div className="profile-page">
            <div className="container">
                <Card className="profile-card">
                    <Tabs
                        defaultActiveKey="personal"
                        items={[
                            {
                                key: "personal",
                                label: (
                                    <span>
                                        <UserOutlined />
                                        {t('profile.personalInfo')}
                                    </span>
                                ),
                                children: (
                                    <Row gutter={[32, 32]}>
                                        <Col xs={24} md={8}>
                                            <div className="avatar-section">
                                                <div className="user-avatar">
                                                    <img
                                                        src={user.avatar || 'https://i.imgur.com/4AiXzf8.jpg'}
                                                        alt="avatar"
                                                    />
                                                </div>                                        <Upload
                                                    listType="picture"
                                                    maxCount={1}
                                                    fileList={fileList}
                                                    onChange={({ fileList }) => {
                                                        console.log('Upload onChange:', fileList);
                                                        setFileList(fileList);
                                                        // Hiển thị thông báo thành công khi tải lên file hợp lệ
                                                        if (fileList.length > 0) {
                                                            console.log('File selected:', fileList[0]);
                                                            console.log('File object:', fileList[0].originFileObj);
                                                        }
                                                    }}
                                                    beforeUpload={(file) => {
                                                        // Validate file type and size
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

                                                        console.log('Valid file to upload:', file);
                                                        return false; // Prevent automatic upload
                                                    }}
                                                    className="avatar-upload"
                                                >                                            <Button icon={<UploadOutlined />}>{t('profile.changeAvatar')}</Button>
                                                    <span className="upload-hint">{t('profile.imageFormatHint')}</span>
                                                </Upload>
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
                                )
                            },
                            {
                                key: "bookings",
                                label: (
                                    <span>
                                        <HistoryOutlined />
                                        {t('profile.bookingHistory')}
                                    </span>
                                ),
                                children: (
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
                                )
                            },
                            {
                                key: "transactions",
                                label: (
                                    <span>
                                        <ShoppingOutlined />
                                        {t('profile.transactionHistory')}
                                    </span>
                                ),
                                children: (
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
                                )
                            },
                            {
                                key: "comments",
                                label: (
                                    <span>
                                        <CommentOutlined />
                                        {t('profile.commentHistory')}
                                    </span>
                                ),
                                children: (
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
                                )
                            },
                            {
                                key: "support-tickets",
                                label: (
                                    <span>
                                        <QuestionCircleOutlined />
                                        {t('profile.supportTickets')}
                                    </span>
                                ), children: (
                                    <Spin spinning={ticketsLoading}>
                                        <Table
                                            dataSource={supportTickets}
                                            rowKey="id"
                                            pagination={{ pageSize: 5 }}
                                            scroll={{ x: 800 }}
                                            sticky={true}
                                            locale={{
                                                emptyText: (
                                                    <Empty
                                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                        description={t('profile.noSupportTickets')}
                                                    />
                                                )
                                            }}
                                            columns={[
                                                {
                                                    title: t('profile.ticketTable.orderNumber'),
                                                    key: "index",
                                                    width: 60,
                                                    render: (_: any, __: any, index: number) => index + 1
                                                },
                                                {
                                                    title: t('support.form.title'),
                                                    dataIndex: "title",
                                                    key: "title",
                                                    width: 200,
                                                    render: (text: string) => <div className="ticket-title">{text}</div>
                                                }, {
                                                    title: t('support.form.content'),
                                                    dataIndex: "content",
                                                    key: "content",
                                                    render: (text: string) => (
                                                        <Tooltip
                                                            title={text}
                                                            placement="topLeft"
                                                            overlayStyle={{ maxWidth: '400px' }}
                                                        >
                                                            <div className="ticket-content-table">
                                                                {text.length > 100 ? `${text.substring(0, 100)}...` : text}                                                        </div>
                                                        </Tooltip>
                                                    )
                                                }, {
                                                    title: t('profile.ticketTable.attachment'),
                                                    key: "attachment",
                                                    width: 150,
                                                    render: (_, record: SupportTicket) => (
                                                        record.images && record.images.length > 0 ? (
                                                            <Button
                                                                type="link"
                                                                size="small"
                                                                icon={<DownloadOutlined />}
                                                                onClick={() => window.open(record.images[0].url, '_blank')}
                                                                className="view-attachment-btn"
                                                            >
                                                                {t('profile.viewAttachment')}
                                                            </Button>
                                                        ) : (
                                                            <span className="no-attachment">{t('profile.noAttachment')}</span>
                                                        )
                                                    )
                                                }, {
                                                    title: t('profile.sendDate'),
                                                    dataIndex: "createdAt",
                                                    key: "date",
                                                    width: 130,
                                                    sorter: (a: SupportTicket, b: SupportTicket) =>
                                                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                                                    render: (date: string) => new Date(date).toLocaleDateString()
                                                },
                                                {
                                                    title: t('admin.users.columns.status'),
                                                    dataIndex: "status",
                                                    key: "status",
                                                    width: 120,
                                                    sorter: (a: SupportTicket, b: SupportTicket) => a.status.localeCompare(b.status), filters: [
                                                        { text: t('profile.ticketStatus.Open'), value: 'Open' },
                                                        { text: t('profile.ticketStatus.Pending'), value: 'Pending' },
                                                        { text: t('profile.ticketStatus.InProgress'), value: 'InProgress' },
                                                        { text: t('profile.ticketStatus.Resolved'), value: 'Resolved' },
                                                        { text: t('profile.ticketStatus.Rejected'), value: 'Rejected' },
                                                    ],
                                                    onFilter: (value, record: SupportTicket) =>
                                                        record.status === value.toString(),
                                                    render: (status: string) => (
                                                        <Tag color={
                                                            status === 'Pending' ? 'gold' :
                                                                status === 'Resolved' ? 'green' :
                                                                    status === 'InProgress' ? 'blue' :
                                                                        status === 'Open' ? 'cyan' : 'default'
                                                        }>
                                                            {t(`profile.ticketStatus.${status}`)}
                                                        </Tag>
                                                    )
                                                }, {
                                                    title: t('profile.ticketTable.responseFromTNDT'),
                                                    key: "response",
                                                    width: 150,
                                                    render: () => (
                                                        <>
                                                            {/* Response column - currently empty, will be populated once API provides response data */}
                                                        </>
                                                    )
                                                }
                                            ]}
                                        />
                                    </Spin>
                                )
                            }
                        ]}
                    />
                </Card>
            </div>
        </div>
    );
};

export default Profile;