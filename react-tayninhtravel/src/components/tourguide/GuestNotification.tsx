import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Form,
    Input,
    Button,
    Typography,
    Space,
    notification,
    Alert,
    Switch,
    Row,
    Col,
    Tag,
    Divider
} from 'antd';
import {
    ArrowLeftOutlined,
    MessageOutlined,
    SendOutlined,
    BellOutlined,
    TeamOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { getTourBookings, notifyGuests, TourBooking } from '@/services/tourguideService';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface NotificationFormData {
    message: string;
    isUrgent: boolean;
}

// Predefined message templates
const MESSAGE_TEMPLATES = [
    {
        title: 'Thông báo khởi hành',
        message: 'Xin chào quý khách! Chúng ta sẽ khởi hành trong 15 phút nữa. Vui lòng chuẩn bị đồ đạc và có mặt tại điểm tập trung.'
    },
    {
        title: 'Thông báo nghỉ trưa',
        message: 'Chúng ta sẽ dừng chân nghỉ trưa tại nhà hàng trong 1 tiếng. Quý khách vui lòng có mặt tại xe lúc 13:30.'
    },
    {
        title: 'Thông báo thay đổi lịch trình',
        message: 'Do điều kiện thời tiết, chúng ta sẽ điều chỉnh lịch trình một chút. Mọi thông tin chi tiết HDV sẽ thông báo trực tiếp.'
    },
    {
        title: 'Thông báo an toàn',
        message: 'Để đảm bảo an toàn, quý khách vui lòng luôn đi theo nhóm và không tự ý rời khỏi đoàn.'
    },
    {
        title: 'Thông báo kết thúc tour',
        message: 'Tour đã kết thúc thành công! Cảm ơn quý khách đã đồng hành cùng chúng tôi. Chúc quý khách có những trải nghiệm tuyệt vời!'
    }
];

const GuestNotification: React.FC = () => {
    const { tourId } = useParams<{ tourId: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    
    const [bookings, setBookings] = useState<TourBooking[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    // Load tour bookings to show guest count
    const loadBookings = async () => {
        if (!tourId) return;
        
        try {
            setLoading(true);
            const response = await getTourBookings(tourId);
            
            if (response.success && response.data) {
                setBookings(response.data);
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
            notification.error({
                message: 'Lỗi tải dữ liệu',
                description: 'Không thể tải danh sách khách hàng.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, [tourId]);

    // Handle form submission
    const handleSubmit = async (values: NotificationFormData) => {
        if (!tourId) return;
        
        try {
            setSending(true);
            
            const response = await notifyGuests(tourId, {
                message: values.message,
                isUrgent: values.isUrgent
            });
            
            if (response.success) {
                notification.success({
                    message: 'Gửi thông báo thành công',
                    description: response.message || 'Thông báo đã được gửi đến tất cả khách hàng.',
                });
                
                // Reset form
                form.resetFields();
                
                // Navigate back
                navigate('/tour-guide/dashboard');
            }
        } catch (error: any) {
            console.error('Error sending notification:', error);
            notification.error({
                message: 'Lỗi gửi thông báo',
                description: error.response?.data?.message || 'Không thể gửi thông báo.',
            });
        } finally {
            setSending(false);
        }
    };

    // Use template message
    const useTemplate = (template: typeof MESSAGE_TEMPLATES[0]) => {
        form.setFieldsValue({ message: template.message });
    };

    // Calculate recipient count
    const checkedInGuests = bookings.filter(b => b.isCheckedIn);
    const totalGuests = bookings.length;

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/tour-guide/dashboard')}
                    style={{ marginBottom: '16px' }}
                >
                    Quay lại Dashboard
                </Button>
                
                <Title level={2}>
                    <MessageOutlined style={{ color: '#1890ff' }} /> Thông báo khách hàng
                </Title>
                
                <Alert
                    message="Thông tin người nhận"
                    description={
                        <div>
                            <Space>
                                <TeamOutlined />
                                <Text>
                                    Thông báo sẽ được gửi đến <Text strong>{checkedInGuests.length}</Text> khách đã check-in 
                                    (tổng cộng {totalGuests} khách)
                                </Text>
                            </Space>
                            {checkedInGuests.length === 0 && (
                                <div style={{ marginTop: '8px' }}>
                                    <Text type="warning">
                                        Chưa có khách nào check-in. Vui lòng check-in khách trước khi gửi thông báo.
                                    </Text>
                                </div>
                            )}
                        </div>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: '24px' }}
                />
            </div>

            <Row gutter={[16, 16]}>
                {/* Message Templates */}
                <Col xs={24} lg={10}>
                    <Card title="Mẫu thông báo" size="small">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {MESSAGE_TEMPLATES.map((template, index) => (
                                <Card
                                    key={index}
                                    size="small"
                                    hoverable
                                    onClick={() => useTemplate(template)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <Card.Meta
                                        title={<Text strong style={{ fontSize: '14px' }}>{template.title}</Text>}
                                        description={
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                {template.message.substring(0, 80)}...
                                            </Text>
                                        }
                                    />
                                </Card>
                            ))}
                        </Space>
                    </Card>
                </Col>

                {/* Notification Form */}
                <Col xs={24} lg={14}>
                    <Card title="Soạn thông báo" loading={loading}>
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            initialValues={{
                                isUrgent: false
                            }}
                        >
                            <Form.Item
                                name="message"
                                label="Nội dung thông báo"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập nội dung thông báo' },
                                    { max: 500, message: 'Nội dung không được quá 500 ký tự' }
                                ]}
                            >
                                <TextArea
                                    rows={8}
                                    placeholder="Nhập nội dung thông báo cho khách hàng..."
                                    showCount
                                    maxLength={500}
                                />
                            </Form.Item>

                            <Form.Item
                                name="isUrgent"
                                label="Thông báo khẩn cấp"
                                valuePropName="checked"
                            >
                                <Switch
                                    checkedChildren={<BellOutlined />}
                                    unCheckedChildren="Thường"
                                />
                                <div style={{ marginTop: '8px' }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        Thông báo khẩn cấp sẽ được ưu tiên hiển thị và có âm thanh thông báo
                                    </Text>
                                </div>
                            </Form.Item>

                            <Divider />

                            <Form.Item>
                                <Space>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={sending}
                                        icon={<SendOutlined />}
                                        size="large"
                                        disabled={checkedInGuests.length === 0}
                                    >
                                        Gửi thông báo
                                    </Button>
                                    <Button
                                        onClick={() => navigate('/tour-guide/dashboard')}
                                        size="large"
                                    >
                                        Hủy
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>

            {/* Guest List Preview */}
            {checkedInGuests.length > 0 && (
                <Card 
                    title="Danh sách người nhận" 
                    style={{ marginTop: '16px' }}
                    size="small"
                >
                    <Row gutter={[8, 8]}>
                        {checkedInGuests.map((booking) => (
                            <Col key={booking.id}>
                                <Tag icon={<CheckCircleOutlined />} color="success">
                                    {booking.contactName || booking.customerName}
                                </Tag>
                            </Col>
                        ))}
                    </Row>
                </Card>
            )}
        </div>
    );
};

export default GuestNotification;
