import { Card, Avatar, Typography, Rate, Tag, Button, Spin } from 'antd'
import {
    ShopOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined
} from '@ant-design/icons'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { userService } from '@/services/userService'
import './ShopInfo.scss'

const { Title, Text, Paragraph } = Typography

interface ShopInfoProps {
    shopId: string
}

interface ShopData {
    id: string;
    userId: string;
    shopName: string;
    description: string;
    location: string;
    representativeName: string;
    email: string;
    phoneNumber: string;
    website: string | null;
    businessLicense: string;
    businessLicenseUrl: string | null;
    logoUrl: string | null;
    shopType: string;
    openingHours: string;
    closingHours: string;
    rating: number;
    isShopActive: boolean;
    createdAt: string;
    updatedAt: string;
    userName: string | null;
    userEmail: string | null;
    userAvatar: string | null;
    userRole: string | null;
}

const ShopInfo: React.FC<ShopInfoProps> = ({ shopId }) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [shopData, setShopData] = useState<ShopData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchShopInfo = async () => {
            try {
                setLoading(true)
                setError(null)
                console.log('Fetching shop info for shopId:', shopId)

                const response = await userService.getShopInfo(shopId)
                console.log('Shop info response:', response)

                setShopData(response)
            } catch (err) {
                console.error('Error fetching shop info:', err)
                setError(t('specialtyShop.info.error'))
            } finally {
                setLoading(false)
            }
        }

        if (shopId) {
            fetchShopInfo()
        }
    }, [shopId])

    if (loading) {
        return (
            <div className="shop-info-section">
                <Title level={3} className="section-title">
                    {t('specialtyShop.info.title')}
                </Title>
                <Card
                    className="shop-info-card"
                    style={{ boxShadow: 'none', border: 'none' }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', width: '100%' }}>
                        <Spin size="large" />
                        <div style={{ marginTop: '10px' }}>{t('specialtyShop.info.loading')}</div>
                    </div>
                </Card>
            </div>
        )
    }

    if (error || !shopData) {
        return (
            <div className="shop-info-section">
                <Title level={3} className="section-title">
                    {t('specialtyShop.info.title')}
                </Title>
                <Card
                    className="shop-info-card"
                    style={{ boxShadow: 'none', border: 'none' }}
                >
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Text type="danger">{error || t('specialtyShop.info.notFound')}</Text>
                    </div>
                </Card>
            </div>
        )
    }

    const handleViewShop = () => {
        console.log('View shop:', shopData.id)
        navigate(`/shop/${shopData.id}`)
    }

    return (
        <div className="shop-info-section">
            <Title level={3} className="section-title">
                {t('specialtyShop.info.title')}
            </Title>
            <Card
                className="shop-info-card"
                style={{ boxShadow: 'none', border: 'none' }}
            >
                <div className="shop-info-header">
                    <div className="shop-avatar-section">
                        <Avatar
                            size={64}
                            src={shopData.logoUrl || "https://placehold.co/64x64/2B5CE6/FFFFFF?text=Shop"}
                            className="shop-avatar"
                        />
                        <div className="shop-basic-info">
                            <div className="shop-name-row">
                                <Title level={4} className="shop-name">
                                    {shopData.shopName}
                                </Title>
                                <Tag color="blue" className="shop-type-tag">
                                    {shopData.shopType}
                                </Tag>
                            </div>
                            <div className="shop-rating">
                                <Rate disabled defaultValue={shopData.rating} />
                                <Text className="rating-text">
                                    {t('specialtyShop.info.rating', { rating: shopData.rating })}
                                </Text>
                            </div>
                            <div className="shop-hours">
                                <Text type="secondary">
                                    <ClockCircleOutlined /> {t('specialtyShop.info.openHours', {
                                        open: shopData.openingHours,
                                        close: shopData.closingHours
                                    })}
                                </Text>
                            </div>
                        </div>
                    </div>

                    <div className="shop-actions">
                        <Button
                            type="primary"
                            icon={<ShopOutlined />}
                            onClick={handleViewShop}
                            className="view-shop-btn"
                        >
                            {t('specialtyShop.info.viewShop')}
                        </Button>
                    </div>
                </div>

                <div className="shop-info-details">
                    <Paragraph className="shop-description">
                        {shopData.description}
                    </Paragraph>

                    <div className="shop-location">
                        <EnvironmentOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        <Text>{shopData.location}</Text>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default ShopInfo
