import React from 'react'
import { Row, Col, Card, Button, Rate, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { ShoppingCartOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import './BestSellers.scss'

const { Meta } = Card

const BestSellers: React.FC = () => {
    const { t } = useTranslation()

    const products = [
        {
            id: 1,
            name: 'Bánh Tráng Phơi Sương',
            image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            price: 45000,
            originalPrice: 55000,
            rating: 4.8,
            reviews: 128,
            sold: 1000,
            discount: 18,
            category: 'Đặc sản'
        },
        {
            id: 2,
            name: 'Mắm Châu Đốc',
            image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            price: 85000,
            originalPrice: 95000,
            rating: 4.7,
            reviews: 95,
            sold: 850,
            discount: 10,
            category: 'Đặc sản'
        },
        {
            id: 3,
            name: 'Bánh Canh Trảng Bàng',
            image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            price: 35000,
            originalPrice: 40000,
            rating: 4.9,
            reviews: 156,
            sold: 1200,
            discount: 12,
            category: 'Đặc sản'
        },
        {
            id: 4,
            name: 'Mật Ong Rừng U Minh',
            image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            price: 250000,
            originalPrice: 300000,
            rating: 4.8,
            reviews: 89,
            sold: 650,
            discount: 16,
            category: 'Đặc sản'
        }
    ]

    return (
        <section className="best-sellers">
            <div className="container">
                <h2 className="section-title">{t('home.bestSellers.title')}</h2>
                <p className="section-subtitle">{t('home.bestSellers.subtitle')}</p>

                <Row gutter={[24, 24]}>
                    {products.map((product) => (
                        <Col xs={24} sm={12} md={6} key={product.id}>
                            <Card
                                hoverable
                                cover={<img alt={product.name} src={product.image} />}
                                className="product-card"
                                actions={[
                                    <Button type="primary" icon={<ShoppingCartOutlined />} block>
                                        {t('home.bestSellers.addToCart')}
                                    </Button>
                                ]}
                            >
                                <div className="product-tag">
                                    <Tag color="red">-{product.discount}%</Tag>
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
                                                {t('shop.sold')}: {product.sold}
                                            </div>
                                        </div>
                                    }
                                />
                            </Card>
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