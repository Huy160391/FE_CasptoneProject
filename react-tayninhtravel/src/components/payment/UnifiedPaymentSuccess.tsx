import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
    Result,
    Button,
    Card,
    Descriptions,
    Spin,
    Typography,
    Space,
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
    handleTourBookingPaymentSuccess,
    lookupProductOrderByPayOsOrderCode,
    lookupTourBookingByPayOsOrderCode,
    formatCurrency,
    ProductOrderInfo,
    BookingPaymentInfo
} from '../../services/paymentService';
import { EnhancedPaymentService } from '../../services/enhancedPaymentService';
import { useAuthStore } from '../../store/useAuthStore';
import { getPaymentErrorMessage } from '../../utils/retryUtils';
import { useCart } from '../../hooks/useCart';

const { Text } = Typography;

type PaymentType = 'product' | 'tour';
type PaymentInfo = ProductOrderInfo | BookingPaymentInfo;

interface PaymentTypeDetection {
    type: PaymentType;
    info: PaymentInfo;
}

const UnifiedPaymentSuccess: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentData, setPaymentData] = useState<PaymentTypeDetection | null>(null);
    const [useEnhancedPayment, setUseEnhancedPayment] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const { clearCart } = useCart();

    // Retry configuration
    const maxRetries = 3;

    // Normalize order code to TNDT format if needed
    const normalizeOrderCode = (orderCode: string): string => {
        // If already has TNDT prefix, return as is
        if (orderCode.startsWith('TNDT')) {
            return orderCode;
        }

        // If numeric only, add TNDT prefix
        if (/^\d+$/.test(orderCode)) {
            return `TNDT${orderCode}`;
        }

        // Return as is for other formats
        return orderCode;
    };

    // Detect payment type and get payment info
    const detectPaymentType = async (payOsOrderCode: string): Promise<PaymentTypeDetection> => {
        // Normalize order code to TNDT format
        const normalizedOrderCode = normalizeOrderCode(payOsOrderCode);
        console.log(`Original order code: ${payOsOrderCode}, Normalized: ${normalizedOrderCode}`);

        try {
            // Try tour booking first
            const tourResponse = await lookupTourBookingByPayOsOrderCode(normalizedOrderCode);
            if (tourResponse.success && tourResponse.data) {
                return {
                    type: 'tour',
                    info: tourResponse.data
                };
            }
            console.log('it is a tour booking');
        } catch (error) {
            console.log('Not a tour booking, trying product order...');
        }

        try {
            // Try product order
            const productResponse = await lookupProductOrderByPayOsOrderCode(normalizedOrderCode);
            if (productResponse.success && productResponse.data) {
                return {
                    type: 'product',
                    info: productResponse.data
                };
            }
            console.log('it is a product order');
        } catch (error) {
            console.log('Not a product order either');
        }

        throw new Error('Unable to determine payment type from order code');
    };

    // Process payment success based on type
    const processPaymentSuccess = async (type: PaymentType, callbackRequest: any) => {
        if (type === 'tour') {
            return await handleTourBookingPaymentSuccess(callbackRequest);
        } else {
            return await handleProductPaymentSuccess(callbackRequest);
        }
    };

    useEffect(() => {
        const handlePaymentSuccess = async () => {
            try {
                setLoading(true);
                setError(null);

                // Parse URL parameters
                const currentUrl = window.location.href;
                const params = parsePayOsCallbackParams(currentUrl);

                if (!params.orderCode) {
                    throw new Error('Không tìm thấy mã đơn hàng trong URL');
                }

                // Detect payment type and get info
                const detection = await detectPaymentType(params.orderCode);
                setPaymentData(detection);

                // Process payment success callback
                setProcessing(true);
                const callbackRequest = createPayOsCallbackRequest({
                    ...params,
                    status: 'PAID'
                });

                let response;
                if (useEnhancedPayment) {
                    try {
                        // Try Enhanced Payment first
                        const enhancedService = new EnhancedPaymentService();
                        response = await enhancedService.processWebhookCallback({
                            orderCode: callbackRequest.orderCode || '',
                            status: callbackRequest.status || 'PAID'
                        });

                        // ALWAYS call legacy payment functions for business logic
                        if (response.success) {
                            console.log('Enhanced payment successful, calling legacy functions for business logic...');
                            await processPaymentSuccess(detection.type, callbackRequest);
                        }
                    } catch (enhancedError) {
                        console.log('Enhanced payment failed, falling back to legacy:', enhancedError);
                        setUseEnhancedPayment(false);
                        response = await processPaymentSuccess(detection.type, callbackRequest);
                    }
                } else {
                    response = await processPaymentSuccess(detection.type, callbackRequest);
                }

                if (response.success) {
                    clearCart(); // Chỉ clear cart khi thanh toán thành công
                } else {
                    setError(response.message || 'Có lỗi xảy ra khi xử lý thanh toán');
                }

            } catch (error: any) {
                console.error('Payment success processing error:', error);
                const errorMessage = getPaymentErrorMessage(error, maxRetries);
                setError(errorMessage);
            } finally {
                setLoading(false);
                setProcessing(false);
            }
        };

        handlePaymentSuccess();
    }, [location]);

    // Navigation handlers
    const handleGoHome = () => {
        navigate('/');
    };

    const handleViewHistory = () => {
        if (paymentData?.type === 'tour') {
            if (isAuthenticated) {
                navigate('/booking-history');
            } else {
                navigate('/login', { state: { from: '/booking-history' } });
            }
        } else {
            navigate('/orders');
        }
    };

    const handleContinueShopping = () => {
        if (paymentData?.type === 'tour') {
            navigate('/tours');
        } else {
            navigate('/shop');
        }
    };

    const handlePrint = () => {
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
            <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
                <Result
                    status="error"
                    title="Lỗi xử lý thanh toán"
                    subTitle={error}
                    extra={[
                        <Button type="primary" key="home" onClick={handleGoHome}>
                            <HomeOutlined /> Về trang chủ
                        </Button>,
                        <Button key="retry" onClick={() => window.location.reload()}>
                            Thử lại
                        </Button>
                    ]}
                />
            </div>
        );
    }

    if (!paymentData) {
        return (
            <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
                <Result
                    status="warning"
                    title="Không tìm thấy thông tin thanh toán"
                    extra={[
                        <Button type="primary" key="home" onClick={handleGoHome}>
                            <HomeOutlined /> Về trang chủ
                        </Button>
                    ]}
                />
            </div>
        );
    }

    const { type, info } = paymentData;
    const isProductPayment = type === 'product';

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <Result
                status="success"
                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                title="Thanh toán thành công!"
                subTitle={`${isProductPayment ? 'Đơn hàng' : 'Booking tour'} của bạn đã được xác nhận và đang được xử lý.`}
            />

            <Card style={{ marginTop: 24 }}>
                <Descriptions
                    title={`Thông tin ${isProductPayment ? 'đơn hàng' : 'booking'}`}
                    bordered
                    column={1}
                    size="small"
                >
                    {isProductPayment ? (
                        <>
                            <Descriptions.Item label="Mã đơn hàng">
                                <Text strong>{(info as ProductOrderInfo).payOsOrderCode}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="ID đơn hàng">
                                <Text code>{(info as ProductOrderInfo).id}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền">
                                <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                                    {formatCurrency((info as ProductOrderInfo).totalAmount || (info as ProductOrderInfo).totalAfterDiscount)}
                                </Text>
                            </Descriptions.Item>
                            {(info as ProductOrderInfo).discountAmount > 0 && (
                                <Descriptions.Item label="Giảm giá">
                                    <Text style={{ color: '#ff4d4f' }}>
                                        -{formatCurrency((info as ProductOrderInfo).discountAmount)}
                                    </Text>
                                </Descriptions.Item>
                            )}
                        </>
                    ) : (
                        <>
                            <Descriptions.Item label="Mã booking">
                                <Text strong>{(info as BookingPaymentInfo).bookingCode}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Mã PayOS">
                                <Text code>{(info as BookingPaymentInfo).payOsOrderCode}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền">
                                <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                                    {formatCurrency((info as BookingPaymentInfo).totalPrice)}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color="success">{(info as BookingPaymentInfo).status}</Tag>
                            </Descriptions.Item>
                        </>
                    )}
                </Descriptions>
            </Card>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Space size="large">
                    <Button type="primary" size="large" onClick={handleViewHistory}>
                        <HistoryOutlined />
                        {isProductPayment ? 'Xem đơn hàng của tôi' : 'Xem booking của tôi'}
                    </Button>

                    <Button size="large" onClick={handleContinueShopping}>
                        <ShoppingCartOutlined />
                        {isProductPayment ? 'Tiếp tục mua sắm' : 'Khám phá thêm tour'}
                    </Button>

                    <Button size="large" onClick={handleGoHome}>
                        <HomeOutlined /> Về trang chủ
                    </Button>

                    <Button size="large" onClick={handlePrint}>
                        <PrinterOutlined /> In
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

export default UnifiedPaymentSuccess;
