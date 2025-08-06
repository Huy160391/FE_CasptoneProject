import React, { useState, useEffect, useRef } from 'react';
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
    Tag,
    Tabs
} from 'antd';
import {
    QrcodeOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    UserOutlined,
    PhoneOutlined,
    TeamOutlined,
    ArrowLeftOutlined,
    ScanOutlined,
    CameraOutlined,
    StopOutlined
} from '@ant-design/icons';
import { getTourBookings, checkInGuest, TourBooking } from '@/services/tourguideService';
import { getTourOperationByDetailsId } from '@/services/tourcompanyService';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CheckInScreen: React.FC = () => {
    const { tourId } = useParams<{ tourId: string }>();
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);

    const [bookings, setBookings] = useState<TourBooking[]>([]);
    const [loading, setLoading] = useState(false);
    const [checkingIn, setCheckingIn] = useState<string | null>(null);
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<TourBooking | null>(null);
    const [qrCodeInput, setQrCodeInput] = useState('');
    const [notes, setNotes] = useState('');
    const [cameraActive, setCameraActive] = useState(false);
    const [scannerMode, setScannerMode] = useState<'manual' | 'camera'>('manual');

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

    // Start camera for QR scanning
    const startCamera = async () => {
        try {
            setCameraActive(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Use back camera on mobile
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            notification.error({
                message: 'Lỗi camera',
                description: 'Không thể truy cập camera. Vui lòng sử dụng chế độ nhập thủ công.',
            });
            setScannerMode('manual');
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    };

    // Open QR scanner modal
    const openQrModal = (booking: TourBooking) => {
        setSelectedBooking(booking);
        setQrModalVisible(true);
        setQrCodeInput('');
        setNotes('');
        setScannerMode('manual');
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
                width={600}
                onCancel={() => {
                    stopCamera();
                    setQrModalVisible(false);
                    setSelectedBooking(null);
                    setQrCodeInput('');
                    setNotes('');
                }}
                footer={[
                    <Button key="cancel" onClick={() => {
                        stopCamera();
                        setQrModalVisible(false);
                    }}>
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

                        {/* Scanner Mode Tabs */}
                        <Tabs
                            activeKey={scannerMode}
                            onChange={(key) => {
                                setScannerMode(key as 'manual' | 'camera');
                                if (key === 'camera') {
                                    startCamera();
                                } else {
                                    stopCamera();
                                }
                            }}
                            items={[
                                {
                                    key: 'manual',
                                    label: (
                                        <span>
                                            <ScanOutlined /> Nhập thủ công
                                        </span>
                                    ),
                                    children: (
                                        <div>
                                            <Text strong>Mã QR Code:</Text>
                                            <Input
                                                placeholder="Nhập mã QR code"
                                                value={qrCodeInput}
                                                onChange={(e) => setQrCodeInput(e.target.value)}
                                                prefix={<ScanOutlined />}
                                                style={{ marginTop: '8px' }}
                                            />
                                        </div>
                                    )
                                },
                                {
                                    key: 'camera',
                                    label: (
                                        <span>
                                            <CameraOutlined /> Quét camera
                                        </span>
                                    ),
                                    children: (
                                        <div style={{ textAlign: 'center' }}>
                                            <video
                                                ref={videoRef}
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '400px',
                                                    height: '300px',
                                                    border: '2px solid #d9d9d9',
                                                    borderRadius: '8px',
                                                    backgroundColor: '#f5f5f5'
                                                }}
                                                playsInline
                                            />
                                            <div style={{ marginTop: '16px' }}>
                                                <Space>
                                                    <Button
                                                        icon={cameraActive ? <StopOutlined /> : <CameraOutlined />}
                                                        onClick={cameraActive ? stopCamera : startCamera}
                                                    >
                                                        {cameraActive ? 'Dừng camera' : 'Bật camera'}
                                                    </Button>
                                                </Space>
                                            </div>
                                            <Alert
                                                message="Hướng dẫn"
                                                description="Đưa QR code vào khung camera. Khi quét thành công, mã sẽ tự động điền vào ô bên dưới."
                                                type="info"
                                                showIcon
                                                style={{ marginTop: '16px', textAlign: 'left' }}
                                            />
                                            <div style={{ marginTop: '16px' }}>
                                                <Text strong>Mã đã quét:</Text>
                                                <Input
                                                    placeholder="Mã QR sẽ hiển thị ở đây"
                                                    value={qrCodeInput}
                                                    onChange={(e) => setQrCodeInput(e.target.value)}
                                                    style={{ marginTop: '8px' }}
                                                />
                                            </div>
                                        </div>
                                    )
                                }
                            ]}
                        />

                        <div style={{ marginTop: '16px' }}>
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
