import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { Typography, Avatar, Tag, Rate, Spin, Empty, Card, Button, Skeleton } from 'antd';
import { ShareAltOutlined, ShopOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, ClockCircleOutlined, UserOutlined, FileTextOutlined, CalendarOutlined, GlobalOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import SharePopup from '../components/common/SharePopup';
import { userService } from '@/services/userService'
import * as specialtyShopService from '@/services/specialtyShopService'
import { Product } from '@/types'
import ProductCard from '@/components/shop/ProductCard'
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
                setError('Không thể tải thông tin cửa hàng')
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
                    <div className="loading-text">Đang tải thông tin cửa hàng...</div>
                </div>
            </div>
        )
    }

    if (error || !shopData) {
        return (
            <div className="shop-detail-page">
                <div className="error-container">
                    <ExclamationCircleOutlined className="error-icon" />
                    <Title level={3} className="error-title">Không thể tải thông tin cửa hàng</Title>
                    <Text className="error-message">{error || 'Cửa hàng không tồn tại hoặc đã bị xóa'}</Text>
                    <Button type="primary" onClick={() => window.history.back()}>
                        Quay lại
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="shop-detail-page">
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
                            <Text className="rating-text">{shopData.rating} / 5</Text>
                        </div>
                        <div className="shop-stats-with-share" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                            <div className="shop-stats" style={{ display: 'flex', gap: 32 }}>
                                <div className="stat-item open-hours">
                                    <ClockCircleOutlined />
                                    <span>Mở cửa: {shopData.openingHours} - {shopData.closingHours}</span>
                                </div>
                                <div className="stat-item product-count">
                                    <ShopOutlined />
                                    <span>{products.length} sản phẩm</span>
                                </div>
                                <div className="stat-item join-date">
                                    <CalendarOutlined />
                                    <span>Tham gia từ {formatDate(shopData.createdAt)}</span>
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
                    <Title level={3} className="section-title">Thông tin cửa hàng </Title>
                    <Paragraph className="shop-description">{shopData.description}</Paragraph>
                    <div className="info-grid">
                        <div className="info-item">
                            <EnvironmentOutlined className="info-icon address-icon" />
                            <div className="info-content">
                                <span className="info-label">Địa chỉ </span>
                                <span className="info-value">{shopData.location}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <PhoneOutlined className="info-icon phone-icon" />
                            <div className="info-content">
                                <span className="info-label">Số điện thoại </span>
                                <span className="info-value">{shopData.phoneNumber}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <MailOutlined className="info-icon email-icon" />
                            <div className="info-content">
                                <span className="info-label">Email </span>
                                <span className="info-value">{shopData.email}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <UserOutlined className="info-icon rep-icon" />
                            <div className="info-content">
                                <span className="info-label">Người đại diện </span>
                                <span className="info-value">{shopData.representativeName}</span>
                            </div>
                        </div>
                        <div className="info-item">
                            <FileTextOutlined className="info-icon license-icon" />
                            <div className="info-content">
                                <span className="info-label">Giấy phép kinh doanh </span>
                                <span className="info-value">{shopData.businessLicense}</span>
                            </div>
                        </div>
                        {shopData.website && (
                            <div className="info-item">
                                <GlobalOutlined className="info-icon web-icon" />
                                <div className="info-content">
                                    <span className="info-label">Website </span>
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
                        Sản phẩm của cửa hàng ({products.length})
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
                                    product={product}
                                    showAddToCart={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-products">
                            <Empty
                                description="Cửa hàng chưa có sản phẩm nào"
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
