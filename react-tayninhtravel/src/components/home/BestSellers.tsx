import React from 'react'
import { Row, Col, Card, Button, Rate, Tag, notification } from 'antd'
import { useTranslation } from 'react-i18next'
import { ShoppingCartOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useCartStore } from '@/store/useCartStore'
import './BestSellers.scss'

const { Meta } = Card

const BestSellers: React.FC = () => {
    const { t } = useTranslation()

    const [products, setProducts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await import('@/services/publicService').then(mod => mod.publicService.getPublicProducts({ pageIndex: 1, pageSize: 4 }));
                const apiProducts = (response.data || []).slice(0, 4).map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    image: p.imageUrl && p.imageUrl.length > 0 ? p.imageUrl[0] : 'https://placehold.co/400x400?text=No+Image',
                    price: p.price,
                    originalPrice: p.price,
                    rating: p.rating || 0,
                    reviews: p.reviews || 0,
                    sold: p.soldCount || 0,
                    discount: p.salePercent || 0,
                    category: p.category || '',
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
        .sort((a, b) => (b.sold || 0) - (a.sold || 0))
        .slice(0, 4);

    const addItem = useCartStore(state => state.addItem);

    return (
        <section className="best-sellers">
            <div className="container">
                <h2 className="section-title">{t('home.bestSellers.title')}</h2>
                <p className="section-subtitle">{t('home.bestSellers.subtitle')}</p>

                <Row gutter={[24, 24]}>
                    {loading
                        ? Array.from({ length: 4 }).map((_, idx) => (
                            <Col xs={24} sm={12} md={6} key={idx}>
                                <Card loading className="product-card" />
                            </Col>
                        ))
                        : bestSellers.map((product) => {
                            const handleAddToCart = () => {
                                addItem({
                                    cartItemId: product.id,
                                    productId: product.id,
                                    name: product.name,
                                    image: product.image,
                                    price: product.price,
                                    quantity: 1,
                                    type: 'product'
                                });
                                notification.success({
                                    message: t('cart.addToCart'),
                                    description: t('home.bestSellers.title') + ': ' + product.name
                                });
                            };
                            return (
                                <Col xs={24} sm={12} md={6} key={product.id}>
                                    <Link to={`/shop/product/${product.id}`} style={{ display: 'block' }}>
                                        <Card
                                            hoverable
                                            cover={<img alt={product.name} src={product.image} />}
                                            className="product-card"
                                            actions={[
                                                <div style={{ width: '100%', padding: 0 }}>
                                                    <Button type="primary" icon={<ShoppingCartOutlined />} block onClick={e => { e.preventDefault(); handleAddToCart(); }}>
                                                        {t('home.bestSellers.addToCart')}
                                                    </Button>
                                                </div>
                                            ]}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="product-tag">
                                                {product.discount > 0 && (
                                                    <Tag color="red">-{product.discount}%</Tag>
                                                )}
                                            </div>
                                            <Meta
                                                title={product.name}
                                                description={
                                                    <div className="product-info">
                                                        <div className="product-price">
                                                            <span className="current-price">
                                                                {product.price.toLocaleString('vi-VN')} ₫
                                                            </span>
                                                            <span className="original-price">
                                                                {product.originalPrice.toLocaleString('vi-VN')} ₫
                                                            </span>
                                                        </div>
                                                        <div className="product-rating">
                                                            <Rate disabled defaultValue={product.rating} allowHalf />
                                                            <span className="rating-count">({product.reviews})</span>
                                                        </div>
                                                        <div className="product-sold">
                                                            {t('cart.sold')}: {product.sold}
                                                        </div>
                                                    </div>
                                                }
                                            />
                                        </Card>
                                    </Link>
                                </Col>
                            );
                        })}
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