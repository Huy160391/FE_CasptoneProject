import {
    Card,
    Table,
    Button,
    Typography,
    Divider,
    Space,
    Empty,
    Image,
    Row,
    Col,
    Breadcrumb,
    notification
} from 'antd'
import {
    DeleteOutlined,
    ShoppingCartOutlined,
    PlusOutlined,
    MinusOutlined,
    HomeOutlined,
    ClearOutlined
} from '@ant-design/icons'
import { useCartStore } from '@/store/useCartStore'
import type { CartItem } from '@/store/useCartStore'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import './CartDetail.scss'

import { removeCart } from '@/services/cartService'
import { useAuthStore } from '@/store/useAuthStore'

const { Title, Text } = Typography

const CartDetail = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { items, removeItem, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCartStore()

    const handleQuantityChange = (cartItemId: string | number, type: 'product' | 'tour', quantity: number) => {
        if (quantity < 1) return
        updateQuantity(cartItemId, type, quantity)
    }

    const handleRemoveItem = (productId: string | number, type: 'product' | 'tour') => {
        removeItem(productId, type)
        notification.success({
            message: t('cart.itemRemoved'),
            description: t('cart.itemRemovedDescription')
        })
    }

    const handleClearCart = () => {
        clearCart()
        notification.success({
            message: t('cart.cartCleared'),
            description: t('cart.cartClearedDescription')
        })
        // Gọi API xoá cart trên server
        const token = useAuthStore.getState().token || ''
        if (token) {
            removeCart(token)
                .then(() => {
                    // Có thể thêm thông báo hoặc xử lý sau khi xoá cart thành công
                })
                .catch(() => {
                    notification.error({
                        message: t('cart.removeCartError'),
                        description: t('cart.removeCartErrorDesc')
                    })
                })
        }
    }

    const formatPrice = (price: number) => {
        return `${price.toLocaleString()}VND`
    }

    const columns: ColumnsType<CartItem> = [
        {
            title: t('cart.product'),
            dataIndex: 'product',
            key: 'product',
            width: '40%',
            render: (_, record) => (
                <div className="cart-product">
                    <Image
                        src={record.image}
                        alt={record.name}
                        width={80}
                        height={80}
                        className="product-image"
                        fallback="data:image/png;base64,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"
                    />
                    <div className="product-info">
                        <div className="product-name">{record.name}</div>
                        {/* {record.description && (
              <div className="product-description">{record.description}</div>
            )} */}
                    </div>
                </div>
            )
        },
        {
            title: t('cart.price'),
            dataIndex: 'price',
            key: 'price',
            width: '15%',
            render: (price) => (
                <Text strong className="price-text">{formatPrice(price)}</Text>
            )
        },
        {
            title: t('cart.quantity'),
            dataIndex: 'quantity',
            key: 'quantity',
            width: '20%',
            render: (quantity, record) => (
                <div className="quantity-controls">
                    <Button
                        type="text"
                        icon={<MinusOutlined />}
                        onClick={() => handleQuantityChange(record.productId, record.type, quantity - 1)}
                        disabled={quantity <= 1}
                        className="quantity-btn minus-btn"
                        size="small"
                    />
                    <span className="quantity-display">{quantity}</span>
                    <Button
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={() => handleQuantityChange(record.productId, record.type, quantity + 1)}
                        disabled={quantity >= 99}
                        className="quantity-btn plus-btn"
                        size="small"
                    />
                </div>
            )
        },
        {
            title: t('cart.total'),
            dataIndex: 'total',
            key: 'total',
            width: '15%',
            render: (_, record) => (
                <Text strong className="total-text">
                    {formatPrice(record.price * record.quantity)}
                </Text>
            )
        },
        {
            title: t('common.actions'),
            key: 'actions',
            width: '10%',
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveItem(record.productId, record.type)}
                    title={t('cart.removeItem')}
                />
            )
        }
    ]

    const handleCheckout = () => {
        navigate('/checkout')
    }

    const handleContinueShopping = () => {
        navigate('/shop')
    }

    if (items.length === 0) {
        return (
            <div className="cart-detail-wrapper">
                <div className="cart-detail">
                    <Breadcrumb className="cart-breadcrumb">
                        <Breadcrumb.Item>
                            <Link to="/">
                                <HomeOutlined />
                            </Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <ShoppingCartOutlined />
                            {t('cart.title')}
                        </Breadcrumb.Item>
                    </Breadcrumb>

                    <Card className="empty-cart-card">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div>
                                    <Title level={4}>{t('cart.emptyTitle')}</Title>
                                    <Text type="secondary">{t('cart.emptyDescription')}</Text>
                                </div>
                            }
                        >
                            <Button type="primary" size="large" onClick={handleContinueShopping}>
                                {t('cart.continueShopping')}
                            </Button>
                        </Empty>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="cart-detail-wrapper">
            <div className="cart-detail">
                <Breadcrumb className="cart-breadcrumb">
                    <Breadcrumb.Item>
                        <Link to="/">
                            <HomeOutlined />
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <ShoppingCartOutlined />
                        {t('cart.title')}
                    </Breadcrumb.Item>
                </Breadcrumb>            <Row gutter={24}>
                    <Col xs={24} lg={14}>
                        <Card
                            title={
                                <div className="cart-header">
                                    <Title level={3}>
                                        <ShoppingCartOutlined /> {t('cart.title')} ({getTotalItems()} {t('cart.items')})
                                    </Title>
                                    <Button
                                        type="text"
                                        danger
                                        icon={<ClearOutlined />}
                                        onClick={handleClearCart}
                                    >
                                        {t('cart.clearAll')}
                                    </Button>
                                </div>
                            }
                            className="cart-table-card"
                        >
                            <Table
                                columns={columns}
                                dataSource={items.map(item => ({ ...item, key: `${item.type}-${item.cartItemId}` }))}
                                pagination={items.length > 10 ? { pageSize: 10, showSizeChanger: false } : false}
                                className="cart-table"
                            />
                        </Card>
                    </Col>

                    <Col xs={24} lg={10}>
                        <Card title={t('cart.summary')} className="cart-summary-card">
                            <div className="summary-row">
                                <Text>{t('cart.subtotal')}:</Text>
                                <Text strong>{formatPrice(getTotalPrice())}</Text>
                            </div>
                            <div className="summary-row">
                                <Text>{t('cart.shipping')}:</Text>
                                <Text>{t('cart.freeShipping')}</Text>
                            </div>
                            <Divider />
                            <div className="summary-row total-row">
                                <Title level={4}>{t('cart.total')}:</Title>
                                <Title level={4} className="total-price">{formatPrice(getTotalPrice())}</Title>
                            </div>
                            <Text type="secondary" style={{ fontSize: '12px', marginLeft: 4 }}>{t('cart.vatIncluded')}</Text>

                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    onClick={handleCheckout}
                                    disabled={items.length === 0}
                                >
                                    {t('cart.proceedToCheckout')}
                                </Button>
                                {/* Đặt nút tiếp tục mua hàng dưới nút checkout */}
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Button
                                        size="large"
                                        onClick={handleContinueShopping}
                                    >
                                        {t('cart.continueShopping')}
                                    </Button>
                                </div>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default CartDetail
