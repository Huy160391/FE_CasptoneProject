import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Card,
    Button,
    Typography,
    Row,
    Col,
    Tag,
    Divider,
    Spin,
    Space,
    Descriptions,
    Timeline,
    message,
    Breadcrumb,
    Tabs,
    Rate,
    List,
    Avatar
} from 'antd';
import {
    CalendarOutlined,
    TeamOutlined,
    ClockCircleOutlined,
    ShoppingCartOutlined,
    EnvironmentOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    HeartOutlined,
    ShareAltOutlined,
    StarOutlined,
    UserOutlined
} from '@ant-design/icons';
import './TourDetailsPage.scss';

import { useAuthStore } from '../store/useAuthStore';
import TourPriceDisplay from '../components/common/TourPriceDisplay';
import { checkTourAvailability } from '../services/tourBookingService';
import { tourDetailsService, TourDetail } from '../services/tourDetailsService';
import LoginModal from '../components/auth/LoginModal';
import { getDefaultTourImage } from '../utils/imageUtils';

const { Title, Text, Paragraph } = Typography;

const TourDetailsPage: React.FC = () => {
    const { tourId } = useParams<{ tourId: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, token } = useAuthStore();

    const [tour, setTour] = useState<TourDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);
    const [realTimeAvailability, setRealTimeAvailability] = useState<{
        availableSlots: number;
        maxGuests: number;
        currentBookings: number;
    } | null>(null);

    // Handle go back
    const handleGoBack = () => {
        navigate(-1);
    };

    // Handle thumbnail click
    const handleThumbnailClick = (index: number) => {
        setCurrentImage(index);
    };

    // Mock reviews data (in real app, this would come from API)
    const mockReviews = [
        {
            id: 1,
            name: 'Nguyễn Văn A',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
            rating: 5,
            date: '15/03/2024',
            comment: 'Tour rất tuyệt vời! Hướng dẫn viên nhiệt tình và chuyên nghiệp. Cảnh đẹp, thời gian hợp lý. Sẽ giới thiệu cho bạn bè!'
        },
        {
            id: 2,
            name: 'Trần Thị B',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
            rating: 4,
            date: '10/03/2024',
            comment: 'Tour khá tốt, tuy nhiên thời gian ở một số điểm hơi ngắn. Nhìn chung rất hài lòng với trải nghiệm.'
        },
        {
            id: 3,
            name: 'Lê Văn C',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
            rating: 5,
            date: '05/03/2024',
            comment: 'Đây là lần thứ hai tôi tham gia tour này và vẫn rất hài lòng. Cảnh đẹp, dịch vụ tốt, đáng đồng tiền bát gạo.'
        }
    ];

    // Calculate average rating
    const averageRating = mockReviews.length > 0
        ? mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length
        : 0;



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

                // Call API using service instead of hardcoded URL
                const data = await tourDetailsService.getTourDetailsById(tourId, token ?? undefined);

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
            <div className="tour-detail-page">
                <div className="container">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '60vh'
                    }}>
                        <Spin size="large" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !tour) {
        return (
            <div className="tour-detail-page">
                <div className="container">
                    <div className="not-found">
                        <Title level={3}>Không thể tải thông tin tour</Title>
                        <Text>{error || 'Tour không tồn tại hoặc đã bị xóa'}</Text>
                        <Button type="primary" onClick={handleGoBack}>
                            Về trang trước
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Use real-time availability if available, otherwise fallback to static data
    const availableSlots = realTimeAvailability
        ? realTimeAvailability.availableSlots
        : (tour.tourOperation
            ? tour.tourOperation.maxGuests - (tour.tourOperation.currentBookings || 0)
            : 0);

    // Prepare images for gallery
    const tourImages = tour.imageUrls && tour.imageUrls.length > 0
        ? tour.imageUrls
        : [tour.imageUrl || getDefaultTourImage(tour.title)];

    return (
        <div className="tour-detail-page">
            <div className="container">
                {/* Header */}
                <div className="tour-header">
                    <Breadcrumb
                        className="breadcrumb"
                        items={[
                            { title: <Link to="/">Trang chủ</Link> },
                            { title: <Link to="/things-to-do">Hoạt động</Link> },
                            { title: tour.title }
                        ]}
                    />

                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={handleGoBack}
                        className="back-button"
                    >
                        Quay lại
                    </Button>

                    <Title level={1} className="tour-title">
                        {tour.title}
                    </Title>

                    <div className="tour-meta">
                        {/* Chỉ giữ lại title, di chuyển các thông tin khác xuống detail */}
                    </div>
                </div>

                {/* Gallery */}
                <div className="tour-gallery">
                    <div className="main-image">
                        <img src={tourImages[currentImage]} alt={tour.title} />
                        {/* Status tag overlay */}
                        <div className="tour-status-overlay">
                            <Tag color={tour.tourOperation?.isActive ? 'green' : 'orange'}>
                                {tour.tourOperation?.isActive ? 'Đang hoạt động' : 'Chưa sẵn sàng'}
                            </Tag>
                        </div>
                    </div>
                    <div className="thumbnails">
                        {tourImages.map((image: string, index: number) => (
                            <div
                                key={index}
                                className={`thumbnail ${currentImage === index ? 'active' : ''}`}
                                onClick={() => handleThumbnailClick(index)}
                            >
                                <img src={image} alt={`${tour.title} - ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>

                <Row gutter={[32, 32]} className="tour-content">
                    {/* Main Content */}
                    <Col xs={24} lg={16} className="tour-details">
                        <Card className="tour-description">
                            <Title level={4}>Chi tiết tour</Title>

                            {/* Tour meta info */}
                            <div className="tour-meta-info">
                                <div className="meta-row">
                                    <div className="meta-item">
                                        <EnvironmentOutlined />
                                        <span><strong>Tuyến đường:</strong> {tour.startLocation} → {tour.endLocation}</span>
                                    </div>
                                </div>

                                <div className="meta-row">
                                    <div className="meta-item">
                                        <ClockCircleOutlined />
                                        <span><strong>Thời gian:</strong> {tour.tourOperation?.tourStartDate && tour.tourOperation?.tourEndDate
                                            ? `${Math.ceil((new Date(tour.tourOperation.tourEndDate).getTime() - new Date(tour.tourOperation.tourStartDate).getTime()) / (1000 * 60 * 60 * 24))} ngày`
                                            : 'Linh hoạt'
                                        }</span>
                                    </div>
                                </div>

                                <div className="meta-row">
                                    <div className="meta-rating">
                                        <StarOutlined style={{ color: '#faad14' }} />
                                        <Rate disabled defaultValue={averageRating} style={{ fontSize: '14px' }} />
                                        <Text className="review-count">({mockReviews.length} đánh giá)</Text>
                                    </div>
                                </div>
                            </div>

                            <Divider style={{ margin: '16px 0' }} />

                            <Paragraph>{tour.description}</Paragraph>
                        </Card>

                        {/* Tabs */}
                        <Tabs
                            defaultActiveKey="1"
                            className="tour-tabs"
                            items={[
                                {
                                    key: '1',
                                    label: 'Lịch trình chi tiết',
                                    children: (
                                        <div>
                                            {tour.timeline && tour.timeline.length > 0 ? (
                                                <Timeline
                                                    items={tour.timeline
                                                        .sort((a, b) => a.sortOrder - b.sortOrder)
                                                        .map((item) => ({
                                                            key: item.id,
                                                            dot: <ClockCircleOutlined />,
                                                            children: (
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
                                                            )
                                                        }))
                                                    }
                                                />
                                            ) : (
                                                <Text type="secondary">Chưa có lịch trình chi tiết</Text>
                                            )}
                                        </div>
                                    )
                                },
                                {
                                    key: '2',
                                    label: 'Thông tin tour',
                                    children: (
                                        <div className="included-excluded">
                                            <div className="included">
                                                <Title level={5}>Bao gồm</Title>
                                                <ul>
                                                    <li>
                                                        <CheckCircleOutlined className="included-icon" />
                                                        Hướng dẫn viên chuyên nghiệp
                                                    </li>
                                                    <li>
                                                        <CheckCircleOutlined className="included-icon" />
                                                        Bảo hiểm du lịch
                                                    </li>
                                                    <li>
                                                        <CheckCircleOutlined className="included-icon" />
                                                        Vận chuyển theo chương trình
                                                    </li>
                                                </ul>
                                            </div>

                                            <div className="excluded">
                                                <Title level={5}>Không bao gồm</Title>
                                                <ul>
                                                    <li>
                                                        <InfoCircleOutlined className="excluded-icon" />
                                                        Chi phí cá nhân
                                                    </li>
                                                    <li>
                                                        <InfoCircleOutlined className="excluded-icon" />
                                                        Đồ uống ngoài chương trình
                                                    </li>
                                                    <li>
                                                        <InfoCircleOutlined className="excluded-icon" />
                                                        Tiền tip cho hướng dẫn viên
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    key: '3',
                                    label: `Đánh giá (${mockReviews.length})`,
                                    children: (
                                        <div className="reviews-section">
                                            <div className="reviews-summary">
                                                <div className="rating-summary">
                                                    <Title level={2}>{averageRating.toFixed(1)}</Title>
                                                    <Rate disabled defaultValue={averageRating} />
                                                    <Text>{mockReviews.length} đánh giá</Text>
                                                </div>
                                                <Button type="primary" icon={<StarOutlined />}>
                                                    Viết đánh giá
                                                </Button>
                                            </div>

                                            <Divider />

                                            <List
                                                itemLayout="horizontal"
                                                dataSource={mockReviews}
                                                renderItem={(review: any) => (
                                                    <List.Item>
                                                        <List.Item.Meta
                                                            avatar={<Avatar src={review.avatar} icon={<UserOutlined />} />}
                                                            title={
                                                                <div className="review-header">
                                                                    <Text strong>{review.name}</Text>
                                                                    <Rate disabled defaultValue={review.rating} />
                                                                </div>
                                                            }
                                                            description={
                                                                <div className="review-content">
                                                                    <Text type="secondary">{review.date}</Text>
                                                                    <Paragraph>{review.comment}</Paragraph>
                                                                </div>
                                                            }
                                                        />
                                                    </List.Item>
                                                )}
                                            />
                                        </div>
                                    )
                                }
                            ]}
                        />
                    </Col>

                    {/* Sidebar */}
                    <Col xs={24} lg={8} className="tour-sidebar">
                        <Card className="booking-card">
                            {/* Price Section */}
                            <div className="price-section">
                                {tour.tourOperation?.price ? (
                                    <TourPriceDisplay
                                        price={tour.tourOperation.price}
                                        createdAt={tour.createdAt}
                                        tourStartDate={tour.tourOperation?.tourStartDate}
                                        size="large"
                                        showDetails={true}
                                    />
                                ) : (
                                    <>
                                        <Text className="current-price">Liên hệ</Text>
                                        <Text className="price-per">/ người</Text>
                                    </>
                                )}
                            </div>

                            <Divider />

                            {/* Availability Warning */}
                            {availableSlots < 5 && availableSlots > 0 && (
                                <div className="availability-info warning">
                                    <div className="availability-text">
                                        <TeamOutlined />
                                        <Text>Chỉ còn {availableSlots} chỗ trống!</Text>
                                    </div>
                                </div>
                            )}

                            {availableSlots === 0 && (
                                <div className="availability-info error">
                                    <div className="availability-text">
                                        <TeamOutlined />
                                        <Text>Tour đã hết chỗ</Text>
                                    </div>
                                </div>
                            )}

                            {/* Tour Info */}
                            <Descriptions column={1} size="small" className="tour-info-grid">
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
                                    </>
                                )}
                            </Descriptions>

                            <Divider />

                            {/* Book Now Button */}
                            <Button
                                type="primary"
                                size="large"
                                block
                                onClick={handleBookNow}
                                disabled={!tour.tourOperation?.isActive || availableSlots === 0}
                                icon={<CalendarOutlined />}
                                className="book-button"
                            >
                                {availableSlots === 0 ? 'Hết chỗ' : 'Đặt tour ngay'}
                            </Button>

                            {!isAuthenticated && (
                                <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>
                                    Cần đăng nhập để đặt tour
                                </Text>
                            )}

                            {/* Action Buttons */}
                            <div className="action-buttons">
                                <Button icon={<HeartOutlined />} className="action-button">
                                    Yêu thích
                                </Button>
                                <Button icon={<ShareAltOutlined />} className="action-button">
                                    Chia sẻ
                                </Button>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Login Modal */}
                <LoginModal
                    isVisible={isLoginModalVisible}
                    onClose={() => setIsLoginModalVisible(false)}
                    onRegisterClick={() => { }}
                    onLoginSuccess={() => {
                        setIsLoginModalVisible(false);
                        message.success('Đăng nhập thành công! Bạn có thể đặt tour ngay bây giờ.');
                    }}
                />
            </div>
        </div>
    );
};

export default TourDetailsPage;
