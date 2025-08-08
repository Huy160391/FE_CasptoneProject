import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    List,
    Button,
    Badge,
    Typography,
    Space,
    Modal,
    Input,
    notification,
    Progress,
    Alert,
    Divider,
    Tag
} from 'antd';
import {
    QrcodeOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    UserOutlined,
    PhoneOutlined,
    TeamOutlined,
    ArrowLeftOutlined,
    ScanOutlined
} from '@ant-design/icons';
import { getTourBookings, checkInGuest, TourBooking } from '@/services/tourguideService';
import { getTourOperationByDetailsId } from '@/services/tourcompanyService';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CheckInScreen: React.FC = () => {
    const { tourId } = useParams<{ tourId: string }>();
    const navigate = useNavigate();
    
    const [bookings, setBookings] = useState<TourBooking[]>([]);
    const [loading, setLoading] = useState(false);
    const [checkingIn, setCheckingIn] = useState<string | null>(null);
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<TourBooking | null>(null);
    const [qrCodeInput, setQrCodeInput] = useState('');
    const [notes, setNotes] = useState('');

    // Load tour bookings
    const loadBookings = async () => {
        if (!tourId) return;

        try {
            setLoading(true);

            // First get operation ID from tour details ID
            const operationResponse = await getTourOperationByDetailsId(tourId);
            if (!operationResponse.success || !operationResponse.data) {
                throw new Error('Không tìm thấy thông tin tour operation');
            }

            const operationId = operationResponse.data.id;
            const response = await getTourBookings(operationId);

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
        let isMounted = true;

        const loadData = async () => {
            if (isMounted) {
                await loadBookings();
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [tourId]);

    // Handle check-in
    const handleCheckIn = async (booking: TourBooking, qrData?: string) => {
        try {
            setCheckingIn(booking.id);
            
            const response = await checkInGuest(booking.id, {
                qrCodeData: qrData,
                notes: notes
            });
            
            if (response.success) {
                notification.success({
                    message: 'Check-in thành công',
                    description: `Đã check-in ${booking.contactName || booking.customerName}`,
                });
                
                // Reload bookings
                await loadBookings();
                
                // Reset form
                setQrModalVisible(false);
                setSelectedBooking(null);
                setQrCodeInput('');
                setNotes('');
            }
        } catch (error: any) {
            console.error('Error checking in guest:', error);
            notification.error({
                message: 'Lỗi check-in',
                description: error.response?.data?.message || 'Không thể check-in khách hàng.',
            });
        } finally {
            setCheckingIn(null);
        }
    };

    // Open QR scanner modal
    const openQrModal = (booking: TourBooking) => {
        setSelectedBooking(booking);
        setQrModalVisible(true);
        setQrCodeInput('');
        setNotes('');
    };

    // Manual check-in without QR
    const handleManualCheckIn = (booking: TourBooking) => {
        Modal.confirm({
            title: 'Check-in thủ công',
            content: `Bạn có chắc muốn check-in ${booking.contactName || booking.customerName} mà không quét QR?`,
            onOk: () => handleCheckIn(booking),
        });
    };

    // Calculate statistics
    const totalGuests = bookings.length;
    const checkedInGuests = bookings.filter(b => b.isCheckedIn).length;
    const progressPercent = totalGuests > 0 ? Math.round((checkedInGuests / totalGuests) * 100) : 0;

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
                
                <Title level={2}>Check-in Khách Hàng</Title>
                
                {/* Progress Overview */}
                <Card style={{ marginBottom: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Progress
                            type="circle"
                            percent={progressPercent}
                            format={() => `${checkedInGuests}/${totalGuests}`}
                            size={120}
                            strokeColor={progressPercent === 100 ? '#52c41a' : '#1890ff'}
                        />
                        <div style={{ marginTop: '16px' }}>
                            <Text strong>Tiến độ check-in</Text>
                            <br />
                            <Text type="secondary">
                                {checkedInGuests} / {totalGuests} khách đã check-in
                            </Text>
                        </div>
                    </div>
                </Card>

                {progressPercent === 100 && (
                    <Alert
                        message="Hoàn thành check-in"
                        description="Tất cả khách đã check-in. Bạn có thể bắt đầu tour."
                        type="success"
                        showIcon
                        style={{ marginBottom: '16px' }}
                        action={
                            <Button
                                type="primary"
                                onClick={() => navigate(`/tour-guide/timeline/${tourId}`)}
                            >
                                Bắt đầu tour
                            </Button>
                        }
                    />
                )}
            </div>

            {/* Guest List */}
            <Card title="Danh sách khách hàng" loading={loading}>
                <List
                    dataSource={bookings}
                    renderItem={(booking) => (
                        <List.Item
                            actions={[
                                booking.isCheckedIn ? (
                                    <Tag color="success" icon={<CheckCircleOutlined />}>
                                        Đã check-in
                                    </Tag>
                                ) : (
                                    <Space>
                                        <Button
                                            type="primary"
                                            icon={<QrcodeOutlined />}
                                            onClick={() => openQrModal(booking)}
                                            loading={checkingIn === booking.id}
                                        >
                                            Quét QR
                                        </Button>
                                        <Button
                                            onClick={() => handleManualCheckIn(booking)}
                                            loading={checkingIn === booking.id}
                                        >
                                            Manual
                                        </Button>
                                    </Space>
                                )
                            ]}
                        >
                            <List.Item.Meta
                                avatar={
                                    <Badge
                                        status={booking.isCheckedIn ? 'success' : 'default'}
                                        dot
                                    >
                                        <UserOutlined style={{ fontSize: '24px' }} />
                                    </Badge>
                                }
                                title={
                                    <Space>
                                        <Text strong>
                                            {booking.contactName || booking.customerName}
                                        </Text>
                                        <Text type="secondary">
                                            #{booking.bookingCode}
                                        </Text>
                                    </Space>
                                }
                                description={
                                    <div>
                                        <Space split={<Divider type="vertical" />}>
                                            <span>
                                                <PhoneOutlined /> {booking.contactPhone}
                                            </span>
                                            <span>
                                                <TeamOutlined /> {booking.numberOfGuests} người
                                            </span>
                                            <span>
                                                <Text type="secondary">
                                                    {booking.adultCount} người lớn, {booking.childCount} trẻ em
                                                </Text>
                                            </span>
                                        </Space>
                                        {booking.isCheckedIn && booking.checkInTime && (
                                            <div style={{ marginTop: '4px' }}>
                                                <Text type="success" style={{ fontSize: '12px' }}>
                                                    <ClockCircleOutlined /> Check-in lúc: {new Date(booking.checkInTime).toLocaleString('vi-VN')}
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Card>

            {/* QR Scanner Modal */}
            <Modal
                title="Quét QR Code"
                open={qrModalVisible}
                onCancel={() => {
                    setQrModalVisible(false);
                    setSelectedBooking(null);
                    setQrCodeInput('');
                    setNotes('');
                }}
                footer={[
                    <Button key="cancel" onClick={() => setQrModalVisible(false)}>
                        Hủy
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={checkingIn === selectedBooking?.id}
                        onClick={() => selectedBooking && handleCheckIn(selectedBooking, qrCodeInput)}
                        disabled={!qrCodeInput.trim()}
                    >
                        Check-in
                    </Button>
                ]}
            >
                {selectedBooking && (
                    <div>
                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>Khách hàng: </Text>
                            <Text>{selectedBooking.contactName || selectedBooking.customerName}</Text>
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>Mã QR Code:</Text>
                            <Input
                                placeholder="Nhập mã QR hoặc quét QR code"
                                value={qrCodeInput}
                                onChange={(e) => setQrCodeInput(e.target.value)}
                                prefix={<ScanOutlined />}
                                style={{ marginTop: '8px' }}
                            />
                        </div>
                        
                        <div>
                            <Text strong>Ghi chú (tùy chọn):</Text>
                            <TextArea
                                placeholder="Ghi chú về check-in..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                style={{ marginTop: '8px' }}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CheckInScreen;
