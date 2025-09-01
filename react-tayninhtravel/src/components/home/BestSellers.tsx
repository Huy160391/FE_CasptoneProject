import React from 'react'
import { Row, Col, Button, notification } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useCartStore } from '@/store/useCartStore'
import ProductCard, { ProductCardData } from '@/components/shop/ProductCard'
import './BestSellers.scss'
import '@/styles/custom-buttons.scss'

const BestSellers: React.FC = () => {
    const { t } = useTranslation()

    const [products, setProducts] = React.useState<ProductCardData[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await import('@/services/publicService').then(mod => mod.publicService.getPublicProducts({ pageIndex: 1, pageSize: 4 }));
                const apiProducts = (response.data || []).slice(0, 4).map((p: any): ProductCardData => ({
                    id: p.id,
                    name: p.name,
                    imageUrl: p.imageUrl && p.imageUrl.length > 0 ? p.imageUrl : undefined,
                    image: p.imageUrl && p.imageUrl.length > 0 ? p.imageUrl[0] : 'https://placehold.co/400x400?text=No+Image',
                    price: p.price,
                    rating: p.rating || 4.5,
                    // reviews: p.reviews || Math.floor(Math.random() * 50) + 1,
                    soldCount: p.soldCount || 0,
                    category: p.category || 'product',
                    quantityInStock: p.quantityInStock ?? 999,
                    isSale: p.isSale || false,
                    salePercent: p.salePercent || 0,
                    isActive: true,
                }));
                setProducts(apiProducts);
            } catch {
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Sắp xếp và lấy 4 sản phẩm bán chạy nhất
    const bestSellers = [...products]
        .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
        .slice(0, 4);

    const addItem = useCartStore(state => state.addItem);

    const handleAddToCart = (product: ProductCardData) => {
        addItem({
            cartItemId: product.id,
            productId: product.id,
            name: product.name,
            image: product.imageUrl && product.imageUrl.length > 0 ? product.imageUrl[0] : product.image || '',
            price: product.price,
            quantity: 1,
            type: 'product',
            quantityInStock: product.quantityInStock ?? 999
        });
        notification.success({
            message: t('cart.addToCart'),
            description: t('home.bestSellers.title') + ': ' + product.name
        });
    };

    return (
        <section className="best-sellers">
            <div className="container">
                <h2 className="section-title">{t('home.bestSellers.title')}</h2>
                <p className="section-subtitle">{t('home.bestSellers.subtitle')}</p>

                <Row gutter={[24, 24]}>
                    {loading
                        ? Array.from({ length: 4 }).map((_, idx) => (
                            <Col xs={24} sm={12} md={6} key={idx}>
                                <div className="product-card-skeleton">
                                    <div className="skeleton-image"></div>
                                    <div className="skeleton-content">
                                        <div className="skeleton-title"></div>
                                        <div className="skeleton-description"></div>
                                        <div className="skeleton-rating"></div>
                                        <div className="skeleton-price"></div>
                                    </div>
                                </div>
                            </Col>
                        ))
                        : bestSellers.map((product) => (
                            <Col xs={24} sm={12} md={6} key={product.id}>
                                <ProductCard
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                />
                            </Col>
                        ))}
                </Row>

                <div className="view-more">
                    <Link to="/shop">
                        <Button type="primary" size="large">
                            {t('home.bestSellers.viewMore')}
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default BestSellers 