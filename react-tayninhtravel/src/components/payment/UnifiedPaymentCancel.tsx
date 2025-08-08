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
    Space
} from 'antd';
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
    handleTourBookingPaymentCancel,
    lookupProductOrderByPayOsOrderCode,
    lookupTourBookingByPayOsOrderCode,
    formatCurrency,
    ProductOrderInfo,
    BookingPaymentInfo
} from '../../services/paymentService';
import { useAuthStore } from '../../store/useAuthStore';

const { Text } = Typography;

type PaymentType = 'product' | 'tour';
type PaymentInfo = ProductOrderInfo | BookingPaymentInfo;

interface PaymentTypeDetection {
    type: PaymentType;
    info: PaymentInfo;
}

const UnifiedPaymentCancel: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentData, setPaymentData] = useState<PaymentTypeDetection | null>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

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
        } catch (error) {
            console.log('Not a product order either');
        }

        // Fallback: Try to find in PaymentTransaction and get the actual Order/TourBooking
        try {
            console.log('Trying PaymentTransaction fallback lookup...');
            const enhancedResponse = await fetch(`${import.meta.env.VITE_API_URL}/enhanced-payments/transaction/order-code/${normalizedOrderCode}`);
            if (enhancedResponse.ok) {
                const enhancedData = await enhancedResponse.json();
                if (enhancedData.success && enhancedData.data) {
                    console.log('Found in PaymentTransaction:', enhancedData.data);

                    // Determine type based on transaction data
                    if (enhancedData.data.tourBookingInfo) {
                        return {
                            type: 'tour',
                            info: enhancedData.data.tourBookingInfo
                        };
                    } else if (enhancedData.data.orderInfo) {
                        return {
                            type: 'product',
                            info: enhancedData.data.orderInfo
                        };
                    }
                }
            }
        } catch (error) {
            console.log('PaymentTransaction fallback also failed:', error);
        }

        throw new Error('Unable to determine payment type from order code');
    };

    // Process payment cancellation based on type
    const processPaymentCancel = async (type: PaymentType, callbackRequest: any) => {
        if (type === 'tour') {
            return await handleTourBookingPaymentCancel(callbackRequest);
        } else {
            return await handleProductPaymentCancel(callbackRequest);
        }
    };

    useEffect(() => {
        const handlePaymentCancel = async () => {
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

                // Process payment cancel callback
                setProcessing(true);
                const callbackRequest = createPayOsCallbackRequest({
                    ...params,
                    status: 'CANCELLED'
                });
                const response = await processPaymentCancel(detection.type, callbackRequest);

                if (!response.success) {
                    setError(response.message || 'Có lỗi xảy ra khi xử lý hủy thanh toán');
                }

            } catch (error: any) {
                console.error('Payment cancel processing error:', error);
                setError(error.message || 'Có lỗi xảy ra khi xử lý hủy thanh toán');
            } finally {
                setLoading(false);
                setProcessing(false);
            }
        };

        handlePaymentCancel();
    }, [location]);

    // Navigation handlers
    const handleGoHome = () => {
        navigate('/');
    };

    const handleViewHistory = () => {
        if (paymentData?.type === 'tour') {
            if (isAuthenticated) {
                navigate('/profile', { state: { activeTab: 'booking-history' } });
            } else {
                navigate('/login', { state: { from: '/profile' } });
            }
        } else {
            navigate('/profile', { state: { activeTab: 'order-history' } });
        }
    };

    const handleContinueShopping = () => {
        if (paymentData?.type === 'tour') {
            navigate('/things-to-do');
        } else {
            navigate('/shop');
        }
    };

    const handleRetryPayment = () => {
        if (paymentData?.type === 'tour') {
            // Navigate back to booking page or tour details
            navigate('/things-to-do');
        } else {
            // Navigate back to cart
            navigate('/cart');
        }
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
                <Text>Đang xử lý hủy thanh toán...</Text>
                {processing && (
                    <Text type="secondary">
                        Đang cập nhật trạng thái...
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
                    title="Lỗi xử lý hủy thanh toán"
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
                status="error"
                icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                title="Thanh toán đã bị hủy"
                subTitle={`Bạn đã hủy thanh toán cho ${isProductPayment ? 'đơn hàng' : 'booking tour'}. ${isProductPayment ? 'Đơn hàng' : 'Booking'} vẫn được lưu và bạn có thể thanh toán lại sau.`}
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
                                <Text strong style={{ fontSize: '16px' }}>
                                    {formatCurrency((info as ProductOrderInfo).totalAmount || (info as ProductOrderInfo).totalAfterDiscount)}
                                </Text>
                            </Descriptions.Item>
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
                                <Text strong style={{ fontSize: '16px' }}>
                                    {formatCurrency((info as BookingPaymentInfo).totalPrice)}
                                </Text>
                            </Descriptions.Item>
                        </>
                    )}
                </Descriptions>
            </Card>

            <Alert
                message="Thông báo"
                description={`${isProductPayment ? 'Đơn hàng' : 'Booking'} của bạn vẫn được lưu trong hệ thống. Bạn có thể thanh toán lại bất cứ lúc nào.`}
                type="info"
                showIcon
                style={{ marginTop: 24 }}
            />

            <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Space size="large" direction="vertical">
                    <Space size="middle">
                        <Button type="primary" size="large" onClick={handleRetryPayment}>
                            <ReloadOutlined /> Thanh toán lại
                        </Button>

                        <Button size="large" onClick={handleViewHistory}>
                            <HistoryOutlined />
                            {isProductPayment ? 'Xem đơn hàng' : 'Xem booking'}
                        </Button>
                    </Space>

                    <Space size="middle">
                        <Button size="large" onClick={handleContinueShopping}>
                            <ShoppingCartOutlined />
                            {isProductPayment ? 'Tiếp tục mua sắm' : 'Khám phá tour khác'}
                        </Button>

                        {isProductPayment && (
                            <Button size="large" onClick={handleViewCart}>
                                <ShoppingCartOutlined /> Xem giỏ hàng
                            </Button>
                        )}

                        <Button size="large" onClick={handleGoHome}>
                            <HomeOutlined /> Về trang chủ
                        </Button>
                    </Space>
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

export default UnifiedPaymentCancel;
