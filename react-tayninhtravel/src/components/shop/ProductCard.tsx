import { Card, Button, Space } from 'antd'
import { ShoppingCartOutlined, StarOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProductCart } from '@/hooks/useCart'
import { getCategoryViLabel } from '@/utils/categoryViLabels'
import './ProductCard.scss'

const { Meta } = Card

// Extended Product interface with UI specific fields
export interface ProductCardData {
    id: string
    name: string
    imageUrl?: string[]
    image?: string
    price: number
    category: string
    rating?: number
    reviews?: number
    soldCount?: number
    quantityInStock?: number
    isSale?: boolean
    salePercent?: number
    isActive?: boolean
}

interface ProductCardProps {
    product: ProductCardData
    showAddToCart?: boolean
    onAddToCart?: (product: ProductCardData) => void
}

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    showAddToCart = true,
    onAddToCart
}) => {
    const { t, i18n } = useTranslation()
    const productCart = useProductCart(product.id)

    // Get image URL - support both imageUrl array and single image string
    const imageUrl = product.imageUrl && product.imageUrl.length > 0
        ? product.imageUrl[0]
        : product.image || 'https://placehold.co/400x400?text=No+Image'

    // Default values for optional fields
    const rating = product.rating || 4.5
    const reviews = product.reviews || 0
    const soldCount = product.soldCount || 0
    const quantityInStock = product.quantityInStock ?? 999
    const isOutOfStock = quantityInStock === 0

    // Calculate discounted price if on sale
    // API trả về giá đã giảm, cần tính ngược lại giá gốc nếu có salePercent
    const currentPrice = product.price;
    const originalPrice = product.isSale && product.salePercent
        ? Math.round(product.price / (1 - product.salePercent / 100))
        : null;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isOutOfStock) return

        if (onAddToCart) {
            onAddToCart(product)
        } else {
            // Use default cart logic
            productCart.addToCart({
                cartItemId: "", // Empty string for new items, will be updated after syncing
                productId: product.id,
                name: product.name,
                image: imageUrl,
                price: currentPrice,
                quantity: 1
            })
        }
    }

    return (
        <Link to={`/shop/product/${product.id}`} className="product-link">
            <Card
                hoverable
                cover={
                    <div className="product-image-container">
                        <img alt={product.name} src={imageUrl} />
                        {isOutOfStock && (
                            <div className="out-of-stock-overlay">
                                <span>{t('shop.outOfStock')}</span>
                            </div>
                        )}
                        {product.isSale && product.salePercent && (
                            <div className="sale-badge">-{product.salePercent}%</div>
                        )}
                    </div>
                }
                className="product-card"
            >
                <Meta
                    title={product.name}
                    description={i18n.language === 'vi' ? getCategoryViLabel(product.category.toLowerCase()) : product.category}
                />

                <div className="product-rating">
                    <Space>
                        <StarOutlined style={{ color: '#faad14' }} />
                        <span>{rating.toFixed(1)}</span>
                        <span className="review-count">({reviews})</span>
                        <span className="sold-count">• {t('shop.soldCount', { count: soldCount })}</span>
                    </Space>
                </div>

                <div className="product-price">

                    <span className="current-price">
                        {currentPrice.toLocaleString('vi-VN')}₫
                    </span>
                    {product.isSale && originalPrice && (
                        <span className="original-price">
                            {originalPrice.toLocaleString('vi-VN')}₫
                        </span>
                    )}
                </div>

                {showAddToCart && (
                    <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        onClick={handleAddToCart}
                        loading={productCart.loading}
                        disabled={isOutOfStock}
                        className="add-to-cart-btn"
                        block
                        style={{ marginTop: '12px' }}
                    >
                        {isOutOfStock
                            ? t('shop.outOfStock')
                            : productCart.isInCart
                                ? `${t('cart.inCart')} (${productCart.quantity})`
                                : t('cart.addToCart')
                        }
                    </Button>
                )}
            </Card>
        </Link>
    )
}

export default ProductCard
