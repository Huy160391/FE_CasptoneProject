import React from 'react';
import { Card, Button, Tag, Divider } from 'antd';
import {
    CalendarOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    UserOutlined,
    StarOutlined,
    ClockCircleFilled
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { TourDetailsStatus } from '../../types/tour';
import { getTourImageWithFallback, getTourImageAltText } from '../../utils/imageUtils';
import TourPriceDisplay from './TourPriceDisplay';
import './TourCard.scss';

interface TourDetail {
    id: string;
    title: string;
    description: string;
    tourTemplateName: string;
    imageUrls: string[];
    imageUrl?: string;
    tourOperation?: {
        id: string;
        price: number;
        maxGuests: number;
        currentBookings: number;
        isActive: boolean;
    };
    timeline?: Array<{
        activity: string;
        checkInTime: string;
    }>;
    status: number;
}

interface TourCardProps {
    tour: TourDetail;
    onBookNow: (tour: TourDetail) => void;
    onViewDetails: (tour: TourDetail) => void;
    className?: string;
}

const TourCard: React.FC<TourCardProps> = ({
    tour,
    onBookNow,
    onViewDetails,
    className = ''
}) => {
    const { t } = useTranslation();

    const getStatusTag = (status: number) => {
        switch (status) {
            case TourDetailsStatus.Public:
                return <Tag color="green" icon={<StarOutlined />}>Đang mở bán</Tag>;
            case TourDetailsStatus.WaitToPublic:
                return <Tag color="orange" icon={<ClockCircleFilled />}>Sắp mở bán</Tag>;
            case TourDetailsStatus.Approved:
                return <Tag color="blue">Đã duyệt</Tag>;
            case TourDetailsStatus.AwaitingGuideAssignment:
                return <Tag color="purple">Chờ phân công HDV</Tag>;
            default:
                return <Tag color="default">Chưa sẵn sàng</Tag>;
        }
    };

    // Get the main image (first image or fallback)
    const mainImage = tour.imageUrls && tour.imageUrls.length > 0 
        ? tour.imageUrls[0] 
        : tour.imageUrl;

    return (
        <Card
            hoverable
            className={`tour-card ${className}`}
            cover={
                <div className="tour-image-container">
                    <img
                        alt={getTourImageAltText(tour.title, tour.tourTemplateName)}
                        src={getTourImageWithFallback(mainImage, tour.tourTemplateName)}
                        className="tour-image"
                    />
                    <div className="tour-status-overlay">
                        {getStatusTag(tour.status)}
                    </div>
                    {/* Show image count if multiple images */}
                    {tour.imageUrls && tour.imageUrls.length > 1 && (
                        <div className="image-count-badge">
                            +{tour.imageUrls.length - 1} ảnh
                        </div>
                    )}
                </div>
            }
            actions={[
                <Button
                    type="primary"
                    size="large"
                    className="book-now-btn"
                    icon={<CalendarOutlined />}
                    onClick={() => onBookNow(tour)}
                    disabled={!tour.tourOperation?.isActive}
                >
                    {t('tours.bookNow')}
                </Button>,
                <Button
                    type="link"
                    onClick={() => onViewDetails(tour)}
                >
                    {t('tours.viewDetails')}
                </Button>
            ]}
        >
            <div className="tour-content">
                <div className="tour-header">
                    <h3 className="tour-title">{tour.title}</h3>
                    <div className="tour-location">
                        <EnvironmentOutlined />
                        <span>{tour.tourTemplateName}</span>
                    </div>
                </div>

                <p className="tour-description">
                    {tour.description?.substring(0, 120) + '...' || 'Trải nghiệm tuyệt vời đang chờ đón bạn'}
                </p>

                <Divider style={{ margin: '16px 0' }} />

                <div className="tour-details">
                    <div className="detail-item">
                        <ClockCircleOutlined className="detail-icon" />
                        <span className="detail-label">Thời gian:</span>
                        <span className="detail-value">
                            {tour.timeline?.length ? `${tour.timeline.length} hoạt động` : '1 ngày'}
                        </span>
                    </div>

                    <div className="detail-item">
                        <UserOutlined className="detail-icon" />
                        <span className="detail-label">Sức chứa:</span>
                        <span className="detail-value">
                            {tour.tourOperation?.maxGuests || 'Chưa xác định'} khách
                        </span>
                    </div>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                <div className="tour-footer">
                    <div className="price-section">
                        {tour.tourOperation?.price ? (
                            <TourPriceDisplay
                                price={tour.tourOperation.price}
                                size="large"
                                showCurrency={true}
                            />
                        ) : (
                            <span className="price-placeholder">Liên hệ</span>
                        )}
                    </div>

                    <div className="availability-info">
                        {tour.tourOperation && (
                            <span className="seats-info">
                                Còn {(tour.tourOperation.maxGuests || 0) - (tour.tourOperation.currentBookings || 0)} chỗ
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default TourCard;
