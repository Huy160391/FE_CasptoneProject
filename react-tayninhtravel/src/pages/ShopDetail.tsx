import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom';
import { Typography, Avatar, Tag, Rate, Spin, Empty, Card, Button, Skeleton, Breadcrumb } from 'antd';
import { ShareAltOutlined, ShopOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, ClockCircleOutlined, UserOutlined, FileTextOutlined, CalendarOutlined, GlobalOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import SharePopup from '../components/common/SharePopup';
import { userService } from '@/services/userService'
import * as specialtyShopService from '@/services/specialtyShopService'
import { Product } from '@/types'
import ProductCard from '@/components/shop/ProductCard'
import { useTranslation } from 'react-i18next'
import './ShopDetail.scss'

const { Title, Text, Paragraph } = Typography

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

const ShopDetail: React.FC = () => {
    const { t } = useTranslation()
    const [sharePopupVisible, setSharePopupVisible] = useState(false);
    const { shopId } = useParams<{ shopId: string }>()

    const [shopData, setShopData] = useState<ShopData | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [productsLoading, setProductsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchShopData = async () => {
            if (!shopId) return

            try {
                setLoading(true)
                setError(null)
                console.log('Fetching shop data for shopId:', shopId)

                const response = await userService.getShopInfo(shopId)
                console.log('Shop data response:', response)

                setShopData(response)
            } catch (err) {
                console.error('Error fetching shop data:', err)
                setError(t('specialtyShop.detail.error'))
            } finally {
                setLoading(false)
            }
        }

        fetchShopData()
    }, [shopId])

    useEffect(() => {
        const fetchProducts = async () => {
            if (!shopId) return

            try {
                setProductsLoading(true)
                console.log('Fetching products for shopId:', shopId)

                // Get all products and filter by specialtyShopId
                const response = await specialtyShopService.getProducts({ pageSize: 1000 })
                console.log('Products response:', response)

                // Filter products by shopId
                const shopProducts = response.data?.filter(product =>
                    product.specialtyShopId === shopId
                ) || []

                setProducts(shopProducts)
            } catch (err) {
                console.error('Error fetching products:', err)
                setProducts([])
            } finally {
                setProductsLoading(false)
            }
        }

        if (shopData) {
            fetchProducts()
        }
    }, [shopId, shopData])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN')
    }

    if (loading) {
        return (
            <div className="shop-detail-page">
                <div className="loading-container">
                    <Spin size="large" />
                    <div className="loading-text">{t('specialtyShop.detail.loading')}</div>
                </div>
            </div>
        )
    }

    if (error || !shopData) {
        return (
            <div className="shop-detail-page">
                <div className="error-container">
                    <ExclamationCircleOutlined className="error-icon" />
                    <Title level={3} className="error-title">{t('specialtyShop.detail.notFoundTitle')}</Title>
                    <Text className="error-message">{error || t('specialtyShop.detail.notFoundMessage')}</Text>
                    <Button type="primary" onClick={() => window.history.back()}>
                        {t('specialtyShop.detail.backButton')}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="shop-detail-page">
            {/* Breadcrumb */}
            <Breadcrumb
                className="breadcrumb"
                items={[
                    { title: <Link to="/">{t('specialtyShop.detail.breadcrumbHome')}</Link> },
                    { title: <Link to="/shop">{t('specialtyShop.detail.breadcrumbShop')}</Link> },
                    { title: shopData.shopName }
                ]}
            />

            {/* Shop Header */}
            <div className="shop-header">
                <div className="shop-header-content">
                    <Avatar
                        size={120}
                        src={shopData.logoUrl || `https://placehold.co/120x120/667eea/FFFFFF?text=${shopData.shopName.charAt(0)}`}
                        className="shop-avatar"
                    />
                    <div className="shop-main-info">
                        <Title level={1} className="shop-name">{shopData.shopName}</Title>
                        <Tag className="shop-type-tag">{shopData.shopType}</Tag>
                        <div className="shop-rating">
                            <Rate disabled allowHalf value={shopData.rating} />
                            <Text className="rating-text">{t('specialtyShop.detail.ratingText', { rating: shopData.rating })}</Text>
                        </div>
                        <div className="shop-stats-with-share" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                            <div className="shop-stats" style={{ display: 'flex', gap: 32 }}>
                                <div className="stat-item open-hours">
                                    <ClockCircleOutlined />
                                    <span>{t('specialtyShop.detail.openHours', { open: shopData.openingHours, close: shopData.closingHours })}</span>
                                </div>
                                <div className="stat-item product-count">
                                    <ShopOutlined />
                                    <span>{t('specialtyShop.detail.productCount', { count: products.length })}</span>
                                </div>
                                <div className="stat-item join-date">
                                    <CalendarOutlined />
                                    <span>{t('specialtyShop.detail.joinedDate', { date: formatDate(shopData.createdAt) })}</span>
                                </div>
                            </div>
                            <Button type="text" icon={<ShareAltOutlined />} className="share-btn" onClick={() => setSharePopupVisible(true)} />
                            <SharePopup visible={sharePopupVisible} onClose={() => setSharePopupVisible(false)} url={window.location.href} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="shop-content">
                {/* Shop Information */}
                <div className="content-section shop-info-section">
                    <Title level={3} className="section-title">{t('specialtyShop.detail.infoTitle')}</Title>
                    <Paragraph className="shop-description">{shopData.description}</Paragraph>
                    <div className="info-grid">
                        <div className="info-item">
                            <EnvironmentOutlined className="info-icon address-icon" />
                            <div className="info-content">
                                <span className="info-label">{t('specialtyShop.detail.address')}</span>
                                <span className="info-value">{shopData.location}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <PhoneOutlined className="info-icon phone-icon" />
                            <div className="info-content">
                                <span className="info-label">{t('specialtyShop.detail.phone')}</span>
                                <span className="info-value">{shopData.phoneNumber}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <MailOutlined className="info-icon email-icon" />
                            <div className="info-content">
                                <span className="info-label">{t('specialtyShop.detail.email')}</span>
                                <span className="info-value">{shopData.email}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <UserOutlined className="info-icon rep-icon" />
                            <div className="info-content">
                                <span className="info-label">{t('specialtyShop.detail.representative')}</span>
                                <span className="info-value">{shopData.representativeName}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <FileTextOutlined className="info-icon license-icon" />
                            <div className="info-content">
                                <span className="info-label">{t('specialtyShop.detail.businessLicense')}</span>
                                <span className="info-value">{shopData.businessLicense}</span>
                            </div>
                        </div>
                        {shopData.website && (
                            <div className="info-item">
                                <GlobalOutlined className="info-icon web-icon" />
                                <div className="info-content">
                                    <span className="info-label">{t('specialtyShop.detail.website')}</span>
                                    <a href={shopData.website} target="_blank" rel="noopener noreferrer" className="info-value website-link">
                                        {shopData.website}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Products Section */}
                <div className="content-section products-section">
                    <Title level={3} className="section-title">
                        {t('specialtyShop.detail.productsTitle', { count: products.length })}
                    </Title>
                    {productsLoading ? (
                        <div className="products-loading">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <Card key={index} className="product-skeleton">
                                    <Skeleton.Image className="product-skeleton-img" />
                                    <Skeleton active paragraph={{ rows: 2 }} />
                                </Card>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="products-grid">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={{
                                        ...product,
                                        description: product.description ?? undefined
                                    }}
                                    showAddToCart={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-products">
                            <Empty
                                description={t('specialtyShop.detail.noProducts')}
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ShopDetail
