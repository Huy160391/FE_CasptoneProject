import React from 'react'; import { Card, Tag, Rate, Button, Avatar } from 'antd';
import {
    ShopOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './ShopCard.scss';
import { useTranslation } from 'react-i18next';

interface ShopCardProps {
    shop: {
        id: string;
        name: string;
        description: string;
        address: string;
        phone?: string;
        image?: string;
        rating?: number;
        reviewCount?: number;
        status: string;
        specialties?: string[];
        openTime?: string;
        closeTime?: string;
        isVerified?: boolean;
        isOpen?: boolean;
    };
    onClick?: (shopId: string) => void;
}

const ShopCard: React.FC<ShopCardProps> = ({ shop, onClick }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleViewShop = () => {
        if (onClick) {
            onClick(shop.id);
        } else {
            navigate(`/shop/${shop.id}`);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
            case 'hoạt động':
                return 'green';
            case 'pending':
            case 'chờ duyệt':
                return 'orange';
            case 'suspended':
            case 'tạm ngưng':
                return 'red';
            default:
                return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return t('shop.status.active', 'Hoạt động');
            case 'pending':
                return t('shop.status.pending', 'Chờ duyệt');
            case 'suspended':
                return t('shop.status.suspended', 'Tạm ngưng');
            default:
                return status;
        }
    };

    return (
        <Card
            className="shop-card"
            hoverable
            bodyStyle={{ padding: '24px', textAlign: 'center' }}
        >
            {/* Logo và Status */}
            <div className="shop-logo-section">
                <div className="logo-container">
                    <Avatar
                        size={80}
                        src={shop.image || '/placeholder-shop.jpg'}
                        icon={<ShopOutlined />}
                        className="shop-logo"
                    />
                    <Tag
                        color={getStatusColor(shop.status)}
                        className="status-tag"
                    >
                        {getStatusText(shop.status)}
                    </Tag>
                </div>
            </div>

            {/* Tên Shop */}
            <div className="shop-name-section">
                <h3 className="shop-name">{shop.name}</h3>
            </div>

            {/* Loại Shop (Specialties) */}
            <div className="shop-type-section">
                <p className="shop-type">
                    {shop.specialties && shop.specialties.length > 0
                        ? t(`shop.specialty.${shop.specialties[0]}`, shop.specialties[0])
                        : t('shop.defaultType', 'Cửa hàng lưu niệm')}
                </p>
            </div>

            {/* Rating */}
            {shop.rating !== undefined && (
                <div className="shop-rating-section">
                    <Rate
                        disabled
                        allowHalf
                        value={shop.rating}
                        className="rating-stars"
                    />
                    <div className="rating-info">
                        <span className="rating-text">{shop.rating}/5</span>
                        {shop.reviewCount && (
                            <span className="review-count">({shop.reviewCount})</span>
                        )}
                    </div>
                </div>
            )}

            {/* View Button */}
            <div className="shop-action-section">
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={handleViewShop}
                    className="view-button"
                    block
                >
                    {t('shop.viewButton', 'Xem cửa hàng')}
                </Button>
            </div>
        </Card>
    );
};

export default ShopCard;
