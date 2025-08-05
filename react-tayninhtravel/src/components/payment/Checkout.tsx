import { useState, useEffect } from 'react'
import {
    Row,
    Col,
    Card,
    Button,
    Radio,
    Divider,
    Typography,
    notification,
    Steps as AntdSteps,
    Breadcrumb,
    Table,
    Image,
    Alert,
    Checkbox,
    Form,
    Input
} from 'antd'
import {
    ShoppingCartOutlined,
    HomeOutlined,
    BankOutlined,
    ShopOutlined,
    CheckCircleOutlined
} from '@ant-design/icons'
import { useCartStore } from '@/store/useCartStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useThemeStore } from '@/store/useThemeStore'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import LoginModal from '../auth/LoginModal'
import RegisterModal from '../auth/RegisterModal'
import VoucherModal from './VoucherModal'
import { checkoutCart } from '@/services/cartService'
import { useEnhancedPayment } from '@/services/enhancedPaymentService'
import './Checkout.scss'

const { Title, Text } = Typography

interface DeliveryInfo {
    fullName: string
    phone: string
    email: string
    address: string
    city: string
    district: string
    ward: string
    note?: string
}

interface PaymentMethod {
    id: string
    name: string
    description: string
    icon: React.ReactNode
}

interface ShippingMethod {
    id: string
    name: string
    description: string
    price: number
    estimatedDays: string
    icon: React.ReactNode
}

interface Voucher {
    voucherCodeId: string;
    code: string;
    voucherName: string;
    discountAmount: number;
    discountPercent: number | null;
    startDate: string;
    endDate: string;
    isUsed: boolean;
    claimedAt: string;
    usedAt: string | null;
    isExpired: boolean;
    isActive: boolean;
    status: string;
}

const Checkout = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { items, getTotalItems, getTotalPrice } = useCartStore()
    const { isAuthenticated, user } = useAuthStore()
    const { createPaymentLink } = useEnhancedPayment()
    const { isDarkMode } = useThemeStore()

    const [currentStep, setCurrentStep] = useState(0)
    const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        district: '',
        ward: ''
    })
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('bank_transfer')
    const [selectedShippingMethod, setSelectedShippingMethod] = useState('pickup')
    const [selectedVoucherCodeId, setSelectedVoucherCodeId] = useState<string | null>(null)
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
    const [voucherDiscount, setVoucherDiscount] = useState(0)
    const [voucherModalVisible, setVoucherModalVisible] = useState(false)
    const [agreeTerms, setAgreeTerms] = useState(false)
    const [loading, setLoading] = useState(false)
    // Always use Enhanced Payment System

    // Authentication modal states
    const [loginModalVisible, setLoginModalVisible] = useState(false)
    const [registerModalVisible, setRegisterModalVisible] = useState(false)

    // Check authentication on component mount
    useEffect(() => {
        if (!isAuthenticated) {
            notification.warning({
                message: t('Bạn cần đăng nhập để tiếp tục'),
                description: t('Vui lòng đăng nhập để sử dụng chức năng thanh toán.')
            })
        }
        if (user && isAuthenticated) {
            setDeliveryInfo(prevInfo => ({
                ...prevInfo,
                fullName: user.name || '',
                phone: user.phone || '',
                email: user.email || ''
            }))
        }
    }, [])

    // Payment methods
    const paymentMethods: PaymentMethod[] = [
        {
            id: 'bank_transfer',
            name: t('checkout.payment.bankTransfer'),
            description: t('checkout.payment.bankTransferDescription'),
            icon: <BankOutlined />
        }
    ]

    // Shipping methods giữ cả hai phương án
    const shippingMethods: ShippingMethod[] = [
        {
            id: 'ship_cod',
            name: t('checkout.shipping.shipCod'),
            description: t('checkout.shipping.shipCodDescription'),
            price: 30000,
            estimatedDays: '2-3',
            icon: <ShopOutlined />
        },
        {
            id: 'pickup',
            name: t('checkout.shipping.pickup'),
            description: t('checkout.shipping.pickupDescription'),
            price: 0,
            estimatedDays: '0',
            icon: <ShopOutlined />
        }
    ]

    const formatPrice = (price: number) => {
        return `${price.toLocaleString()}VND`
    }

    const getShippingPrice = () => {
        const shipping = shippingMethods.find(method => method.id === selectedShippingMethod)
        return shipping ? shipping.price : 0
    }

    const getTotalWithShipping = () => {
        return getTotalPrice() + getShippingPrice()
    }

    const getTotalAfterVoucher = () => {
        const totalWithShipping = getTotalWithShipping()
        return Math.max(0, totalWithShipping - voucherDiscount)
    }

    const handleApplyVoucher = (voucher: Voucher) => {
        setSelectedVoucherCodeId(voucher.voucherCodeId)
        setSelectedVoucher(voucher)
        // Tính toán discount amount
        const discountAmount = voucher.discountPercent && voucher.discountPercent > 0
            ? Math.min((getTotalWithShipping() * voucher.discountPercent / 100), voucher.discountAmount || 0)
            : voucher.discountAmount
        setVoucherDiscount(discountAmount || 0)
    }

    const handleRemoveVoucher = () => {
        setSelectedVoucherCodeId(null)
        setSelectedVoucher(null)
        setVoucherDiscount(0)
    }

    // Table columns for order summary
    const columns: ColumnsType<any> = [
        {
            title: t('checkout.product'),
            dataIndex: 'product',
            key: 'product',
            render: (_, record) => (
                <div className="checkout-product" style={{ display: 'flex', alignItems: 'center' }}>
                    <Image
                        src={record.image}
                        title={record.name}
                        width={50}
                        height={50}
                        className="product-image"
                        style={{ marginRight: 12, display: 'block' }}
                    />
                    <div className="product-info">
                        <span
                            className="product-name"
                            style={{
                                maxWidth: 140,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'inline-block',
                                verticalAlign: 'middle',
                                wordBreak: 'break-all',
                                cursor: 'pointer'
                            }}
                            title={record.name}
                        >
                            {record.name}
                        </span>
                    </div>
                </div>
            )
        },
        {
            title: t('checkout.quantity'),
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            align: 'center'
        },
        {
            title: t('checkout.price'),
            dataIndex: 'price',
            key: 'price',
            width: 120,
            align: 'right',
            render: (price) => formatPrice(price)
        },
        {
            title: t('checkout.total'),
            key: 'total',
            width: 120,
            align: 'right',
            render: (_, record) => formatPrice(record.price * record.quantity)
        }
    ]

    const handleNextStep = () => {
        if (currentStep === 0) {
            setCurrentStep(1)
        } else if (currentStep === 1) {
            // Check authentication before proceeding to final step
            if (!isAuthenticated) {
                notification.warning({
                    message: t('checkout.loginRequired'),
                    description: t('checkout.loginRequiredDescription')
                })
                setLoginModalVisible(true)
                return
            }
            setCurrentStep(2)
        }
    }

    const handlePrevStep = () => {
        setCurrentStep(currentStep - 1)
    }

    const handleLoginSuccess = () => {
        setLoginModalVisible(false)
        // After login, proceed to next step
        setCurrentStep(2)
        notification.success({
            message: t('checkout.loginSuccess'),
            description: t('checkout.canNowProceed')
        })
    }

    const handlePlaceOrder = async () => {
        // Double-check authentication before placing order
        if (!isAuthenticated) {
            notification.warning({
                message: t('checkout.loginRequired'),
                description: t('checkout.loginRequiredDescription')
            })
            setLoginModalVisible(true)
            return
        }

        if (!agreeTerms) {
            notification.error({
                message: t('checkout.error'),
                description: t('checkout.agreeTermsRequired')
            })
            return
        }

        setLoading(true)
        try {
            // === ENHANCED PAYMENT SYSTEM (ONLY) ===
            notification.info({
                message: 'Sử dụng Enhanced Payment System',
                description: 'Đang tạo thanh toán với transaction tracking...'
            })

            // First create order via legacy system to get orderId
            const res = await checkoutCart('');

            if (res.orderId) {
                // Then create enhanced payment link
                await createPaymentLink({
                    orderId: res.orderId,
                    amount: getTotalPrice(),
                    description: `Product Order - ${res.orderId}`
                });
                // createPaymentLink automatically redirects to PayOS
                // clearCart()
            } else {
                throw new Error('Failed to create order');
            }

        } catch (error) {
            notification.error({
                message: t('checkout.orderError'),
                description: t('checkout.orderErrorDescription')
            });
        } finally {
            setLoading(false);
        }
    }

    // Nếu chưa đăng nhập, chỉ render modal login
    if (!isAuthenticated) {
        return (
            <>
                <LoginModal
                    isVisible={true}
                    onClose={() => navigate(-1)}
                    onRegisterClick={() => setRegisterModalVisible(true)}
                    onLoginSuccess={() => setLoginModalVisible(false)}
                />
                <RegisterModal
                    isVisible={registerModalVisible}
                    onClose={() => setRegisterModalVisible(false)}
                    onLoginClick={() => {
                        setRegisterModalVisible(false)
                    }}
                />
            </>
        )
    }

    if (items.length === 0) {
        return (
            <div className="checkout-wrapper">
                <div className="checkout">
                    <Breadcrumb className="checkout-breadcrumb">
                        <Breadcrumb.Item>
                            <Link to="/">
                                <HomeOutlined />
                            </Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <Link to="/cart">
                                <ShoppingCartOutlined />
                                {t('cart.title')}
                            </Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            {t('checkout.title')}
                        </Breadcrumb.Item>
                    </Breadcrumb>

                    <Card className="empty-checkout-card">
                        <div className="empty-checkout">
                            <ShoppingCartOutlined className="empty-icon" />
                            <Title level={3}>{t('checkout.emptyCart')}</Title>
                            <Text>{t('checkout.emptyCartDescription')}</Text>
                            <div style={{ marginTop: 16 }}>
                                <Button type="primary" size="large" onClick={() => navigate('/shop')}>
                                    {t('cart.continueShopping')}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

    // Thêm hàm xử lý khi chọn phương thức ship_cod
    const handleShippingMethodChange = (value: string) => {
        if (value === 'ship_cod') {
            notification.info({
                message: 'Phương thức nhận hàng chưa khả dụng',
                description: 'Phương thức nhận hàng này hiện chưa khả dụng, chúng tôi sẽ cập nhật trong thời gian tới. Mong quý khách hàng thông cảm.',
                duration: 5
            });
            return;
        }
        setSelectedShippingMethod(value);
    };

    return (
        <div className="checkout-wrapper">
            <div className="checkout">
                <Breadcrumb className="checkout-breadcrumb">
                    <Breadcrumb.Item>
                        <Link to="/">
                            <HomeOutlined />
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/cart">
                            <ShoppingCartOutlined />
                            {t('cart.title')}
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        {t('checkout.title')}
                    </Breadcrumb.Item>
                </Breadcrumb>

                <div className="checkout-header">
                    <Title level={2}>
                        <ShoppingCartOutlined /> {t('checkout.title')}
                    </Title>
                    <AntdSteps current={currentStep} className="checkout-steps">
                        <AntdSteps.Step title={t('checkout.steps.shippingMethod')} description={t('checkout.steps.shippingMethodDesc')} />
                        <AntdSteps.Step title={t('checkout.steps.paymentShipping')} description={t('checkout.steps.paymentShippingDesc')} />
                    </AntdSteps>
                </div>
                <Row gutter={24}>
                    <Col xs={24} lg={14}>
                        {/* Step 1: Shipping Method */}
                        {currentStep === 0 && (
                            <Card title={t('checkout.shippingMethod')} className="step-card">
                                <Radio.Group
                                    value={selectedShippingMethod}
                                    onChange={e => handleShippingMethodChange(e.target.value)}
                                    className="shipping-methods"
                                >
                                    {shippingMethods.map(method => (
                                        <Radio key={method.id} value={method.id} className="shipping-method">
                                            <div className="method-content">
                                                <div className="method-header">
                                                    {method.icon}
                                                    <div className="method-info">
                                                        <div className="method-name">{method.name}</div>
                                                        <div className="method-description">{method.description}</div>
                                                    </div>
                                                </div>
                                                <div className="method-details">
                                                    <div className="method-price">
                                                        {method.price === 0 ? t('checkout.free') : formatPrice(method.price)}
                                                    </div>
                                                    <div className="method-time">
                                                        {method.estimatedDays === '0' ? t('checkout.immediate') : `${method.estimatedDays} ngày`}
                                                    </div>
                                                </div>
                                            </div>
                                        </Radio>
                                    ))}
                                </Radio.Group>
                            </Card>
                        )}

                        {/* Step 2: Payment & Confirmation */}
                        {currentStep === 1 && (
                            <div>
                                <Card title={t('checkout.paymentMethod')} className="step-card">
                                    <Radio.Group
                                        value={selectedPaymentMethod}
                                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                        className="payment-methods"
                                    >
                                        {paymentMethods.map(method => (
                                            <Radio key={method.id} value={method.id} className="payment-method">
                                                <div className="method-content">
                                                    <div className="method-header">
                                                        {method.icon}
                                                        <div className="method-info">
                                                            <div className="method-name">{method.name}</div>
                                                            <div className="method-description">{method.description}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Radio>
                                        ))}
                                    </Radio.Group>
                                    <Alert
                                        type="info"
                                        message={t('checkout.bankTransferInfo')}
                                        description={
                                            <div>
                                                <p><strong>{t('checkout.bankName')}:</strong> Ngân hàng TMCP Á Châu (ACB)</p>
                                                <p><strong>{t('checkout.accountNumber')}:</strong> 123456789</p>
                                                <p><strong>{t('checkout.accountName')}:</strong> CONG TY TNHH TAY NINH TRAVEL</p>
                                                <p><strong>{t('checkout.transferContent')}:</strong> [Mã đơn hàng] - [Số điện thoại]</p>
                                            </div>
                                        }
                                        style={{ marginTop: 16 }}
                                    />
                                </Card>

                                {/* Form nhập địa chỉ khi chọn giao hàng tận nhà (ship_cod) */}
                                {currentStep === 1 && selectedShippingMethod === 'ship_cod' && (
                                    <Card title={t('checkout.deliveryInfo')} className="step-card">
                                        <Form
                                            layout="vertical"
                                            initialValues={deliveryInfo}
                                            onFinish={() => setCurrentStep(2)}
                                        >
                                            <Row gutter={16}>
                                                <Col xs={24} md={12}>
                                                    <Form.Item
                                                        name="fullName"
                                                        label={t('checkout.fullName')}
                                                        rules={[{ required: true, message: t('checkout.fullNameRequired') }]}
                                                    >
                                                        <Input placeholder={t('checkout.enterFullName')} />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={12}>
                                                    <Form.Item
                                                        name="phone"
                                                        label={t('checkout.phone')}
                                                        rules={[
                                                            { required: true, message: t('checkout.phoneRequired') },
                                                            { pattern: /^[0-9]{10,11}$/, message: t('checkout.phoneInvalid') }
                                                        ]}
                                                    >
                                                        <Input placeholder={t('checkout.enterPhone')} />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Form.Item
                                                name="email"
                                                label={t('checkout.email')}
                                                rules={[
                                                    { required: true, message: t('checkout.emailRequired') },
                                                    { type: 'email', message: t('checkout.emailInvalid') }
                                                ]}
                                            >
                                                <Input placeholder={t('checkout.enterEmail')} />
                                            </Form.Item>
                                            <Form.Item
                                                name="address"
                                                label={t('checkout.address')}
                                                rules={[{ required: true, message: t('checkout.addressRequired') }]}
                                            >
                                                <Input placeholder={t('checkout.enterAddress')} />
                                            </Form.Item>
                                            <Row gutter={16}>
                                                <Col xs={24} md={8}>
                                                    <Form.Item
                                                        name="city"
                                                        label={t('checkout.city')}
                                                        rules={[{ required: true, message: t('checkout.cityRequired') }]}
                                                    >
                                                        <Input placeholder={t('checkout.enterCity')} />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={8}>
                                                    <Form.Item
                                                        name="district"
                                                        label={t('checkout.district')}
                                                        rules={[{ required: true, message: t('checkout.districtRequired') }]}
                                                    >
                                                        <Input placeholder={t('checkout.enterDistrict')} />
                                                    </Form.Item>
                                                </Col>
                                                <Col xs={24} md={8}>
                                                    <Form.Item
                                                        name="ward"
                                                        label={t('checkout.ward')}
                                                        rules={[{ required: true, message: t('checkout.wardRequired') }]}
                                                    >
                                                        <Input placeholder={t('checkout.enterWard')} />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                            <Form.Item name="note" label={t('checkout.note')}>
                                                <Input.TextArea rows={3} placeholder={t('checkout.enterNote')} />
                                            </Form.Item>
                                            <Button type="primary" htmlType="submit">{t('checkout.next')}</Button>
                                        </Form>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* Step 3: Order Confirmation */}
                        {currentStep === 2 && (
                            <Card title={t('checkout.orderConfirmation')} className="step-card">
                                <div className="confirmation-section">
                                    <Title level={4}>{t('checkout.deliveryInfo')}</Title>
                                    {selectedShippingMethod === 'ship_cod' ? (
                                        <>
                                            <div className="info-row">
                                                <Text strong>{t('checkout.fullName')}:</Text>
                                                <Text>{deliveryInfo.fullName}</Text>
                                            </div>
                                            <div className="info-row">
                                                <Text strong>{t('checkout.phone')}:</Text>
                                                <Text>{deliveryInfo.phone}</Text>
                                            </div>
                                            <div className="info-row">
                                                <Text strong>{t('checkout.email')}:</Text>
                                                <Text>{deliveryInfo.email}</Text>
                                            </div>
                                            <div className="info-row">
                                                <Text strong>{t('checkout.address')}:</Text>
                                                <Text>{`${deliveryInfo.address}, ${deliveryInfo.ward}, ${deliveryInfo.district}, ${deliveryInfo.city}`}</Text>
                                            </div>
                                            {deliveryInfo.note && (
                                                <div className="info-row">
                                                    <Text strong>{t('checkout.note')}:</Text>
                                                    <Text>{deliveryInfo.note}</Text>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="info-row">
                                            <Text>{t('checkout.pickupNote')}</Text>
                                        </div>
                                    )}
                                </div>
                                <Divider />
                                <div className="confirmation-section">
                                    <Title level={4}>{t('checkout.shippingPaymentInfo')}</Title>
                                    <div className="info-row">
                                        <Text strong>{t('checkout.shippingMethod')}:</Text>
                                        <Text>{shippingMethods.find(m => m.id === selectedShippingMethod)?.name}</Text>
                                    </div>
                                    <div className="info-row">
                                        <Text strong>{t('checkout.paymentMethod')}:</Text>
                                        <Text>{paymentMethods[0].name}</Text>
                                    </div>
                                </div>
                                <Divider />

                                {/* Payment System Selection - Hidden, always use Enhanced */}
                                {/* Enhanced Payment System is now the only option */}

                                <Checkbox
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                >
                                    {t('checkout.agreeTerms')} <Link to="/terms">{t('checkout.termsAndConditions')}</Link>
                                </Checkbox>
                            </Card>
                        )}

                        {/* Navigation buttons */}
                        <div className="step-actions">
                            {currentStep > 0 && (
                                <Button onClick={handlePrevStep}>
                                    {t('checkout.previous')}
                                </Button>
                            )}
                            {currentStep < 2 ? (
                                <Button type="primary" onClick={handleNextStep}>
                                    {t('checkout.next')}
                                </Button>
                            ) : (
                                <Button
                                    type="primary"
                                    size="large"
                                    loading={loading}
                                    onClick={handlePlaceOrder}
                                    disabled={!agreeTerms}
                                    icon={<CheckCircleOutlined />}
                                >
                                    {t('checkout.placeOrder')}
                                </Button>
                            )}
                        </div>
                    </Col>

                    {/* Order Summary Sidebar */}
                    <Col xs={24} lg={10}>
                        <Card title={t('checkout.orderSummary')} className="order-summary-card">
                            <Table
                                columns={columns}
                                dataSource={items.map((item, idx) => ({
                                    ...item,
                                    name: item.name || item.product?.name || '',
                                    image: item.image || item.product?.imageUrl?.[0] || '',
                                    key: item.cartItemId ? `${item.type}-${item.cartItemId}` : `${item.type}-${idx}`
                                }))}
                                pagination={false}
                                size="small"
                                className="summary-table"
                                scroll={{ y: items.length > 5 ? 200 : undefined }}
                            />

                            <Divider />

                            {/* Voucher Section */}
                            <div className="voucher-section" style={{ marginBottom: 16 }}>
                                <Title level={5} style={{ color: isDarkMode ? '#fff' : undefined }}>
                                    Mã giảm giá
                                </Title>
                                {selectedVoucher ? (
                                    <div className="applied-voucher" style={{
                                        padding: 12,
                                        border: '1px solid #52c41a',
                                        borderRadius: 6,
                                        backgroundColor: isDarkMode ? '#162312' : '#f6ffed',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <Text strong style={{ color: '#52c41a' }}>
                                                {selectedVoucher.code}
                                            </Text>
                                            <br />
                                            <Text type="secondary" style={{
                                                fontSize: 12,
                                                color: isDarkMode ? '#bfbfbf' : undefined
                                            }}>
                                                {selectedVoucher.voucherName} - Giảm {formatPrice(voucherDiscount)}
                                            </Text>
                                        </div>
                                        <Button
                                            type="text"
                                            size="small"
                                            onClick={handleRemoveVoucher}
                                            style={{
                                                color: '#ff4d4f',
                                                backgroundColor: isDarkMode ? 'rgba(255, 77, 79, 0.1)' : 'transparent'
                                            }}
                                        >
                                            Bỏ chọn
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        type="dashed"
                                        block
                                        style={{
                                            marginBottom: 8,
                                            borderColor: isDarkMode ? '#434343' : undefined,
                                            color: isDarkMode ? '#fff' : undefined,
                                            backgroundColor: isDarkMode ? '#141414' : undefined
                                        }}
                                        onClick={() => setVoucherModalVisible(true)}
                                    >
                                        Chọn voucher
                                    </Button>
                                )}
                            </div>

                            <div className="summary-calculations">
                                <div className="summary-row">
                                    <Text>{t('checkout.subtotal')} ({getTotalItems()} {t('cart.items')}):</Text>
                                    <Text strong>{formatPrice(getTotalPrice())}</Text>
                                </div>
                                <div className="summary-row">
                                    <Text>{t('checkout.shippingFee')}:</Text>
                                    <Text strong>
                                        {getShippingPrice() === 0 ? t('checkout.free') : formatPrice(getShippingPrice())}
                                    </Text>
                                </div>
                                {voucherDiscount > 0 && (
                                    <div className="summary-row">
                                        <Text>Giảm giá voucher:</Text>
                                        <Text strong style={{ color: '#52c41a' }}>
                                            -{formatPrice(voucherDiscount)}
                                        </Text>
                                    </div>
                                )}
                                <Divider />
                                <div className="summary-row total-row">
                                    <Title level={4}>{t('checkout.total')}:</Title>
                                    <Title level={4} className="total-price">{formatPrice(getTotalAfterVoucher())}</Title>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Authentication Modals */}
                <LoginModal
                    isVisible={loginModalVisible}
                    onClose={() => setLoginModalVisible(false)}
                    onRegisterClick={() => {
                        setLoginModalVisible(false)
                        setRegisterModalVisible(true)
                    }}
                    onLoginSuccess={handleLoginSuccess}
                />

                <RegisterModal
                    isVisible={registerModalVisible}
                    onClose={() => setRegisterModalVisible(false)}
                    onLoginClick={() => {
                        setRegisterModalVisible(false)
                        setLoginModalVisible(true)
                    }}
                />

                {/* Voucher Modal */}
                <VoucherModal
                    visible={voucherModalVisible}
                    onClose={() => setVoucherModalVisible(false)}
                    onSelectVoucher={handleApplyVoucher}
                    selectedVoucherId={selectedVoucherCodeId}
                />
            </div>
        </div>
    )
}

export default Checkout