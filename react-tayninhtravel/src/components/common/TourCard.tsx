import React from 'react';
import { Card, Tag } from 'antd';
import {
    CalendarOutlined,
    EnvironmentOutlined,
    StarOutlined,
    ClockCircleFilled
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { TourDetailsStatus } from '../../types/tour';
import { getTourImageWithFallback, getTourImageAltText } from '../../utils/imageUtils';
import { mapStringToStatusEnum } from '../../utils/statusMapper';
import TourPriceDisplay from './TourPriceDisplay';
import './TourCard.scss';

interface TourDetail {
    id: string;
    title: string;
    description: string;
    tourTemplateName: string;
    imageUrls: string[];
    imageUrl?: string;
    createdAt: string;
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
    status: string | number;
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
                        {getStatusTag(typeof tour.status === 'string' ? mapStringToStatusEnum(tour.status) : tour.status)}
                    </div>
                    {/* Show image count if multiple images */}
                    {tour.imageUrls && tour.imageUrls.length > 1 && (
                        <div className="image-count-badge">
                            +{tour.imageUrls.length - 1} {t('tours.imageCount', 'ảnh')}
                        </div>
                    )}
                </div>
            }
            actions={[
                <button
                    className="custom-book-now-btn"
                    onClick={e => { e.stopPropagation(); onBookNow(tour); }}
                    disabled={!tour.tourOperation?.isActive}
                >
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    {t('tours.bookNow')}
                </button>
            ]}
            onClick={() => onViewDetails(tour)}
            style={{ cursor: 'pointer' }}
        >
            <div className="tour-content">
                <div className="tour-header">
                    <h3 className="tour-title">{tour.title}</h3>
                    <div className="tour-location">
                        <EnvironmentOutlined />
                        <span>{tour.tourTemplateName}</span>
                    </div>
                </div>
                <div className="tour-footer" style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="price-section">
                        {tour.tourOperation?.price ? (
                            <TourPriceDisplay
                                price={tour.tourOperation.price}
                                size="large"
                                createdAt={tour.createdAt}
                            />
                        ) : (
                            <span className="price-placeholder">{t('tours.contactForPrice', 'Liên hệ')}</span>
                        )}
                    </div>
                    <div className="availability-info">
                        {tour.tourOperation && (
                            <span className="seats-info">
                                {t('tours.seatsLeft', { count: (tour.tourOperation.maxGuests || 0) - (tour.tourOperation.currentBookings || 0) })}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default TourCard;