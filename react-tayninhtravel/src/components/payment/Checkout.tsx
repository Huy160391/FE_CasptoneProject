import { useState } from 'react'
import {
    Row,
    Col,
    Card,
    Form,
    Input,
    Button,
    Radio,
    Divider,
    Typography,
    notification,
    Steps,
    Breadcrumb,
    Table,
    Image,
    Tag,
    Alert,
    Checkbox
} from 'antd'
import {
    ShoppingCartOutlined,
    HomeOutlined,
    BankOutlined,
    CarOutlined,
    ShopOutlined,
    UserOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    CheckCircleOutlined,
    DollarOutlined
} from '@ant-design/icons'
import { useCartStore } from '@/store/useCartStore'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import BankTransferConfirmModal, { type BankTransferData } from './BankTransferConfirmModal'
import './Checkout.scss'

const { Title, Text } = Typography
const { TextArea } = Input

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

const Checkout = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const { items, getTotalItems, getTotalPrice, clearCart } = useCartStore()

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
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod')
    const [selectedShippingMethod, setSelectedShippingMethod] = useState('ship_cod')
    const [agreeTerms, setAgreeTerms] = useState(false)
    const [loading, setLoading] = useState(false)
    const [bankTransferModalVisible, setBankTransferModalVisible] = useState(false)
    const [orderId] = useState(`TN-${Date.now()}`) // Generate order ID

    // Payment methods
    const paymentMethods: PaymentMethod[] = [
        {
            id: 'cod',
            name: t('checkout.payment.cod'),
            description: t('checkout.payment.codDescription'),
            icon: <DollarOutlined />
        },
        {
            id: 'bank_transfer',
            name: t('checkout.payment.bankTransfer'),
            description: t('checkout.payment.bankTransferDescription'),
            icon: <BankOutlined />
        }
    ]

    // Shipping methods
    const shippingMethods: ShippingMethod[] = [
        {
            id: 'ship_cod',
            name: t('checkout.shipping.shipCod'),
            description: t('checkout.shipping.shipCodDescription'),
            price: 30000,
            estimatedDays: '2-3',
            icon: <CarOutlined />
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

    // Table columns for order summary
    const columns: ColumnsType<any> = [
        {
            title: t('checkout.product'),
            dataIndex: 'product',
            key: 'product',
            render: (_, record) => (
                <div className="checkout-product">
                    <Image
                        src={record.image}
                        alt={record.name}
                        width={50}
                        height={50}
                        className="product-image"
                    />
                    <div className="product-info">
                        <div className="product-name">{record.name}</div>
                        <Tag color={record.type === 'product' ? 'blue' : 'green'}>
                            {record.type === 'product' ? t('shop.product') : t('tour.tour')}
                        </Tag>
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

    const steps = [
        {
            title: t('checkout.steps.deliveryInfo'),
            description: t('checkout.steps.deliveryInfoDesc')
        },
        {
            title: t('checkout.steps.paymentShipping'),
            description: t('checkout.steps.paymentShippingDesc')
        },
        {
            title: t('checkout.steps.confirmation'),
            description: t('checkout.steps.confirmationDesc')
        }
    ]

    const handleNextStep = () => {
        if (currentStep === 0) {
            form.validateFields().then((values) => {
                setDeliveryInfo(values)
                setCurrentStep(1)
            }).catch(() => {
                notification.error({
                    message: t('checkout.error'),
                    description: t('checkout.fillRequiredFields')
                })
            })
        } else if (currentStep === 1) {
            setCurrentStep(2)
        }
    }

    const handlePrevStep = () => {
        setCurrentStep(currentStep - 1)
    }

    const handlePlaceOrder = async () => {
        if (!agreeTerms) {
            notification.error({
                message: t('checkout.error'),
                description: t('checkout.agreeTermsRequired')
            })
            return
        }

        // If bank transfer payment method, show confirmation modal
        if (selectedPaymentMethod === 'bank_transfer') {
            setBankTransferModalVisible(true)
            return
        }

        // For COD payment, proceed directly
        setLoading(true)

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Clear cart after successful order
            clearCart()

            notification.success({
                message: t('checkout.orderSuccess'),
                description: t('checkout.orderSuccessDescription')
            })

            // Navigate to success page or order history
            navigate('/order-success')

        } catch (error) {
            notification.error({
                message: t('checkout.orderError'),
                description: t('checkout.orderErrorDescription')
            })
        } finally {
            setLoading(false)
        }
    }

    const handleBankTransferConfirm = async (bankTransferData: BankTransferData) => {
        setLoading(true)

        try {
            // Here you would send both order data and bank transfer confirmation to API
            console.log('Order placed with bank transfer:', {
                orderId,
                deliveryInfo,
                items,
                total: getTotalWithShipping(),
                bankTransferData
            })

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Clear cart after successful order
            clearCart()

            notification.success({
                message: 'Đặt hàng thành công',
                description: 'Đơn hàng đã được tạo và đang chờ xác minh thanh toán. Chúng tôi sẽ liên hệ với bạn sớm nhất.'
            })

            // Navigate to success page
            navigate('/order-success')

        } catch (error) {
            notification.error({
                message: t('checkout.orderError'),
                description: 'Có lỗi xảy ra khi xử lý đơn hàng'
            })
        } finally {
            setLoading(false)
        }
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
                            <Button type="primary" size="large" onClick={() => navigate('/shop')}>
                                {t('cart.continueShopping')}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

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
                    <Steps
                        current={currentStep}
                        items={steps}
                        className="checkout-steps"
                    />
                </div>

                <Row gutter={24}>
                    <Col xs={24} lg={14}>
                        {/* Step 1: Delivery Information */}
                        {currentStep === 0 && (
                            <Card title={t('checkout.deliveryInfo')} className="step-card">
                                <Form
                                    form={form}
                                    layout="vertical"
                                    initialValues={deliveryInfo}
                                    onFinish={handleNextStep}
                                >
                                    <Row gutter={16}>
                                        <Col xs={24} md={12}>
                                            <Form.Item
                                                name="fullName"
                                                label={t('checkout.fullName')}
                                                rules={[{ required: true, message: t('checkout.fullNameRequired') }]}
                                            >
                                                <Input prefix={<UserOutlined />} placeholder={t('checkout.enterFullName')} />
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
                                                <Input prefix={<PhoneOutlined />} placeholder={t('checkout.enterPhone')} />
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
                                        <Input prefix={<EnvironmentOutlined />} placeholder={t('checkout.enterAddress')} />
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
                                        <TextArea rows={3} placeholder={t('checkout.enterNote')} />
                                    </Form.Item>
                                </Form>
                            </Card>
                        )}

                        {/* Step 2: Payment & Shipping */}
                        {currentStep === 1 && (
                            <div>
                                <Card title={t('checkout.shippingMethod')} className="step-card">
                                    <Radio.Group
                                        value={selectedShippingMethod}
                                        onChange={(e) => setSelectedShippingMethod(e.target.value)}
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
                                                            {method.estimatedDays === '0'
                                                                ? t('checkout.immediate')
                                                                : `${method.estimatedDays} ${t('checkout.days')}`
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </Radio>
                                        ))}
                                    </Radio.Group>
                                </Card>

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

                                    {selectedPaymentMethod === 'bank_transfer' && (
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
                                    )}
                                </Card>
                            </div>
                        )}

                        {/* Step 3: Confirmation */}
                        {currentStep === 2 && (
                            <Card title={t('checkout.orderConfirmation')} className="step-card">
                                <div className="confirmation-section">
                                    <Title level={4}>{t('checkout.deliveryInfo')}</Title>
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
                                        <Text>{paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}</Text>
                                    </div>
                                </div>

                                <Divider />

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
                                dataSource={items.map(item => ({ ...item, key: `${item.type}-${item.id}` }))}
                                pagination={false}
                                size="small"
                                className="summary-table"
                                scroll={{ y: items.length > 5 ? 200 : undefined }}
                            />

                            <Divider />

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
                                <Divider />
                                <div className="summary-row total-row">
                                    <Title level={4}>{t('checkout.total')}:</Title>
                                    <Title level={4} className="total-price">{formatPrice(getTotalWithShipping())}</Title>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Bank Transfer Confirmation Modal */}
                <BankTransferConfirmModal
                    visible={bankTransferModalVisible}
                    onClose={() => setBankTransferModalVisible(false)}
                    onConfirm={handleBankTransferConfirm}
                    orderTotal={getTotalWithShipping()}
                    orderId={orderId}
                />
            </div>
        </div>
    )
}

export default Checkout
