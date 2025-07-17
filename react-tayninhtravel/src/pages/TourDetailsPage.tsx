import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Button,
    Typography,
    Row,
    Col,
    Tag,
    Divider,
    Spin,
    Alert,
    Space,
    Descriptions,
    Timeline,
    message
} from 'antd';
import {
    CalendarOutlined,
    TeamOutlined,
    ClockCircleOutlined,
    ShoppingCartOutlined
} from '@ant-design/icons';

import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency } from '../services/paymentService';
import { checkTourAvailability } from '../services/tourBookingService';
import LoginModal from '../components/auth/LoginModal';
import ImageGallery from '../components/common/ImageGallery';
import { getDefaultTourImage } from '../utils/imageUtils';

const { Title, Text, Paragraph } = Typography;

interface TourDetail {
    id: string;
    title: string;
    description?: string;
    imageUrls: string[]; // New field for multiple images
    imageUrl?: string; // Backward compatibility - first image
    skillsRequired?: string;
    createdAt: string;
    status: number;
    tourOperation?: {
        id: string;
        price: number;
        maxGuests: number;
        currentBookings: number;
        isActive: boolean;
        tourStartDate?: string;
        tourEndDate?: string;
    };
    timeline?: Array<{
        id: string;
        activity: string;
        checkInTime: string;
        sortOrder: number;
        specialtyShop?: {
            id: string;
            name: string;
            address?: string;
        };
    }>;
}

const TourDetailsPage: React.FC = () => {
    const { tourId } = useParams<{ tourId: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, token } = useAuthStore();

    const [tour, setTour] = useState<TourDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [realTimeAvailability, setRealTimeAvailability] = useState<{
        availableSlots: number;
        maxGuests: number;
        currentBookings: number;
    } | null>(null);



    // Load tour details
    useEffect(() => {
        const loadTourDetails = async () => {
            if (!tourId) {
                setError('Không tìm thấy ID tour');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Call API to get tour details (use token if available)
                const headers: any = {
                    'Content-Type': 'application/json'
                };

                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }

                const response = await fetch(`http://localhost:5267/api/TourDetails/${tourId}`, {
                    headers
                });
                const data = await response.json();

                if (data.success && data.data) {
                    setTour(data.data);
                    // Load real-time availability
                    if (data.data.tourOperation?.id) {
                        loadRealTimeAvailability(data.data.tourOperation.id);
                    }
                } else {
                    setError(data.message || 'Không thể tải thông tin tour');
                }
            } catch (error: any) {
                console.error('Error loading tour details:', error);
                setError('Có lỗi xảy ra khi tải thông tin tour');
            } finally {
                setLoading(false);
            }
        };

        loadTourDetails();
    }, [tourId]);

    // Load real-time availability
    const loadRealTimeAvailability = async (tourOperationId: string) => {
        try {
            const response = await checkTourAvailability(tourOperationId, 1, token ?? undefined);
            if (response.success && response.data) {
                setRealTimeAvailability({
                    availableSlots: response.data.availableSlots,
                    maxGuests: response.data.maxGuests,
                    currentBookings: response.data.currentBookings
                });
            }
        } catch (error) {
            console.error('Error loading real-time availability:', error);
        }
    };

    // Handle booking
    const handleBookNow = () => {
        if (!isAuthenticated) {
            setIsLoginModalVisible(true);
            return;
        }

        if (!tour?.tourOperation || !tour.tourOperation.isActive) {
            message.error('Tour này hiện không khả dụng để đặt');
            return;
        }

        // Navigate to booking page
        navigate(`/booking/${tour.id}`, {
            state: {
                tourData: tour
            }
        });
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '60vh' 
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error || !tour) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <Alert
                    message="Không thể tải thông tin tour"
                    description={error || 'Tour không tồn tại hoặc đã bị xóa'}
                    type="error"
                    showIcon
                    action={
                        <Button type="primary" onClick={() => navigate('/')}>
                            Về trang chủ
                        </Button>
                    }
                />
            </div>
        );
    }

    // Use real-time availability if available, otherwise fallback to static data
    const availableSlots = realTimeAvailability
        ? realTimeAvailability.availableSlots
        : (tour.tourOperation
            ? tour.tourOperation.maxGuests - (tour.tourOperation.currentBookings || 0)
            : 0);

    return (
        <div style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
            <Row gutter={24}>
                {/* Main Content */}
                <Col xs={24} lg={16}>
                    <Card>
                        {/* Tour Images Gallery */}
                        <ImageGallery
                            images={tour.imageUrls && tour.imageUrls.length > 0 ? tour.imageUrls : [tour.imageUrl || getDefaultTourImage(tour.title)]}
                            alt={tour.title}
                            height={300}
                            showThumbnails={true}
                            autoPlay={false}
                        />

                        {/* Tour Title */}
                        <Title level={2} style={{ marginTop: 16 }}>
                            {tour.title}
                        </Title>

                        {/* Tour Status */}
                        <Space style={{ marginBottom: 16 }}>
                            <Tag color={tour.status === 8 ? 'green' : 'orange'}>
                                {tour.status === 8 ? 'Có sẵn' : 'Chưa sẵn sàng'}
                            </Tag>
                            {tour.tourOperation?.isActive && (
                                <Tag color="blue">Đang hoạt động</Tag>
                            )}
                        </Space>

                        {/* Tour Description */}
                        {tour.description && (
                            <div style={{ marginBottom: 24 }}>
                                <Title level={4}>Mô tả tour</Title>
                                <Paragraph>{tour.description}</Paragraph>
                            </div>
                        )}

                        {/* Skills Required */}
                        {tour.skillsRequired && (
                            <div style={{ marginBottom: 24 }}>
                                <Title level={4}>Kỹ năng yêu cầu</Title>
                                <Text>{tour.skillsRequired}</Text>
                            </div>
                        )}

                        {/* Timeline */}
                        {tour.timeline && tour.timeline.length > 0 && (
                            <div style={{ marginBottom: 24 }}>
                                <Title level={4}>Lịch trình tour</Title>
                                <Timeline>
                                    {tour.timeline
                                        .sort((a, b) => a.sortOrder - b.sortOrder)
                                        .map((item) => (
                                            <Timeline.Item
                                                key={item.id}
                                                dot={<ClockCircleOutlined />}
                                            >
                                                <div>
                                                    <Text strong>{item.checkInTime}</Text>
                                                    <br />
                                                    <Text>{item.activity}</Text>
                                                    {item.specialtyShop && (
                                                        <div style={{ marginTop: 4 }}>
                                                            <Text type="secondary">
                                                                📍 {item.specialtyShop.name}
                                                                {item.specialtyShop.address && 
                                                                    ` - ${item.specialtyShop.address}`
                                                                }
                                                            </Text>
                                                        </div>
                                                    )}
                                                </div>
                                            </Timeline.Item>
                                        ))
                                    }
                                </Timeline>
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Sidebar */}
                <Col xs={24} lg={8}>
                    <Card title="Thông tin đặt tour" style={{ position: 'sticky', top: 20 }}>
                        {/* Price */}
                        {tour.tourOperation && (
                            <div style={{ marginBottom: 16 }}>
                                <Text type="secondary">Giá tour</Text>
                                <div>
                                    <Text strong style={{ fontSize: 24, color: '#f5222d' }}>
                                        {formatCurrency(tour.tourOperation.price)}
                                    </Text>
                                    <Text type="secondary"> / người</Text>
                                </div>
                            </div>
                        )}

                        <Divider />

                        {/* Tour Info */}
                        <Descriptions column={1} size="small">
                            {tour.tourOperation && (
                                <>
                                    <Descriptions.Item label="Sức chứa tối đa">
                                        <Space>
                                            <TeamOutlined />
                                            {tour.tourOperation.maxGuests} người
                                        </Space>
                                    </Descriptions.Item>
                                    
                                    <Descriptions.Item label="Đã đặt">
                                        <Space>
                                            <ShoppingCartOutlined />
                                            {realTimeAvailability
                                                ? realTimeAvailability.currentBookings
                                                : (tour.tourOperation.currentBookings || 0)} người
                                        </Space>
                                    </Descriptions.Item>
                                    
                                    <Descriptions.Item label="Chỗ trống">
                                        <Space>
                                            <Text style={{ color: availableSlots > 5 ? 'green' : 'orange' }}>
                                                {availableSlots} chỗ
                                            </Text>
                                        </Space>
                                    </Descriptions.Item>

                                    {tour.tourOperation.tourStartDate && (
                                        <Descriptions.Item label="Ngày bắt đầu">
                                            <Space>
                                                <CalendarOutlined />
                                                {new Date(tour.tourOperation.tourStartDate).toLocaleDateString('vi-VN')}
                                            </Space>
                                        </Descriptions.Item>
                                    )}

                                    {tour.tourOperation.tourEndDate && (
                                        <Descriptions.Item label="Ngày kết thúc">
                                            <Space>
                                                <CalendarOutlined />
                                                {new Date(tour.tourOperation.tourEndDate).toLocaleDateString('vi-VN')}
                                            </Space>
                                        </Descriptions.Item>
                                    )}
                                </>
                            )}

                            <Descriptions.Item label="Ngày tạo">
                                {new Date(tour.createdAt).toLocaleDateString('vi-VN')}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        {/* Availability Warning */}
                        {availableSlots < 5 && availableSlots > 0 && (
                            <Alert
                                message={`Chỉ còn ${availableSlots} chỗ trống!`}
                                type="warning"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />
                        )}

                        {availableSlots === 0 && (
                            <Alert
                                message="Tour đã hết chỗ"
                                type="error"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />
                        )}

                        {/* Book Now Button */}
                        <Button
                            type="primary"
                            size="large"
                            block
                            onClick={handleBookNow}
                            disabled={!tour.tourOperation?.isActive || availableSlots === 0}
                            icon={<CalendarOutlined />}
                        >
                            {availableSlots === 0 ? 'Hết chỗ' : 'Đặt tour ngay'}
                        </Button>

                        {!isAuthenticated && (
                            <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>
                                Cần đăng nhập để đặt tour
                            </Text>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Login Modal */}
            <LoginModal
                isVisible={isLoginModalVisible}
                onClose={() => setIsLoginModalVisible(false)}
                onRegisterClick={() => {}}
                onLoginSuccess={() => {
                    setIsLoginModalVisible(false);
                    message.success('Đăng nhập thành công! Bạn có thể đặt tour ngay bây giờ.');
                }}
            />
        </div>
    );
};

export default TourDetailsPage;
