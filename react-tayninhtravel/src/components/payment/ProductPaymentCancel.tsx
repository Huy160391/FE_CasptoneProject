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
    Divider
} from 'antd';
import { useTranslation } from 'react-i18next';
import {
    CloseCircleOutlined,
    HomeOutlined,
    ShoppingCartOutlined,
    HistoryOutlined,
    ReloadOutlined
} from '@ant-design/icons';

import {
    parsePayOsCallbackParams,
    createPayOsCallbackRequest,
    handleProductPaymentCancel,
    lookupProductOrderByPayOsOrderCode,
    formatCurrency,
    ProductOrderInfo
} from '../../services/paymentService';

const { Text } = Typography;

const ProductPaymentCancel: React.FC = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orderInfo, setOrderInfo] = useState<ProductOrderInfo | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const processPaymentCancel = async () => {
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

                // Process payment cancel callback
                setProcessing(true);
                const callbackRequest = createPayOsCallbackRequest({
                    ...params,
                    status: 'CANCELLED'
                });
                const response = await handleProductPaymentCancel(callbackRequest);

                if (response.success) {
                    // Payment cancel callback was processed successfully
                    // Order info should already be set from lookup above
                } else {
                    setError(response.message || 'Có lỗi xảy ra khi xử lý hủy thanh toán');
                }

            } catch (error: any) {
                console.error('Product payment cancel processing error:', error);
                setError(error.message || 'Có lỗi xảy ra khi xử lý hủy thanh toán');
            } finally {
                setLoading(false);
                setProcessing(false);
            }
        };

        processPaymentCancel();
    }, [location]);

    const handleGoHome = () => {
        navigate('/');
    };

    const handleViewOrders = () => {
        navigate('/profile', { state: { activeTab: 'order-history' } });
    };

    const handleContinueShopping = () => {
        navigate('/shop');
    };

    const handleRetryPayment = () => {
        // Navigate back to cart or checkout page
        navigate('/cart');
    };

    const handleViewCart = () => {
        navigate('/cart');
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
                <Text>{t('paymentCancel.processing')}</Text>
                {processing && (
                    <Text type="secondary">
                        {t('paymentCancel.updatingOrderStatus')}
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
                    title={t('paymentCancel.errorTitle')}
                    subTitle={error}
                    extra={[
                        <Button type="primary" key="home" onClick={handleGoHome}>
                            <HomeOutlined /> {t('paymentCancel.goHome')}
                        </Button>,
                        <Button key="shop" onClick={handleContinueShopping}>
                            <ShoppingCartOutlined /> {t('paymentCancel.continueShopping')}
                        </Button>
                    ]}
                />
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
            <Result
                status="error"
                title={t('paymentCancel.cancelTitle')}
                subTitle={t('paymentCancel.cancelSubTitle')}
                icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            />

            {orderInfo && (
                <Card title={t('paymentCancel.orderInfoTitle')} style={{ marginTop: 24 }}>
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label={t('paymentCancel.payosOrderCode')}>
                            <Text strong>{orderInfo.payOsOrderCode}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label={t('paymentCancel.totalAmount')}>
                            <Text>{formatCurrency(orderInfo.totalAmount)}</Text>
                        </Descriptions.Item>

                        {orderInfo.discountAmount > 0 && (
                            <Descriptions.Item label={t('paymentCancel.discount')}>
                                <Text type="success">
                                    -{formatCurrency(orderInfo.discountAmount)}
                                </Text>
                            </Descriptions.Item>
                        )}

                        <Descriptions.Item label={t('paymentCancel.totalAfterDiscount')}>
                            <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                                {formatCurrency(orderInfo.totalAfterDiscount)}
                            </Text>
                        </Descriptions.Item>

                        <Descriptions.Item label={t('paymentCancel.status')}>
                            <Text type="danger">{t('paymentCancel.cancelled')}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label={t('paymentCancel.createdAt')}>
                            <Text>{new Date(orderInfo.createdAt).toLocaleString('vi-VN')}</Text>
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider />

                    <Alert
                        message={t('paymentCancel.importantInfoTitle')}
                        description={
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                <li>{t('paymentCancel.importantInfoOrderCancelled')}</li>
                                <li>{t('paymentCancel.importantInfoProductInCart')}</li>
                                <li>{t('paymentCancel.importantInfoCanRetry')}</li>
                                <li>{t('paymentCancel.importantInfoHotline')}</li>
                            </ul>
                        }
                        type="warning"
                        showIcon
                        style={{ marginTop: 16 }}
                    />
                </Card>
            )}

            <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Space size="large" wrap>
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleRetryPayment}
                        icon={<ReloadOutlined />}
                    >
                        {t('paymentCancel.retryPayment')}
                    </Button>

                    <Button
                        size="large"
                        onClick={handleViewCart}
                        icon={<ShoppingCartOutlined />}
                    >
                        {t('paymentCancel.viewCart')}
                    </Button>

                    <Button size="large" onClick={handleContinueShopping}>
                        <ShoppingCartOutlined /> {t('paymentCancel.continueShopping')}
                    </Button>

                    <Button size="large" onClick={handleViewOrders}>
                        <HistoryOutlined /> {t('paymentCancel.viewOrders')}
                    </Button>

                    <Button size="large" onClick={handleGoHome}>
                        <HomeOutlined /> {t('paymentCancel.goHome')}
                    </Button>
                </Space>
            </div>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Text type="secondary">
                    {t('paymentCancel.needHelp')} <Link to="/contact">{t('paymentCancel.contactUs')}</Link>
                </Text>
            </div>
        </div>
    );
};

export default ProductPaymentCancel;
