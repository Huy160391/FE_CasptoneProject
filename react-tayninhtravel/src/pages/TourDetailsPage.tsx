import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    ShareAltOutlined,
    StarOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    GlobalOutlined
} from '@ant-design/icons';
import SharePopup from '../components/common/SharePopup';
import './TourDetailsPage.scss';

import { useAuthStore } from '../store/useAuthStore';
import TourPriceDisplay from '../components/common/TourPriceDisplay';
import { checkTourAvailability } from '../services/tourBookingService';
import { tourDetailsService, TourDetail } from '../services/tourDetailsService';
import { getTourCompanyById, TourCompanyInfo } from '../services/tourcompanyService';
import { getTourGuideById, TourGuideInfo } from '../services/tourguideService';
import LoginModal from '../components/auth/LoginModal';
import { getDefaultTourImage } from '../utils/imageUtils';

const { Title, Text, Paragraph } = Typography;

const TourDetailsPage: React.FC = () => {
    const [sharePopupVisible, setSharePopupVisible] = useState(false);
    const { t } = useTranslation();
    const { tourId } = useParams<{ tourId: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, token } = useAuthStore();

    const [tour, setTour] = useState<TourDetail | null>(null);
    const [tourCompany, setTourCompany] = useState<TourCompanyInfo | null>(null);
    const [tourGuide, setTourGuide] = useState<TourGuideInfo | null>(null);
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
            name: t('tours.detail.mockReviews.review1.name'),
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
            rating: 5,
            date: '15/03/2024',
            comment: t('tours.detail.mockReviews.review1.comment')
        },
        {
            id: 2,
            name: t('tours.detail.mockReviews.review2.name'),
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
            rating: 4,
            date: '10/03/2024',
            comment: t('tours.detail.mockReviews.review2.comment')
        },
        {
            id: 3,
            name: t('tours.detail.mockReviews.review3.name'),
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
            rating: 5,
            date: '05/03/2024',
            comment: t('tours.detail.mockReviews.review3.comment')
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
                setError(t('tours.detail.noTourId'));
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

                    // Fetch tour company data if tourCompanyId exists
                    if (data.data.tourCompanyId) {
                        try {
                            const companyResponse = await getTourCompanyById(data.data.tourCompanyId, token ?? undefined);
                            if (companyResponse.success && companyResponse.data) {
                                setTourCompany(companyResponse.data);
                            }
                        } catch (error) {
                            console.error('Error fetching tour company:', error);
                        }
                    }

                    // Fetch tour guide data if tourGuideId exists
                    if (data.data.tourGuideId) {
                        try {
                            const guideResponse = await getTourGuideById(data.data.tourGuideId, token ?? undefined);
                            if (guideResponse.success && guideResponse.data) {
                                setTourGuide(guideResponse.data);
                            }
                        } catch (error) {
                            console.error('Error fetching tour guide:', error);
                        }
                    }
                } else {
                    setError(data.message || t('tours.detail.loadError'));
                }
            } catch (error: any) {
                console.error('Error loading tour details:', error);
                setError(t('tours.detail.generalError'));
            } finally {
                setLoading(false);
            }
        };

        loadTourDetails();
    }, [tourId, token, t]);

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
            message.error(t('tours.detail.bookingUnavailable'));
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
                        <Title level={3}>{t('tour.notFoundTitle')}</Title>
                        <Text>{error || t('tour.notFoundText')}</Text>
                        <Button type="primary" onClick={handleGoBack}>
                            {t('common.back')}
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
                            { title: <Link to="/">{t('navigation.home')}</Link> },
                            { title: <Link to="/tours">{t('navigation.activities')}</Link> },
                            { title: tour.title }
                        ]}
                    />

                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={handleGoBack}
                        className="back-button"
                    >
                        {t('common.back')}
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
                                {tour.tourOperation?.isActive ? t('tour.active') : t('tour.inactive')}
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
                            <Title level={4}>{t('tour.detailTitle')}</Title>

                            {/* Tour meta info */}
                            <div className="tour-meta-info">
                                <div className="meta-row">
                                    <div className="meta-item">
                                        <EnvironmentOutlined />
                                        <span><strong>{t('tour.route')}:</strong> {tour.startLocation} → {tour.endLocation}</span>
                                    </div>
                                </div>

                                <div className="meta-row">
                                    <div className="meta-item">
                                        <ClockCircleOutlined />
                                        <span><strong>{t('tour.duration')}:</strong> {tour.tourOperation?.tourStartDate && tour.tourOperation?.tourEndDate
                                            ? `${Math.ceil((new Date(tour.tourOperation.tourEndDate).getTime() - new Date(tour.tourOperation.tourStartDate).getTime()) / (1000 * 60 * 60 * 24))} ${t('tour.days')}`
                                            : t('tour.flexible')
                                        }</span>
                                    </div>
                                </div>

                                <div className="meta-row">
                                    <div className="meta-rating">
                                        <StarOutlined style={{ color: '#faad14' }} />
                                        <Rate disabled defaultValue={averageRating} style={{ fontSize: '14px' }} />
                                        <Text className="review-count">({mockReviews.length} {t('tour.reviews')})</Text>
                                    </div>
                                </div>
                            </div>

                            <Divider style={{ margin: '16px 0' }} />

                            <Paragraph>{tour.description}</Paragraph>

                            <Divider style={{ margin: '24px 0' }} />

                            {/* Thông tin công ty tổ chức */}
                            {tourCompany && (
                                <div className="company-info-section">
                                    <Title level={5} style={{ marginBottom: 16 }}>
                                        <UserOutlined style={{ marginRight: 8 }} />
                                        {t('tours.detail.companyTitle')}
                                    </Title>
                                    <Card size="small" className="company-card">
                                        <Row gutter={16} align="middle">
                                            <Col xs={24} sm={8}>
                                                <div className="company-logo">
                                                    <Avatar
                                                        size={80}
                                                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${tourCompany.companyName}`}
                                                        alt={tourCompany.companyName}
                                                    >
                                                        {tourCompany.companyName.charAt(0)}
                                                    </Avatar>
                                                </div>
                                            </Col>
                                            <Col xs={24} sm={16}>
                                                <div className="company-details">
                                                    <Title level={4} style={{ marginBottom: 8 }}>
                                                        <Link
                                                            to={`/tour-company/${tourCompany.id}`}
                                                            state={{ companyData: tourCompany }}
                                                            style={{
                                                                color: '#1890ff',
                                                                textDecoration: 'none',
                                                                cursor: 'pointer'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                                        >
                                                            {tourCompany.companyName}
                                                        </Link>
                                                    </Title>
                                                    {tourCompany.description && (
                                                        <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                                                            {tourCompany.description}
                                                        </Paragraph>
                                                    )}
                                                    <Space direction="vertical" size="small">
                                                        {tourCompany.address && (
                                                            <div>
                                                                <EnvironmentOutlined style={{ marginRight: 8 }} />
                                                                {tourCompany.address}
                                                            </div>
                                                        )}
                                                        {tourCompany.phoneNumber && (
                                                            <div>
                                                                <PhoneOutlined style={{ marginRight: 8 }} />
                                                                {tourCompany.phoneNumber}
                                                            </div>
                                                        )}
                                                        {tourCompany.email && (
                                                            <div>
                                                                <MailOutlined style={{ marginRight: 8 }} />
                                                                {tourCompany.email}
                                                            </div>
                                                        )}
                                                        {tourCompany.website && (
                                                            <div>
                                                                <GlobalOutlined style={{ marginRight: 8 }} />
                                                                <a href={tourCompany.website} target="_blank" rel="noopener noreferrer">
                                                                    {tourCompany.website}
                                                                </a>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <Text type="secondary">
                                                                {t('tours.detail.companyStatus')}: <Tag color={tourCompany.isActive ? 'green' : 'red'}>
                                                                    {tourCompany.isActive ? t('tours.detail.companyActive') : t('tours.detail.companyInactive')}
                                                                </Tag>
                                                            </Text>
                                                        </div>
                                                        <div>
                                                            <Text type="secondary">
                                                                {t('tours.detail.publicTours')}: {tourCompany.publicTour}
                                                            </Text>
                                                        </div>
                                                    </Space>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card>
                                </div>
                            )}

                            <Divider style={{ margin: '24px 0' }} />

                            {/* Thông tin hướng dẫn viên */}
                            {tourGuide && (
                                <div className="guide-info-section">
                                    <Title level={5} style={{ marginBottom: 16 }}>
                                        <UserOutlined style={{ marginRight: 8 }} />
                                        {t('tours.detail.guideTitle')}
                                    </Title>
                                    <Card size="small" className="guide-card">
                                        <Row gutter={16} align="middle">
                                            <Col xs={24} sm={8}>
                                                <div className="guide-avatar">
                                                    <Avatar
                                                        size={80}
                                                        src={tourGuide.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tourGuide.fullName}`}
                                                        alt={tourGuide.fullName}
                                                        icon={<UserOutlined />}
                                                    >
                                                        {tourGuide.fullName.charAt(0)}
                                                    </Avatar>
                                                </div>
                                            </Col>
                                            <Col xs={24} sm={16}>
                                                <div className="guide-details">
                                                    <Title level={4} style={{ marginBottom: 8 }}>
                                                        {tourGuide.fullName}
                                                    </Title>
                                                    {tourGuide.rating > 0 && (
                                                        <div style={{ marginBottom: 8 }}>
                                                            <Rate disabled defaultValue={tourGuide.rating} />
                                                            <Text style={{ marginLeft: 8 }}>
                                                                {tourGuide.rating}/5
                                                            </Text>
                                                        </div>
                                                    )}
                                                    {tourGuide.experience && (
                                                        <div style={{ marginBottom: 8 }}>
                                                            <Text strong>{t('tours.detail.guideExperience')}: </Text>
                                                            <Text>{tourGuide.experience}</Text>
                                                        </div>
                                                    )}
                                                    {tourGuide.skills && (
                                                        <div style={{ marginBottom: 8 }}>
                                                            <Text strong>{t('tours.detail.guideSkills')}: </Text>
                                                            <div style={{ marginTop: 4 }}>
                                                                <Tag color="blue" style={{ marginRight: 4, marginBottom: 4 }}>
                                                                    {tourGuide.skills}
                                                                </Tag>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div style={{ marginBottom: 8 }}>
                                                        <Text strong>{t('tours.detail.guideTotalTours')}: </Text>
                                                        <Text>{tourGuide.totalToursGuided}</Text>
                                                    </div>
                                                    <div style={{ marginBottom: 8 }}>
                                                        <Text strong>{t('tours.detail.guideStatus')}: </Text>
                                                        <Tag color={tourGuide.isAvailable ? 'green' : 'orange'}>
                                                            {tourGuide.isAvailable ? t('tours.detail.guideAvailable') : t('tours.detail.guideUnavailable')}
                                                        </Tag>
                                                    </div>
                                                    <Space direction="vertical" size="small">
                                                        {tourGuide.phoneNumber && (
                                                            <div>
                                                                <PhoneOutlined style={{ marginRight: 8 }} />
                                                                {tourGuide.phoneNumber}
                                                            </div>
                                                        )}
                                                        {tourGuide.email && (
                                                            <div>
                                                                <MailOutlined style={{ marginRight: 8 }} />
                                                                {tourGuide.email}
                                                            </div>
                                                        )}
                                                        {tourGuide.approvedAt && (
                                                            <div>
                                                                <Text type="secondary">
                                                                    {t('tours.detail.approvedDate')}: {new Date(tourGuide.approvedAt).toLocaleDateString('vi-VN')}
                                                                </Text>
                                                            </div>
                                                        )}
                                                        {tourGuide.approvedByName && (
                                                            <div>
                                                                <Text type="secondary">
                                                                    {t('tours.detail.approvedBy')}: {tourGuide.approvedByName}
                                                                </Text>
                                                            </div>
                                                        )}
                                                    </Space>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card>
                                </div>
                            )}
                        </Card>

                        {/* Tabs */}
                        <Tabs
                            defaultActiveKey="1"
                            className="tour-tabs"
                            items={[
                                {
                                    key: '1',
                                    label: t('tour.scheduleDetail'),
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
                                                                            {item.specialtyShopId ? (
                                                                                <Link
                                                                                    to={`/shop/${item.specialtyShopId}`}
                                                                                    style={{ color: '#1677ff', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}
                                                                                >
                                                                                    📍 {item.specialtyShop.shopName}
                                                                                    {item.specialtyShop.location &&
                                                                                        ` - ${item.specialtyShop.location}`
                                                                                    }
                                                                                </Link>
                                                                            ) : (
                                                                                <span style={{ color: '#888' }}>
                                                                                    📍 {item.specialtyShop.shopName}
                                                                                    {item.specialtyShop.location &&
                                                                                        ` - ${item.specialtyShop.location}`
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        }))
                                                    }
                                                />
                                            ) : (
                                                <Text type="secondary">{t('tour.noScheduleDetail')}</Text>
                                            )}
                                        </div>
                                    )
                                },
                                {
                                    key: '2',
                                    label: t('tour.infoTitle'),
                                    children: (
                                        <div className="tour-info-content">
                                            {/* Thông tin bao gồm và không bao gồm */}
                                            <div className="included-excluded">
                                                <div className="included">
                                                    <Title level={5}>{t('tour.included')}</Title>
                                                    <ul>
                                                        <li>
                                                            <CheckCircleOutlined className="included-icon" />
                                                            {t('tour.guide')}
                                                        </li>
                                                        <li>
                                                            <CheckCircleOutlined className="included-icon" />
                                                            {t('tour.insurance')}
                                                        </li>
                                                        <li>
                                                            <CheckCircleOutlined className="included-icon" />
                                                            {t('tour.transport')}
                                                        </li>
                                                    </ul>
                                                </div>

                                                <div className="excluded">
                                                    <Title level={5}>{t('tour.notIncluded')}</Title>
                                                    <ul>
                                                        <li>
                                                            <InfoCircleOutlined className="excluded-icon" />
                                                            {t('tour.personalCost')}
                                                        </li>
                                                        <li>
                                                            <InfoCircleOutlined className="excluded-icon" />
                                                            {t('tour.extraDrink')}
                                                        </li>
                                                        <li>
                                                            <InfoCircleOutlined className="excluded-icon" />
                                                            {t('tour.guideTip')}
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <Divider />

                                        </div>
                                    )
                                },
                                {
                                    key: '3',
                                    label: `${t('tour.reviewTitle')} (${mockReviews.length})`,
                                    children: (
                                        <div className="reviews-section">
                                            <div className="reviews-summary">
                                                <div className="rating-summary">
                                                    <Title level={2}>{averageRating.toFixed(1)}</Title>
                                                    <Rate disabled defaultValue={averageRating} />
                                                    <Text>{mockReviews.length} {t('tour.reviews')}</Text>
                                                </div>
                                                <Button type="primary" icon={<StarOutlined />}>
                                                    {t('tour.writeReview')}
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
                                        <Text className="current-price">{t('tour.contact')}</Text>
                                        <Text className="price-per">{t('tour.perPerson')}</Text>
                                    </>
                                )}
                            </div>

                            <Divider />

                            {/* Availability Warning */}
                            {availableSlots < 5 && availableSlots > 0 && (
                                <div className="availability-info warning">
                                    <div className="availability-text">
                                        <TeamOutlined />
                                        <Text>{t('tour.onlyLeft', { count: availableSlots })}</Text>
                                    </div>
                                </div>
                            )}

                            {availableSlots === 0 && (
                                <div className="availability-info error">
                                    <div className="availability-text">
                                        <TeamOutlined />
                                        <Text>{t('tour.full')}</Text>
                                    </div>
                                </div>
                            )}

                            {/* Tour Info */}
                            <Descriptions column={1} size="small" className="tour-info-grid">
                                {tour.tourOperation && (
                                    <>
                                        <Descriptions.Item label={t('tour.maxGuests')}>
                                            <Space>
                                                <TeamOutlined />
                                                {tour.tourOperation.maxGuests} {t('tour.unitPerson')}
                                            </Space>
                                        </Descriptions.Item>

                                        <Descriptions.Item label={t('tour.booked')}>
                                            <Space>
                                                <ShoppingCartOutlined />
                                                {realTimeAvailability
                                                    ? realTimeAvailability.currentBookings
                                                    : (tour.tourOperation.currentBookings || 0)} {t('tour.unitPerson')}
                                            </Space>
                                        </Descriptions.Item>

                                        <Descriptions.Item label={t('tour.availableSpots')}>
                                            <Space>
                                                <Text style={{ color: availableSlots > 5 ? 'green' : 'orange' }}>
                                                    {availableSlots} {t('tour.unitSpot')}
                                                </Text>
                                            </Space>
                                        </Descriptions.Item>

                                        {tour.tourOperation.tourStartDate && (
                                            <Descriptions.Item label={t('tour.startDate')}>
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
                                {availableSlots === 0 ? t('tour.full') : t('tour.bookNow')}
                            </Button>

                            {!isAuthenticated && (
                                <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>
                                    {t('tour.needLogin')}
                                </Text>
                            )}

                            {/* Action Buttons */}
                            <div className="action-buttons">
                                <Button icon={<ShareAltOutlined />} className="action-button" onClick={() => setSharePopupVisible(true)}>
                                    {t('common.share')}
                                </Button>
                                <SharePopup visible={sharePopupVisible} onClose={() => setSharePopupVisible(false)} url={window.location.href} />
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
                        message.success(t('tours.detail.loginSuccess'));
                    }}
                />
            </div>
        </div>
    );
};

export default TourDetailsPage;
