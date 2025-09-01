import { Card, Button, Space, Tag } from 'antd'
import { CalendarOutlined, EnvironmentOutlined, UserOutlined, StarOutlined, ClockCircleFilled } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { TourDetail } from '@/services/tourDetailsService'
import { TourDetailsStatus } from '@/types/tour'
import { mapStringToStatusEnum } from '@/utils/statusMapper'
import { getTourImageWithFallback, getTourImageAltText } from '@/utils/imageUtils'
import TourPriceDisplay from '@/components/common/TourPriceDisplay'
import './TourCard.scss'

const { Meta } = Card

interface TourCardProps {
    tour: TourDetail
    onBookNow: (tour: TourDetail) => void
    onViewDetails: (tour: TourDetail) => void
}

const TourCard = ({ tour, onBookNow, onViewDetails }: TourCardProps) => {
    const { t } = useTranslation()

    const handleBookNow = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onBookNow(tour)
    }

    const handleCardClick = () => {
        onViewDetails(tour)
    }

    // Status tag function
    const getStatusTag = (status: number) => {
        switch (status) {
            case TourDetailsStatus.Public:
                return <Tag color="green" icon={<StarOutlined />}>{t('tours.status.public', 'Đang mở bán')}</Tag>;
            case TourDetailsStatus.WaitToPublic:
                return <Tag color="orange" icon={<ClockCircleFilled />}>{t('tours.status.waitToPublic', 'Sắp mở bán')}</Tag>;
            case TourDetailsStatus.Approved:
                return <Tag color="blue">{t('tours.status.approved', 'Đã duyệt')}</Tag>;
            case TourDetailsStatus.AwaitingGuideAssignment:
                return <Tag color="purple">{t('tours.status.awaitingGuide', 'Chờ phân công HDV')}</Tag>;
            default:
                return <Tag color="default">{t('tours.status.notReady', 'Chưa sẵn sàng')}</Tag>;
        }
    };

    // Get tour image with fallback
    const tourImage = tour.imageUrls && tour.imageUrls.length > 0
        ? tour.imageUrls[0]
        : tour.imageUrl || '/src/assets/Tay Ninh 4.jpg' // Default fallback image

    // Check if tour is available: at least one slot is 'Available' (string) and has seats left
    const hasAvailableSlot = Array.isArray(tour.availableSlots) && tour.availableSlots.some(
        slot => String(slot.status).toLowerCase() === 'available' && Number(slot.availableSpots) > 0
    );
    const isAvailable = hasAvailableSlot;

    return (
        <div className="tour-card-wrapper">
            <Card
                hoverable
                onClick={handleCardClick}
                cover={
                    <div className="tour-image-container">
                        <img
                            alt={getTourImageAltText(tour.title, tour.title)}
                            src={getTourImageWithFallback(tourImage, tour.title)}
                        />
                        <div className="tour-status-overlay">
                            {getStatusTag(typeof tour.status === 'string' ? mapStringToStatusEnum(tour.status) : tour.status)}
                        </div>
                        {/* Show image count if multiple images */}
                        {tour.imageUrls && tour.imageUrls.length > 1 && (
                            <div className="image-count-badge">
                                +{tour.imageUrls.length - 1}
                            </div>
                        )}
                        {!isAvailable && (
                            <div className="unavailable-overlay">
                                <span>{t('tours.unavailable')}</span>
                            </div>
                        )}
                    </div>
                }
                className="tour-card"
            >
                <Meta
                    title={tour.title}
                />

                <div className="tour-details">
                    {/* Location */}
                    <div className="tour-info-row">
                        <Space>
                            <EnvironmentOutlined />
                            <span>
                                {tour.tourTemplate?.startLocation} → {tour.tourTemplate?.endLocation}
                            </span>
                        </Space>
                    </div>

                    {/* Rating - similar to shop card */}
                    <div className="tour-info-row">
                        <Space>
                            <StarOutlined style={{ color: '#faad14' }} />
                            <span>4.5</span>
                        </Space>
                    </div>

                    {/* Availability */}
                    {tour.tourOperation?.maxGuests && isAvailable && (
                        <div className="tour-info-row">
                            <Space>
                                <UserOutlined />
                                <span className="seats-left">
                                    {tour.tourOperation.maxGuests - (tour.tourOperation.currentBookings || 0)} {t('tours.seatsLeft')}
                                </span>
                            </Space>
                        </div>
                    )}

                    {/* Start Date */}
                    {tour.tourOperation?.tourStartDate && (
                        <div className="tour-info-row">
                            <Space>
                                <CalendarOutlined />
                                <span>
                                    {t('tours.startDate')}: {dayjs(tour.tourOperation.tourStartDate).format('DD/MM/YYYY')}
                                </span>
                            </Space>
                        </div>
                    )}
                </div>

                {/* Price Section */}
                <div className="tour-price">
                    {tour.tourOperation?.price ? (
                        <TourPriceDisplay
                            price={tour.tourOperation.price}
                            createdAt={tour.createdAt}
                            tourStartDate={tour.tourOperation?.tourStartDate}
                            size="large"
                            showDetails={true}
                        />
                    ) : (
                        <span className="price-placeholder">{t('tours.contactForPrice', 'Liên hệ')}</span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="tour-actions">
                    <Button
                        type="primary"
                        onClick={handleBookNow}
                        disabled={!isAvailable}
                        className="book-now-btn"
                        block
                    >
                        {isAvailable ? t('tours.bookNow') : t('tours.unavailable')}
                    </Button>
                </div>
            </Card>
        </div>
    )
}

export default TourCard