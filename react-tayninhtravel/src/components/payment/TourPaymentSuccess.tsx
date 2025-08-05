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
    HistoryOutlined,
    PrinterOutlined
} from '@ant-design/icons';

import {
    parsePayOsCallbackParams,
    createPayOsCallbackRequest,
    handleTourBookingPaymentSuccess,
    lookupTourBookingByPayOsOrderCode,
    formatCurrency,
    BookingPaymentInfo
} from '../../services/paymentService';
import { EnhancedPaymentService } from '../../services/enhancedPaymentService';
import { useAuthStore } from '../../store/useAuthStore';
import { retryPaymentCallback, getPaymentErrorMessage } from '../../utils/retryUtils';

const { Text } = Typography;

const TourPaymentSuccess: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [bookingInfo, setBookingInfo] = useState<BookingPaymentInfo | null>(null);
    const [useEnhancedPayment, setUseEnhancedPayment] = useState(true); // Try Enhanced first

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
                        console.log('Trying Enhanced Payment System for tour booking...');
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
                                console.log('Enhanced tour payment processing successful');
                                setBookingInfo(transactionResponse.data.tourBookingInfo);

                                // ALWAYS call legacy handleTourBookingPaymentSuccess for business logic
                                console.log('Calling legacy handleTourBookingPaymentSuccess for business logic...');
                                const callbackRequest = createPayOsCallbackRequest({
                                    ...params,
                                    status: 'PAID'
                                });
                                await handleTourBookingPaymentSuccess(callbackRequest);

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
                console.log('Using Legacy Payment System for tour booking...');

                // Lookup booking information first
                try {
                    const lookupResponse = await lookupTourBookingByPayOsOrderCode(orderCode);
                    if (lookupResponse.success && lookupResponse.data) {
                        setBookingInfo(lookupResponse.data);
                    }
                } catch (lookupError) {
                    console.warn('Could not lookup booking info:', lookupError);
                    // Continue with payment processing even if lookup fails
                }

                // Process payment success callback with retry logic
                setProcessing(true);
                const callbackRequest = createPayOsCallbackRequest(params);

                const result = await retryPaymentCallback(
                    () => handleTourBookingPaymentSuccess(callbackRequest),
                    {
                        maxRetries: maxRetries,
                        delay: retryDelay,
                        timeout: 10000
                    }
                );

                if (result.success) {
                    // Payment callback was processed successfully
                    // Booking info should already be set from lookup above
                } else {
                    setError(result.error?.message || 'Có lỗi xảy ra khi xử lý thanh toán');
                }

            } catch (error: any) {
                console.error('Tour payment success processing error:', error);
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

    const handleViewBookings = () => {
        if (isAuthenticated) {
            navigate('/booking-history');
        } else {
            navigate('/login', { state: { from: '/booking-history' } });
        }
    };

    const handlePrintBooking = () => {
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
                        <Button key="bookings" onClick={handleViewBookings}>
                            <HistoryOutlined /> Xem lịch sử đặt tour
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
                subTitle="Cảm ơn bạn đã đặt tour. Chúng tôi sẽ liên hệ với bạn sớm nhất có thể."
                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />

            {bookingInfo && (
                <Card
                    title="Thông tin đặt tour"
                    style={{ marginTop: 24 }}
                    extra={
                        <Button
                            type="link"
                            icon={<PrinterOutlined />}
                            onClick={handlePrintBooking}
                        >
                            In vé tour
                        </Button>
                    }
                >
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Mã đặt tour">
                            <Text strong>{bookingInfo.bookingCode}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Tên tour">
                            <Text strong>{bookingInfo.tourTitle}</Text>
                        </Descriptions.Item>

                        {bookingInfo.tourStartDate && (
                            <Descriptions.Item label="Ngày khởi hành">
                                <Text>{new Date(bookingInfo.tourStartDate).toLocaleDateString('vi-VN')}</Text>
                            </Descriptions.Item>
                        )}

                        <Descriptions.Item label="Tổng tiền">
                            <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                                {formatCurrency(bookingInfo.totalPrice)}
                            </Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Trạng thái">
                            <Tag color="success">Đã thanh toán</Tag>
                        </Descriptions.Item>

                        {bookingInfo.customerName && (
                            <Descriptions.Item label="Tên khách hàng">
                                <Text>{bookingInfo.customerName}</Text>
                            </Descriptions.Item>
                        )}

                        {bookingInfo.customerPhone && (
                            <Descriptions.Item label="Số điện thoại">
                                <Text>{bookingInfo.customerPhone}</Text>
                            </Descriptions.Item>
                        )}

                        {bookingInfo.customerEmail && (
                            <Descriptions.Item label="Email">
                                <Text>{bookingInfo.customerEmail}</Text>
                            </Descriptions.Item>
                        )}
                    </Descriptions>

                    <Divider />

                    <Alert
                        message="Lưu ý quan trọng"
                        description={
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                <li>Vui lòng lưu lại mã đặt tour để tra cứu sau này</li>
                                <li>Chúng tôi sẽ gửi email xác nhận trong vòng 24 giờ</li>
                                <li>Vui lòng có mặt tại điểm tập trung trước 15 phút</li>
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
                    <Button type="primary" size="large" onClick={handleGoHome}>
                        <HomeOutlined /> Về trang chủ
                    </Button>

                    <Button size="large" onClick={handleViewBookings}>
                        <HistoryOutlined /> Xem lịch sử đặt tour
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

export default TourPaymentSuccess;
