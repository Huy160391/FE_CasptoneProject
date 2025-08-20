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

const { Text } = Typography;

const ProductPaymentSuccess: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orderInfo, setOrderInfo] = useState<ProductOrderInfo | null>(null);
    const [useEnhancedPayment, setUseEnhancedPayment] = useState(true); // Try Enhanced first
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
                <Text>Đang xử lý thanh toán...</Text>
                {processing && (
                    <Text type="secondary">
                        Đang xác nhận thanh toán với hệ thống...
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
                    title="Có lỗi xảy ra"
                    subTitle={error}
                    extra={[
                        <Button type="primary" key="home" onClick={handleGoHome}>
                            <HomeOutlined /> Về trang chủ
                        </Button>,
                        <Button key="shop" onClick={handleContinueShopping}>
                            <ShoppingCartOutlined /> Tiếp tục mua sắm
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
                title="Thanh toán thành công!"
                subTitle="Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đã được xác nhận."
                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />

            {orderInfo && (
                <Card
                    title="Thông tin đơn hàng"
                    style={{ marginTop: 24 }}
                    extra={
                        <Button
                            type="link"
                            icon={<PrinterOutlined />}
                            onClick={handlePrintOrder}
                        >
                            In đơn hàng
                        </Button>
                    }
                >
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Mã đơn hàng">
                            <Text strong>{orderInfo.payOsOrderCode}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Tổng tiền gốc">
                            <Text>{formatCurrency(orderInfo.totalAmount)}</Text>
                        </Descriptions.Item>

                        {orderInfo.discountAmount > 0 && (
                            <Descriptions.Item label="Giảm giá">
                                <Text type="success">
                                    -{formatCurrency(orderInfo.discountAmount)}
                                </Text>
                            </Descriptions.Item>
                        )}

                        <Descriptions.Item label="Tổng thanh toán">
                            <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                                {formatCurrency(orderInfo.totalAfterDiscount)}
                            </Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Trạng thái">
                            <Tag color="success">Đã thanh toán</Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Thời gian đặt hàng">
                            <Text>{new Date(orderInfo.createdAt).toLocaleString('vi-VN')}</Text>
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider />

                    <Alert
                        message="Lưu ý quan trọng"
                        description={
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                <li>Vui lòng lưu lại mã đơn hàng để tra cứu sau này</li>
                                <li>Chúng tôi sẽ gửi email xác nhận trong vòng 24 giờ</li>
                                <li>Đơn hàng sẽ được xử lý và giao trong 2-3 ngày làm việc</li>
                                <li>Liên hệ hotline nếu cần hỗ trợ: 1900-xxxx</li>
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
                        <HistoryOutlined /> Xem đơn hàng của tôi
                    </Button>

                    <Button size="large" onClick={handleContinueShopping}>
                        <ShoppingCartOutlined /> Tiếp tục mua sắm
                    </Button>

                    <Button size="large" onClick={handleGoHome}>
                        <HomeOutlined /> Về trang chủ
                    </Button>
                </Space>
            </div>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Text type="secondary">
                    Cần hỗ trợ? <Link to="/contact">Liên hệ với chúng tôi</Link>
                </Text>
            </div>
        </div>
    );
};

export default ProductPaymentSuccess;
