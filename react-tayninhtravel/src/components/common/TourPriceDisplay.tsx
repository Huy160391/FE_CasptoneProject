import React from 'react';
import { Tag, Typography, Space, Tooltip } from 'antd';
import { ClockCircleOutlined, FireOutlined } from '@ant-design/icons';
import { calculateTourPricing, formatPriceNumber, getRemainingEarlyBirdDays, isEarlyBirdEndingSoon } from '../../services/pricingService';

const { Text } = Typography;

interface TourPriceDisplayProps {
    price: number;
    createdAt: string;
    tourStartDate?: string;
    numberOfGuests?: number;
    showDetails?: boolean;
    size?: 'small' | 'default' | 'large';
    className?: string;
}

/**
 * Component hiển thị giá tour với logic early bird discount
 */
const TourPriceDisplay: React.FC<TourPriceDisplayProps> = ({
    price,
    createdAt,
    tourStartDate,
    numberOfGuests = 1,
    showDetails = true,
    size = 'default',
    className = ''
}) => {
    const pricingInfo = calculateTourPricing(
        { price, createdAt, tourStartDate },
        numberOfGuests
    );

    const remainingDays = getRemainingEarlyBirdDays(createdAt);
    const isEndingSoon = isEarlyBirdEndingSoon(createdAt);

    const getFontSize = () => {
        switch (size) {
            case 'small': return { current: '14px', original: '12px' };
            case 'large': return { current: '24px', original: '16px' };
            default: return { current: '18px', original: '14px' };
        }
    };

    const fontSize = getFontSize();

    return (
        <div className={`tour-price-display ${className}`}>
            <Space direction="vertical" size={2}>
                {/* Main Price Display */}
                <Space align="baseline" size={8}>
                    {pricingInfo.isEarlyBird ? (
                        <>
                            {/* Discounted Price */}
                            <Text 
                                strong 
                                style={{ 
                                    fontSize: fontSize.current, 
                                    color: '#ff4d4f' 
                                }}
                            >
                                {formatPriceNumber(pricingInfo.finalPrice)}₫
                            </Text>
                            
                            {/* Original Price (crossed out) */}
                            <Text 
                                delete 
                                type="secondary"
                                style={{ fontSize: fontSize.original }}
                            >
                                {formatPriceNumber(pricingInfo.originalPrice)}₫
                            </Text>
                        </>
                    ) : (
                        /* Regular Price */
                        <Text 
                            strong 
                            style={{ fontSize: fontSize.current }}
                        >
                            {formatPriceNumber(pricingInfo.finalPrice)}₫
                        </Text>
                    )}
                </Space>

                {/* Price Details */}
                {showDetails && (
                    <Space size={4} wrap>
                        {/* Early Bird Tag */}
                        {pricingInfo.isEarlyBird && (
                            <Tooltip title={`Giảm ${pricingInfo.discountPercent}% cho khách đặt sớm`}>
                                <Tag 
                                    color="red" 
                                    icon={<FireOutlined />}
                                    style={{ fontSize: '11px' }}
                                >
                                    Early Bird -{pricingInfo.discountPercent}%
                                </Tag>
                            </Tooltip>
                        )}

                        {/* Countdown Tag */}
                        {pricingInfo.isEarlyBird && remainingDays > 0 && (
                            <Tooltip title="Số ngày còn lại để được giảm giá Early Bird">
                                <Tag 
                                    color={isEndingSoon ? 'orange' : 'blue'}
                                    icon={<ClockCircleOutlined />}
                                    style={{ fontSize: '11px' }}
                                >
                                    Còn {remainingDays} ngày
                                </Tag>
                            </Tooltip>
                        )}

                        {/* Last Minute Tag */}
                        {!pricingInfo.isEarlyBird && (
                            <Tag color="default" style={{ fontSize: '11px' }}>
                                Giá thường
                            </Tag>
                        )}
                    </Space>
                )}

                {/* Per Guest Note */}
                {numberOfGuests === 1 && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        / khách
                    </Text>
                )}

                {/* Multiple Guests Note */}
                {numberOfGuests > 1 && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        Tổng cho {numberOfGuests} khách
                    </Text>
                )}

                {/* Savings Display */}
                {pricingInfo.isEarlyBird && pricingInfo.discountAmount > 0 && (
                    <Text 
                        type="success" 
                        style={{ fontSize: '12px', fontWeight: 500 }}
                    >
                        Tiết kiệm {formatPriceNumber(pricingInfo.discountAmount)}₫
                    </Text>
                )}
            </Space>
        </div>
    );
};

export default TourPriceDisplay;
