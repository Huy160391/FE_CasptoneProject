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
import {
    CloseCircleOutlined,
    HomeOutlined,
    HistoryOutlined,
    ReloadOutlined,
    ShoppingCartOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
    parsePayOsCallbackParams,
    createPayOsCallbackRequest,
    handleTourBookingPaymentCancel,
    lookupTourBookingByPayOsOrderCode,
    formatCurrency,
    BookingPaymentInfo
} from '../services/paymentService';
import { useAuthStore } from '../store/useAuthStore';

const { Title, Text } = Typography;

const PaymentCancel: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [bookingInfo, setBookingInfo] = useState<BookingPaymentInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cancelProcessed, setCancelProcessed] = useState(false);

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

                // Process payment cancel callback
                setProcessing(true);
                const callbackRequest = createPayOsCallbackRequest({
                    ...params,
                    status: 'CANCELLED'
                });
                const response = await handleTourBookingPaymentCancel(callbackRequest);

                if (response.success) {
                    setCancelProcessed(true);

                    // If we don't have booking info from lookup, try to get it from response
                    if (!bookingInfo && response.data) {
                        setBookingInfo(response.data);
                    }
                } else {
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

        processPaymentCancel();
    }, [location]);

    const handleGoHome = () => {
        navigate('/');
    };

    const handleViewBookings = () => {
        if (isAuthenticated) {
            navigate('/profile/bookings');
        } else {
            navigate('/login');
        }
    };

    const handleRetryPayment = () => {
        if (bookingInfo?.paymentUrl) {
            window.location.href = bookingInfo.paymentUrl;
        } else {
            // Navigate back to booking page to retry
            navigate('/things-to-do');
        }
    };

    const handleBrowseTours = () => {
        navigate('/things-to-do');
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                flexDirection: 'column'
            }}>
                <Spin size="large" />
                <Text style={{ marginTop: 16 }}>
                    {processing ? 'Đang xử lý hủy thanh toán...' : 'Đang tải thông tin...'}
                </Text>
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
                        <Button key="tours" onClick={handleBrowseTours}>
                            <ShoppingCartOutlined /> Xem tour khác
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
                title="Thanh toán đã bị hủy"
                subTitle="Bạn đã hủy quá trình thanh toán. Đơn đặt tour của bạn chưa được xác nhận."
                icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            />

            {bookingInfo && (
                <Card
                    title={
                        <Space>
                            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                            <span>Thông tin đặt tour bị hủy</span>
                        </Space>
                    }
                    style={{ marginTop: 24 }}
                >
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Mã đặt tour">
                            <Text strong>{bookingInfo.bookingCode}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Tên tour">
                            <Text>{bookingInfo.tourTitle}</Text>
                        </Descriptions.Item>

                        {bookingInfo.tourStartDate && (
                            <Descriptions.Item label="Ngày khởi hành">
                                <Text>{new Date(bookingInfo.tourStartDate).toLocaleDateString('vi-VN')}</Text>
                            </Descriptions.Item>
                        )}

                        <Descriptions.Item label="Tổng tiền">
                            <Text strong style={{ color: '#f5222d', fontSize: '16px' }}>
                                {formatCurrency(bookingInfo.totalPrice)}
                            </Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Trạng thái thanh toán">
                            <Text type="danger">Đã hủy</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Mã giao dịch PayOS">
                            <Text code>{bookingInfo.payOsOrderCode}</Text>
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider />

                    <Alert
                        message="Thông tin quan trọng"
                        description={
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                <li>Đơn đặt tour của bạn chưa được xác nhận do thanh toán bị hủy</li>
                                <li>Bạn có thể thử thanh toán lại hoặc đặt tour mới</li>
                                <li>Nếu gặp vấn đề, vui lòng liên hệ hotline: 1900-xxxx</li>
                                <li>Chỗ trống có thể bị hết nếu bạn không thanh toán sớm</li>
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
                        Thử thanh toán lại
                    </Button>

                    <Button
                        size="large"
                        onClick={handleBrowseTours}
                        icon={<ShoppingCartOutlined />}
                    >
                        Xem tour khác
                    </Button>

                    <Button size="large" onClick={handleViewBookings}>
                        <HistoryOutlined /> Lịch sử đặt tour
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

export default PaymentCancel;