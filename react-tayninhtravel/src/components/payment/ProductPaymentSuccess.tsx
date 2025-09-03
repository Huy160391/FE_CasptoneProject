import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
    Result,
    Button,
    Card,
    Descriptions,
    Spin,
    Alert,
    Typography,
    Space,
    Divider,
    Tag
} from 'antd';
import { useTranslation } from 'react-i18next';
import {
    CheckCircleOutlined,
    HomeOutlined,
    ShoppingCartOutlined,
    HistoryOutlined,
    PrinterOutlined
} from '@ant-design/icons';

import {
    parsePayOsCallbackParams,
    createPayOsCallbackRequest,
    handleProductPaymentSuccess,
    lookupProductOrderByPayOsOrderCode,
    formatCurrency,
    ProductOrderInfo
} from '../../services/paymentService';
import { EnhancedPaymentService } from '../../services/enhancedPaymentService';
import { retryPaymentCallback, getPaymentErrorMessage } from '../../utils/retryUtils';
import { useCartStore } from '@/store/useCartStore'
import { getCurrentCart } from '@/services/cartService';

const { Text } = Typography;

const ProductPaymentSuccess: React.FC = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orderInfo, setOrderInfo] = useState<ProductOrderInfo | null>(null);
    const [useEnhancedPayment, setUseEnhancedPayment] = useState(true); // Try Enhanced first
    const { clearCart } = useCartStore()
    const location = useLocation();
    const navigate = useNavigate();

    // Retry configuration
    const maxRetries = 3;
    const retryDelay = 2000;

    useEffect(() => {
        const processPaymentSuccess = async () => {
            try {
                setLoading(true);
                setError(null);

                // Parse URL parameters
                const currentUrl = window.location.href;
                const params = parsePayOsCallbackParams(currentUrl);

                if (!params.orderCode && !params.orderId) {
                    setError('Không tìm thấy mã đơn hàng trong URL');
                    return;
                }

                const orderCode = params.orderCode || params.orderId || '';

                // Try Enhanced Payment System first
                if (useEnhancedPayment) {
                    try {
                        console.log('Trying Enhanced Payment System...');
                        const enhancedService = new EnhancedPaymentService();

                        // Try to get transaction info from Enhanced system
                        const transactionResponse = await enhancedService.getTransactionByOrderCode(orderCode);
                        if (transactionResponse.success && transactionResponse.data) {
                            console.log('Found transaction in Enhanced system:', transactionResponse.data);
                            // Process with Enhanced system
                            const enhancedResult = await enhancedService.processWebhookCallback({
                                orderCode: orderCode,
                                status: params.status || 'PAID'
                            });

                            if (enhancedResult.success) {
                                console.log('Enhanced payment processing successful');
                                setOrderInfo(transactionResponse.data.orderInfo);

                                // ALWAYS call legacy handleProductPaymentSuccess for business logic
                                console.log('Calling legacy handleProductPaymentSuccess for business logic...');
                                const callbackRequest = createPayOsCallbackRequest(params);
                                await handleProductPaymentSuccess(callbackRequest);

                                return; // Success, exit early
                            }
                        }

                        console.log('Enhanced system not available, falling back to legacy...');
                        setUseEnhancedPayment(false);
                    } catch (enhancedError) {
                        console.warn('Enhanced payment failed, falling back to legacy:', enhancedError);
                        setUseEnhancedPayment(false);
                    }
                }

                // Fallback to Legacy Payment System
                console.log('Using Legacy Payment System...');

                // Lookup order information first
                try {
                    const lookupResponse = await lookupProductOrderByPayOsOrderCode(orderCode);
                    if (lookupResponse.success && lookupResponse.data) {
                        setOrderInfo(lookupResponse.data);
                    }
                } catch (lookupError) {
                    console.warn('Could not lookup order info:', lookupError);
                    // Continue with payment processing even if lookup fails
                }

                // Process payment success callback with retry logic
                setProcessing(true);
                const callbackRequest = createPayOsCallbackRequest(params);

                const result = await retryPaymentCallback(
                    () => handleProductPaymentSuccess(callbackRequest),
                    {
                        maxRetries: maxRetries,
                        delay: retryDelay,
                        timeout: 10000
                    }
                );

                if (result.success) {
                    // // If we don't have order info from lookup, try to get it from response
                    // if (!orderInfo && result.data?.orderData) {
                    //     setOrderInfo(result.data.orderData);
                    // }
                } else {
                    setError(result.error?.message || 'Có lỗi xảy ra khi xử lý thanh toán');
                }

            } catch (error: any) {
                console.error('Product payment success processing error:', error);
                const errorMessage = getPaymentErrorMessage(error, maxRetries);
                setError(errorMessage);
            } finally {
                setLoading(false);
                setProcessing(false);
            }
        };

        processPaymentSuccess();
    }, [location]);

    useEffect(() => {
        // Khi màn hình này hiển thị, clear giỏ hàng và get lại giỏ hàng qua API
        const token = localStorage.getItem('token');
        clearCart(); // Clear local cart state
        if (token) {
            getCurrentCart(token).then((cart) => {
                // Có thể cập nhật lại store/cart UI tại đây nếu cần
                // Ví dụ: setCartItems(cart.items)
                console.log('Cart refreshed:', cart);
            });
        }
    }, []);

    const handleGoHome = () => {
        navigate('/');
    };

    const handleViewOrders = () => {
        navigate('/orders');
    };

    const handleContinueShopping = () => {
        navigate('/shop');
    };

    const handlePrintOrder = () => {
        window.print();
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <Spin size="large" />
                <Text>{t('paymentSuccess.processing')}</Text>
                {processing && (
                    <Text type="secondary">
                        {t('paymentSuccess.confirmingWithSystem')}
                    </Text>
                )}
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
                <Result
                    status="error"
                    title={t('paymentSuccess.errorTitle')}
                    subTitle={error}
                    extra={[
                        <Button type="primary" key="home" onClick={handleGoHome}>
                            <HomeOutlined /> {t('paymentSuccess.goHome')}
                        </Button>,
                        <Button key="shop" onClick={handleContinueShopping}>
                            <ShoppingCartOutlined /> {t('paymentSuccess.continueShopping')}
                        </Button>
                    ]}
                />
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
            <Result
                status="success"
                title={t('paymentSuccess.successTitle')}
                subTitle={t('paymentSuccess.successSubTitle')}
                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />

            {orderInfo && (
                <Card
                    title={t('paymentSuccess.orderInfoTitle')}
                    style={{ marginTop: 24 }}
                    extra={
                        <Button
                            type="link"
                            icon={<PrinterOutlined />}
                            onClick={handlePrintOrder}
                        >
                            {t('paymentSuccess.printOrder')}
                        </Button>
                    }
                >
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label={t('paymentSuccess.payosOrderCode')}>
                            <Text strong>{orderInfo.payOsOrderCode}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label={t('paymentSuccess.totalAmount')}>
                            <Text>{formatCurrency(orderInfo.totalAmount)}</Text>
                        </Descriptions.Item>

                        {orderInfo.discountAmount > 0 && (
                            <Descriptions.Item label={t('paymentSuccess.discount')}>
                                <Text type="success">
                                    -{formatCurrency(orderInfo.discountAmount)}
                                </Text>
                            </Descriptions.Item>
                        )}

                        <Descriptions.Item label={t('paymentSuccess.totalAfterDiscount')}>
                            <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                                {formatCurrency(orderInfo.totalAfterDiscount)}
                            </Text>
                        </Descriptions.Item>

                        <Descriptions.Item label={t('paymentSuccess.status')}>
                            <Tag color="success">{t('paymentSuccess.paid')}</Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label={t('paymentSuccess.createdAt')}>
                            <Text>{new Date(orderInfo.createdAt).toLocaleString('vi-VN')}</Text>
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider />

                    <Alert
                        message={t('paymentSuccess.importantInfoTitle')}
                        description={
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                <li>{t('paymentSuccess.importantInfoSaveOrderCode')}</li>
                                <li>{t('paymentSuccess.importantInfoEmailConfirm')}</li>
                                <li>{t('paymentSuccess.importantInfoDeliveryTime')}</li>
                                <li>{t('paymentSuccess.importantInfoHotline')}</li>
                            </ul>
                        }
                        type="info"
                        showIcon
                        style={{ marginTop: 16 }}
                    />
                </Card>
            )}

            <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Space size="large">
                    <Button type="primary" size="large" onClick={handleViewOrders}>
                        <HistoryOutlined /> {t('paymentSuccess.viewOrders')}
                    </Button>

                    <Button size="large" onClick={handleContinueShopping}>
                        <ShoppingCartOutlined /> {t('paymentSuccess.continueShopping')}
                    </Button>

                    <Button size="large" onClick={handleGoHome}>
                        <HomeOutlined /> {t('paymentSuccess.goHome')}
                    </Button>
                </Space>
            </div>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Text type="secondary">
                    {t('paymentSuccess.needHelp')} <Link to="/contact">{t('paymentSuccess.contactUs')}</Link>
                </Text>
            </div>
        </div>
    );
};

export default ProductPaymentSuccess;
